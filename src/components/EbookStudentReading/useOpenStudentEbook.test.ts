import { act, renderHook } from '@testing-library/react';
import { useOpenStudentEbook } from './useOpenStudentEbook';

const ebook = {
  id: 'eb-1',
  code: 'EB01',
  title: 'Livro 1',
  subtitle: null,
  coverUrl: null,
  category: null,
  percent: 40,
  effectiveReadAt: null,
};

describe('useOpenStudentEbook', () => {
  it('keeps the book open while the same student is on screen', () => {
    const { result, rerender } = renderHook(
      ({ studentKey }) => useOpenStudentEbook(true, studentKey),
      { initialProps: { studentKey: 'ui-1' } }
    );

    act(() => result.current[1](ebook));
    rerender({ studentKey: 'ui-1' });

    expect(result.current[0]).toEqual(ebook);
  });

  it('closes the book for another student, or when the modal closes', () => {
    const { result, rerender } = renderHook(
      ({ isOpen, studentKey }) => useOpenStudentEbook(isOpen, studentKey),
      { initialProps: { isOpen: true, studentKey: 'ui-1' } }
    );

    act(() => result.current[1](ebook));
    rerender({ isOpen: true, studentKey: 'ui-2' });
    expect(result.current[0]).toBeNull();

    act(() => result.current[1](ebook));
    rerender({ isOpen: false, studentKey: 'ui-2' });
    expect(result.current[0]).toBeNull();
  });
});
