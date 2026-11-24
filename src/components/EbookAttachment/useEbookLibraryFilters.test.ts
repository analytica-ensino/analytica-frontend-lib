import { act, renderHook } from '@testing-library/react';
import {
  ALL_EBOOKS_FILTER,
  useEbookLibraryFilters,
} from './useEbookLibraryFilters';

describe('useEbookLibraryFilters', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with every theme and segment and no search', () => {
    const { result } = renderHook(() => useEbookLibraryFilters());

    expect(result.current.theme).toBe(ALL_EBOOKS_FILTER);
    expect(result.current.segment).toBe(ALL_EBOOKS_FILTER);
    expect(result.current.filters).toEqual({
      search: '',
      theme: '',
      segment: '',
    });
  });

  it('asks for a theme and a segment at once, and the search once typing stops', () => {
    const { result } = renderHook(() => useEbookLibraryFilters());

    act(() => {
      result.current.setTheme('I');
      result.current.setSegment('Anos Iniciais');
      result.current.setSearchInput('EF04');
    });
    expect(result.current.searchInput).toBe('EF04');
    expect(result.current.filters).toEqual({
      search: '',
      theme: 'I',
      segment: 'Anos Iniciais',
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.filters.search).toBe('EF04');
  });
});
