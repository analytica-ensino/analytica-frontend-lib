import {
  addDays,
  countActiveFilters,
  deadlineWindow,
  DEADLINE_RANGE,
  describeActionPlanEvent,
  EMPTY_ACTION_PLAN_FILTERS,
  filtersToParams,
  formatEventDate,
  formatFullDate,
  formatQueriedAt,
  formatShortDate,
  narrowedSelection,
  todayInSaoPaulo,
} from './actionPlans.utils';
import {
  ACTION_PLAN_STATUS,
  type ActionPlanEvent,
} from '../../types/actionPlans';

const event = (overrides: Partial<ActionPlanEvent>): ActionPlanEvent => ({
  id: 'event-1',
  type: 'CREATED',
  field: null,
  fromValue: null,
  toValue: null,
  fromName: null,
  toName: null,
  comment: null,
  actor: { userInstitutionId: 'ui-1', name: 'Carlos Silva' },
  createdAt: '2025-05-14T12:32:00.000Z',
  ...overrides,
});

describe('actionPlans utils', () => {
  describe('dates', () => {
    it('takes today in São Paulo, not in UTC', () => {
      expect(todayInSaoPaulo(new Date('2026-11-27T02:00:00.000Z'))).toBe(
        '2026-11-26'
      );
      expect(todayInSaoPaulo(new Date('2026-11-27T03:00:00.000Z'))).toBe(
        '2026-11-27'
      );
    });

    it('adds days across months and years', () => {
      expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
      expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
    });

    it('formats the deadline short and full', () => {
      expect(formatShortDate('2026-05-12')).toBe('12/05');
      expect(formatFullDate('2026-05-12')).toBe('12/05/2026');
    });

    it('formats when an entry happened, in local time', () => {
      const local = new Date(2025, 4, 14, 9, 32).toISOString();

      expect(formatEventDate(local)).toBe('14 maio 2025, 09:32');
      expect(formatEventDate(null)).toBe('');
      expect(formatEventDate('not a date')).toBe('');
    });

    it('says "Hoje" for data read today', () => {
      const now = new Date(2026, 10, 26, 15, 0);

      expect(
        formatQueriedAt(new Date(2026, 10, 26, 8, 5).toISOString(), now)
      ).toBe('Hoje, às 08:05');
      expect(
        formatQueriedAt(new Date(2026, 10, 20, 10, 0).toISOString(), now)
      ).toBe('20/11/2026, às 10:00');
      expect(formatQueriedAt('not a date', now)).toBe('');
    });
  });

  describe('filters', () => {
    it('keeps a group narrowed only when it leaves something out', () => {
      const all = ['a', 'b', 'c'];

      expect(narrowedSelection(['a'], all)).toEqual(['a']);
      expect(narrowedSelection(['c', 'b', 'a'], all)).toBeNull();
      expect(narrowedSelection([], all)).toBeNull();
    });

    it('turns the deadline choice into a window from today', () => {
      const today = '2026-11-26';

      expect(deadlineWindow(EMPTY_ACTION_PLAN_FILTERS, today)).toEqual({});
      expect(
        deadlineWindow(
          {
            ...EMPTY_ACTION_PLAN_FILTERS,
            deadline: DEADLINE_RANGE.NEXT_7_DAYS,
          },
          today
        )
      ).toEqual({ deadlineFrom: today, deadlineTo: '2026-12-03' });
      expect(
        deadlineWindow(
          {
            ...EMPTY_ACTION_PLAN_FILTERS,
            deadline: DEADLINE_RANGE.NEXT_30_DAYS,
          },
          today
        )
      ).toEqual({ deadlineFrom: today, deadlineTo: '2026-12-26' });
      expect(
        deadlineWindow(
          {
            ...EMPTY_ACTION_PLAN_FILTERS,
            deadline: DEADLINE_RANGE.CUSTOM,
            deadlineFrom: '',
            deadlineTo: '2026-12-31',
          },
          today
        )
      ).toEqual({ deadlineTo: '2026-12-31' });
    });

    it('sends only the narrowed groups', () => {
      expect(filtersToParams(EMPTY_ACTION_PLAN_FILTERS, '2026-11-26')).toEqual(
        {}
      );
      expect(
        filtersToParams(
          {
            ...EMPTY_ACTION_PLAN_FILTERS,
            statuses: [ACTION_PLAN_STATUS.DONE],
            schoolIds: ['school-a'],
            responsibleIds: ['ui-1'],
            deadline: DEADLINE_RANGE.NEXT_7_DAYS,
            lateOnly: true,
          },
          '2026-11-26'
        )
      ).toEqual({
        status: [ACTION_PLAN_STATUS.DONE],
        schoolIds: ['school-a'],
        responsibleIds: ['ui-1'],
        deadlineFrom: '2026-11-26',
        deadlineTo: '2026-12-03',
        late: 'true',
      });
    });

    it('counts each filter that narrows the list', () => {
      expect(countActiveFilters(EMPTY_ACTION_PLAN_FILTERS)).toBe(0);
      expect(
        countActiveFilters({
          ...EMPTY_ACTION_PLAN_FILTERS,
          statuses: [ACTION_PLAN_STATUS.DONE],
          deadline: DEADLINE_RANGE.CUSTOM,
          lateOnly: true,
        })
      ).toBe(3);
    });
  });

  describe('describeActionPlanEvent', () => {
    it('describes the creation and a status change', () => {
      expect(describeActionPlanEvent(event({}))).toBe(
        'Carlos Silva criou este plano'
      );
      expect(
        describeActionPlanEvent(
          event({
            type: 'STATUS_CHANGED',
            fromValue: 'NOT_STARTED',
            toValue: 'IN_PROGRESS',
          })
        )
      ).toBe(
        "Carlos Silva alterou o status de 'Não iniciado' para 'Em andamento'"
      );
    });

    it('names both people of a responsible change', () => {
      expect(
        describeActionPlanEvent(
          event({
            type: 'RESPONSIBLE_CHANGED',
            fromName: 'Ana Souza',
            toName: 'Bia Lima',
          })
        )
      ).toBe(
        "Carlos Silva alterou o responsável de 'Ana Souza' para 'Bia Lima'"
      );
      expect(
        describeActionPlanEvent(
          event({ type: 'RESPONSIBLE_CHANGED', toName: 'Bia Lima' })
        )
      ).toBe("Carlos Silva definiu 'Bia Lima' como responsável");
    });

    it('describes each edited field', () => {
      expect(
        describeActionPlanEvent(
          event({
            type: 'UPDATED',
            field: 'title',
            fromValue: 'Antigo',
            toValue: 'Novo',
          })
        )
      ).toBe("Carlos Silva alterou o título de 'Antigo' para 'Novo'");
      expect(
        describeActionPlanEvent(
          event({
            type: 'UPDATED',
            field: 'deadline',
            fromValue: '2026-12-15',
            toValue: '2026-12-20',
          })
        )
      ).toBe("Carlos Silva alterou o prazo de '15/12/2026' para '20/12/2026'");
      expect(
        describeActionPlanEvent(
          event({ type: 'UPDATED', field: 'description', toValue: 'x' })
        )
      ).toBe('Carlos Silva alterou a descrição');
    });

    it('names a removed author and reads unknown changes plainly', () => {
      expect(describeActionPlanEvent(event({ actor: null }))).toBe(
        'Usuário removido criou este plano'
      );
      expect(describeActionPlanEvent(event({ type: 'ATTACHMENT_ADDED' }))).toBe(
        'Carlos Silva alterou o plano'
      );
      expect(
        describeActionPlanEvent(event({ type: 'UPDATED', field: 'origin' }))
      ).toBe('Carlos Silva alterou o plano');
    });
  });
});
