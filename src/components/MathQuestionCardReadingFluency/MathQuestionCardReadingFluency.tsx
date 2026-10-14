import { forwardRef, useId, type HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';
import { SelectionButtonReadingFluency } from '../SelectionButtonReadingFluency/SelectionButtonReadingFluency';

export interface MathQuestionCardReadingFluencyAlternative {
  id: string;
  /** Rótulo da alternativa (ex.: "16"). Pode faltar quando ela é só imagem. */
  text?: string | null;
  /** Imagem da alternativa (ex.: o bolo com 3 velinhas). */
  imageUrl?: string | null;
}

export interface MathQuestionCardReadingFluencyProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  /** Enunciado da questão (renderizado em MAIÚSCULAS). */
  statement: string;
  /** Ilustração da conta (biblioteca ou upload do professor). */
  imageUrl?: string | null;
  /** Texto alternativo da ilustração. */
  imageAlt?: string;
  /** Alternativas na ordem de exibição (a arte tem 2 ou 3). */
  alternatives: readonly MathQuestionCardReadingFluencyAlternative[];
  /** Alternativa escolhida; `null`/ausente = nenhuma ainda. */
  selectedId?: string | null;
  /** Chamado com o id da alternativa tocada. */
  onSelect: (alternativeId: string) => void;
}

/**
 * Card de uma questão do modo CONTAR do Papolê (o "content-card" da arte):
 * enunciado, a ilustração da conta e as alternativas lado a lado.
 *
 * Medidas da arte (web): 634px de largura, padding 24, cantos 24, gap 12 entre
 * enunciado/ilustração/alternativas, faixa da ilustração com 134px de altura e
 * gap 8 entre as alternativas. Fundo `background-100` com a mesma sombra do card
 * de leitura. O enunciado é "Bold/Upper/Bold 24" no desktop e encolhe em telas
 * estreitas para não empurrar as alternativas para fora da tela.
 *
 * As alternativas formam um `radiogroup` nomeado pelo enunciado. O card não
 * guarda estado: quem controla a escolha é `selectedId`/`onSelect`.
 */
export const MathQuestionCardReadingFluency = forwardRef<
  HTMLDivElement,
  MathQuestionCardReadingFluencyProps
>(
  (
    {
      statement,
      imageUrl,
      imageAlt = '',
      alternatives,
      selectedId,
      onSelect,
      className,
      ...props
    },
    ref
  ) => {
    const statementId = useId();

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full max-w-[634px] flex-col gap-3 rounded-3xl bg-background-100 p-4 font-quicksand sm:p-6',
          'shadow-[0px_16px_32px_-4px_#0c0c0d1a,0px_4px_4px_-4px_#0c0c0d0d]',
          className
        )}
        {...props}
      >
        <p
          id={statementId}
          className="text-lg font-bold uppercase leading-none text-background-900 sm:text-2xl"
        >
          {statement}
        </p>

        {imageUrl && (
          <div className="flex h-[134px] w-full items-center justify-center">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain"
            />
          </div>
        )}

        <div
          role="radiogroup"
          aria-labelledby={statementId}
          className="flex w-full gap-2"
        >
          {alternatives.map((alternative, index) => {
            const selected = alternative.id === selectedId;
            return (
              <SelectionButtonReadingFluency
                key={alternative.id}
                role="radio"
                aria-checked={selected}
                selected={selected}
                imageSrc={alternative.imageUrl}
                // Alternativa só de imagem: o alt é o que dá nome ao botão.
                imageAlt={alternative.text ? '' : `Alternativa ${index + 1}`}
                onClick={() => onSelect(alternative.id)}
                className="min-w-0 flex-1"
              >
                {alternative.text || undefined}
              </SelectionButtonReadingFluency>
            );
          })}
        </div>
      </div>
    );
  }
);
MathQuestionCardReadingFluency.displayName = 'MathQuestionCardReadingFluency';
