/**
 * Tests for RecommendedLessonsHistory index exports
 */

// Mock all dependencies that would be loaded through the index
jest.mock('../Menu/Menu', () => ({
  Menu: () => null,
  MenuItem: () => null,
  MenuContent: () => null,
}));
jest.mock('../TableProvider/TableProvider', () => ({
  TableProvider: () => null,
}));
jest.mock('../Badge/Badge', () => ({ __esModule: true, default: () => null }));
jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../IconButton/IconButton', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../EmptyState/EmptyState', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../ProgressBar/ProgressBar', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../Text/Text', () => ({ __esModule: true, default: () => null }));
jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: () => ({ icon: null, colorClass: '' }),
}));
jest.mock('phosphor-react', () => ({
  Plus: () => null,
  CaretRight: () => null,
  Trash: () => null,
  PencilSimple: () => null,
}));

describe('RecommendedLessonsHistory index exports', () => {
  it('should export RecommendedLessonsHistory component from index', async () => {
    const indexModule = await import('./index');

    expect(indexModule.RecommendedLessonsHistory).toBeDefined();
    expect(typeof indexModule.RecommendedLessonsHistory).toBe('function');
  });

  it('should export default as the same component', async () => {
    const indexModule = await import('./index');

    expect(indexModule.default).toBeDefined();
    expect(indexModule.default).toBe(indexModule.RecommendedLessonsHistory);
  });
});
