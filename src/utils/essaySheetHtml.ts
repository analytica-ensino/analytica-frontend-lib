import { escapeHtml } from './escapeHtml';

/** Lines the student writes on. ENEM-style essays cap at 30. */
const LINE_COUNT = 30;

/**
 * Builds the FOLHA DE REDAÇÃO as a standalone page fragment, printed together
 * with the exam and the answer sheet.
 *
 * Uses only inline styles, for the same reason as the answer sheet: the print
 * document has no access to the app's stylesheet.
 *
 * @param examTitle - Exam title, shown under the header
 * @param studentName - Student the sheet belongs to; omitted leaves it blank
 * @returns HTML fragment with a single printable page
 */
export function buildEssaySheetPage(
  examTitle: string,
  studentName?: string
): string {
  // The sheet is assembled by concatenation and rendered in a print window,
  // so anything coming from the API has to be neutralised first.
  const safeExamTitle = escapeHtml(examTitle);
  const safeStudentName = escapeHtml(studentName);

  let lines = '';
  for (let index = 1; index <= LINE_COUNT; index++) {
    lines += `<div style="display:flex;align-items:flex-end;gap:8px;height:26px;">
      <span style="width:18px;text-align:right;font-size:9px;color:#9ca3af;">${index}</span>
      <div style="flex:1;border-bottom:1px solid #9ca3af;height:100%;"></div>
    </div>`;
  }

  return `
  <div class="cartao" style="box-sizing:border-box;background:white;width:210mm;min-height:297mm;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);border:1px solid #d1d5db;padding:24px;font-size:11px;line-height:1.3;color:#000;">

    <div style="background:#000;color:white;padding:6px 12px;display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;">
      <span>&#9632;</span>
      <span>FOLHA DE REDAÇÃO</span>
    </div>

    <div style="padding:4px 12px;font-size:10px;color:#374151;border-left:1px solid #9ca3af;border-right:1px solid #9ca3af;">
      ${safeExamTitle}
    </div>

    <div style="border:1px solid #9ca3af;margin-top:4px;padding:6px;">
      <div style="font-weight:700;font-size:9px;">NOME COMPLETO:</div>
      <div style="min-height:18px;font-size:11px;">${safeStudentName}</div>
    </div>

    <div style="border:1px solid #9ca3af;border-top:none;padding:6px;">
      <div style="font-weight:700;font-size:9px;">TÍTULO:</div>
      <div style="min-height:18px;border-bottom:1px solid #9ca3af;"></div>
    </div>

    <div style="margin-top:12px;display:flex;flex-direction:column;gap:2px;">
      ${lines}
    </div>
  </div>`;
}
