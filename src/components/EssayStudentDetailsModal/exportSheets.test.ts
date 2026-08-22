import {
  COMPETENCIES_SHEET_NAME,
  SUMMARY_SHEET_NAME,
  buildEssayStudentDetailsSheets,
} from './exportSheets';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type { EssayStudentDetailsData } from './types';

/**
 * Limite do formato: o Excel recusa a planilha inteira se um nome de aba passar
 * de 31 caracteres, então isso é erro de abrir arquivo, não detalhe estético.
 */
const EXCEL_SHEET_NAME_LIMIT = 31;

/**
 * O dado que o modal carrega, com valores fracionários de propósito.
 *
 * `id` e `schoolYear` estão aqui com valores reconhecíveis porque são os campos
 * que o card NÃO desenha, e os testes de ausência abaixo procuram por eles.
 * As frações existem para que o arredondamento apareça na asserção: um `720`
 * exato passaria com ou sem `Math.round`.
 */
const detailsData: EssayStudentDetailsData = {
  student: {
    id: 'student-1',
    name: 'Maria Silva',
    school: 'Colégio Santa Maria',
    schoolYear: '3 ano',
    class: '3A',
  },
  overallAverage: 720.4,
  overallPercentage: 72.4,
  performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
  essaysCount: 5,
  competencies: [
    {
      number: 1,
      name: 'Domínio da modalidade escrita formal da língua portuguesa',
      averageScore: 120.6,
      averagePercentage: 60.4,
      // Contagem por competência: a linha da tela não a escreve em lugar
      // nenhum. Valor distinto do `essaysCount` do card para que a busca de
      // ausência não case com o número certo por acidente.
      essaysCount: 3,
    },
    {
      number: 2,
      name: 'Compreender a proposta de redação e aplicar conceitos',
      averageScore: 135,
      averagePercentage: 67.5,
      essaysCount: 3,
    },
  ],
};

/** Todas as células de uma aba, achatadas, para buscas de ausência. */
const flatten = (sheet: { headers: string[]; rows: unknown[][] }) => [
  ...sheet.headers,
  ...sheet.rows.flat(),
];

