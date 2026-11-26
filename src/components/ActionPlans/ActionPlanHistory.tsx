import Text from '../Text/Text';
import type { ActionPlanEvent } from '../../types/actionPlans';
import { describeActionPlanEvent, formatEventDate } from './actionPlans.utils';

export interface ActionPlanHistoryProps {
  /** The plan's history, oldest first (as the backend answers it) */
  events: ActionPlanEvent[];
}

/**
 * "Histórico de alterações" of a plan: one entry per change, newest first,
 * each with who did what, the reason given and when, on a dotted timeline.
 */
export const ActionPlanHistory = ({
  events,
}: Readonly<ActionPlanHistoryProps>) => {
  const newestFirst = [...events].reverse();

  return (
    <section
      aria-labelledby="action-plan-history-title"
      className="flex flex-col gap-3"
    >
      <Text
        as="h2"
        id="action-plan-history-title"
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Histórico de alterações
      </Text>
      {newestFirst.length === 0 ? (
        <Text size="sm" className="text-text-600">
          Nenhuma alteração registrada.
        </Text>
      ) : (
        <ol className="flex flex-col" data-testid="action-plan-history">
          {newestFirst.map((event, index) => (
            <li key={event.id} className="relative flex gap-2.5 pb-3">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-primary-500"
              />
              {index < newestFirst.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[3.5px] top-4 bottom-0 w-px bg-border-200"
                />
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <Text size="sm" className="text-text-950">
                  {describeActionPlanEvent(event)}
                </Text>
                {event.comment && (
                  <Text size="sm" className="text-text-800">
                    Comentário: {event.comment}
                  </Text>
                )}
                <Text as="time" size="xs" className="text-text-600">
                  {formatEventDate(event.createdAt)}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
