import {
  STUDENTS_SHEET_NAME,
  SUMMARY_SHEET_NAME,
  buildEssayCompetenceDetailsSheets,
  buildStudentsSheet,
  buildSummarySheet,
} from './exportSheets';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type {
  EssayCompetenceDetailsData,
  EssayCompetenceStudentItem,
} from './types';

/**
 * Teto de caracteres de um nome de aba no formato xlsx. Acima dele o Excel
 * recusa o arquivo INTEIRO, não a aba, então isso é erro de abrir arquivo e não
 * detalhe estético. Mesma constante dos testes dos modais irmãos.
 */
const EXCEL_SHEET_NAME_LIMIT = 31;

/** Caracteres que o formato proíbe em nome de aba, pelo mesmo motivo. */
const FORBIDDEN_SHEET_NAME_CHARS = /[:\\/?*[\]]/;

function createStudent(
  overrides: Partial<EssayCompetenceStudentItem> = {}
): EssayCompetenceStudentItem {
  return {
    studentId: 's1',
    userInstitutionId: 'u1',
    name: 'Maria Silva',
    school: 'Escola Centro',
    schoolYear: '3',
    class: 'A',
    averageScore: 145.6,
    averagePercentage: 72.8,
    performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    essaysCount: 4,
    ...overrides,
  };
}

function createData(
  overrides: Partial<EssayCompetenceDetailsData> = {}
): EssayCompetenceDetailsData {
  return {
    competence: {
      number: 1,
      name: 'Nome vindo do payload, que a tela nao usa',
    },
    classAverage: 140.4,
    classAveragePercentage: 70.2,
    totalEssays: 30,
    totalStudents: 25,
    counters: {
      highlight: 5,
      aboveAverage: 10,
      belowAverage: 7,
      attentionPoint: 3,
    },
    students: {
      data: [createStudent()],
      page: 1,
      limit: 10,
      total: 25,
      ...overrides.students,
    },
    ...overrides,
  };
}

describe('buildSummarySheet', () => {
  it('escreve o titulo da tela e os numeros do subtitulo', () => {
    const sheet = buildSummarySheet(createData(), 'C1 - Dominio da escrita');

    expect(sheet.name).toBe(SUMMARY_SHEET_NAME);
    expect(sheet.headers).toEqual(['Indicador', 'Valor']);
    expect(sheet.rows.slice(0, 3)).toEqual([
      ['Competência', 'C1 - Dominio da escrita'],
      ['Redações', 30],
      ['Alunos', 25],
    ]);
  });

  it('soma destaque e acima da media na linha "Acima da média", como o card faz', () => {
    const sheet = buildSummarySheet(createData(), 'C1 - Dominio da escrita');

    expect(sheet.rows.slice(3)).toEqual([
      ['Acima da média', 15],
      ['Abaixo da média', 7],
      ['Ponto de atenção', 3],
    ]);
  });

  it('não escreve a média da turma, que a tela não desenha', () => {
    const sheet = buildSummarySheet(createData(), 'C1 - Dominio da escrita');

    const labels = sheet.rows.map(([label]) => label);
    expect(labels).not.toContain('Média da turma');
    // Os dois valores de `classAverage`/`classAveragePercentage` do payload.
    const values = sheet.rows.map(([, value]) => value);
    expect(values).not.toContain(140.4);
    expect(values).not.toContain(70.2);
  });

  it('sai só com cabeçalho quando não há dado', () => {
    const sheet = buildSummarySheet(null, 'C1 - Dominio da escrita');

    expect(sheet.name).toBe(SUMMARY_SHEET_NAME);
    expect(sheet.headers).toEqual(['Indicador', 'Valor']);
    expect(sheet.rows).toEqual([]);
  });
});

describe('buildStudentsSheet', () => {
  it('traz as seis colunas da tabela, na ordem da tela', () => {
    const sheet = buildStudentsSheet([createStudent()]);

    expect(sheet.name).toBe(STUDENTS_SHEET_NAME);
    expect(sheet.headers).toEqual([
      'Nome',
      'Escola',
      'Ano',
      'Turma',
      'Média (0-200)',
      'Proficiência',
    ]);
    expect(sheet.rows).toEqual([
      ['Maria Silva', 'Escola Centro', '3', 'A', 146, 'Acima da média'],
    ]);
  });

  it('arredonda a média como a coluna faz, em célula numérica', () => {
    const sheet = buildStudentsSheet([
      createStudent({ averageScore: 149.4 }),
      createStudent({ averageScore: 149.5 }),
    ]);

    expect(sheet.rows.map((row) => row[4])).toEqual([149, 150]);
  });

  it('não escreve o percentual nem a contagem de redações do estudante', () => {
    const sheet = buildStudentsSheet([
      createStudent({ averagePercentage: 72.8, essaysCount: 4 }),
    ]);

    // A tela desenha só `{Math.round(averageScore)}/200` e o badge.
    expect(sheet.rows[0]).toHaveLength(6);
    expect(sheet.rows[0]).not.toContain(73);
    expect(sheet.rows[0]).not.toContain(4);
  });

  it('escreve o rótulo do badge para cada proficiência', () => {
    const sheet = buildStudentsSheet([
      createStudent({ performance: SimulatedPerformanceTag.HIGHLIGHT }),
      createStudent({ performance: SimulatedPerformanceTag.ABOVE_AVERAGE }),
      createStudent({ performance: SimulatedPerformanceTag.BELOW_AVERAGE }),
      createStudent({ performance: SimulatedPerformanceTag.ATTENTION_POINT }),
    ]);

    expect(sheet.rows.map((row) => row[5])).toEqual([
      'Destaque da turma',
      'Acima da média',
      'Abaixo da média',
      'Ponto de atenção',
    ]);
  });

  it('cai no rótulo de desconhecido quando a proficiência não tem configuração', () => {
    const sheet = buildStudentsSheet([
      createStudent({
        performance: 'NAO_MAPEADO' as SimulatedPerformanceTag,
      }),
    ]);

    // Mesmo fallback da coluna "Proficiência" da tela.
    expect(sheet.rows[0][5]).toBe('Desconhecido');
  });

  it('sai só com cabeçalho quando não houve varredura', () => {
    const sheet = buildStudentsSheet(null);

    expect(sheet.rows).toEqual([]);
  });
});

describe('buildEssayCompetenceDetailsSheets', () => {
  it('são sempre duas abas, com dado ou sem', () => {
    const withData = buildEssayCompetenceDetailsSheets(
      createData(),
      'C1 - Dominio da escrita',
      [createStudent()]
    );
    const withoutData = buildEssayCompetenceDetailsSheets(null, '', null);

    expect(withData.map((sheet) => sheet.name)).toEqual([
      SUMMARY_SHEET_NAME,
      STUDENTS_SHEET_NAME,
    ]);
    expect(withoutData.map((sheet) => sheet.name)).toEqual([
      SUMMARY_SHEET_NAME,
      STUDENTS_SHEET_NAME,
    ]);
    expect(withoutData.map((sheet) => sheet.rows)).toEqual([[], []]);
  });

  it('os nomes de aba cabem no que o Excel aceita', () => {
    for (const name of [SUMMARY_SHEET_NAME, STUDENTS_SHEET_NAME]) {
      expect(name.length).toBeLessThanOrEqual(EXCEL_SHEET_NAME_LIMIT);
      expect(name).not.toMatch(FORBIDDEN_SHEET_NAME_CHARS);
    }
  });
});
