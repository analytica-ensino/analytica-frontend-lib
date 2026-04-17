import type { Story } from '@ladle/react';
import ScoreCircle from './ScoreCircle';

export const AllScoreCircles: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">ScoreCircle</h2>
      <p className="text-text-700">
        Círculo com anel de progresso exibindo um score absoluto (ex: "800") com
        "de {`{max}`}" abaixo. Use <code>variant</code> pra mudar a cor do anel.
      </p>

      <h3 className="font-bold text-2xl text-text-900">Variantes</h3>
      <div className="flex flex-wrap gap-8 items-center">
        <ScoreCircle
          value={800}
          max={1000}
          label="Nota final"
          variant="green"
        />
        <ScoreCircle value={680} max={1000} label="Parcial" variant="blue" />
        <ScoreCircle value={420} max={1000} label="Atenção" variant="warning" />
      </div>

      <h3 className="font-bold text-2xl text-text-900">Tamanhos</h3>
      <div className="flex flex-wrap gap-8 items-center">
        <ScoreCircle value={800} max={1000} size={120} />
        <ScoreCircle value={800} max={1000} size={180} />
        <ScoreCircle value={800} max={1000} size={240} />
      </div>

      <h3 className="font-bold text-2xl text-text-900">Sem label</h3>
      <ScoreCircle value={800} max={1000} />

      <h3 className="font-bold text-2xl text-text-900">Edge cases</h3>
      <div className="flex flex-wrap gap-8 items-center">
        <ScoreCircle value={0} max={1000} label="Zero" />
        <ScoreCircle value={1000} max={1000} label="Máximo" />
        <ScoreCircle value={1500} max={1000} label="Acima do máximo" />
      </div>
    </div>
  );
};

export const Default: Story = () => (
  <ScoreCircle value={800} max={1000} label="Nota final" />
);

export const Blue: Story = () => (
  <ScoreCircle value={680} max={1000} label="Nota final" variant="blue" />
);

export const Warning: Story = () => (
  <ScoreCircle value={420} max={1000} label="Nota final" variant="warning" />
);

export const Large: Story = () => (
  <ScoreCircle value={800} max={1000} label="Nota final" size={240} />
);
