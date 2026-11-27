import { buildActionPlanOrigin } from './actionPlanOrigin';
import {
  ACTION_PLAN_ORIGIN_LIMITS,
  ACTION_PLAN_ORIGIN_TYPE,
} from '../../types/actionPlans';

const NOW = new Date('2026-11-26T15:00:00.000Z');

describe('buildActionPlanOrigin', () => {
  it('keeps what the screen says, stamped with when it was looked at', () => {
    expect(
      buildActionPlanOrigin(
        {
          type: ACTION_PLAN_ORIGIN_TYPE.RANKING,
          report: ' Simulados ',
          filters: ['Último ano', '', null, undefined, '  Turma A '],
          indicator: 'Estudantes com maior dificuldade',
          value: 'Arthur Ribeiro, George Santos',
          link: '/desempenho?view=simulados',
        },
        NOW
      )
    ).toEqual({
      type: 'RANKING',
      report: 'Simulados',
      filters: ['Último ano', 'Turma A'],
      indicator: 'Estudantes com maior dificuldade',
      value: 'Arthur Ribeiro, George Santos',
      queriedAt: '2026-11-26T15:00:00.000Z',
      link: '/desempenho?view=simulados',
      sources: [],
    });
  });

  it('leaves out what the screen did not say', () => {
    expect(
      buildActionPlanOrigin(
        { type: ACTION_PLAN_ORIGIN_TYPE.REPORT, report: 'Acesso' },
        NOW
      )
    ).toMatchObject({
      filters: [],
      indicator: null,
      value: null,
      link: null,
      sources: [],
    });
  });

  it('cuts every text to what the API keeps', () => {
    const origin = buildActionPlanOrigin({
      type: ACTION_PLAN_ORIGIN_TYPE.RANKING,
      report: 'r'.repeat(300),
      filters: Array.from({ length: 30 }, () => 'f'.repeat(300)),
      indicator: 'i'.repeat(300),
      value: 'v'.repeat(300),
    });

    expect(origin.report).toHaveLength(ACTION_PLAN_ORIGIN_LIMITS.REPORT);
    expect(origin.report.endsWith('…')).toBe(true);
    expect(origin.filters).toHaveLength(ACTION_PLAN_ORIGIN_LIMITS.FILTERS);
    expect(origin.filters[0]).toHaveLength(ACTION_PLAN_ORIGIN_LIMITS.FILTER);
    expect(origin.indicator).toHaveLength(ACTION_PLAN_ORIGIN_LIMITS.INDICATOR);
    expect(origin.value).toHaveLength(ACTION_PLAN_ORIGIN_LIMITS.VALUE);
  });

  it('keeps only links of the platform, and only the path of one too long', () => {
    const build = (link: string) =>
      buildActionPlanOrigin({
        type: ACTION_PLAN_ORIGIN_TYPE.REPORT,
        report: 'Acesso',
        link,
      }).link;

    expect(build('https://outro.site/relatorios')).toBeNull();
    expect(build('//outro.site/relatorios')).toBeNull();
    expect(build(`/relatorios?schools=${'a'.repeat(2100)}`)).toBe(
      '/relatorios'
    );
    expect(build(`/${'a'.repeat(2100)}`)).toBeNull();
  });
});
