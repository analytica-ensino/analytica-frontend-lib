import {
  Button,
  getSubjectColorWithOpacity,
  IconRender,
  Text,
} from '../../index';
import { Plus } from 'phosphor-react';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import {
  renderFromMap,
  type QuestionRendererMap,
} from '../../utils/questionRenderer/index';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { FillInBlanks } from '../FillInBlanks/FillInBlanks';
import { ConnectDots } from '../ConnectDots/ConnectDots';
import { useMemo } from 'react';
import { questionTypeLabels } from '../../types/questionTypes';
import { HtmlMathRenderer } from '../HtmlMathRenderer';

interface QuestionOption {
  id: string;
  option: string;
  correct?: boolean;
  correctValue?: string | null;
}

interface QuestionData {
  options: QuestionOption[];
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
  additionalContent?: string | null;
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
  additionalContent,
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

  // Helper function to get letter by index
  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 97 = 'a' in ASCII

  // Render functions for each question type
  const renderAlternative = () => {
    if (!question || alternatives.length === 0) return null;
    return (
      <div className="mt-4">
        <AlternativesList
          alternatives={alternatives}
          mode="readonly"
          layout="compact"
          selectedValue={correctOptionId}
          name="teacher-question-view"
        />
      </div>
    );
  };

  const renderMultipleChoice = () => {
    if (!question || multipleChoices.length === 0) return null;
    return (
      <div className="mt-4">
        <MultipleChoiceList
          choices={multipleChoices}
          mode="readonly"
          selectedValues={correctOptionIds}
          name="teacher-question-view-multiple"
        />
      </div>
    );
  };

  const renderDissertative = () => {
    return (
      <div className="mt-4 px-2 py-4">
        <Text size="sm" className="text-text-600 italic">
          Resposta do aluno
        </Text>
      </div>
    );
  };

  // Helper to prepend letter to HTML content (handles <p> tags)
  const prependLetterToHtml = (letter: string, html: string): string => {
    // If content starts with <p>, insert letter after opening tag
    if (html.trim().startsWith('<p>')) {
      return html.replace(/^(\s*<p>)/, `$1${letter}) `);
    }
    // Otherwise, just prepend
    return `${letter}) ${html}`;
  };

  const renderTrueOrFalse = () => {
    if (!question || question.options.length === 0) return null;
    return (
      <div className="mt-4">
        <div className="flex flex-col gap-3.5">
          {question.options.map((option, index) => {
            const isCorrect = correctOptionIds.includes(option.id);
            const correctAnswer = isCorrect ? 'Verdadeiro' : 'Falso';
            const letter = getLetterByIndex(index);
            const contentWithLetter = prependLetterToHtml(
              letter,
              option.option
            );

            return (
              <section key={option.id} className="flex flex-col gap-2">
                <div className="flex flex-row justify-between items-start gap-2 p-2 rounded-md border border-border-200">
                  <HtmlMathRenderer
                    content={contentWithLetter}
                    className="text-text-900 text-sm flex-1"
                  />

                  <Text
                    size="sm"
                    className="text-text-700 shrink-0 whitespace-nowrap"
                  >
                    Resposta correta: {correctAnswer}
                  </Text>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  // Transform options for ConnectDots component
  const connectDotsOptions = useMemo(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.RELACIONAR)
      return [];
    return question.options
      .filter((opt) => opt.correctValue)
      .map((opt) => ({
        id: opt.id,
        option: opt.option,
        correctValue: opt.correctValue as string,
      }));
  }, [question?.options, questionType]);

  const renderConnectDots = () => {
    if (connectDotsOptions.length === 0) return null;

    return (
      <ConnectDots
        options={connectDotsOptions}
        mode="readonly"
        className="mt-4"
      />
    );
  };

  // Check if this is a fill-in-blanks question
  const isFillInBlanks = questionType === QUESTION_TYPE.PREENCHER_LACUNAS;

  // Process enunciado for PREENCHER_LACUNAS - replace UUIDs with blanks for display
  const processedEnunciado = useMemo(() => {
    if (!isFillInBlanks || !enunciado) return enunciado;

    // Pattern to match {uuid} placeholders
    const placeholderPattern = /\{[a-f0-9-]{36}\}/g;

    // Replace UUIDs with blank underscores
    return enunciado.replace(placeholderPattern, '_____');
  }, [enunciado, isFillInBlanks]);

  // Transform options for FillInBlanks component
  const fillInBlanksOptions = useMemo(() => {
    if (!question?.options) return [];
    return question.options.map((opt) => ({
      id: opt.id,
      option: opt.option,
    }));
  }, [question?.options]);

  const renderFill = () => {
    // For PREENCHER_LACUNAS, additionalContent contains the fill-in text with placeholders
    if (!additionalContent || fillInBlanksOptions.length === 0) return null;

    return (
      <FillInBlanks
        content={additionalContent}
        options={fillInBlanksOptions}
        mode="readonly"
        className="mt-4"
      />
    );
  };

  const renderImage = () => {
    if (!additionalContent) return null;
    return (
      <div className="mt-4">
        <img
          src={additionalContent}
          alt="Imagem da questão"
          className="max-w-full h-auto rounded-md border border-border-200"
        />
      </div>
    );
  };

  // Map question types to render functions
  const questionRenderers: QuestionRendererMap = {
    [QUESTION_TYPE.ALTERNATIVA]: renderAlternative,
    [QUESTION_TYPE.MULTIPLA_ESCOLHA]: renderMultipleChoice,
    [QUESTION_TYPE.DISSERTATIVA]: renderDissertative,
    [QUESTION_TYPE.VERDADEIRO_FALSO]: renderTrueOrFalse,
    [QUESTION_TYPE.RELACIONAR]: renderConnectDots,
    [QUESTION_TYPE.PREENCHER_LACUNAS]: renderFill,
    [QUESTION_TYPE.IMAGEM]: renderImage,
  };

  return (
    <div className="w-full flex flex-col gap-2 px-4 py-6">
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
            {questionType
              ? questionTypeLabels[questionType]
              : 'Tipo de questão'}
          </Text>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        {enunciado ? (
          <HtmlMathRenderer
            content={isFillInBlanks ? processedEnunciado || '' : enunciado}
            className="text-text-950 text-md font-medium"
          />
        ) : (
          <Text size="md" weight="medium" className="text-text-950 text-md">
            Enunciado não informado
          </Text>
        )}

        {renderFromMap(questionRenderers, questionType)}
      </section>

      <section>
        <Button
          size="small"
          iconLeft={<Plus />}
          className="w-full"
          onClick={() => {
            if (onAddToActivity) {
              onAddToActivity();
            }
          }}
        >
          Adicionar à atividade
        </Button>
      </section>
    </div>
  );
};
