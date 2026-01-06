import type { ReactNode } from 'react';
import Badge from '../components/Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';

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
