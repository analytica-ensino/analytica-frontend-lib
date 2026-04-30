import type { Story } from '@ladle/react';
import Button from '../Button/Button';
import { useSimulatedOverview } from './useSimulatedOverview';
import type { SimulatedOverviewApiResponse } from './types';
import { ScoreType } from '../../types/common';
import type { BaseApiClient } from '../../types/api';
import Text from '../Text/Text';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';

function createApi(config?: {
  delay?: number;
  shouldFail?: boolean;
}): BaseApiClient {
  const delay = config?.delay ?? 600;

  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (config?.shouldFail) {
        throw new Error('Erro ao carregar overview');
      }

      const response: SimulatedOverviewApiResponse = {
        message: 'ok',
        data: {
          classAverage: 68.4,
          totalStudents: 4,
          counters: {
            highlight: 1,
            aboveAverage: 1,
            belowAverage: 2,
            attentionPoint: 0,
          },
          topHighlights: [
            {
              studentId: 'student-1',
              institutionId: 'inst-1',
              userInstitutionId: 'user-inst-1',
              name: 'Maria',
              school: 'Escola A',
              schoolYear: '3 ano',
              class: 'A',
              average: 88.1,
              performance: SimulatedPerformanceTag.HIGHLIGHT,
            },
          ],
          topDifficulties: [
            {
              studentId: 'student-2',
              institutionId: 'inst-1',
              userInstitutionId: 'user-inst-2',
              name: 'Joao',
              school: 'Escola A',
              schoolYear: '3 ano',
              class: 'A',
              average: 42.9,
              performance: SimulatedPerformanceTag.BELOW_AVERAGE,
            },
          ],
          students: {
            data: [],
            page: 1,
            limit: 10,
            total: 0,
          },
        },
      };

      return { data: response as T };
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

function HookPlayground({ api }: { api: BaseApiClient }) {
  const { data, loading, isRefreshing, error, fetchOverview, reset } =
    useSimulatedOverview(api);

  return (
    <div className="flex flex-col gap-3 max-w-xl">
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() =>
            fetchOverview({
              simulationType: 'enem-1',
              period: '1_MONTH',
              scoreType: ScoreType.PERCENTAGE,
            })
          }
        >
          Fetch ENEM 1
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            fetchOverview(
              {
                simulationType: 'enem-2',
                period: '3_MONTHS',
                scoreType: ScoreType.TRI,
              },
              true
            )
          }
        >
          Refresh ENEM 2 TRI
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Reset
        </Button>
      </div>

      <Text size="sm" className="text-text-700">
        loading: {String(loading)} | refreshing: {String(isRefreshing)}
      </Text>

      {error && (
        <Text size="sm" className="text-error-500">
          {error}
        </Text>
      )}

      {data && (
        <Text
          size="xs"
          className="p-3 rounded-md bg-background-100 border border-border-200"
        >
          {JSON.stringify(data, null, 2)}
        </Text>
      )}
    </div>
  );
}

export const Default: Story = () => <HookPlayground api={createApi()} />;

export const ErrorState: Story = () => (
  <HookPlayground api={createApi({ shouldFail: true })} />
);
