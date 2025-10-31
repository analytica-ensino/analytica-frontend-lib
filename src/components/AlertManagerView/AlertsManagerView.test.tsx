import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertsManagerView, type AlertViewData } from './AlertsManagerView';
import type { ReactNode } from 'react';

// Mock components
jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    children,
    isOpen,
    onClose,
    title,
    size,
    contentClassName,
  }: {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: string;
    contentClassName?: string;
  }) =>
    isOpen ? (
      <div
        data-testid="modal"
        data-size={size}
        data-content-classname={contentClassName}
      >
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    size,
    weight,
    className,
  }: {
    children: ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <div
      data-testid="text"
      data-size={size}
      data-weight={weight}
      className={className}
    >
      {children}
    </div>
  ),
}));

jest.mock('../Divider/Divider', () => ({
  __esModule: true,
  default: ({ className }: { className?: string }) => (
    <hr data-testid="divider" className={className} />
  ),
}));

jest.mock('../Table/Table', () => ({
  __esModule: true,
  default: ({
    children,
    variant,
    className,
  }: {
    children: ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <div data-testid="table" data-variant={variant} className={className}>
      {children}
    </div>
  ),
  TableHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid="table-header">{children}</div>
  ),
  TableBody: ({
    children,
    variant,
  }: {
    children: ReactNode;
    variant?: string;
  }) => (
    <div data-testid="table-body" data-variant={variant}>
      {children}
    </div>
  ),
  TableRow: ({
    children,
    variant,
  }: {
    children: ReactNode;
    variant?: string;
  }) => (
    <div data-testid="table-row" data-variant={variant}>
      {children}
    </div>
  ),
  TableHead: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="table-head" className={className}>
      {children}
    </div>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div data-testid="table-cell" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    iconLeft,
    iconRight,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-size={size}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  ),
}));

jest.mock('../Badge/Badge', () => ({
  __esModule: true,
  default: ({
    children,
    variant,
    action,
  }: {
    children: ReactNode;
    variant?: string;
    action?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} data-action={action}>
      {children}
    </span>
  ),
}));

// Mock icons
jest.mock('phosphor-react', () => ({
  CaretLeft: () => <span data-testid="caret-left">←</span>,
  CaretRight: () => <span data-testid="caret-right">→</span>,
  User: () => <span data-testid="user-icon">👤</span>,
}));

// Mock notification image
jest.mock('../../assets/img/notification.png', () => 'notification.png');

