import { act, renderHook, waitFor } from '@testing-library/react';
import {
  useActionPlan,
  useActionPlanAssignees,
  useActionPlanFilterOptions,
} from './useActionPlans';
import { apiError, fakeApi, fullPlan } from '../../testing/actionPlanDoubles';

describe('action plan hooks', () => {
  it('keeps no filter options when they fail to load', async () => {
    const api = fakeApi({});
    api.get.mockRejectedValueOnce(apiError(500));

    const { result } = renderHook(() =>
      useActionPlanFilterOptions(api, 'created')
    );

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(result.current).toEqual({ schools: [], responsibles: [] });
  });

  it('shows the plan even when its history fails, and keeps it on a failed reload', async () => {
    const api = fakeApi({
      '/action-plans/plan-1': fullPlan(),
    });

    const { result } = renderHook(() => useActionPlan(api, 'plan-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.plan?.id).toBe('plan-1');
    expect(result.current.history).toEqual([]);

    await act(() => result.current.reloadHistory());
    expect(result.current.history).toEqual([]);
  });

  it('waits for the school, and lists no one when the request fails', async () => {
    const api = fakeApi({});
    api.get.mockRejectedValueOnce(apiError(400));

    const { result, rerender } = renderHook(
      ({ schoolId }: { schoolId?: string }) =>
        useActionPlanAssignees(api, schoolId),
      { initialProps: {} }
    );
    expect(api.get).not.toHaveBeenCalled();

    rerender({ schoolId: 'school-a' });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/action-plans/assignees', {
      params: { schoolId: 'school-a' },
    });
    expect(result.current.assignees).toEqual([]);
  });
});
