import { act, renderHook, waitFor } from '@testing-library/react';
import { useEditModalForm } from './useEditModalForm';

type Form = {
  title?: string;
  startDate?: string;
  startTime?: string;
  finalDate?: string;
  finalTime?: string;
};

describe('useEditModalForm', () => {
  it('starts with empty form, no errors, not loading/saving', () => {
    const { result } = renderHook(() =>
      useEditModalForm<Form>({
        isOpen: false,
        load: jest.fn().mockResolvedValue({}),
        onLoadError: jest.fn(),
      })
    );

    expect(result.current.formData).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.saving).toBe(false);
  });

  it('does not load when closed', () => {
    const load = jest.fn().mockResolvedValue({});
    renderHook(() =>
      useEditModalForm<Form>({ isOpen: false, load, onLoadError: jest.fn() })
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('does not load when not enabled', () => {
    const load = jest.fn().mockResolvedValue({});
    renderHook(() =>
      useEditModalForm<Form>({
        isOpen: true,
        enabled: false,
        load,
        onLoadError: jest.fn(),
      })
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('loads and populates the form when opened', async () => {
    const load = jest.fn().mockResolvedValue({ title: 'Hello' });
    const { result } = renderHook(() =>
      useEditModalForm<Form>({ isOpen: true, load, onLoadError: jest.fn() })
    );

    await waitFor(() => {
      expect(result.current.formData).toEqual({ title: 'Hello' });
    });
    expect(result.current.loading).toBe(false);
  });

  it('calls onLoadError when the load fails', async () => {
    const load = jest.fn().mockRejectedValue(new Error('boom'));
    const onLoadError = jest.fn();
    renderHook(() =>
      useEditModalForm<Form>({ isOpen: true, load, onLoadError })
    );

    await waitFor(() => {
      expect(onLoadError).toHaveBeenCalled();
    });
  });

  it('updateFormData merges values and clears errors', async () => {
    const { result } = renderHook(() =>
      useEditModalForm<Form>({
        isOpen: false,
        load: jest.fn().mockResolvedValue({}),
        onLoadError: jest.fn(),
      })
    );

    act(() => {
      result.current.setErrors({ title: 'required' });
    });
    expect(result.current.errors).toEqual({ title: 'required' });

    act(() => {
      result.current.updateFormData({ title: 'A' });
    });
    expect(result.current.formData).toEqual({ title: 'A' });
    expect(result.current.errors).toEqual({});

    act(() => {
      result.current.updateFormData({ startDate: '2026-01-01' });
    });
    expect(result.current.formData).toEqual({
      title: 'A',
      startDate: '2026-01-01',
    });
  });

  it('exposes date handlers that update the form', () => {
    const { result } = renderHook(() =>
      useEditModalForm<Form>({
        isOpen: false,
        load: jest.fn().mockResolvedValue({}),
        onLoadError: jest.fn(),
      })
    );

    act(() => {
      result.current.dateHandlers.handleStartDateChange('2026-02-02');
    });
    expect(result.current.formData.startDate).toBe('2026-02-02');
  });

  it('setSaving toggles the saving flag', () => {
    const { result } = renderHook(() =>
      useEditModalForm<Form>({
        isOpen: false,
        load: jest.fn().mockResolvedValue({}),
        onLoadError: jest.fn(),
      })
    );

    act(() => {
      result.current.setSaving(true);
    });
    expect(result.current.saving).toBe(true);
  });

  it('ignores a resolved load after unmount (cancellation)', async () => {
    let resolveLoad: (value: Form) => void = () => {};
    const load = jest.fn(
      () =>
        new Promise<Form>((resolve) => {
          resolveLoad = resolve;
        })
    );
    const onLoadError = jest.fn();
    const { result, unmount } = renderHook(() =>
      useEditModalForm<Form>({ isOpen: true, load, onLoadError })
    );

    unmount();
    await act(async () => {
      resolveLoad({ title: 'late' });
      await Promise.resolve();
    });

    // No throw / no error path; the late resolution is ignored
    expect(onLoadError).not.toHaveBeenCalled();
    expect(result.current.formData).toEqual({});
  });
});
