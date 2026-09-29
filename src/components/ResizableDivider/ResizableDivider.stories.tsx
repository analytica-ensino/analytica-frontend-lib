import type { Story } from '@ladle/react';
import type { CSSProperties } from 'react';
import ResizableDivider from './ResizableDivider';
import { useResizableColumns } from '../../hooks/useResizableColumns';

const Coluna = ({
  titulo,
  className = '',
  style,
}: {
  titulo: string;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    style={style}
    className={`flex h-full flex-col gap-2 rounded-lg bg-background-50 p-4 ${className}`}
  >
    <span className="text-sm font-bold text-text-800">{titulo}</span>
    <span className="text-xs text-text-600">
      {style?.width ? `${style.width}px` : 'ocupa o que sobra'}
    </span>
  </div>
);

/**
 * As três colunas reais das telas de criação. Arraste qualquer um dos dois
 * divisores, use as setas depois de dar Tab neles, ou dê um duplo clique para
 * voltar ao padrão. As colunas laterais só crescem: encolher devolve no máximo
 * até os 400px iniciais, e o crescimento trava quando a coluna do meio chega
 * na largura mínima.
 */
export const TresColunas: Story = () => {
  const {
    containerRef,
    filtersWidth,
    previewWidth,
    filtersDividerProps,
    previewDividerProps,
  } = useResizableColumns('activity');

  return (
    <div
      ref={containerRef}
      className="flex h-96 w-full flex-row gap-5 overflow-hidden"
    >
      <Coluna
        titulo="Filtros"
        className="flex-shrink-0"
        style={{ width: filtersWidth }}
      />
      <ResizableDivider
        label="Redimensionar filtros"
        {...filtersDividerProps}
      />
      <Coluna titulo="Banco de questões" className="min-w-0 flex-1" />
      <ResizableDivider
        label="Redimensionar prévia da atividade"
        {...previewDividerProps}
      />
      <Coluna
        titulo="Prévia da atividade"
        className="flex-shrink-0"
        style={{ width: previewWidth }}
      />
    </div>
  );
};

/**
 * Sem espaço para crescer o divisor fica inerte: sem cursor de arraste, fora da
 * ordem de tabulação e marcado com `aria-disabled`.
 */
export const Desabilitado: Story = () => (
  <div className="flex h-40 w-full flex-row gap-5">
    <Coluna titulo="Esquerda" className="flex-1" />
    <ResizableDivider
      label="Redimensionar"
      value={400}
      min={400}
      max={400}
      disabled
      isDragging={false}
      onPointerDown={() => {}}
      onPointerMove={() => {}}
      onPointerUp={() => {}}
      onKeyDown={() => {}}
      onDoubleClick={() => {}}
    />
    <Coluna titulo="Direita" className="flex-1" />
  </div>
);
