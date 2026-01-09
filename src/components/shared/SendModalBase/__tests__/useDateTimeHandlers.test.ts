import { renderHook, act } from '@testing-library/react';
import { useDateTimeHandlers } from '../hooks/useDateTimeHandlers';

interface TestFormData {
  startDate?: string;
  startTime?: string;
  finalDate?: string;
  finalTime?: string;
}

describe('useDateTimeHandlers', () => {
  const createMockSetFormData = () => jest.fn<void, [Partial<TestFormData>]>();

  describe('handleStartDateChange', () => {
    it('should call setFormData with startDate', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      act(() => {
        result.current.handleStartDateChange('2024-01-15');
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(1);
      expect(mockSetFormData).toHaveBeenCalledWith({ startDate: '2024-01-15' });
    });

    it('should be memoized when setFormData does not change', () => {
      const mockSetFormData = createMockSetFormData();
      const { result, rerender } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      const firstHandler = result.current.handleStartDateChange;
      rerender();
      const secondHandler = result.current.handleStartDateChange;

      expect(firstHandler).toBe(secondHandler);
    });
  });

  describe('handleStartTimeChange', () => {
    it('should call setFormData with startTime', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      act(() => {
        result.current.handleStartTimeChange('14:30');
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(1);
      expect(mockSetFormData).toHaveBeenCalledWith({ startTime: '14:30' });
    });

    it('should be memoized when setFormData does not change', () => {
      const mockSetFormData = createMockSetFormData();
      const { result, rerender } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      const firstHandler = result.current.handleStartTimeChange;
      rerender();
      const secondHandler = result.current.handleStartTimeChange;

      expect(firstHandler).toBe(secondHandler);
    });
  });

  describe('handleFinalDateChange', () => {
    it('should call setFormData with finalDate', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      act(() => {
        result.current.handleFinalDateChange('2024-01-20');
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(1);
      expect(mockSetFormData).toHaveBeenCalledWith({ finalDate: '2024-01-20' });
    });

    it('should be memoized when setFormData does not change', () => {
      const mockSetFormData = createMockSetFormData();
      const { result, rerender } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      const firstHandler = result.current.handleFinalDateChange;
      rerender();
      const secondHandler = result.current.handleFinalDateChange;

      expect(firstHandler).toBe(secondHandler);
    });
  });

  describe('handleFinalTimeChange', () => {
    it('should call setFormData with finalTime', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      act(() => {
        result.current.handleFinalTimeChange('18:00');
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(1);
      expect(mockSetFormData).toHaveBeenCalledWith({ finalTime: '18:00' });
    });

    it('should be memoized when setFormData does not change', () => {
      const mockSetFormData = createMockSetFormData();
      const { result, rerender } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      const firstHandler = result.current.handleFinalTimeChange;
      rerender();
      const secondHandler = result.current.handleFinalTimeChange;

      expect(firstHandler).toBe(secondHandler);
    });
  });

  describe('all handlers together', () => {
    it('should provide all four handlers', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      expect(result.current).toHaveProperty('handleStartDateChange');
      expect(result.current).toHaveProperty('handleStartTimeChange');
      expect(result.current).toHaveProperty('handleFinalDateChange');
      expect(result.current).toHaveProperty('handleFinalTimeChange');
      expect(typeof result.current.handleStartDateChange).toBe('function');
      expect(typeof result.current.handleStartTimeChange).toBe('function');
      expect(typeof result.current.handleFinalDateChange).toBe('function');
      expect(typeof result.current.handleFinalTimeChange).toBe('function');
    });

    it('should allow calling multiple handlers independently', () => {
      const mockSetFormData = createMockSetFormData();
      const { result } = renderHook(() =>
        useDateTimeHandlers<TestFormData>({ setFormData: mockSetFormData })
      );

      act(() => {
        result.current.handleStartDateChange('2024-01-15');
        result.current.handleStartTimeChange('09:00');
        result.current.handleFinalDateChange('2024-01-20');
        result.current.handleFinalTimeChange('18:00');
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(4);
      expect(mockSetFormData).toHaveBeenNthCalledWith(1, {
        startDate: '2024-01-15',
      });
      expect(mockSetFormData).toHaveBeenNthCalledWith(2, {
        startTime: '09:00',
      });
      expect(mockSetFormData).toHaveBeenNthCalledWith(3, {
        finalDate: '2024-01-20',
      });
      expect(mockSetFormData).toHaveBeenNthCalledWith(4, {
        finalTime: '18:00',
      });
    });

    it('should update handlers when setFormData reference changes', () => {
      const mockSetFormData1 = createMockSetFormData();
      const mockSetFormData2 = createMockSetFormData();

      const { result, rerender } = renderHook(
        ({ setFormData }) => useDateTimeHandlers<TestFormData>({ setFormData }),
        { initialProps: { setFormData: mockSetFormData1 } }
      );

      const firstHandler = result.current.handleStartDateChange;

      rerender({ setFormData: mockSetFormData2 });

      const secondHandler = result.current.handleStartDateChange;

      expect(firstHandler).not.toBe(secondHandler);

      act(() => {
        result.current.handleStartDateChange('2024-02-01');
      });

      expect(mockSetFormData1).not.toHaveBeenCalled();
      expect(mockSetFormData2).toHaveBeenCalledWith({
        startDate: '2024-02-01',
      });
    });
  });
});
