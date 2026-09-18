import { renderHook, act } from '@testing-library/react';
import {
  createUseClassTopics,
  transformTopicsResponse,
} from './useClassTopics';
import type { BaseApiClient } from '../types/api';
import type { TopicsApiResponse } from '../types/lessonsCatalog';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

const RESPONSE: TopicsApiResponse = {
  message: 'ok',
  data: [
    {
      id: 'subject-1',
      name: 'Física',
      color: '#abc',
      icon: 'Atom',
      topics: [
        {
          id: 'topic-1',
          name: 'Cinemática',
          subtopics: [
            {
              id: 'sub-1',
              name: 'MRU',
              finishedLessons: 3,
              totalLessons: 6,
              lessons: [],
            },
            {
              id: 'sub-2',
              name: 'MRUV',
              finishedLessons: 0,
              totalLessons: 0,
              lessons: [],
            },
          ],
        },
        {
          id: 'topic-2',
          name: 'Dinâmica',
          subtopics: [
            {
              id: 'sub-3',
              name: 'Leis de Newton',
              finishedLessons: 1,
              totalLessons: 4,
              lessons: [],
            },
          ],
        },
      ],
    },
  ],
};

describe('transformTopicsResponse', () => {
  it('turns each topic into a category of subtopic cards', () => {
    const data = transformTopicsResponse(RESPONSE, 'subject-1');

    expect(data.subjectName).toBe('Física');
    expect(data.categories.map((c) => c.name)).toEqual([
      'Cinemática',
      'Dinâmica',
    ]);
    expect(data.categories[0].topics.map((t) => t.name)).toEqual([
      'MRU',
      'MRUV',
    ]);
  });

  it('computes the completion percentage per subtopic', () => {
    const data = transformTopicsResponse(RESPONSE, 'subject-1');

    expect(data.categories[0].topics[0].progress).toBe(50);
    // No lessons must not divide by zero.
    expect(data.categories[0].topics[1].progress).toBe(0);
  });

  it('preserves the curriculum order the API sent', () => {
    // Both levels follow the trail's `position`, i.e. the BNCC sequence.
    // Sorting alphabetically would put "Dinâmica" before "Cinemática".
    const data = transformTopicsResponse(RESPONSE, 'subject-1');
    expect(data.categories[0].name).toBe('Cinemática');
  });

  it('returns an empty shape when the subject has no data', () => {
    const data = transformTopicsResponse(
      { message: 'ok', data: [] },
      'subject-9'
    );

    expect(data).toEqual({
      subjectId: 'subject-9',
      subjectName: '',
      subjectIcon: undefined,
      subjectColor: undefined,
      categories: [],
    });
  });

  it('falls back to a default icon and colour', () => {
    const data = transformTopicsResponse(
      {
        message: 'ok',
        data: [{ id: 's', name: 'X', color: '', icon: '', topics: [] }],
      },
      's'
    );

    expect(data.subjectIcon).toBe('BookOpen');
    expect(data.subjectColor).toBe('#B7DFFF');
  });
});

describe('createUseClassTopics', () => {
  it('fetches the topics of a subject', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: RESPONSE });
    const { result } = renderHook(() => createUseClassTopics(api)());

    await act(async () => {
      await result.current.fetchTopics('subject-1');
    });

    expect(api.get).toHaveBeenCalledWith('/knowledge/by-subject/subject-1');
    expect(result.current.data?.categories).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });

  it('surfaces the API message when the subject is forbidden', async () => {
    const api = makeApi();
    // A teacher drilling into a subject they do not teach gets a 403.
    api.get.mockRejectedValue({
      response: {
        data: {
          message: 'Usuário não possui acesso a este componente curricular',
        },
      },
    });
    const { result } = renderHook(() => createUseClassTopics(api)());

    await act(async () => {
      await result.current.fetchTopics('subject-9');
    });

    expect(result.current.error).toBe(
      'Usuário não possui acesso a este componente curricular'
    );
  });

  it('falls back to a generic message', async () => {
    const api = makeApi();
    api.get.mockRejectedValue({ response: {} });
    const { result } = renderHook(() => createUseClassTopics(api)());

    await act(async () => {
      await result.current.fetchTopics('subject-1');
    });

    expect(result.current.error).toBe('Erro ao carregar os temas');
  });

  it('uses the Error message when one is thrown', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => createUseClassTopics(api)());

    await act(async () => {
      await result.current.fetchTopics('subject-1');
    });

    expect(result.current.error).toBe('network down');
  });

  describe('searchTopics', () => {
    it('matches subtopics across categories', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({ data: RESPONSE });
      const { result } = renderHook(() => createUseClassTopics(api)());

      await act(async () => {
        await result.current.fetchTopics('subject-1');
      });

      expect(result.current.searchTopics('newton').map((t) => t.id)).toEqual([
        'sub-3',
      ]);
    });

    it('returns nothing without data or with a blank term', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassTopics(api)());

      expect(result.current.searchTopics('mru')).toEqual([]);
    });
  });

  it('clears the error and resets the state', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: RESPONSE });
    const { result } = renderHook(() => createUseClassTopics(api)());

    await act(async () => {
      await result.current.fetchTopics('subject-1');
    });

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();

    act(() => result.current.resetState());
    expect(result.current.data).toBeNull();
  });
});
