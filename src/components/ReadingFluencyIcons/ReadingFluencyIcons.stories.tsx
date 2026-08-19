import type { Story } from '@ladle/react';
import {
  MicIconReadingFluency,
  MicOffIconReadingFluency,
  StopIconReadingFluency,
  PlayIconReadingFluency,
  PauseIconReadingFluency,
  CloseIconReadingFluency,
} from '.';

const items = [
  { name: 'MicIconReadingFluency', Icon: MicIconReadingFluency, dark: true },
  {
    name: 'MicOffIconReadingFluency',
    Icon: MicOffIconReadingFluency,
    dark: true,
  },
  { name: 'StopIconReadingFluency', Icon: StopIconReadingFluency, dark: true },
  { name: 'PlayIconReadingFluency', Icon: PlayIconReadingFluency, dark: false },
  {
    name: 'PauseIconReadingFluency',
    Icon: PauseIconReadingFluency,
    dark: false,
  },
  {
    name: 'CloseIconReadingFluency',
    Icon: CloseIconReadingFluency,
    dark: false,
  },
] as const;

export const AllReadingFluencyIcons: Story = () => (
  <div data-theme="papole-light" className="flex flex-col gap-6 p-8">
    <p className="text-sm text-text-700">
      Ícones do tema Reading Fluency. Marrom (mic/stop) sobre fundo dourado;
      dourado (play/pause) sobre fundo verde.
    </p>

    <div className="flex flex-wrap gap-6">
      {items.map(({ name, Icon, dark }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div
            className={`flex size-20 items-center justify-center rounded-2xl ${
              dark ? 'bg-primary-500' : 'bg-secondary-500'
            }`}
          >
            <Icon />
          </div>
          <span className="text-xs text-text-700">{name}</span>
        </div>
      ))}
    </div>

    {/* Tamanhos */}
    <p className="text-sm font-bold uppercase text-text-900">Tamanhos</p>
    <div className="flex items-end gap-6 rounded-2xl bg-secondary-500 p-6">
      {[16, 24, 30, 48].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <PlayIconReadingFluency size={size} />
          <span className="text-xs text-primary-100">{size}px</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Amostra de inspeção do Play e do Stop a 100px — tamanho em que qualquer
 * artefato de path (farpa de junção, borda cortada) fica óbvio.
 *
 * Cada um aparece sobre o fundo pra que foi desenhado: Play (dourado + creme)
 * sobre o verde `secondary-500`, Stop (marrom) sobre o dourado `primary-500`.
 *
 * O `size` é o lado do box, não o da arte. Com o mesmo `size={100}` o Play
 * pinta ~90×97px e o Stop só 75×75px, porque a arte do Stop ocupa 18 dos 24u do
 * viewBox (75%) contra 26–28 de 29 (90–97%) do Play. A última linha mostra os
 * dois opticamente equiparados pra deixar a diferença explícita.
 */
export const PlayAndStopAt100: Story = () => (
  <div data-theme="papole-light" className="flex flex-col gap-8 p-8">
    <p className="text-sm text-text-700">
      Play e Stop a 100px, cada um sobre o fundo da arte.
    </p>

    <div className="flex flex-wrap gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center rounded-3xl bg-secondary-500 p-6">
          <PlayIconReadingFluency size={100} />
        </div>
        <span className="text-xs text-text-700">
          PlayIconReadingFluency · size=100 (~90×97px de tinta)
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center rounded-3xl bg-primary-500 p-6">
          <StopIconReadingFluency size={100} />
        </div>
        <span className="text-xs text-text-700">
          StopIconReadingFluency · size=100 (~75×75px de tinta)
        </span>
      </div>
    </div>

    {/* Mesmo tamanho nominal, lado a lado, pra comparar peso óptico. */}
    <p className="text-sm font-bold uppercase text-text-900">
      Lado a lado no mesmo fundo
    </p>
    <div className="flex flex-wrap items-center gap-8 rounded-3xl bg-secondary-500 p-6">
      <PlayIconReadingFluency size={100} />
      <StopIconReadingFluency size={100} />
      <span className="text-xs text-primary-100">
        size=100 nos dois — o Stop parece menor porque sobra margem no box dele
      </span>
    </div>

    {/* Compensando a margem do Stop: 100 / (18/24) ≈ 133. */}
    <p className="text-sm font-bold uppercase text-text-900">
      Equiparados opticamente
    </p>
    <div className="flex flex-wrap items-center gap-8 rounded-3xl bg-secondary-500 p-6">
      <PlayIconReadingFluency size={100} />
      <StopIconReadingFluency size={133} />
      <span className="text-xs text-primary-100">
        Play 100 · Stop 133 — agora os dois pintam ~96px
      </span>
    </div>
  </div>
);
