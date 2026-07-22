import type { Story } from '@ladle/react';
import { RangeGauge, type RangeGaugeZone } from './RangeGauge';

/** Reading-speed bands used by the reading-fluency results. */
const READING_SPEED_ZONES: RangeGaugeZone[] = [
  { to: 40, colorClass: 'bg-indicator-positive', label: 'Ainda decodificando' },
  { to: 65, colorClass: 'bg-warning-400', label: 'Abaixo do esperado' },
  { colorClass: 'bg-success-400', label: 'Acima do esperado' },
];

const Sample = ({ value }: { value: number }) => (
  <div className="max-w-[220px]">
    <p className="text-2xl font-semibold text-text-950">{value} palavras/min</p>
    <RangeGauge value={value} max={120} zones={READING_SPEED_ZONES} />
    <p className="text-sm text-text-600">
      {value < 40
        ? 'Ainda decodificando'
        : (value < 65 && 'Abaixo do esperado') || 'Acima do esperado'}
    </p>
  </div>
);

/**
 * The three reading-speed scenarios from the design.
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <h3 className="text-lg font-semibold text-text-950">
      Velocidade (fluidez)
    </h3>
    <div className="flex flex-wrap gap-10">
      <Sample value={12} />
      <Sample value={38} />
      <Sample value={104} />
    </div>
  </div>
);

/**
 * The pointer always sits over the band that matches the value, even though
 * the bands are drawn with equal widths and their thresholds are not evenly
 * spaced. 64 and 65 straddle the "expected" threshold.
 */
export const BandBoundaries: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <h3 className="text-lg font-semibold text-text-950">
      Limites entre faixas
    </h3>
    <div className="flex flex-wrap gap-10">
      <Sample value={39} />
      <Sample value={40} />
      <Sample value={64} />
      <Sample value={65} />
    </div>
  </div>
);

/**
 * Values outside the scale are clamped; the pointer can also be hidden while a
 * measurement is unavailable.
 */
export const EdgeCases: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div className="flex flex-wrap gap-10">
      <Sample value={0} />
      <Sample value={999} />
      <div className="max-w-[220px]">
        <p className="text-2xl font-semibold text-text-950">—</p>
        <RangeGauge
          value={0}
          max={120}
          zones={READING_SPEED_ZONES}
          showPointer={false}
        />
        <p className="text-sm text-text-600">Sem medição</p>
      </div>
    </div>
  </div>
);
