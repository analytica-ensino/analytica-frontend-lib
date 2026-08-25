import {
  SUMMARY_SHEET_NAME,
  STUDENTS_SHEET_NAME,
  buildSummarySheet,
  buildStudentsSheet,
  buildSimulatedContentDetailsSheets,
} from './exportSheets';
import type { ContentDetailsData, ContentStudentItem } from './types';

function createStudent(
  overrides: Partial<ContentStudentItem> = {}
): ContentStudentItem {
  return {
    studentId: 'student-1',
    institutionId: 'inst-1',
    userInstitutionId: 'user-inst-1',
    name: 'Maria Silva',
    school: 'Escola Centro',
    schoolYear: '3',
    class: 'A',
    average: 742.4,
    performance: 71.6,
    ...overrides,
  };
}

function createData(): ContentDetailsData {
  return {
    content: {
      id: 'content-1',
      name: 'Leitura e interpretação',
      bnccCode: 'EM13LP01',
      subject: { id: 'subject-1', name: 'Linguagens' },
      questionsCount: 18,
      studentsCount: 12,
    },
    counters: {
      aboveAverage: 4,
      atAverage: 5,
      belowAverage: 3,
    },
    students: {
      data: [createStudent()],
      page: 1,
      limit: 10,
      total: 12,
    },
  };
}

describe('exportSheets do SimulatedContentDetailsModal', () => {
  describe('nomes das abas', () => {
    it('usa os dois nomes, nesta ordem, e nenhum outro', () => {
      const sheets = buildSimulatedContentDetailsSheets(
        createData(),
        'Leitura e interpretação',
        [createStudent()]
      );

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo da competência',
        'Desempenho por estudante',
      ]);
    });

    it('cabe no limite do Excel e não usa caractere proibido', () => {
      // Acima de 31 caracteres, ou com um destes caracteres, o arquivo INTEIRO
      // deixa de abrir — não é só a aba que sai com outro nome.
      const forbidden = /[:\\/?*[\]]/;

      for (const name of [SUMMARY_SHEET_NAME, STUDENTS_SHEET_NAME]) {
        expect(name.length).toBeLessThanOrEqual(31);
        expect(name).not.toMatch(forbidden);
      }
    });
  });

  describe('aba de resumo', () => {
    it('leva o card de cabeçalho e os três contadores, na ordem da tela', () => {
      const sheet = buildSummarySheet(createData(), 'Leitura e interpretação');

      expect(sheet).toEqual({
        name: 'Resumo da competência',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Competência', 'Leitura e interpretação'],
          ['Código BNCC', 'EM13LP01'],
          ['Matéria', 'Linguagens'],
          ['Questões', 18],
          ['Alunos', 12],
          ['Acima da média', 4],
          ['Na média', 5],
          ['Abaixo da média', 3],
        ],
      });
    });

    it('escreve o nome que a tela está exibindo, não o que veio da API', () => {
      const data = createData();
      data.content.name = '';

      const sheet = buildSummarySheet(data, 'Nome vindo da prop');

      expect(sheet.rows[0]).toEqual(['Competência', 'Nome vindo da prop']);
    });

    it('omite a linha do código BNCC quando ele vem nulo, como a tela faz', () => {
      const data = createData();
      data.content.bnccCode = null;

      const sheet = buildSummarySheet(data, 'Leitura e interpretação');

      expect(sheet.rows.map(([label]) => label)).not.toContain('Código BNCC');
      expect(sheet.rows[0]).toEqual(['Competência', 'Leitura e interpretação']);
      expect(sheet.rows[1]).toEqual(['Matéria', 'Linguagens']);
    });

    it('sai só com cabeçalho quando não há dado carregado', () => {
      const sheet = buildSummarySheet(null, '');

      expect(sheet).toEqual({
        name: 'Resumo da competência',
        headers: ['Indicador', 'Valor'],
        rows: [],
      });
    });
  });

  describe('aba de estudantes', () => {
    it('leva uma linha por estudante, com as colunas da tabela', () => {
      const sheet = buildStudentsSheet([
        createStudent(),
        createStudent({
          studentId: 'student-2',
          name: 'João Souza',
          school: 'Escola Norte',
          schoolYear: '2',
          class: 'B',
          average: 610.5,
          performance: 48.2,
        }),
      ]);

      expect(sheet).toEqual({
        name: 'Desempenho por estudante',
        headers: ['Nome', 'Escola', 'Ano', 'Turma', 'Média', 'Desempenho (%)'],
        rows: [
          ['Maria Silva', 'Escola Centro', '3', 'A', 742, 72],
          ['João Souza', 'Escola Norte', '2', 'B', 611, 48],
        ],
      });
    });

    it('sai só com cabeçalho quando a lista é nula ou vazia', () => {
      expect(buildStudentsSheet(null).rows).toEqual([]);
      expect(buildStudentsSheet([]).rows).toEqual([]);
      expect(buildStudentsSheet(null).headers).toEqual([
        'Nome',
        'Escola',
        'Ano',
        'Turma',
        'Média',
        'Desempenho (%)',
      ]);
    });

    it('leva a lista recebida inteira, e não a página que o resumo carrega', () => {
      // A tabela da tela mostra 10 por página; o XLSX leva o varrimento
      // completo, então a aba tem mais linhas do que `data.students.data`.
      const allStudents = Array.from({ length: 25 }, (_, index) =>
        createStudent({ studentId: `student-${index}`, name: `Aluno ${index}` })
      );

      const sheets = buildSimulatedContentDetailsSheets(
        createData(),
        'Leitura e interpretação',
        allStudents
      );

      expect(sheets[1].rows).toHaveLength(25);
      expect(sheets[1].rows[24][0]).toBe('Aluno 24');
    });
  });

  it('não estoura com dado ausente nos dois lados', () => {
    const sheets = buildSimulatedContentDetailsSheets(null, '', null);

    expect(sheets.map((sheet) => sheet.name)).toEqual([
      'Resumo da competência',
      'Desempenho por estudante',
    ]);
    expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
  });
});
