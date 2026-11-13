import type { Story } from '@ladle/react';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonViewPage } from './LessonViewPage';
import type { BaseApiClient } from '../../types/api';
import type {
  ApiLessonData,
  LessonsCatalogRoutes,
} from '../../types/lessonsCatalog';

/**
 * The lesson page with the lesson queue (AE-3307) and the list controls
 * (AE-3308), backed by an in-memory API. Used by `e2e/lessonQueue.spec.ts`.
 *
 * Every lesson plays the local 10 s fixture (`public/fixtures/video`), so the
 * stories never depend on the network.
 *
 * Every write to the fake API is appended to `window.__lessonApiWrites`, so
 * the browser tests can check what was recorded and in which order. The
 * `patchDelay` query parameter (milliseconds) holds back each progress write,
 * to show that the page waits for it before opening the next lesson.
 */

const FIXTURE_MP4 = 'fixtures/video/sample.mp4';
const FIXTURE_HLS = 'fixtures/video/hls/master.m3u8';

const ROUTES: LessonsCatalogRoutes = {
  root: '/aulas',
  topics: (subjectId) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId, subtopicId) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

interface LessonApiWrite {
  method: 'patch' | 'put' | 'post';
  url: string;
  body: unknown;
  /** `performance.now()` when the write was answered. */
  answeredAt: number;
}

declare global {
  interface Window {
    __lessonApiWrites?: LessonApiWrite[];
  }
}

const lesson = (
  id: string,
  title: string,
  video: { urlVideo?: string; urlVideoHls?: string | null } = {}
): ApiLessonData =>
  ({
    id,
    areaKnowledgeId: 'area-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    subtopicId: 'subtopic-1',
    contentId: `content-${id}`,
    urlVideo: FIXTURE_MP4,
    urlVideoHls: null,
    ...video,
    urlPodCast: '',
    urlCover: '',
    urlInitialFrame: '',
    urlFinalFrame: '',
    urlDoc: '',
    urlSubtitle: '',
    videoTitle: title,
    podCastTitle: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    questionnaire: null,
    areaKnowledge: { id: 'area-1', name: 'Matemática' },
    subject: {
      id: 'subject-1',
      name: 'Matemática',
      color: '#8AB6F9',
      icon: 'MathOperations',
    },
    topic: { id: 'topic-1', name: 'Funções' },
    subtopic: { id: 'subtopic-1', name: 'Função afim' },
    content: { id: `content-${id}`, name: title, bnccCode: 'EM13MAT101' },
  }) as ApiLessonData;

const LESSONS = [
  lesson('lesson-1', 'Aula 1'),
  lesson('lesson-2', 'Aula 2'),
  lesson('lesson-3', 'Aula 3'),
];

/**
 * Different media on each lesson, as in production: an MP4, an HLS stream,
 * two other MP4 files (the query string makes them distinct sources to the
 * browser) and a lesson without video, which the queue skips.
 */
const MIXED_LESSONS = [
  lesson('lesson-1', 'Aula 1'),
  lesson('lesson-2', 'Aula 2', { urlVideoHls: FIXTURE_HLS }),
  lesson('lesson-3', 'Aula 3', { urlVideo: `${FIXTURE_MP4}?v=3` }),
  lesson('lesson-4', 'Aula 4', { urlVideo: '' }),
  lesson('lesson-5', 'Aula 5', { urlVideo: `${FIXTURE_MP4}?v=5` }),
];

/** Saved positions of `QueueMixed` and `QueueHls`: Aula 2 resumes at 4 s. */
const MIXED_PLAYBACK: Record<string, number> = { 'lesson-2': 4 };

/**
 * HLS on every lesson, as most lessons are in production: in Safari the
 * stream plays natively, swapping the element's `src` from lesson to lesson.
 */
const HLS_LESSONS = [
  lesson('lesson-1', 'Aula 1', { urlVideoHls: FIXTURE_HLS }),
  lesson('lesson-2', 'Aula 2', { urlVideoHls: `${FIXTURE_HLS}?v=2` }),
  lesson('lesson-3', 'Aula 3', { urlVideoHls: `${FIXTURE_HLS}?v=3` }),
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeApi(
  patchDelay: number,
  lessons: ApiLessonData[] = LESSONS,
  playback: Record<string, number> = {}
): BaseApiClient {
  const writes: LessonApiWrite[] = [];
  globalThis.window.__lessonApiWrites = writes;

  const write =
    (method: LessonApiWrite['method']) =>
    async <T,>(url: string, body?: unknown) => {
      const isProgress = /^\/lesson\/[^/]+\/progress$/.test(url);
      if (isProgress && patchDelay > 0) await wait(patchDelay);
      writes.push({ method, url, body, answeredAt: performance.now() });

      const lessonId = url.split('/')[2];
      return {
        data: {
          message: 'ok',
          data: isProgress
            ? {
                lessonId,
                progress: 25,
                lastInteraction: new Date().toISOString(),
              }
            : null,
        } as T,
      };
    };

  return {
    get: async <T,>(url: string) => {
      if (url.startsWith('/lesson/by-subtopic')) {
        return { data: { message: 'ok', data: lessons } as T };
      }
      const lessonId = /^\/lesson\/([^/]+)\/playback$/.exec(url)?.[1];
      const position = lessonId ? playback[lessonId] : undefined;
      return {
        data: {
          message: 'ok',
          data:
            position === undefined
              ? null
              : { lessonId, positionSeconds: position, durationSeconds: 10 },
        } as T,
      };
    },
    patch: write('patch'),
    put: write('put'),
    post: write('post'),
    delete: async <T,>() => ({ data: {} as T }),
  } as unknown as BaseApiClient;
}

const QueuePage = ({
  lessons,
  playback,
}: {
  lessons?: ApiLessonData[];
  playback?: Record<string, number>;
}) => {
  const [api] = useState(() =>
    makeApi(
      Number(
        new URLSearchParams(globalThis.location.search).get('patchDelay') ?? 0
      ),
      lessons,
      playback
    )
  );

  return (
    <MemoryRouter
      initialEntries={[
        '/aulas/subject-1/topicos/subtopic-1/licoes?aula=lesson-1',
      ]}
    >
      <Routes>
        <Route
          path="/aulas/:subjectId/topicos/:topicId/licoes"
          element={
            <LessonViewPage
              api={api}
              routes={ROUTES}
              userId="student-1"
              allowPictureInPicture
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

export const Queue: Story = () => <QueuePage />;

export const QueueMixed: Story = () => (
  <QueuePage lessons={MIXED_LESSONS} playback={MIXED_PLAYBACK} />
);

export const QueueHls: Story = () => (
  <QueuePage lessons={HLS_LESSONS} playback={MIXED_PLAYBACK} />
);
