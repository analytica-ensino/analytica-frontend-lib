import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  QuestionsPdfContent,
  useQuestionsPdfPrint,
  QuestionsPdfGenerator,
} from './QuestionsPdfGenerator';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { PreviewQuestion } from '../ActivityPreview/ActivityPreview';

// Mock LatexRenderer
jest.mock('../LatexRenderer/LatexRenderer', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <span data-testid="latex-renderer">{content}</span>
  ),
}));

// Mock window.open and window.print
const mockPrintWindow = {
  document: {
    open: jest.fn(),
    write: jest.fn(),
    close: jest.fn(),
  },
  print: jest.fn(),
  close: jest.fn(),
  onload: null as (() => void) | null,
};

const mockWindowOpen = jest.fn(() => mockPrintWindow as unknown as Window);

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.window.open = mockWindowOpen;
  globalThis.window.print = jest.fn();
  mockPrintWindow.onload = null;

  // Mock document.styleSheets to prevent errors in test environment
  Object.defineProperty(document, 'styleSheets', {
    value: [],
    writable: true,
    configurable: true,
  });
});

describe('QuestionsPdfContent', () => {
  const baseQuestion: PreviewQuestion = {
    id: 'q1',
    enunciado: 'Qual é a resposta?',
    questionType: QUESTION_TYPE.ALTERNATIVA,
  };

  it('renders question with number and enunciado', () => {
    const { container } = render(
      <QuestionsPdfContent questions={[baseQuestion]} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(screen.getByTestId('latex-renderer')).toHaveTextContent(
      'Qual é a resposta?'
    );
  });

  it('renders multiple questions with correct numbering', () => {
    const questions: PreviewQuestion[] = [
      { ...baseQuestion, id: 'q1' },
      { ...baseQuestion, id: 'q2', enunciado: 'Segunda questão' },
    ];

    const { container } = render(<QuestionsPdfContent questions={questions} />);

    expect(container.textContent).toContain('Questão 1');
    expect(container.textContent).toContain('Questão 2');
    expect(screen.getAllByTestId('latex-renderer')).toHaveLength(2);
  });

  it('renders alternative question with ordered list', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.ALTERNATIVA,
      question: {
        options: [
          { id: 'a', option: 'Opção A' },
          { id: 'b', option: 'Opção B' },
          { id: 'c', option: 'Opção C' },
        ],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    const list = container.querySelector('ol');
    expect(list).toBeInTheDocument();
    expect(list?.tagName).toBe('OL');
    expect(list).toHaveAttribute('type', 'a');

    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Opção A');
    expect(items[1]).toHaveTextContent('Opção B');
    expect(items[2]).toHaveTextContent('Opção C');
  });

  it('renders multiple choice question with checkboxes', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
      question: {
        options: [
          { id: 'a', option: 'Opção A' },
          { id: 'b', option: 'Opção B' },
        ],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    const checkboxes = container.querySelectorAll('span');
    const checkboxElements = Array.from(checkboxes).filter((el) =>
      el.textContent?.includes('☐')
    );
    expect(checkboxElements.length).toBeGreaterThan(0);

    expect(container.textContent).toContain('a)');
    expect(container.textContent).toContain('b)');
    expect(checkboxElements).toHaveLength(2);
  });

  it('renders dissertative question with R: label and space', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.DISSERTATIVA,
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('R:');
    // Find the div that is a sibling of the R: span (the answer space)
    const rLabel = Array.from(container.querySelectorAll('span')).find(
      (span) => span.textContent === 'R:'
    );
    expect(rLabel).toBeTruthy();

    // The answer space should be in the same parent as R:
    const parent = rLabel?.parentElement;
    expect(parent).toBeTruthy();
    const answerSpace = parent?.querySelector('div[style*="flex: 1"]');
    expect(answerSpace).toBeTruthy();
  });

  it('renders true or false question with V/F options', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
      question: {
        options: [
          { id: 'a', option: 'Afirmação 1' },
          { id: 'b', option: 'Afirmação 2' },
        ],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('a)');
    expect(container.textContent).toContain('b)');
    const vfElements = container.querySelectorAll('span');
    const vfTexts = Array.from(vfElements).filter((el) =>
      el.textContent?.includes('( ) V ( ) F')
    );
    expect(vfTexts).toHaveLength(2);
    expect(container.textContent).toContain('Afirmação 1');
    expect(container.textContent).toContain('Afirmação 2');
  });

  it('does not render alternatives when question has no options', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.ALTERNATIVA,
      question: {
        options: [],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.querySelector('ol')).not.toBeInTheDocument();
  });

  it('does not render question type content when type is unknown', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: undefined,
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(container.querySelector('ol')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('R:');
  });

  it('renders LIGAR_PONTOS question type as null', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.LIGAR_PONTOS,
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(container.querySelector('ol')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('R:');
  });

  it('renders PREENCHER question type as null', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.PREENCHER,
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(container.querySelector('ol')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('R:');
  });

  it('renders IMAGEM question type as null', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.IMAGEM,
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(container.querySelector('ol')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('R:');
  });

  it('renders multiple choice question without options', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
      question: {
        options: [],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    const checkboxes = container.querySelectorAll('span');
    const checkboxElements = Array.from(checkboxes).filter((el) =>
      el.textContent?.includes('☐')
    );
    expect(checkboxElements).toHaveLength(0);
  });

  it('renders true or false question without options', () => {
    const question: PreviewQuestion = {
      ...baseQuestion,
      questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
      question: {
        options: [],
      },
    };

    const { container } = render(
      <QuestionsPdfContent questions={[question]} />
    );

    const vfElements = container.querySelectorAll('span');
    const vfTexts = Array.from(vfElements).filter((el) =>
      el.textContent?.includes('( ) V ( ) F')
    );
    expect(vfTexts).toHaveLength(0);
  });

  it('applies correct styles to container', () => {
    const { container } = render(
      <QuestionsPdfContent questions={[baseQuestion]} />
    );

    const pdfContainer = container.querySelector('.questions-pdf-container');
    expect(pdfContainer).toBeInTheDocument();
    expect(pdfContainer).toHaveStyle({
      position: 'fixed',
      visibility: 'hidden',
    });
  });

  it('renders empty array of questions', () => {
    const { container } = render(<QuestionsPdfContent questions={[]} />);

    expect(container.textContent).not.toContain('Questão');
  });
});

