import { classOptionLabel, listFilter, pickedValue } from './tableFilters';

describe('listFilter', () => {
  it('builds a searchable, single-choice header filter', () => {
    expect(
      listFilter('cityName', 'Todos os municípios', 'Buscar município...', [
        { value: 'Curitiba', label: 'Curitiba' },
        { value: 'Londrina', label: 'Londrina' },
      ])
    ).toEqual({
      paramKey: 'cityName',
      allLabel: 'Todos os municípios',
      searchable: true,
      searchPlaceholder: 'Buscar município...',
      options: [
        { value: 'Curitiba', label: 'Curitiba', searchText: 'Curitiba' },
        { value: 'Londrina', label: 'Londrina', searchText: 'Londrina' },
      ],
    });
  });

  it('searches each option by the label it shows', () => {
    const filter = listFilter('classIds', 'Todas as turmas', 'Buscar...', [
      { value: 'class-1', label: 'A (3ª série)' },
    ]);

    expect(filter.options[0].searchText).toBe('A (3ª série)');
    expect(filter.multiple).toBeUndefined();
  });

  it('offers nothing while there are no options', () => {
    expect(listFilter('classIds', 'Todas', 'Buscar', []).options).toEqual([]);
  });
});

describe('classOptionLabel', () => {
  it('names a class with its year', () => {
    expect(
      classOptionLabel({
        classId: 'class-1',
        className: 'A',
        schoolYearName: '3ª série',
      })
    ).toBe('A (3ª série)');
  });

  it('names a class alone when it has no year', () => {
    expect(
      classOptionLabel({
        classId: 'class-1',
        className: 'A',
        schoolYearName: null,
      })
    ).toBe('A');
  });

  it('names the students without a class "Sem turma"', () => {
    expect(
      classOptionLabel({
        classId: 'class-0',
        className: null,
        schoolYearName: null,
      })
    ).toBe('Sem turma');
    expect(
      classOptionLabel({
        classId: 'class-0',
        className: null,
        schoolYearName: '3ª série',
      })
    ).toBe('Sem turma (3ª série)');
  });
});

describe('pickedValue', () => {
  it('reads the string a filter reports', () => {
    expect(pickedValue('class-1')).toBe('class-1');
  });

  it('reads "all" — nothing, an empty string or another type — as no pick', () => {
    expect(pickedValue(undefined)).toBeUndefined();
    expect(pickedValue(null)).toBeUndefined();
    expect(pickedValue('')).toBeUndefined();
    expect(pickedValue(['class-1'])).toBeUndefined();
    expect(pickedValue(3)).toBeUndefined();
  });
});
