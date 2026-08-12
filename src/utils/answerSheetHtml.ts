import type { AnswerSheetStudentData } from '../types/answerSheet';
import { escapeHtml } from './escapeHtml';

const OPCOES = ['A', 'B', 'C', 'D', 'E'];
const NUM_COLUNAS = 5;
const LINHAS_POR_COLUNA = 10;

/**
 * Builds the CARTÃO-RESPOSTA (answer sheet) as a standalone page fragment.
 *
 * Uses only inline styles — TailwindCSS is not available in the print window,
 * and the fragment is also appended to documents rendered by the lib, which
 * carries its own stylesheet.
 *
 * @param data - Student and activity data including qrCodeUrl
 * @param qrCodeDataUrl - Base64 DataURL of the QR code image
 * @returns HTML fragment with a single printable page
 */
export function buildAnswerSheetPage(
  data: AnswerSheetStudentData,
  qrCodeDataUrl: string
): string {
  const { student, activity } = data;
  const totalQuestoes = activity.totalQuestoes;
  // Assembled by concatenation and rendered in a print window: anything from
  // the API has to be neutralised before it lands in the markup.
  const safeStudentName = escapeHtml(student.name);
  const safeActivityTitle = escapeHtml(activity.title);
  const safeSchoolClass = escapeHtml(data.schoolClass);

  // Build question grid HTML rows
  let gridRows = '';
  for (let rowIdx = 0; rowIdx < LINHAS_POR_COLUNA; rowIdx++) {
    const isLastRow = rowIdx === LINHAS_POR_COLUNA - 1;
    let cells = '';
    for (let colIdx = 0; colIdx < NUM_COLUNAS; colIdx++) {
      const questaoNum = colIdx * LINHAS_POR_COLUNA + rowIdx + 1;
      const isLastCol = colIdx === NUM_COLUNAS - 1;
      const cellBorderRight = isLastCol
        ? ''
        : 'border-right: 1px solid #9ca3af;';

      let cellContent: string;
      if (questaoNum <= totalQuestoes) {
        const bubbles = OPCOES.map(
          (opt) =>
            `<span style="width:18px;height:18px;border-radius:50%;border:1px solid #9ca3af;display:inline-flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af;print-color-adjust:exact;-webkit-print-color-adjust:exact;">${opt}</span>`
        ).join('');
        cellContent = `
          <span style="width:20px;text-align:right;font-size:9px;font-weight:500;margin-right:8px;">${questaoNum}</span>
          <div style="display:flex;gap:1px;">${bubbles}</div>
        `;
      } else {
        cellContent = `<span style="color:#d1d5db;margin-left:24px;">—</span>`;
      }

      cells += `<div style="flex:1;display:flex;align-items:center;padding:6px 4px;${cellBorderRight}">${cellContent}</div>`;
    }
    const rowBorder = isLastRow ? '' : 'border-bottom: 1px solid #e5e7eb;';
    gridRows += `<div style="display:flex;${rowBorder}">${cells}</div>`;
  }

  // Build exemplo rows
  const exemploData = [
    { q: 1, label: 'A', answer: 'A' },
    { q: 2, label: 'B', answer: 'B' },
    { q: 3, label: 'C', answer: 'C' },
  ];
  const exemploRows = exemploData
    .map(({ q, label, answer }) => {
      const bubbles = OPCOES.map((opt) => {
        const bg = opt === answer ? '#000000' : 'white';
        const color = opt === answer ? 'white' : '#6b7280';
        return `<span style="width:16px;height:16px;border-radius:50%;border:1px solid #6b7280;display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;background:${bg};color:${color};print-color-adjust:exact;-webkit-print-color-adjust:exact;">${opt}</span>`;
      }).join('');
      return `<div style="display:flex;align-items:center;gap:4px;font-size:9px;margin-bottom:2px;"><span>Resposta da questão X = ${label} →</span><span style="font-weight:700;margin-left:4px;">${String(q).padStart(2, '0')}</span>${bubbles}</div>`;
    })
    .join('');

  return `
  <div class="cartao" style="box-sizing:border-box;background:white;width:210mm;min-height:297mm;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);border:1px solid #d1d5db;padding:24px;font-size:11px;line-height:1.3;color:#000;position:relative;">

    <div style="background:#000;color:white;padding:6px 12px;display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;">
      <span>&#9632;</span>
      <span>CARTÃO-RESPOSTA</span>
    </div>

    <div style="padding:4px 12px;font-size:10px;color:#374151;border-left:1px solid #9ca3af;border-right:1px solid #9ca3af;">
      ${safeActivityTitle}
    </div>

    <div style="border:1px solid #9ca3af;margin-top:4px;">
      <div style="display:flex;">
        <div style="flex:3;padding:6px;border-right:1px solid #9ca3af;">
          <div style="font-weight:700;font-size:9px;">NOME COMPLETO:</div>
          <div style="height:20px;margin-top:2px;">${safeStudentName}</div>
        </div>
        <div style="width:144px;padding:6px;display:flex;align-items:flex-start;">
          <div style="font-weight:700;font-size:9px;">INFORMAÇÕES DO ALUNO</div>
        </div>
      </div>
      <div style="display:flex;border-top:1px solid #9ca3af;">
        <div style="flex:1;padding:6px;">
          <div style="font-weight:700;font-size:9px;">ESCOLA E TURMA:</div>
          <div style="height:20px;margin-top:2px;">${safeSchoolClass}</div>
        </div>
      </div>
    </div>

    <div style="border:1px solid #9ca3af;border-top:0;">
      <div style="display:flex;">
        <div style="width:160px;border-right:1px solid #9ca3af;padding:8px;">
          <div style="font-weight:700;font-size:9px;text-align:center;margin-bottom:4px;">LÍNGUA ESTRANGEIRA</div>
          <div style="display:flex;align-items:center;gap:6px;margin-left:8px;margin-top:4px;">
            <span style="width:12px;height:12px;border-radius:50%;border:1px solid #6b7280;display:inline-block;"></span>
            <span>INGLÊS</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-left:8px;margin-top:4px;">
            <span style="width:12px;height:12px;border-radius:50%;border:1px solid #6b7280;display:inline-block;"></span>
            <span>ESPANHOL</span>
          </div>
        </div>
        <div style="flex:1;padding:8px;">
          <div style="font-weight:700;font-size:9px;text-align:center;margin-bottom:4px;">PARA USO EXCLUSIVO DO FISCAL DE SALA</div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 8px;font-size:10px;margin-top:4px;">
            <span>PARTICIPANTE AUSENTE</span>
            <div style="display:flex;align-items:center;gap:4px;">
              <span>SIM</span>
              <span style="width:12px;height:12px;border-radius:50%;border:1px solid #6b7280;display:inline-block;"></span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 8px;font-size:10px;margin-top:4px;">
            <span>PARTICIPANTE PRESENTE DEIXOU O CARTÃO-RESPOSTA EM BRANCO</span>
            <div style="display:flex;align-items:center;gap:4px;">
              <span>SIM</span>
              <span style="width:12px;height:12px;border-radius:50%;border:1px solid #6b7280;display:inline-block;"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="border:1px solid #9ca3af;border-top:0;padding:8px;text-align:center;">
      <div style="font-weight:700;font-size:9px;margin-bottom:8px;">ASSINATURA DO PARTICIPANTE</div>
      <div style="border-bottom:1px solid #9ca3af;margin:16px 32px 0 32px;"></div>
    </div>

    <div style="border:1px solid #9ca3af;border-top:0;padding:8px;">
      <div style="font-weight:700;font-size:10px;text-align:center;margin-bottom:4px;">INSTRUÇÕES</div>
      <div style="font-size:9px;padding:0 4px;">
        <p style="margin:2px 0;">1. Verifique se seu nome completo e os dados impressos neste CARTÃO-RESPOSTA estão corretos. Assine somente no local apropriado.</p>
        <p style="margin:2px 0;">2. O CARTÃO-RESPOSTA é o único documento para correção eletrônica. Não o amasse, rasque, dobre ou rasure. Não haverá substituição por erro do participante.</p>
        <p style="margin:2px 0;">3. Em nenhuma hipótese você poderá levar o CARTÃO-RESPOSTA ao deixar a sala de provas, sob pena de eliminação no exame.</p>
        <p style="margin:2px 0;">4. Preencha suas respostas nos campos apropriados conforme o EXEMPLO DE PREENCHIMENTO. O preenchimento incorreto impossibilita a leitura ótica.</p>
        <p style="margin:2px 0;">5. Entregue este CARTÃO-RESPOSTA ao aplicador ao término da realização do exame.</p>
      </div>
    </div>

    <div style="border:1px solid #9ca3af;border-top:0;padding:8px;">
      <div style="font-weight:700;font-size:9px;text-align:center;">TRANSCREVA AQUI A FRASE APRESENTADA NA CAPA DE SEU CADERNO DE QUESTÕES, CONFORME AS INSTRUÇÕES NELA CONTIDAS.</div>
      <div style="border-bottom:1px solid #9ca3af;margin:20px 16px 0 16px;"></div>
      <div style="border-bottom:1px solid #9ca3af;margin:16px 16px 0 16px;"></div>
    </div>

    <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:flex-start;padding:0 4px;gap:12px;">
      <div style="flex:1;">
        <div style="font-weight:700;font-size:10px;margin-bottom:4px;">EXEMPLO DE PREENCHIMENTO</div>
        <p style="font-size:9px;margin:2px 0;">Preencha os círculos completamente, conforme a imagem ao lado, utilizando</p>
        <p style="font-size:9px;margin:2px 0;"><strong>caneta esferográfica de tinta preta, fabricada em material transparente.</strong></p>
        <p style="font-size:9px;margin:2px 0;">Não será permitido o uso de lápis, lapiseira (grafite) e borracha.</p>
      </div>
      <div style="width:224px;border:1px solid #9ca3af;padding:6px;">
        <div style="font-weight:700;font-size:9px;margin-bottom:4px;">Exemplo de resposta</div>
        ${exemploRows}
      </div>
    </div>

    <div style="margin-top:8px;border:1px solid #9ca3af;">
      <div style="display:flex;background:#e5e7eb;border-bottom:1px solid #9ca3af;">
        <div style="flex:1;text-align:center;font-size:8px;font-weight:700;padding:4px 0;border-right:1px solid #9ca3af;">Questão / Resposta</div>
        <div style="flex:1;text-align:center;font-size:8px;font-weight:700;padding:4px 0;border-right:1px solid #9ca3af;">Questão / Resposta</div>
        <div style="flex:1;text-align:center;font-size:8px;font-weight:700;padding:4px 0;border-right:1px solid #9ca3af;">Questão / Resposta</div>
        <div style="flex:1;text-align:center;font-size:8px;font-weight:700;padding:4px 0;border-right:1px solid #9ca3af;">Questão / Resposta</div>
        <div style="flex:1;text-align:center;font-size:8px;font-weight:700;padding:4px 0;">Questão / Resposta</div>
      </div>
      ${gridRows}
    </div>

    <img src="${escapeHtml(qrCodeDataUrl)}" alt="QR Code" style="width:200px;height:200px;position:absolute;bottom:20px;right:20px;" />
  </div>`;
}

/**
 * Wraps printable page fragments in a standalone HTML document.
 *
 * @param title - Document title, used as the default print file name
 * @param pages - Page fragments produced by the builders above
 * @returns Complete HTML document string
 */
export function buildPrintableDocument(title: string, pages: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f3f4f6; display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px 0; font-family: Arial, Helvetica, sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    @media print {
      body { padding: 0; gap: 0; background: white; }
      .cartao { box-shadow: none !important; border: none !important; padding: 16px !important; }
      * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
${pages}
</body>
</html>`;
}

/**
 * Builds the full HTML document for a single student's answer sheet.
 *
 * @param data - Student and activity data including qrCodeUrl
 * @param qrCodeDataUrl - Base64 DataURL of the QR code image
 * @returns Complete HTML document string
 */
export function buildAnswerSheetHtml(
  data: AnswerSheetStudentData,
  qrCodeDataUrl: string
): string {
  return buildPrintableDocument(
    `cartao_resposta_${data.student.name}`,
    buildAnswerSheetPage(data, qrCodeDataUrl)
  );
}
