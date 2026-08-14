import { render, screen } from '@testing-library/react';
import AnswerKeyModal from './AnswerKeyModal';
import { ANSWER_STATUS, type QuestionResult } from '../Quiz/useQuizStore';

type Answer = QuestionResult['answers'][number];

/**
 * Resposta de uma questão de cinco alternativas.
 *
 * A letra não vem do backend: ela é a posição da opção na questão, então o
 * fixture precisa das opções na ordem.
 *
 * @param questionId - Identificador da questão
 * @param markedIndex - Índice da alternativa marcada, ou -1 para em branco
 * @param status - Veredito da correção
 * @returns A resposta no formato que a tela recebe
 */
const makeAnswer = (
  questionId: string,
  markedIndex: number,
  status: ANSWER_STATUS
): Answer => {
  const options = ['A', 'B', 'C', 'D', 'E'].map((option, index) => ({
    id: `${questionId}-opt-${index}`,
    option,
  }));

  return {
    id: `${questionId}-answer`,
    questionId,
    answer: null,
    selectedOptions:
      markedIndex >= 0 ? [{ optionId: options[markedIndex].id }] : [],
    answerStatus: status,
    statement: 'Enunciado',
    additionalContent: null,
    questionType: 'ALTERNATIVA',
    difficultyLevel: 'MEDIO',
    solutionExplanation: null,
    correctOption: options[0].id,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    options,
  } as unknown as Answer;
};

describe('AnswerKeyModal', () => {
  it('numbers the questions in the order of the exam', () => {
    render(
      <AnswerKeyModal
        answers={[
          makeAnswer('q1', 0, ANSWER_STATUS.RESPOSTA_CORRETA),
          makeAnswer('q2', 2, ANSWER_STATUS.RESPOSTA_INCORRETA),
        ]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // Cada estado tem o seu veredito: colapsar tudo que não é correto em
  // "incorreta" esconderia a bolha que a leitura óptica não reconheceu, que é
  // o que o aluno abre este modal para descobrir.
  it.each([
    ['correta', ANSWER_STATUS.RESPOSTA_CORRETA, 'Questão 1: correta'],
    ['incorreta', ANSWER_STATUS.RESPOSTA_INCORRETA, 'Questão 1: incorreta'],
    ['em branco', ANSWER_STATUS.NAO_RESPONDIDO, 'Questão 1: em branco'],
    [
      'pendente',
      ANSWER_STATUS.PENDENTE_AVALIACAO,
      'Questão 1: aguardando correção',
    ],
  ])('marks a question as %s', (_label, status, expectedLabel) => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', 0, status)]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByLabelText(expectedLabel)).toBeInTheDocument();
  });

  it('draws the five alternatives of every question', () => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', 1, ANSWER_STATUS.RESPOSTA_CORRETA)]}
        onClose={jest.fn()}
      />
    );

    for (const letter of ['A', 'B', 'C', 'D', 'E']) {
      expect(screen.getByText(letter)).toBeInTheDocument();
    }
  });

  // A bolha marcada é a única que fica preenchida, e a cor dela é o veredito.
  it.each([
    ['success', ANSWER_STATUS.RESPOSTA_CORRETA, 'bg-success-200'],
    ['error', ANSWER_STATUS.RESPOSTA_INCORRETA, 'bg-error-200'],
  ])('fills the marked bubble with the %s tone', (_label, status, tone) => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', 2, status)]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('C').className).toContain(tone);
    expect(screen.getByText('A').className).not.toContain(tone);
  });

  // Nem em branco nem pendente podem ser pintados de errado: nenhum dos dois
  // é um erro do aluno.
  it.each([
    ['blank', ANSWER_STATUS.NAO_RESPONDIDO],
    ['pending', ANSWER_STATUS.PENDENTE_AVALIACAO],
  ])('never paints a %s answer as wrong', (_label, status) => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', 2, status)]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('C').className).not.toContain('bg-error-200');
    expect(screen.getByText('C').className).not.toContain('bg-success-200');
    expect(screen.queryByLabelText('Questão 1: incorreta')).toBeNull();
  });

  // Questão em branco: nenhuma bolha preenchida, e a linha segue aparecendo.
  it('leaves every bubble empty when nothing was marked', () => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', -1, ANSWER_STATUS.NAO_RESPONDIDO)]}
        onClose={jest.fn()}
      />
    );

    for (const letter of ['A', 'B', 'C', 'D', 'E']) {
      expect(screen.getByText(letter).className).not.toContain(
        'bg-success-200'
      );
      expect(screen.getByText(letter).className).not.toContain('bg-error-200');
    }
  });

  // `answerStatus` chega como string do backend: um valor fora do enum não
  // pode virar "incorreta" nem quebrar a linha.
  it('falls back to the blank presentation for an unknown status', () => {
    render(
      <AnswerKeyModal
        answers={[makeAnswer('q1', 1, 'ALGO_NOVO' as ANSWER_STATUS)]}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Questão 1: em branco')).toBeInTheDocument();
  });
});
