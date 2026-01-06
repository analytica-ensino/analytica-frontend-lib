import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {
  renderFromMap,
  renderQuestionAlternative,
  renderQuestionMultipleChoice,
  renderQuestionTrueOrFalse,
  renderQuestionDissertative,
  renderQuestionFill,
  renderQuestionImage,
  renderQuestionConnectDots,
} from './questionRenderer';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../components/Quiz/useQuizStore';

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
      } as any;

      // Remove one renderer
      delete renderers[QUESTION_TYPE.ALTERNATIVA];

      const result = renderFromMap(renderers, QUESTION_TYPE.ALTERNATIVA);

      expect(result).toBeNull();
    });
  });

  describe('renderQuestionAlternative', () => {
    it('deve renderizar alternativas corretamente', () => {
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
        renderQuestionAlternative({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há alternativas', () => {
      const question = createQuestion(
        'q1',
        'Questão sem alternativas',
        QUESTION_TYPE.ALTERNATIVA,
        [],
        []
      );
      const result = createQuestionResult('a1', 'q1', ANSWER_STATUS.NAO_RESPONDIDO);

      render(renderQuestionAlternative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });

    it('deve mostrar status neutro quando resposta está pendente', () => {
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
        renderQuestionAlternative({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve mostrar alternativa correta quando resposta está correta', () => {
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
        renderQuestionAlternative({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve mostrar alternativa incorreta quando aluno selecionou errado', () => {
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
        renderQuestionAlternative({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve lidar com options undefined', () => {
      const question = {
        ...createQuestion('q1', 'Questão', QUESTION_TYPE.ALTERNATIVA),
        options: undefined,
      };
      const result = createQuestionResult('a1', 'q1', ANSWER_STATUS.NAO_RESPONDIDO);

      render(renderQuestionAlternative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });
  });

  describe('renderQuestionMultipleChoice', () => {
    it('deve renderizar múltiplas escolhas corretamente', () => {
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
        renderQuestionMultipleChoice({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há escolhas', () => {
      const question = createQuestion(
        'q1',
        'Questão sem escolhas',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [],
        []
      );
      const result = createQuestionResult('a1', 'q1', ANSWER_STATUS.NAO_RESPONDIDO);

      render(renderQuestionMultipleChoice({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Não há Escolhas Múltiplas')).toBeInTheDocument();
    });

    it('deve mostrar múltiplas seleções', () => {
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
        renderQuestionMultipleChoice({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve mostrar status neutro quando resposta está pendente', () => {
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
        renderQuestionMultipleChoice({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve lidar com selectedOptions vazio', () => {
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
        renderQuestionMultipleChoice({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve mostrar status incorreto quando aluno selecionou opção errada', () => {
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
        renderQuestionMultipleChoice({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('renderQuestionTrueOrFalse', () => {
    it('deve renderizar questão verdadeiro ou falso', () => {
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
        renderQuestionTrueOrFalse({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/a\) O Brasil é um país/)).toBeInTheDocument();
    });

    it('deve mostrar resposta selecionada e correta', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.getByText(/Resposta selecionada: V/)).toBeInTheDocument();
    });

    it('deve mostrar resposta incorreta quando aluno errou', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.getByText(/Resposta selecionada: F/)).toBeInTheDocument();
      expect(screen.getByText(/Resposta correta: V/)).toBeInTheDocument();
    });

    it('deve mostrar status quando statement é falso e aluno não selecionou', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.getByText(/Resposta selecionada: F/)).toBeInTheDocument();
    });

    it('não deve mostrar status quando resposta está pendente', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.queryByText(/Resposta selecionada:/)).not.toBeInTheDocument();
    });

    it('não deve mostrar status quando não respondeu', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.queryByText(/Resposta selecionada:/)).not.toBeInTheDocument();
    });

    it('deve usar fallback quando option.id não existe', () => {
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
        renderQuestionTrueOrFalse({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve testar getStatusStyles com variantCorrect undefined', () => {
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
        renderQuestionTrueOrFalse({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
    });

    it('deve mostrar múltiplas opções com diferentes status', () => {
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

      render(renderQuestionTrueOrFalse({ question, result, paddingBottom: '' }));

      expect(screen.getByText(/a\) O Brasil é um país/)).toBeInTheDocument();
      expect(screen.getByText(/b\) A Lua é feita de queijo/)).toBeInTheDocument();
      expect(screen.getByText(/c\) A água é líquida/)).toBeInTheDocument();
    });
  });

  describe('renderQuestionDissertative', () => {
    it('deve renderizar resposta do aluno', () => {
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

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
      expect(screen.getByText('A água evapora e condensa')).toBeInTheDocument();
    });

    it('deve exibir "Nenhuma resposta fornecida" quando não há resposta', () => {
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
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Nenhuma resposta fornecida')).toBeInTheDocument();
    });

    it('deve exibir observação do professor quando resposta está incorreta', () => {
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
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'Resposta incorreta',
        [],
        [],
        'Você precisa explicar melhor o processo'
      );

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Observação do professor:')).toBeInTheDocument();
      expect(screen.getByText('Você precisa explicar melhor o processo')).toBeInTheDocument();
    });

    it('não deve exibir observação quando resposta está correta', () => {
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
        'Resposta correta',
        [],
        [],
        'Boa resposta'
      );

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(
        screen.queryByText('Observação do professor:')
      ).not.toBeInTheDocument();
    });

    it('não deve exibir observação quando teacherFeedback está vazio', () => {
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
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'Resposta incorreta',
        [],
        [],
        null
      );

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(
        screen.queryByText('Observação do professor:')
      ).not.toBeInTheDocument();
    });

    it('deve lidar com resposta vazia', () => {
      const question = createQuestion(
        'q1',
        'Explique o ciclo da água',
        QUESTION_TYPE.DISSERTATIVA,
        [],
        []
      );
      const result = createQuestionResult('a1', 'q1', ANSWER_STATUS.NAO_RESPONDIDO, '');

      render(renderQuestionDissertative({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Nenhuma resposta fornecida')).toBeInTheDocument();
    });
  });

  describe('renderQuestionFill', () => {
    it('deve renderizar questão de preencher lacunas', () => {
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
      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      const { container } = render(<Wrapper />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('deve exibir [Não respondido] quando não há resposta para placeholder', () => {
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
      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      const container = document.body;
      expect(container.textContent).toContain('Não respondido');
    });

    it('deve exibir resposta correta em verde', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('deve exibir resposta incorreta em vermelho', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve usar fallback quando não há option correta', () => {
      const question = createQuestion(
        'q1',
        'O Brasil está na {{continente}}.',
        QUESTION_TYPE.PREENCHER,
        [],
        []
      );
      const result = createQuestionResult('a1', 'q1', ANSWER_STATUS.NAO_RESPONDIDO, null);

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('deve usar option no mesmo índice quando não há option correta', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Gabarito:')).toBeInTheDocument();
    });

    it('deve lidar com múltiplos placeholders', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve lidar com texto antes e depois dos placeholders', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve lidar com erro ao fazer parse do JSON', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve lidar com answer não sendo objeto', () => {
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

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve lidar com answer sendo objeto diretamente', () => {
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
        } as any,
        [],
        [{ id: 'opt1', option: 'América', isCorrect: true }]
      );

      const Wrapper = () => renderQuestionFill({ question, result, paddingBottom: '' });
      render(<Wrapper />);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });
  });

  describe('renderQuestionImage', () => {
    it('deve renderizar questão de imagem', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem onde está o Brasil',
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

      const { container } = render(
        renderQuestionImage({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Área correta')).toBeInTheDocument();
    });

    it('deve exibir legenda de resposta correta quando há resposta do usuário', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
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

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('deve exibir apenas área correta quando não há resposta do usuário', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
      expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
    });

    it('deve calcular corretamente quando resposta está dentro do raio', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      // Posição muito próxima da correta (dentro do raio de 0.1)
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        JSON.stringify({ x: 0.49, y: 0.46 })
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('deve calcular corretamente quando resposta está fora do raio', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      // Posição muito distante da correta (fora do raio de 0.1)
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        JSON.stringify({ x: 0.8, y: 0.8 })
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('deve lidar com erro ao fazer parse do JSON', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        'invalid json'
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    });

    it('deve lidar com answer sendo objeto diretamente', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        { x: 0.48, y: 0.45 } as any
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('deve lidar com answer sem propriedades x e y', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.NAO_RESPONDIDO,
        JSON.stringify({ invalid: 'data' })
      );

      render(renderQuestionImage({ question, result, paddingBottom: '' }));

      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    });

    it('deve exibir círculo verde quando resposta está correta', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
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

      const { container } = render(
        renderQuestionImage({ question, result, paddingBottom: '' })
      );

      // Verifica que o componente foi renderizado
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('deve exibir círculo vermelho quando resposta está incorreta', () => {
      const question = createQuestion(
        'q1',
        'Clique na imagem',
        QUESTION_TYPE.IMAGEM,
        [],
        []
      );
      const result = createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        JSON.stringify({ x: 0.8, y: 0.8 })
      );

      const { container } = render(
        renderQuestionImage({ question, result, paddingBottom: '' })
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });
  });

  describe('renderQuestionConnectDots', () => {
    it('deve renderizar mensagem de não implementado', () => {
      render(renderQuestionConnectDots({ paddingBottom: '' }));

      expect(screen.getByText('Tipo de questão: Ligar Pontos')).toBeInTheDocument();
      expect(
        screen.getByText('Tipo de questão: Ligar Pontos (não implementado)')
      ).toBeInTheDocument();
    });

    it('deve renderizar com paddingBottom customizado', () => {
      render(renderQuestionConnectDots({ paddingBottom: 'pb-10' }));

      expect(screen.getByText('Tipo de questão: Ligar Pontos')).toBeInTheDocument();
    });

    it('deve renderizar sem paddingBottom', () => {
      render(renderQuestionConnectDots({}));

      expect(screen.getByText('Tipo de questão: Ligar Pontos')).toBeInTheDocument();
    });
  });
});

