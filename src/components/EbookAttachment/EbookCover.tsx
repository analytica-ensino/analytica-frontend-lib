import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import { cn } from '../../utils/utils';

/**
 * A book's cover, or a book icon when it has none. Fills its container.
 */
export const EbookCover = ({
  coverUrl,
  iconSize = 32,
  className,
}: Readonly<{
  coverUrl: string | null;
  iconSize?: number;
  className?: string;
}>) =>
  coverUrl ? (
    <img
      src={coverUrl}
      alt=""
      loading="lazy"
      className={cn('h-full w-full object-cover', className)}
    />
  ) : (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-background-100 text-text-400',
        className
      )}
    >
      <BookOpenIcon size={iconSize} aria-hidden="true" />
    </div>
  );
