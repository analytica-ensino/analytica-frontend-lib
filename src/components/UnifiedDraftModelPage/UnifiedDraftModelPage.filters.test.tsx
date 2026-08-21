import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Loaded first on purpose: several shared components import the library barrel,
// so entering the module graph through a leaf here would evaluate the barrel
// mid-initialization (a jest/CJS-only artifact; the bundled build resolves it).
import '../../index';
import { UnifiedDraftModelPage } from './UnifiedDraftModelPage';
import type { UnifiedDraftModelPageProps } from './types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';

// Only the router is mocked here: this suite exercises the real page layout,
// TableProvider and Filter chain to guarantee the subject filter reaches the
// fetch function as `subjectId` (the field the API expects).
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const SUBJECT_ID = '019d9cc9-7c2e-7035-83d4-e47819a095dc';

const createRow = (
  overrides: Partial<ActivityModelTableItem> = {}
): ActivityModelTableItem => ({
  id: '1',
  title: 'Modelo - Biologia',
  savedAt: '14/08/2026',
  type: ActivityType.MODELO,
  subject: {
    id: SUBJECT_ID,
    name: 'Biologia',
    icon: 'BookOpen',
    color: '#6B7280',
  },
  subjectId: SUBJECT_ID,
  ...overrides,
});

const createProps = (
  onParamsChange: jest.Mock,
  data: ActivityModelTableItem[] = [createRow()]
): UnifiedDraftModelPageProps => ({
  type: 'models',
  activityCategory: 'ATIVIDADE',
  data,
  loading: false,
  error: null,
  pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
  onDelete: jest.fn(),
  onSend: jest.fn(),
  onParamsChange,
  userData: null,
  activityImage: 'activity.png',
  noSearchImage: 'no-search.png',
  routes: {
    ATIVIDADE: {
      base: '/atividades',
      create: '/criar-atividade',
      details: (id: string) => `/atividades/detalhes/${id}`,
      editDraft: (id: string) => `/atividades/rascunhos/${id}`,
      editModel: (id: string) => `/atividades/modelos/${id}`,
    },
    PROVA: {
      base: '/provas',
      create: '/criar-prova',
      details: (id: string) => `/provas/detalhes/${id}`,
      editDraft: (id: string) => `/provas/rascunhos/${id}`,
      editModel: (id: string) => `/provas/modelos/${id}`,
    },
  } as UnifiedDraftModelPageProps['routes'],
});

describe('UnifiedDraftModelPage - subject filter', () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.window.history.replaceState({}, '', '/');
  });

  it('sends the subject selected in the URL as subjectId to the fetch function', async () => {
    globalThis.window.history.replaceState(
      {},
      '',
      `/atividades/modelos?filter_subject=${SUBJECT_ID}`
    );

    const onParamsChange = jest.fn();
    render(<UnifiedDraftModelPage {...createProps(onParamsChange)} />);

    await waitFor(() => {
      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ subjectId: SUBJECT_ID })
      );
    });
  });

  it('does not send subjectId when no subject is selected', async () => {
    globalThis.window.history.replaceState({}, '', '/atividades/modelos');

    const onParamsChange = jest.fn();
    render(<UnifiedDraftModelPage {...createProps(onParamsChange)} />);

    await waitFor(() => {
      expect(onParamsChange).toHaveBeenCalled();
    });

    for (const call of onParamsChange.mock.calls) {
      expect(call[0].subjectId).toBeUndefined();
    }
  });
});

describe('UnifiedDraftModelPage - items per page', () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.window.history.replaceState({}, '', '/');
  });

  it('keeps the chosen page size when the larger page reveals a new subject', async () => {
    const onParamsChange = jest.fn();
    const { rerender } = render(
      <UnifiedDraftModelPage {...createProps(onParamsChange)} />
    );

    fireEvent.change(screen.getByLabelText('Items por página'), {
      target: { value: '100' },
    });

    await waitFor(() => {
      expect(onParamsChange.mock.calls.at(-1)?.[0].limit).toBe(100);
    });

    // The 100-row response contains a subject absent from the first 10 rows.
    rerender(
      <UnifiedDraftModelPage
        {...createProps(onParamsChange, [
          createRow(),
          createRow({
            id: '2',
            subjectId: 'other-subject',
            subject: {
              id: 'other-subject',
              name: 'História',
              icon: 'BookOpen',
              color: '#6B7280',
            },
          }),
        ])}
      />
    );

    await waitFor(() => {
      expect(onParamsChange).toHaveBeenCalled();
    });

    expect(onParamsChange.mock.calls.at(-1)?.[0].limit).toBe(100);
  });
});
