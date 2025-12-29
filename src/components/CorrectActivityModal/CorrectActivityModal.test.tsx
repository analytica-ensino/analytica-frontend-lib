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

  const mockDataWithAlternatives: StudentActivityCorrectionData = {
    studentId: 'student-456',
    studentName: 'Maria Santos',
    score: 7.5,
    correctCount: 3,
    incorrectCount: 1,
    blankCount: 1,
    questions: [
      {
        questionNumber: 1,
        status: QUESTION_STATUS.CORRETA,
        studentAnswer: 'A',
        correctAnswer: 'A',
        questionText: 'Qual é a capital do Brasil?',
        alternatives: [
          { value: 'A', label: 'Brasília', isCorrect: true },
          { value: 'B', label: 'São Paulo', isCorrect: false },
          { value: 'C', label: 'Rio de Janeiro', isCorrect: false },
          { value: 'D', label: 'Salvador', isCorrect: false },
        ],
      },
      {
        questionNumber: 2,
        status: QUESTION_STATUS.INCORRETA,
        studentAnswer: 'B',
        correctAnswer: 'C',
        questionText: 'Qual o maior planeta do sistema solar?',
        alternatives: [
          { value: 'A', label: 'Terra', isCorrect: false },
          { value: 'B', label: 'Marte', isCorrect: false },
          { value: 'C', label: 'Júpiter', isCorrect: true },
          { value: 'D', label: 'Saturno', isCorrect: false },
        ],
      },
      {
        questionNumber: 3,
        status: QUESTION_STATUS.EM_BRANCO,
        studentAnswer: undefined,
        correctAnswer: 'Resposta dissertativa esperada',
        questionText: 'Explique o ciclo da água.',
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
    it('deve exibir seção de observação com botão "Incluir" quando isViewOnly é false', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      expect(screen.getByText('Observação')).toBeInTheDocument();
      expect(screen.getByText('Incluir')).toBeInTheDocument();
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
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(
        screen.getByPlaceholderText('Escreva uma observação para o estudante')
      ).toBeInTheDocument();
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });

    it('deve exibir observação anterior quando expandido e existe', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

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

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      expect(
        screen.queryByText('Observação anterior:')
      ).not.toBeInTheDocument();
    });

    it('deve desabilitar botão "Salvar" quando textarea está vazio', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

      const incluirButton = screen.getByText('Incluir');
      fireEvent.click(incluirButton);

      const salvarButton = screen.getByText('Salvar');
      expect(salvarButton).toBeDisabled();
    });

    it('deve habilitar botão "Salvar" quando textarea tem texto', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
      render(
        <CorrectActivityModal
          {...defaultProps}
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
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
      render(
        <CorrectActivityModal
          {...defaultProps}
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
      render(
        <CorrectActivityModal
          {...defaultProps}
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

      const respostaAlunoLabels = screen.getAllByText('Resposta do aluno:');
      expect(respostaAlunoLabels.length).toBeGreaterThan(0);
      const respostaCorretaLabels = screen.getAllByText('Resposta correta:');
      expect(respostaCorretaLabels.length).toBeGreaterThan(0);
    });

    it('deve manter questão expandida após clicar', () => {
      const singleQuestionData = {
        ...mockData,
        questions: [mockData.questions[0]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={singleQuestionData} />
      );

      const questao1Button = screen.getByText('Questão 1').closest('button');
      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();

      fireEvent.click(questao1Button!);

      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
    });

    it('deve exibir "Não respondeu" quando studentAnswer é undefined', () => {
      render(<CorrectActivityModal {...defaultProps} />);

      const questao3Button = screen.getByText('Questão 3').closest('button');
      fireEvent.click(questao3Button!);

      expect(screen.getByText('Não respondeu')).toBeInTheDocument();
    });

    it('deve exibir resposta correta quando questão está expandida', () => {
      const singleQuestionData = {
        ...mockData,
        questions: [mockData.questions[1]],
      };
      render(
        <CorrectActivityModal {...defaultProps} data={singleQuestionData} />
      );

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
      expect(respostaAlunoLabels.length).toBeGreaterThanOrEqual(2);
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

      const questao1Button = screen.getByText('Questão 1').closest('button');
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

      const questao1Button = screen.getByText('Questão 1').closest('button');
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

      const questao1Button = screen.getByText('Questão 1').closest('button');
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

      const questao2Button = screen.getByText('Questão 2').closest('button');
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

      const questao3Button = screen.getByText('Questão 3').closest('button');
      fireEvent.click(questao3Button!);

      expect(screen.getByText('Explique o ciclo da água.')).toBeInTheDocument();
      expect(screen.getByText('Resposta do aluno:')).toBeInTheDocument();
      expect(screen.getByText('Não respondeu')).toBeInTheDocument();
      expect(screen.getByText('Resposta correta:')).toBeInTheDocument();
      expect(
        screen.getByText('Resposta dissertativa esperada')
      ).toBeInTheDocument();
    });

    it('deve exibir todas alternativas de múltiplas questões expandidas', () => {
      render(
        <CorrectActivityModal
          {...defaultProps}
          data={mockDataWithAlternatives}
        />
      );

      const questao1Button = screen.getByText('Questão 1').closest('button');
      const questao2Button = screen.getByText('Questão 2').closest('button');
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
      render(
        <CorrectActivityModal
          {...defaultProps}
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
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
      render(
        <CorrectActivityModal
          {...defaultProps}
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
        'Observação com arquivo',
        [file]
      );
    });

    it('deve exibir arquivos salvos no estado salvo', () => {
      render(<CorrectActivityModal {...defaultProps} isViewOnly={false} />);

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
});
