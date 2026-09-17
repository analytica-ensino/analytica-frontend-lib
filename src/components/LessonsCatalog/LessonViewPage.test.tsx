import type { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LessonViewPage } from './LessonViewPage';
import { useLessonsStore } from '../../store/lessonsStore';
import type { BaseApiClient } from '../../types/api';
import type { ApiLessonData } from '../../types/lessonsCatalog';

/**
 * The real VideoPlayer is covered by its own suite; here the video section is a
 * probe that exposes the props this page forwards and can fire onVideoComplete
 * on demand. Only the video section is stubbed — the podcast and whiteboard
 * sections render for real, because their progress wiring is under test.
 *
 * Mocking the `../../index` barrel instead would leave `CardAudio` undefined:
 * the barrel is part of an import cycle and is not fully initialised when a
 * mock factory spreads it.
 */
jest.mock('../shared/LessonMediaSections', () => {
  const actual = jest.requireActual('../shared/LessonMediaSections');
  return {
    ...actual,
    LessonVideoSection: (props: Record<string, unknown>) => (
      <>
        <button
          type="button"
          data-testid="video-player"
          data-autosave={String(props.persistProgress)}
          data-initial-time={String(
            props.persistProgress ? props.initialTime : 0
          )}
          onClick={() => (props.onVideoComplete as () => void)?.()}
        >
          player
        </button>
        {props.children as ReactNode}
      </>
    ),
  };
});

const ROUTES = {
  root: '/aulas',
  topics: (subjectId: string) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId: string, subtopicId: string) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

