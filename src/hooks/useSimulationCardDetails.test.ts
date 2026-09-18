import { act, renderHook } from '@testing-library/react';
import { useSimulationCardDetails } from './useSimulationCardDetails';
import type { BaseApiClient } from '../types/api';
import type { NoteData, SimulationDetailData } from '../types/simulations';

const fetchSimulationDetail = jest.fn();
const fetchNote = jest.fn();
const uploadNoteAttachment = jest.fn();
const saveNote = jest.fn();
const saveQuestionComment = jest.fn();

jest.mock('./useSimulations', () => ({
  createUseSimulations: () => () => ({
    fetchSimulationDetail: (...args: unknown[]) =>
      fetchSimulationDetail(...args),
    fetchNote: (...args: unknown[]) => fetchNote(...args),
    uploadNoteAttachment: (...args: unknown[]) => uploadNoteAttachment(...args),
    saveNote: (...args: unknown[]) => saveNote(...args),
    saveQuestionComment: (...args: unknown[]) => saveQuestionComment(...args),
  }),
}));

const api = {} as BaseApiClient;

const detail: SimulationDetailData = {
  simulationId: 'sim-1',
  title: 'Simulado 1',
  counts: { correct: 1, incorrect: 0, blank: 0, pending: 0 },
  questions: [
    {
      questionId: 'q-1',
      teacherComment: '',
    } as unknown as SimulationDetailData['questions'][number],
    {
      questionId: 'q-2',
      teacherComment: 'old',
    } as unknown as SimulationDetailData['questions'][number],
  ],
};

const note: NoteData = {
  id: 'note-1',
  activityId: 'sim-1',
  studentUserInstitutionId: 'ui-1',
  note: 'Bom trabalho',
  attachment: null,
  updatedAt: '2026-09-18T00:00:00.000Z',
};

const flush = () => act(async () => Promise.resolve());

