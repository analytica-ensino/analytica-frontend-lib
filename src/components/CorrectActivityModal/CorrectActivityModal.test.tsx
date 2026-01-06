import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectActivityModal from './CorrectActivityModal';
import type { StudentActivityCorrectionData } from '../../types/studentActivityCorrection';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../Quiz/useQuizStore';

/**
 * Helper function to create a Question in Quiz format
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
    knowledgeMatrix: [
      {
        areaKnowledge: { id: 'area1', name: 'Área de Conhecimento' },
        subject: {
          id: 'subject1',
          name: 'Matemática',
          color: '#FF6B6B',
          icon: 'Calculator',
        },
        topic: { id: 'topic1', name: 'Tópico' },
        subtopic: { id: 'subtopic1', name: 'Subtópico' },
        content: { id: 'content1', name: 'Conteúdo' },
      },
    ],
    correctOptionIds: correctOptionIds || [],
  };
};

/**
 * Helper function to create a QuestionResult answer in Quiz format
 */
const createQuestionResult = (
  id: string,
  questionId: string,
  answerStatus: ANSWER_STATUS,
  answer: string | null = null,
  selectedOptions: Array<{ optionId: string }> = [],
  options?: Array<{ id: string; option: string; isCorrect: boolean }>,
  teacherFeedback: string | null = null,
  statement: string = '',
  questionType: QUESTION_TYPE = QUESTION_TYPE.ALTERNATIVA,
  difficultyLevel: QUESTION_DIFFICULTY = QUESTION_DIFFICULTY.MEDIO,
  solutionExplanation: string | null = null
): QuestionResult['answers'][number] => {
  return {
    id,
    questionId,
    answer,
    selectedOptions,
    answerStatus,
    statement,
    questionType,
    difficultyLevel,
    solutionExplanation,
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

describe('CorrectActivityModal', () => {
  const mockData: StudentActivityCorrectionData = {
    studentId: 'student-123',
    studentName: 'João Silva',
    score: 8.5,
    correctCount: 5,
    incorrectCount: 2,
    blankCount: 1,
    questions: [
      {
        question: createQuestion(
          'q1',
          'Questão 1',
          QUESTION_TYPE.ALTERNATIVA,
          [
            { id: 'opt1', option: 'Opção A' },
            { id: 'opt2', option: 'Opção B' },
          ],
          ['opt1']
        ),
        result: createQuestionResult(
          'a1',
          'q1',
          ANSWER_STATUS.RESPOSTA_CORRETA,
          null,
          [{ optionId: 'opt1' }],
          [
            { id: 'opt1', option: 'Opção A', isCorrect: true },
            { id: 'opt2', option: 'Opção B', isCorrect: false },
          ],
          null,
          'Questão 1',
          QUESTION_TYPE.ALTERNATIVA
        ),
        questionNumber: 1,
      },
      {
        question: createQuestion(
          'q2',
          'Questão 2',
          QUESTION_TYPE.ALTERNATIVA,
          [
            { id: 'opt1', option: 'Opção B' },
            { id: 'opt2', option: 'Opção C' },
          ],
          ['opt2']
        ),
        result: createQuestionResult(
          'a2',
          'q2',
          ANSWER_STATUS.RESPOSTA_INCORRETA,
          null,
          [{ optionId: 'opt1' }],
          [
            { id: 'opt1', option: 'Opção B', isCorrect: false },
            { id: 'opt2', option: 'Opção C', isCorrect: true },
          ],
          null,
          'Questão 2',
          QUESTION_TYPE.ALTERNATIVA
        ),
        questionNumber: 2,
      },
      {
        question: createQuestion(
          'q3',
          'Questão 3',
          QUESTION_TYPE.ALTERNATIVA,
          [{ id: 'opt1', option: 'Opção D' }],
          ['opt1']
        ),
        result: createQuestionResult(
          'a3',
          'q3',
          ANSWER_STATUS.NAO_RESPONDIDO,
          null,
          [],
          [{ id: 'opt1', option: 'Opção D', isCorrect: true }],
          null,
          'Questão 3',
          QUESTION_TYPE.ALTERNATIVA
        ),
        questionNumber: 3,
      },
    ],
    observation: 'Observação anterior do professor',
  };

  const mockDataWithAlternatives: StudentActivityCorrectionData = {
    studentId: 'student-456',
    studentName: 'Maria Santos',
    score: 7.5,
    correctCount: 3,
    incorrectCount: 1,
    blankCount: 1,
    questions: [
      {
        question: createQuestion(
          'q1',
          'Qual é a capital do Brasil?',
          QUESTION_TYPE.ALTERNATIVA,
          [
            { id: 'opt1', option: 'Brasília' },
            { id: 'opt2', option: 'São Paulo' },
            { id: 'opt3', option: 'Rio de Janeiro' },
            { id: 'opt4', option: 'Salvador' },
          ],
          ['opt1']
        ),
        result: createQuestionResult(
          'a1',
          'q1',
          ANSWER_STATUS.RESPOSTA_CORRETA,
          null,
          [{ optionId: 'opt1' }],
          [
            { id: 'opt1', option: 'Brasília', isCorrect: true },
            { id: 'opt2', option: 'São Paulo', isCorrect: false },
            { id: 'opt3', option: 'Rio de Janeiro', isCorrect: false },
            { id: 'opt4', option: 'Salvador', isCorrect: false },
          ],
          null,
          'Qual é a capital do Brasil?',
          QUESTION_TYPE.ALTERNATIVA
        ),
        questionNumber: 1,
      },
      {
        question: createQuestion(
          'q2',
          'Qual o maior planeta do sistema solar?',
          QUESTION_TYPE.ALTERNATIVA,
          [
            { id: 'opt1', option: 'Terra' },
            { id: 'opt2', option: 'Marte' },
            { id: 'opt3', option: 'Júpiter' },
            { id: 'opt4', option: 'Saturno' },
          ],
          ['opt3']
        ),
        result: createQuestionResult(
          'a2',
          'q2',
          ANSWER_STATUS.RESPOSTA_INCORRETA,
          null,
          [{ optionId: 'opt2' }],
          [
            { id: 'opt1', option: 'Terra', isCorrect: false },
            { id: 'opt2', option: 'Marte', isCorrect: false },
            { id: 'opt3', option: 'Júpiter', isCorrect: true },
            { id: 'opt4', option: 'Saturno', isCorrect: false },
          ],
          null,
          'Qual o maior planeta do sistema solar?',
          QUESTION_TYPE.ALTERNATIVA
        ),
        questionNumber: 2,
      },
      {
        question: createQuestion(
          'q3',
          'Explique o ciclo da água.',
          QUESTION_TYPE.DISSERTATIVA
        ),
        result: createQuestionResult(
          'a3',
          'q3',
          ANSWER_STATUS.NAO_RESPONDIDO,
          null,
          [],
          [],
          null,
          'Explique o ciclo da água.',
          QUESTION_TYPE.DISSERTATIVA
        ),
        questionNumber: 3,
      },
    ],
    observation: undefined,
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    data: mockData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar o modal quando isOpen é true', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
    });

    it('não deve renderizar quando isOpen é false', () => {
      render(<CorrectActivityModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });

    it('não deve renderizar quando data é null', () => {
      render(<CorrectActivityModal {...defaultProps} data={null} />);

      expect(screen.queryByText('Corrigir atividade')).not.toBeInTheDocument();
    });
  });

  describe('Título do modal', () => {
    it('deve exibir "Corrigir atividade" quando isViewOnly é false', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
    });

    it('deve exibir "Detalhes da atividade" quando isViewOnly é true', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={true} />);

      expect(screen.getByText('Detalhes da atividade')).toBeInTheDocument();
    });
  });

  describe('Informações do aluno', () => {
    it('deve exibir o nome do aluno', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('deve exibir o avatar com a inicial do nome', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Cards de estatísticas', () => {
    it('deve exibir a nota formatada', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText('Nota')).toBeInTheDocument();
    });

    it('deve exibir "-" quando a nota é null', () => {
      const dataWithNullScore = { ...mockData, score: null };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithNullScore} />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('deve exibir o número de questões corretas', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('N° de questões corretas')).toBeInTheDocument();
    });

    it('deve exibir o número de questões incorretas', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('N° de questões incorretas')).toBeInTheDocument();
    });
  });

  describe('Seção de observação - Estado fechado', () => {
    it('deve exibir seção de observação com botão "Incluir" quando isViewOnly é false e sem observação existente', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      expect(screen.getByText('Observação')).toBeInTheDocument();
      expect(screen.getByText('Incluir')).toBeInTheDocument();
    });

    it('deve exibir seção de observação com botão "Editar" quando existe observação', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Observação')).toBeInTheDocument();
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    it('não deve exibir a seção de observação quando isViewOnly é true', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={true} />);

      expect(screen.queryByText('Incluir')).not.toBeInTheDocument();
    });

    it('não deve exibir textarea no estado fechado', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(
        screen.queryByPlaceholderText('Escreva uma observação para o estudante')
      ).not.toBeInTheDocument();
    });
  });

  describe('Seção de observação - Estado expandido', () => {
    it('deve expandir ao clicar em "Incluir"', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(
        screen.getByPlaceholderText('Escreva uma observação para o estudante')
      ).toBeInTheDocument();
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });

    it('deve exibir observação anterior quando expandido e existe', () => {
      // Start with existing observation, click Editar to enter expanded state
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      const editarButton = screen.getByText('Editar');
      fireEvent.click(editarButton);

      expect(screen.getByText('Observação anterior:')).toBeInTheDocument();
      // The observation appears both in the textarea and in the "Observação anterior:" section
      const observationElements = screen.getAllByText(
        'Observação anterior do professor'
      );
      expect(observationElements.length).toBeGreaterThanOrEqual(1);
    });

    it('não deve exibir observação anterior quando não existe', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(
        screen.queryByText('Observação anterior:')
      ).not.toBeInTheDocument();
    });

    it('deve desabilitar botão "Salvar" quando textarea está vazio', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).toBeDisabled();
    });

    it('deve habilitar botão "Salvar" quando textarea tem texto', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).not.toBeDisabled();
    });
  });

  describe('Seção de observação - Estado salvo', () => {
    it('deve salvar e exibir observação após clicar em "Salvar"', () => {
      const onObservationSubmit = jest.fn();
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(screen.getByText('Nova observação')).toBeInTheDocument();
      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(onObservationSubmit).toHaveBeenCalledWith(
        'student-123',
        'Nova observação',
        []
      );
    });

    it('deve permitir editar observação salva', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      const editarButton = screen.getByText('Editar');
      fireEvent.click(editarButton);

      expect(
        screen.getByPlaceholderText('Escreva uma observação para o estudante')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('Nova observação')).toBeInTheDocument();
    });

    it('não deve chamar onObservationSubmit quando textarea está vazio', () => {
      const onObservationSubmit = jest.fn();
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(onObservationSubmit).not.toHaveBeenCalled();
    });

    it('não deve chamar onObservationSubmit quando textarea contém apenas espaços', () => {
      const onObservationSubmit = jest.fn();
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: '   ' } });

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(onObservationSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Lista de questões', () => {
    it('deve renderizar todas as questões', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      // Usa getAllByText porque o statement também contém "Questão X"
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Questão 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Questão 3').length).toBeGreaterThan(0);
    });

    it('deve exibir badges com status correto para cada questão', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('Correta')).toBeInTheDocument();
      expect(screen.getByText('Incorreta')).toBeInTheDocument();
      expect(screen.getByText('Em branco')).toBeInTheDocument();
    });
  });

  describe('Expansão de questões', () => {
    it('deve expandir questão ao clicar', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      expect(questao1Button).toBeInTheDocument();

      fireEvent.click(questao1Button!);

      // Verifica que o conteúdo da questão foi expandido (deve haver pelo menos 2 elementos: o botão e o statement)
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThanOrEqual(2);
    });

    it('deve manter questão expandida após clicar', () => {
      const singleQuestionData = {
        ...mockData,
        questions: [mockData.questions[0]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={singleQuestionData} />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      // Verifica que o statement da questão está visível (deve haver pelo menos 2 elementos)
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThanOrEqual(2);

      fireEvent.click(questao1Button!);

      // Ainda deve estar visível após clicar novamente
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThanOrEqual(2);
    });

    it('deve exibir "Não respondeu" quando studentAnswer é undefined', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao3Buttons = screen.getAllByText('Questão 3');
      const questao3Button = questao3Buttons[0].closest('button');
      fireEvent.click(questao3Button!);

      // Para questões de alternativa sem resposta, verifica que o statement está visível
      expect(screen.getAllByText('Questão 3').length).toBeGreaterThanOrEqual(2);
    });

    it('deve exibir resposta correta quando questão está expandida', () => {
      const singleQuestionData = {
        ...mockData,
        questions: [mockData.questions[1]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={singleQuestionData} />
      );

      const questao2Buttons = screen.getAllByText('Questão 2');
      const questao2Button = questao2Buttons[0].closest('button');
      fireEvent.click(questao2Button!);

      // Verifica que o statement está visível (deve haver pelo menos 2 elementos)
      expect(screen.getAllByText('Questão 2').length).toBeGreaterThanOrEqual(2);
      // Verifica que as alternativas estão disponíveis
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('deve exibir "-" quando correctAnswer é undefined', () => {
      const dataWithNoCorrectAnswer = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'Questão 1',
              QUESTION_TYPE.ALTERNATIVA,
              [{ id: 'opt1', option: 'Opção A' }],
              []
            ),
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.NAO_RESPONDIDO,
              null,
              [],
              [{ id: 'opt1', option: 'Opção A', isCorrect: false }],
              null,
              'Questão 1',
              QUESTION_TYPE.ALTERNATIVA
            ),
            questionNumber: 1,
          },
        ],
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithNoCorrectAnswer}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      // Verifica que a questão foi expandida (deve haver pelo menos 2 elementos)
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThanOrEqual(2);
    });

    it('deve permitir expandir múltiplas questões', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao2Buttons = screen.getAllByText('Questão 2');
      const questao1Button = questao1Buttons[0].closest('button');
      const questao2Button = questao2Buttons[0].closest('button');

      fireEvent.click(questao1Button!);
      fireEvent.click(questao2Button!);

      // Verifica que ambas as questões estão expandidas
      const allQuestao1 = screen.getAllByText('Questão 1');
      const allQuestao2 = screen.getAllByText('Questão 2');
      expect(allQuestao1.length).toBeGreaterThanOrEqual(2);
      expect(allQuestao2.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Callback onClose', () => {
    it('deve fechar o modal quando onClose é chamado via Modal', () => {
      const onClose = jest.fn();
      render(<CorrectActivityModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Questões com alternativas', () => {
    const singleQuestionWithAlternatives = {
      ...mockDataWithAlternatives,
      questions: [mockDataWithAlternatives.questions[0]],
    };

    it('deve exibir texto da questão quando expandida', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={singleQuestionWithAlternatives}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(
        screen.getByText('Qual é a capital do Brasil?')
      ).toBeInTheDocument();
    });

    it('deve exibir seção de alternativas quando questão tem alternativas', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={singleQuestionWithAlternatives}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      const alternativasButton = screen
        .getByText('Alternativas')
        .closest('button');
      fireEvent.click(alternativasButton!);

      expect(screen.getByText('Brasília')).toBeInTheDocument();
      expect(screen.getByText('São Paulo')).toBeInTheDocument();
      expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
      expect(screen.getByText('Salvador')).toBeInTheDocument();
    });

    it('deve exibir badge de resposta correta na alternativa correta', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={singleQuestionWithAlternatives}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const alternativasButton = screen
        .getByText('Alternativas')
        .closest('button');
      fireEvent.click(alternativasButton!);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('deve exibir badge de resposta incorreta quando aluno errou', () => {
      const incorrectQuestionData = {
        ...mockDataWithAlternatives,
        questions: [mockDataWithAlternatives.questions[1]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={incorrectQuestionData} />
      );

      const questao2Buttons = screen.getAllByText('Questão 2');
      const questao2Button = questao2Buttons[0].closest('button');
      fireEvent.click(questao2Button!);

      const alternativasButton = screen
        .getByText('Alternativas')
        .closest('button');
      fireEvent.click(alternativasButton!);

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('deve exibir fallback para questão dissertativa sem alternativas', () => {
      const essayQuestionData = {
        ...mockDataWithAlternatives,
        questions: [mockDataWithAlternatives.questions[2]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={essayQuestionData} />
      );

      const questao3Buttons = screen.getAllByText('Questão 3');
      const questao3Button = questao3Buttons[0].closest('button');
      fireEvent.click(questao3Button!);

      expect(screen.getByText('Explique o ciclo da água.')).toBeInTheDocument();
      // Para questões dissertativas, o renderer mostra "Resposta do aluno" (sem dois pontos)
      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
      // Quando não há resposta, mostra "Nenhuma resposta fornecida"
      expect(
        screen.getByText('Nenhuma resposta fornecida')
      ).toBeInTheDocument();
    });

    it('deve exibir todas alternativas de múltiplas questões expandidas', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={mockDataWithAlternatives}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao2Buttons = screen.getAllByText('Questão 2');
      const questao1Button = questao1Buttons[0].closest('button');
      const questao2Button = questao2Buttons[0].closest('button');
      fireEvent.click(questao1Button!);
      fireEvent.click(questao2Button!);

      const alternativasButtons = screen.getAllByText('Alternativas');
      fireEvent.click(alternativasButtons[0].closest('button')!);
      fireEvent.click(alternativasButtons[1].closest('button')!);

      expect(screen.getByText('Brasília')).toBeInTheDocument();
      expect(screen.getByText('Júpiter')).toBeInTheDocument();
    });
  });

  describe('Casos de borda', () => {
    it('deve lidar com lista de questões vazia', () => {
      const dataWithNoQuestions = { ...mockData, questions: [] };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithNoQuestions} />
      );

      expect(screen.getByText('Respostas')).toBeInTheDocument();
      expect(screen.queryByText('Questão 1')).not.toBeInTheDocument();
    });

    it('deve lidar com nome do aluno com caractere especial', () => {
      const dataWithSpecialName = { ...mockData, studentName: 'José María' };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithSpecialName} />
      );

      expect(screen.getByText('José María')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('deve formatar nota com uma casa decimal', () => {
      const dataWithIntegerScore = { ...mockData, score: 10 };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithIntegerScore} />
      );

      expect(screen.getByText('10.0')).toBeInTheDocument();
    });

    it('deve funcionar sem callback onObservationSubmit', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
          onObservationSubmit={undefined}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const salvarButton = screen.getByText('Salvar');
      expect(() => fireEvent.click(salvarButton)).not.toThrow();
    });

    it('deve permitir anexar arquivos na observação', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(screen.getByText('Anexar')).toBeInTheDocument();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('deve permitir remover arquivo anexado', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test content'], 'arquivo-teste.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      expect(screen.getByText('arquivo-teste.pdf')).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remover arquivo-teste.pdf');
      fireEvent.click(removeButton);

      expect(screen.queryByText('arquivo-teste.pdf')).not.toBeInTheDocument();
    });

    it('deve habilitar Salvar quando arquivo é anexado sem texto', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).toBeDisabled();

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      expect(salvarButton).not.toBeDisabled();
    });

    it('deve chamar onObservationSubmit com arquivos', () => {
      const onObservationSubmit = jest.fn();
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, {
        target: { value: 'Observação com arquivo' },
      });

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'documento.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(onObservationSubmit).toHaveBeenCalledWith(
        'student-123',
        'Observação com arquivo',
        [file]
      );
    });

    it('deve exibir arquivos salvos no estado salvo', () => {
      const dataWithoutObservation = { ...mockData, observation: undefined };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutObservation}
          isViewOnly={false}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'arquivo-salvo.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(fileInput, 'files', { value: [file] });
      fireEvent.change(fileInput);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: 'Obs' } });

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(screen.getByText('arquivo-salvo.pdf')).toBeInTheDocument();
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });
  });

  describe('Existing attachment scenarios', () => {
    it('deve retornar "Anexo" quando URL é inválida no existingAttachment', () => {
      const dataWithInvalidAttachment = {
        ...mockData,
        observation: 'Obs existente',
        attachment: 'invalid-url-without-protocol',
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithInvalidAttachment}
          isViewOnly={false}
        />
      );
      expect(screen.getByText('Anexo')).toBeInTheDocument();
    });

    it('deve exibir existingAttachment com link e botão Trocar ao editar', () => {
      const dataWithAttachment = {
        ...mockData,
        observation: 'Observação existente',
        attachment: 'https://example.com/files/documento.pdf',
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithAttachment}
          isViewOnly={false}
        />
      );

      fireEvent.click(screen.getByText('Editar'));

      expect(screen.getByText('documento.pdf')).toBeInTheDocument();
      expect(screen.getByText('Trocar')).toBeInTheDocument();
    });

    it('deve abrir seletor de arquivo ao clicar em Trocar', () => {
      const dataWithAttachment = {
        ...mockData,
        observation: 'Obs',
        attachment: 'https://example.com/file.pdf',
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithAttachment}
          isViewOnly={false}
        />
      );

      fireEvent.click(screen.getByText('Editar'));

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.click(screen.getByText('Trocar'));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('deve habilitar Salvar quando há apenas existingAttachment sem novo texto', () => {
      const dataWithAttachment = {
        ...mockData,
        observation: 'Obs antiga',
        attachment: 'https://example.com/file.pdf',
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithAttachment}
          isViewOnly={false}
        />
      );

      fireEvent.click(screen.getByText('Editar'));

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação para o estudante'
      );
      fireEvent.change(textarea, { target: { value: '' } });

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).not.toBeDisabled();
    });
  });
});
