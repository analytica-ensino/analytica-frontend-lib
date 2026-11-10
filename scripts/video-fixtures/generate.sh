#!/usr/bin/env bash
# Generates the tiny video fixture used by the VideoPlayer e2e tests and the
# Ladle story (AE-3290):
#
#   public/fixtures/video/sample.mp4               MP4 (the fallback / download file)
#   public/fixtures/video/hls/master.m3u8          HLS master, 480p listed first
#   public/fixtures/video/hls/<rendition>/index.m3u8, init.mp4, seg_00000.m4s ...
#
# Same layout as the lesson conversion (fMP4, muxed AAC, one IDR per segment,
# <rendition>/index.m3u8), just tiny: 10 s, 2 s segments, 360p/480p/720p at a
# few dozen kbit/s, so the whole fixture stays well under 1 MB and the tests
# never depend on the network.
#
# Usage:
#   scripts/video-fixtures/generate.sh
#
# ffmpeg runs in Docker. FFMPEG_IMAGE picks the image (any image with ffmpeg 6+
# and bash); set it to an empty string to use the local ffmpeg instead:
#   FFMPEG_IMAGE=some/ffmpeg-image scripts/video-fixtures/generate.sh
#   FFMPEG_IMAGE= scripts/video-fixtures/generate.sh
set -euo pipefail

if [ "${1:-}" != "--inside" ]; then
  ROOT=$(cd "$(dirname "$0")/../.." && pwd)
  OUT="$ROOT/public/fixtures/video"
  IMAGE=${FFMPEG_IMAGE-hls01-poc:latest}
  mkdir -p "$OUT"
  if [ -n "$IMAGE" ]; then
    docker run --rm --user "$(id -u):$(id -g)" \
      -v "$ROOT/scripts/video-fixtures:/scripts:ro" -v "$OUT:/out" \
      --entrypoint bash "$IMAGE" /scripts/generate.sh --inside /out
  else
    bash "$0" --inside "$OUT"
  fi
  exit 0
fi

OUT=${2:?missing output dir}
DURATION=10
SEGMENT=2
FPS=15
AUDIO="-c:a aac -b:a 24k -ac 1 -ar 48000"
# name:width:height:video_kbps:level
RENDITIONS="360p:640:360:40:3.0 480p:854:480:60:3.0 720p:1280:720:90:3.1"

SOURCE=(
  -f lavfi -i "testsrc2=size=1280x720:rate=${FPS}:duration=${DURATION}"
  -f lavfi -i "sine=frequency=440:sample_rate=48000:duration=${DURATION}"
)
# One IDR every segment, at the same timestamps in every rendition.
KEYFRAMES=(
  -sc_threshold 0 -g "$((FPS * SEGMENT))" -keyint_min "$((FPS * SEGMENT))"
  -force_key_frames "expr:gte(t,n_forced*${SEGMENT})"
)

TMP="$OUT/hls.tmp"
rm -rf "$TMP" "$OUT/hls" "$OUT/sample.mp4"
mkdir -p "$TMP"

# ---------- HLS: all renditions in one ffmpeg run ----------
GRAPH="[0:v]split=3[s0][s1][s2]"
MAPS=()
VOPTS=()
STREAM_MAP=""
i=0
for r in $RENDITIONS; do
  IFS=: read -r name w h kbps level <<<"$r"
  GRAPH+=";[s$i]scale=${w}:${h},setsar=1,format=yuv420p[v$i]"
  MAPS+=(-map "[v$i]")
  VOPTS+=("-b:v:$i" "${kbps}k" "-maxrate:v:$i" "${kbps}k" "-bufsize:v:$i" "$((kbps * 2))k" "-level:v:$i" "$level")
  STREAM_MAP+="v:$i,a:$i,name:$name "
  mkdir -p "$TMP/$name"
  i=$((i + 1))
done
for _ in $RENDITIONS; do MAPS+=(-map 1:a:0); done

# shellcheck disable=SC2086
ffmpeg -hide_banner -nostdin -loglevel error -y "${SOURCE[@]}" \
  -filter_complex "$GRAPH" "${MAPS[@]}" \
  -c:v libx264 -preset veryfast -profile:v high "${KEYFRAMES[@]}" "${VOPTS[@]}" \
  $AUDIO \
  -f hls -hls_time "$SEGMENT" -hls_playlist_type vod -hls_list_size 0 \
  -hls_flags independent_segments -hls_segment_type fmp4 \
  -hls_fmp4_init_filename init.mp4 -hls_segment_filename "$TMP/%v/seg_%05d.m4s" \
  -var_stream_map "${STREAM_MAP% }" "$TMP/%v/index.m3u8"

# ffmpeg appends the stream index to the init file name; normalize it to init.mp4.
for r in $RENDITIONS; do
  name=${r%%:*}
  init=$(sed -n 's/^#EXT-X-MAP:URI="\([^"]*\)".*/\1/p' "$TMP/$name/index.m3u8" | head -n 1)
  if [ "$init" != init.mp4 ]; then
    mv "$TMP/$name/$init" "$TMP/$name/init.mp4"
    sed -i "s|URI=\"$init\"|URI=\"init.mp4\"|" "$TMP/$name/index.m3u8"
  fi
done

# ---------- master playlist (480p first, as the conversion writes it) ----------
codecs_for() { # <dir> -> avc1 codec string read from the avcC box
  local avcc
  avcc=$(od -An -v -tx1 "$1/init.mp4" | tr -d ' \n' | sed -n 's/.*6176634301\(......\).*/\1/p')
  echo "avc1.$(echo "$avcc" | tr 'a-f' 'A-F'),mp4a.40.2"
}
peak_bps() { # <dir> -> highest segment bit rate
  awk -v dir="$1" '
    /^#EXTINF:/ { split($0, a, ":"); d = a[2] + 0; next }
    /^#/ || NF == 0 { next }
    { cmd = "wc -c < \"" dir "/" $0 "\""; cmd | getline s; close(cmd)
      bps = s * 8 / d; if (bps > peak) peak = bps }
    END { printf "%d", peak + 0.5 }' "$1/index.m3u8"
}

{
  echo "#EXTM3U"
  echo "#EXT-X-VERSION:7"
  echo "#EXT-X-INDEPENDENT-SEGMENTS"
} > "$TMP/master.m3u8"
for name in 480p 360p 720p; do
  for r in $RENDITIONS; do
    IFS=: read -r rname w h _ _ <<<"$r"
    [ "$rname" = "$name" ] || continue
    printf '#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%dx%d,FRAME-RATE=%d.000,CODECS="%s"\n%s/index.m3u8\n' \
      "$(peak_bps "$TMP/$name")" "$w" "$h" "$FPS" "$(codecs_for "$TMP/$name")" "$name" >> "$TMP/master.m3u8"
  done
done
mv "$TMP" "$OUT/hls"

# ---------- MP4 (the fallback, same picture and length) ----------
# shellcheck disable=SC2086
ffmpeg -hide_banner -nostdin -loglevel error -y "${SOURCE[@]}" \
  -vf "scale=854:480,setsar=1,format=yuv420p" \
  -c:v libx264 -preset veryfast -profile:v high -level:v 3.0 "${KEYFRAMES[@]}" \
  -b:v 60k -maxrate 60k -bufsize 120k \
  $AUDIO -movflags +faststart "$OUT/sample.mp4"

echo "fixture written to $OUT"
