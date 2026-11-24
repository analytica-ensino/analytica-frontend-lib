import {
  STUDENT_READING_STATUS,
  chaptersSeenLabel,
  stoppedAtTitle,
  studentReadingStatus,
  withStudentProgress,
} from './studentEbookReading.utils';

const progress = (effectiveReadAt: string | null) => ({
  lastSection: 'p1',
  percent: 40,
  totalSeconds: 120,
  effectiveReadAt,
});

const sections = [
  { section: 'cover', title: 'Capa', position: 0, seenAt: '2026-11-20' },
  { section: 'p1', title: 'O começo', position: 1, seenAt: '2026-11-20' },
  { section: 'end', title: 'Fim', position: 2, seenAt: null },
];

describe('studentEbookReading utils', () => {
  describe('studentReadingStatus', () => {
    it('is not started for a book never opened', () => {
      expect(studentReadingStatus(null)).toBe(
        STUDENT_READING_STATUS.NOT_STARTED
      );
    });

    it('is in progress once opened, until the reading is effective', () => {
      expect(studentReadingStatus(progress(null))).toBe(
        STUDENT_READING_STATUS.READING
      );
      expect(studentReadingStatus(progress('2026-11-21T10:00:00Z'))).toBe(
        STUDENT_READING_STATUS.FINISHED
      );
    });
  });

  describe('stoppedAtTitle', () => {
    it('names the section the student stopped at', () => {
      expect(stoppedAtTitle({ progress: progress(null), sections })).toBe(
        'O começo'
      );
    });

    it('is null when the book was never opened or the section is gone', () => {
      expect(stoppedAtTitle({ progress: null, sections })).toBeNull();
      expect(
        stoppedAtTitle({
          progress: { ...progress(null), lastSection: 'p9' },
          sections,
        })
      ).toBeNull();
    });
  });

  it('counts the chapters seen', () => {
    expect(chaptersSeenLabel(2, 3)).toBe('2 de 3 capítulos');
    expect(chaptersSeenLabel(0, 1)).toBe('0 de 1 capítulo');
  });

  it("puts the student's reading on each attached book, none counting as never opened", () => {
    const book = (id: string) => ({
      id,
      code: `EB${id}`,
      title: `Livro ${id}`,
      subtitle: null,
      coverUrl: null,
      category: null,
    });

    expect(
      withStudentProgress(
        [book('1'), book('2')],
        [{ ebookId: '2', percent: 80, effectiveReadAt: '2026-11-21' }]
      )
    ).toEqual([
      { ...book('1'), percent: 0, effectiveReadAt: null },
      { ...book('2'), percent: 80, effectiveReadAt: '2026-11-21' },
    ]);
    expect(withStudentProgress([book('1')], undefined)).toEqual([
      { ...book('1'), percent: 0, effectiveReadAt: null },
    ]);
  });
});
