import { renderHook, act } from '@testing-library/react';
import { useInstitutionId } from '../../src/hooks/useInstitution';

// Mock do MutationObserver
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();

const mockMutationObserver = jest.fn().mockImplementation((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  callback, // Armazena o callback para uso posterior
}));

// Mock global MutationObserver
Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  value: mockMutationObserver,
});

// Mock para document.querySelector
const mockQuerySelector = jest.fn();
Object.defineProperty(document, 'querySelector', {
  writable: true,
  value: mockQuerySelector,
});

describe('useInstitutionId', () => {
  let mockMetaTag: HTMLMetaElement;
  let observerCallback: ((mutations: MutationRecord[]) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset do callback
    observerCallback = null;

    // Mock do meta tag
    mockMetaTag = document.createElement('meta');
    mockMetaTag.name = 'institution-id';
    mockMetaTag.content = 'test-institution-123';

    // Mock do querySelector para retornar o meta tag
    mockQuerySelector.mockImplementation((selector: string) => {
      if (selector === 'meta[name="institution-id"]') {
        return mockMetaTag;
      }
      return null;
    });

    // Mock do MutationObserver para capturar o callback
    mockMutationObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return institution ID when meta tag exists', () => {
    const { result } = renderHook(() => useInstitutionId());
    expect(result.current).toBe('test-institution-123');
    expect(mockObserve).toHaveBeenCalledWith(mockMetaTag, {
      attributes: true,
      attributeFilter: ['content'],
    });
  });

  it('should return null when meta tag does not exist', () => {
    mockQuerySelector.mockReturnValue(null);
    const { result } = renderHook(() => useInstitutionId());
    expect(result.current).toBe(null);
  });

  it('should update when meta tag content changes', () => {
    const { result } = renderHook(() => useInstitutionId());

    expect(result.current).toBe('test-institution-123');

    act(() => {
      mockMetaTag.content = 'new-institution-456';

      // Simula a mudança do atributo
      if (observerCallback) {
        observerCallback([
          {
            type: 'attributes',
            attributeName: 'content',
            target: mockMetaTag,
            addedNodes: document.createDocumentFragment().childNodes,
            attributeNamespace: null,
            nextSibling: null,
            oldValue: null,
            previousSibling: null,
            removedNodes: document.createDocumentFragment().childNodes,
          } as MutationRecord,
        ]);
      }
    });

    expect(result.current).toBe('new-institution-456');
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useInstitutionId());
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
