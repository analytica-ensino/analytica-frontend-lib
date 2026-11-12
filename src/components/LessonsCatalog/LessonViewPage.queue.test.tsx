import type { ReactNode } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonViewPage } from './LessonViewPage';
import { useLessonsStore } from '../../store/lessonsStore';
import { useMediaPreferencesStore } from '../../store/mediaPreferencesStore';
import type { BaseApiClient } from '../../types/api';
import type { ApiLessonData } from '../../types/lessonsCatalog';

const mockReplay = jest.fn();
const mockRewind = jest.fn();

jest.mock('../shared/LessonMediaSections', () => ({
  ...jest.requireActual('../shared/LessonMediaSections'),
  LessonVideoSection: (props: Record<string, unknown>) => (
    <>
      <button
        type="button"
        data-testid="ended"
        data-autoplay={String(Boolean(props.autoPlay))}
        onClick={() =>
          (props.onEnded as (controls: unknown) => void)?.({
            replay: mockReplay,
            rewind: mockRewind,
          })
        }
      >
        ended
      </button>
      {props.overlay as ReactNode}
    </>
  ),
}));

jest.mock('./NextLessonCountdown', () => ({
  NextLessonCountdown: ({
    onComplete,
    onCancel,
  }: {
    onComplete: () => void;
    onCancel: () => void;
  }) => (
    <>
      <button type="button" data-testid="countdown-done" onClick={onComplete}>
        done
      </button>
      <button type="button" data-testid="countdown-cancel" onClick={onCancel}>
        cancel
      </button>
    </>
  ),
}));

const ROUTES = {
  root: '/aulas',
  topics: (subjectId: string) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId: string, subtopicId: string) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

