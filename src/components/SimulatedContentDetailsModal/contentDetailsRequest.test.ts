import {
  buildContentDetailsEndpoint,
  buildContentDetailsBody,
  fetchAllContentStudents,
} from './contentDetailsRequest';
import type {
  ContentDetailsApiResponse,
  ContentDetailsParams,
  ContentStudentItem,
} from './types';
import type { BaseApiClient } from '../../types/api';

const ENDPOINT = '/performance/simulated/activities/content-details';

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function createStudent(name: string): ContentStudentItem {
  return {
    studentId: `id-${name}`,
    institutionId: 'inst-1',
    userInstitutionId: `user-${name}`,
    name,
    school: 'Escola Centro',
    schoolYear: '3',
    class: 'A',
    average: 700,
    performance: 70,
  };
}

/** Resposta do endpoint com uma página de estudantes e o `total` do conjunto. */
function createResponse(
  students: ContentStudentItem[],
  page: number,
  limit: number,
  total: number
): { data: ContentDetailsApiResponse } {
  return {
    data: {
      message: 'Success',
      data: {
        content: {
          id: 'content-1',
          name: 'Leitura e interpretação',
          bnccCode: 'EM13LP01',
          subject: { id: 'subject-1', name: 'Linguagens' },
          questionsCount: 18,
          studentsCount: total,
        },
        counters: { aboveAverage: 1, atAverage: 1, belowAverage: 1 },
        students: { data: students, page, limit, total },
      },
    },
  };
}

const baseParams: ContentDetailsParams = {
  activityFilters: { types: ['SIMULADO'], statuses: ['CONCLUIDA'] },
  contentId: 'content-1',
  period: '1_MONTH',
  schoolIds: ['school-1'],
  schoolYearIds: ['year-1'],
  classIds: ['class-1'],
  page: 2,
  limit: 10,
};

describe('buildContentDetailsEndpoint', () => {
  it('acrescenta um parâmetro por filtro de atividade', () => {
    expect(
      buildContentDetailsEndpoint({
        types: ['SIMULADO'],
        subtypes: ['ENEM_PROVA_1'],
        statuses: ['CONCLUIDA'],
      })
    ).toBe(
      `${ENDPOINT}?types=SIMULADO&subtypes=ENEM_PROVA_1&statuses=CONCLUIDA`
    );
  });

  it('não deixa "?" pendurado quando não há filtro nenhum', () => {
    expect(buildContentDetailsEndpoint({})).toBe(ENDPOINT);
  });
});

describe('buildContentDetailsBody', () => {
  it('usa a paginação recebida, e não a que veio nos parâmetros', () => {
    const body = buildContentDetailsBody(baseParams, { page: 3, limit: 100 });

    expect(body).toEqual({
      contentId: 'content-1',
      period: '1_MONTH',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      studentsIds: undefined,
      page: 3,
      limit: 100,
      orderBy: undefined,
      order: undefined,
    });
  });
});

describe('fetchAllContentStudents', () => {
  let api: jest.Mocked<BaseApiClient>;

  beforeEach(() => {
    api = createMockApi();
  });

  it('varre todas as páginas e devolve as linhas na ordem das páginas', async () => {
    // 250 no total, 100 por requisição: três páginas.
    api.post
      .mockResolvedValueOnce(createResponse([createStudent('p1')], 1, 100, 250))
      .mockResolvedValueOnce(createResponse([createStudent('p2')], 2, 100, 250))
      .mockResolvedValueOnce(
        createResponse([createStudent('p3')], 3, 100, 250)
      );

    const students = await fetchAllContentStudents(api, baseParams);

    expect(students.map((student) => student.name)).toEqual(['p1', 'p2', 'p3']);
    expect(api.post).toHaveBeenCalledTimes(3);
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      `${ENDPOINT}?types=SIMULADO&statuses=CONCLUIDA`,
      expect.objectContaining({ page: 1, limit: 100 })
    );
    expect(api.post).toHaveBeenNthCalledWith(
      3,
      `${ENDPOINT}?types=SIMULADO&statuses=CONCLUIDA`,
      expect.objectContaining({ page: 3, limit: 100 })
    );
  });

  it('manda os mesmos filtros que a tela manda', async () => {
    api.post.mockResolvedValueOnce(
      createResponse([createStudent('p1')], 1, 100, 1)
    );

    await fetchAllContentStudents(api, baseParams);

    expect(api.post).toHaveBeenCalledWith(
      `${ENDPOINT}?types=SIMULADO&statuses=CONCLUIDA`,
      expect.objectContaining({
        contentId: 'content-1',
        period: '1_MONTH',
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
      })
    );
  });

  it('faz uma requisição só quando tudo cabe numa página', async () => {
    api.post.mockResolvedValueOnce(
      createResponse([createStudent('p1')], 1, 100, 40)
    );

    const students = await fetchAllContentStudents(api, baseParams);

    expect(students).toHaveLength(1);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há estudante nenhum', async () => {
    api.post.mockResolvedValueOnce(createResponse([], 1, 100, 0));

    await expect(fetchAllContentStudents(api, baseParams)).resolves.toEqual([]);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('propaga a falha de uma página em vez de devolver planilha truncada', async () => {
    api.post
      .mockResolvedValueOnce(createResponse([createStudent('p1')], 1, 100, 250))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(
        createResponse([createStudent('p3')], 3, 100, 250)
      );

    await expect(fetchAllContentStudents(api, baseParams)).rejects.toThrow(
      'Network error'
    );
  });
});
