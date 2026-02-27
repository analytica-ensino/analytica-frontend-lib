import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockOnClose = jest.fn();
const mockOnDownloadPdf = jest.fn();
const mockOnDownloadExcel = jest.fn();

jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    onClose?: () => void;
    size?: string;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
}));

jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    action?: string;
    size?: string;
    iconLeft?: ReactNode;
    'data-testid'?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
    size?: string;
  }) => <span className={className}>{children}</span>,
}));

jest.mock('../Skeleton/Skeleton', () => ({
  Skeleton: ({
    variant,
    width,
    height,
  }: {
    variant?: string;
    width?: string | number;
    height?: string | number;
  }) => (
    <div
      data-testid="skeleton"
      data-variant={variant}
      style={{ width, height }}
    />
  ),
}));

jest.mock('@phosphor-icons/react', () => ({
  FilePdfIcon: () => <span data-testid="file-pdf-icon" />,
  FileXlsIcon: () => <span data-testid="file-xls-icon" />,
  DownloadSimpleIcon: () => <span data-testid="download-icon" />,
}));

import DownloadModal from './DownloadModal';

describe('DownloadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies that the modal does not render any content when isOpen is false.
   */
  it('should not render modal content when isOpen is false', () => {
    render(
      <DownloadModal
        isOpen={false}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  /**
   * Verifies that the modal renders with title, icon cards, and footer buttons.
   */
  it('should render modal with title, icon cards, and footer when isOpen is true', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(
      screen.getByText('Como deseja baixar o relatório?')
    ).toBeInTheDocument();
    expect(screen.getByTestId('download-pdf-option')).toBeInTheDocument();
    expect(screen.getByTestId('download-excel-option')).toBeInTheDocument();
    expect(screen.getByTestId('file-pdf-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-xls-icon')).toBeInTheDocument();
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    expect(screen.getByTestId('download-cancel-btn')).toBeInTheDocument();
    expect(screen.getByTestId('download-confirm-btn')).toBeInTheDocument();
  });

  /**
   * Verifies that the download button is disabled when no format is selected.
   */
  it('should disable download button when no format is selected', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.getByTestId('download-confirm-btn')).toBeDisabled();
  });

  /**
   * Verifies that selecting PDF and clicking download calls onDownloadPdf and onClose.
   */
  it('should call onDownloadPdf and onClose when PDF is selected and download clicked', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    fireEvent.click(screen.getByTestId('download-pdf-option'));
    fireEvent.click(screen.getByTestId('download-confirm-btn'));

    expect(mockOnDownloadPdf).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifies that selecting Excel and clicking download calls onDownloadExcel.
   */
  it('should call onDownloadExcel when Excel is selected and download clicked', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    fireEvent.click(screen.getByTestId('download-excel-option'));
    fireEvent.click(screen.getByTestId('download-confirm-btn'));

    expect(mockOnDownloadExcel).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  /**
   * Verifies that clicking cancel calls onClose.
   */
  it('should call onClose when cancel button is clicked', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    fireEvent.click(screen.getByTestId('download-cancel-btn'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifies that the error message is displayed when error prop is not null.
   */
  it('should show error message when error prop is not null', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error="Falha ao gerar relatório"
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.getByText('Falha ao gerar relatório')).toBeInTheDocument();
  });

  /**
   * Verifies that no error message is rendered when error prop is null.
   */
  it('should not show error message when error prop is null', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(
      screen.queryByText('Falha ao gerar relatório')
    ).not.toBeInTheDocument();
  });

  /**
   * Verifies that skeleton placeholders are shown when isDownloading is true.
   */
  it('should render skeletons when isDownloading is true', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={true}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.getByTestId('download-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
    expect(screen.queryByTestId('download-pdf-option')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('download-excel-option')
    ).not.toBeInTheDocument();
  });

  /**
   * Verifies that the download button is disabled when isDownloading is true.
   */
  it('should disable download button when isDownloading is true', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={true}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    expect(screen.getByTestId('download-confirm-btn')).toBeDisabled();
  });

  /**
   * Verifies that clicking download without selecting a format does nothing.
   */
  it('should not call any download callback when download clicked without selection', () => {
    render(
      <DownloadModal
        isOpen={true}
        onClose={mockOnClose}
        isDownloading={false}
        error={null}
        onDownloadPdf={mockOnDownloadPdf}
        onDownloadExcel={mockOnDownloadExcel}
      />
    );

    fireEvent.click(screen.getByTestId('download-confirm-btn'));

    expect(mockOnDownloadPdf).not.toHaveBeenCalled();
    expect(mockOnDownloadExcel).not.toHaveBeenCalled();
  });
});
