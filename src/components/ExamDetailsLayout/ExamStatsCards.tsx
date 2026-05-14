import { StarIcon, MedalIcon, WarningCircleIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';

export interface ExamStatsCardsProps {
  averageScore: number;
  mostCorrectQuestions: number[];
  mostIncorrectQuestions: number[];
  unansweredQuestions: number[];
  /** Custom title for the section */
  title?: string;
}

/**
 * Format question numbers for display
 * Example: [1, 2, 4] -> "01, 02 e 04"
 */
export const formatQuestions = (questions: number[]): string => {
  if (questions.length === 0) return '-';

  const formatted = questions.map((q) => q.toString().padStart(2, '0'));

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} e ${formatted[1]}`;

  const lastQuestion = formatted.pop();
  return `${formatted.join(', ')} e ${lastQuestion}`;
};

/**
 * Stats cards component for exam details
 * Displays average score and question statistics
 * Layout matches ActivityDetails from analytica-frontend-lib
 */
export const ExamStatsCards = ({
  averageScore,
  mostCorrectQuestions,
  mostIncorrectQuestions,
  unansweredQuestions,
  title = 'Resultados da atividade',
}: ExamStatsCardsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Text as="h2" size="lg" weight="semibold">
        {title}
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Average Score Card */}
        <div className="border border-border-50 rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1 bg-warning-background">
          <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-warning-300">
            <StarIcon size={16} className="text-white" weight="regular" />
          </div>
          <Text className="text-2xs font-bold uppercase text-center text-warning-600">
            Média da Turma
          </Text>
          <Text className="text-xl font-bold text-warning-600">
            {averageScore.toFixed(1)}
          </Text>
        </div>

        {/* Most Correct Questions Card */}
        <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-success-200">
          <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-indicator-positive">
            <MedalIcon size={16} className="text-text-950" weight="regular" />
          </div>
          <Text className="text-2xs font-bold uppercase text-center text-success-700">
            Questões com mais acertos
          </Text>
          <Text className="text-xl font-bold text-success-700">
            {formatQuestions(mostCorrectQuestions)}
          </Text>
        </div>

        {/* Most Incorrect Questions Card */}
        <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-error-100">
          <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-indicator-negative">
            <WarningCircleIcon
              size={16}
              className="text-white"
              weight="regular"
            />
          </div>
          <Text className="text-2xs font-bold uppercase text-center text-error-700">
            Questões com mais erros
          </Text>
          <Text className="text-xl font-bold text-error-700">
            {formatQuestions(mostIncorrectQuestions)}
          </Text>
        </div>

        {/* Unanswered Questions Card */}
        <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-info-background">
          <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-info-500">
            <WarningCircleIcon
              size={16}
              className="text-white"
              weight="regular"
            />
          </div>
          <Text className="text-2xs font-bold uppercase text-center text-info-700">
            Questões não respondidas
          </Text>
          <Text className="text-xl font-bold text-info-700">
            {formatQuestions(unansweredQuestions)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ExamStatsCards;