describe('useQuestionsPdfPrint', () => {
  const mockOnPrint = jest.fn();
  const mockOnPrintError = jest.fn();

  const createTestHook = (
    questions: PreviewQuestion[],
    onPrint?: () => void,
    onPrintError?: (error: Error) => void
  ) => {
    let result: ReturnType<typeof useQuestionsPdfPrint> | null = null;

    const TestComponent = () => {
      result = useQuestionsPdfPrint(questions, onPrint, onPrintError);
      return (
        <div ref={result.contentRef} data-testid="pdf-content">
          Content
        </div>
      );
    };

    render(<TestComponent />);
    return result!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns contentRef and handlePrint function', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    expect(result).toBeDefined();
    expect(result.contentRef).toBeDefined();
    expect(result.handlePrint).toBeDefined();
    expect(typeof result.handlePrint).toBe('function');
  });

  it('calls onPrint callback when handlePrint is called', () => {
    const result = createTestHook(
      [{ id: 'q1', enunciado: 'Test' }],
      mockOnPrint
    );

    result.handlePrint();

    expect(mockOnPrint).toHaveBeenCalledTimes(1);
  });

  it('opens print window and writes content', () => {
    const question: PreviewQuestion = {
      id: 'q1',
      enunciado: 'Test question',
      questionType: QUESTION_TYPE.ALTERNATIVA,
    };

    const result = createTestHook([question]);

    result.handlePrint();

    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWindow.document.open).toHaveBeenCalled();
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    expect(writtenContent).toContain('<title>Questões</title>');
    // The content will be in the HTML structure, check for the container
    expect(writtenContent).toContain('questions-pdf-container');
  });

  it('calls onPrintError when contentRef is null', () => {
    const TestComponentWithHook = () => {
      const result = useQuestionsPdfPrint(
        [{ id: 'q1', enunciado: 'Test' }],
        undefined,
        mockOnPrintError
      );
      result.handlePrint();
      return <div>Test</div>;
    };

    render(<TestComponentWithHook />);

    expect(mockOnPrintError).toHaveBeenCalled();
    expect(mockOnPrintError.mock.calls[0][0].message).toContain(
      'Elemento de PDF não encontrado'
    );
  });

  it('calls onPrintError when window.open returns null', () => {
    mockWindowOpen.mockReturnValueOnce(null as unknown as Window);

    const result = createTestHook(
      [{ id: 'q1', enunciado: 'Test' }],
      undefined,
      mockOnPrintError
    );

    result.handlePrint();

    expect(mockOnPrintError).toHaveBeenCalled();
    expect(mockOnPrintError.mock.calls[0][0].message).toContain(
      'Não foi possível abrir a janela de impressão'
    );
  });

  it('includes KaTeX CSS link in print window', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();

    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    expect(writtenContent).toContain('katex.min.css');
    expect(writtenContent).toContain('cdn.jsdelivr.net');
  });

  it('closes document after writing', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();

    expect(mockPrintWindow.document.close).toHaveBeenCalled();
  });

  it('calls doc.open() before doc.write()', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();

    expect(mockPrintWindow.document.open).toHaveBeenCalled();
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();

    // Verify order: open -> write -> close
    const openCallOrder =
      mockPrintWindow.document.open.mock.invocationCallOrder[0];
    const writeCallOrder =
      mockPrintWindow.document.write.mock.invocationCallOrder[0];
    const closeCallOrder =
      mockPrintWindow.document.close.mock.invocationCallOrder[0];

    expect(openCallOrder).toBeLessThan(writeCallOrder!);
    expect(writeCallOrder).toBeLessThan(closeCallOrder!);
  });

  it('includes all required CSS styles in print window', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();

    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    expect(writtenContent).toContain('@page');
    expect(writtenContent).toContain('margin: 20mm');
    expect(writtenContent).toContain('size: A4');
    expect(writtenContent).toContain('questions-pdf-container');
    expect(writtenContent).toContain('box-sizing: border-box');
  });

  it('handles document.styleSheets with CORS errors gracefully', () => {
    // Mock styleSheets that throws CORS error
    const mockStyleSheet = {
      cssRules: null, // This will cause an error when trying to access
    };
    Object.defineProperty(document, 'styleSheets', {
      value: [mockStyleSheet],
      writable: true,
      configurable: true,
    });

    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    // Should not throw error
    expect(() => result.handlePrint()).not.toThrow();
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
  });

  it('handles document.styleSheets with accessible rules', () => {
    const mockCSSRule = {
      cssText: 'katex { display: inline-block; }',
    };
    const mockStyleSheet = {
      cssRules: [mockCSSRule],
    };
    Object.defineProperty(document, 'styleSheets', {
      value: [mockStyleSheet],
      writable: true,
      configurable: true,
    });

    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();

    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    // Should include the katex style
    expect(writtenContent).toContain('katex');
  });

  it('handles empty document.styleSheets', () => {
    Object.defineProperty(document, 'styleSheets', {
      value: [],
      writable: true,
      configurable: true,
    });

    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    expect(() => result.handlePrint()).not.toThrow();
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
  });

  it('includes contentHTML in the generated HTML', () => {
    const question: PreviewQuestion = {
      id: 'q1',
      enunciado: 'Test question content',
      questionType: QUESTION_TYPE.ALTERNATIVA,
    };

    // Create a test component that uses QuestionsPdfContent
    let result: ReturnType<typeof useQuestionsPdfPrint> | null = null;
    const TestComponent = () => {
      result = useQuestionsPdfPrint([question]);
      return (
        <QuestionsPdfContent ref={result.contentRef} questions={[question]} />
      );
    };

    render(<TestComponent />);

    result!.handlePrint();

    const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
    // Should contain the question content (the enunciado will be rendered by LatexRenderer)
    expect(writtenContent).toContain('Test question content');
  });

  it('handles multiple calls to handlePrint', () => {
    const result = createTestHook([{ id: 'q1', enunciado: 'Test' }]);

    result.handlePrint();
    result.handlePrint();

    expect(mockPrintWindow.document.open).toHaveBeenCalledTimes(2);
    expect(mockPrintWindow.document.write).toHaveBeenCalledTimes(2);
    expect(mockPrintWindow.document.close).toHaveBeenCalledTimes(2);
  });
});

