import type { Story } from '@ladle/react';
import type { BaseApiClient } from '../../types/api';
import { REPORT_PERIOD } from '../../types/common';
import { EbookReadingReport } from './EbookReadingReport';
import { EBOOK_READING_ROUTE } from './readingReport';
import {
  EBOOK_READING_GROUP,
  type EbookReadingBySubject,
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
} from './types';

const FILTERS = { period: REPORT_PERIOD.ONE_MONTH };

const METRICS: EbookReadingMetrics = {
  totalStudents: 200,
  readers: 132,
  readerRate: 66,
  accesses: 812,
  effectiveReadings: 100,
  totalTimeSeconds: 44_400,
  averageTimeSeconds: 336,
  averageProgress: 58.4,
};

/** A school or class of the story. */
const group = (
  id: string,
  name: string,
  readerRate: number,
  schoolYearName: string | null = null
): EbookReadingGroupRow => ({
  ...METRICS,
  id,
  name,
  readerRate,
  averageProgress: readerRate * 0.8,
  totalStudents: 40,
  readers: Math.round(readerRate * 0.4),
  schoolYearName,
  municipality: null,
  state: null,
});

/** A school of the story, in its municipality. */
const school = (
  id: string,
  name: string,
  readerRate: number,
  municipality: string
): EbookReadingGroupRow => ({
  ...group(id, name, readerRate),
  municipality,
  state: 'PR',
});

/** A municipality of the story. */
const city = (name: string, readerRate: number): EbookReadingGroupRow => ({
  ...group(`PR:${name}`, name, readerRate),
  state: 'PR',
});

const SCHOOLS = [
  school('s1', 'Escola Estadual Monteiro Lobato', 82, 'Curitiba'),
  school('s2', 'Colégio Estadual do Paraná', 64, 'Londrina'),
  school('s3', 'Escola Municipal São José', 37, 'Maringá'),
  school('s4', 'Colégio Adventista de Curitiba', 12, 'Curitiba'),
  school('s5', 'Escola Técnica do Paraná', 0, 'Cascavel'),
];

const MUNICIPALITIES = [
  city('São Miguel do Iguaçu', 92),
  city('Londrina', 81),
  city('Maringá', 77),
  city('Ponta Grossa', 21),
  city('Curitiba', 14),
  city('Cascavel', 6),
];

/** A subject of the story. */
const subject = (
  id: string,
  name: string,
  icon: string,
  color: string,
  books: number,
  read: number,
  opened: number
) => ({
  id,
  name,
  icon,
  color,
  areaKnowledgeId: 'linguagens',
  areaKnowledgeName: 'Linguagens, Códigos e suas Tecnologias',
  books,
  read,
  opened,
  notRead: books - read - opened,
  readRate: Math.round((read / books) * 10000) / 100,
});

const SUBJECTS: EbookReadingBySubject = {
  total: { books: 285, read: 174, opened: 96, notRead: 15, readRate: 61.05 },
  rows: [
    subject('pt', 'Língua Portuguesa', 'BookOpenText', '#ffd9b5', 90, 65, 20),
    subject('lit', 'Literatura', 'BookOpenText', '#c9e5ff', 90, 55, 30),
    subject('en', 'Inglês', 'Chat_EN', '#fff2a8', 60, 30, 25),
    subject('es', 'Espanhol', 'Chat_ES', '#ffd1d1', 45, 24, 21),
    subject('art', 'Arte', 'Palette', '#e7d5ff', 30, 10, 15),
  ],
};

const CLASSES = [
  group('c1', 'Turma A', 90, '4º ano'),
  group('c2', 'Turma B', 55, '4º ano'),
  group('c3', 'Turma C', 20, '5º ano'),
];

/** A ranked book or theme. */
const ranked = (id: string, name: string, readers: number) => ({
  id,
  name,
  ebookTitle: null,
  readers,
  totalTimeSeconds: readers * 300,
});

