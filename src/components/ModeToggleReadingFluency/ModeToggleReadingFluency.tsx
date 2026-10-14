import {
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/utils';

export interface ModeToggleReadingFluencyOption<T extends string = string> {
  /** Valor do modo (ex.: `'ler'`, `'contar'`). */
  value: T;
  /** Rótulo exibido sob/ao lado do ícone (renderizado em MAIÚSCULAS). */
  label: string;
  /** Ícone do modo (32×32 na arte), ex.: `BookIconReadingFluency`. */
  icon: ReactNode;
}

export interface ModeToggleReadingFluencyProps<
  T extends string = string,
> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Modos disponíveis, na ordem em que aparecem. */
  options: readonly ModeToggleReadingFluencyOption<T>[];
  /** Modo selecionado. */
  value: T;
  /** Chamado com o modo escolhido (clique ou setas do teclado). */
  onChange: (value: T) => void;
  /**
   * Disposição da arte:
   * - `inline` (default): ícone ao lado do rótulo — o "MenuWeb" do header web.
   * - `stacked`: ícone sobre o rótulo, botões 57×57 — o "Bottombar" que flutua
   *   no rodapé do tablet/celular.
   */
  layout?: 'inline' | 'stacked';
}

/**
 * Pílula verde (`secondary-500`) com a sombra ambiente da arte. A `stacked`
 * ganha largura fixa (214px), mais respiro embaixo e a aresta "3D" interna
 * (`#38A65C`) do "Bottombar".
 */
const CONTAINER_CLASSES = {
  inline:
    'inline-flex items-center rounded-full bg-secondary-500 p-1 [box-shadow:0px_0px_10px_0px_#2626261a]',
  stacked:
    'inline-flex w-[214px] items-center justify-center gap-4 rounded-[43px] bg-secondary-500 px-2 pt-2 pb-3 [box-shadow:0px_0px_10px_0px_#2626261a,inset_0px_-4px_0px_0px_#38A65C]',
} as const;

/** Dimensões de cada botão ("MenuButton" da arte) por disposição. */
const BUTTON_LAYOUT_CLASSES = {
  inline: 'h-10 flex-row gap-1 rounded-[27px] py-1 pl-2 pr-3',
  stacked: 'size-[57px] flex-col gap-0.5 rounded-2xl p-1',
} as const;

/**
 * Selecionado: `secondary-400` com rótulo `secondary-700`. Os demais ficam na
 * cor da pílula com rótulo `secondary-100`. A arte não tem hover/foco; o hover
 * escurece um passo e o foco usa o anel claro dos outros botões do Papolê.
 */
const BUTTON_STATE_CLASSES = {
  selected: 'bg-secondary-400 text-secondary-700',
  default: 'bg-secondary-500 text-secondary-100 hover:bg-secondary-600',
} as const;

/**
 * Seletor de modo do Papolê ("LER | CONTAR"): troca o catálogo da home do aluno
 * entre leitura e matemática.
 *
 * Semântica de grupo de rádio: só o modo selecionado entra no Tab, e as setas
 * movem a seleção (e o foco) entre os modos, como num `radiogroup` nativo.
 * Passe `aria-label` descrevendo o grupo (ex.: "Modo do Papolê").
 */
export const ModeToggleReadingFluency = <T extends string = string>({
  options,
  value,
  onChange,
  layout = 'inline',
  className,
  ...props
}: ModeToggleReadingFluencyProps<T>) => {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }[event.key];
    if (step == null) return;

    event.preventDefault();
    const current = options.findIndex((option) => option.value === value);
    const next = (current + step + options.length) % options.length;
    onChange(options[next].value);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      className={cn(CONTAINER_CLASSES[layout], 'font-quicksand', className)}
      {...props}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex shrink-0 cursor-pointer items-center justify-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-200',
              BUTTON_LAYOUT_CLASSES[layout],
              BUTTON_STATE_CLASSES[selected ? 'selected' : 'default']
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center [&_svg]:size-8">
              {option.icon}
            </span>
            {/* "Bold/Upper/Bold 10" da arte. A cor vem do botão. */}
            <span className="text-[10px] font-bold uppercase leading-none">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
