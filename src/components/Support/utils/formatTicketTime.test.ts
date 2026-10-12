import { formatTicketTime } from './formatTicketTime';

const NOW = new Date('2026-10-12T12:00:00.000Z');

describe('formatTicketTime', () => {
  it('returns "agora" for anything under a minute', () => {
    expect(formatTicketTime(new Date('2026-10-12T11:59:30.000Z'), NOW)).toBe(
      'agora'
    );
  });

  it('returns whole minutes under an hour', () => {
    expect(formatTicketTime(new Date('2026-10-12T11:54:00.000Z'), NOW)).toBe(
      '6 min'
    );
  });

  it('returns whole hours under a day', () => {
    expect(formatTicketTime(new Date('2026-10-12T10:00:00.000Z'), NOW)).toBe(
      '2 h'
    );
  });

  it('returns whole days under a week', () => {
    expect(formatTicketTime(new Date('2026-10-09T12:00:00.000Z'), NOW)).toBe(
      '3 d'
    );
  });

  it('returns a short date from a week onwards', () => {
    expect(formatTicketTime(new Date('2026-09-12T12:00:00.000Z'), NOW)).toBe(
      '12/09/2026'
    );
  });

  it('accepts an ISO string', () => {
    expect(formatTicketTime('2026-10-12T11:54:00.000Z', NOW)).toBe('6 min');
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatTicketTime('não é data', NOW)).toBe('');
  });

  it('uses the current clock when no reference is given', () => {
    jest.useFakeTimers().setSystemTime(NOW);

    expect(formatTicketTime(new Date('2026-10-12T11:54:00.000Z'))).toBe(
      '6 min'
    );

    jest.useRealTimers();
  });
});