describe('buildEssayStudentDetailsSheets', () => {
  describe('abas', () => {
    it('expõe o resumo e as competências, nesta ordem', () => {
      const sheets = buildEssayStudentDetailsSheets(detailsData);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por competência',
      ]);
    });

    it('mantém as mesmas duas abas quando não há dado', () => {
      const sheets = buildEssayStudentDetailsSheets(null);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por competência',
      ]);
    });

    it('nenhum nome de aba passa dos 31 caracteres do Excel', () => {
      const sheets = [
        ...buildEssayStudentDetailsSheets(detailsData),
        ...buildEssayStudentDetailsSheets(null),
      ];

      // Sem esta linha o `for` abaixo passaria com zero abas.
      expect(sheets).toHaveLength(4);

      for (const sheet of sheets) {
        expect(sheet.name.length).toBeGreaterThan(0);
        expect(sheet.name.length).toBeLessThanOrEqual(EXCEL_SHEET_NAME_LIMIT);
      }
    });

    it('nenhum nome de aba usa caractere proibido pelo Excel', () => {
      const sheets = buildEssayStudentDetailsSheets(detailsData);

      expect(sheets).toHaveLength(2);

      for (const sheet of sheets) {
        expect(sheet.name).not.toMatch(/[:\\/?*[\]]/);
      }
    });

    it('os nomes exportados são os que os builders usam', () => {
      const [summary, competencies] =
        buildEssayStudentDetailsSheets(detailsData);

      expect(summary.name).toBe(SUMMARY_SHEET_NAME);
      expect(competencies.name).toBe(COMPETENCIES_SHEET_NAME);
    });
  });

  describe('aba de resumo', () => {
    it('traz o card do estudante linha a linha, na ordem da tela', () => {
      const [summary] = buildEssayStudentDetailsSheets(detailsData);

      expect(summary).toEqual({
        name: 'Resumo do estudante',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Estudante', 'Maria Silva'],
          ['Escola', 'Colégio Santa Maria'],
          ['Turma', '3A'],
          // Número, sem o "redações" que o card escreve ao lado: a flexão de
          // plural é texto de tela, e a coluna de uma planilha já diz o que é.
          ['Redações', 5],
          // 720.4 arredondado, que é o "720" do card.
          ['Média (0-1000)', 720],
          // 72.4 arredondado, que é o "72%" do card.
          ['Aproveitamento (%)', 72],
          // O texto do Badge, não o valor do enum.
          ['Desempenho', 'Acima da média'],
        ],
      });
    });

    it('traduz cada tag de desempenho pelo texto do Badge', () => {
      const [attention] = buildEssayStudentDetailsSheets({
        ...detailsData,
        performance: SimulatedPerformanceTag.ATTENTION_POINT,
      });

      expect(attention.rows).toContainEqual(['Desempenho', 'Ponto de atenção']);
    });

    it('escreve 1 redação como número, sem a flexão singular da tela', () => {
      const [summary] = buildEssayStudentDetailsSheets({
        ...detailsData,
        essaysCount: 1,
      });

      expect(summary.rows).toContainEqual(['Redações', 1]);
      expect(flatten(summary)).not.toContain('1 redação');
    });

    it('deixa de fora os campos do estudante que o card não desenha', () => {
      const [summary] = buildEssayStudentDetailsSheets(detailsData);
      const cells = flatten(summary);

      expect(cells).not.toContain('student-1');
      // O card escreve "Colégio Santa Maria - 3A" e pula o ano escolar.
      expect(cells).not.toContain('3 ano');
    });

    it('não traz o detalhe das competências, que é da outra aba', () => {
      const [summary] = buildEssayStudentDetailsSheets(detailsData);
      const cells = flatten(summary);

      expect(cells).not.toContain(
        'Domínio da modalidade escrita formal da língua portuguesa'
      );
    });

    it('fica só com o cabeçalho quando não há dado', () => {
      const [summary] = buildEssayStudentDetailsSheets(null);

      expect(summary).toEqual({
        name: 'Resumo do estudante',
        headers: ['Indicador', 'Valor'],
        rows: [],
      });
    });
  });

  describe('aba de competências', () => {
    it('traz uma linha por competência, com as colunas que o item desenha', () => {
      const [, competencies] = buildEssayStudentDetailsSheets(detailsData);

      expect(competencies).toEqual({
        name: 'Desempenho por competência',
        headers: ['Nº', 'Competência', 'Aproveitamento (%)', 'Nota (0-200)'],
        rows: [
          // 60.4 arredondado para 60, como o "60%" ao lado da barra; 120.6
          // arredondado para 121, como o número ao lado do "/ 200".
          [
            1,
            'Domínio da modalidade escrita formal da língua portuguesa',
            60,
            121,
          ],
          [2, 'Compreender a proposta de redação e aplicar conceitos', 68, 135],
        ],
      });
    });

    it('leva o nome inteiro da competência, e não a versão truncada da tela', () => {
      const longName =
        'Demonstrar conhecimento dos mecanismos linguísticos necessários para a ' +
        'construção da argumentação, articulando as partes do texto de forma coesa';
      const [, competencies] = buildEssayStudentDetailsSheets({
        ...detailsData,
        competencies: [{ ...detailsData.competencies[0], name: longName }],
      });

      expect(competencies.rows[0][1]).toBe(longName);
    });

    it('não traz a contagem de redações por competência, que a linha não mostra', () => {
      const [, competencies] = buildEssayStudentDetailsSheets(detailsData);

      // 3 é o `essaysCount` de cada competência; o card mostra 5, do estudante.
      expect(flatten(competencies)).not.toContain(3);
    });

    it('fica só com o cabeçalho quando a lista vem vazia', () => {
      const [, competencies] = buildEssayStudentDetailsSheets({
        ...detailsData,
        competencies: [],
      });

      expect(competencies).toEqual({
        name: 'Desempenho por competência',
        headers: ['Nº', 'Competência', 'Aproveitamento (%)', 'Nota (0-200)'],
        rows: [],
      });
    });

    it('fica só com o cabeçalho quando não há dado', () => {
      const [, competencies] = buildEssayStudentDetailsSheets(null);

      expect(competencies).toEqual({
        name: 'Desempenho por competência',
        headers: ['Nº', 'Competência', 'Aproveitamento (%)', 'Nota (0-200)'],
        rows: [],
      });
    });
  });

  describe('sem dado', () => {
    it('data null produz as duas abas vazias, sem estourar', () => {
      const sheets = buildEssayStudentDetailsSheets(null);

      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      // Cabeçalho continua, senão a aba abre sem dizer o que era para ter ali.
      expect(sheets[0].headers).toEqual(['Indicador', 'Valor']);
      expect(sheets[1].headers).toEqual([
        'Nº',
        'Competência',
        'Aproveitamento (%)',
        'Nota (0-200)',
      ]);
    });
  });
});
