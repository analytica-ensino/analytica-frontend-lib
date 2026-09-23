import {
  DEFAULT_ENEM_MOMENT_REPORT,
  DEFAULT_REPORTS,
  mergeModulesConfig,
} from './modulesConfig';

describe('mergeModulesConfig — reports.enemMoment', () => {
  it('defaults to off with no exams', () => {
    expect(mergeModulesConfig().reports.enemMoment).toEqual({
      active: false,
      examIds: [],
    });
  });

  it('keeps the stored exams', () => {
    const merged = mergeModulesConfig({
      reports: { enemMoment: { active: true, examIds: ['exam-1', 'exam-2'] } },
    });

    expect(merged.reports.enemMoment).toEqual({
      active: true,
      examIds: ['exam-1', 'exam-2'],
    });
  });

  it('fills in examIds when the stored row only carries the toggle', () => {
    // enemMoment is an object, so the shallow spread its siblings rely on would
    // hand consumers an enemMoment with no array to iterate.
    const merged = mergeModulesConfig({
      reports: { enemMoment: { active: true } },
    });

    expect(merged.reports.enemMoment).toEqual({ active: true, examIds: [] });
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
    expect(merged.reports.enemMoment).toEqual({ active: false, examIds: [] });
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

  it('copies the stored array instead of aliasing it', () => {
    const stored = { active: true, examIds: ['exam-1'] };
    const merged = mergeModulesConfig({ reports: { enemMoment: stored } });

    merged.reports.enemMoment.examIds.push('exam-2');

    expect(stored.examIds).toEqual(['exam-1']);
  });
});
