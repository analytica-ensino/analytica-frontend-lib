import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LessonsCatalogPage } from './LessonsCatalogPage';
import type { BaseApiClient } from '../../types/api';
import type { KnowledgeArea } from '../../types/lessonsCatalog';

const ROUTES = {
  root: '/aulas',
  topics: (subjectId: string) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId: string, subtopicId: string) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

const AREAS: KnowledgeArea[] = [
  {
    id: 'area-1',
    name: 'Ciências da Natureza',
    subjects: [
      {
        id: 's-1',
        name: 'Biologia',
        color: '#0f0',
        icon: 'Dna',
        progress: { totalLessons: 10, completedLessons: 5, percentage: 50 },
      },
    ],
  },
];

const LESSON = {
  lessonId: 'lesson-1',
  videoTitle: 'Aula de DNA',
  areaKnowledge: { id: 'area-1', name: 'Ciências' },
  subject: { id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
  topic: { id: 't-1', name: 'Genética' },
  subtopic: { id: 'sub-1', name: 'DNA' },
  content: { id: 'c-1', name: 'Estrutura do DNA', bnccCode: 'EM13CNT' },
};

/** Areas as the backend returns them for a teacher: no progress field. */
const AREAS_WITHOUT_PROGRESS: KnowledgeArea[] = [
  {
    id: 'area-1',
    name: 'Ciências da Natureza',
    subjects: [{ id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' }],
  },
];

function makeApi(areas: KnowledgeArea[] = AREAS): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn((url: string) => {
      if (url === '/knowledge') {
        return Promise.resolve({ data: { message: 'ok', data: areas } });
      }
      return Promise.resolve({
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
      });
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
    <MemoryRouter initialEntries={['/aulas']}>
      <Routes>
        <Route
          path="/aulas"
          element={<LessonsCatalogPage api={api} routes={ROUTES} mode={mode} />}
        />
        <Route path="/aulas/:subjectId/topicos" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LessonsCatalogPage', () => {
  it('loads and lists the subjects grouped by knowledge area', async () => {
    const api = makeApi();
    renderPage(api);

    expect(await screen.findByText('Ciências da Natureza')).toBeInTheDocument();
    expect(screen.getByText('Biologia')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/knowledge');
  });

  it('navigates to the subject topics on click', async () => {
    const api = makeApi();
    renderPage(api);

    fireEvent.click(await screen.findByText('Biologia'));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aulas/s-1/topicos'
      )
    );
  });

  it('shows the progress bar in student mode', async () => {
    const api = makeApi();
    renderPage(api, 'student');

    await screen.findByText('Biologia');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('hides the progress bar in preview mode', async () => {
    const api = makeApi(AREAS_WITHOUT_PROGRESS);
    renderPage(api, 'preview');

    await screen.findByText('Biologia');
    // A teacher owns no progress; a bar pinned at 0% would misread as a
    // stalled student.
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('does not crash on subjects that carry no progress', async () => {
    const api = makeApi(AREAS_WITHOUT_PROGRESS);
    renderPage(api, 'student');

    // The field is absent for teachers and managers; reading it unguarded
    // used to be a TypeError.
    expect(await screen.findByText('Biologia')).toBeInTheDocument();
  });

  it('renders the empty state when the matrix is empty', async () => {
    const api = makeApi([]);
    renderPage(api);

    expect(
      await screen.findByText('Nenhum componente curricular disponível')
    ).toBeInTheDocument();
  });

  it('shows an error with a retry action', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('403'));
    renderPage(api);

    expect(
      await screen.findByText('Erro ao carregar aulas')
    ).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();

    api.get.mockResolvedValue({ data: { message: 'ok', data: AREAS } });
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByText('Biologia')).toBeInTheDocument();
  });

  it('shows matched lessons alongside the subjects', async () => {
    const api = makeApi();
    api.get.mockImplementation((url: string) => {
      if (url === '/knowledge') {
        return Promise.resolve({ data: { message: 'ok', data: AREAS } });
      }
      return Promise.resolve({
        data: {
          message: 'ok',
          data: {
            lessons: [
              {
                lessonId: 'lesson-1',
                videoTitle: 'Aula de DNA',
                areaKnowledge: { id: 'area-1', name: 'Ciências' },
                subject: {
                  id: 's-1',
                  name: 'Biologia',
                  color: '#0f0',
                  icon: 'Dna',
                },
                topic: { id: 't-1', name: 'Genética' },
                subtopic: { id: 'sub-1', name: 'DNA' },
                content: {
                  id: 'c-1',
                  name: 'Estrutura do DNA',
                  bnccCode: 'EM13CNT',
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        },
      });
    });

    renderPage(api, 'preview');
    await screen.findByText('Biologia');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar componente curricular ou aula'),
      { target: { value: 'DNA' } }
    );

    expect(await screen.findByText('Estrutura do DNA')).toBeInTheDocument();
  });

  it('não conta as aulas do termo anterior enquanto a nova busca está em voo', async () => {
    const lessonsPayload = (lessons: unknown[]) => ({
      data: {
        message: 'ok',
        data: {
          lessons,
          pagination: {
            page: 1,
            limit: 20,
            total: lessons.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      },
    });

    const api = makeApi();
    let searchCall = 0;
    api.get.mockImplementation((url: string) => {
      if (url === '/knowledge') {
        return Promise.resolve({ data: { message: 'ok', data: AREAS } });
      }
      searchCall += 1;
      // 1ª busca devolve uma aula; a 2ª fica pendurada, deixando o componente
      // em loading com o resultado da anterior ainda em memória.
      return searchCall === 1
        ? Promise.resolve(lessonsPayload([LESSON]))
        : new Promise(() => {});
    });

    renderPage(api, 'preview');
    await screen.findByText('Biologia');

    const input = screen.getByPlaceholderText(
      'Buscar componente curricular ou aula'
    );

    fireEvent.change(input, { target: { value: 'Bio' } });
    await screen.findByText('Estrutura do DNA');

    fireEvent.change(input, { target: { value: 'Biol' } });
    // Esqueletos no lugar das aulas = `lessonsLoading` true.
    await screen.findAllByTestId('skeleton-lesson-card');

    fireEvent.keyDown(input, { key: 'Enter' });

    // Só o componente curricular ("Biologia"), sem a aula do termo anterior —
    // que nesse instante nem está na tela. Sem o guard seriam 2.
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '1 resultado encontrado'
      )
    );
  });

  it('shows the no-results state when nothing matches', async () => {
    const api = makeApi();
    renderPage(api, 'preview');
    await screen.findByText('Biologia');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar componente curricular ou aula'),
      { target: { value: 'termo inexistente' } }
    );

    expect(
      await screen.findByText('Nenhum resultado encontrado')
    ).toBeInTheDocument();
  });

  it('shows a failed lesson search as an error, not as "no results"', async () => {
    const api = makeApi();
    api.get.mockImplementation((url: string) => {
      if (url === '/knowledge') {
        return Promise.resolve({ data: { message: 'ok', data: AREAS } });
      }
      return Promise.reject({
        response: { data: { message: 'Erro ao buscar aulas' } },
      });
    });
    renderPage(api, 'preview');
    await screen.findByText('Biologia');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar componente curricular ou aula'),
      { target: { value: 'termo inexistente' } }
    );

    expect(
      await screen.findByTestId('lesson-search-error')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Nenhum resultado encontrado')
    ).not.toBeInTheDocument();
  });

  it('restores the full list when the search is cleared', async () => {
    const api = makeApi();
    renderPage(api, 'preview');
    await screen.findByText('Biologia');

    const input = screen.getByPlaceholderText(
      'Buscar componente curricular ou aula'
    );
    fireEvent.change(input, { target: { value: 'termo inexistente' } });
    await screen.findByText('Nenhum resultado encontrado');

    fireEvent.change(input, { target: { value: '' } });

    expect(await screen.findByText('Ciências da Natureza')).toBeInTheDocument();
  });

  it('filters the subjects as the user types', async () => {
    const api = makeApi([
      {
        id: 'area-1',
        name: 'Ciências',
        subjects: [
          { id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
          { id: 's-2', name: 'Física', color: '#00f', icon: 'Atom' },
        ],
      },
    ]);
    renderPage(api, 'preview');

    await screen.findByText('Biologia');

    fireEvent.change(
      screen.getByPlaceholderText('Buscar componente curricular ou aula'),
      { target: { value: 'Bio' } }
    );

    await waitFor(() =>
      expect(screen.getByText('Componentes curriculares')).toBeInTheDocument()
    );
    expect(screen.queryByText('Física')).not.toBeInTheDocument();
  });
});
