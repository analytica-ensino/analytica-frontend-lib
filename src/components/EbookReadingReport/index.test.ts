import * as report from './index';

describe('analytica-frontend-lib/ebook-reading-report', () => {
  it('exports the report, its modal and what the apps export with', () => {
    expect(report.EbookReadingReport).toEqual(expect.any(Function));
    expect(report.EbookReadingStudentModal).toEqual(expect.any(Function));
    expect(report.fetchEbookReadingExport).toEqual(expect.any(Function));
    expect(report.buildEbookReadingSheets).toEqual(expect.any(Function));
    expect(report.readingTier(80)).toBe(report.READING_TIER.HIGHLIGHT);
  });

  it('exports the contract constants', () => {
    expect(report.EBOOK_READING_GROUP.SCHOOL).toBe('school');
    expect(report.EBOOK_RANKING_DIMENSION.CATEGORY).toBe('CATEGORY');
    expect(report.EBOOK_RANKING_METRIC.READERS).toBe('READERS');
    expect(report.EBOOK_STUDENT_BOOK_STATUS.READ).toBe('read');
    expect(report.EBOOK_READING_ROUTE.SUMMARY).toBe(
      '/access-report/ebook-reading/summary'
    );
    expect(report.GROUP_LABEL.class.many).toBe('turmas');
    expect(report.PERIOD_LABEL['1_MONTH']).toBe('1 mês');
    expect(report.READING_TIER_LABEL.none).toBe('Sem leitura');
    expect(report.RANKING_SIZE).toBe(3);
    expect(report.EBOOK_READING_GROUP.STUDENT).toBe('student');
    expect(report.EBOOK_STUDENT_BOOK_STATUS.NOT_READ).toBe('notRead');
    expect(report.EBOOK_READING_ROUTE.BY_SUBJECT).toBe(
      '/access-report/ebook-reading/by-subject'
    );
  });
});
