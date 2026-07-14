import { renderHook, act } from '@testing-library/react';
import { useColumnFilters, type FilterableColumn } from './useColumnFilters';
import { mockWindowLocation } from '../../test-utils/mockLocation';

const columns: FilterableColumn[] = [
  { key: 'schoolName' },
  {
    key: 'status',
    filter: {
      paramKey: 'statusFilter',
      options: [
        { value: 'DESTAQUE', label: 'Destaque' },
        { value: 'SEM_ACESSO', label: 'Sem acesso' },
      ],
    },
  },
  {
    key: 'tags',
    filter: {
      multiple: true,
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ],
    },
  },
];

const lastUrl = () => {
  const calls = (globalThis.history.replaceState as jest.Mock).mock.calls;
  return calls.at(-1)?.[2] as string | undefined;
};

describe('useColumnFilters', () => {
  let restoreLocation: () => void;
  let location: { href: string; search: string };

  beforeEach(() => {
    location = { href: 'http://localhost:3000/', search: '' };
    restoreLocation = mockWindowLocation(location).restore;

    // Mirror what a browser does: replaceState actually updates the URL. The
    // hook only writes when the URL would change, so a mock that records
    // without updating would make the second write look like a no-op.
    globalThis.history.replaceState = jest.fn(
      (_state: unknown, _title: string, url: string) => {
        const parsed = new URL(url);
        location.href = parsed.toString();
        location.search = parsed.search;
      }
    );
  });

  afterEach(() => restoreLocation());

  it('starts empty when the URL has no filters', () => {
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    expect(result.current.columnFilters).toEqual({});
    expect(result.current.columnFilterParams).toEqual({});
  });

  it('does not touch the URL just by mounting', () => {
    // Otherwise a table with no active filter would strip other components'
    // query params on every mount.
    renderHook(() => useColumnFilters(columns, { syncWithUrl: true }));

    expect(globalThis.history.replaceState).not.toHaveBeenCalled();
  });

  it('emits a single-value filter unwrapped, under its paramKey', () => {
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    act(() => result.current.setColumnFilter('statusFilter', ['DESTAQUE']));

    expect(result.current.columnFilterParams).toEqual({
      statusFilter: 'DESTAQUE',
    });
    expect(lastUrl()).toContain('colfilter_statusFilter=DESTAQUE');
  });

  it('keeps a multiple filter as an array', () => {
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    act(() => result.current.setColumnFilter('tags', ['a', 'b']));

    expect(result.current.columnFilterParams).toEqual({ tags: ['a', 'b'] });
    expect(lastUrl()).toContain('colfilter_tags=a%2Cb');
  });

  it('drops the key entirely when the selection is cleared', () => {
    // "Todos" must remove the field from the request — not send it as "".
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    act(() => result.current.setColumnFilter('statusFilter', ['DESTAQUE']));
    act(() => result.current.setColumnFilter('statusFilter', []));

    expect(result.current.columnFilterParams).toEqual({});
    expect(lastUrl()).not.toContain('colfilter_statusFilter');
  });

  it('hydrates from the URL', () => {
    location.href =
      'http://localhost:3000/?colfilter_statusFilter=SEM_ACESSO&colfilter_tags=a,b';
    location.search = '?colfilter_statusFilter=SEM_ACESSO&colfilter_tags=a,b';

    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    expect(result.current.columnFilters).toEqual({
      statusFilter: ['SEM_ACESSO'],
      tags: ['a', 'b'],
    });
    expect(result.current.columnFilterParams).toEqual({
      statusFilter: 'SEM_ACESSO',
      tags: ['a', 'b'],
    });
  });

  it('namespaces the URL keys with urlKeyPrefix', () => {
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true, urlKeyPrefix: 'schools' })
    );

    act(() => result.current.setColumnFilter('statusFilter', ['DESTAQUE']));

    expect(lastUrl()).toContain('schools_colfilter_statusFilter=DESTAQUE');
  });

  it('calls onFiltersChange on every change', () => {
    const onFiltersChange = jest.fn();
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true, onFiltersChange })
    );

    act(() => result.current.setColumnFilter('statusFilter', ['DESTAQUE']));
    act(() => result.current.setColumnFilter('statusFilter', []));

    expect(onFiltersChange).toHaveBeenCalledTimes(2);
  });

  it('ignores columns without a filter config', () => {
    const { result } = renderHook(() =>
      useColumnFilters(columns, { syncWithUrl: true })
    );

    act(() => result.current.setColumnFilter('schoolName', ['whatever']));

    // It lands in state, but never in the params — no filter spec, no key.
    expect(result.current.columnFilterParams).toEqual({});
  });

  it('does not resubscribe when the caller rebuilds the columns array', () => {
    // Callers rarely memoize their columns; keying off array identity would
    // rerun the URL effect on every render.
    const { result, rerender } = renderHook(
      ({ cols }) => useColumnFilters(cols, { syncWithUrl: true }),
      { initialProps: { cols: [...columns] } }
    );

    act(() => result.current.setColumnFilter('statusFilter', ['DESTAQUE']));
    const callsAfterChange = (globalThis.history.replaceState as jest.Mock).mock
      .calls.length;

    rerender({ cols: [...columns] });

    expect(
      (globalThis.history.replaceState as jest.Mock).mock.calls.length
    ).toBe(callsAfterChange);
  });
});
