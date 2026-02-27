import { cn } from '../../utils/utils';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';

interface MetricBoxProps {
  label: string;
  value: string | number;
  className?: string;
}

/**
 * Compact metric display: uppercase label + info badge value.
 * Use `className` to control flex growth, padding overrides, etc.
 *
 * @example
 * // Side-by-side layout (each box grows equally)
 * <div className="flex gap-3">
 *   <MetricBox className="flex-1" label="Atividades realizadas" value={10} />
 *   <MetricBox className="flex-1" label="Total de questões" value={80} />
 * </div>
 */
export const MetricBox = ({ label, value, className }: MetricBoxProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-50 bg-background',
      className
    )}
  >
    <Text
      size="2xs"
      weight="medium"
      className="text-text-600 uppercase text-center tracking-wide"
    >
      {label}
    </Text>
    <Badge size="large" action="info">
      {value}
    </Badge>
  </div>
);
