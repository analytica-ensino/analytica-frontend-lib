import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../../src/store/appStore';

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('appStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpar o store antes de cada teste
    act(() => {
      useAppStore.getState().setInstitutionId(null);
      useAppStore.getState().setInitialized(false);
    });
  });

  afterEach(() => {
    // Limpar o store após cada teste
    act(() => {
      useAppStore.getState().setInstitutionId(null);
      useAppStore.getState().setInitialized(false);
    });
  });

  describe('initial state', () => {
    it('should have correct initial state and methods', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.institutionId).toBeNull();
      expect(result.current.initialized).toBe(false);
      expect(typeof result.current.setInstitutionId).toBe('function');
      expect(typeof result.current.setInitialized).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
    });
  });

  describe('setInstitutionId', () => {
    it('should set institution ID correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setInstitutionId('test-institution-123');
      });

      expect(result.current.institutionId).toBe('test-institution-123');

      act(() => {
        result.current.setInstitutionId(null);
      });

      expect(result.current.institutionId).toBeNull();
    });
  });

  describe('setInitialized', () => {
    it('should set initialized state correctly', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setInitialized(true);
      });

      expect(result.current.initialized).toBe(true);

      act(() => {
        result.current.setInitialized(false);
      });

      expect(result.current.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid institution ID', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.initialize('test-institution-123');
      });

      expect(result.current.institutionId).toBe('test-institution-123');
      expect(result.current.initialized).toBe(true);
    });

    it('should not reinitialize if already initialized', () => {
      const { result } = renderHook(() => useAppStore());

      // Primeira inicialização
      act(() => {
        result.current.initialize('first-institution');
      });

      expect(result.current.institutionId).toBe('first-institution');
      expect(result.current.initialized).toBe(true);

      // Tentar inicializar novamente
      act(() => {
        result.current.initialize('second-institution');
      });

      // Deve manter os valores originais
      expect(result.current.institutionId).toBe('first-institution');
      expect(result.current.initialized).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle various institution ID types', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setInstitutionId('');
      });
      expect(result.current.institutionId).toBe('');

      act(() => {
        result.current.setInstitutionId(undefined as unknown as string);
      });
      expect(result.current.institutionId).toBeUndefined();

      act(() => {
        result.current.setInstitutionId('test@institution#123!');
      });
      expect(result.current.institutionId).toBe('test@institution#123!');
    });
  });
});
