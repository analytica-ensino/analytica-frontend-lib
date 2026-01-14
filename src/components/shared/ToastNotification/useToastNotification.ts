import { useState, useCallback } from 'react';

interface ToastState {
  isOpen: boolean;
  title: string;
  description?: string;
  action: 'success' | 'warning' | 'info';
}

interface UseToastNotificationReturn {
  /**
   * Current toast state
   */
  toastState: ToastState;
  /**
   * Show a success toast
   * @param title - The title/message to display
   * @param description - Optional description
   * @param duration - Auto-dismiss duration in milliseconds (default: 3000)
   */
  showSuccess: (title: string, description?: string, duration?: number) => void;
  /**
   * Show a warning/error toast
   * @param title - The title/message to display
   * @param description - Optional description
   * @param duration - Auto-dismiss duration in milliseconds (default: 3000)
   */
  showError: (title: string, description?: string, duration?: number) => void;
  /**
   * Show an info toast
   * @param title - The title/message to display
   * @param description - Optional description
   * @param duration - Auto-dismiss duration in milliseconds (default: 3000)
   */
  showInfo: (title: string, description?: string, duration?: number) => void;
  /**
   * Manually close the toast
   */
  hideToast: () => void;
}

/**
 * Custom hook for managing toast notifications
 * Provides methods to show success, error, and info toasts with auto-dismiss
 *
 * @example
 * ```tsx
 * const { toastState, showSuccess, showError, hideToast } = useToastNotification();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await submitData();
 *     showSuccess('Dados salvos com sucesso!');
 *   } catch (error) {
 *     showError('Erro ao salvar dados');
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSubmit}>Salvar</button>
 *     <ToastNotification
 *       isOpen={toastState.isOpen}
 *       onClose={hideToast}
 *       title={toastState.title}
 *       description={toastState.description}
 *       action={toastState.action}
 *     />
 *   </>
 * );
 * ```
 */
export const useToastNotification = (): UseToastNotificationReturn => {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    title: '',
    description: undefined,
    action: 'success',
  });

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback(
    (
      title: string,
      action: 'success' | 'warning' | 'info',
      description?: string,
      duration: number = 3000
    ) => {
      setToastState({
        isOpen: true,
        title,
        description,
        action,
      });

      if (duration > 0) {
        setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [hideToast]
  );

  const showSuccess = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast(title, 'success', description, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast(title, 'warning', description, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast(title, 'info', description, duration);
    },
    [showToast]
  );

  return {
    toastState,
    showSuccess,
    showError,
    showInfo,
    hideToast,
  };
};
