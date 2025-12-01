import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CorrectActivityModal from './CorrectActivityModal';
import { QUESTION_STATUS } from '../../types/studentActivityCorrection';
import type { StudentActivityCorrectionData } from '../../types/studentActivityCorrection';

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
        questionNumber: 1,
        status: QUESTION_STATUS.CORRETA,
        studentAnswer: 'Opção A',
        correctAnswer: 'Opção A',
      },
      {
        questionNumber: 2,
        status: QUESTION_STATUS.INCORRETA,
        studentAnswer: 'Opção B',
        correctAnswer: 'Opção C',
      },
      {
        questionNumber: 3,
        status: QUESTION_STATUS.EM_BRANCO,
        studentAnswer: undefined,
        correctAnswer: 'Opção D',
      },
    ],
    observation: 'Observação anterior do professor',
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

  describe('Seção de observação', () => {
    it('deve exibir a seção de observação quando isViewOnly é false', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Observações')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Adicionar observação...')
      ).toBeInTheDocument();
    });

    it('não deve exibir a seção de observação quando isViewOnly é true', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={true} />);

      expect(screen.queryByText('Observações')).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('Adicionar observação...')
      ).not.toBeInTheDocument();
    });

    it('deve exibir observação anterior quando existe', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Observação anterior:')).toBeInTheDocument();
      expect(
        screen.getByText('Observação anterior do professor')
      ).toBeInTheDocument();
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

      expect(
        screen.queryByText('Observação anterior:')
      ).not.toBeInTheDocument();
    });

    it('deve chamar onObservationSubmit quando botão Incluir é clicado com texto', () => {
      const onObservationSubmit = jest.fn();
      render(
        <CorrectActivityModal
          {...defaultProps}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const textarea = screen.getByPlaceholderText('Adicionar observação...');
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(onObservationSubmit).toHaveBeenCalledWith('Nova observação');
    });

    it('não deve chamar onObservationSubmit quando textarea está vazio', () => {
      const onObservationSubmit = jest.fn();
      render(
        <CorrectActivityModal
          {...defaultProps}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(onObservationSubmit).not.toHaveBeenCalled();
    });

    it('não deve chamar onObservationSubmit quando textarea contém apenas espaços', () => {
      const onObservationSubmit = jest.fn();
      render(
        <CorrectActivityModal
          {...defaultProps}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const textarea = screen.getByPlaceholderText('Adicionar observação...');
      fireEvent.change(textarea, { target: { value: '   ' } });

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(onObservationSubmit).not.toHaveBeenCalled();
    });

    it('deve limpar o textarea após submeter observação', () => {
      const onObservationSubmit = jest.fn();
      render(
        <CorrectActivityModal
          {...defaultProps}
          isViewOnly={false}
          onObservationSubmit={onObservationSubmit}
        />
      );

      const textarea = screen.getByPlaceholderText('Adicionar observação...');
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(textarea).toHaveValue('');
    });
  });

  describe('Lista de questões', () => {
    it('deve renderizar todas as questões', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
      expect(screen.getByText('Questão 2')).toBeInTheDocument();
      expect(screen.getByText('Questão 3')).toBeInTheDocument();
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

      const questao1Button = screen.getByText('Questão 1').closest('button');
      expect(questao1Button).toBeInTheDocument();

      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Resposta correta:')).toBeInTheDocument();
      // Both student answer and correct answer are "Opção A" for question 1
      const opcaoAElements = screen.getAllByText('Opção A');
      expect(opcaoAElements.length).toBe(2);
    });

    it('deve colapsar questão ao clicar novamente', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao1Button = screen.getByText('Questão 1').closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();

      fireEvent.click(questao1Button!);

      expect(screen.queryByText('Resposta do aluno:')).not.toBeInTheDocument();
    });

    it('deve exibir "Não respondeu" quando studentAnswer é undefined', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao3Button = screen.getByText('Questão 3').closest('button');
      fireEvent.click(questao3Button!);

      expect(screen.getByText('Não respondeu')).toBeInTheDocument();
    });

    it('deve exibir resposta correta quando questão está expandida', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao2Button = screen.getByText('Questão 2').closest('button');
      fireEvent.click(questao2Button!);

      expect(screen.getByText('Resposta correta:')).toBeInTheDocument();
      expect(screen.getByText('Opção C')).toBeInTheDocument();
    });

    it('deve exibir "-" quando correctAnswer é undefined', () => {
      const dataWithNoCorrectAnswer = {
        ...mockData,
        questions: [
          {
            questionNumber: 1,
            status: QUESTION_STATUS.EM_BRANCO,
            studentAnswer: undefined,
            correctAnswer: undefined,
          },
        ],
      };
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={dataWithNoCorrectAnswer}
        />
      );

      const questao1Button = screen.getByText('Questão 1').closest('button');
      fireEvent.click(questao1Button!);

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('deve permitir expandir múltiplas questões', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao1Button = screen.getByText('Questão 1').closest('button');
      const questao2Button = screen.getByText('Questão 2').closest('button');

      fireEvent.click(questao1Button!);
      fireEvent.click(questao2Button!);

      const respostaAlunoLabels = screen.getAllByText('Resposta do aluno:');
      expect(respostaAlunoLabels.length).toBe(2);
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

  describe('Casos de borda', () => {
    it('deve lidar com lista de questões vazia', () => {
      const dataWithNoQuestions = { ...mockData, questions: [] };
      render(
        <CorrectActivityModal {...defaultProps} data={dataWithNoQuestions} />
      );

      expect(screen.getByText('Questões')).toBeInTheDocument();
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
      render(
        <CorrectActivityModal
          {...defaultProps}
          isViewOnly={false}
          onObservationSubmit={undefined}
        />
      );

      const textarea = screen.getByPlaceholderText('Adicionar observação...');
      fireEvent.change(textarea, { target: { value: 'Nova observação' } });

      const incluirButton = screen.getByText('Incluir');
      expect(() => fireEvent.click(incluirButton)).not.toThrow();
    });
  });
});
