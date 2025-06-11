import React from 'react';
import '../src/styles.css';

/**
 * Global provider for Ladle stories
 * Uses local Tailwind CSS with custom configuration
 */
export const Provider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
