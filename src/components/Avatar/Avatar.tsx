import { HTMLAttributes, useState } from 'react';
import { cn } from '../../utils/utils';
import { profileImageLabel } from '../../utils/profileImageA11y';
import { UserIcon } from '../UserIcon/UserIcon';

export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Picture URL. When absent — or if it fails to load — the fallback shows. */
  src?: string | null;
  /**
   * Alternative text for the picture. Defaults to the standard profile-image
   * label, which also names the state when there is no picture.
   */
  alt?: string;
  /** Name of the person, used as the default `alt`. */
  name?: string;
  /** Rendered size in pixels. Default `40`. */
  size?: number;
}

/**
 * Circular profile picture with a graceful fallback to the generic user
 * placeholder — used wherever a student/teacher is listed and the photo may be
 * missing or broken.
 *
 * @example
 * ```tsx
 * <Avatar src={student.photoUrl} name={student.name} size={48} />
 * ```
 */
export const Avatar = ({
  src,
  alt,
  name,
  size = 40,
  className = '',
  ...props
}: AvatarProps) => {
  // Tracks which URL failed, so swapping `src` retries automatically.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  // Derived from `showImage`, not from `src`: a broken URL shows the fallback,
  // so it must be announced as "no picture" too.
  const label = alt ?? profileImageLabel({ src: showImage ? src : null, name });

  return (
    <div
      data-component="Avatar"
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        'flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
      // The fallback is an `aria-hidden` <svg>, which leaves the element with
      // no role and no name — invisible to a screen reader, including to
      // VoiceOver's mouse cursor. The wrapper carries the name in that state;
      // when there is a picture, the <img> `alt` does it. An explicit `alt=""`
      // marks the avatar decorative, so it gets no role either.
      {...(showImage || !label ? {} : { role: 'img', 'aria-label': label })}
      {...props}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={label}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <UserIcon size={size} />
      )}
    </div>
  );
};

export default Avatar;
