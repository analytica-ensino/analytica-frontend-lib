import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LessonResultsSection } from './LessonResultsSection';
import type { LessonSearchResultItem } from '../../types/lessonsCatalog';

const ROUTES = {
  root: '/aulas',
  topics: (subjectId: string) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId: string, subtopicId: string) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

const LESSON: LessonSearchResultItem = {
  lessonId: 'lesson-1',
  videoTitle: 'Aula de DNA',
  areaKnowledge: { id: 'area-1', name: 'Ciências' },
  subject: { id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
  topic: { id: 't-1', name: 'Genética' },
  subtopic: { id: 'sub-1', name: 'DNA' },
  content: { id: 'c-1', name: 'Estrutura do DNA', bnccCode: 'EM13CNT' },
};

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

function renderSection(
  lessons: LessonSearchResultItem[],
  loading = false,
  title?: string,
  extra: { error?: string | null; onRetry?: () => void } = {}
) {
  return render(
    <MemoryRouter initialEntries={['/aulas']}>
      <Routes>
        <Route
          path="/aulas"
          element={
            <LessonResultsSection
              lessons={lessons}
              loading={loading}
              routes={ROUTES}
              title={title}
              error={extra.error}
              onRetry={extra.onRetry}
            />
          }
        />
        <Route
          path="/aulas/:subjectId/topicos/:topicId/licoes"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('LessonResultsSection', () => {
  it('renders one card per lesson with its BNCC code', () => {
    renderSection([LESSON]);

    expect(screen.getByText('Aulas')).toBeInTheDocument();
    expect(screen.getByText('Estrutura do DNA')).toBeInTheDocument();
    expect(screen.getByText('EM13CNT')).toBeInTheDocument();
  });

  it('falls back to the subject name when there is no BNCC code', () => {
    renderSection([
      { ...LESSON, content: { ...LESSON.content, bnccCode: null } },
    ]);

    expect(screen.getByText('Biologia')).toBeInTheDocument();
  });

  it('accepts a custom title', () => {
    renderSection([LESSON], false, 'Resultados');
    expect(screen.getByText('Resultados')).toBeInTheDocument();
  });

  it('renders skeletons while loading', () => {
    renderSection([], true);
    expect(screen.getAllByTestId('skeleton-lesson-card')).toHaveLength(4);
  });

  it('renders nothing when there are no results and nothing is loading', () => {
    const { container } = renderSection([]);
    expect(container).toBeEmptyDOMElement();
  });

  describe('search failure', () => {
    it('shows the error instead of silently rendering nothing', () => {
      renderSection([], false, undefined, { error: 'Erro ao buscar aulas' });

      expect(screen.getByTestId('lesson-search-error')).toBeInTheDocument();
      expect(screen.getByText('Erro ao buscar aulas')).toBeInTheDocument();
    });

    it('retries the search on click', () => {
      const onRetry = jest.fn();
      renderSection([], false, undefined, { error: 'Erro', onRetry });

      fireEvent.click(screen.getByText('Tentar novamente'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('omits the retry button when no handler is given', () => {
      renderSection([], false, undefined, { error: 'Erro' });
      expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
    });

    it('keeps showing the skeletons while a retry is in flight', () => {
      // `loading` wins over `error`: the hook clears the error when the retry
      // starts, but the guard order must not flash the stale message either.
      renderSection([], true, undefined, { error: 'Erro' });

      expect(screen.getAllByTestId('skeleton-lesson-card')).toHaveLength(4);
      expect(
        screen.queryByTestId('lesson-search-error')
      ).not.toBeInTheDocument();
    });
  });

  it('navigates to the lesson using the SUBTOPIC id and pins it with ?aula=', async () => {
    renderSection([LESSON]);

    fireEvent.click(screen.getByText('Estrutura do DNA'));

    // The lessons route's topic segment is fed straight to
    // GET /lesson/by-subtopic, so it must carry `subtopic.id` (sub-1), never
    // `topic.id` (t-1).
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aulas/s-1/topicos/sub-1/licoes?aula=lesson-1'
      )
    );
  });
});
