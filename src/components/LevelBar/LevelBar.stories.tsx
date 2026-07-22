import type { Story } from '@ladle/react';
import { LevelBar } from './LevelBar';

const Sample = ({
  value,
  colorClass,
  description,
  caption,
}: {
  value: number;
  colorClass: string;
  description: string;
  caption: string;
}) => (
  <div className="w-[230px] flex flex-col gap-3 rounded-xl border border-border-100 p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-600">
      Prosódia (ritmo e expressividade)
    </p>
    <p className="text-2xl font-bold text-text-950">Nível {value} de 4</p>
    <LevelBar value={value} colorClass={colorClass} />
    <p className="text-sm text-text-800">{description}</p>
    <p className="text-sm text-text-600">{caption}</p>
  </div>
);

/**
 * The three prosody levels from the design. The colour encodes the reading
 * profile, so it is supplied by the consumer.
 */
export const Default: Story = () => (
  <div className="flex flex-wrap gap-6 p-8">
    <Sample
      value={1}
      colorClass="bg-indicator-positive"
      description="O estudante não realizou a leitura ou disse letras, sílabas ou palavras que não constavam no teste."
      caption="Leitura silábica"
    />
    <Sample
      value={2}
      colorClass="bg-warning-400"
      description="Lê palavras inteiras, mas isoladas, de forma pausada e sem ritmo de frase."
      caption="Leitura palavra por palavra"
    />
    <Sample
      value={4}
      colorClass="bg-success-400"
      description="Lê frases inteiras com ritmo, entonação e expressividade adequados ao sentido do texto."
      caption="Leitura fluente e expressiva"
    />
  </div>
);

/**
 * Out-of-range values are clamped to the 0-4 scale.
 */
export const Clamping: Story = () => (
  <div className="flex w-[260px] flex-col gap-6 p-8">
    <LevelBar value={0} />
    <LevelBar value={3} colorClass="bg-success-400" />
    <LevelBar value={99} colorClass="bg-success-400" />
  </div>
);
