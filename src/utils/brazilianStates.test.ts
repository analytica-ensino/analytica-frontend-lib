import { BR_STATES_FULL, UF_LIST } from './brazilianStates';

describe('brazilianStates', () => {
  it('UF_LIST has all 27 federative units', () => {
    expect(UF_LIST).toHaveLength(27);
  });

  it('UF_LIST is alphabetically sorted', () => {
    const sorted = [...UF_LIST].sort();
    expect(UF_LIST).toEqual(sorted);
  });

  it('UF_LIST contains DF', () => {
    expect(UF_LIST).toContain('DF');
  });

  it('BR_STATES_FULL has the same length as UF_LIST', () => {
    expect(BR_STATES_FULL).toHaveLength(UF_LIST.length);
  });

  it('BR_STATES_FULL has matching ufs in the same order as UF_LIST', () => {
    expect(BR_STATES_FULL.map((s) => s.uf)).toEqual([...UF_LIST]);
  });

  it('BR_STATES_FULL has a non-empty name for every UF', () => {
    BR_STATES_FULL.forEach((state) => {
      expect(state.name.length).toBeGreaterThan(0);
    });
  });
});
