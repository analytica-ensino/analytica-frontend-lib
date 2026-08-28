import {
  CONTENTS_SHEET_NAME,
  SUBJECTS_SHEET_NAME,
  SUMMARY_SHEET_NAME,
  buildSimulatedStudentDetailsSheets,
} from './exportSheets';
import { SimulatedPerformanceTag } from './types';
import type {
  StudentContentsData,
  StudentDetailsInfo,
  StudentSubjectsData,
} from './types';

/**
 * Limite do formato: o Excel recusa a planilha inteira se um nome de aba passar
 * de 31 caracteres, então isso é erro de abrir arquivo, não detalhe estético.
 */
const EXCEL_SHEET_NAME_LIMIT = 31;

/**
 * Cabeçalho do modal, igual nos dois níveis.
 *
 * `studentId`, `institutionId` e `schoolYear` estão aqui de propósito, com
 * valores reconhecíveis: são os campos que o card NÃO desenha, e os testes de
 * ausência abaixo procuram exatamente por eles.
 */
const student: StudentDetailsInfo = {
  studentId: 'student-1',
  institutionId: 'inst-1',
  name: 'Maria Silva',
  school: 'Escola Centro',
  schoolYear: '3 ano',
  class: 'A',
  average: 72.4,
  performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
};

/** Nível 1: a lista de matérias que a tela abre. */
const subjectsData: StudentSubjectsData = {
  student,
  subjects: [
    {
      id: 'subject-1',
      name: 'Matemática',
      color: '#22C55E',
      icon: 'calculator',
      questionsCount: 12,
      performance: { correct: 9, incorrect: 3, correctPercentage: 74.6 },
    },
    {
      id: 'subject-2',
      name: 'História',
      color: null,
      icon: null,
      questionsCount: 8,
      performance: { correct: 2, incorrect: 6, correctPercentage: 25 },
    },
  ],
  page: 1,
  limit: 20,
  total: 2,
};

/** Nível 2: as habilidades de uma matéria, com e sem código BNCC. */
const contentsData: StudentContentsData = {
  student,
  subject: { id: 'subject-1', name: 'Matemática' },
  contents: [
    {
      contentId: 'content-1',
      contentName: 'Geometria plana',
      bnccCode: 'EM13MAT301',
      questionsCount: 4,
      performance: { correct: 3, incorrect: 1, correctPercentage: 75 },
    },
    {
      contentId: 'content-2',
      contentName: 'Probabilidade',
      bnccCode: null,
      questionsCount: 6,
      performance: { correct: 1, incorrect: 5, correctPercentage: 16.7 },
    },
  ],
  page: 1,
  limit: 20,
  total: 2,
};

/** Todas as células de uma aba, achatadas, para buscas de ausência. */
const flatten = (sheet: { headers: string[]; rows: unknown[][] }) => [
  ...sheet.headers,
  ...sheet.rows.flat(),
];

