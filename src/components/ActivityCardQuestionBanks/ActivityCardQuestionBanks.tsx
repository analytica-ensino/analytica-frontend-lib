import { Button, getSubjectColorWithOpacity, IconRender, Text } from '@/index';
import { Plus } from 'phosphor-react';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { useMemo } from 'react';

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
}

export const ActivityCardQuestionBanks = ({
  question,
  questionType,
  iconName = 'BookOpen',
  subjectColor = '#000000',
  isDark = false,
  onAddToActivity,
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
          <Text size="sm">Ecologia e a Interação entre Espécies</Text>
        </div>

        <div className="py-1 px-2 flex flex-row items-center gap-1">
          <Text size="sm" className="">
            {getQuestionTypeLabel(questionType)}
          </Text>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <Text size="md" weight="medium" className="text-text-950 text-md">
          Um grupo de cientistas está estudando o comportamento de uma população
          de rãs em um lago. Após várias observações, eles notaram que a
          quantidade de rãs aumenta em média 15% a cada mês. Qual será a
          população de rãs após 6 meses, se inicialmente havia 200 rãs no lago?
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
