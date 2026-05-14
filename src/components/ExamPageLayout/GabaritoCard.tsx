import type { CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface AnswerSheetCardProps {
  studentName: string;
  qrCodeDataUrl: string;
  totalQuestions: number;
  examTitle?: string;
  schoolName?: string;
  className?: string;
}

/**
 * Global print styles to remove browser headers/footers (URL, date, title)
 * and ensure full-page printing
 */
export function PrintStyles() {
  return (
    <style>
      {`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .gabarito-page-container {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
          }
          .gabarito-card-container {
            box-shadow: none !important;
            border: none !important;
            padding: 12mm !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          .gabarito-card-container:last-child {
            page-break-after: auto !important;
            margin-bottom: 0 !important;
          }
          .gabarito-qr-code {
            bottom: 12px !important;
            right: 12px !important;
          }
        }
      `}
    </style>
  );
}

const pageContainerStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#f3f4f6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 0',
};

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="gabarito-page-container" style={pageContainerStyle}>
      {children}
    </div>
  );
}

const cardContainerStyle: CSSProperties = {
  background: 'white',
  width: '210mm',
  height: '297mm',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #d1d5db',
  padding: '24px',
  fontSize: '11px',
  lineHeight: 1.3,
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
  position: 'relative',
  boxSizing: 'border-box',
  pageBreakAfter: 'always',
  pageBreakInside: 'avoid',
  marginBottom: '24px',
};

export const CardContainer = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="gabarito-card-container" style={cardContainerStyle}>
        {children}
      </div>
    );
  }
);

CardContainer.displayName = 'CardContainer';