function apiLesson(overrides: Partial<ApiLessonData> = {}): ApiLessonData {
  return {
    id: 'lesson-1',
    areaKnowledgeId: 'area-1',
    subjectId: 's-1',
    topicId: 't-1',
    subtopicId: 'sub-1',
    contentId: 'content-1',
    urlVideo: 'https://cdn.test/v.mp4',
    urlPodCast: '',
    urlCover: '',
    urlInitialFrame: '',
    urlFinalFrame: '',
    urlDoc: '',
    urlSubtitle: '',
    videoTitle: 'Aula de DNA',
    podCastTitle: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    questionnaire: null,
    areaKnowledge: { id: 'area-1', name: 'Ciências' },
    subject: { id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
    topic: { id: 't-1', name: 'Genética' },
    subtopic: { id: 'sub-1', name: 'DNA' },
    content: { id: 'content-1', name: 'Estrutura do DNA', bnccCode: 'EM13CNT' },
    ...overrides,
  };
}

function makeApi(lessons: ApiLessonData[] = [apiLesson()]) {
  return {
    get: jest.fn((url: string) => {
      if (url.startsWith('/lesson/by-subtopic')) {
        return Promise.resolve({ data: { message: 'ok', data: lessons } });
      }
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn(),
    patch: jest.fn().mockResolvedValue({
      data: {
        message: 'ok',
        data: {
          lessonId: 'lesson-1',
          progress: 100,
          lastInteraction: '2026-01-10T00:00:00.000Z',
        },
      },
    }),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderPage(
  api: jest.Mocked<BaseApiClient>,
  {
    mode = 'student',
    entry = '/aulas/s-1/topicos/sub-1/licoes',
    onOpenQuestionnaire,
  }: {
    mode?: 'student' | 'preview';
    entry?: string;
    onOpenQuestionnaire?: (args: {
      lessonId: string;
      hasQuestionnaire: boolean;
    }) => Promise<void>;
  } = {}
) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/aulas/:subjectId/topicos/:topicId/licoes"
          element={
            <LessonViewPage
              api={api}
              routes={ROUTES}
              mode={mode}
              onOpenQuestionnaire={onOpenQuestionnaire}
            />
          }
        />
        <Route path="/aulas" element={<LocationProbe />} />
        <Route path="/aulas/:subjectId/topicos" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LessonViewPage', () => {
  beforeEach(() => {
    useLessonsStore.getState().clearLessonsData();
  });

  it('loads the subtopic lessons and renders the player', async () => {
    const api = makeApi();
    renderPage(api);

    expect(await screen.findByTestId('video-player')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/lesson/by-subtopic/sub-1');
    expect(screen.getAllByText('Estrutura do DNA').length).toBeGreaterThan(0);
  });

  it('lists the sibling lessons in the sidebar', async () => {
    const api = makeApi([
      apiLesson(),
      apiLesson({
        id: 'lesson-2',
        content: { id: 'c-2', name: 'Replicação', bnccCode: 'EM13B' },
      }),
    ]);
    renderPage(api);

    expect(await screen.findByText('Replicação')).toBeInTheDocument();
  });

  it('opens the lesson pinned by ?aula=', async () => {
    const api = makeApi([
      apiLesson(),
      apiLesson({
        id: 'lesson-2',
        videoTitle: 'Segunda aula',
        content: { id: 'c-2', name: 'Replicação', bnccCode: 'EM13B' },
      }),
    ]);
    renderPage(api, { entry: '/aulas/s-1/topicos/sub-1/licoes?aula=lesson-2' });

    await waitFor(() =>
      expect(useLessonsStore.getState().currentLesson?.id).toBe('lesson-2')
    );
  });

  it('navigates back through the breadcrumb', async () => {
    const api = makeApi();
    renderPage(api);

    await screen.findByTestId('video-player');
    // "Aulas" labels both the breadcrumb root and the sidebar heading; the
    // breadcrumb renders first.
    fireEvent.click(screen.getAllByText('Aulas')[0]);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/aulas')
    );
  });

  it('shows an error with a retry action', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('500'));
    renderPage(api);

    expect(
      await screen.findByText('Erro ao carregar lições')
    ).toBeInTheDocument();
  });

  it('shows the empty state when the subtopic has no lessons', async () => {
    const api = makeApi([]);
    renderPage(api);

    expect(
      await screen.findByText('Nenhuma lição disponível')
    ).toBeInTheDocument();
  });

  describe('student mode', () => {
    it('records the lesson as last viewed', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'student' });

      await screen.findByTestId('video-player');
      await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith('/lesson/last/viewed/lesson-1')
      );
    });

    it('marks the video criterion when playback completes', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'student' });

      fireEvent.click(await screen.findByTestId('video-player'));

      await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith('/lesson/lesson-1/progress', {
          video: true,
        })
      );
    });

    it('lets the player save and restore the position', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'student' });

      expect(await screen.findByTestId('video-player')).toHaveAttribute(
        'data-autosave',
        'true'
      );
    });

    it('enables the questionnaire when a handler is given', async () => {
      const api = makeApi();
      const onOpenQuestionnaire = jest.fn().mockResolvedValue(undefined);
      renderPage(api, { mode: 'student', onOpenQuestionnaire });

      await screen.findByTestId('video-player');
      const button = screen.getByRole('button', { name: /Responder/i });
      expect(button).toBeEnabled();

      fireEvent.click(button);
      await waitFor(() =>
        expect(onOpenQuestionnaire).toHaveBeenCalledWith({
          lessonId: 'lesson-1',
          hasQuestionnaire: false,
        })
      );
    });

    it('surfaces a questionnaire failure inline', async () => {
      const api = makeApi();
      const onOpenQuestionnaire = jest
        .fn()
        .mockRejectedValue(new Error('Sem questões para este questionário'));
      renderPage(api, { mode: 'student', onOpenQuestionnaire });

      await screen.findByTestId('video-player');
      fireEvent.click(screen.getByRole('button', { name: /Responder/i }));

      expect(
        await screen.findByText('Sem questões para este questionário')
      ).toBeInTheDocument();
    });

    it('disables the questionnaire when no handler is given', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'student' });

      await screen.findByTestId('video-player');
      expect(screen.getByRole('button', { name: /Responder/i })).toBeDisabled();
    });
  });

  describe('lesson materials', () => {
    it('renders the podcast and marks the audio criterion when it ends', async () => {
      const api = makeApi([
        apiLesson({
          urlPodCast: 'https://cdn.test/p.mp3',
          podCastTitle: 'Episódio 1',
        }),
      ]);
      renderPage(api, { mode: 'student' });

      expect(await screen.findByText('Episódio 1')).toBeInTheDocument();

      const audio = document.querySelector('audio');
      expect(audio).not.toBeNull();
      fireEvent.ended(audio!);

      await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith('/lesson/lesson-1/progress', {
          audio: true,
        })
      );
    });

    it('marks the initial and final boards as viewed when clicked', async () => {
      const api = makeApi([
        apiLesson({
          urlInitialFrame: 'https://cdn.test/i.png',
          urlFinalFrame: 'https://cdn.test/f.png',
        }),
      ]);
      renderPage(api, { mode: 'student' });

      expect(await screen.findByText('Quadros da aula')).toBeInTheDocument();

      fireEvent.click(screen.getByAltText('Quadro Inicial'));
      await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith('/lesson/lesson-1/progress', {
          initialFrame: true,
        })
      );

      fireEvent.click(screen.getByAltText('Quadro Final'));
      await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith('/lesson/lesson-1/progress', {
          finalFrame: true,
        })
      );
    });

    it('never marks a board in preview mode', async () => {
      const api = makeApi([
        apiLesson({ urlInitialFrame: 'https://cdn.test/i.png' }),
      ]);
      renderPage(api, { mode: 'preview' });

      fireEvent.click(await screen.findByAltText('Quadro Inicial'));

      await waitFor(() => expect(api.get).toHaveBeenCalled());
      expect(api.patch).not.toHaveBeenCalled();
    });

    it('shows no boards section when the lesson has no frames', async () => {
      const api = makeApi();
      renderPage(api);

      await screen.findByTestId('video-player');
      expect(screen.queryByText('Quadros da aula')).not.toBeInTheDocument();
    });
  });

  describe('questionnaire completion', () => {
    const answered = {
      id: 'q-1',
      title: 'Questionário',
      type: 'LESSON',
      difficulty: 'EASY',
      notification: null,
      status: 'DONE',
      startDate: null,
      finalDate: null,
      canRetry: false,
      updatedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      statistics: {
        totalAnswered: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
        pendingAnswers: 0,
        score: 80,
      },
    };

    it('does not re-mark a questionnaire that was already complete on arrival', async () => {
      const api = makeApi([apiLesson({ questionnaire: answered })]);
      renderPage(api, { mode: 'student' });

      await screen.findByTestId('video-player');
      await waitFor(() => expect(api.patch).toHaveBeenCalled());

      expect(api.patch).not.toHaveBeenCalledWith('/lesson/lesson-1/progress', {
        allQuestionsAnswered: true,
      });
    });
  });

  describe('deep link without navigation state', () => {
    it('falls back to the subject and subtopic names from the API', async () => {
      const api = makeApi();
      renderPage(api);

      // No location.state here, so the breadcrumb has to come from the
      // lesson payload itself.
      expect(await screen.findByText('Biologia')).toBeInTheDocument();
      expect(screen.getByText('DNA')).toBeInTheDocument();
    });

    it('goes back to the subject topics from the breadcrumb', async () => {
      const api = makeApi();
      renderPage(api);

      fireEvent.click(await screen.findByText('Biologia'));

      await waitFor(() =>
        expect(screen.getByTestId('location')).toHaveTextContent(
          '/aulas/s-1/topicos'
        )
      );
    });
  });

  describe('preview mode', () => {
    it('never writes anything to the backend', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'preview' });

      fireEvent.click(await screen.findByTestId('video-player'));

      // No progress, no last-viewed, no download registration, no telemetry.
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      expect(api.patch).not.toHaveBeenCalled();
      expect(api.post).not.toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/lesson/by-subtopic/sub-1');
    });

    it('renders no progress bars in the sidebar', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'preview' });

      await screen.findByTestId('video-player');
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('never saves or restores the playback position', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'preview' });

      const player = await screen.findByTestId('video-player');
      expect(player).toHaveAttribute('data-autosave', 'false');
      expect(player).toHaveAttribute('data-initial-time', '0');
    });

    it('shows the questionnaire but disabled, even with a handler', async () => {
      const api = makeApi();
      const onOpenQuestionnaire = jest.fn().mockResolvedValue(undefined);
      renderPage(api, { mode: 'preview', onOpenQuestionnaire });

      await screen.findByTestId('video-player');
      const button = screen.getByRole('button', { name: /Responder/i });

      // The teacher sees that the lesson has a questionnaire, but answering
      // would create an attempt tied to their own user.
      expect(button).toBeDisabled();
      expect(screen.getByText('Questionário')).toBeInTheDocument();

      fireEvent.click(button);
      expect(onOpenQuestionnaire).not.toHaveBeenCalled();
    });

    it('leaves the progress store untouched', async () => {
      const api = makeApi();
      renderPage(api, { mode: 'preview' });

      fireEvent.click(await screen.findByTestId('video-player'));

      await waitFor(() =>
        expect(useLessonsStore.getState().lessons.length).toBe(1)
      );
      expect(useLessonsStore.getState().lessonsProgress).toEqual({});
    });
  });
});
