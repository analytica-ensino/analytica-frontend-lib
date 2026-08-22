import {
  LESSONS_SHEET_NAME,
  SUMMARY_SHEET_NAME,
  buildStudentLessonProgressSheets,
} from './exportSheets';
import { DEFAULT_LESSON_PROGRESS_LABELS } from './types';
import type { StudentLessonProgressData } from './types';

/**
 * Limite do formato: o Excel recusa a planilha inteira se um nome de aba passar
 * de 31 caracteres, então isso é erro de abrir arquivo, não detalhe estético.
 */
const EXCEL_SHEET_NAME_LIMIT = 31;

const labels = DEFAULT_LESSON_PROGRESS_LABELS;

/**
 * Dado completo, com os três níveis do acordeão e as variações que a tela
 * desenha em cada um: tópico com progresso e tópico `no_data`, subtópico com
 * progresso e subtópico `no_data`, aula com progresso, aula sem dado e aula
 * concluída com progresso 0.
 */
const fullData: StudentLessonProgressData = {
  name: 'Lucas Oliveira',
  overallCompletionRate: 75.5,
  bestResult: 'Fotossíntese',
  biggestDifficulty: 'Células',
  lessonProgress: [
    {
      topic: { id: 'topic-1', name: 'Cinemática' },
      progress: 70.4,
      status: 'in_progress',
      subtopics: [
        {
          subtopic: { id: 'subtopic-1-1', name: 'Aspectos iniciais' },
          progress: 70,
          status: 'in_progress',
          contents: [
            {
              content: { id: 'content-1', name: 'Movimento uniforme' },
              progress: 70,
              isCompleted: false,
            },
            {
              content: { id: 'content-2', name: 'Aceleração' },
              progress: 0,
              isCompleted: false,
            },
            {
              content: { id: 'content-3', name: 'Repouso' },
              progress: 0,
              isCompleted: true,
            },
          ],
        },
        {
          subtopic: { id: 'subtopic-1-2', name: 'Queda livre' },
          progress: 0,
          status: 'no_data',
          contents: [],
        },
      ],
    },
    {
      topic: { id: 'topic-2', name: 'Grandezas físicas' },
      progress: 0,
      status: 'no_data',
      subtopics: [],
    },
  ],
};

/** Todas as células de uma aba, achatadas, para buscas de ausência. */
const flatten = (sheet: { headers: string[]; rows: unknown[][] }) => [
  ...sheet.headers,
  ...sheet.rows.flat(),
];

