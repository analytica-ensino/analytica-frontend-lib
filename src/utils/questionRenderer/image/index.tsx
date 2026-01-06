import type { ReactNode } from 'react';
import ImageQuestion from '../../../assets/img/mock-image-question.png';
import Text from '@/components/Text/Text';
import type { QuestionRendererProps } from '../types';

/**
 * Render image question
 * Shows image with clickable area, correct answer circle, and user's answer circle
 */
export const renderQuestionImage = ({
  result,
}: Omit<QuestionRendererProps, 'question'>): ReactNode => {
  // Extract position data from result or question
  // Assuming correct position is stored in question metadata or result
  const correctPositionRelative = { x: 0.48, y: 0.45 }; // Default, should come from question data
  const correctRadiusRelative = 0.1; // Default radius

  // Get user's answer position from result
  // This would typically be stored in result.answer as coordinates
  let userPositionRelative: { x: number; y: number } | null = null;
  try {
    if (result?.answer) {
      const parsed =
        typeof result.answer === 'string'
          ? JSON.parse(result.answer)
          : result.answer;
      if (
        parsed &&
        typeof parsed.x === 'number' &&
        typeof parsed.y === 'number'
      ) {
        userPositionRelative = { x: parsed.x, y: parsed.y };
      }
    }
  } catch {
    userPositionRelative = null;
  }

  // Determine if answer is correct (within radius)
  const isCorrect = userPositionRelative
    ? Math.sqrt(
        Math.pow(userPositionRelative.x - correctPositionRelative.x, 2) +
          Math.pow(userPositionRelative.y - correctPositionRelative.y, 2)
      ) <= correctRadiusRelative
    : false;

  const getUserCircleColorClasses = () => {
    if (!userPositionRelative) return '';
    return isCorrect
      ? 'bg-success-600/70 border-white'
      : 'bg-indicator-error/70 border-white';
  };

  // Calculate position descriptions for accessibility
  const getPositionDescription = (x: number, y: number): string => {
    const xPercent = Math.round(x * 100);
    const yPercent = Math.round(y * 100);
    return `${xPercent}% da esquerda, ${yPercent}% do topo`;
  };

  const getSpatialRelationship = (): string => {
    if (!userPositionRelative) {
      return `Área correta localizada em ${getPositionDescription(
        correctPositionRelative.x,
        correctPositionRelative.y
      )}. Nenhuma resposta do aluno fornecida.`;
    }

    const deltaX = userPositionRelative.x - correctPositionRelative.x;
    const deltaY = userPositionRelative.y - correctPositionRelative.y;
    const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    const distancePercent = Math.round(distance * 100);

    let direction = '';
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'à direita' : 'à esquerda';
    } else {
      direction = deltaY > 0 ? 'abaixo' : 'acima';
    }

    const correctPos = getPositionDescription(
      correctPositionRelative.x,
      correctPositionRelative.y
    );
    const userPos = getPositionDescription(
      userPositionRelative.x,
      userPositionRelative.y
    );

    return `Área correta localizada em ${correctPos}. Resposta do aluno em ${userPos}. A resposta do aluno está ${distancePercent}% de distância ${direction} da área correta. ${isCorrect ? 'A resposta está dentro da área de tolerância e é considerada correta.' : 'A resposta está fora da área de tolerância e é considerada incorreta.'}`;
  };

  const correctPositionDescription = getPositionDescription(
    correctPositionRelative.x,
    correctPositionRelative.y
  );
  const imageAltText = `Questão de imagem com área correta localizada em ${correctPositionDescription}`;

  return (
    <div className="pt-2 space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indicator-primary/70 border border-[#F8CC2E]"></div>
          <Text size="sm" weight="normal" color="text-text-600">
            Área correta
          </Text>
        </div>
        {userPositionRelative && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-600/70 border border-white"></div>
              <Text size="sm" weight="normal" color="text-text-600">
                Resposta correta
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indicator-error/70 border border-white"></div>
              <Text size="sm" weight="normal" color="text-text-600">
                Resposta incorreta
              </Text>
            </div>
          </>
        )}
      </div>

      {/* Image container */}
      <div className="relative w-full">
        {/* Hidden text summary for screen readers */}
        <div className="sr-only">{getSpatialRelationship()}</div>

        <img
          src={ImageQuestion}
          alt={imageAltText}
          className="w-full h-auto rounded-md"
        />

        {/* Correct answer circle */}
        <div
          role="img"
          aria-label={`Área correta marcada em ${correctPositionDescription}`}
          className="absolute rounded-full bg-indicator-primary/70 border-4 border-[#F8CC2E] pointer-events-none"
          style={{
            minWidth: '50px',
            maxWidth: '160px',
            width: '15%',
            aspectRatio: '1 / 1',
            left: `calc(${correctPositionRelative.x * 100}% - 7.5%)`,
            top: `calc(${correctPositionRelative.y * 100}% - 15%)`,
          }}
        >
          <Text
            size="sm"
            weight="normal"
            color="text-text-600"
            className="sr-only"
          >
            Círculo amarelo indicando a área correta da resposta, posicionado em{' '}
            {correctPositionDescription}
          </Text>
        </div>

        {/* User's answer circle */}
        {userPositionRelative && (
          <div
            role="img"
            aria-label={`Resposta do aluno marcada em ${getPositionDescription(
              userPositionRelative.x,
              userPositionRelative.y
            )}, ${isCorrect ? 'correta' : 'incorreta'}`}
            className={`absolute rounded-full border-4 pointer-events-none ${getUserCircleColorClasses()}`}
            style={{
              minWidth: '30px',
              maxWidth: '52px',
              width: '5%',
              aspectRatio: '1 / 1',
              left: `calc(${userPositionRelative.x * 100}% - 2.5%)`,
              top: `calc(${userPositionRelative.y * 100}% - 2.5%)`,
            }}
          >
            <Text
              size="sm"
              weight="normal"
              color="text-text-600"
              className="sr-only"
            >
              Círculo {isCorrect ? 'verde' : 'vermelho'} indicando a resposta do
              aluno, posicionado em{' '}
              {getPositionDescription(
                userPositionRelative.x,
                userPositionRelative.y
              )}
              . A resposta está{' '}
              {Math.round(
                Math.sqrt(
                  Math.pow(
                    userPositionRelative.x - correctPositionRelative.x,
                    2
                  ) +
                    Math.pow(
                      userPositionRelative.y - correctPositionRelative.y,
                      2
                    )
                ) * 100
              )}
              % de distância da área correta e é considerada{' '}
              {isCorrect ? 'correta' : 'incorreta'}.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