// Styles objects for inline styling
const styles = {
  headerBar: {
    background: '#000000',
    color: 'white',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: 0,
  } as CSSProperties,

  subHeader: {
    padding: '4px 12px',
    fontSize: '10px',
    color: '#374151',
    borderLeft: '1px solid #9ca3af',
    borderRight: '1px solid #9ca3af',
  } as CSSProperties,

  infoBox: {
    border: '1px solid #9ca3af',
    marginTop: '4px',
  } as CSSProperties,

  infoRow: {
    display: 'flex',
  } as CSSProperties,

  infoRowWithBorder: {
    display: 'flex',
    borderTop: '1px solid #9ca3af',
  } as CSSProperties,

  infoField: {
    flex: 1,
    padding: '6px',
  } as CSSProperties,

  infoFieldLabel: {
    fontWeight: 700,
    fontSize: '9px',
  } as CSSProperties,

  infoFieldContent: {
    height: '20px',
    marginTop: '2px',
  } as CSSProperties,

  smallInfoField: {
    width: '144px',
    padding: '6px',
    display: 'flex',
    alignItems: 'flex-start',
  } as CSSProperties,

  foreignLanguageBox: {
    width: '160px',
    borderRight: '1px solid #9ca3af',
    padding: '8px',
  } as CSSProperties,

  foreignLanguageTitle: {
    fontWeight: 700,
    fontSize: '9px',
    textAlign: 'center' as const,
    marginBottom: '4px',
  } as CSSProperties,

  foreignLanguageOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '8px',
    marginTop: '4px',
  } as CSSProperties,

  checkbox: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid #6b7280',
    display: 'inline-block',
  } as CSSProperties,

  proctorBox: {
    flex: 1,
    padding: '8px',
  } as CSSProperties,

  proctorTitle: {
    fontWeight: 700,
    fontSize: '9px',
    textAlign: 'center' as const,
    marginBottom: '4px',
  } as CSSProperties,

  proctorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px',
    fontSize: '10px',
    marginTop: '4px',
  } as CSSProperties,

  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as CSSProperties,

  signatureBox: {
    border: '1px solid #9ca3af',
    borderTop: 0,
    padding: '8px',
    textAlign: 'center' as const,
  } as CSSProperties,

  signatureTitle: {
    fontWeight: 700,
    fontSize: '9px',
    marginBottom: '8px',
  } as CSSProperties,

  signatureLine: {
    borderBottom: '1px solid #9ca3af',
    margin: '16px 32px 0 32px',
  } as CSSProperties,

  instructionsBox: {
    border: '1px solid #9ca3af',
    borderTop: 0,
    padding: '8px',
  } as CSSProperties,

  instructionsTitle: {
    fontWeight: 700,
    fontSize: '10px',
    textAlign: 'center' as const,
    marginBottom: '4px',
  } as CSSProperties,

  instructionsText: {
    fontSize: '9px',
    padding: '0 4px',
  } as CSSProperties,

  instructionsParagraph: {
    margin: '2px 0',
  } as CSSProperties,

  transcriptionBox: {
    border: '1px solid #9ca3af',
    borderTop: 0,
    padding: '8px',
  } as CSSProperties,

  transcriptionTitle: {
    fontWeight: 700,
    fontSize: '9px',
    textAlign: 'center' as const,
  } as CSSProperties,

  transcriptionLine: {
    borderBottom: '1px solid #9ca3af',
    margin: '20px 16px 0 16px',
  } as CSSProperties,

  transcriptionLineSecond: {
    borderBottom: '1px solid #9ca3af',
    margin: '16px 16px 0 16px',
  } as CSSProperties,

  exampleSection: {
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0 4px',
    gap: '12px',
  } as CSSProperties,

  exampleText: {
    flex: 1,
  } as CSSProperties,

  exampleTextTitle: {
    fontWeight: 700,
    fontSize: '10px',
    marginBottom: '4px',
  } as CSSProperties,

  exampleTextParagraph: {
    fontSize: '9px',
    margin: '2px 0',
  } as CSSProperties,

  exampleBox: {
    width: '224px',
    border: '1px solid #9ca3af',
    padding: '6px',
  } as CSSProperties,

  exampleBoxTitle: {
    fontWeight: 700,
    fontSize: '9px',
    marginBottom: '4px',
  } as CSSProperties,

  exampleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9px',
    marginBottom: '2px',
  } as CSSProperties,

  exampleRowNumero: {
    fontWeight: 700,
    marginLeft: '4px',
  } as CSSProperties,

  exampleBubble: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid #6b7280',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7px',
    fontWeight: 700,
    background: 'white',
    color: '#6b7280',
  } as CSSProperties,

  exampleBubbleFilled: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid #6b7280',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7px',
    fontWeight: 700,
    background: '#000000',
    color: 'white',
  } as CSSProperties,

  gridContainer: {
    marginTop: '8px',
    border: '1px solid #9ca3af',
  } as CSSProperties,

  gridHeader: {
    display: 'flex',
    background: '#e5e7eb',
    borderBottom: '1px solid #9ca3af',
  } as CSSProperties,

  gridHeaderCell: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: '8px',
    fontWeight: 700,
    padding: '4px 0',
  } as CSSProperties,

  gridHeaderCellWithBorder: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: '8px',
    fontWeight: 700,
    padding: '4px 0',
    borderRight: '1px solid #9ca3af',
  } as CSSProperties,

  gridRow: {
    display: 'flex',
  } as CSSProperties,

  gridRowWithBorder: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
  } as CSSProperties,

  gridCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '6px 4px',
  } as CSSProperties,

  gridCellWithBorder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '6px 4px',
    borderRight: '1px solid #9ca3af',
  } as CSSProperties,

  gridCellNumero: {
    width: '20px',
    textAlign: 'right' as const,
    fontSize: '9px',
    fontWeight: 500,
    marginRight: '8px',
  } as CSSProperties,

  gridCellBubbles: {
    display: 'flex',
    gap: '1px',
  } as CSSProperties,

  gridCellEmpty: {
    color: '#d1d5db',
    marginLeft: '24px',
  } as CSSProperties,

  answerBubble: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '1px solid #9ca3af',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    color: '#9ca3af',
  } as CSSProperties,

  qrCodeImage: {
    width: '180px',
    height: '180px',
    position: 'absolute' as const,
    bottom: '20px',
    right: '20px',
  } as CSSProperties,
};

const OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const NUM_COLUMNS = 5;
const ROWS_PER_COLUMN = 10;

/**
 * Shared AnswerSheetCard component for rendering answer sheet content
 * Used by both AnswerSheetPreview (single) and AnswerSheetsBatchPreview (batch)
 * NOTE: This component renders just the inner content - wrap it with CardContainer
 */
export function AnswerSheetCard({
  studentName,
  qrCodeDataUrl,
  totalQuestions,
  examTitle,
  schoolName,
  className,
}: Readonly<AnswerSheetCardProps>) {
  const getQuestionNumber = (colIdx: number, rowIdx: number): number | null => {
    const questionNum = colIdx * ROWS_PER_COLUMN + rowIdx + 1;
    return questionNum <= totalQuestions ? questionNum : null;
  };

  return (
    <>
      {/* Header */}
      <div style={styles.headerBar}>
        <span>&#9632;</span>
        <span>CARTAO-RESPOSTA</span>
      </div>
      <div style={styles.subHeader}>{examTitle || 'Simulado Analytica 2026'}</div>

      {/* Nome / Info do Aluno */}
      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <div style={{ ...styles.infoField, flex: 3, borderRight: '1px solid #9ca3af' }}>
            <div style={styles.infoFieldLabel}>NOME COMPLETO:</div>
            <div style={styles.infoFieldContent}>{studentName}</div>
          </div>
          <div style={styles.smallInfoField}>
            <div style={styles.infoFieldLabel}>INFORMACOES DO ALUNO</div>
          </div>
        </div>
        <div style={styles.infoRowWithBorder}>
          <div style={styles.infoField}>
            <div style={styles.infoFieldLabel}>ESCOLA E TURMA:</div>
            <div style={styles.infoFieldContent}>
              {schoolName && className
                ? `${schoolName} - ${className}`
                : schoolName || className || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Lingua Estrangeira / Fiscal */}
      <div style={{ ...styles.infoBox, borderTop: 0 }}>
        <div style={styles.infoRow}>
          <div style={styles.foreignLanguageBox}>
            <div style={styles.foreignLanguageTitle}>LINGUA ESTRANGEIRA</div>
            <div style={styles.foreignLanguageOption}>
              <span style={styles.checkbox} />
              <span>INGLES</span>
            </div>
            <div style={styles.foreignLanguageOption}>
              <span style={styles.checkbox} />
              <span>ESPANHOL</span>
            </div>
          </div>
          <div style={styles.proctorBox}>
            <div style={styles.proctorTitle}>PARA USO EXCLUSIVO DO FISCAL DE SALA</div>
            <div style={styles.proctorItem}>
              <span>PARTICIPANTE AUSENTE</span>
              <div style={styles.checkboxGroup}>
                <span>SIM</span>
                <span style={styles.checkbox} />
              </div>
            </div>
            <div style={styles.proctorItem}>
              <span>PARTICIPANTE PRESENTE DEIXOU O CARTAO-RESPOSTA EM BRANCO</span>
              <div style={styles.checkboxGroup}>
                <span>SIM</span>
                <span style={styles.checkbox} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assinatura */}
      <div style={styles.signatureBox}>
        <div style={styles.signatureTitle}>ASSINATURA DO PARTICIPANTE</div>
        <div style={styles.signatureLine} />
      </div>

      {/* Instrucoes */}
      <div style={styles.instructionsBox}>
        <div style={styles.instructionsTitle}>INSTRUCOES</div>
        <div style={styles.instructionsText}>
          <p style={styles.instructionsParagraph}>
            1. Verifique se seu nome completo e os dados impressos neste
            CARTAO-RESPOSTA estao corretos. Assine somente no local apropriado.
          </p>
          <p style={styles.instructionsParagraph}>
            2. O CARTAO-RESPOSTA e o unico documento para correcao eletronica.
            Nao o amasse, rasque, dobre ou rasure. Nao havera substituicao por
            erro do participante.
          </p>
          <p style={styles.instructionsParagraph}>
            3. Em nenhuma hipotese voce podera levar o CARTAO-RESPOSTA ao deixar
            a sala de provas, sob pena de eliminacao no exame.
          </p>
          <p style={styles.instructionsParagraph}>
            4. Preencha suas respostas nos campos apropriados conforme o EXEMPLO
            DE PREENCHIMENTO. O preenchimento incorreto impossibilita a leitura
            otica.
          </p>
          <p style={styles.instructionsParagraph}>
            5. Entregue este CARTAO-RESPOSTA ao aplicador ao termino da
            realizacao do exame.
          </p>
        </div>
      </div>

      {/* Transcreva frase */}
      <div style={styles.transcriptionBox}>
        <div style={styles.transcriptionTitle}>
          TRANSCREVA AQUI A FRASE APRESENTADA NA CAPA DE SEU CADERNO DE
          QUESTOES, CONFORME AS INSTRUCOES NELA CONTIDAS.
        </div>
        <div style={styles.transcriptionLine} />
        <div style={styles.transcriptionLineSecond} />
      </div>

      {/* Exemplo de preenchimento */}
      <div style={styles.exampleSection}>
        <div style={styles.exampleText}>
          <div style={styles.exampleTextTitle}>EXEMPLO DE PREENCHIMENTO</div>
          <p style={styles.exampleTextParagraph}>
            Preencha os circulos completamente, conforme a imagem ao lado,
            utilizando
          </p>
          <p style={styles.exampleTextParagraph}>
            <strong>
              caneta esferografica de tinta preta, fabricada em material
              transparente.
            </strong>
          </p>
          <p style={styles.exampleTextParagraph}>
            Nao sera permitido o uso de lapis, lapiseira (grafite) e borracha.
          </p>
        </div>
        <div style={styles.exampleBox}>
          <div style={styles.exampleBoxTitle}>Exemplo de resposta</div>
          {[
            { q: 1, label: 'A', answer: 'A' },
            { q: 2, label: 'B', answer: 'B' },
            { q: 3, label: 'C', answer: 'C' },
          ].map(({ q, label, answer }) => (
            <div key={q} style={styles.exampleRow}>
              <span>Resposta da questao X = {label} -&gt;</span>
              <span style={styles.exampleRowNumero}>{String(q).padStart(2, '0')}</span>
              {OPTIONS.map((opt) => (
                <span
                  key={opt}
                  style={opt === answer ? styles.exampleBubbleFilled : styles.exampleBubble}
                >
                  {opt}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Questoes */}
      <div style={styles.gridContainer}>
        {/* Header */}
        <div style={styles.gridHeader}>
          {Array.from({ length: NUM_COLUMNS }, (_, i) => (
            <div
              key={i}
              style={i < NUM_COLUMNS - 1 ? styles.gridHeaderCellWithBorder : styles.gridHeaderCell}
            >
              Questao / Resposta
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: ROWS_PER_COLUMN }, (_, rowIdx) => (
          <div
            key={rowIdx}
            style={rowIdx < ROWS_PER_COLUMN - 1 ? styles.gridRowWithBorder : styles.gridRow}
          >
            {Array.from({ length: NUM_COLUMNS }, (_, colIdx) => {
              const questionNum = getQuestionNumber(colIdx, rowIdx);

              return (
                <div
                  key={colIdx}
                  style={colIdx < NUM_COLUMNS - 1 ? styles.gridCellWithBorder : styles.gridCell}
                >
                  {questionNum === null ? (
                    <span style={styles.gridCellEmpty}>-</span>
                  ) : (
                    <>
                      <span style={styles.gridCellNumero}>{questionNum}</span>
                      <div style={styles.gridCellBubbles}>
                        {OPTIONS.map((opt) => (
                          <span key={opt} style={styles.answerBubble}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* QR Code */}
      {qrCodeDataUrl && (
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className="gabarito-qr-code"
          style={styles.qrCodeImage}
        />
      )}
    </>
  );
}

export default AnswerSheetCard;
