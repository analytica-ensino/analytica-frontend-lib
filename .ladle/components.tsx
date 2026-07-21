import React from 'react';
import '../src/styles.css';

/**
 * Global provider for Ladle stories
 * Uses local Tailwind CSS with custom configuration
 */
export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* Fonte da variante Papolê (Quicksand) — só para o preview do Ladle.
          Os apps consumidores carregam a fonte por conta própria. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
      />
      {children}
    </>
  );
};
