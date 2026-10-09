import { SVGProps } from 'react';

/**
 * Outlined four-point sparkle icon (Figma "icon/sparkle").
 * 24x24 grid, 2px stroke; color follows `currentColor`.
 */
const Sparkle = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 3C12.6 7.4 15.6 10.1 20 10.75C15.6 11.4 12.6 14.1 12 18.5C11.4 14.1 8.4 11.4 4 10.75C8.4 10.1 11.4 7.4 12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkle;
