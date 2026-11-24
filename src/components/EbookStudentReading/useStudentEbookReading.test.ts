import { act, renderHook, waitFor } from '@testing-library/react';
import { useStudentEbookReading } from './useStudentEbookReading';
import type { BaseApiClient } from '../../types/api';
import type { EbookStudentReading } from '../../types/ebookAttachment';

const reading = (lastSection: string): EbookStudentReading => ({
  progress: {
    lastSection,
    percent: 50,
    totalSeconds: 60,
    effectiveReadAt: null,
  },
  sections: [],
});

describe('useStudentEbookReading', () => {
  it("loads the student's reading of the book", async () => {
    const get = jest.fn().mockResolvedValue({ data: { data: reading('p1') } });
    const api = { get } as unknown as BaseApiClient;

    const { result } = renderHook(() =>
      useStudentEbookReading(api, 'eb-1', 'ui-1')
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.reading).toEqual(reading('p1')));
    expect(result.current.loading).toBe(false);
    expect(get).toHaveBeenCalledWith('/ebooks/eb-1/students/ui-1/reading');
  });

  it('drops the answer of a student no longer on screen', async () => {
    let answerFirst: (value: unknown) => void = () => {};
    const get = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            answerFirst = resolve;
          })
      )
      .mockResolvedValueOnce({ data: { data: reading('p2') } });
    const api = { get } as unknown as BaseApiClient;
    const { result, rerender } = renderHook(
      ({ student }) => useStudentEbookReading(api, 'eb-1', student),
      { initialProps: { student: 'ui-1' } }
    );

    rerender({ student: 'ui-2' });
    await waitFor(() => expect(result.current.reading).toEqual(reading('p2')));
    await act(async () => {
      answerFirst({ data: { data: reading('p1') } });
    });

    expect(result.current.reading).toEqual(reading('p2'));
  });

  it('fails and tries again', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce({ data: { data: reading('p1') } });
    const api = { get } as unknown as BaseApiClient;
    const { result } = renderHook(() =>
      useStudentEbookReading(api, 'eb-1', 'ui-1')
    );

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.loading).toBe(false);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.reading).toEqual(reading('p1')));
    expect(result.current.error).toBe(false);
  });
});