describe('buildStudentLessonProgressSheets', () => {
  describe('abas', () => {
    it('expõe exatamente as duas abas que a tela desenha, nesta ordem', () => {
      const sheets = buildStudentLessonProgressSheets(fullData, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Conclusão das aulas',
      ]);
    });

    it('nenhum nome de aba passa dos 31 caracteres do Excel', () => {
      const sheets = buildStudentLessonProgressSheets(fullData, labels);

      // Sem esta linha o `for` abaixo passaria com zero abas.
      expect(sheets).toHaveLength(2);

      for (const sheet of sheets) {
        expect(sheet.name.length).toBeGreaterThan(0);
        expect(sheet.name.length).toBeLessThanOrEqual(EXCEL_SHEET_NAME_LIMIT);
      }
    });

    it('nenhum nome de aba usa caractere proibido pelo Excel', () => {
      const sheets = buildStudentLessonProgressSheets(fullData, labels);

      expect(sheets).toHaveLength(2);

      for (const sheet of sheets) {
        expect(sheet.name).not.toMatch(/[:\\/?*[\]]/);
      }
    });

    it('os nomes exportados são os que os builders usam', () => {
      const sheets = buildStudentLessonProgressSheets(fullData, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        SUMMARY_SHEET_NAME,
        LESSONS_SHEET_NAME,
      ]);
    });
  });

  describe('aba de resumo', () => {
    it('traz cada rótulo/valor da tela, na ordem em que aparecem', () => {
      const [summary] = buildStudentLessonProgressSheets(fullData, labels);

      expect(summary).toEqual({
        name: 'Resumo do estudante',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Estudante', 'Lucas Oliveira'],
          // 75.5 arredondado, que é o "76%" que o ProgressCircle desenha.
          ['CONCLUÍDO', 76],
          ['MELHOR RESULTADO', 'Fotossíntese'],
          ['MAIOR DIFICULDADE', 'Células'],
        ],
      });
    });

    it('tópicos nulos viram "-", como o card da tela', () => {
      const [summary] = buildStudentLessonProgressSheets(
        { ...fullData, bestResult: null, biggestDifficulty: null },
        labels
      );

      expect(summary.rows).toContainEqual(['MELHOR RESULTADO', '-']);
      expect(summary.rows).toContainEqual(['MAIOR DIFICULDADE', '-']);
    });

    it('usa os rótulos customizados que a tela recebeu', () => {
      const [summary] = buildStudentLessonProgressSheets(fullData, {
        ...labels,
        completionRateLabel: 'AULAS VISTAS',
      });

      expect(summary.rows).toContainEqual(['AULAS VISTAS', 76]);
      expect(flatten(summary)).not.toContain('CONCLUÍDO');
    });

    it('não traz o detalhe das aulas, que é da outra aba', () => {
      const [summary] = buildStudentLessonProgressSheets(fullData, labels);

      expect(flatten(summary)).not.toContain('Cinemática');
      expect(flatten(summary)).not.toContain('Movimento uniforme');
    });
  });

  describe('aba das aulas', () => {
    it('traz uma linha por linha do acordeão, na ordem e no nível da tela', () => {
      const [, lessons] = buildStudentLessonProgressSheets(fullData, labels);

      expect(lessons).toEqual({
        name: 'Conclusão das aulas',
        headers: ['Tópico', 'Subtópico', 'Aula', 'Progresso (%)'],
        rows: [
          // 70.4 arredondado, como o "70%" ao lado da barra.
          ['Cinemática', '', '', 70],
          ['', 'Aspectos iniciais', '', 70],
          ['', '', 'Movimento uniforme', 70],
          // progress 0 e não concluída: a tela troca o percentual pela mensagem.
          ['', '', 'Aceleração', 'Sem dados ainda!'],
          // progress 0 mas concluída: a tela mostra "0%", não a mensagem.
          ['', '', 'Repouso', 0],
          // subtópico `no_data`: a tela não escreve NADA ao lado do nome.
          ['', 'Queda livre', '', ''],
          // tópico `no_data`: a tela troca a barra pela mensagem.
          ['Grandezas físicas', '', '', 'Sem dados ainda!'],
        ],
      });
    });

    it('usa a mensagem de sem-dados customizada que a tela recebeu', () => {
      const [, lessons] = buildStudentLessonProgressSheets(fullData, {
        ...labels,
        noDataMessage: 'Nada por aqui',
      });

      expect(lessons.rows).toContainEqual([
        'Grandezas físicas',
        '',
        '',
        'Nada por aqui',
      ]);
      expect(flatten(lessons)).not.toContain('Sem dados ainda!');
    });

    it('fica vazia quando o estudante não tem tópicos', () => {
      const [, lessons] = buildStudentLessonProgressSheets(
        { ...fullData, lessonProgress: [] },
        labels
      );

      expect(lessons.name).toBe('Conclusão das aulas');
      expect(lessons.headers).toEqual([
        'Tópico',
        'Subtópico',
        'Aula',
        'Progresso (%)',
      ]);
      expect(lessons.rows).toEqual([]);
    });
  });

  describe('sem dado', () => {
    it('data null produz as duas abas vazias, sem estourar', () => {
      const sheets = buildStudentLessonProgressSheets(null, labels);

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Conclusão das aulas',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      // Cabeçalho continua, senão a aba abre sem dizer o que era para ter ali.
      expect(sheets[0].headers).toEqual(['Indicador', 'Valor']);
      expect(sheets[1].headers).toEqual([
        'Tópico',
        'Subtópico',
        'Aula',
        'Progresso (%)',
      ]);
    });
  });
});
