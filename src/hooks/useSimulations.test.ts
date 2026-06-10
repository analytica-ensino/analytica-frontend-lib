import { renderHook } from '@testing-library/react';
import { createUseSimulations } from './useSimulations';
import type { BaseApiClient } from '../types/api';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

describe('createUseSimulations', () => {
  it('fetchStudents calls the students endpoint and unwraps the page', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          students: {
            data: [{ userInstitutionId: 'ui-1' }],
            page: 1,
            limit: 20,
            total: 1,
          },
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const page = await result.current.fetchStudents({
      page: 1,
      limit: 20,
      search: 'ana',
    });

    expect(api.get).toHaveBeenCalledWith('/performance/simulations/students', {
      params: { page: 1, limit: 20, search: 'ana', classIds: undefined },
    });
    expect(page.total).toBe(1);
  });

  it('fetchStudentSimulations calls the per-student endpoint', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          student: {
            userInstitutionId: 'ui-1',
            name: 'Ana',
            simulationsAnswered: 2,
          },
          simulations: { data: [], page: 1, limit: 20, total: 2 },
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.fetchStudentSimulations('ui-1', {
      page: 1,
      limit: 20,
    });

    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1',
      {
        params: { page: 1, limit: 20 },
      }
    );
    expect(data.student.simulationsAnswered).toBe(2);
  });

  it('fetchSimulationDetail calls the detail endpoint', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: { simulationId: 'sim-1', title: 'S1', counts: {}, questions: [] },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.fetchSimulationDetail('ui-1', 'sim-1');

    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1'
    );
    expect(data.simulationId).toBe('sim-1');
  });

  it('saveNote posts the note', async () => {
    const api = makeApi();
    api.post.mockResolvedValue({
      data: { message: 'ok', data: { id: 'n1', note: 'Boa' } },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.saveNote('ui-1', 'sim-1', 'Boa');

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1/note',
      { note: 'Boa' }
    );
    expect(data?.note).toBe('Boa');
  });
});
