import React, { forwardRef, useRef, useCallback } from 'react';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import LatexRenderer from '../LatexRenderer/LatexRenderer';
import type { PreviewQuestion } from '../ActivityPreview/ActivityPreview';

interface QuestionsPdfGeneratorProps {
  questions: PreviewQuestion[];
  onPrint?: () => void;
  onPrintError?: (error: Error) => void;
  /**
   * Optional render prop to access the handlePrint function.
   * If not provided, the component will render the hidden PDF content only.
   * Consumers can use the hook directly (useQuestionsPdfPrint) for more control.
   */
  children?: (handlePrint: () => void) => React.ReactNode;
}

/**
 * Component that renders questions in a format suitable for PDF printing
 * This component is hidden from view and only used for printing
 */
export const QuestionsPdfContent = forwardRef<
  HTMLDivElement,
  { questions: PreviewQuestion[] }
>(({ questions }, ref) => {
  const getLetterByIndex = (index: number): string => {
    return String.fromCodePoint(97 + index);
  };

  const renderAlternative = (question: PreviewQuestion) => {
    if (!question.question?.options || question.question.options.length === 0) {
      return null;
    }

    return (
      <ol
        type="a"
        style={{
          marginTop: '12px',
          marginBottom: '12px',
          paddingLeft: '24px',
        }}
      >
        {question.question.options.map((option) => (
          <li
            key={option.id}
            style={{
              marginBottom: '8px',
              lineHeight: '1.6',
            }}
          >
            <LatexRenderer content={option.option} />
          </li>
        ))}
      </ol>
    );
  };

  const renderMultipleChoice = (question: PreviewQuestion) => {
    if (!question.question?.options || question.question.options.length === 0) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: '12px',
          marginBottom: '12px',
        }}
      >
        {question.question.options.map((option, index) => {
          const letter = getLetterByIndex(index);
          return (
            <div
              key={option.id}
              style={{
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: '1.6',
              }}
            >
              <span
                style={{
                  marginTop: '2px',
                  minWidth: '20px',
                  fontSize: '16px',
                }}
              >
                ☐
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  marginRight: '4px',
                }}
              >
                {letter})
              </span>
              <div style={{ flex: 1 }}>
                <LatexRenderer content={option.option} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDissertative = () => {
    return (
      <div
        style={{
          marginTop: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontWeight: 'bold',
              marginTop: '2px',
            }}
          >
            R:
          </span>
          <div
            style={{
              minHeight: '150px',
              flex: 1,
            }}
          />
        </div>
      </div>
    );
  };

  const renderTrueOrFalse = (question: PreviewQuestion) => {
    if (!question.question?.options || question.question.options.length === 0) {
      return null;
    }

    return (
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        {question.question.options.map((option, index) => (
          <div
            key={option.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontWeight: 'bold',
                minWidth: '20px',
              }}
            >
              {getLetterByIndex(index)})
            </span>
            <div style={{ flex: 1 }}>
              <LatexRenderer content={option.option} />
            </div>
            <span
              style={{
                marginLeft: '8px',
                whiteSpace: 'nowrap',
                fontSize: '14px',
              }}
            >
              ( ) V ( ) F
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestionTypeContent = (question: PreviewQuestion) => {
    type RenderFunction = (
      question: PreviewQuestion
    ) => ReturnType<typeof renderAlternative> | null;

    const renderMap: Record<QUESTION_TYPE, RenderFunction> = {
      [QUESTION_TYPE.ALTERNATIVA]: renderAlternative,
      [QUESTION_TYPE.MULTIPLA_ESCOLHA]: renderMultipleChoice,
      [QUESTION_TYPE.DISSERTATIVA]: () => renderDissertative(),
      [QUESTION_TYPE.VERDADEIRO_FALSO]: renderTrueOrFalse,
      [QUESTION_TYPE.LIGAR_PONTOS]: () => null,
      [QUESTION_TYPE.PREENCHER]: () => null,
      [QUESTION_TYPE.IMAGEM]: () => null,
    };

    if (!question.questionType) {
      return null;
    }

    const renderFunction = renderMap[question.questionType];
    return renderFunction ? renderFunction(question) : null;
  };

  const renderQuestionContent = (question: PreviewQuestion, index: number) => {
    const questionNumber = index + 1;

    return (
      <div
        key={question.id}
        style={{
          marginBottom: '32px',
          pageBreakInside: 'avoid',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#000',
          }}
        >
          Questão {questionNumber}
        </h3>

        {question.enunciado && (
          <div
            style={{
              marginBottom: '12px',
              lineHeight: '1.6',
              color: '#000',
            }}
          >
            <LatexRenderer content={question.enunciado} />
          </div>
        )}

        {renderQuestionTypeContent(question)}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="questions-pdf-container"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '210mm',
        minHeight: '297mm',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <style>
        {`
            @media print {
              @page {
                margin: 20mm;
                size: A4;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              .questions-pdf-container {
                position: static !important;
                left: auto !important;
                top: auto !important;
                visibility: visible !important;
                pointer-events: auto !important;
                z-index: auto !important;
                padding: 0;
                margin: 0;
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #000;
                width: auto;
                min-height: auto;
              }
              
              .questions-pdf-container h3 {
                page-break-after: avoid;
              }
              
              .questions-pdf-container > div {
                page-break-inside: avoid;
              }
            }
          `}
      </style>
      <div style={{ padding: '20px' }}>
        {questions.map((question, index) =>
          renderQuestionContent(question, index)
        )}
      </div>
    </div>
  );
});

QuestionsPdfContent.displayName = 'QuestionsPdfContent';

/**
 * Collects relevant CSS styles from document stylesheets
 */
const collectRelevantStyles = (): string[] => {
  const styles: string[] = [];
  const styleSheets = Array.from(document.styleSheets);

  styleSheets.forEach((styleSheet) => {
    try {
      const cssRules = styleSheet.cssRules || [];
      Array.from(cssRules).forEach((rule) => {
        const ruleText = rule.cssText;
        if (ruleText.includes('katex') || ruleText.includes('questions-pdf')) {
          styles.push(ruleText);
        }
      });
    } catch (error) {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('Could not access stylesheet (likely CORS):', error);
      }
    }
  });

  return styles;
};

/**
 * Generates the HTML content for the print window
 *
 * Security note: contentHTML is already sanitized via DOMPurify in LatexRenderer
 * before reaching this function, so it's safe to inject into the template string.
 *
 * CSP note: This function loads KaTeX CSS from CDN. Ensure your Content Security Policy
 * allows: style-src 'self' https://cdn.jsdelivr.net;
 * Or consider serving KaTeX CSS locally for stricter CSP compliance.
 */
const generatePrintHTML = (contentHTML: string, styles: string[]): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Questões</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css">
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
          }
          
          .questions-pdf-container {
            position: static !important;
            visibility: visible !important;
            pointer-events: auto !important;
            z-index: auto !important;
            left: auto !important;
            top: auto !important;
            width: auto !important;
            min-height: auto !important;
            padding: 0;
            margin: 0;
          }
          
          .questions-pdf-container h3 {
            page-break-after: avoid;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #000;
          }
          
          .questions-pdf-container > div {
            page-break-inside: avoid;
          }
          
          ol {
            margin-top: 12px;
            margin-bottom: 12px;
            padding-left: 24px;
          }
          
          li {
            margin-bottom: 8px;
            line-height: 1.6;
          }
          
          ${styles.join('\n')}
        </style>
      </head>
      <body>
        <div class="questions-pdf-container">
          ${contentHTML}
        </div>
      </body>
    </html>
  `;
};

/**
 * Sets up the print window onload handler with improved timing and cleanup
 */
const setupPrintWindowHandler = (printWindow: Window): void => {
  printWindow.onload = () => {
    const printAndCleanup = () => {
      try {
        printWindow.print();
      } finally {
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      }
    };

    const fonts = printWindow.document.fonts;
    if (fonts && 'ready' in fonts) {
      fonts.ready
        .then(() => {
          setTimeout(printAndCleanup, 100);
        })
        .catch(() => {
          setTimeout(printAndCleanup, 500);
        });
    } else {
      setTimeout(printAndCleanup, 500);
    }
  };
};

/**
 * Hook to generate PDF from questions using native browser print API
 * Returns the content ref and print handler
 *
 * Security: Content is sanitized via DOMPurify in LatexRenderer before rendering.
 * CSP: Ensure your Content Security Policy allows loading KaTeX CSS from cdn.jsdelivr.net
 * or serve KaTeX CSS locally for stricter CSP compliance.
 */
export const useQuestionsPdfPrint = (
  questions: PreviewQuestion[],
  onPrint?: () => void,
  onPrintError?: (error: Error) => void
) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    try {
      onPrint?.();

      if (!contentRef.current) {
        throw new Error('Elemento de PDF não encontrado no DOM');
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error(
          'Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão bloqueados.'
        );
      }
      printWindow.opener = null;

      const contentHTML = contentRef.current.innerHTML;
      const styles = collectRelevantStyles();
      const htmlContent = generatePrintHTML(contentHTML, styles);

      const doc = printWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setupPrintWindowHandler(printWindow);
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      onPrintError?.(errorObj);
      console.error('Erro ao gerar PDF:', errorObj);
    }
  }, [onPrint, onPrintError]);

  return {
    contentRef,
    handlePrint,
  };
};

/**
 * QuestionsPdfGenerator Component
 *
 * Isolated and reusable component for generating PDFs of questions without answers.
 * Formats questions for school printing with specific layouts for each question type.
 *
 * This component renders hidden content and optionally exposes handlePrint via render prop.
 * For more control, consumers can use the hook directly (useQuestionsPdfPrint).
 *
 * @param questions - Array of questions to render in PDF
 * @param onPrint - Optional callback when print is triggered
 * @param onPrintError - Optional callback when print error occurs
 * @param children - Optional render prop function that receives handlePrint
 * @returns Component with hidden PDF content and optionally rendered children
 *
 * @example
 * // Without render prop (hidden content only)
 * <QuestionsPdfGenerator questions={questions} />
 *
 * @example
 * // With render prop (expose handlePrint)
 * <QuestionsPdfGenerator questions={questions}>
 *   {(handlePrint) => <button onClick={handlePrint}>Print</button>}
 * </QuestionsPdfGenerator>
 */
export const QuestionsPdfGenerator = ({
  questions,
  onPrint,
  onPrintError,
  children,
}: QuestionsPdfGeneratorProps) => {
  const { contentRef, handlePrint } = useQuestionsPdfPrint(
    questions,
    onPrint,
    onPrintError
  );

  return (
    <>
      {children?.(handlePrint)}
      <div style={{ display: 'none' }}>
        <QuestionsPdfContent ref={contentRef} questions={questions} />
      </div>
    </>
  );
};

export type { QuestionsPdfGeneratorProps };
