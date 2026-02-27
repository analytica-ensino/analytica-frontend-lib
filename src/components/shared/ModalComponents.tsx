import { type ReactNode } from 'react';
import { UserIcon, XCircleIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';

/**
 * Section heading used inside report modals.
 */
export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text
    as="h3"
    size="md"
    weight="bold"
    className="text-text-950 tracking-[0.2px]"
  >
    {children}
  </Text>
);

/**
 * User identity header used inside report modals.
 * Pass an optional `statusBadge` to display a badge on the right side of the name row
 * (e.g. a performance status Badge for students).
 */
export const UserHeader = ({
  name,
  school,
  className,
  year,
  statusBadge,
}: {
  name: string;
  school: string;
  className: string;
  year: string | number;
  statusBadge?: ReactNode;
}) => (
  <div className="flex flex-col gap-2 pb-4 border-b border-border-50">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Text
          as="span"
          className="size-8 rounded-full bg-background-100 flex items-center justify-center shrink-0"
        >
          <UserIcon size={18} className="text-text-500" weight="fill" />
        </Text>
        <Text size="md" weight="medium" className="text-text-950">
          {name}
        </Text>
      </div>
      {statusBadge}
    </div>
    <Text size="xs" className="text-text-600">
      {school} • {className} • {year}
    </Text>
  </div>
);

/**
 * Error state for report modals.
 */
export const ErrorContent = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <Text
      as="span"
      className="size-10 rounded-full bg-error-100 flex items-center justify-center"
    >
      <XCircleIcon size={20} className="text-error-700" weight="fill" />
    </Text>
    <Text size="sm" className="text-error-700 text-center">
      {message}
    </Text>
  </div>
);
