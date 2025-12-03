import { KeyIcon, BugIcon, InfoIcon } from '@phosphor-icons/react';
import React from 'react';
import { SupportCategory } from '../../../types/support';

export const getCategoryIcon = (
  category: SupportCategory | null,
  size = 16
): React.ReactNode => {
  if (!category) return null;
  switch (category) {
    case SupportCategory.ACESSO:
      return <KeyIcon size={size} />;
    case SupportCategory.TECNICO:
      return <BugIcon size={size} />;
    case SupportCategory.OUTROS:
      return <InfoIcon size={size} />;
    default:
      return <InfoIcon size={size} />;
  }
};
