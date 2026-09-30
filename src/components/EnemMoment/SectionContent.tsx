import type { ReactNode } from 'react';
import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';

/**
 * A section of the report while it loads (a skeleton of its height), when it
 * failed (the message, in a card of the same height), or its content.
 */
export function SectionContent({
  loading,
  error,
  minHeight,
  children,
}: Readonly<{
  loading: boolean;
  error: string | null;
  /** The section's height class, kept while it loads or fails. */
  minHeight: string;
  children: ReactNode;
}>) {
  if (loading) return <SkeletonCard className={minHeight} />;

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${minHeight} bg-background border border-border-50 rounded-xl p-5`}
      >
        <Text size="sm" className="text-text-500">
          {error}
        </Text>
      </div>
    );
  }

  return <>{children}</>;
}
