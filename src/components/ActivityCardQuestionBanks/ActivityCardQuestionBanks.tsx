import {
  Button,
  getSubjectColorWithOpacity,
  IconRender,
  Text,
  Badge,
} from '@/index';
import { Plus, CheckCircle, XCircle } from 'phosphor-react';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { useMemo } from 'react';
import { cn } from '../../utils/utils';

interface QuestionData {
  options: { id: string; option: string }[];
  correctOptionIds?: string[];
}

interface ActivityCardQuestionBanksProps {
  question?: QuestionData;
  questionType?: QUESTION_TYPE;
  iconName?: string;
  subjectColor?: string;
  isDark?: boolean;
  onAddToActivity?: () => void;
  assunto?: string;
  enunciado?: string;
}

export const ActivityCardQuestionBanks = ({
  question,
  questionType,
  iconName = 'BookOpen',
  subjectColor = '#000000',
  isDark = false,
  onAddToActivity,
  assunto,
  enunciado,
}: ActivityCardQuestionBanksProps = {}) => {
  // Transform question options into Alternative format for teacher view
  const alternatives = useMemo(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.ALTERNATIVA)
      return [];

    const correctOptionIds = question.correctOptionIds || [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? ('correct' as const) : undefined,
        disabled: !isCorrect,
      } satisfies Alternative;
    });
  }, [question, questionType]);

  const correctOptionId = useMemo(() => {
    if (!question?.correctOptionIds || question.correctOptionIds.length === 0) {
      return undefined;
    }
    return question.correctOptionIds[0];
  }, [question]);

  // Transform question options into MultipleChoice format for teacher view
  const multipleChoices = useMemo(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.MULTIPLA_ESCOLHA)
      return [];

    const correctOptionIds = question.correctOptionIds || [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? ('correct' as const) : undefined,
        disabled: !isCorrect,
      };
    });
  }, [question, questionType]);

  const correctOptionIds = useMemo(() => {
    return question?.correctOptionIds || [];
  }, [question]);

  // Helper function to get status badge
  const getStatusBadge = (status: 'correct' | 'incorrect') => {
    switch (status) {
      case 'correct':
        return (
          <Badge variant="solid" action="success" iconLeft={<CheckCircle />}>
            Resposta correta
          </Badge>
        );
      case 'incorrect':
        return (
          <Badge variant="solid" action="error" iconLeft={<XCircle />}>
            Resposta incorreta
          </Badge>
        );
    }
  };

  // Helper function to get status styles
  const getStatusStyles = (status: 'correct' | 'incorrect') => {
    switch (status) {
      case 'correct':
        return 'bg-success-background border-success-300';
      case 'incorrect':
        return 'bg-error-background border-error-300';
    }
  };

  // Helper function to get letter by index
  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 97 = 'a' in ASCII

  // Map question type to display name
  const getQuestionTypeLabel = (type?: QUESTION_TYPE): string => {
    if (!type) return 'Tipo de questão';
    switch (type) {
      case QUESTION_TYPE.ALTERNATIVA:
        return 'Alternativa';
      case QUESTION_TYPE.MULTIPLA_ESCOLHA:
        return 'Múltipla Escolha';
      case QUESTION_TYPE.DISSERTATIVA:
        return 'Dissertativa';
      case QUESTION_TYPE.VERDADEIRO_FALSO:
        return 'Verdadeiro ou Falso';
      case QUESTION_TYPE.LIGAR_PONTOS:
        return 'Ligar Pontos';
      case QUESTION_TYPE.PREENCHER:
        return 'Preencher';
      case QUESTION_TYPE.IMAGEM:
        return 'Imagem';
      default:
        return 'Tipo de questão';
    }
  };

  return (
    <div className="min-h-[500px] w-full flex flex-col gap-2 px-4 py-6">
      <section className="flex flex-row gap-2 text-text-650">
        <div className="py-1 px-2 flex flex-row items-center gap-1">
          <span
            className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
            style={{
              backgroundColor: getSubjectColorWithOpacity(subjectColor, isDark),
            }}
          >
            <IconRender iconName={iconName} size={14} color="currentColor" />
          </span>
          <Text size="sm">{assunto || 'Assunto não informado'}</Text>
        </div>

        <div className="py-1 px-2 flex flex-row items-center gap-1">
          <Text size="sm" className="">
            {getQuestionTypeLabel(questionType)}
          </Text>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <Text size="md" weight="medium" className="text-text-950 text-md">
          {enunciado || 'Enunciado não informado'}
        </Text>

        {questionType === QUESTION_TYPE.ALTERNATIVA &&
          question &&
          alternatives.length > 0 && (
            <div className="mt-4">
              <AlternativesList
                alternatives={alternatives}
                mode="readonly"
                layout="compact"
                selectedValue={correctOptionId}
                name="teacher-question-view"
              />
            </div>
          )}

        {questionType === QUESTION_TYPE.MULTIPLA_ESCOLHA &&
          question &&
          multipleChoices.length > 0 && (
            <div className="mt-4">
              <MultipleChoiceList
                choices={multipleChoices}
                mode="readonly"
                selectedValues={correctOptionIds}
                name="teacher-question-view-multiple"
              />
            </div>
          )}

        {questionType === QUESTION_TYPE.DISSERTATIVA && (
          <div className="mt-4 px-2 py-4">
            <Text size="sm" className="text-text-600 italic">
              Resposta do aluno
            </Text>
          </div>
        )}

        {questionType === QUESTION_TYPE.VERDADEIRO_FALSO &&
          question &&
          question.options.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-col gap-3.5">
                {question.options.map((option, index) => {
                  const isCorrect = correctOptionIds.includes(option.id);
                  const correctAnswer = isCorrect ? 'Verdadeiro' : 'Falso';
                  const variantCorrect = 'correct';

                  return (
                    <section key={option.id} className="flex flex-col gap-2">
                      <div
                        className={cn(
                          'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                          getStatusStyles(variantCorrect)
                        )}
                      >
                        <Text size="sm" className="text-text-900">
                          {getLetterByIndex(index)
                            .concat(') ')
                            .concat(option.option)}
                        </Text>

                        <div className="flex flex-row items-center gap-2 flex-shrink-0">
                          <Text size="sm" className="text-text-700">
                            Resposta correta: {correctAnswer}
                          </Text>
                          {getStatusBadge(variantCorrect)}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
      </section>

      <section>
        <Button
          size="small"
          iconLeft={<Plus />}
          className="w-full"
          onClick={onAddToActivity}
        >
          Adicionar à atividade
        </Button>
      </section>
    </div>
  );
};
