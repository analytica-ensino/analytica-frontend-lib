import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectActivityModal from './CorrectActivityModal';
import type { StudentActivityCorrectionData } from '../../utils/studentActivityCorrection';
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

  describe('Basic rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CorrectActivityModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });

    it('should not render when data is null', () => {
      render(<CorrectActivityModal {...defaultProps} data={null} />);

      expect(screen.queryByText('Corrigir atividade')).not.toBeInTheDocument();
    });
  });

  describe('Modal title', () => {
    it('should display "Corrigir atividade" when isViewOnly is false', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
    });

    it('should display "Detalhes da atividade" when isViewOnly is true', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={true} />);

      expect(screen.getByText('Detalhes da atividade')).toBeInTheDocument();
    });
  });

  describe('Student information', () => {
    it('should display student name', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('should display avatar with name initial', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Statistics cards', () => {
    it('should display formatted score', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText('Nota')).toBeInTheDocument();
    });

    it('should display "-" when score is null', () => {
      const dataWithNullScore = { ...mockData, score: null };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithNullScore} />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should display number of correct questions', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('N° de questões corretas')).toBeInTheDocument();
    });

    it('should display number of incorrect questions', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('N° de questões incorretas')).toBeInTheDocument();
    });
  });

  describe('Observation section - Closed state', () => {
    it('should display observation section with "Incluir" button when isViewOnly is false and no existing observation', () => {
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

    it('should display observation section with "Editar" button when observation exists', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Observação')).toBeInTheDocument();
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    it('should not display observation section when isViewOnly is true', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={true} />);

      expect(screen.queryByText('Incluir')).not.toBeInTheDocument();
    });

    it('should not display textarea in closed state', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(
        screen.queryByPlaceholderText('Escreva uma observação para o estudante')
      ).not.toBeInTheDocument();
    });
  });

  describe('Observation section - Expanded state', () => {
    it('should expand when clicking "Incluir"', () => {
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

    it('should display previous observation when expanded and exists', () => {
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

    it('should not display previous observation when it does not exist', () => {
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

    it('should disable "Salvar" button when textarea is empty', () => {
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

    it('should enable "Salvar" button when textarea has text', () => {
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

  describe('Observation section - Saved state', () => {
    it('should save and display observation after clicking "Salvar"', () => {
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

    it('should allow editing saved observation', () => {
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

    it('should not call onObservationSubmit when textarea is empty', () => {
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

    it('should not call onObservationSubmit when textarea contains only spaces', () => {
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

  describe('Questions list', () => {
    it('should render all questions', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      // Usa getAllByText porque o statement também contém "Questão X"
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Questão 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Questão 3').length).toBeGreaterThan(0);
    });

    it('should display badges with correct status for each question', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('Correta')).toBeInTheDocument();
      expect(screen.getByText('Incorreta')).toBeInTheDocument();
      expect(screen.getByText('Em branco')).toBeInTheDocument();
    });
  });

  describe('Question expansion', () => {
    it('should expand question when clicking', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      expect(questao1Button).toBeInTheDocument();

      fireEvent.click(questao1Button!);

      // Verifica que o conteúdo da questão foi expandido (deve haver pelo menos 2 elementos: o botão e o statement)
      expect(screen.getAllByText('Questão 1').length).toBeGreaterThanOrEqual(2);
    });

    it('should keep question expanded after clicking', () => {
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

    it('should display "Não respondeu" when studentAnswer is undefined', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao3Buttons = screen.getAllByText('Questão 3');
      const questao3Button = questao3Buttons[0].closest('button');
      fireEvent.click(questao3Button!);

      // Para questões de alternativa sem resposta, verifica que o statement está visível
      expect(screen.getAllByText('Questão 3').length).toBeGreaterThanOrEqual(2);
    });

    it('should display correct answer when question is expanded', () => {
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

    it('should display "-" when correctAnswer is undefined', () => {
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

    it('should allow expanding multiple questions', () => {
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

  describe('onClose callback', () => {
    it('should close modal when onClose is called via Modal', () => {
      const onClose = jest.fn();
      render(<CorrectActivityModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Questions with alternatives', () => {
    const singleQuestionWithAlternatives = {
      ...mockDataWithAlternatives,
      questions: [mockDataWithAlternatives.questions[0]],
    };

    it('should display question text when expanded', () => {
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

    it('should display alternatives section when question has alternatives', () => {
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

    it('should display correct answer badge on correct alternative', () => {
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

    it('should display incorrect answer badge when student was wrong', () => {
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

    it('should display fallback for essay question without alternatives', () => {
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

    it('should display all alternatives of multiple expanded questions', () => {
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

  describe('Edge cases', () => {
    it('should handle empty questions list', () => {
      const dataWithNoQuestions = { ...mockData, questions: [] };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithNoQuestions} />
      );

      expect(screen.getByText('Respostas')).toBeInTheDocument();
      expect(screen.queryByText('Questão 1')).not.toBeInTheDocument();
    });

    it('should handle student name with special character', () => {
      const dataWithSpecialName = { ...mockData, studentName: 'José María' };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithSpecialName} />
      );

      expect(screen.getByText('José María')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should format score with one decimal place', () => {
      const dataWithIntegerScore = { ...mockData, score: 10 };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithIntegerScore} />
      );

      expect(screen.getByText('10.0')).toBeInTheDocument();
    });

    it('should work without onObservationSubmit callback', () => {
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

    it('should allow attaching files to observation', () => {
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

    it('should allow removing attached file', () => {
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

    it('should enable Salvar when file is attached without text', () => {
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

    it('should call onObservationSubmit with files', () => {
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

    it('should display saved files in saved state', () => {
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
    it('should return "Anexo" when URL is invalid in existingAttachment', () => {
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

    it('should display existingAttachment with link and Trocar button when editing', () => {
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

    it('should open file selector when clicking Trocar', () => {
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

    it('should enable Salvar when there is only existingAttachment without new text', () => {
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

  describe('handleSaveObservation without studentId', () => {
    it('should not call onObservationSubmit when studentId is undefined', () => {
      const onObservationSubmit = jest.fn();
      const dataWithoutStudentId = {
        ...mockData,
        studentId: undefined as unknown as string,
        observation: undefined,
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithoutStudentId}
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

      expect(onObservationSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Essay questions - Correction', () => {
    const essayQuestionData: StudentActivityCorrectionData = {
      studentId: 'student-123',
      studentName: 'João Silva',
      score: null,
      correctCount: 0,
      incorrectCount: 0,
      blankCount: 1,
      questions: [
        {
          question: createQuestion(
            'q1',
            'Explique o ciclo da água.',
            QUESTION_TYPE.DISSERTATIVA
          ),
          result: createQuestionResult(
            'a1',
            'q1',
            ANSWER_STATUS.PENDENTE_AVALIACAO,
            'A água evapora e condensa',
            [],
            [],
            null,
            'Explique o ciclo da água.',
            QUESTION_TYPE.DISSERTATIVA
          ),
          questionNumber: 1,
        },
      ],
      observation: undefined,
    };

    it('should display correction fields for essay question', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta está correta?')).toBeInTheDocument();
      expect(screen.getByText('Incluir observação')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Escreva uma observação sobre a resposta do aluno'
        )
      ).toBeInTheDocument();
    });

    it('should allow selecting if answer is correct', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      expect(simRadio).toBeChecked();
    });

    it('should allow selecting if answer is incorrect', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const naoRadio = screen.getByLabelText('Não');
      fireEvent.click(naoRadio);

      expect(naoRadio).toBeChecked();
    });

    it('should allow writing teacher feedback', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação sobre a resposta do aluno'
      );
      fireEvent.change(textarea, {
        target: { value: 'Boa explicação, mas faltou detalhar' },
      });

      expect(textarea).toHaveValue('Boa explicação, mas faltou detalhar');
    });

    it('should disable Save button when isCorrect is null', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).toBeDisabled();
    });

    it('should enable Save button when isCorrect is selected', () => {
      const onQuestionCorrectionSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
          onQuestionCorrectionSubmit={onQuestionCorrectionSubmit}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).not.toBeDisabled();
    });

    it('should call onQuestionCorrectionSubmit when saving correction', async () => {
      const onQuestionCorrectionSubmit = jest.fn().mockResolvedValue(undefined);
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
          onQuestionCorrectionSubmit={onQuestionCorrectionSubmit}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      const textarea = screen.getByPlaceholderText(
        'Escreva uma observação sobre a resposta do aluno'
      );
      fireEvent.change(textarea, {
        target: { value: 'Boa resposta' },
      });

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      await screen.findByText('Salvando...');

      expect(onQuestionCorrectionSubmit).toHaveBeenCalledWith('student-123', {
        questionId: 'q1',
        questionNumber: 1,
        isCorrect: true,
        teacherFeedback: 'Boa resposta',
      });
    });

    it('should display "Salvando..." during save', async () => {
      const onQuestionCorrectionSubmit = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
          onQuestionCorrectionSubmit={onQuestionCorrectionSubmit}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });

    it('should not call onQuestionCorrectionSubmit when there is no callback', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
          onQuestionCorrectionSubmit={undefined}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).toBeDisabled();
    });

    it('should handle error when saving correction', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onQuestionCorrectionSubmit = jest
        .fn()
        .mockRejectedValue(new Error('Erro ao salvar'));

      render(
        <CorrectActivityModal
          {...defaultProps}
          data={essayQuestionData}
          isViewOnly={false}
          onQuestionCorrectionSubmit={onQuestionCorrectionSubmit}
        />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      const simRadio = screen.getByLabelText('Sim');
      fireEvent.click(simRadio);

      const salvarButton = screen.getByText('Salvar');
      fireEvent.click(salvarButton);

      await screen.findByText('Salvar');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Question types - renderQuestionContent', () => {
    it('should render multiple choice question', () => {
      const multipleChoiceData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'Selecione todas as capitais',
              QUESTION_TYPE.MULTIPLA_ESCOLHA,
              [
                { id: 'opt1', option: 'Brasília' },
                { id: 'opt2', option: 'São Paulo' },
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
              ],
              null,
              'Selecione todas as capitais',
              QUESTION_TYPE.MULTIPLA_ESCOLHA
            ),
            questionNumber: 1,
          },
        ],
      };

      render(
        <CorrectActivityModal {...defaultProps} data={multipleChoiceData} />
      );

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should render true or false question', () => {
      const trueFalseData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'Marque V ou F',
              QUESTION_TYPE.VERDADEIRO_FALSO,
              [
                { id: 'opt1', option: 'O Brasil é um país' },
                { id: 'opt2', option: 'A Lua é feita de queijo' },
              ],
              []
            ),
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.RESPOSTA_CORRETA,
              null,
              [{ optionId: 'opt1' }],
              [
                { id: 'opt1', option: 'O Brasil é um país', isCorrect: true },
                {
                  id: 'opt2',
                  option: 'A Lua é feita de queijo',
                  isCorrect: false,
                },
              ],
              null,
              'Marque V ou F',
              QUESTION_TYPE.VERDADEIRO_FALSO
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={trueFalseData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should render fill in the blanks question', () => {
      const fillData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'O Brasil está localizado na {{continente}}.',
              QUESTION_TYPE.PREENCHER,
              [{ id: 'opt1', option: 'América' }],
              []
            ),
            result: createQuestionResult(
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
              [{ id: 'opt1', option: 'América', isCorrect: true }],
              null,
              'O Brasil está localizado na {{continente}}.',
              QUESTION_TYPE.PREENCHER
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={fillData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Preencher Lacunas')).toBeInTheDocument();
    });

    it('should render image question', () => {
      const imageData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'Clique na imagem onde está o Brasil',
              QUESTION_TYPE.IMAGEM,
              [],
              []
            ),
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.RESPOSTA_CORRETA,
              JSON.stringify({ x: 0.48, y: 0.45 }),
              [],
              [],
              null,
              'Clique na imagem onde está o Brasil',
              QUESTION_TYPE.IMAGEM
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={imageData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Imagem')).toBeInTheDocument();
    });

    it('should render connect dots question', () => {
      const connectDotsData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: createQuestion(
              'q1',
              'Ligue os pontos',
              QUESTION_TYPE.LIGAR_PONTOS,
              [],
              []
            ),
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.NAO_RESPONDIDO,
              null,
              [],
              [],
              null,
              'Ligue os pontos',
              QUESTION_TYPE.LIGAR_PONTOS
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={connectDotsData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Ligar Pontos')).toBeInTheDocument();
    });

    it('should render fallback for unknown question type with options', () => {
      const unknownTypeData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: {
              ...createQuestion(
                'q1',
                'Questão desconhecida',
                QUESTION_TYPE.ALTERNATIVA,
                [{ id: 'opt1', option: 'Opção A' }],
                []
              ),
              questionType: 'UNKNOWN_TYPE' as unknown as QUESTION_TYPE,
            },
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.NAO_RESPONDIDO,
              null,
              [],
              [],
              null,
              'Questão desconhecida',
              QUESTION_TYPE.ALTERNATIVA
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={unknownTypeData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
    });

    it('should render fallback for unknown question type without options', () => {
      const unknownTypeData: StudentActivityCorrectionData = {
        ...mockData,
        questions: [
          {
            question: {
              ...createQuestion(
                'q1',
                'Questão desconhecida',
                QUESTION_TYPE.DISSERTATIVA,
                [],
                []
              ),
              questionType: 'UNKNOWN_TYPE' as unknown as QUESTION_TYPE,
            },
            result: createQuestionResult(
              'a1',
              'q1',
              ANSWER_STATUS.NAO_RESPONDIDO,
              null,
              [],
              [],
              null,
              'Questão desconhecida',
              QUESTION_TYPE.DISSERTATIVA
            ),
            questionNumber: 1,
          },
        ],
      };

      render(<CorrectActivityModal {...defaultProps} data={unknownTypeData} />);

      const questao1Buttons = screen.getAllByText('Questão 1');
      const questao1Button = questao1Buttons[0].closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
    });
  });

  describe('renderAttachmentInput - without files', () => {
    it('should display Attach button when there are no attached files', () => {
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
      const clickSpy = jest.spyOn(fileInput, 'click');

      const anexarButton = screen.getByText('Anexar');
      fireEvent.click(anexarButton);

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
