import { renderHook, act } from '@testing-library/react';
import { useDraftAutoSave, ApiClient } from './useDraftAutoSave';
import { useQuizStore } from '../components/Quiz/useQuizStore';

// Mock the useQuizStore
jest.mock('../components/Quiz/useQuizStore', () => ({
  useQuizStore: jest.fn(),
}));

describe('useDraftAutoSave', () => {
  // Mock functions
  const mockSetDraftApiClient = jest.fn();
  const mockSaveDraft = jest.fn();

  // Mock API client
  const mockApiClient: ApiClient = {
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
    get: jest.fn().mockResolvedValue({
      data: { data: { hasDraft: true, answers: [] } },
    }),
  };

  // Store original document.visibilityState
  let originalVisibilityState: PropertyDescriptor | undefined;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useQuizStore return value
    (useQuizStore as unknown as jest.Mock).mockReturnValue({
      setDraftApiClient: mockSetDraftApiClient,
      saveDraft: mockSaveDraft,
    });

    // Store original visibilityState descriptor
    originalVisibilityState = Object.getOwnPropertyDescriptor(
      document,
      'visibilityState'
    );
  });

  afterEach(() => {
    // Restore original visibilityState
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
  });

  describe('initialization', () => {
    it('should set draft API client when enabled', () => {
      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          saveDraft: expect.any(Function),
          loadDraft: expect.any(Function),
        })
      );
    });

    it('should set draft API client to null when disabled', () => {
      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: false,
        })
      );

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(null);
    });

    it('should cleanup draft API client on unmount', () => {
      const { unmount } = renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      mockSetDraftApiClient.mockClear();

      unmount();

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(null);
    });
  });

  describe('visibility change handling', () => {
    it('should save draft when page becomes hidden', () => {
      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      // Simulate visibility change to hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(mockSaveDraft).toHaveBeenCalled();
    });

    it('should not save draft when page becomes visible', () => {
      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      // Simulate visibility change to visible
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should not save draft on visibility change when disabled', () => {
      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: false,
        })
      );

      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should remove visibility listener on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('draft API client methods', () => {
    it('should create saveDraft method that calls apiClient.post', async () => {
      let capturedClient: { saveDraft: Function; loadDraft: Function } | null =
        null;

      mockSetDraftApiClient.mockImplementation((client) => {
        capturedClient = client;
      });

      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      expect(capturedClient).not.toBeNull();

      const payload = { answers: [{ questionId: 'q1', optionId: 'opt1' }] };
      await capturedClient!.saveDraft('activity-123', payload);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/draft',
        payload
      );
    });

    it('should create loadDraft method that calls apiClient.get', async () => {
      let capturedClient: { saveDraft: Function; loadDraft: Function } | null =
        null;

      mockSetDraftApiClient.mockImplementation((client) => {
        capturedClient = client;
      });

      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      expect(capturedClient).not.toBeNull();

      await capturedClient!.loadDraft('activity-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/draft'
      );
    });

    it('should use custom endpoint when provided', async () => {
      let capturedClient: { saveDraft: Function; loadDraft: Function } | null =
        null;

      mockSetDraftApiClient.mockImplementation((client) => {
        capturedClient = client;
      });

      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
          endpoint: '/custom/{activityId}/save',
        })
      );

      expect(capturedClient).not.toBeNull();

      await capturedClient!.saveDraft('my-activity', { answers: [] });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/custom/my-activity/save',
        { answers: [] }
      );
    });

    it('should parse loadDraft response correctly', async () => {
      let capturedClient: { saveDraft: Function; loadDraft: Function } | null =
        null;

      mockSetDraftApiClient.mockImplementation((client) => {
        capturedClient = client;
      });

      const mockResponse = {
        data: {
          data: {
            hasDraft: true,
            answers: [{ questionId: 'q1', optionId: 'opt1' }],
          },
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      const result = await capturedClient!.loadDraft('activity-123');

      expect(result).toEqual({
        hasDraft: true,
        answers: [{ questionId: 'q1', optionId: 'opt1' }],
      });
    });

    it('should return null when loadDraft response has no data', async () => {
      let capturedClient: { saveDraft: Function; loadDraft: Function } | null =
        null;

      mockSetDraftApiClient.mockImplementation((client) => {
        capturedClient = client;
      });

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({ data: {} });

      renderHook(() =>
        useDraftAutoSave({
          apiClient: mockApiClient,
          enabled: true,
        })
      );

      const result = await capturedClient!.loadDraft('activity-123');

      expect(result).toBeNull();
    });
  });

  describe('enabled state changes', () => {
    it('should update API client when enabled changes from false to true', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useDraftAutoSave({
            apiClient: mockApiClient,
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(null);

      mockSetDraftApiClient.mockClear();

      rerender({ enabled: true });

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          saveDraft: expect.any(Function),
          loadDraft: expect.any(Function),
        })
      );
    });

    it('should update API client when enabled changes from true to false', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useDraftAutoSave({
            apiClient: mockApiClient,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          saveDraft: expect.any(Function),
          loadDraft: expect.any(Function),
        })
      );

      mockSetDraftApiClient.mockClear();

      rerender({ enabled: false });

      expect(mockSetDraftApiClient).toHaveBeenCalledWith(null);
    });
  });
});