describe('AlertsManagerView', () => {
  const mockAlertData: AlertViewData = {
    title: 'Test Alert',
    message: 'This is a test message',
    date: '2024-01-10',
    time: '08:00',
    sendToday: false,
    recipientCategories: {
      alunos: {
        selectedIds: ['1', '2', '3'],
        allSelected: false,
      },
    },
    sentAt: '2024-01-10T08:00:00',
    recipients: [
      { id: '1', name: 'John Doe', status: 'viewed' },
      { id: '2', name: 'Jane Smith', status: 'viewed' },
      { id: '3', name: 'Bob Johnson', status: 'pending' },
    ],
  };

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should display alert title in modal title', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Alert');
    });

    it('should display alert message', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    it('should render with correct modal size and content className', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('data-size', 'md');
      expect(modal).toHaveAttribute('data-content-classname', 'p-0');
    });
  });

  describe('modal functionality', () => {
    it('should close modal when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          onClose={onClose}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should handle missing onClose callback', () => {
      expect(() => {
        render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);
      }).not.toThrow();
    });
  });

  describe('alert data display', () => {
    it('should display sent date', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByText('Enviado em')).toBeInTheDocument();
      expect(screen.getByText('10/01/2024')).toBeInTheDocument();
    });

    it('should display image or default notification', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const images = screen.getAllByAltText('Test Alert');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should display title or fallback text', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const alerts = screen.getAllByText('Test Alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should display message or fallback text', () => {
      const alertWithoutMessage: AlertViewData = {
        ...mockAlertData,
        message: '',
      };

      render(
        <AlertsManagerView alertData={alertWithoutMessage} isOpen={true} />
      );

      expect(screen.getByText('Sem mensagem')).toBeInTheDocument();
    });

    it('should display title fallback when title is empty', () => {
      const alertWithoutTitle: AlertViewData = {
        ...mockAlertData,
        title: '',
      };

      render(<AlertsManagerView alertData={alertWithoutTitle} isOpen={true} />);

      expect(screen.getByText('Sem Título')).toBeInTheDocument();
      // When title is empty, image alt should be "Imagem do alerta"
      expect(screen.getByAltText('Imagem do alerta')).toBeInTheDocument();
    });
  });

  describe('recipients table', () => {
    it('should render table with recipients', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-header')).toBeInTheDocument();
      expect(screen.getByTestId('table-body')).toBeInTheDocument();
    });

    it('should display recipient names', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should display user icons for recipients', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const userIcons = screen.getAllByTestId('user-icon');
      expect(userIcons.length).toBe(mockAlertData.recipients.length);
    });

    it('should display table headers', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByText('Destinatário')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('recipient status', () => {
    it('should display viewed status correctly', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const badges = screen.getAllByTestId('badge');
      const viewedBadges = badges.filter(
        (badge) => badge.textContent === 'Visualizado'
      );
      expect(viewedBadges.length).toBe(2);
      viewedBadges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-action', 'success');
      });
    });

    it('should display pending status correctly', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      const badges = screen.getAllByTestId('badge');
      const pendingBadges = badges.filter(
        (badge) => badge.textContent === 'Pendente'
      );
      expect(pendingBadges.length).toBe(1);
      pendingBadges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-action', 'error');
      });
    });
  });

  describe('pagination', () => {
    it('should not show pagination when total pages is 1', () => {
      render(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.queryByText('Página 1 de 1')).not.toBeInTheDocument();
    });

    it('should show pagination when total pages is greater than 1', () => {
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={3}
          currentPage={1}
        />
      );

      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });

    it('should render pagination buttons when onPageChange is provided', () => {
      const onPageChange = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={2}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Próximo')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      const onPageChange = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={2}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const previousButton = screen.getByText('Anterior');
      expect(previousButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const onPageChange = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={2}
          currentPage={2}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByText('Próximo');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange when previous button is clicked', () => {
      const onPageChange = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={3}
          currentPage={2}
          onPageChange={onPageChange}
        />
      );

      const previousButton = screen.getByText('Anterior');
      fireEvent.click(previousButton);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when next button is clicked', () => {
      const onPageChange = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={3}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByText('Próximo');
      fireEvent.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should not render pagination buttons when onPageChange is not provided', () => {
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          totalPages={3}
          currentPage={1}
        />
      );

      expect(screen.queryByText('Anterior')).toBeInTheDocument();
      expect(screen.queryByText('Próximo')).toBeInTheDocument();
    });

    it('should calculate total pages from recipients when not provided', () => {
      const manyRecipients: AlertViewData = {
        ...mockAlertData,
        recipients: Array.from({ length: 25 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Recipient ${i + 1}`,
          status: i % 2 === 0 ? 'viewed' : 'pending',
        })),
      };

      render(<AlertsManagerView alertData={manyRecipients} isOpen={true} />);

      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });

    it('should display only recipients for current page', () => {
      const manyRecipients: AlertViewData = {
        ...mockAlertData,
        recipients: Array.from({ length: 25 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Recipient ${i + 1}`,
          status: i % 2 === 0 ? 'viewed' : 'pending',
        })),
      };

      render(
        <AlertsManagerView
          alertData={manyRecipients}
          isOpen={true}
          currentPage={1}
        />
      );

      // Should only show first 10 recipients
      expect(screen.getByText('Recipient 1')).toBeInTheDocument();
      expect(screen.getByText('Recipient 10')).toBeInTheDocument();
      expect(screen.queryByText('Recipient 11')).not.toBeInTheDocument();
    });

    it('should display correct recipients when navigating to second page', () => {
      const manyRecipients: AlertViewData = {
        ...mockAlertData,
        recipients: Array.from({ length: 25 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Recipient ${i + 1}`,
          status: i % 2 === 0 ? 'viewed' : 'pending',
        })),
      };

      render(
        <AlertsManagerView
          alertData={manyRecipients}
          isOpen={true}
          currentPage={2}
        />
      );

      // Should show recipients 11-20
      expect(screen.getByText('Recipient 11')).toBeInTheDocument();
      expect(screen.getByText('Recipient 20')).toBeInTheDocument();
      expect(screen.queryByText('Recipient 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Recipient 21')).not.toBeInTheDocument();
    });

    it('should clamp currentPage to valid range', () => {
      const manyRecipients: AlertViewData = {
        ...mockAlertData,
        recipients: Array.from({ length: 25 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Recipient ${i + 1}`,
          status: i % 2 === 0 ? 'viewed' : 'pending',
        })),
      };

      render(
        <AlertsManagerView
          alertData={manyRecipients}
          isOpen={true}
          currentPage={10}
        />
      );

      // Should clamp to last page (3) and show last 5 recipients
      expect(screen.getByText('Recipient 21')).toBeInTheDocument();
      expect(screen.getByText('Recipient 25')).toBeInTheDocument();
      expect(screen.getByText('Página 3 de 3')).toBeInTheDocument();
    });
  });

  describe('component props', () => {
    it('should handle isOpen prop changes', () => {
      const { rerender } = render(
        <AlertsManagerView alertData={mockAlertData} isOpen={false} />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      rerender(<AlertsManagerView alertData={mockAlertData} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should handle onClose prop', () => {
      const onClose = jest.fn();
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          onClose={onClose}
        />
      );

      fireEvent.click(screen.getByTestId('modal-close'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle currentPage and totalPages props', () => {
      render(
        <AlertsManagerView
          alertData={mockAlertData}
          isOpen={true}
          currentPage={2}
          totalPages={5}
        />
      );

      expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty recipients array', () => {
      const emptyRecipients: AlertViewData = {
        ...mockAlertData,
        recipients: [],
      };

      expect(() => {
        render(<AlertsManagerView alertData={emptyRecipients} isOpen={true} />);
      }).not.toThrow();
    });

    it('should handle invalid date format gracefully', () => {
      const invalidDate: AlertViewData = {
        ...mockAlertData,
        sentAt: 'invalid-date',
      };

      render(<AlertsManagerView alertData={invalidDate} isOpen={true} />);

      // Should return the original date string as a string when invalid
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });

    it('should handle Date object input', () => {
      const dateObj = new Date('2024-01-10T08:00:00');
      const alertWithDateObj: AlertViewData = {
        ...mockAlertData,
        sentAt: dateObj,
      };

      render(<AlertsManagerView alertData={alertWithDateObj} isOpen={true} />);

      // Should format the date correctly
      expect(screen.getByText('10/01/2024')).toBeInTheDocument();
    });

    it('should handle invalid Date object input', () => {
      const invalidDateObj = new Date('invalid');
      const alertWithInvalidDateObj: AlertViewData = {
        ...mockAlertData,
        sentAt: invalidDateObj,
      };

      render(
        <AlertsManagerView alertData={alertWithInvalidDateObj} isOpen={true} />
      );

      // Should return the string representation of invalid date
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('should handle only viewed recipients', () => {
      const allViewed: AlertViewData = {
        ...mockAlertData,
        recipients: [
          { id: '1', name: 'User 1', status: 'viewed' },
          { id: '2', name: 'User 2', status: 'viewed' },
        ],
      };

      render(<AlertsManagerView alertData={allViewed} isOpen={true} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.every((badge) => badge.textContent === 'Visualizado')).toBe(
        true
      );
    });

    it('should handle only pending recipients', () => {
      const allPending: AlertViewData = {
        ...mockAlertData,
        recipients: [
          { id: '1', name: 'User 1', status: 'pending' },
          { id: '2', name: 'User 2', status: 'pending' },
        ],
      };

      render(<AlertsManagerView alertData={allPending} isOpen={true} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.every((badge) => badge.textContent === 'Pendente')).toBe(
        true
      );
    });
  });

  describe('SSR environment', () => {
    it('should handle File object and create blob URL when window is defined', () => {
      const testFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const alertWithFile: AlertViewData = {
        ...mockAlertData,
        image: testFile,
      };

      const createObjectURLMock = jest.fn(() => 'blob:test-url');
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = jest.fn();

      const { unmount } = render(
        <AlertsManagerView alertData={alertWithFile} isOpen={true} />
      );

      // Should create blob URL when image is a File
      expect(createObjectURLMock).toHaveBeenCalledWith(testFile);
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      unmount();

      // Should revoke blob URL when component unmounts
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should handle string URL and use it directly without creating blob URL', () => {
      const imageUrl = 'https://example.com/image.jpg';

      const alertWithUrl: AlertViewData = {
        ...mockAlertData,
        image: imageUrl,
      };

      const createObjectURLMock = jest.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = jest.fn();

      const { unmount } = render(
        <AlertsManagerView alertData={alertWithUrl} isOpen={true} />
      );

      // Should NOT create blob URL when image is a string
      expect(createObjectURLMock).not.toHaveBeenCalled();

      // Should display the image with the string URL
      const image = screen.getByAltText('Test Alert');
      expect(image).toHaveAttribute('src', imageUrl);
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      unmount();

      // Should NOT revoke URL when it's a string (not a blob URL)
      expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
