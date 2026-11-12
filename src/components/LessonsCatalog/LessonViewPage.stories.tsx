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

const lesson = (id: string, title: string): ApiLessonData =>
  ({
    id,
    areaKnowledgeId: 'area-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    subtopicId: 'subtopic-1',
    contentId: `content-${id}`,
    urlVideo: FIXTURE_MP4,
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeApi(patchDelay: number): BaseApiClient {
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
    get: async <T,>(url: string) => ({
      data: (url.startsWith('/lesson/by-subtopic')
        ? { message: 'ok', data: LESSONS }
        : { message: 'ok', data: null }) as T,
    }),
    patch: write('patch'),
    put: write('put'),
    post: write('post'),
    delete: async <T,>() => ({ data: {} as T }),
  } as unknown as BaseApiClient;
}

const QueuePage = () => {
  const [api] = useState(() =>
    makeApi(
      Number(
        new URLSearchParams(globalThis.location.search).get('patchDelay') ?? 0
      )
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
