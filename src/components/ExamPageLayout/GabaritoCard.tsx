import styled, { createGlobalStyle } from 'styled-components';

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
export const PrintStyles = createGlobalStyle`
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
  }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;

  @media print {
    padding: 0;
    margin: 0;
    background: white;
    display: block;
  }
`;

export const CardContainer = styled.div`
  background: white;
  width: 210mm;
  height: 297mm;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #d1d5db;
  padding: 24px;
  font-size: 11px;
  line-height: 1.3;
  font-family: Arial, Helvetica, sans-serif;
  color: #000000;
  position: relative;
  box-sizing: border-box;
  page-break-after: always;
  page-break-inside: avoid;
  margin-bottom: 24px;

  &:last-child {
    page-break-after: auto;
    margin-bottom: 0;
  }

  @media print {
    box-shadow: none;
    border: none;
    padding: 12mm;
    margin: 0;
    width: 210mm;
    height: 297mm;
  }
`;

const HeaderBar = styled.div`
  background: #000000;
  color: white;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0;
`;

const SubHeader = styled.div`
  padding: 4px 12px;
  font-size: 10px;
  color: #374151;
  border-left: 1px solid #9ca3af;
  border-right: 1px solid #9ca3af;
`;

const InfoBox = styled.div`
  border: 1px solid #9ca3af;
  margin-top: 4px;
`;

const InfoRow = styled.div<{ withBorder?: boolean }>`
  display: flex;
  ${(props) => props.withBorder && 'border-top: 1px solid #9ca3af;'}
`;

const InfoField = styled.div<{ flex?: number; withBorder?: boolean }>`
  flex: ${(props) => props.flex || 1};
  padding: 6px;
  ${(props) => props.withBorder && 'border-right: 1px solid #9ca3af;'}

  .label {
    font-weight: 700;
    font-size: 9px;
  }

  .content {
    height: 20px;
    margin-top: 2px;
  }
`;

const SmallInfoField = styled.div`
  width: 144px;
  padding: 6px;
  display: flex;
  align-items: flex-start;

  .label {
    font-weight: 700;
    font-size: 9px;
  }
`;

const ForeignLanguageBox = styled.div`
  width: 160px;
  border-right: 1px solid #9ca3af;
  padding: 8px;

  .title {
    font-weight: 700;
    font-size: 9px;
    text-align: center;
    margin-bottom: 4px;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    margin-top: 4px;
  }

  .checkbox {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #6b7280;
    display: inline-block;
  }
`;

const ProctorBox = styled.div`
  flex: 1;
  padding: 8px;

  .title {
    font-weight: 700;
    font-size: 9px;
    text-align: center;
    margin-bottom: 4px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    font-size: 10px;
    margin-top: 4px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .checkbox {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #6b7280;
    display: inline-block;
  }
`;

const SignatureBox = styled.div`
  border: 1px solid #9ca3af;
  border-top: 0;
  padding: 8px;
  text-align: center;

  .title {
    font-weight: 700;
    font-size: 9px;
    margin-bottom: 8px;
  }

  .line {
    border-bottom: 1px solid #9ca3af;
    margin: 16px 32px 0 32px;
  }
`;

const InstructionsBox = styled.div`
  border: 1px solid #9ca3af;
  border-top: 0;
  padding: 8px;

  .title {
    font-weight: 700;
    font-size: 10px;
    text-align: center;
    margin-bottom: 4px;
  }

  .text {
    font-size: 9px;
    padding: 0 4px;

    p {
      margin: 2px 0;
    }
  }
`;

const TranscriptionBox = styled.div`
  border: 1px solid #9ca3af;
  border-top: 0;
  padding: 8px;

  .title {
    font-weight: 700;
    font-size: 9px;
    text-align: center;
  }

  .line {
    border-bottom: 1px solid #9ca3af;
    margin: 20px 16px 0 16px;

    &:nth-child(3) {
      margin-top: 16px;
    }
  }
`;

const ExampleSection = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 4px;
  gap: 12px;
`;

const ExampleText = styled.div`
  flex: 1;

  .title {
    font-weight: 700;
    font-size: 10px;
    margin-bottom: 4px;
  }

  p {
    font-size: 9px;
    margin: 2px 0;

    strong {
      font-weight: 700;
    }
  }