/** One page of rows. */
const page = <T,>(rows: T[]) => ({
  rows,
  pagination: {
    page: 1,
    limit: 10,
    total: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
});

const ROUTES: Record<string, (body: Record<string, unknown>) => unknown> = {
  [EBOOK_READING_ROUTE.SUMMARY]: () => ({
    ...METRICS,
    municipalities: 20,
    schools: 30,
  }),
  [EBOOK_READING_ROUTE.TIMELINE]: () => ({
    periods: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'].map(
      (label, index) => ({
        label,
        effectiveReadings: [130, 200, 190, 120, 60][index],
      })
    ),
  }),
  [EBOOK_READING_ROUTE.BY_SUBJECT]: () => SUBJECTS,
  [EBOOK_READING_ROUTE.DISTRIBUTION]: () => ({
    totalStudents: 200,
    tiers: {
      highlight: 64,
      aboveAverage: 52,
      belowAverage: 38,
      attention: 26,
      none: 20,
    },
  }),
  [EBOOK_READING_ROUTE.BY_MUNICIPALITY]: () => page(MUNICIPALITIES),
  [EBOOK_READING_ROUTE.RANKINGS]: (body) =>
    body.dimension === 'CATEGORY'
      ? {
          mostRead: [
            ranked('I', 'Educação 4.0 e 5.0', 98),
            ranked('II', 'Educação Financeira', 61),
            ranked('III', 'Sustentabilidade', 40),
          ],
          leastRead: [
            ranked('V', 'Cultura Digital', 3),
            ranked('IV', 'Saúde e Bem-estar', 7),
            ranked('VI', 'Cidadania', 12),
          ],
        }
      : {
          mostRead: [
            ranked('eb40', 'O Caso da Couve Mordida', 200),
            ranked('eb01', 'A Barraca do 4º B', 150),
            ranked('eb12', 'A Água que Some', 50),
          ],
          leastRead: [
            ranked('eb06', 'O Preço do Tempo: Juros', 3),
            ranked('eb15', 'Robôs na Feira de Ciências', 5),
            ranked('eb22', 'O Mapa da Escola', 10),
          ],
        },
  [EBOOK_READING_ROUTE.BY_SCHOOL]: () => page(SCHOOLS),
  [EBOOK_READING_ROUTE.BY_CLASS]: () => page(CLASSES),
  [EBOOK_READING_ROUTE.BY_STUDENT]: () =>
    page([
      {
        userInstitutionId: 'st1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Estadual Monteiro Lobato',
        schoolYearName: '4º ano',
        className: 'Turma A',
        ebooksOpened: 4,
        accesses: 12,
        effectiveReadings: 3,
        totalTimeSeconds: 5400,
        averageProgress: 88,
        lastReadAt: '2026-11-17T12:00:00Z',
      },
      {
        userInstitutionId: 'st2',
        studentName: 'Bruno Costa',
        avatarUrl: null,
        schoolName: 'Escola Estadual Monteiro Lobato',
        schoolYearName: '4º ano',
        className: 'Turma B',
        ebooksOpened: 1,
        accesses: 2,
        effectiveReadings: 0,
        totalTimeSeconds: 420,
        averageProgress: 18,
        lastReadAt: '2026-11-02T12:00:00Z',
      },
    ]),
  [EBOOK_READING_ROUTE.STUDENT]: () => ({
    userInstitutionId: 'st1',
    studentName: 'Ana Beatriz',
    avatarUrl: null,
    schoolName: 'Escola Estadual Monteiro Lobato',
    className: 'Turma A',
    schoolYearName: '4º ano',
    notRead: [
      {
        ebookId: 'eb22',
        code: 'EB22',
        title: 'O Mapa da Escola',
        coverUrl: null,
        category: 'Cidadania',
      },
    ],
    ebooks: [
      {
        ebookId: 'eb40',
        code: 'EB40',
        title: 'O Caso da Couve Mordida',
        coverUrl: null,
        category: 'Educação 4.0 e 5.0',
        percent: 100,
        timeSpentSeconds: 2400,
        accesses: 5,
        lastReadAt: '2026-11-17T12:00:00Z',
        effectiveReadAt: '2026-11-17T12:00:00Z',
        sectionsSeen: [],
      },
      {
        ebookId: 'eb01',
        code: 'EB01',
        title: 'A Barraca do 4º B',
        coverUrl: null,
        category: 'Educação Financeira',
        percent: 45,
        timeSpentSeconds: 1500,
        accesses: 4,
        lastReadAt: '2026-11-15T12:00:00Z',
        effectiveReadAt: null,
        sectionsSeen: [],
      },
      {
        ebookId: 'eb06',
        code: 'EB06',
        title: 'O Preço do Tempo: Juros',
        coverUrl: null,
        category: 'Educação Financeira',
        percent: 0,
        timeSpentSeconds: 60,
        accesses: 1,
        lastReadAt: '2026-11-10T12:00:00Z',
        effectiveReadAt: null,
        sectionsSeen: [],
      },
    ],
  }),
};

/**
 * A client answering the report routes after a short wait, or failing.
 * @param {boolean} fail - Whether every request fails
 * @returns {BaseApiClient} The client
 */
const storyApi = (fail = false): BaseApiClient => ({
  get: () => Promise.reject(new Error('not used')),
  patch: () => Promise.reject(new Error('not used')),
  delete: () => Promise.reject(new Error('not used')),
  post: <T,>(route: string, body?: object) =>
    new Promise<{ data: T }>((resolve, reject) =>
      setTimeout(() => {
        if (fail) {
          reject(new Error('rede'));
          return;
        }
        resolve({
          data: {
            message: 'ok',
            data: ROUTES[route]((body ?? {}) as Record<string, unknown>),
          } as T,
        });
      }, 400)
    ),
});

const API = storyApi();
const FAILING_API = storyApi(true);

/** The manager's network view: municipalities and schools, each school opening its own page. */
export const Network: Story = () => (
  <div className="p-6 bg-background-50">
    <EbookReadingReport
      api={API}
      filters={FILTERS}
      groupBy={EBOOK_READING_GROUP.SCHOOL}
      onSchoolSelect={(school) => console.log('school', school.name)}
    />
  </div>
);

/** A school's page or a teacher: the students, with where each one is. */
export const Students: Story = () => (
  <div className="p-6 bg-background-50">
    <EbookReadingReport
      api={API}
      filters={{ ...FILTERS, schoolIds: ['s1'] }}
      groupBy={EBOOK_READING_GROUP.STUDENT}
    />
  </div>
);

/** A school by its classes, each opening its students. */
export const Classes: Story = () => (
  <div className="p-6 bg-background-50">
    <EbookReadingReport
      api={API}
      filters={FILTERS}
      groupBy={EBOOK_READING_GROUP.CLASS}
    />
  </div>
);

/** Every part failing, each with its retry. */
export const Failing: Story = () => (
  <div className="p-6 bg-background-50">
    <EbookReadingReport
      api={FAILING_API}
      filters={FILTERS}
      groupBy={EBOOK_READING_GROUP.SCHOOL}
    />
  </div>
);
