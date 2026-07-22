import type { Story } from '@ladle/react';
import {
  MicIconPapole,
  MicOffIconPapole,
  StopIconPapole,
  PlayIconPapole,
  PauseIconPapole,
} from '.';

const items = [
  { name: 'MicIconPapole', Icon: MicIconPapole, dark: true },
  { name: 'MicOffIconPapole', Icon: MicOffIconPapole, dark: true },
  { name: 'StopIconPapole', Icon: StopIconPapole, dark: true },
  { name: 'PlayIconPapole', Icon: PlayIconPapole, dark: false },
  { name: 'PauseIconPapole', Icon: PauseIconPapole, dark: false },
] as const;

export const AllPapoleIcons: Story = () => (
  <div data-theme="papole-light" className="flex flex-col gap-6 p-8">
    <p className="text-sm text-text-700">
      Ícones do tema Papolê. Marrom (mic/stop) sobre fundo dourado; dourado
      (play/pause) sobre fundo verde.
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
          <PlayIconPapole size={size} />
          <span className="text-xs text-primary-100">{size}px</span>
        </div>
      ))}
    </div>
  </div>
);
