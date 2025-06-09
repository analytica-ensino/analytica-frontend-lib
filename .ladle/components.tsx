import React from 'react';

/**
 * Global provider for Ladle stories
 * Loads TailwindCSS v4 via CDN using @tailwindcss/browser
 */
export const Provider = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    // Inject TailwindCSS v4 CDN script into the document head
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.8';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
};
