import {
  SUPPORT_HISTORY_FILTER,
  SUPPORT_TICKET_CARD_STATUS,
  type SupportTicketSummary,
} from '../../types/supportUserPanel';
import {
  formatCardDate,
  formatDate,
  formatDuration,
  formatOpenedAt,
  formatPhone,
  formatRelativeDay,
  formatTime,
  formatTimelineTime,
  matchesHistoryFilter,
  minutesBetween,
} from './supportUserPanelUtils';

// Local times on purpose: every formatter renders in the agent's timezone.
const NOW = new Date(2026, 9, 14, 15, 30);
const TODAY = new Date(2026, 9, 14, 13, 41).toISOString();
const YESTERDAY = new Date(2026, 9, 13, 9, 5).toISOString();
const OLD = new Date(2026, 2, 3, 8, 7).toISOString();

describe('supportUserPanelUtils', () => {
  it('formats dates and times', () => {
    expect(formatDate(OLD)).toBe('03/03/2026');
    expect(formatTime(TODAY)).toBe('13:41');
  });

  it('formats the relative day', () => {
    expect(formatRelativeDay(TODAY, NOW)).toBe('Hoje');
    expect(formatRelativeDay(YESTERDAY, NOW)).toBe('Ontem');
    expect(formatRelativeDay(OLD, NOW)).toBe('03/03/2026');
  });

  it('formats card, opened-at and timeline dates', () => {
    expect(formatCardDate(TODAY, NOW)).toBe('Hoje, 13:41');
    expect(formatCardDate(OLD, NOW)).toBe('03/03/2026');
    expect(formatOpenedAt(TODAY, NOW)).toBe('Hoje, 13:41');
    expect(formatOpenedAt(OLD, NOW)).toBe('03/03, 08:07');
    expect(formatTimelineTime(TODAY, NOW)).toBe('13:41');
    expect(formatTimelineTime(OLD, NOW)).toBe('03/03 08:07');
  });

  it('formats phones', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    expect(formatPhone('+1 555')).toBe('+1 555');
  });

  it('formats durations', () => {
    expect(formatDuration(18)).toBe('18 min');
    expect(formatDuration(65)).toBe('1h 05min');
    expect(formatDuration(-3)).toBe('0 min');
  });

  it('counts minutes between dates', () => {
    const from = new Date(2026, 9, 14, 15, 0).toISOString();
    expect(minutesBetween(from, null, NOW)).toBe(30);
    expect(
      minutesBetween(from, new Date(2026, 9, 14, 15, 10).toISOString(), NOW)
    ).toBe(10);
    expect(minutesBetween(NOW.toISOString(), from, NOW)).toBe(0);
  });

  it('matches history filters', () => {
    const base: SupportTicketSummary = {
      id: 1,
      title: 't',
      status: SUPPORT_TICKET_CARD_STATUS.DONE,
      createdAt: TODAY,
    };
    const open = { ...base, status: SUPPORT_TICKET_CARD_STATUS.HUMAN };
    const byAi: SupportTicketSummary = { ...base, resolvedBy: { type: 'ai' } };
    const byAgent: SupportTicketSummary = {
      ...base,
      resolvedBy: { type: 'agent', name: 'Ana' },
    };

    expect(matchesHistoryFilter(open, SUPPORT_HISTORY_FILTER.ALL)).toBe(true);
    expect(matchesHistoryFilter(open, SUPPORT_HISTORY_FILTER.OPEN)).toBe(true);
    expect(matchesHistoryFilter(base, SUPPORT_HISTORY_FILTER.OPEN)).toBe(false);
    expect(matchesHistoryFilter(base, SUPPORT_HISTORY_FILTER.DONE)).toBe(true);
    expect(matchesHistoryFilter(open, SUPPORT_HISTORY_FILTER.DONE)).toBe(false);
    expect(matchesHistoryFilter(byAi, SUPPORT_HISTORY_FILTER.AI)).toBe(true);
    expect(matchesHistoryFilter(byAgent, SUPPORT_HISTORY_FILTER.AI)).toBe(
      false
    );
  });
});