describe('buildSimulatedStudentDetailsSheets', () => {
  describe('abas', () => {
    it('no nível 1 expõe o resumo e a lista de matérias, nesta ordem', () => {
      const sheets = buildSimulatedStudentDetailsSheets(subjectsData, null);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por componente',
      ]);
    });

    it('no nível 2 troca a segunda aba pela lista de habilidades', () => {
      const sheets = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por habilidade',
      ]);
    });

    it('nenhum nome de aba passa dos 31 caracteres do Excel', () => {
      const sheets = [
        ...buildSimulatedStudentDetailsSheets(subjectsData, null),
        ...buildSimulatedStudentDetailsSheets(contentsData, 'Matemática'),
      ];

      // Sem esta linha o `for` abaixo passaria com zero abas.
      expect(sheets).toHaveLength(4);

      for (const sheet of sheets) {
        expect(sheet.name.length).toBeGreaterThan(0);
        expect(sheet.name.length).toBeLessThanOrEqual(EXCEL_SHEET_NAME_LIMIT);
      }
    });

    it('nenhum nome de aba usa caractere proibido pelo Excel', () => {
      const sheets = [
        ...buildSimulatedStudentDetailsSheets(subjectsData, null),
        ...buildSimulatedStudentDetailsSheets(contentsData, 'Matemática'),
      ];

      expect(sheets).toHaveLength(4);

      for (const sheet of sheets) {
        expect(sheet.name).not.toMatch(/[:\\/?*[\]]/);
      }
    });

    it('os nomes exportados são os que os builders usam', () => {
      const [summary, subjects] = buildSimulatedStudentDetailsSheets(
        subjectsData,
        null
      );
      const [, contents] = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );

      expect(summary.name).toBe(SUMMARY_SHEET_NAME);
      expect(subjects.name).toBe(SUBJECTS_SHEET_NAME);
      expect(contents.name).toBe(CONTENTS_SHEET_NAME);
    });
  });

  describe('aba de resumo', () => {
    it('traz o card do estudante linha a linha, na ordem da tela', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(subjectsData, null);

      expect(summary).toEqual({
        name: 'Resumo do estudante',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Estudante', 'Maria Silva'],
          ['Escola', 'Escola Centro'],
          ['Turma', 'A'],
          // 72.4 arredondado, que é o "72%" que o card escreve.
          ['Média', 72],
          // O texto do Badge, não o valor do enum.
          ['Desempenho', 'Acima da média'],
        ],
      });
    });

    it('no nível 2 abre com a matéria que o título do modal mostra', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );

      expect(summary.rows[0]).toEqual(['Componente curricular', 'Matemática']);
      expect(summary.rows).toHaveLength(6);
    });

    it('não inventa a linha da matéria no nível 1', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(subjectsData, null);

      expect(flatten(summary)).not.toContain('Componente curricular');
      expect(summary.rows).toHaveLength(5);
    });

    it('traduz cada tag de desempenho pelo texto do Badge', () => {
      const [attention] = buildSimulatedStudentDetailsSheets(
        {
          ...subjectsData,
          student: {
            ...student,
            performance: SimulatedPerformanceTag.ATTENTION_POINT,
          },
        },
        null
      );

      expect(attention.rows).toContainEqual(['Desempenho', 'Ponto de atenção']);
    });

    it('deixa de fora os campos do estudante que o card não desenha', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(subjectsData, null);
      const cells = flatten(summary);

      expect(cells).not.toContain('student-1');
      expect(cells).not.toContain('inst-1');
      // O card escreve "Escola Centro - A" e pula o ano escolar.
      expect(cells).not.toContain('3 ano');
    });

    it('não traz o detalhe da lista, que é da outra aba', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(subjectsData, null);

      expect(flatten(summary)).not.toContain('Matemática');
      expect(flatten(summary)).not.toContain('História');
    });
  });

  describe('aba do nível 1', () => {
    it('traz uma linha por matéria, com as colunas que o item desenha', () => {
      const [, subjects] = buildSimulatedStudentDetailsSheets(
        subjectsData,
        null
      );

      expect(subjects).toEqual({
        name: 'Desempenho por componente',
        headers: ['Componente curricular', 'Questões', 'Acertos (%)'],
        rows: [
          // 74.6 arredondado, como o "75%" ao lado da barra.
          ['Matemática', 12, 75],
          ['História', 8, 25],
        ],
      });
    });

    it('não traz acertos e erros, que o nível 1 não mostra', () => {
      const [, subjects] = buildSimulatedStudentDetailsSheets(
        subjectsData,
        null
      );
      const cells = flatten(subjects);

      // 9 acertos e 3 erros da primeira matéria: só a barra de percentual e a
      // contagem de questões estão na tela deste nível.
      expect(cells).not.toContain(9);
      expect(cells).not.toContain(3);
    });

    it('não traz cor, ícone nem id, que não viram texto na tela', () => {
      const [, subjects] = buildSimulatedStudentDetailsSheets(
        subjectsData,
        null
      );
      const cells = flatten(subjects);

      expect(cells).not.toContain('#22C55E');
      expect(cells).not.toContain('calculator');
      expect(cells).not.toContain('subject-1');
    });

    it('fica só com o cabeçalho quando não há matérias', () => {
      const [, subjects] = buildSimulatedStudentDetailsSheets(
        { ...subjectsData, subjects: [] },
        null
      );

      expect(subjects).toEqual({
        name: 'Desempenho por componente',
        headers: ['Componente curricular', 'Questões', 'Acertos (%)'],
        rows: [],
      });
    });
  });

  describe('aba do nível 2', () => {
    it('traz uma linha por habilidade, com as colunas que o item desenha', () => {
      const [, contents] = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );

      expect(contents).toEqual({
        name: 'Desempenho por habilidade',
        headers: [
          'Habilidade',
          'Código BNCC',
          'Questões',
          'Acertos (%)',
          'Acertos',
        ],
        rows: [
          ['Geometria plana', 'EM13MAT301', 4, 75, 3],
          // 16.7 arredondado, como o "17%" ao lado da barra.
          ['Probabilidade', '', 6, 17, 1],
        ],
      });
    });

    it('deixa a célula do BNCC vazia quando a tela omite o código', () => {
      const [, contents] = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );

      expect(contents.rows[1][1]).toBe('');
    });

    it('não traz erros nem id, que o item não mostra', () => {
      const [, contents] = buildSimulatedStudentDetailsSheets(
        contentsData,
        'Matemática'
      );
      const cells = flatten(contents);

      // 5 erros da segunda habilidade.
      expect(cells).not.toContain(5);
      expect(cells).not.toContain('content-1');
    });

    it('fica só com o cabeçalho quando não há habilidades', () => {
      const [, contents] = buildSimulatedStudentDetailsSheets(
        { ...contentsData, contents: [] },
        'Matemática'
      );

      expect(contents).toEqual({
        name: 'Desempenho por habilidade',
        headers: [
          'Habilidade',
          'Código BNCC',
          'Questões',
          'Acertos (%)',
          'Acertos',
        ],
        rows: [],
      });
    });
  });

  describe('sem dado', () => {
    it('data null produz as duas abas vazias, sem estourar', () => {
      const sheets = buildSimulatedStudentDetailsSheets(null, null);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        // Sem dado o modal está no nível em que abre, o das matérias.
        'Desempenho por componente',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      // Cabeçalho continua, senão a aba abre sem dizer o que era para ter ali.
      expect(sheets[0].headers).toEqual(['Indicador', 'Valor']);
      expect(sheets[1].headers).toEqual(['Componente curricular', 'Questões', 'Acertos (%)']);
    });

    it('data null com matéria selecionada não inventa linha de resumo', () => {
      const [summary] = buildSimulatedStudentDetailsSheets(null, 'Matemática');

      expect(summary.rows).toEqual([]);
    });
  });
});