const lesson = (id: string, urlVideo = `https://cdn.test/${id}.mp4`) =>
  ({
    id,
    areaKnowledgeId: 'area-1',
    subjectId: 's-1',
    topicId: 't-1',
    subtopicId: 'sub-1',
    contentId: `content-${id}`,
    urlVideo,
    urlPodCast: '',
    urlCover: '',
    urlInitialFrame: '',
    urlFinalFrame: '',
    urlDoc: '',
    urlSubtitle: '',
    videoTitle: `Aula ${id}`,
    podCastTitle: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    questionnaire: null,
    areaKnowledge: { id: 'area-1', name: 'Ciências' },
    subject: { id: 's-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
    topic: { id: 't-1', name: 'Genética' },
    subtopic: { id: 'sub-1', name: 'DNA' },
    content: { id: `content-${id}`, name: `Conteúdo ${id}`, bnccCode: 'EM' },
  }) as ApiLessonData;

const progressResponse = {
  data: {
    message: 'ok',
    data: {
      lessonId: 'a',
      progress: 100,
      lastInteraction: '2026-01-10T00:00:00.000Z',
    },
  },
};

function makeApi(lessons: ApiLessonData[]) {
  return {
    get: jest.fn((url: string) =>
      Promise.resolve({
        data: url.startsWith('/lesson/by-subtopic')
          ? { message: 'ok', data: lessons }
          : {},
      })
    ),
    post: jest.fn(),
    patch: jest.fn().mockResolvedValue(progressResponse),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

const progressWrites = (api: jest.Mocked<BaseApiClient>) =>
  api.patch.mock.calls.filter(
    ([url]) => !String(url).includes('/lesson/last/viewed')
  );

const currentId = () => useLessonsStore.getState().currentLesson?.id;

async function renderPage(
  api: jest.Mocked<BaseApiClient>,
  { aula = 'a', mode = 'student' as 'student' | 'preview' } = {}
) {
  render(
    <MemoryRouter
      initialEntries={[`/aulas/s-1/topicos/sub-1/licoes?aula=${aula}`]}
    >
      <Routes>
        <Route
          path="/aulas/:subjectId/topicos/:topicId/licoes"
          element={<LessonViewPage api={api} routes={ROUTES} mode={mode} />}
        />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByTestId('ended');
  await waitFor(() => expect(currentId()).toBe(aula));
}

const endVideo = async () => {
  await act(async () => {
    fireEvent.click(screen.getByTestId('ended'));
  });
};

const finishCountdown = async () => {
  await act(async () => {
    fireEvent.click(screen.getByTestId('countdown-done'));
  });
};

describe('LessonViewPage: fila e fim do vídeo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.scrollTo = jest.fn();
    useLessonsStore.getState().clearLessonsData();
    useMediaPreferencesStore.setState({
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('conta e avança para a próxima aula com início automático', async () => {
    const api = makeApi([lesson('a'), lesson('b')]);
    await renderPage(api);

    await endVideo();
    expect(screen.getByTestId('countdown-done')).toBeInTheDocument();
    expect(currentId()).toBe('a');

    await finishCountdown();

    await waitFor(() => expect(currentId()).toBe('b'));
    expect(screen.getByTestId('ended')).toHaveAttribute(
      'data-autoplay',
      'true'
    );
  });

  it('espera a gravação do progresso antes de trocar de aula', async () => {
    const api = makeApi([lesson('a'), lesson('b')]);
    let resolveWrite: (value: { data: unknown }) => void = () => undefined;
    api.patch.mockImplementation((url: string) =>
      url.includes('/lesson/last/viewed')
        ? Promise.resolve(progressResponse)
        : new Promise((resolve) => {
            resolveWrite = resolve;
          })
    );
    await renderPage(api);

    await endVideo();
    await finishCountdown();
    expect(currentId()).toBe('a');

    await act(async () => resolveWrite(progressResponse));

    await waitFor(() => expect(currentId()).toBe('b'));
  });

  it('não troca se o aluno escolheu outra aula durante a gravação', async () => {
    const api = makeApi([lesson('a'), lesson('b'), lesson('c')]);
    let resolveWrite: (value: { data: unknown }) => void = () => undefined;
    api.patch.mockImplementation((url: string) =>
      url.includes('/lesson/last/viewed')
        ? Promise.resolve(progressResponse)
        : new Promise((resolve) => {
            resolveWrite = resolve;
          })
    );
    await renderPage(api);

    await endVideo();
    await finishCountdown();
    act(() => {
      useLessonsStore
        .getState()
        .setCurrentLesson(
          useLessonsStore.getState().lessons.find(({ id }) => id === 'c') ??
            null
        );
    });
    await act(async () => resolveWrite(progressResponse));

    expect(currentId()).toBe('c');
  });

  it('cancelar mantém a aula atual', async () => {
    await renderPage(makeApi([lesson('a'), lesson('b')]));

    await endVideo();
    fireEvent.click(screen.getByTestId('countdown-cancel'));

    expect(screen.queryByTestId('countdown-done')).not.toBeInTheDocument();
    expect(currentId()).toBe('a');
  });

  it('pula aulas sem vídeo na fila', async () => {
    await renderPage(makeApi([lesson('a'), lesson('b', ''), lesson('c')]));

    await endVideo();
    await finishCountdown();

    await waitFor(() => expect(currentId()).toBe('c'));
  });

  it('na última aula sem repetir a lista, volta ao início', async () => {
    await renderPage(makeApi([lesson('a'), lesson('b')]), { aula: 'b' });

    await endVideo();

    expect(mockRewind).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('countdown-done')).not.toBeInTheDocument();
  });

  it('na última aula com repetir a lista, recomeça a fila', async () => {
    useMediaPreferencesStore.setState({ queueRepeatList: true });
    await renderPage(makeApi([lesson('a'), lesson('b')]), { aula: 'b' });

    await endVideo();
    await finishCountdown();

    await waitFor(() => expect(currentId()).toBe('a'));
  });

  it('vídeo fora de fila volta ao início mesmo com repetir a lista', async () => {
    useMediaPreferencesStore.setState({ queueRepeatList: true });
    await renderPage(makeApi([lesson('a')]));

    await endVideo();

    expect(mockRewind).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('countdown-done')).not.toBeInTheDocument();
  });

  it('repetir um vídeo tem prioridade e não grava nova conclusão', async () => {
    useMediaPreferencesStore.setState({ videoEndBehavior: 'repeat-video' });
    const api = makeApi([lesson('a'), lesson('b')]);
    await renderPage(api);

    await endVideo();
    await endVideo();

    expect(mockReplay).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('countdown-done')).not.toBeInTheDocument();
    expect(progressWrites(api)).toHaveLength(1);
  });

  it('voltar ao início tem prioridade sobre o avanço', async () => {
    useMediaPreferencesStore.setState({ videoEndBehavior: 'back-to-start' });
    await renderPage(makeApi([lesson('a'), lesson('b')]));

    await endVideo();

    expect(mockRewind).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('countdown-done')).not.toBeInTheDocument();
  });

  it('a pré-visualização não tem fila, controles nem gravação', async () => {
    useMediaPreferencesStore.setState({ videoEndBehavior: 'repeat-video' });
    const api = makeApi([lesson('a'), lesson('b')]);
    await renderPage(api, { mode: 'preview' });

    await endVideo();

    expect(mockRewind).toHaveBeenCalledTimes(1);
    expect(mockReplay).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Aleatório' })
    ).not.toBeInTheDocument();
    expect(progressWrites(api)).toHaveLength(0);
  });

  it('a ordem aleatória percorre todas sem repetir e reembaralha', async () => {
    useMediaPreferencesStore.setState({
      queueShuffle: true,
      queueRepeatList: true,
    });
    await renderPage(makeApi([lesson('a'), lesson('b'), lesson('c')]));
    const visited = [currentId()];

    for (let step = 0; step < 2; step++) {
      await endVideo();
      await finishCountdown();
      await waitFor(() => expect(currentId()).not.toBe(visited[step]));
      visited.push(currentId());
    }
    expect(new Set(visited).size).toBe(3);

    await endVideo();
    await finishCountdown();

    await waitFor(() => expect(currentId()).not.toBe(visited[2]));
  });

  it('desligar a ordem aleatória retoma a ordem original', async () => {
    useMediaPreferencesStore.setState({ queueShuffle: true });
    await renderPage(makeApi([lesson('a'), lesson('b'), lesson('c')]), {
      aula: 'b',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Aleatório' }));
    await endVideo();
    await finishCountdown();

    await waitFor(() => expect(currentId()).toBe('c'));
  });

  it('escolher uma aula rola o <main> ao topo sem início automático', async () => {
    const main = document.createElement('main');
    main.scrollTo = jest.fn();
    document.body.appendChild(main);
    await renderPage(makeApi([lesson('a'), lesson('b')]));
    (main.scrollTo as jest.Mock).mockClear();

    fireEvent.click(screen.getByText('Conteúdo b'));

    await waitFor(() => expect(currentId()).toBe('b'));
    expect(main.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(screen.getByTestId('ended')).toHaveAttribute(
      'data-autoplay',
      'false'
    );
    main.remove();
  });
});
