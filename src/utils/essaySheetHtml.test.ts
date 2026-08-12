import { buildEssaySheetPage } from './essaySheetHtml';

describe('buildEssaySheetPage', () => {
  it('identifica a folha e a prova a que pertence', () => {
    const html = buildEssaySheetPage('Prova 1');

    expect(html).toContain('FOLHA DE REDAÇÃO');
    expect(html).toContain('Prova 1');
  });

  it('preenche o nome do aluno quando informado', () => {
    expect(buildEssaySheetPage('Prova 1', 'Ana Costa')).toContain('Ana Costa');
  });

  it('deixa o nome em branco quando não informado', () => {
    const html = buildEssaySheetPage('Prova 1');

    expect(html).toContain('NOME COMPLETO:');
    expect(html).not.toContain('undefined');
  });

  it('desenha 30 linhas numeradas para o aluno escrever', () => {
    const html = buildEssaySheetPage('Prova 1');

    expect(
      html.match(/border-bottom:1px solid #9ca3af;height:100%/g)
    ).toHaveLength(30);
    expect(html).toContain('>30</span>');
    expect(html).not.toContain('>31</span>');
  });

  it('é um fragmento de página, não um documento inteiro', () => {
    const html = buildEssaySheetPage('Prova 1');

    expect(html).not.toContain('<!DOCTYPE');
    expect(html).not.toContain('<body');
  });
});
