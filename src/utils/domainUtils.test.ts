import { resolveRootHostname } from './domainUtils';

describe('resolveRootHostname', () => {
  it.each([
    ['localhost', null],
    ['127.0.0.1', null],
    ['127.0.0.2', null],
    ['::1', null],
    ['2001:db8::1', null],
  ])('should return null for %s (host-only cookie)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['analyticaensino.com.br', 'analyticaensino.com.br'],
    ['aluno.analyticaensino.com.br', 'analyticaensino.com.br'],
    ['professor.analyticaensino.com.br', 'analyticaensino.com.br'],
    ['hml.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
    ['aluno.hml.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
    ['hml-aluno.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
  ])('should resolve %s to %s (.com.br rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['example.com', 'example.com'],
    ['sub.example.com', 'example.com'],
    ['deep.sub.example.com', 'example.com'],
    ['app.hml.example.com', 'hml.example.com'],
    ['hml-aluno.example.com', 'hml.example.com'],
    ['intranet', 'intranet'],
  ])('should resolve %s to %s (generic rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['aluno.html.example.com', 'example.com'],
    ['html.analyticaensino.com.br', 'analyticaensino.com.br'],
  ])(
    'should not treat %s as hml environment (label-based detection)',
    (hostname, expected) => {
      expect(resolveRootHostname(hostname)).toBe(expected);
    }
  );
});
