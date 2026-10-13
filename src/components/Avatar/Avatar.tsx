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
  /**
   * O que mostrar quando não há foto. `icon` (padrão) mantém o placeholder
   * genérico; `initials` mostra as iniciais de `name`.
   */
  fallback?: 'icon' | 'initials';
}

/**
 * Iniciais de exibição: primeira letra da primeira palavra mais a primeira
 * letra da última ("Ana Clara Mendes" → "AM"). Nome de uma palavra rende uma
 * letra só. Pontuação e dígitos são descartados antes, para que "ana-clara
 * #mendes" não vire "A#". Sem nenhuma letra, devolve string vazia e quem chama
 * cai no ícone genérico.
 */
const getInitials = (name?: string): string => {
  const words = (name ?? '')
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';

  return `${first}${last}`.toUpperCase();
};

/**
 * Conteúdo do avatar nos três estados possíveis. Extraído do JSX porque três
 * caminhos num ternário aninhado é issue de manutenibilidade no Sonar.
 */
const AvatarContent = ({
  showImage,
  src,
  label,
  size,
  initials,
  onError,
}: {
  showImage: boolean;
  src?: string | null;
  label: string;
  size: number;
  initials: string;
  onError: () => void;
}) => {
  if (showImage) {
    return (
      <img
        src={src as string}
        alt={label}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={onError}
      />
    );
  }

  if (initials) {
    return (
      <span
        aria-hidden="true"
        className="font-bold leading-none select-none"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {initials}
      </span>
    );
  }

  return <UserIcon size={size} />;
};

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
  fallback = 'icon',
  className = '',
  ...props
}: AvatarProps) => {
  // Tracks which URL failed, so swapping `src` retries automatically.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  // Derived from `showImage`, not from `src`: a broken URL shows the fallback,
  // so it must be announced as "no picture" too.
  const label = alt ?? profileImageLabel({ src: showImage ? src : null, name });
  const initials =
    !showImage && fallback === 'initials' ? getInitials(name) : '';

  return (
    <div
      data-component="Avatar"
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        'flex items-center justify-center',
        initials && 'bg-primary-700 text-white',
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
      <AvatarContent
        showImage={showImage}
        src={src}
        label={label}
        size={size}
        initials={initials}
        onError={() => setFailedSrc(src ?? null)}
      />
    </div>
  );
};

export default Avatar;
