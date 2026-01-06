import type { ReactNode } from 'react';
import Badge from '../components/Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';
import { cn } from './utils';

/**
 * Get status badge component
 */
export const getStatusBadge = (status?: 'correct' | 'incorrect'): ReactNode => {
  switch (status) {
    case 'correct':
      return (
        <Badge variant="solid" action="success" iconLeft={<CheckCircle />}>
          Resposta correta
        </Badge>
      );
    case 'incorrect':
      return (
        <Badge variant="solid" action="error" iconLeft={<XCircle />}>
          Resposta incorreta
        </Badge>
      );
    default:
      return null;
  }
};

/**
 * Container component for question content
 */
export const QuestionContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-background rounded-t-xl px-4 pt-4 pb-[80px] h-auto flex flex-col gap-4 mb-auto',
        className
      )}
    >
      {children}
    </div>
  );
};
