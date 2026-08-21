import { renderHook } from '@testing-library/react';
import { useAccumulatedSubjectOptions } from './useAccumulatedSubjectOptions';
import type { ActivityModelTableItem } from '../types/activitiesHistory';
import { ActivityType } from '../components/ActivityCreate/ActivityCreate.types';

const row = (
  id: string,
  subjectId: string | undefined,
  subjectName: string | undefined
): ActivityModelTableItem =>
  ({
    id,
    title: `Modelo ${id}`,
    savedAt: '14/08/2026',
    type: ActivityType.MODELO,
    subject: subjectName
      ? { id: subjectId!, name: subjectName, icon: 'BookOpen', color: '#000' }
      : null,
    subjectId,
  }) as ActivityModelTableItem;

describe('useAccumulatedSubjectOptions', () => {
  it('extracts subject options from the rows', () => {
    const { result } = renderHook(() =>
      useAccumulatedSubjectOptions([
        row('1', 's1', 'Biologia'),
        row('2', 's2', 'Física'),
      ])
    );

    expect(result.current).toEqual([
      { id: 's1', name: 'Biologia' },
      { id: 's2', name: 'Física' },
    ]);
  });

  it('deduplicates repeated subjects within the same page', () => {
    const { result } = renderHook(() =>
      useAccumulatedSubjectOptions([
        row('1', 's1', 'Biologia'),
        row('2', 's1', 'Biologia'),
        row('3', 's1', 'Biologia'),
      ])
    );

    expect(result.current).toEqual([{ id: 's1', name: 'Biologia' }]);
  });

  it('keeps subjects seen earlier when a later page no longer contains them', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useAccumulatedSubjectOptions(data),
      { initialProps: { data: [row('1', 's1', 'Biologia')] } }
    );

    rerender({ data: [row('2', 's2', 'Física')] });

    expect(result.current).toEqual([
      { id: 's1', name: 'Biologia' },
      { id: 's2', name: 'Física' },
    ]);
  });

  it('keeps the same reference when no new subject shows up', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useAccumulatedSubjectOptions(data),
      { initialProps: { data: [row('1', 's1', 'Biologia')] } }
    );

    const first = result.current;
    // Same subject, different row identity — a plain page change.
    rerender({ data: [row('9', 's1', 'Biologia')] });

    expect(result.current).toBe(first);
  });

  it('ignores rows without a usable subject', () => {
    const { result } = renderHook(() =>
      useAccumulatedSubjectOptions([
        row('1', undefined, undefined),
        row('2', 's2', '-'),
        row('3', 's3', 'Química'),
      ])
    );

    expect(result.current).toEqual([{ id: 's3', name: 'Química' }]);
  });
});
