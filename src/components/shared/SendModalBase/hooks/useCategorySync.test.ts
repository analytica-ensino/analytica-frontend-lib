import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';
import { useCategorySync } from './useCategorySync';
import type { CategoryConfig } from '../../../CheckBoxGroup/CheckBoxGroup';

const makeRef = (value: boolean): RefObject<boolean> =>
  ({ current: value }) as RefObject<boolean>;

const category = (key: string, ids: string[] = []): CategoryConfig =>
  ({
    key,
    label: key,
    itens: ids.map((id) => ({ id, name: id })),
  }) as CategoryConfig;

type Params = Parameters<typeof useCategorySync>[0];

const renderSync = (overrides: Partial<Params> = {}) => {
  const setCategories = jest.fn();
  const props: Params = {
    isOpen: true,
    initialCategories: [category('turma')],
    storeCategories: [category('turma')],
    setCategories,
    categoriesInitializedRef: makeRef(true),
    ...overrides,
  };
  renderHook(() => useCategorySync(props));
  return { setCategories };
};

describe('useCategorySync', () => {
  it('syncs when parent gains turma itens the store does not have', () => {
    const { setCategories } = renderSync({
      initialCategories: [category('turma', ['t1', 't2'])],
      storeCategories: [category('turma')],
    });

    const initialCategories = [category('turma', ['t1', 't2'])];
    expect(setCategories).toHaveBeenCalledTimes(1);
    expect(setCategories.mock.calls[0][0]).toEqual(initialCategories);
  });

  it('syncs when parent gains students itens the store does not have', () => {
    const initialCategories = [category('students', ['a1', 'a2'])];
    const { setCategories } = renderSync({
      initialCategories,
      storeCategories: [category('students')],
    });

    expect(setCategories).toHaveBeenCalledTimes(1);
    expect(setCategories).toHaveBeenCalledWith(initialCategories);
  });

  it('syncs on same-length-different-content turma change (id signature)', () => {
    const initialCategories = [category('turma', ['c', 'd'])];
    const { setCategories } = renderSync({
      initialCategories,
      storeCategories: [category('turma', ['a', 'b'])],
    });

    expect(setCategories).toHaveBeenCalledTimes(1);
    expect(setCategories).toHaveBeenCalledWith(initialCategories);
  });

  it('does not sync when turma and students signatures already match', () => {
    const { setCategories } = renderSync({
      initialCategories: [
        category('turma', ['t1', 't2']),
        category('students', ['a1']),
      ],
      storeCategories: [
        category('turma', ['t1', 't2']),
        category('students', ['a1']),
      ],
    });

    expect(setCategories).not.toHaveBeenCalled();
  });

  it('syncs on turma change even when students are already populated (students segment must not mask turma change)', () => {
    const initialCategories = [
      category('turma', ['c', 'd']),
      category('students', ['s1']),
    ];
    const { setCategories } = renderSync({
      initialCategories,
      storeCategories: [
        category('turma', ['a', 'b']),
        category('students', ['s1']),
      ],
    });

    expect(setCategories).toHaveBeenCalledTimes(1);
    expect(setCategories).toHaveBeenCalledWith(initialCategories);
  });

  it('does not sync when isOpen is false', () => {
    const { setCategories } = renderSync({
      isOpen: false,
      initialCategories: [category('turma', ['t1'])],
      storeCategories: [category('turma')],
    });

    expect(setCategories).not.toHaveBeenCalled();
  });

  it('does not sync when categories are not initialized', () => {
    const { setCategories } = renderSync({
      categoriesInitializedRef: makeRef(false),
      initialCategories: [category('turma', ['t1'])],
      storeCategories: [category('turma')],
    });

    expect(setCategories).not.toHaveBeenCalled();
  });

  it('does not sync when initialCategories is empty', () => {
    const { setCategories } = renderSync({
      initialCategories: [],
      storeCategories: [category('turma', ['t1'])],
    });

    expect(setCategories).not.toHaveBeenCalled();
  });
});
