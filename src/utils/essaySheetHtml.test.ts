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

  it('keeps the page inside A4 by sizing the border box', () => {
    const html = buildEssaySheetPage('Prova 1');

    // The fragment is appended to documents that may carry no CSS reset, so the
    // padding and border must count inside the 210mm/297mm.
    expect(html).toContain('box-sizing:border-box');
  });

  it.each([
    ['a script tag', '<script>alert(1)</script>'],
    ['an event handler', '<img src=x onerror="alert(1)">'],
    ['quotes and ampersands', `Prova "A" & 'B'`],
  ])('escapes %s in the exam title', (_label, payload) => {
    const html = buildEssaySheetPage(payload);

    // The payload survives as inert text, never as markup: no unescaped
    // angle bracket or quote from it reaches the document.
    expect(html).not.toContain(payload);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
  });

  it('escapes the student name', () => {
    const html = buildEssaySheetPage('Prova 1', '<b>Ana</b>');

    expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(html).not.toContain('<b>Ana</b>');
  });
});