describe('QuestionsPdfGenerator', () => {
  const baseQuestions: PreviewQuestion[] = [
    {
      id: 'q1',
      enunciado: 'Test question',
      questionType: QUESTION_TYPE.ALTERNATIVA,
    },
  ];

  it('renders hidden QuestionsPdfContent', () => {
    const { container } = render(
      <QuestionsPdfGenerator questions={baseQuestions} />
    );

    const hiddenDiv = container.querySelector('div[style*="display: none"]');
    expect(hiddenDiv).toBeInTheDocument();

    const pdfContent = container.querySelector('.questions-pdf-container');
    expect(pdfContent).toBeInTheDocument();
  });

  it('exposes handlePrint via render prop', () => {
    const mockOnPrint = jest.fn();
    const { getByTestId } = render(
      <QuestionsPdfGenerator questions={baseQuestions} onPrint={mockOnPrint}>
        {(handlePrint) => (
          <button onClick={handlePrint} data-testid="print-button">
            Print PDF
          </button>
        )}
      </QuestionsPdfGenerator>
    );

    const printButton = getByTestId('print-button');
    expect(printButton).toBeInTheDocument();

    printButton.click();

    expect(mockOnPrint).toHaveBeenCalledTimes(1);
    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
  });

  it('works without render prop (backward compatibility)', () => {
    const { container } = render(
      <QuestionsPdfGenerator questions={baseQuestions} />
    );

    // Should still render the hidden content
    const hiddenDiv = container.querySelector('div[style*="display: none"]');
    expect(hiddenDiv).toBeInTheDocument();
  });

  it('passes questions to QuestionsPdfContent', () => {
    const { container } = render(
      <QuestionsPdfGenerator questions={baseQuestions} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(screen.getByTestId('latex-renderer')).toHaveTextContent(
      'Test question'
    );
  });

  it('calls onPrint callback when print is triggered via hook', () => {
    const mockOnPrint = jest.fn();
    const TestComponent = () => {
      const { contentRef, handlePrint } = useQuestionsPdfPrint(
        baseQuestions,
        mockOnPrint
      );
      return (
        <>
          <QuestionsPdfGenerator
            questions={baseQuestions}
            onPrint={mockOnPrint}
          />
          <button onClick={handlePrint} data-testid="print-button">
            Print
          </button>
          <div ref={contentRef} data-testid="content-ref" />
        </>
      );
    };

    render(<TestComponent />);

    const printButton = screen.getByTestId('print-button');
    printButton.click();

    expect(mockOnPrint).toHaveBeenCalled();
  });

  it('calls onPrintError callback on error', () => {
    const mockOnPrintError = jest.fn();
    mockWindowOpen.mockReturnValueOnce(null as unknown as Window);

    const TestComponent = () => {
      const { contentRef, handlePrint } = useQuestionsPdfPrint(
        baseQuestions,
        undefined,
        mockOnPrintError
      );
      return (
        <>
          <QuestionsPdfGenerator
            questions={baseQuestions}
            onPrintError={mockOnPrintError}
          />
          <button onClick={handlePrint} data-testid="print-button">
            Print
          </button>
          <div ref={contentRef} data-testid="content-ref" />
        </>
      );
    };

    render(<TestComponent />);

    const printButton = screen.getByTestId('print-button');
    printButton.click();

    expect(mockOnPrintError).toHaveBeenCalled();
  });

  it('renders with empty questions array', () => {
    const { container } = render(<QuestionsPdfGenerator questions={[]} />);

    expect(container.textContent).not.toContain('Questão');
  });

  it('renders all question types correctly', () => {
    const allTypesQuestions: PreviewQuestion[] = [
      {
        id: 'q1',
        enunciado: 'Alternativa',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        question: {
          options: [{ id: 'a', option: 'Opção A' }],
        },
      },
      {
        id: 'q2',
        enunciado: 'Múltipla escolha',
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        question: {
          options: [{ id: 'a', option: 'Opção A' }],
        },
      },
      {
        id: 'q3',
        enunciado: 'Dissertativa',
        questionType: QUESTION_TYPE.DISSERTATIVA,
      },
      {
        id: 'q4',
        enunciado: 'Verdadeiro ou Falso',
        questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
        question: {
          options: [{ id: 'a', option: 'Afirmação' }],
        },
      },
    ];

    const { container } = render(
      <QuestionsPdfGenerator questions={allTypesQuestions} />
    );

    expect(container.textContent).toContain('Questão 1');
    expect(container.textContent).toContain('Questão 2');
    expect(container.textContent).toContain('Questão 3');
    expect(container.textContent).toContain('Questão 4');

    expect(container.querySelector('ol')).toBeInTheDocument(); // Alternativa
    expect(container.textContent).toContain('☐'); // Múltipla escolha
    expect(container.textContent).toContain('R:'); // Dissertativa
    expect(container.textContent).toContain('( ) V ( ) F'); // V/F
  });
});