describe('useSimulationCardDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchSimulationDetail.mockResolvedValue(detail);
    fetchNote.mockResolvedValue(note);
    uploadNoteAttachment.mockResolvedValue('https://cdn/file.pdf');
    saveNote.mockResolvedValue({ ...note, note: 'Salvo' });
    saveQuestionComment.mockResolvedValue({ teacherComment: 'Novo' });
  });

  const setup = (overrides: { enabled?: boolean; isOpen?: boolean } = {}) =>
    renderHook(
      ({ enabled, isOpen }) =>
        useSimulationCardDetails({
          api,
          userInstitutionId: 'ui-1',
          isOpen,
          enabled,
        }),
      { initialProps: { enabled: true, isOpen: true, ...overrides } }
    );

  it('expands a card and loads its detail and observation once', async () => {
    const { result } = setup();

    act(() => result.current.toggle('sim-1'));
    await flush();

    expect(result.current.expandedId).toBe('sim-1');
    expect(fetchSimulationDetail).toHaveBeenCalledWith('ui-1', 'sim-1');
    expect(fetchNote).toHaveBeenCalledWith('ui-1', 'sim-1');
    expect(result.current.details['sim-1']).toEqual({
      loading: false,
      error: null,
      data: detail,
    });
    expect(result.current.notes['sim-1']).toEqual({
      loading: false,
      error: null,
      data: note,
    });

    // Collapse and expand again: nothing is fetched twice.
    act(() => result.current.toggle('sim-1'));
    expect(result.current.expandedId).toBeNull();
    act(() => result.current.toggle('sim-1'));
    await flush();
    expect(fetchSimulationDetail).toHaveBeenCalledTimes(1);
    expect(fetchNote).toHaveBeenCalledTimes(1);
  });

  it('keeps the error of each request apart', async () => {
    fetchSimulationDetail.mockRejectedValueOnce(new Error('boom'));
    fetchNote.mockRejectedValueOnce(new Error('boom'));
    const { result } = setup();

    act(() => result.current.toggle('sim-1'));
    await flush();

    expect(result.current.details['sim-1']).toEqual({
      loading: false,
      error: 'Erro ao carregar as respostas',
      data: null,
    });
    expect(result.current.notes['sim-1']).toEqual({
      loading: false,
      error: 'Erro ao carregar a observação',
      data: null,
    });

    // The retry only touches the observation.
    act(() => result.current.retryNote('sim-1'));
    await flush();
    expect(fetchNote).toHaveBeenCalledTimes(2);
    expect(fetchSimulationDetail).toHaveBeenCalledTimes(1);
    expect(result.current.notes['sim-1'].data).toEqual(note);
  });

  it('expands without loading while disabled, and catches up when enabled', async () => {
    const { result, rerender } = setup({ enabled: false });

    act(() => result.current.toggle('sim-1'));
    await flush();
    expect(result.current.expandedId).toBe('sim-1');
    expect(fetchSimulationDetail).not.toHaveBeenCalled();
    expect(fetchNote).not.toHaveBeenCalled();

    rerender({ enabled: true, isOpen: true });
    await flush();

    expect(fetchSimulationDetail).toHaveBeenCalledWith('ui-1', 'sim-1');
    expect(fetchNote).toHaveBeenCalledWith('ui-1', 'sim-1');
    expect(result.current.details['sim-1'].data).toEqual(detail);
  });

  it('does nothing without an enrollment', async () => {
    const { result } = renderHook(() =>
      useSimulationCardDetails({ api, userInstitutionId: null, isOpen: true })
    );

    act(() => result.current.toggle('sim-1'));
    act(() => result.current.retryNote('sim-1'));
    await act(async () => {
      await result.current.makeSaveNote('sim-1')('x', null, null);
      await result.current.makeSaveQuestionComment('sim-1')('q-1', 'x');
    });

    expect(result.current.expandedId).toBeNull();
    expect(fetchSimulationDetail).not.toHaveBeenCalled();
    expect(fetchNote).not.toHaveBeenCalled();
    expect(saveNote).not.toHaveBeenCalled();
    expect(saveQuestionComment).not.toHaveBeenCalled();
  });

  it('saves the observation, uploading a new file first', async () => {
    const { result } = setup();
    const file = new File(['x'], 'file.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.makeSaveNote('sim-1')('Salvo', file, null);
    });

    expect(uploadNoteAttachment).toHaveBeenCalledWith(file);
    expect(saveNote).toHaveBeenCalledWith(
      'ui-1',
      'sim-1',
      'Salvo',
      'https://cdn/file.pdf'
    );
    expect(result.current.notes['sim-1'].data?.note).toBe('Salvo');
  });

  it('keeps the existing attachment when no new file is chosen', async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.makeSaveNote('sim-1')(
        'Salvo',
        null,
        'https://cdn/old.pdf'
      );
    });

    expect(uploadNoteAttachment).not.toHaveBeenCalled();
    expect(saveNote).toHaveBeenCalledWith(
      'ui-1',
      'sim-1',
      'Salvo',
      'https://cdn/old.pdf'
    );
  });

  it('writes a saved question comment into the loaded detail', async () => {
    const { result } = setup();
    act(() => result.current.toggle('sim-1'));
    await flush();

    await act(async () => {
      await result.current.makeSaveQuestionComment('sim-1')('q-1', 'Novo');
    });

    expect(saveQuestionComment).toHaveBeenCalledWith(
      'ui-1',
      'sim-1',
      'q-1',
      'Novo'
    );
    const questions = result.current.details['sim-1'].data?.questions ?? [];
    expect(questions.map((question) => question.teacherComment)).toEqual([
      'Novo',
      'old',
    ]);
  });

  it('clears a question comment the server answered empty', async () => {
    saveQuestionComment.mockResolvedValueOnce(null);
    const { result } = setup();
    act(() => result.current.toggle('sim-1'));
    await flush();

    await act(async () => {
      await result.current.makeSaveQuestionComment('sim-1')('q-2', '');
    });

    const questions = result.current.details['sim-1'].data?.questions ?? [];
    expect(questions[1].teacherComment).toBe('');
  });

  it('ignores a question comment saved for a card whose detail is not loaded', async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.makeSaveQuestionComment('sim-9')('q-1', 'Novo');
    });

    expect(result.current.details).toEqual({});
  });

  it('starts a fresh session when the modal reopens, dropping late answers', async () => {
    let resolveDetail: (value: SimulationDetailData) => void = () => {};
    fetchSimulationDetail.mockImplementationOnce(
      () =>
        new Promise<SimulationDetailData>((resolve) => {
          resolveDetail = resolve;
        })
    );
    const { result, rerender } = setup();

    act(() => result.current.toggle('sim-1'));
    rerender({ enabled: true, isOpen: false });
    rerender({ enabled: true, isOpen: true });

    await act(async () => {
      resolveDetail(detail);
      await Promise.resolve();
    });

    expect(result.current.expandedId).toBeNull();
    expect(result.current.details).toEqual({});
  });
});
