import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
  ])('escapes %s', (raw, expected) => {
    expect(escapeHtml(raw)).toBe(expected);
  });

  it('neutralises an event-handler payload', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  it('escapes the ampersand once, not the entities it produces', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
  ])('returns an empty string for %s', (_label, value) => {
    expect(escapeHtml(value)).toBe('');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Prova 1 — Redação')).toBe('Prova 1 — Redação');
  });
});
