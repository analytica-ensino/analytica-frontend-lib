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

  it('fetchStudents sends classIds as CSV, never as an array', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          students: { data: [], page: 1, limit: 20, total: 0 },
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    await result.current.fetchStudents({ classIds: ['c1', 'c2'] });

    const params = api.get.mock.calls[0][1]?.params as {
      classIds?: unknown;
    };
    // An array here would be serialized by axios as `classIds[]=c1&classIds[]=c2`,
    // a key the backend query schema does not declare, so the class filter would
    // be dropped and every class of the teacher returned instead.
    expect(Array.isArray(params.classIds)).toBe(false);
    expect(params.classIds).toBe('c1,c2');
  });

  it('fetchStudents omits classIds when nothing is selected', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          students: { data: [], page: 1, limit: 20, total: 0 },
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    await result.current.fetchStudents({ classIds: [] });

    const params = api.get.mock.calls[0][1]?.params as {
      classIds?: unknown;
    };
    expect(params.classIds).toBeUndefined();
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
        data: {
          simulationId: 'sim-1',
          title: 'S1',
          counts: { correct: 0, incorrect: 0, blank: 0 },
          questions: [],
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.fetchSimulationDetail('ui-1', 'sim-1');

    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1'
    );
    expect(data.simulationId).toBe('sim-1');
  });

  it('fetchNote calls the note endpoint and unwraps nullable data', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          id: 'n1',
          activityId: 'sim-1',
          studentUserInstitutionId: 'ui-1',
          note: 'Boa',
          updatedAt: '2026-06-10T00:00:00.000Z',
        },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.fetchNote('ui-1', 'sim-1');

    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1/note'
    );
    expect(data?.note).toBe('Boa');
  });

  it('saveNote posts the note with its attachment URL (null when none)', async () => {
    const api = makeApi();
    api.post.mockResolvedValue({
      data: {
        message: 'ok',
        data: { id: 'n1', note: 'Boa', attachment: null },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.saveNote('ui-1', 'sim-1', 'Boa', null);

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1/note',
      { note: 'Boa', attachment: null }
    );
    expect(data?.note).toBe('Boa');

    await result.current.saveNote(
      'ui-1',
      'sim-1',
      'Boa',
      'https://cdn.example.com/notes/plano.png'
    );
    expect(api.post).toHaveBeenLastCalledWith(
      '/performance/simulations/students/ui-1/sim-1/note',
      { note: 'Boa', attachment: 'https://cdn.example.com/notes/plano.png' }
    );
  });

  describe('uploadNoteAttachment', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('asks for a pre-signed URL, PUTs the bytes there and returns the public URL', async () => {
      const api = makeApi();
      api.post.mockResolvedValue({
        data: {
          data: {
            signedUrl: 'https://storage.example.com/signed',
            publicUrl: 'https://cdn.example.com/notes/plano.png',
          },
        },
      });
      const fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
      globalThis.fetch = fetchMock as unknown as typeof fetch;
      const file = new File(['png'], 'plano.png', { type: 'image/png' });
      const { result } = renderHook(() => createUseSimulations(api)());

      const url = await result.current.uploadNoteAttachment(file);

      expect(api.post).toHaveBeenCalledWith('/user/get-pre-signed-url', {
        fileName: 'plano.png',
        mimeType: 'image/png',
        fileSize: file.size,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://storage.example.com/signed',
        { method: 'PUT', body: file, headers: { 'Content-Type': 'image/png' } }
      );
      expect(url).toBe('https://cdn.example.com/notes/plano.png');
    });

    it('throws when storage refuses the upload', async () => {
      const api = makeApi();
      api.post.mockResolvedValue({
        data: {
          data: {
            signedUrl: 'https://storage.example.com/signed',
            publicUrl: 'https://cdn.example.com/notes/plano.png',
          },
        },
      });
      globalThis.fetch = jest.fn(() =>
        Promise.resolve({ ok: false })
      ) as unknown as typeof fetch;
      const file = new File(['png'], 'plano.png', { type: 'image/png' });
      const { result } = renderHook(() => createUseSimulations(api)());

      await expect(result.current.uploadNoteAttachment(file)).rejects.toThrow(
        'Falha ao fazer upload do arquivo'
      );
    });
  });

  it('saveQuestionComment posts the comment for one question', async () => {
    const api = makeApi();
    api.post.mockResolvedValue({
      data: {
        message: 'ok',
        data: { questionId: 'q-1', teacherComment: 'Revise a soma.' },
      },
    });
    const { result } = renderHook(() => createUseSimulations(api)());

    const data = await result.current.saveQuestionComment(
      'ui-1',
      'sim-1',
      'q-1',
      'Revise a soma.'
    );

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1/questions/q-1/comment',
      { comment: 'Revise a soma.' }
    );
    expect(data?.teacherComment).toBe('Revise a soma.');
  });

  it('saveQuestionComment encodes path segments', async () => {
    const api = makeApi();
    api.post.mockResolvedValue({ data: { message: 'ok', data: null } });
    const { result } = renderHook(() => createUseSimulations(api)());

    await result.current.saveQuestionComment('ui/1', 'sim 1', 'q#1', '');

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulations/students/ui%2F1/sim%201/questions/q%231/comment',
      { comment: '' }
    );
  });
});
