import { renderHook } from '@testing-library/react';
import { useModules } from './useModules';
import { useModulesStore } from '../store/modulesStore';

// Mock the modulesStore
jest.mock('../store/modulesStore', () => ({
  useModulesStore: jest.fn(),
}));

const mockUseModulesStore = useModulesStore as jest.MockedFunction<
  typeof useModulesStore
>;

describe('useModules', () => {
  const defaultModules = {
    simulator: true,
    essay: true,
    forum: true,
    support: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('return values', () => {
    it('should return modules object', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.modules).toEqual(defaultModules);
    });

    it('should return loading state', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: true,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(true);
    });

    it('should return hasSimulator helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, simulator: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(true);
    });

    it('should return hasEssay helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, essay: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasEssay).toBe(true);
    });

    it('should return hasForum helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, forum: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasForum).toBe(true);
    });

    it('should return hasSupport helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, support: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSupport).toBe(true);
    });
  });

  describe('helper boolean values', () => {
    it('should return false for hasSimulator when simulator is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, simulator: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(false);
    });

    it('should return false for hasEssay when essay is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, essay: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasEssay).toBe(false);
    });

    it('should return false for hasForum when forum is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, forum: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasForum).toBe(false);
    });

    it('should return false for hasSupport when support is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, support: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('all modules disabled', () => {
    it('should return all helpers as false when all modules are disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          simulator: false,
          essay: false,
          forum: false,
          support: false,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(false);
      expect(result.current.hasEssay).toBe(false);
      expect(result.current.hasForum).toBe(false);
      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('mixed module states', () => {
    it('should correctly reflect mixed enabled/disabled states', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          simulator: true,
          essay: false,
          forum: true,
          support: false,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(true);
      expect(result.current.hasEssay).toBe(false);
      expect(result.current.hasForum).toBe(true);
      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('loading state combinations', () => {
    it('should return loading true with default modules', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: true,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(true);
      expect(result.current.modules).toEqual(defaultModules);
    });

    it('should return loading false with custom modules', () => {
      const customModules = {
        simulator: false,
        essay: true,
        forum: false,
        support: true,
      };

      mockUseModulesStore.mockReturnValue({
        modules: customModules,
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(false);
      expect(result.current.modules).toEqual(customModules);
    });
  });
});
