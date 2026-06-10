import { resolveRootHostname } from './domainUtils';

describe('resolveRootHostname', () => {
  it.each([
    ['localhost', null],
    ['127.0.0.1', null],
    ['192.168.0.10', null],
    ['::1', null],
    ['2001:db8::1', null],
  ])('should return null for %s (host-only cookie)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['analiticaensino.com.br', 'analiticaensino.com.br'],
    ['aluno.analiticaensino.com.br', 'analiticaensino.com.br'],
    ['professor.analiticaensino.com.br', 'analiticaensino.com.br'],
    ['hml.analiticaensino.com.br', 'hml.analiticaensino.com.br'],
    ['aluno.hml.analiticaensino.com.br', 'hml.analiticaensino.com.br'],
  ])('should resolve %s to %s (.com.br rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['example.com', 'example.com'],
    ['sub.example.com', 'example.com'],
    ['deep.sub.example.com', 'example.com'],
    ['app.hml.example.com', 'hml.example.com'],
    ['intranet', 'intranet'],
  ])('should resolve %s to %s (generic rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });
});
