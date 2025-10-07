import { useEffect, useState } from 'react';

export function useInstitutionId() {
  const [institutionId, setInstitutionId] = useState<string | null>(() => {
    return (
      document
        .querySelector('meta[name="institution-id"]')
        ?.getAttribute('content') ?? null
    );
  });

  useEffect(() => {
    const metaTag = document.querySelector('meta[name="institution-id"]');

    if (!metaTag) return;

    const observer = new MutationObserver(() => {
      const newValue = metaTag.getAttribute('content');
      setInstitutionId(newValue);
    });

    observer.observe(metaTag, {
      attributes: true,
      attributeFilter: ['content'],
    });

    return () => observer.disconnect();
  }, []);

  return institutionId;
}
