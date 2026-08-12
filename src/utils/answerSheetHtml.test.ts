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

  it.each([
    ['the student name', 'Maria Silva'],
    ['the activity title', 'Prova de Matemática'],
    ['the QR code as the img src', `src="${QR_URL}"`],
    ['the CARTÃO-RESPOSTA header', 'CARTÃO-RESPOSTA'],
    ['the filled bubble of the example answer', 'background:#000000'],
    [
      'a document title built from the student name',
      '<title>cartao_resposta_Maria Silva</title>',
    ],
  ])('includes %s', (_label, expected) => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain(expected);
  });

  // A missing class must still print the labelled field, so the teacher can
  // fill it by hand.
  it.each([
    ['a value', '2º B', '2º B'],
    ['null', null, 'ESCOLA E TURMA:'],
    ['undefined', undefined, 'ESCOLA E TURMA:'],
  ])(
    'renders the school class field when it is %s',
    (_label, schoolClass, expected) => {
      const html = buildAnswerSheetHtml(
        makeData({ schoolClass: schoolClass as string | null | undefined }),
        QR_URL
      );

      expect(html).toContain(expected);
    }
  );

  // The grid always draws 50 cells: the ones past the question count become
  // placeholders instead of bubbles.
  it.each([
    ['fills every cell', 50, '>50<', '—'],
    ['places the last bubble at the question count', 25, '>25<', '>26<'],
  ])('%s for totalQuestoes=%s', (_label, totalQuestoes, present, absent) => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'act-1', title: 'T', totalQuestoes } }),
      QR_URL
    );

    expect(html).toContain(present);
    expect(html).not.toContain(absent);
  });

  it('turns the cells beyond the question count into placeholders', () => {
    const html = buildAnswerSheetHtml(
      makeData({ activity: { id: 'act-1', title: 'T', totalQuestoes: 25 } }),
      QR_URL
    );

    expect(html).toContain('—');
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

  it('renders exemplo section with 3 example rows', () => {
    const html = buildAnswerSheetHtml(makeData(), QR_URL);

    expect(html).toContain('Resposta da questão X = A');
    expect(html).toContain('Resposta da questão X = B');
    expect(html).toContain('Resposta da questão X = C');
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