`;

const ExampleBox = styled.div`
  width: 224px;
  border: 1px solid #9ca3af;
  padding: 6px;

  .title {
    font-weight: 700;
    font-size: 9px;
    margin-bottom: 4px;
  }
`;

const ExampleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  margin-bottom: 2px;

  .numero {
    font-weight: 700;
    margin-left: 4px;
  }
`;

const ExampleBubble = styled.span<{ filled?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: 700;
  background: ${(props) => (props.filled ? '#000000' : 'white')};
  color: ${(props) => (props.filled ? 'white' : '#6b7280')};
`;

const GridContainer = styled.div`
  margin-top: 8px;
  border: 1px solid #9ca3af;
`;

const GridHeader = styled.div`
  display: flex;
  background: #e5e7eb;
  border-bottom: 1px solid #9ca3af;
`;

const GridHeaderCell = styled.div<{ withBorder?: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 8px;
  font-weight: 700;
  padding: 4px 0;
  ${(props) => props.withBorder && 'border-right: 1px solid #9ca3af;'}
`;

const GridRow = styled.div<{ withBorder?: boolean }>`
  display: flex;
  ${(props) => props.withBorder && 'border-bottom: 1px solid #e5e7eb;'}
`;

const GridCell = styled.div<{ withBorder?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 6px 4px;
  ${(props) => props.withBorder && 'border-right: 1px solid #9ca3af;'}

  .numero {
    width: 20px;
    text-align: right;
    font-size: 9px;
    font-weight: 500;
    margin-right: 8px;
  }

  .bubbles {
    display: flex;
    gap: 1px;
  }

  .empty {
    color: #d1d5db;
    margin-left: 24px;
  }
`;

const AnswerBubble = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #9ca3af;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #9ca3af;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  position: absolute;
  bottom: 20px;
  right: 20px;

  @media print {
    bottom: 12px;
    right: 12px;
  }
`;

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
      <HeaderBar>
        <span>&#9632;</span>
        <span>CARTAO-RESPOSTA</span>
      </HeaderBar>
      <SubHeader>{examTitle || 'Simulado Analytica 2026'}</SubHeader>

      {/* Nome / Info do Aluno */}
      <InfoBox>
        <InfoRow>
          <InfoField flex={3} withBorder>
            <div className="label">NOME COMPLETO:</div>
            <div className="content">{studentName}</div>
          </InfoField>
          <SmallInfoField>
            <div className="label">INFORMACOES DO ALUNO</div>
          </SmallInfoField>
        </InfoRow>
        <InfoRow withBorder>
          <InfoField>
            <div className="label">ESCOLA E TURMA:</div>
            <div className="content">
              {schoolName && className
                ? `${schoolName} - ${className}`
                : schoolName || className || ''}
            </div>
          </InfoField>
        </InfoRow>
      </InfoBox>

      {/* Lingua Estrangeira / Fiscal */}
      <InfoBox style={{ borderTop: '0' }}>
        <InfoRow>
          <ForeignLanguageBox>
            <div className="title">LINGUA ESTRANGEIRA</div>
            <div className="option">
              <span className="checkbox" />
              <span>INGLES</span>
            </div>
            <div className="option">
              <span className="checkbox" />
              <span>ESPANHOL</span>
            </div>
          </ForeignLanguageBox>
          <ProctorBox>
            <div className="title">PARA USO EXCLUSIVO DO FISCAL DE SALA</div>
            <div className="item">
              <span>PARTICIPANTE AUSENTE</span>
              <div className="checkbox-group">
                <span>SIM</span>
                <span className="checkbox" />
              </div>
            </div>
            <div className="item">
              <span>
                PARTICIPANTE PRESENTE DEIXOU O CARTAO-RESPOSTA EM BRANCO
              </span>
              <div className="checkbox-group">
                <span>SIM</span>
                <span className="checkbox" />
              </div>
            </div>
          </ProctorBox>
        </InfoRow>
      </InfoBox>

      {/* Assinatura */}
      <SignatureBox>
        <div className="title">ASSINATURA DO PARTICIPANTE</div>
        <div className="line" />
      </SignatureBox>

      {/* Instrucoes */}
      <InstructionsBox>
        <div className="title">INSTRUCOES</div>
        <div className="text">
          <p>
            1. Verifique se seu nome completo e os dados impressos neste
            CARTAO-RESPOSTA estao corretos. Assine somente no local apropriado.
          </p>
          <p>
            2. O CARTAO-RESPOSTA e o unico documento para correcao eletronica.
            Nao o amasse, rasque, dobre ou rasure. Nao havera substituicao por
            erro do participante.
          </p>
          <p>
            3. Em nenhuma hipotese voce podera levar o CARTAO-RESPOSTA ao deixar
            a sala de provas, sob pena de eliminacao no exame.
          </p>
          <p>
            4. Preencha suas respostas nos campos apropriados conforme o EXEMPLO
            DE PREENCHIMENTO. O preenchimento incorreto impossibilita a leitura
            otica.
          </p>
          <p>
            5. Entregue este CARTAO-RESPOSTA ao aplicador ao termino da
            realizacao do exame.
          </p>
        </div>
      </InstructionsBox>

      {/* Transcreva frase */}
      <TranscriptionBox>
        <div className="title">
          TRANSCREVA AQUI A FRASE APRESENTADA NA CAPA DE SEU CADERNO DE
          QUESTOES, CONFORME AS INSTRUCOES NELA CONTIDAS.
        </div>
        <div className="line" />
        <div className="line" />
      </TranscriptionBox>

      {/* Exemplo de preenchimento */}
      <ExampleSection>
        <ExampleText>
          <div className="title">EXEMPLO DE PREENCHIMENTO</div>
          <p>
            Preencha os circulos completamente, conforme a imagem ao lado,
            utilizando
          </p>
          <p>
            <strong>
              caneta esferografica de tinta preta, fabricada em material
              transparente.
            </strong>
          </p>
          <p>
            Nao sera permitido o uso de lapis, lapiseira (grafite) e borracha.
          </p>
        </ExampleText>
        <ExampleBox>
          <div className="title">Exemplo de resposta</div>
          {[
            { q: 1, label: 'A', answer: 'A' },
            { q: 2, label: 'B', answer: 'B' },
            { q: 3, label: 'C', answer: 'C' },
          ].map(({ q, label, answer }) => (
            <ExampleRow key={q}>
              <span>Resposta da questao X = {label} -&gt;</span>
              <span className="numero">{String(q).padStart(2, '0')}</span>
              {OPTIONS.map((opt) => (
                <ExampleBubble key={opt} filled={opt === answer}>
                  {opt}
                </ExampleBubble>
              ))}
            </ExampleRow>
          ))}
        </ExampleBox>
      </ExampleSection>

      {/* Grid de Questoes */}
      <GridContainer>
        {/* Header */}
        <GridHeader>
          {Array.from({ length: NUM_COLUMNS }, (_, i) => (
            <GridHeaderCell key={i} withBorder={i < NUM_COLUMNS - 1}>
              Questao / Resposta
            </GridHeaderCell>
          ))}
        </GridHeader>

        {/* Rows */}
        {Array.from({ length: ROWS_PER_COLUMN }, (_, rowIdx) => (
          <GridRow key={rowIdx} withBorder={rowIdx < ROWS_PER_COLUMN - 1}>
            {Array.from({ length: NUM_COLUMNS }, (_, colIdx) => {
              const questionNum = getQuestionNumber(colIdx, rowIdx);

              return (
                <GridCell key={colIdx} withBorder={colIdx < NUM_COLUMNS - 1}>
                  {questionNum === null ? (
                    <span className="empty">-</span>
                  ) : (
                    <>
                      <span className="numero">{questionNum}</span>
                      <div className="bubbles">
                        {OPTIONS.map((opt) => (
                          <AnswerBubble key={opt}>{opt}</AnswerBubble>
                        ))}
                      </div>
                    </>
                  )}
                </GridCell>
              );
            })}
          </GridRow>
        ))}
      </GridContainer>

      {/* QR Code */}
      {qrCodeDataUrl && <QRCodeImage src={qrCodeDataUrl} alt="QR Code" />}
    </>
  );
}

export default AnswerSheetCard;
