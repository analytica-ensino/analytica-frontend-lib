import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LessonTopicsPage } from './LessonTopicsPage';
import type { BaseApiClient } from '../../types/api';
import type { TopicsApiResponse } from '../../types/lessonsCatalog';

const ROUTES = {
  root: '/aulas',
  topics: (subjectId: string) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId: string, subtopicId: string) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

const TOPICS: TopicsApiResponse = {
  message: 'ok',
  data: [
    {
      id: 's-1',
      name: 'Física',
      color: '#abc',
      icon: 'Atom',
      topics: [
        {
          id: 't-1',
          name: 'Cinemática',
          subtopics: [
            {
              id: 'sub-1',
              name: 'MRU',
              finishedLessons: 3,
              totalLessons: 6,
              lessons: [],
            },
          ],
        },
      ],
    },
  ],
};

const EMPTY_SEARCH = {
  data: {
    message: 'ok',
    data: {
      lessons: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  },
};

function makeApi(
  topics: TopicsApiResponse = TOPICS
): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn((url: string) => {
      if (url.startsWith('/knowledge/by-subject')) {
        return Promise.resolve({ data: topics });
      }
      return Promise.resolve(EMPTY_SEARCH);
    }),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderPage(
  api: jest.Mocked<BaseApiClient>,
  mode: 'student' | 'preview' = 'student'
) {
  return render(
    <MemoryRouter initialEntries={['/aulas/s-1/topicos']}>
      <Routes>
        <Route
          path="/aulas/:subjectId/topicos"
          element={<LessonTopicsPage api={api} routes={ROUTES} mode={mode} />}
        />
        <Route path="/aulas" element={<LocationProbe />} />
        <Route
          path="/aulas/:subjectId/topicos/:topicId/licoes"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('LessonTopicsPage', () => {
  it('loads the subject topics and renders its subtopics', async () => {
    const api = makeApi();
    renderPage(api);

    expect(await screen.findByText('Cinemática')).toBeInTheDocument();
    expect(screen.getByText('MRU')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/knowledge/by-subject/s-1');
  });

  it('shows the completion counter in student mode', async () => {
    const api = makeApi();
    renderPage(api, 'student');

    expect(await screen.findByText('3 de 6')).toBeInTheDocument();
  });

  it('shows the lesson count instead of a counter in preview mode', async () => {
    const api = makeApi();
    renderPage(api, 'preview');

    // "0 de 6" would read as a stalled student rather than a catalogue entry.
    expect(await screen.findByText('6 aulas')).toBeInTheDocument();
    expect(screen.queryByText('3 de 6')).not.toBeInTheDocument();
  });

  it('uses the singular for a single lesson', async () => {
    const api = makeApi({
      ...TOPICS,
      data: [
        {
          ...TOPICS.data[0],
          topics: [
            {
              id: 't-1',
              name: 'Cinemática',
              subtopics: [
                {
                  id: 'sub-1',
                  name: 'MRU',
                  finishedLessons: 0,
                  totalLessons: 1,
                  lessons: [],
                },
              ],
            },
          ],
        },
      ],
    });
    renderPage(api, 'preview');

    expect(await screen.findByText('1 aula')).toBeInTheDocument();
  });

  it('navigates to the subtopic lessons on click', async () => {
    const api = makeApi();
    renderPage(api);

    fireEvent.click(await screen.findByText('MRU'));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aulas/s-1/topicos/sub-1/licoes'
      )
    );
  });

  it('goes back to the catalogue root from the breadcrumb', async () => {
    const api = makeApi();
    renderPage(api);

    await screen.findByText('MRU');
    fireEvent.click(screen.getByText('Aulas'));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/aulas')
    );
  });

  it('surfaces a forbidden subject as an error with a retry', async () => {
    const api = makeApi();
    api.get.mockRejectedValue({
      response: {
        data: {
          message: 'Usuário não possui acesso a este componente curricular',
        },
      },
    });
    renderPage(api, 'preview');

    // A teacher drilling into a subject they do not teach gets a 403.
    expect(await screen.findByText('Erro ao carregar temas')).toBeInTheDocument();
    expect(
      screen.getByText('Usuário não possui acesso a este componente curricular')
    ).toBeInTheDocument();
  });

  it('renders the empty state when the subject has no topics', async () => {
    const api = makeApi({ message: 'ok', data: [] });
    renderPage(api);

    expect(await screen.findByText('Nenhum tema disponível')).toBeInTheDocument();
  });

  it('filters the subtopics as the user types', async () => {
    const api = makeApi({
      ...TOPICS,
      data: [
        {
          ...TOPICS.data[0],
          topics: [
            {
              id: 't-1',
              name: 'Cinemática',
              subtopics: [
                {
                  id: 'sub-1',
                  name: 'MRU',
                  finishedLessons: 0,
                  totalLessons: 2,
                  lessons: [],
                },
                {
                  id: 'sub-2',
                  name: 'Queda livre',
                  finishedLessons: 0,
                  totalLessons: 2,
                  lessons: [],
                },
              ],
            },
          ],
        },
      ],
    });
    renderPage(api, 'preview');

    await screen.findByText('MRU');

    fireEvent.change(screen.getByPlaceholderText('Buscar tema ou aula'), {
      target: { value: 'Queda' },
    });

    await waitFor(() => expect(screen.getByText('Temas')).toBeInTheDocument());
    expect(screen.queryByText('MRU')).not.toBeInTheDocument();
  });
});
