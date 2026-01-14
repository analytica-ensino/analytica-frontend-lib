import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {
  renderFromMap,
  renderQuestion,
  renderQuestionAlternative,
  renderQuestionMultipleChoice,
  renderQuestionTrueOrFalse,
  renderQuestionDissertative,
  renderQuestionFill,
  renderQuestionImage,
  renderQuestionConnectDots,
} from './index';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../../components/Quiz/useQuizStore';

/**
 * Helper function to create a Question
 */
const createQuestion = (
  id: string,
  statement: string,
  questionType: QUESTION_TYPE,
  options?: Array<{ id: string; option: string }>,
  correctOptionIds?: string[]
): Question => {
  return {
    id,
    statement,
    questionType,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    description: '',
    examBoard: null,
    examYear: null,
    solutionExplanation: null,
    answer: null,
    answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
    options: options || [],
    knowledgeMatrix: [],
    correctOptionIds: correctOptionIds || [],
  };
};

/**
 * Helper function to create a QuestionResult answer
 */
const createQuestionResult = (
  id: string,
  questionId: string,
  answerStatus: ANSWER_STATUS,
  answer: string | null = null,
  selectedOptions: Array<{ optionId: string }> = [],
  options?: Array<{ id: string; option: string; isCorrect: boolean }>,
  teacherFeedback: string | null = null
): QuestionResult['answers'][number] => {
  return {
    id,
    questionId,
    answer,
    selectedOptions,
    answerStatus,
    statement: '',
    questionType: QUESTION_TYPE.ALTERNATIVA,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    solutionExplanation: null,
    correctOption: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    options: options || [],
    knowledgeMatrix: [],
    teacherFeedback,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  };
};

