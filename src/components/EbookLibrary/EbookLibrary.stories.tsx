import type { Story } from '@ladle/react';
import { EbookLibrary } from './EbookLibrary';
import { StudentEbookReadingView } from '../EbookStudentReading/StudentEbookReadingView';
import type { BaseApiClient } from '../../types/api';
import type {
  EbookLibraryItem,
  EbookPreviewData,
  EbookStudentReading,
} from '../../types/ebookAttachment';

export default {
  title: 'EbookLibrary',
};

/**
 * EB40 ("O Caso da Couve Mordida"), served by Ladle itself
 * (`public/fixtures/ebook/eb40`), as the preview route answers it.
 */
const fixture = (folder: 'student' | 'teacher') =>
  new URL(`fixtures/ebook/eb40/${folder}/`, document.baseURI).href;

const BOOK_ID = 'eb40';
const GUIDE_ID = 'eb40-guia';

const previewOf = (id: string): EbookPreviewData => {
  const isGuide = id === GUIDE_ID;
  const base = fixture(isGuide ? 'teacher' : 'student');
  return {
    id,
    materialType: isGuide ? 'TEACHER' : 'STUDENT',
    pairEbookId: isGuide ? BOOK_ID : GUIDE_ID,
    title: isGuide
      ? 'Guia do Professor · O Caso da Couve Mordida'
      : 'O Caso da Couve Mordida',
    subtitle: null,
    coverUrl: null,
    details: {
      code: 'EB40',
      theme: 'Educação 4.0 e 5.0',
      audience: ['Estudantes'],
      schoolYears: ['4º ano'],
      authors: ['Equipe Pedagógica Paraná'],
      bncc: ['EF15LP14'],
      words: 1128,
      readingMinutes: 17,
    },
    version: {
      id: `v-${id}`,
      number: 1,
      htmlUrl: `${base}content.html`,
      cssUrl: `${base}styles.css`,
      narrationUrl: isGuide ? null : `${base}narration.json`,
      assetBaseUrl: base,
      fontsUrl: null,
    },
  };
};

const shelf: EbookLibraryItem[] = Array.from({ length: 30 }, (_, index) => ({
  id: index === 0 ? BOOK_ID : `eb${index}`,
  code: `EB${String(index + 1).padStart(2, '0')}`,
  title: index === 0 ? 'O Caso da Couve Mordida' : `Livro ${index + 1}`,
  subtitle: null,
  authors: ['Equipe Pedagógica Paraná'],
  coverUrl: null,
  category: 'Educação Financeira',
  theme: { code: 'I', name: 'Educação 4.0 e 5.0' },
  segment: 'Anos Iniciais',
  schoolYears: ['4º ano'],
}));

const reading: EbookStudentReading = {
  progress: {
    lastSection: 'suspeitos',
    percent: 50,
    totalSeconds: 420,
    effectiveReadAt: null,
  },
  sections: ['capa', 'rosto', 'quem', 'caso', 'suspeitos', 'noite'].map(
    (section, position) => ({
      section,
      title: `Capítulo ${position + 1}`,
      position,
      seenAt: position <= 4 ? '2026-11-20T12:00:00Z' : null,
    })
  ),
};

/** Answers the library, the preview and the reading routes in memory. */
const apiClient = {
  get: async (url: string, config?: { params?: Record<string, unknown> }) => {
    if (url === '/ebooks/library') {
      const page = Number(config?.params?.page ?? 1);
      const search = String(config?.params?.search ?? '').toLowerCase();
      const matches = shelf.filter((item) =>
        item.title.toLowerCase().includes(search)
      );
      return {
        data: {
          data: {
            items: matches.slice((page - 1) * 24, page * 24),
            total: matches.length,
            page,
            limit: 24,
            facets: {
              themes: [
                {
                  code: 'I',
                  name: 'Educação 4.0 e 5.0',
                  count: matches.length,
                },
              ],
              segments: [{ name: 'Anos Iniciais', count: matches.length }],
            },
          },
        },
      };
    }
    if (url.endsWith('/reading')) return { data: { data: reading } };
    const id = url.split('/')[2];
    return { data: { data: previewOf(id) } };
  },
} as unknown as BaseApiClient;

/** The teacher's and the manager's "Biblioteca": open a book for its preview. */
export const Library: Story = () => (
  <div className="min-h-screen bg-background-50 p-6">
    <EbookLibrary apiClient={apiClient} />
  </div>
);

/** "Acompanhamento de leitura" of a student, as the student modals open it. */
export const StudentReading: Story = () => (
  <div className="max-w-[970px] bg-background p-6">
    <StudentEbookReadingView
      apiClient={apiClient}
      userInstitutionId="ui-1"
      ebook={{
        id: BOOK_ID,
        code: 'EB40',
        title: 'O Caso da Couve Mordida',
        subtitle: null,
        coverUrl: null,
        category: 'Educação Financeira',
        percent: 50,
        effectiveReadAt: null,
      }}
    />
  </div>
);
