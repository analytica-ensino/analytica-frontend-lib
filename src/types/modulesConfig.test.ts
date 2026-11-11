import {
  DEFAULT_ENEM_MOMENT_REPORT,
  DEFAULT_MODULES,
  DEFAULT_REPORTS,
  isLessonVideoMp4Only,
  mergeModulesConfig,
} from './modulesConfig';

describe('mergeModulesConfig — reports.enemMoment', () => {
  it('defaults to off with no exams', () => {
    expect(mergeModulesConfig().reports.enemMoment).toEqual({
      active: false,
      examIds: [],
      releasedExamIds: [],
      sisuSimulator: false,
    });
  });

  it('keeps the stored exams', () => {
    const merged = mergeModulesConfig({
      reports: { enemMoment: { active: true, examIds: ['exam-1', 'exam-2'] } },
    });

    expect(merged.reports.enemMoment).toEqual({
      active: true,
      examIds: ['exam-1', 'exam-2'],
      releasedExamIds: [],
      sisuSimulator: false,
    });
  });

  it('fills in examIds when the stored row only carries the toggle', () => {
    // enemMoment is an object, so the shallow spread its siblings rely on would
    // hand consumers an enemMoment with no array to iterate.
    const merged = mergeModulesConfig({
      reports: { enemMoment: { active: true } },
    });

    expect(merged.reports.enemMoment).toEqual({
      active: true,
      examIds: [],
      releasedExamIds: [],
      sisuSimulator: false,
    });
  });

  it('keeps the other report toggles when only enemMoment is stored', () => {
    const merged = mergeModulesConfig({
      reports: { enemMoment: { active: true, examIds: ['exam-1'] } },
    });

    expect(merged.reports.simulatedReports).toBe(
      DEFAULT_REPORTS.simulatedReports
    );
    expect(merged.reports.lessonsReports).toBe(DEFAULT_REPORTS.lessonsReports);
  });

  it('keeps enemMoment when another report toggle is stored', () => {
    const merged = mergeModulesConfig({
      reports: { questionnairesReports: true },
    });

    expect(merged.reports.questionnairesReports).toBe(true);
    expect(merged.reports.enemMoment).toEqual(DEFAULT_ENEM_MOMENT_REPORT);
  });

  it('does not hand out the default array itself', () => {
    // Two institutions merged in the same session must not share one array: a
    // consumer pushing to it would edit the default for everyone after it.
    const first = mergeModulesConfig();
    const second = mergeModulesConfig();

    expect(first.reports.enemMoment.examIds).not.toBe(
      DEFAULT_ENEM_MOMENT_REPORT.examIds
    );
    expect(first.reports.enemMoment.examIds).not.toBe(
      second.reports.enemMoment.examIds
    );
  });

  it('copies the stored arrays instead of aliasing them', () => {
    const stored = {
      active: true,
      examIds: ['exam-1'],
      releasedExamIds: ['exam-1'],
    };
    const merged = mergeModulesConfig({ reports: { enemMoment: stored } });

    merged.reports.enemMoment.examIds.push('exam-2');
    merged.reports.enemMoment.releasedExamIds.push('exam-2');

    expect(stored.examIds).toEqual(['exam-1']);
    expect(stored.releasedExamIds).toEqual(['exam-1']);
  });

  it('keeps the released exams and the SISU simulator', () => {
    const merged = mergeModulesConfig({
      reports: {
        enemMoment: {
          active: true,
          examIds: ['exam-1', 'exam-2'],
          releasedExamIds: ['exam-1'],
          sisuSimulator: true,
        },
      },
    });

    expect(merged.reports.enemMoment).toEqual({
      active: true,
      examIds: ['exam-1', 'exam-2'],
      releasedExamIds: ['exam-1'],
      sisuSimulator: true,
    });
  });

  it('turns the SISU simulator on only with a real true', () => {
    const merged = mergeModulesConfig({
      reports: {
        enemMoment: { sisuSimulator: 'true' as unknown as boolean },
      },
    });

    expect(merged.reports.enemMoment.sisuSimulator).toBe(false);
  });
});

describe('lessonVideoMp4Only', () => {
  it('is off by default: lessons play their HLS when they have one', () => {
    expect(DEFAULT_MODULES.lessonVideoMp4Only).toBe(false);
    expect(isLessonVideoMp4Only(mergeModulesConfig())).toBe(false);
  });

  it('is on when the stored row says so', () => {
    expect(
      isLessonVideoMp4Only(mergeModulesConfig({ lessonVideoMp4Only: true }))
    ).toBe(true);
  });

  it('reads a missing key, or no modules at all, as off', () => {
    expect(isLessonVideoMp4Only({})).toBe(false);
    expect(isLessonVideoMp4Only(null)).toBe(false);
    expect(isLessonVideoMp4Only(undefined)).toBe(false);
  });

  it('turns on only with a real true', () => {
    expect(
      isLessonVideoMp4Only({
        lessonVideoMp4Only: 'true' as unknown as boolean,
      })
    ).toBe(false);
    expect(
      isLessonVideoMp4Only({ lessonVideoMp4Only: 1 as unknown as boolean })
    ).toBe(false);
  });
});
