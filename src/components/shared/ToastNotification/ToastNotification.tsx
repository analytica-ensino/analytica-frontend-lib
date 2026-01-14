import Toast from '../../Toast/Toast';

interface ToastNotificationProps {
  /**
   * Controls whether the toast is visible
   */
  isOpen: boolean;
  /**
   * Callback when the toast is closed
   */
  onClose: () => void;
  /**
   * The title/message to display
   */
  title: string;
  /**
   * Optional description for more details
   */
  description?: string;
  /**
   * The type of toast
   * @default 'success'
   */
  action?: 'success' | 'warning' | 'info';
  /**
   * The variant of the toast
   * @default 'solid'
   */
  variant?: 'solid' | 'outlined';
}

/**
 * Shared toast notification component that displays centered at the top of the screen
 * Provides consistent positioning and styling across the application
 *
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 *
 * <ToastNotification
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 *   title="Atividade adicionada à aula recomendada"
 * />
 * ```
 */
export const ToastNotification = ({
  isOpen,
  onClose,
  title,
  description,
  action = 'success',
  variant = 'solid',
}: ToastNotificationProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Toast
        title={title}
        description={description}
        variant={variant}
        action={action}
        onClose={onClose}
      />
    </div>
  );
};

export type { ToastNotificationProps };
