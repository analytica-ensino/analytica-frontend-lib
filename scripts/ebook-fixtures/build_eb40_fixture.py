"""Builds the EbookReader fixture (AE-3321) from the EB40 package.

Writes public/fixtures/ebook/eb40/{student,teacher}/ the way the upload
(AE-3318) stores a version, following backend docs/EBOOKS-FORMATO.md:

  content.html    the book's <main>, without scripts
  styles.css      every <style>, scoped to `.ebook-content`
  narration.json  the narration, page by page, in the reader's fields
                  (EbookNarrationPage; student book only)
  metadata.json   the package's metadata, as is
  img/            the images, downscaled so the fixture stays small
  audio/          only the narration of pages "caso" and "p04" (a spread with
                  audio description clips), with page times shifted to match

The input is a package in the English format of that doc. The fixture was
built from the EB40 package ("O Caso da Couve Mordida") sent by the content
team on 2026-11-16, renamed to the English format by the doc's table (section
ids and the classes the doc does not name yet unchanged). Once the upload
processes packages, rebuild it from the upload's output instead.

Usage (Python 3 with Pillow):
  python3 -I scripts/ebook-fixtures/build_eb40_fixture.py <EB40 folder> public/fixtures/ebook/eb40
"""
import json
import os
import re
import shutil
import sys

from PIL import Image

SCOPE = '.ebook-content'
KEEP_NARRATION = ['caso', 'p04']  # a spread with audio description clips
IMAGE_MAX_WIDTH = 360


def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def split_top_level(text, sep=','):
    parts, depth, cur = [], 0, ''
    for ch in text:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return parts


def scope_selector(selector):
    out = []
    for sel in split_top_level(selector):
        sel = sel.strip()
        if not sel:
            continue
        m = re.match(r'^(?:html\s+body|:root|html|body)(?![\w-])', sel)
        if m:
            out.append(SCOPE + sel[m.end():])
        else:
            out.append(f'{SCOPE} {sel}')
    return ', '.join(out)


def matching_brace(css, start):
    depth = 0
    for i in range(start, len(css)):
        if css[i] == '{':
            depth += 1
        elif css[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    raise ValueError('unbalanced css')


def scope_css(css):
    out, i = [], 0
    while i < len(css):
        brace = css.find('{', i)
        if brace < 0:
            break
        prelude = css[i:brace].strip()
        end = matching_brace(css, brace)
        body = css[brace + 1:end]
        if prelude.startswith('@'):
            name = re.match(r'@([\w-]+)', prelude).group(1)
            if name in ('media', 'supports', 'container', 'layer'):
                body = scope_css(body)
            out.append(f'{prelude} {{{body}}}')
        else:
            out.append(f'{scope_selector(prelude)} {{{body.strip()}}}')
        i = end + 1
    return '\n'.join(out) + '\n'


def cut_mp3(src, dst, t0, t1):
    """Copy the MP3 frames between t0 and t1 seconds (CBR, MPEG-1 Layer III)."""
    data = open(src, 'rb').read()
    i = 0
    if data[:3] == b'ID3':
        size = (data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]
        i = 10 + size
    frames = []
    while i + 4 <= len(data):
        if data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        header = data[i:i + 4]
        bitrate = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320][(header[2] >> 4) & 0xF] * 1000
        rate = [44100, 48000, 32000][(header[2] >> 2) & 3]
        length = 144 * bitrate // rate + ((header[2] >> 1) & 1)
        frames.append((i, length))
        i += length
    # The first frame is the Xing/Info header, not audio.
    audio = frames[1:]
    per_frame = 1152 / 44100
    chosen = [f for k, f in enumerate(audio) if t0 <= k * per_frame < t1]
    with open(dst, 'wb') as out:
        for start, length in chosen:
            out.write(data[start:start + length])


def build(package, out):
    for material in ('student', 'teacher'):
        src = next(os.path.join(package, d) for d in os.listdir(package) if d.endswith(f'-{material}'))
        dst = os.path.join(out, material)
        if os.path.isdir(dst):
            shutil.rmtree(dst)
        os.makedirs(os.path.join(dst, 'img'))
        html = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
        main = re.search(r'<main\b.*?</main>', html, re.S).group(0)
        main = re.sub(r'<script\b.*?</script>', '', main, flags=re.S)
        open(os.path.join(dst, 'content.html'), 'w', encoding='utf-8').write(main + '\n')
        css = strip_comments('\n'.join(re.findall(r'<style>(.*?)</style>', html, re.S)))
        open(os.path.join(dst, 'styles.css'), 'w', encoding='utf-8').write(scope_css(css))
        shutil.copy(os.path.join(src, 'metadata.json'), os.path.join(dst, 'metadata.json'))
        for name in sorted(os.listdir(os.path.join(src, 'img'))):
            image = Image.open(os.path.join(src, 'img', name))
            if image.width > IMAGE_MAX_WIDTH:
                image = image.resize((IMAGE_MAX_WIDTH, round(image.height * IMAGE_MAX_WIDTH / image.width)))
            image.save(os.path.join(dst, 'img', name), 'WEBP', quality=50)
        found = re.search(r'window\.NARRATION\s*=\s*(\{.*?\});?\s*</script>', html, re.S)
        if not found:
            continue
        narration = json.loads(found.group(1))
        pages = [p for p in narration.values() if p['section'] in KEEP_NARRATION]
        t0, t1 = pages[0]['start'], pages[-1]['end']
        os.makedirs(os.path.join(dst, 'audio'))
        cut_mp3(os.path.join(src, 'audio', 'narration.mp3'), os.path.join(dst, 'audio', 'narration.mp3'), t0, t1)
        # The upload hands the package's map over in the reader's fields
        # (EbookNarrationPage), as a list.
        kept = [
            {
                'section': page['section'],
                'file': page['file'],
                'start': round(page['start'] - t0, 2),
                'end': round(page['end'] - t0, 2),
                'clips': [
                    {
                        'id': segment['segment'],
                        'start': segment['start'],
                        'end': segment['end'],
                        **({'audioDescription': True} if segment.get('ad') else {}),
                    }
                    for segment in page['segments']
                ],
            }
            for page in pages
        ]
        open(os.path.join(dst, 'narration.json'), 'w', encoding='utf-8').write(
            json.dumps(kept, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
