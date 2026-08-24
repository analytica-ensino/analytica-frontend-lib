import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/** A point on the image, in percentage points of its width/height (0-100). */
export interface ImagePoint {
  x: number;
  y: number;
}

export interface ImageAnswerViewProps {
  /** URL of the image the student had to click on */
  readonly imageUrl: string;
  /** The answer key point. Null when the question carries no key. */
  readonly correctPoint: ImagePoint | null;
  /** Where the student clicked. Null when the question was left blank. */
  readonly studentPoint: ImagePoint | null;
  /**
   * Radius within which a click counts as correct, in the same percentage
   * space. Comes from the backend so the drawn circle matches the grade.
   */
  readonly toleranceRadius: number;
  /** Whether the answer key may be revealed (false while pending) */
  readonly showCorrectness?: boolean;
}

/** Describe a point for screen readers. */
const describePoint = (point: ImagePoint): string =>
  `${Math.round(point.x)}% da esquerda, ${Math.round(point.y)}% do topo`;

/** Euclidean distance between two points in the 0-100 space. */
const distanceBetween = (a: ImagePoint, b: ImagePoint): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Read-only view of an image question: the image, the answer key area and where
 * the student clicked.
 *
 * Shared by the activity correction modal, the simulation detail modal and the
 * student's result screen, which used to carry three divergent copies of this —
 * one of them drawing a mock image with a hardcoded answer area, and each one
 * deciding correctness with a different radius of its own. Here there is a
 * single rule, and it is the backend's: a click is correct when its distance to
 * the correct point is at most `toleranceRadius`.
 *
 * The target circle is drawn with the diameter of that tolerance, so what the
 * reader sees is what decided the grade.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <ImageAnswerView
 *   imageUrl={question.additionalContent ?? ''}
 *   correctPoint={{ x: 50, y: 30 }}
 *   studentPoint={{ x: 52, y: 28 }}
 *   toleranceRadius={10}
 * />
 * ```
 */
export const ImageAnswerView = ({
  imageUrl,
  correctPoint,
  studentPoint,
  toleranceRadius,
  showCorrectness = true,
}: ImageAnswerViewProps) => {
  const canShowCorrectness = showCorrectness && correctPoint !== null;
  const isCorrect =
    correctPoint !== null &&
    studentPoint !== null &&
    distanceBetween(studentPoint, correctPoint) <= toleranceRadius;

  /** Full spoken summary of the question, the only non-visual access to it. */
  const spatialSummary = (): string => {
    if (!correctPoint) {
      return studentPoint
        ? `Resposta do aluno em ${describePoint(studentPoint)}.`
        : 'Nenhuma resposta do aluno fornecida.';
    }

    const correctDescription = describePoint(correctPoint);
    if (!studentPoint) {
      return `Área correta localizada em ${correctDescription}. Nenhuma resposta do aluno fornecida.`;
    }

    const deltaX = studentPoint.x - correctPoint.x;
    const deltaY = studentPoint.y - correctPoint.y;
    let direction: string;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'à direita' : 'à esquerda';
    } else {
      direction = deltaY > 0 ? 'abaixo' : 'acima';
    }

    const distance = Math.round(distanceBetween(studentPoint, correctPoint));
    const verdict = isCorrect
      ? 'A resposta está dentro da área de tolerância e é considerada correta.'
      : 'A resposta está fora da área de tolerância e é considerada incorreta.';

    return `Área correta localizada em ${correctDescription}. Resposta do aluno em ${describePoint(studentPoint)}. A resposta do aluno está ${distance}% de distância ${direction} da área correta. ${verdict}`;
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center gap-4 text-xs">
        {canShowCorrectness && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indicator-primary/70 border border-[#F8CC2E]" />
            <Text size="sm" weight="normal" color="text-text-600">
              Área correta
            </Text>
          </div>
        )}
        {canShowCorrectness && studentPoint && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full border border-white',
                isCorrect ? 'bg-success-600/70' : 'bg-indicator-error/70'
              )}
            />
            <Text size="sm" weight="normal" color="text-text-600">
              {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
            </Text>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <div className="sr-only">{spatialSummary()}</div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={
              correctPoint
                ? `Questão de imagem com área correta localizada em ${describePoint(correctPoint)}`
                : 'Questão de imagem'
            }
            className="w-full h-auto rounded-md"
          />
        ) : (
          <div className="rounded-md border border-border-100 bg-background-50 p-6 text-center">
            <Text size="sm" className="text-text-600">
              Imagem da questão indisponível
            </Text>
          </div>
        )}

        {canShowCorrectness && correctPoint && (
          <div
            aria-hidden="true"
            data-testid="image-correct-area"
            className="absolute rounded-full bg-indicator-primary/70 border-4 border-[#F8CC2E] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              // Diameter = twice the tolerance, so the circle IS the pass mark.
              width: `${toleranceRadius * 2}%`,
              aspectRatio: '1 / 1',
              left: `${correctPoint.x}%`,
              top: `${correctPoint.y}%`,
            }}
          />
        )}

        {studentPoint && (
          <div
            aria-hidden="true"
            data-testid="image-student-point"
            className={cn(
              'absolute rounded-full border-4 pointer-events-none -translate-x-1/2 -translate-y-1/2',
              canShowCorrectness &&
                isCorrect &&
                'bg-success-600/70 border-white',
              canShowCorrectness &&
                !isCorrect &&
                'bg-indicator-error/70 border-white',
              !canShowCorrectness && 'bg-indicator-primary/70 border-[#F8CC2E]'
            )}
            style={{
              minWidth: '20px',
              maxWidth: '40px',
              width: '4%',
              aspectRatio: '1 / 1',
              left: `${studentPoint.x}%`,
              top: `${studentPoint.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageAnswerView;
