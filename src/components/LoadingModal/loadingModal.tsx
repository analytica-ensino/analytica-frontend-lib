import { forwardRef, HTMLAttributes } from 'react';

interface LoadingModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  title?: string;
  subtitle?: string;
}

const LoadingModal = forwardRef<HTMLDivElement, LoadingModalProps>(
  ({ open, title = 'Titulo...', subtitle = 'Subtitulo...', ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-modal-title"
        aria-describedby="loading-modal-subtitle"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xs"
        {...props}
      >
        <div className="w-full max-w-[364px] flex flex-col items-center justify-center gap-14">
          <span className="animate-spin" aria-hidden="true">
            <svg
              width="102"
              height="102"
              viewBox="0 0 102 102"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable={false}
            >
              <path
                d="M101.5 51C101.5 78.8904 78.8904 101.5 51 101.5C23.1096 101.5 0.5 78.8904 0.5 51C0.5 23.1096 23.1096 0.5 51 0.5C78.8904 0.5 101.5 23.1096 101.5 51ZM8.62286 51C8.62286 74.4043 27.5957 93.3771 51 93.3771C74.4043 93.3771 93.3771 74.4043 93.3771 51C93.3771 27.5957 74.4043 8.62286 51 8.62286C27.5957 8.62286 8.62286 27.5957 8.62286 51Z"
                fill="#BBDCF7"
              />
              <path
                d="M97.4386 51C99.6816 51 101.517 52.8213 101.337 55.0571C100.754 62.2833 98.6212 69.3162 95.0643 75.6696C90.8444 83.207 84.7616 89.536 77.3975 94.0514C70.0333 98.5668 61.6339 101.118 53.0024 101.46C44.371 101.803 35.7959 99.9255 28.0971 96.0078C20.3982 92.0902 13.833 86.2631 9.02917 79.0838C4.22529 71.9045 1.34332 63.6129 0.658804 55.0017C-0.0257159 46.3906 1.51009 37.7479 5.1194 29.8997C8.16173 23.2845 12.5915 17.4202 18.0904 12.6959C19.7917 11.2341 22.3444 11.6457 23.6647 13.459C24.9851 15.2723 24.5702 17.7988 22.8916 19.2866C18.5048 23.1747 14.9608 27.9413 12.4992 33.2937C9.47048 39.8794 8.1817 47.132 8.75612 54.3581C9.33053 61.5841 11.7489 68.542 15.7801 74.5666C19.8113 80.5911 25.3205 85.4809 31.781 88.7684C38.2414 92.0559 45.4372 93.6312 52.6804 93.3438C59.9235 93.0564 66.9718 90.9158 73.1515 87.1267C79.3311 83.3375 84.4355 78.0266 87.9766 71.7015C90.8546 66.561 92.6217 60.8903 93.1827 55.0553C93.3973 52.8225 95.1955 51 97.4386 51Z"
                fill="#2883D7"
              />
            </svg>
          </span>

          <span className="flex flex-col gap-4 text-center">
            <p id="loading-modal-title" className="text-text-950 text-lg">
              {title}
            </p>

            <p id="loading-modal-subtitle" className="text-text-600 text-lg">
              {subtitle}
            </p>
          </span>
        </div>
      </div>
    );
  }
);

export default LoadingModal;
