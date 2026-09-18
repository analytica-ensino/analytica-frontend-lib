import type { Story } from '@ladle/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LessonsCatalogPage } from './LessonsCatalogPage';
import { LessonTopicsPage } from './LessonTopicsPage';
import type { BaseApiClient } from '../../types/api';
import type {
  KnowledgeArea,
  LessonsCatalogRoutes,
  TopicsApiResponse,
} from '../../types/lessonsCatalog';

const ROUTES: LessonsCatalogRoutes = {
  root: '/aulas',
  topics: (subjectId) => `/aulas/${subjectId}/topicos`,
  lessons: (subjectId, subtopicId) =>
    `/aulas/${subjectId}/topicos/${subtopicId}/licoes`,
};

const AREAS_WITH_PROGRESS: KnowledgeArea[] = [
  {
    id: 'area-1',
    name: 'Ciências da Natureza',
    subjects: [
      {
        id: 's-1',
        name: 'Biologia',
        color: '#7BD3B0',
        icon: 'Dna',
        progress: { totalLessons: 12, completedLessons: 7, percentage: 58 },
      },
      {
        id: 's-2',
        name: 'Química',
        color: '#8AB6F9',
        icon: 'Flask',
        progress: { totalLessons: 9, completedLessons: 0, percentage: 0 },
      },
    ],
  },
  {
    id: 'area-2',
    name: 'Matemática',
    subjects: [
      {
        id: 's-3',
        name: 'Álgebra',
        color: '#F7B267',
        icon: 'MathOperations',
        progress: { totalLessons: 20, completedLessons: 20, percentage: 100 },
      },
    ],
  },
];

/** Same matrix as the backend returns it for a teacher: no progress at all. */
const AREAS_WITHOUT_PROGRESS: KnowledgeArea[] = AREAS_WITH_PROGRESS.map(
  (area) => ({
    ...area,
    subjects: area.subjects.map(
      ({ progress: _progress, ...subject }) => subject
    ),
  })
);

const TOPICS: TopicsApiResponse = {
  message: 'ok',
  data: [
    {
      id: 's-1',
      name: 'Biologia',
      color: '#7BD3B0',
      icon: 'Dna',
      topics: [
        {
          id: 't-1',
          name: 'Genética',
          subtopics: [
            {
              id: 'sub-1',
              name: 'DNA e RNA',
              finishedLessons: 3,
              totalLessons: 6,
              lessons: [],
            },
            {
              id: 'sub-2',
              name: 'Leis de Mendel',
              finishedLessons: 0,
              totalLessons: 4,
              lessons: [],
            },
          ],
        },
        {
          id: 't-2',
          name: 'Citologia',
          subtopics: [
            {
              id: 'sub-3',
              name: 'Membrana plasmática',
              finishedLessons: 1,
              totalLessons: 1,
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

function makeApi(areas: KnowledgeArea[]): BaseApiClient {
  return {
    get: (url: string) => {
      if (url === '/knowledge') {
        return Promise.resolve({ data: { message: 'ok', data: areas } });
      }
      if (url.startsWith('/knowledge/by-subject')) {
        return Promise.resolve({ data: TOPICS });
      }
      return Promise.resolve(EMPTY_SEARCH);
    },
    post: () => Promise.resolve({ data: {} }),
    patch: () => Promise.resolve({ data: {} }),
    delete: () => Promise.resolve({ data: {} }),
  } as unknown as BaseApiClient;
}

export const CatalogoAluno: Story = () => (
  <MemoryRouter initialEntries={['/aulas']}>
    <Routes>
      <Route
        path="/aulas"
        element={
          <LessonsCatalogPage
            api={makeApi(AREAS_WITH_PROGRESS)}
            routes={ROUTES}
            mode="student"
          />
        }
      />
    </Routes>
  </MemoryRouter>
);

export const CatalogoPreviewProfessor: Story = () => (
  <MemoryRouter initialEntries={['/aulas']}>
    <Routes>
      <Route
        path="/aulas"
        element={
          <LessonsCatalogPage
            api={makeApi(AREAS_WITHOUT_PROGRESS)}
            routes={ROUTES}
            mode="preview"
          />
        }
      />
    </Routes>
  </MemoryRouter>
);

export const TemasAluno: Story = () => (
  <MemoryRouter initialEntries={['/aulas/s-1/topicos']}>
    <Routes>
      <Route
        path="/aulas/:subjectId/topicos"
        element={
          <LessonTopicsPage
            api={makeApi(AREAS_WITH_PROGRESS)}
            routes={ROUTES}
            mode="student"
          />
        }
      />
    </Routes>
  </MemoryRouter>
);

export const TemasPreviewProfessor: Story = () => (
  <MemoryRouter initialEntries={['/aulas/s-1/topicos']}>
    <Routes>
      <Route
        path="/aulas/:subjectId/topicos"
        element={
          <LessonTopicsPage
            api={makeApi(AREAS_WITHOUT_PROGRESS)}
            routes={ROUTES}
            mode="preview"
          />
        }
      />
    </Routes>
  </MemoryRouter>
);
