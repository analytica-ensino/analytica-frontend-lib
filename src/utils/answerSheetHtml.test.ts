import {
  buildAnswerSheetHtml,
  buildAnswerSheetPage,
  buildPrintableDocument,
} from './answerSheetHtml';
import type { AnswerSheetStudentData } from '../types/answerSheet';

const makeData = (
  overrides: Partial<AnswerSheetStudentData> = {}
): AnswerSheetStudentData => ({
  student: { id: 'stu-1', name: 'Maria Silva' },
  activity: { id: 'act-1', title: 'Prova de Matemática', totalQuestoes: 50 },
  qrCodeUrl: 'https://example.com/qr',
  schoolClass: '3º A',
  ...overrides,
});

const QR_URL = 'data:image/png;base64,abc123';

describe('buildAnswerSheetHtml', () => {
  it('returns a complete HTML document string', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('</html>');
  });

  it('includes student name in the document', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('Maria Silva');
  });

  it('includes activity title in the document', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('Prova de Matemática');
  });

  it('includes the QR code data URL as img src', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain(`src="${QR_URL}"`);
  });

  it('renders schoolClass value when provided', () => {
    const html = buildAnswerSheetHtml(
      makeData({ schoolClass: '2º B' }),
      QR_URL
    );

    expect(html).toContain('2º B');
  });

  it('renders empty string for schoolClass when null', () => {
    const html = buildAnswerSheetHtml(makeData({ schoolClass: null }), QR_URL);
    // schoolClass ?? '' results in empty string — no exception thrown
    expect(html).toContain('ESCOLA E TURMA:');
  });

  it('renders empty string for schoolClass when undefined', () => {
    const html = buildAnswerSheetHtml(
      makeData({ schoolClass: undefined }),
      QR_URL
    );
    expect(html).toContain('ESCOLA E TURMA:');
  });

  it('generates 50 question bubbles for totalQuestoes=50 (full grid)', () => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'act-1', title: 'T', totalQuestoes: 50 } }),
      QR_URL
    );

    // Each active question cell has a number span with the question number
    // Question 50 should appear
    expect(html).toContain('>50<');
    // Placeholder dashes should not appear (all 50 questions are filled)
    expect(html).not.toContain('—');
  });

  it('generates placeholder for cells beyond totalQuestoes', () => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'act-1', title: 'T', totalQuestoes: 25 } }),
      QR_URL
    );

    // Question 25 should be a real bubble
    expect(html).toContain('>25<');
    // Questions after 25 (up to 50) should be placeholders
    expect(html).toContain('—');
  });

  it('does not render a bubble for question 26 when totalQuestoes=25', () => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'act-1', title: 'T', totalQuestoes: 25 } }),
      QR_URL
    );

    // Question 26 should NOT appear as a numbered cell
    expect(html).not.toContain('>26<');
  });

  it('last grid row has no bottom border', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    const rows = html.split('<div style="display:flex;');
    const lastGridRow = rows[rows.length - 2]; // second to last split is last row
    expect(lastGridRow).not.toContain('border-bottom');
  });

  it('last column in each row has no right border', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    // Last column cells have no cellBorderRight — verify last cell div in first row
    // All cells have flex:1 and padding, last cell does NOT have border-right
    // Check that not every cell div has border-right (some should be missing it)
    const cellsWithBorder = (
      html.match(/border-right: 1px solid #9ca3af/g) || []
    ).length;
    // 10 rows × 4 non-last columns = 40 cells with right border
    expect(cellsWithBorder).toBe(40);
  });

  it('renders CARTÃO-RESPOSTA header', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);
    expect(html).toContain('CARTÃO-RESPOSTA');
  });

  it('renders exemplo section with 3 example rows', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('Resposta da questão X = A');
    expect(html).toContain('Resposta da questão X = B');
    expect(html).toContain('Resposta da questão X = C');
  });

  it('exemplo bubbles have filled (black) background for the correct answer', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    // First example: answer='A', so 'A' bubble should have background:#000000
    expect(html).toContain('background:#000000');
  });

  it('sets document title from student name', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('<title>cartao_resposta_Maria Silva</title>');
  });

  it('handles totalQuestoes=1 — only first cell has content, rest are placeholders', () => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'a', title: 'T', totalQuestoes: 1 } }),
      QR_URL
    );

    expect(html).toContain('>1<');
    expect(html).not.toContain('>2<');
    // Many placeholder dashes expected
    const dashes = (html.match(/—/g) || []).length;
    expect(dashes).toBe(49);
  });

  describe('hardening', () => {
    const withText = (title: string, name: string) => ({
      student: { id: 's1', name },
      activity: { id: 'a1', title, totalQuestoes: 10 },
      qrCodeUrl: 'https://aluno.example.com/qrcode/tok',
      schoolClass: 'Turma Única',
    });

    it('keeps the page inside A4 by sizing the border box', () => {
      const html = buildAnswerSheetPage(withText('Prova 1', 'Ana'), 'data:,');

      expect(html).toContain('box-sizing:border-box');
    });

    it('escapes the activity title and the student name', () => {
      const html = buildAnswerSheetPage(
        withText('<script>alert(1)</script>', '<b>Ana</b>'),
        'data:,'
      );

      expect(html).not.toContain('<script');
      expect(html).not.toContain('<b>Ana</b>');
      expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    });

    it('escapes the school class', () => {
      const html = buildAnswerSheetPage(
        { ...withText('Prova 1', 'Ana'), schoolClass: '<i>3A</i>' },
        'data:,'
      );

      expect(html).not.toContain('<i>3A</i>');
    });

    it('escapes the document title', () => {
      const html = buildPrintableDocument('<script>x</script>', '<div/>');

      expect(html).not.toContain('<title><script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
