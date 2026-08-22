import {
  ACTIVITIES_SHEET_NAME,
  SUMMARY_SHEET_NAME,
  buildStudentPerformanceSheets,
} from './exportSheets';
import { DEFAULT_PERFORMANCE_DETAILS_LABELS } from './types';
import type { StudentPerformanceDetailsData } from './types';

/**
 * Limite do formato: o Excel recusa a planilha inteira se um nome de aba passar
 * de 31 caracteres, então isso é erro de abrir arquivo, não detalhe estético.
 */
const EXCEL_SHEET_NAME_LIMIT = 31;

const labels = DEFAULT_PERFORMANCE_DETAILS_LABELS;

/**
 * Dado completo, com os dois tópicos preenchidos e as duas variações de
 * atividade que a tela desenha (com progresso e sem dados).
 */
const fullData: StudentPerformanceDetailsData = {
  studentName: 'Fernanda Rocha',
  grade: { value: 9, performanceLabel: 'Acima da média' },
  correctQuestions: { value: 8, bestResultTopic: 'Fotossíntese' },
  incorrectQuestions: { value: 7, hardestTopic: 'Células' },
  activitiesCompleted: 10,
  questionsAnswered: 40,
  accessCount: '15',
  timeOnline: '02:30:45',
  lastLogin: '25/01/2024 • 14:30h',
  activities: [
    {
      id: 'activity-1',
      name: 'Atividade de Biologia',
      correctCount: 30,
      totalCount: 50,
      hasNoData: false,
      description: 'Descrição da atividade de biologia sobre fotossíntese.',
    },
    {
      id: 'activity-2',
      name: 'Atividade de Química',
      correctCount: 0,
      totalCount: 0,
      hasNoData: true,
    },
  ],
};

/** Todas as células de uma aba, achatadas, para buscas de ausência. */
const flatten = (sheet: { headers: string[]; rows: unknown[][] }) => [
  ...sheet.headers,
  ...sheet.rows.flat(),
];

describe('buildStudentPerformanceSheets', () => {
  describe('abas', () => {
    it('expõe exatamente as duas abas que a tela desenha, nesta ordem', () => {
      const sheets = buildStudentPerformanceSheets(fullData, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Desempenho do estudante',
        'Desempenho atividades',
      ]);
    });

    it('nenhum nome de aba passa dos 31 caracteres do Excel', () => {
      const sheets = buildStudentPerformanceSheets(fullData, labels);

      // Sem esta linha o `for` abaixo passaria com zero abas.
      expect(sheets).toHaveLength(2);

      for (const sheet of sheets) {
        expect(sheet.name.length).toBeGreaterThan(0);
        expect(sheet.name.length).toBeLessThanOrEqual(EXCEL_SHEET_NAME_LIMIT);
      }
    });

    it('os nomes exportados são os que os builders usam', () => {
      const sheets = buildStudentPerformanceSheets(fullData, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        SUMMARY_SHEET_NAME,
        ACTIVITIES_SHEET_NAME,
      ]);
    });
  });

  describe('aba de resumo', () => {
    it('traz cada rótulo/valor da tela, na ordem em que aparecem', () => {
      const [summary] = buildStudentPerformanceSheets(fullData, labels);

      expect(summary).toEqual({
        name: 'Desempenho do estudante',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Estudante', 'Fernanda Rocha'],
          ['NOTA', 9],
          ['DESEMPENHO', 'Acima da média'],
          ['N° DE QUESTÕES CORRETAS', 8],
          ['MELHOR RESULTADO', 'Fotossíntese'],
          ['N° DE QUESTÕES INCORRETAS', 7],
          ['MAIOR DIFICULDADE', 'Células'],
          ['ATIVIDADES REALIZADAS', 10],
          ['QUESTÕES RESPONDIDAS', 40],
          ['QUANTIDADE DE ACESSOS', '15'],
          ['TEMPO ONLINE', '02:30:45'],
          ['ÚLTIMO LOGIN', '25/01/2024 • 14:30h'],
        ],
      });
    });

    it('NÃO exporta contentsCompleted, que a tela não desenha', () => {
      const [summary] = buildStudentPerformanceSheets(
        { ...fullData, contentsCompleted: 4242 },
        labels
      );

      const cells = flatten(summary);
      expect(cells).not.toContain(4242);
      expect(cells).not.toContain('4242');
      expect(cells).not.toContain('CONTEÚDOS CONCLUÍDOS');
    });

    it('tópicos nulos viram "-", como o badge da tela', () => {
      const [summary] = buildStudentPerformanceSheets(
        {
          ...fullData,
          correctQuestions: { value: 5, bestResultTopic: null },
          incorrectQuestions: { value: 3, hardestTopic: null },
        },
        labels
      );

      expect(summary.rows).toContainEqual(['MELHOR RESULTADO', '-']);
      expect(summary.rows).toContainEqual(['MAIOR DIFICULDADE', '-']);
    });

    it('usa os rótulos customizados que a tela recebeu', () => {
      const [summary] = buildStudentPerformanceSheets(fullData, {
        ...labels,
        gradeLabel: 'PONTUAÇÃO',
      });

      expect(summary.rows).toContainEqual(['PONTUAÇÃO', 9]);
      expect(flatten(summary)).not.toContain('NOTA');
    });
  });

  describe('aba de atividades', () => {
    it('traz uma linha por atividade, com o texto de progresso da tela', () => {
      const [, activities] = buildStudentPerformanceSheets(fullData, labels);

      expect(activities).toEqual({
        name: 'Desempenho atividades',
        headers: ['Atividade', 'Progresso', 'Descrição'],
        rows: [
          [
            'Atividade de Biologia',
            '30 de 50 corretas',
            'Descrição da atividade de biologia sobre fotossíntese.',
          ],
          [
            'Atividade de Química',
            'Sem dados ainda! A atividade ainda não foi feita.',
            'Detalhes da atividade não disponíveis.',
          ],
        ],
      });
    });

    it('trata totalCount 0 como sem dados mesmo sem hasNoData, como a tela', () => {
      const [, activities] = buildStudentPerformanceSheets(
        {
          ...fullData,
          activities: [
            {
              id: 'zero',
              name: 'Atividade zerada',
              correctCount: 0,
              totalCount: 0,
              description: 'Descrição',
            },
          ],
        },
        labels
      );

      expect(activities.rows).toEqual([
        [
          'Atividade zerada',
          'Sem dados ainda! A atividade ainda não foi feita.',
          'Descrição',
        ],
      ]);
    });

    it('fica vazia quando o estudante não tem atividades', () => {
      const [, activities] = buildStudentPerformanceSheets(
        { ...fullData, activities: [] },
        labels
      );

      expect(activities.name).toBe('Desempenho atividades');
      expect(activities.headers).toEqual([
        'Atividade',
        'Progresso',
        'Descrição',
      ]);
      expect(activities.rows).toEqual([]);
    });
  });

  describe('sem dado', () => {
    it('data null produz as duas abas vazias, sem estourar', () => {
      const sheets = buildStudentPerformanceSheets(null, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Desempenho do estudante',
        'Desempenho atividades',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      // Cabeçalho continua, senão a aba abre sem dizer o que era para ter ali.
      expect(sheets[0].headers).toEqual(['Indicador', 'Valor']);
      expect(sheets[1].headers).toEqual([
        'Atividade',
        'Progresso',
        'Descrição',
      ]);
    });
  });
});