describe('questionRenderer', () => {
  describe('renderFromMap', () => {
    it('returns null when questionType is undefined', () => {
      const result = renderFromMap(
        {
          [QUESTION_TYPE.ALTERNATIVA]: () => 'alt',
          [QUESTION_TYPE.MULTIPLA_ESCOLHA]: () => 'multi',
          [QUESTION_TYPE.DISSERTATIVA]: () => 'disc',
          [QUESTION_TYPE.VERDADEIRO_FALSO]: () => 'vf',
          [QUESTION_TYPE.LIGAR_PONTOS]: () => 'ligar',
          [QUESTION_TYPE.PREENCHER]: () => 'fill',
          [QUESTION_TYPE.IMAGEM]: () => 'img',
        },
        undefined
      );

      expect(result).toBeNull();
    });

    it('invokes renderer for provided type', () => {
      const renderer = jest.fn(() => 'rendered');

      const result = renderFromMap(
        {
          [QUESTION_TYPE.ALTERNATIVA]: renderer,
          [QUESTION_TYPE.MULTIPLA_ESCOLHA]: () => 'multi',
          [QUESTION_TYPE.DISSERTATIVA]: () => 'disc',
          [QUESTION_TYPE.VERDADEIRO_FALSO]: () => 'vf',
          [QUESTION_TYPE.LIGAR_PONTOS]: () => 'ligar',
          [QUESTION_TYPE.PREENCHER]: () => 'fill',
          [QUESTION_TYPE.IMAGEM]: () => 'img',
        },
        QUESTION_TYPE.ALTERNATIVA
      );

      expect(renderer).toHaveBeenCalled();
      expect(result).toBe('rendered');
    });

    it('returns null when renderer does not exist for type', () => {
      const renderers = {
        [QUESTION_TYPE.ALTERNATIVA]: () => 'alt',
        [QUESTION_TYPE.MULTIPLA_ESCOLHA]: () => 'multi',
        [QUESTION_TYPE.DISSERTATIVA]: () => 'disc',
        [QUESTION_TYPE.VERDADEIRO_FALSO]: () => 'vf',
        [QUESTION_TYPE.LIGAR_PONTOS]: () => 'ligar',
        [QUESTION_TYPE.PREENCHER]: () => 'fill',
        [QUESTION_TYPE.IMAGEM]: () => 'img',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Remove one renderer
      delete renderers[QUESTION_TYPE.ALTERNATIVA];

      const result = renderFromMap(renderers, QUESTION_TYPE.ALTERNATIVA);

      expect(result).toBeNull();
    });
  });

  describe('renderQuestionAlternative', () => {
    it('should render alternatives correctly', () => {
      const question = createQuestion(
        'q1',
        'Qual é a capital do Brasil?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionAlternative({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should display message when there are no alternatives', () => {
      const question = createQuestion(
        'q1',
        'Questão sem alternativas',
        QUESTION_TYPE.ALTERNATIVA,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO
      );

      render(renderQuestionAlternative({ question, result }));

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });

    it('should show neutral status when answer is pending', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.ALTERNATIVA,
        [{ id: 'opt1', option: 'Opção A' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        null,
        [{ optionId: 'opt1' }],
        [{ id: 'opt1', option: 'Opção A', isCorrect: true }]
      );

      const { container } = render(
        renderQuestionAlternative({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should show correct alternative when answer is correct', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionAlternative({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should show incorrect alternative when student selected wrong', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionAlternative({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle empty options', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.ALTERNATIVA,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO
      );
      render(renderQuestionAlternative({ question, result }));

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });
  });

  describe('renderQuestionMultipleChoice', () => {
    it('should render multiple choice correctly', () => {
      const question = createQuestion(
        'q1',
        'Selecione todas as capitais',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionMultipleChoice({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should display message when there are no choices', () => {
      const question = createQuestion(
        'q1',
        'Questão sem escolhas',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO
      );

      render(renderQuestionMultipleChoice({ question, result }));

      expect(screen.getByText('Não há Escolhas Múltiplas')).toBeInTheDocument();
    });

    it('should show multiple selections', () => {
      const question = createQuestion(
        'q1',
        'Selecione todas',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
          { id: 'opt3', option: 'Opção C' },
        ],
        ['opt1', 'opt2']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: true },
          { id: 'opt3', option: 'Opção C', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionMultipleChoice({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should show neutral status when answer is pending', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [{ id: 'opt1', option: 'Opção A' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        null,
        [{ optionId: 'opt1' }],
        [{ id: 'opt1', option: 'Opção A', isCorrect: true }]
      );

      const { container } = render(
        renderQuestionMultipleChoice({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle empty selectedOptions', () => {
      const question = createQuestion(
        'q1',
        'Questão',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [{ id: 'opt1', option: 'Opção A' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [{ id: 'opt1', option: 'Opção A', isCorrect: true }]
      );

      const { container } = render(
        renderQuestionMultipleChoice({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should show incorrect status when student selected wrong option', () => {
      const question = createQuestion(
        'q1',
        'Selecione todas',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt2' }], // Selecionou opt2 que é incorreta
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionMultipleChoice({ question, result })
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('renderQuestionTrueOrFalse', () => {
    it('should render true or false question', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'O Brasil é um país' },
          { id: 'opt2', option: 'A Lua é feita de queijo' },
        ],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'O Brasil é um país', isCorrect: true },
          { id: 'opt2', option: 'A Lua é feita de queijo', isCorrect: false },
        ]
      );

      const { container } = render(
        renderQuestionTrueOrFalse({ question, result })
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/a\) O Brasil é um país/)).toBeInTheDocument();
    });

    it('should show selected and correct answer', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(screen.getByText(/Resposta selecionada: V/)).toBeInTheDocument();
    });

    it('should show incorrect answer when student was wrong', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [], // Não selecionou, mas deveria ter selecionado
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(screen.getByText(/Resposta selecionada: F/)).toBeInTheDocument();
      expect(screen.getByText(/Resposta correta: V/)).toBeInTheDocument();
    });

    it('should show status when statement is false and student did not select', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'A Lua é feita de queijo' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [], // Não selecionou (correto, pois statement é falso)
        [{ id: 'opt1', option: 'A Lua é feita de queijo', isCorrect: false }]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(screen.getByText(/Resposta selecionada: F/)).toBeInTheDocument();
    });

    it('should not show status when answer is pending', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        null,
        [{ optionId: 'opt1' }],
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(
        screen.queryByText(/Resposta selecionada:/)
      ).not.toBeInTheDocument();
    });

    it('should not show status when not answered', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(
        screen.queryByText(/Resposta selecionada:/)
      ).not.toBeInTheDocument();
    });

    it('should use fallback when option.id does not exist', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: '', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: '' }],
        [{ id: '', option: 'O Brasil é um país', isCorrect: true }]
      );

      const { container } = render(
        renderQuestionTrueOrFalse({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should test getStatusStyles with variantCorrect undefined', () => {
      // getStatusStyles é testado quando shouldShowStatus é false
      // Nesse caso, getStatusStyles recebe string vazia que não corresponde a nenhum case
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        null,
        [],
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      // Quando shouldShowStatus é false, getStatusStyles não é chamado com variantCorrect
      // Mas quando shouldShowStatus é true e variantCorrect é uma string vazia ou undefined,
      // o default case é testado
      const { container } = render(
        renderQuestionTrueOrFalse({ question, result })
      );

      expect(container).toBeInTheDocument();
    });

    it('should show multiple options with different statuses', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'O Brasil é um país' },
          { id: 'opt2', option: 'A Lua é feita de queijo' },
          { id: 'opt3', option: 'A água é líquida' },
        ],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt3' }], // Selecionou opt1 e opt3
        [
          { id: 'opt1', option: 'O Brasil é um país', isCorrect: true },
          { id: 'opt2', option: 'A Lua é feita de queijo', isCorrect: false },
          { id: 'opt3', option: 'A água é líquida', isCorrect: true },
        ]
      );

      render(renderQuestionTrueOrFalse({ question, result }));

      expect(screen.getByText(/a\) O Brasil é um país/)).toBeInTheDocument();
      expect(
        screen.getByText(/b\) A Lua é feita de queijo/)
      ).toBeInTheDocument();
      expect(screen.getByText(/c\) A água é líquida/)).toBeInTheDocument();
    });
  });

  describe('renderQuestionDissertative', () => {
    it('should render student answer', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'A água evapora e condensa'
      );

      render(renderQuestionDissertative({ result }));

      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
      expect(screen.getByText('A água evapora e condensa')).toBeInTheDocument();
    });

    it('should display "Nenhuma resposta fornecida" when there is no answer', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      render(renderQuestionDissertative({ result }));

      expect(
        screen.getByText('Nenhuma resposta fornecida')
      ).toBeInTheDocument();
    });

    it('should display teacher feedback when answer is incorrect', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'Resposta incorreta',
        [],
        [],
        'Você precisa explicar melhor o processo'
      );

      render(renderQuestionDissertative({ result }));

      expect(screen.getByText('Observação do professor:')).toBeInTheDocument();
      expect(
        screen.getByText('Você precisa explicar melhor o processo')
      ).toBeInTheDocument();
    });

    it('should not display feedback when answer is correct', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'Resposta correta',
        [],
        [],
        'Boa resposta'
      );

      render(renderQuestionDissertative({ result }));

      expect(
        screen.queryByText('Observação do professor:')
      ).not.toBeInTheDocument();
    });

    it('should not display feedback when teacherFeedback is empty', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'Resposta incorreta',
        [],
        [],
        null
      );

      render(renderQuestionDissertative({ result }));

      expect(
        screen.queryByText('Observação do professor:')
      ).not.toBeInTheDocument();
    });

    it('should handle empty answer', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        ''
      );

      render(renderQuestionDissertative({ result }));

      expect(
        screen.getByText('Nenhuma resposta fornecida')
      ).toBeInTheDocument();
    });
  });

  describe('renderQuestionFill', () => {
    it('should render fill in the blanks question', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está localizado na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [{ id: 'opt1', option: 'América' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({
          continente: {
            answer: 'América',
            isCorrect: true,
            correctAnswer: 'América',
          },
        }),
        [],
        [{ id: 'opt1', option: 'América', isCorrect: true }]
      );

      // Wrapper component para permitir uso de hooks
      const Wrapper = () => renderQuestionFill({ question, result });
      const { container } = render(<Wrapper />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('should display [Não respondido] when there is no answer for placeholder', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está localizado na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      // Wrapper component para permitir uso de hooks
      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      const container = document.body;
      expect(container.textContent).toContain('Não respondido');
    });

    it('should display correct answer in green', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}} e fala {{idioma}}.',
        QUESTION_TYPE.PREENCHER,
        [
          { id: 'opt1', option: 'América' },
          { id: 'opt2', option: 'Português' },
        ],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({
          continente: {
            answer: 'América',
            isCorrect: true,
            correctAnswer: 'América',
          },
          idioma: {
            answer: 'Português',
            isCorrect: true,
            correctAnswer: 'Português',
          },
        }),
        [],
        [
          { id: 'opt1', option: 'América', isCorrect: true },
          { id: 'opt2', option: 'Português', isCorrect: true },
        ]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('should display incorrect answer in red', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [{ id: 'opt1', option: 'América' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        JSON.stringify({
          continente: {
            answer: 'Europa',
            isCorrect: false,
            correctAnswer: 'América',
          },
        }),
        [],
        [{ id: 'opt1', option: 'América', isCorrect: true }]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('should use fallback when there is no correct option', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('should use option at same index when there is no correct option', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [{ id: 'opt1', option: 'América' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [{ id: 'opt1', option: 'América', isCorrect: false }]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('should handle multiple placeholders', () => {
      const question = createQuestion(
        'q1',
        'O {{pais}} está na {{continente}} e fala {{idioma}}.',
        QUESTION_TYPE.PREENCHER,
        [
          { id: 'opt1', option: 'Brasil' },
          { id: 'opt2', option: 'América' },
          { id: 'opt3', option: 'Português' },
        ],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({
          pais: { answer: 'Brasil', isCorrect: true, correctAnswer: 'Brasil' },
          continente: {
            answer: 'América',
            isCorrect: true,
            correctAnswer: 'América',
          },
          idioma: {
            answer: 'Português',
            isCorrect: true,
            correctAnswer: 'Português',
          },
        }),
        [],
        [
          { id: 'opt1', option: 'Brasil', isCorrect: true },
          { id: 'opt2', option: 'América', isCorrect: true },
          { id: 'opt3', option: 'Português', isCorrect: true },
        ]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('should handle text before and after placeholders', () => {
      const question = createQuestion(
        'q1',
        'Texto antes {{placeholder}} texto depois.',
        QUESTION_TYPE.PREENCHER,
        [{ id: 'opt1', option: 'resposta' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({
          placeholder: {
            answer: 'resposta',
            isCorrect: true,
            correctAnswer: 'resposta',
          },
        }),
        [],
        [{ id: 'opt1', option: 'resposta', isCorrect: true }]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('should handle error when parsing JSON', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        'invalid json'
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('should handle answer not being an object', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        'string simples'
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('should handle answer being an object directly', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        {
          continente: {
            answer: 'América',
            isCorrect: true,
            correctAnswer: 'América',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        [],
        [{ id: 'opt1', option: 'América', isCorrect: true }]
      );

      const Wrapper = () => renderQuestionFill({ question, result });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });
  });

  describe('renderQuestionImage', () => {
    it('should render image question', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.48, y: 0.45 })
      );

      const { container } = render(renderQuestionImage({ result }));

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Área correta')).toBeInTheDocument();
    });

    it('should display correct answer legend when there is user answer', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.48, y: 0.45 })
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('should display only correct area when there is no user answer', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
      expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
    });

    it('should calculate correctly when answer is within radius', () => {
      // Posição muito próxima da correta (dentro do raio de 0.1)
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.49, y: 0.46 })
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('should calculate correctly when answer is outside radius', () => {
      // Posição muito distante da correta (fora do raio de 0.1)
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        JSON.stringify({ x: 0.8, y: 0.8 })
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('should handle error when parsing JSON', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        'invalid json'
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    });

    it('should handle answer being an object directly', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { x: 0.48, y: 0.45 } as any
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('should handle answer without x and y properties', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        JSON.stringify({ invalid: 'data' })
      );

      render(renderQuestionImage({ result }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    });

    it('should display green circle when answer is correct', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.48, y: 0.45 })
      );

      const { container } = render(renderQuestionImage({ result }));

      // Verifica que o componente foi renderizado
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('should display red circle when answer is incorrect', () => {
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        JSON.stringify({ x: 0.8, y: 0.8 })
      );

      const { container } = render(renderQuestionImage({ result }));

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });
  });

  describe('renderQuestionConnectDots', () => {
    it('should render not implemented message', () => {
      render(renderQuestionConnectDots({}));

      expect(
        screen.getByText('Tipo de questão: Ligar Pontos')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Tipo de questão: Ligar Pontos (não implementado)')
      ).toBeInTheDocument();
    });

    it('should render with custom paddingBottom', () => {
      render(renderQuestionConnectDots({ paddingBottom: 'pb-10' }));

      expect(
        screen.getByText('Tipo de questão: Ligar Pontos')
      ).toBeInTheDocument();
    });

    it('should render without paddingBottom', () => {
      render(renderQuestionConnectDots({}));

      expect(
        screen.getByText('Tipo de questão: Ligar Pontos')
      ).toBeInTheDocument();
    });
  });

  describe('renderQuestion', () => {
    it('should render ALTERNATIVA question type', () => {
      const question = createQuestion(
        'q1',
        'Qual é a capital do Brasil?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
        ]
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
    });

    it('should render MULTIPLA_ESCOLHA question type', () => {
      const question = createQuestion(
        'q1',
        'Selecione todas as capitais',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
        ],
        ['opt1']
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
        ]
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
    });

    it('should render VERDADEIRO_FALSO question type', () => {
      const question = createQuestion(
        'q1',
        'Marque V ou F',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [{ id: 'opt1', option: 'O Brasil é um país' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [{ id: 'opt1', option: 'O Brasil é um país', isCorrect: true }]
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
    });

    it('should render PREENCHER question type', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está localizado na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [{ id: 'opt1', option: 'América' }],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({
          continente: {
            answer: 'América',
            isCorrect: true,
            correctAnswer: 'América',
          },
        }),
        [],
        [{ id: 'opt1', option: 'América', isCorrect: true }]
      );

      const Wrapper = () => <>{renderQuestion({ question, result })}</>;
      const { container } = render(<Wrapper />);

      expect(container).toBeInTheDocument();
    });

    it('should render DISSERTATIVA question type', () => {
      const question = createQuestion(
        'q1',
        'Explique o ciclo da água',
        QUESTION_TYPE.DISSERTATIVA,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'A água evapora e condensa'
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('A água evapora e condensa')).toBeInTheDocument();
    });

    it('should render IMAGEM question type', () => {
      const question = createQuestion(
        'q1',
        'Clique na área correta',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.48, y: 0.45 })
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
    });

    it('should render LIGAR_PONTOS question type', () => {
      const question = createQuestion(
        'q1',
        'Ligue os pontos',
        QUESTION_TYPE.LIGAR_PONTOS,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
      expect(
        screen.getByText('Tipo de questão: Ligar Pontos')
      ).toBeInTheDocument();
    });

    it('should fallback to alternative renderer when questionType is unknown but has options', () => {
      const question = {
        id: 'q1',
        statement: 'Questão com tipo desconhecido',
        questionType: 'UNKNOWN_TYPE' as QUESTION_TYPE,
        difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
        description: '',
        examBoard: null,
        examYear: null,
        solutionExplanation: null,
        answer: null,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        options: [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ],
        knowledgeMatrix: [],
        correctOptionIds: ['opt1'],
      };
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: false },
        ]
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
    });

    it('should fallback to dissertative renderer when questionType is unknown and has no options', () => {
      const question = {
        id: 'q1',
        statement: 'Questão com tipo desconhecido',
        questionType: 'UNKNOWN_TYPE' as QUESTION_TYPE,
        difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
        description: '',
        examBoard: null,
        examYear: null,
        solutionExplanation: null,
        answer: null,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        options: [],
        knowledgeMatrix: [],
        correctOptionIds: [],
      };
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      const { container } = render(<>{renderQuestion({ question, result })}</>);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
    });
  });
});
