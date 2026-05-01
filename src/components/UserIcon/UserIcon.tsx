import type { FC } from 'react';

export interface UserIconProps {
  /**
   * Width and height in pixels.
   * @default 24
   */
  size?: number;
  /**
   * Optional class names applied to the root SVG element.
   */
  className?: string;
}

/**
 * Decorative user avatar icon. Background and foreground colors follow the
 * active white-label theme via Tailwind `fill-primary-*` utilities, so the
 * icon adapts automatically to the institution palette (e.g. blue for ENEM
 * Paraná, red for ENEM Paraíba).
 */
export const UserIcon: FC<UserIconProps> = ({ size = 24, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <rect
        width="24"
        height="24"
        rx="12"
        style={{ fill: 'var(--color-primary-100)' }}
      />
      <path
        d="M19.017 17.727c-1.038-1.795-2.638-3.082-4.506-3.693a4.909 4.909 0 1 0-5.022 0c-1.868.61-3.468 1.897-4.506 3.693a.545.545 0 1 0 .944.546c1.285-2.22 3.555-3.546 6.073-3.546s4.788 1.326 6.073 3.546a.545.545 0 1 0 .944-.546M8.182 9.818a3.818 3.818 0 1 1 7.636 0 3.818 3.818 0 0 1-7.636 0"
        style={{ fill: 'var(--color-primary-800)' }}
      />
    </svg>
  );
};
