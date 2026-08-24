import {
  COMPETENCE_DETAILS_ENDPOINT,
  buildCompetenceDetailsBody,
  fetchAllCompetenceStudents,
} from './competenceDetailsRequest';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type { BaseApiClient } from '../../types/api';
import type {
  EssayCompetenceDetailsApiResponse,
  EssayCompetenceStudentItem,
} from './types';

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function createStudent(name: string): EssayCompetenceStudentItem {
  return {
    studentId: `s-${name}`,
    userInstitutionId: `u-${name}`,
    name,
    school: 'Escola Centro',
    schoolYear: '3',
    class: 'A',
    averageScore: 150,
    averagePercentage: 75,
    performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    essaysCount: 2,
  };
}

/** Uma resposta do endpoint, como a varredura a recebe. */
function createPageResponse(
  students: EssayCompetenceStudentItem[],
  page: number,
  limit: number,
  total: number
): { data: EssayCompetenceDetailsApiResponse } {
  return {
    data: {
      message: 'Success',
      data: {
        competence: { number: 1, name: 'Competência 1' },
        classAverage: 140,
        classAveragePercentage: 70,
        totalEssays: 30,
        totalStudents: total,
        counters: {
          highlight: 1,
          aboveAverage: 2,
          belowAverage: 3,
          attentionPoint: 4,
        },
        students: { data: students, page, limit, total },
      },
    },
  };
}

describe('buildCompetenceDetailsBody', () => {
  it('troca listas ausentes por vazias e aplica os padrões de ordenação', () => {
    const body = buildCompetenceDetailsBody(
      { competenceNumber: 2, period: '1_MONTH' },
      { page: 3, limit: 100 }
    );

    expect(body).toEqual({
      competenceNumber: 2,
      period: '1_MONTH',
      schoolIds: [],
      schoolYearIds: [],
      classIds: [],
      page: 3,
      limit: 100,
      orderBy: 'averageScore',
      order: 'desc',
    });
  });

  it('a paginação vem do segundo parâmetro, não dos campos de params', () => {
    const body = buildCompetenceDetailsBody(
      { competenceNumber: 1, period: '1_MONTH', page: 1, limit: 10 },
      { page: 4, limit: 100 }
    );

    expect(body.page).toBe(4);
    expect(body.limit).toBe(100);
  });

  it('repassa os filtros e a ordenação que o chamador informa', () => {
    const body = buildCompetenceDetailsBody(
      {
        competenceNumber: 5,
        period: '3_MONTHS',
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
        orderBy: 'name',
        order: 'asc',
      },
      { page: 1, limit: 20 }
    );

    expect(body).toMatchObject({
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1', 'class-2'],
      orderBy: 'name',
      order: 'asc',
    });
  });
});

describe('fetchAllCompetenceStudents', () => {
  it('varre todas as páginas e devolve a tabela inteira, na ordem das páginas', async () => {
    const api = createMockApi();
    // 150 registros a 100 por página: `Math.ceil(150 / 100)` = duas páginas.
    api.post
      .mockResolvedValueOnce(
        createPageResponse(
          [createStudent('A'), createStudent('B')],
          1,
          100,
          150
        )
      )
      .mockResolvedValueOnce(
        createPageResponse([createStudent('C')], 2, 100, 150)
      );

    const students = await fetchAllCompetenceStudents(api, {
      competenceNumber: 1,
      period: '1_MONTH',
    });

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(students.map((student) => student.name)).toEqual(['A', 'B', 'C']);
  });

  it('pede o teto de 100 por página, e não o limite que a tela usa', async () => {
    const api = createMockApi();
    api.post.mockResolvedValue(
      createPageResponse([createStudent('A')], 1, 100, 1)
    );

    await fetchAllCompetenceStudents(api, {
      competenceNumber: 1,
      period: '1_MONTH',
      page: 2,
      limit: 10,
    });

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(
      COMPETENCE_DETAILS_ENDPOINT,
      expect.objectContaining({ page: 1, limit: 100 })
    );
  });

  it('leva os mesmos filtros da tela para cada página', async () => {
    const api = createMockApi();
    api.post.mockResolvedValue(
      createPageResponse([createStudent('A')], 1, 100, 150)
    );

    await fetchAllCompetenceStudents(api, {
      competenceNumber: 4,
      period: '6_MONTHS',
      schoolIds: ['school-1'],
      classIds: ['class-1'],
    });

    // 150 registros a 100 por página: duas requisições.
    expect(api.post).toHaveBeenCalledTimes(2);
    for (const [, body] of api.post.mock.calls) {
      expect(body).toMatchObject({
        competenceNumber: 4,
        period: '6_MONTHS',
        schoolIds: ['school-1'],
        classIds: ['class-1'],
      });
    }
    expect(
      api.post.mock.calls.map(([, body]) => (body as { page: number }).page)
    ).toEqual([1, 2]);
  });

  it('propaga a falha de uma página em vez de devolver planilha truncada', async () => {
    const api = createMockApi();
    api.post.mockRejectedValue(new Error('Falha de rede'));

    await expect(
      fetchAllCompetenceStudents(api, {
        competenceNumber: 1,
        period: '1_MONTH',
      })
    ).rejects.toThrow('Falha de rede');
  });
});
