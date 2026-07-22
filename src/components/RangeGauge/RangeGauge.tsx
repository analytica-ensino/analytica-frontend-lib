import { HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

/**
 * A band of the gauge (e.g. "below expected", "above expected").
 */
export interface RangeGaugeZone {
  /**
   * Exclusive upper bound of the band, in the same unit as `value`.
   * Omit on the last zone: it is open-ended and bounded by `max`.
   */
  to?: number;
  /** Tailwind background class painting the band (e.g. `bg-indicator-positive`). */
  colorClass: string;
  /** Human-readable name of the band, exposed to assistive tech. */
  label?: string;
}

export interface RangeGaugeProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Current measurement (e.g. words per minute). */
  value: number;
  /** Bands, in ascending order. Every zone but the last needs a `to`. */
  zones: RangeGaugeZone[];
  /** Start of the scale. Default `0`. */
  min?: number;
  /** End of the scale. Defaults to the last bounded zone's `to`. */
  max?: number;
  /** Hides the pointer (e.g. while the measurement is unavailable). */
  showPointer?: boolean;
  /** Extra classes for the bar track. */
  barClassName?: string;
}

/** Index of the zone `value` falls into. */
const zoneIndexOf = (value: number, zones: RangeGaugeZone[]): number => {
  const index = zones.findIndex(
    (zone) => zone.to !== undefined && value < zone.to
  );
  return index === -1 ? zones.length - 1 : index;
};

/**
 * Pointer offset, as a 0-100 percentage of the track.
 *
 * Zones are drawn with EQUAL widths (as designed), but their thresholds are
 * not evenly spaced — so a naive `value / max` would drift into the wrong
 * band (a value above the "expected" threshold could still render over the
 * orange zone). Instead the value is placed inside its own band and then
 * mapped onto that band's equal-width slot, which keeps the pointer and the
 * colour underneath it always in agreement.
 */
export const pointerPercent = (
  value: number,
  zones: RangeGaugeZone[],
  min: number,
  max: number
): number => {
  if (zones.length === 0) return 0;
  // Pin to the scale ends. Without this an overflowing value on an
  // open-ended last band (whose span is 0 when `max` is omitted) would land
  // at the band's start instead of the end of the track.
  if (value <= min) return 0;
  if (value >= max) return 100;

  const index = zoneIndexOf(value, zones);
  const lower = index === 0 ? min : (zones[index - 1].to as number);
  const upper = zones[index].to ?? max;

  const span = upper - lower;
  const ratio = span > 0 ? (value - lower) / span : 0;
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return ((index + clamped) / zones.length) * 100;
};

/**
 * Horizontal banded gauge: a track split into coloured zones with a pointer
 * marking where a measurement sits. Used by the reading-fluency results to
 * show reading speed against the expected range.
 *
 * The thresholds live in the consumer (they are pedagogical rules, not a
 * design concern) — this component only renders what it is given.
 *
 * @example
 * ```tsx
 * <RangeGauge
 *   value={38}
 *   max={120}
 *   zones={[
 *     { to: 40, colorClass: 'bg-indicator-positive', label: 'Ainda decodificando' },
 *     { to: 65, colorClass: 'bg-warning-400', label: 'Abaixo do esperado' },
 *     { colorClass: 'bg-success-400', label: 'Acima do esperado' },
 *   ]}
 * />
 * ```
 */
export const RangeGauge = ({
  value,
  zones,
  min = 0,
  max,
  showPointer = true,
  className = '',
  barClassName = '',
  ...props
}: RangeGaugeProps) => {
  const lastBounded = [...zones]
    .reverse()
    .find((zone) => zone.to !== undefined);
  const scaleMax = max ?? lastBounded?.to ?? min;
  const percent = pointerPercent(value, zones, min, scaleMax);

  return (
    // Decorative: the measurement and its band are always rendered as adjacent
    // text ("38 palavras/min" / "Abaixo do esperado"), so announcing the bar
    // too would just repeat them. Wrap it with your own label if you render it
    // without that text.
    <div
      data-component="RangeGauge"
      className={cn('flex flex-col gap-1 w-full', className)}
      aria-hidden="true"
      {...props}
    >
      {/* Pointer rail — reserves the height even when the pointer is hidden */}
      <div className="relative h-2 w-full">
        {showPointer && (
          <span
            data-testid="range-gauge-pointer"
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${percent}%` }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M6 8 0 0h12L6 8Z" className="fill-text-600" />
            </svg>
          </span>
        )}
      </div>

      <div
        className={cn(
          'flex w-full h-1.5 overflow-hidden rounded-full',
          barClassName
        )}
      >
        {zones.map((zone, index) => (
          <span
            key={zone.label ?? `${zone.colorClass}-${index}`}
            className={cn('flex-1', zone.colorClass)}
          />
        ))}
      </div>
    </div>
  );
};

export default RangeGauge;
