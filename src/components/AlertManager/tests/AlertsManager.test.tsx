import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertsManager } from '../AlertsManager';
import { useAlertFormStore } from '../useAlertForm';
import type { AlertsConfig, CategoryConfig, LabelsConfig } from '../types';
import type { ReactNode } from 'react';
import { StepData } from '@/components/Stepper/Stepper';

// Mock components
jest.mock('../../..', () => ({
  Button: ({
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
  Modal: ({
    children,
    isOpen,
    onClose,
    title,
    footer,
  }: {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    footer: ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    ) : null,
  Stepper: ({
    steps,
    size,
    showProgress,
    responsive,
    progressText,
  }: {
    steps: StepData[];
    size?: string;
    showProgress?: boolean;
    responsive?: boolean;
    progressText?: string;
  }) => (
    <div
      data-testid="stepper"
      data-size={size}
      data-show-progress={showProgress}
      data-responsive={responsive}
    >
      {progressText && <div data-testid="progress-text">{progressText}</div>}
      {steps?.map((step: StepData, index: number) => (
        <div key={index} data-testid={`step-${index}`} data-state={step.state}>
          {step.label}
        </div>
      ))}
    </div>
  ),
}));

// Mock icons
jest.mock('phosphor-react', () => ({
  CaretLeft: () => <span data-testid="caret-left">←</span>,
  CaretRight: () => <span data-testid="caret-right">→</span>,
  PaperPlaneTilt: () => <span data-testid="paper-plane">✈</span>,
}));

// Mock AlertSteps
jest.mock('../AlertSteps', () => ({
  MessageStep: ({
    labels,
    allowImageAttachment,
  }: {
    labels: LabelsConfig;
    allowImageAttachment?: boolean;
  }) => (
    <div data-testid="message-step" data-allow-image={allowImageAttachment}>
      Message Step - {labels?.messageLabel || 'Message'}
    </div>
  ),
  RecipientsStep: ({
    categories,
    labels,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    labels: LabelsConfig;
    onCategoriesChange?: (cats: CategoryConfig[]) => void;
  }) => {
    // Simula seleção automática para permitir navegação
    React.useEffect(() => {
      if (onCategoriesChange && categories.length > 0) {
        const updatedCategories = categories.map((cat) => ({
          ...cat,
          selectedIds: cat.selectedIds || ['1'], // Simula seleção automática
        }));
        onCategoriesChange(updatedCategories);
      }
    }, [categories, onCategoriesChange]);

    return (
      <div data-testid="recipients-step">
        Recipients Step - {labels?.recipientsDescription || 'Recipients'}
        <span data-testid="categories-count">{categories?.length || 0}</span>
      </div>
    );
  },
  DateStep: ({
    labels,
    allowScheduling,
    allowEmailCopy,
  }: {
    labels: LabelsConfig;
    allowScheduling?: boolean;
    allowEmailCopy?: boolean;
  }) => (
    <div
      data-testid="date-step"
      data-allow-scheduling={allowScheduling}
      data-allow-email-copy={allowEmailCopy}
    >
      Date Step - {labels?.dateLabel || 'Date'}
    </div>
  ),
  PreviewStep: () => <div data-testid="preview-step">Preview Step</div>,
}));

describe('AlertsManager', () => {
  const mockCategories = [
    {
      key: 'users',
      label: 'Users',
      itens: [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ],
    },
  ];

  const mockHierarchicalCategories: CategoryConfig[] = [
    {
      key: 'escola',
      label: 'Escola',
      itens: [{ id: 'school-1', name: 'Escola 1', escolaId: 'school-1' }],
      selectedIds: [],
    },
    {
      key: 'serie',
      label: 'Série',
      dependsOn: ['escola'],
      itens: [
        {
          id: 'serie-1',
          name: 'Série 1',
          escolaId: 'school-1',
          serieId: 'serie-1',
        },
      ],
      filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
      selectedIds: [],
    },
    {
      key: 'turma',
      label: 'Turma',
      dependsOn: ['escola', 'serie'],
      itens: [
        {
          id: 'turma-1',
          name: 'Turma 1',
          escolaId: 'school-1',
          serieId: 'serie-1',
          turmaId: 'turma-1',
        },
      ],
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
      ],
      selectedIds: [],
    },
    {
      key: 'students',
      label: 'Alunos',
      dependsOn: ['escola', 'serie', 'turma'],
      itens: [],
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
        { key: 'turma', internalField: 'turmaId' },
      ],
      selectedIds: [],
    },
  ];

  const defaultConfig: AlertsConfig = {
    categories: mockCategories,
    labels: {
      pageTitle: 'Alerts',
      sendButton: 'Send Alert',
      modalTitle: 'Send Alert',
      cancelButton: 'Cancel',
      previousButton: 'Previous',
      nextButton: 'Next',
      finishButton: 'Send Alert',
    },
    behavior: {
      showAlertsTable: true,
      allowImageAttachment: true,
      allowScheduling: true,
      allowEmailCopy: true,
    },
  };

  beforeEach(() => {
    useAlertFormStore.getState().resetForm();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Send Alert');
    });

    it('should not render modal when isOpen is false', () => {
      render(<AlertsManager config={defaultConfig} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render with custom labels', () => {
      const customConfig: AlertsConfig = {
        ...defaultConfig,
        labels: {
          pageTitle: 'Custom Alerts',
          sendButton: 'Custom Send',
          modalTitle: 'Custom Modal',
        },
      };

      render(<AlertsManager config={customConfig} isOpen={true} />);

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Custom Modal'
      );
    });

    it('should render stepper with correct steps', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('stepper')).toBeInTheDocument();
      expect(screen.getByTestId('step-0')).toHaveTextContent('Mensagem');
      expect(screen.getByTestId('step-1')).toHaveTextContent('Destinatários');
      expect(screen.getByTestId('step-2')).toHaveTextContent('Data de envio');
      expect(screen.getByTestId('step-3')).toHaveTextContent('Prévia');
    });

    it('should render progress text in stepper', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('progress-text')).toHaveTextContent(
        'Etapa 1 de 4'
      );
    });
  });

  describe('modal functionality', () => {
    it('should close modal when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <AlertsManager config={defaultConfig} isOpen={true} onClose={onClose} />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('step rendering', () => {
    it('should render MessageStep initially', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('message-step')).toBeInTheDocument();
      expect(screen.getByText('Message Step - Message')).toBeInTheDocument();
    });

    it('should render MessageStep with image attachment option', () => {
      const configWithImage: AlertsConfig = {
        ...defaultConfig,
        behavior: {
          ...defaultConfig.behavior,
          allowImageAttachment: true,
        },
      };

      render(<AlertsManager config={configWithImage} isOpen={true} />);

      expect(screen.getByTestId('message-step')).toBeInTheDocument();
    });
  });

  describe('navigation buttons', () => {
    beforeEach(() => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);
    });

    it('should show cancel button', () => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show next button', () => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should not show previous button on first step', () => {
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    });

    it('should not show finish button on first step', () => {
      // O botão "Send Alert" aparece no título do modal, não como botão de finish
      const finishButtons = screen.queryAllByText('Send Alert');
      expect(finishButtons).toHaveLength(1); // Apenas no título
    });
  });

  describe('custom steps', () => {
    it('should render custom steps when provided', () => {
      const CustomStep = () => <div data-testid="custom-step">Custom Step</div>;

      const configWithCustomSteps: AlertsConfig = {
        ...defaultConfig,
        steps: [
          { id: '1', label: 'Custom Step 1', component: CustomStep },
          { id: '2', label: 'Custom Step 2', component: CustomStep },
        ],
      };

      render(<AlertsManager config={configWithCustomSteps} isOpen={true} />);

      expect(screen.getByTestId('custom-step')).toBeInTheDocument();
      expect(screen.getByTestId('step-0')).toHaveTextContent('Custom Step 1');
      expect(screen.getByTestId('step-1')).toHaveTextContent('Custom Step 2');
    });
  });

  describe('step rendering with props', () => {
    it('should render MessageStep with correct props', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('message-step')).toBeInTheDocument();
      expect(screen.getByTestId('message-step')).toHaveAttribute(
        'data-allow-image',
        'true'
      );
    });

    it('should render MessageStep without image attachment when disabled', () => {
      const configWithoutImage: AlertsConfig = {
        ...defaultConfig,
        behavior: {
          ...defaultConfig.behavior,
          allowImageAttachment: false,
        },
      };

      render(<AlertsManager config={configWithoutImage} isOpen={true} />);

      expect(screen.getByTestId('message-step')).toHaveAttribute(
        'data-allow-image',
        'false'
      );
    });
  });

  describe('stepper configuration', () => {
    it('should render stepper with correct attributes', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      const stepper = screen.getByTestId('stepper');
      expect(stepper).toHaveAttribute('data-size', 'small');
      expect(stepper).toHaveAttribute('data-show-progress', 'true');
      expect(stepper).toHaveAttribute('data-responsive', 'true');
    });

    it('should render steps with correct states', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('step-0')).toHaveAttribute(
        'data-state',
        'current'
      );
      expect(screen.getByTestId('step-1')).toHaveAttribute(
        'data-state',
        'pending'
      );
      expect(screen.getByTestId('step-2')).toHaveAttribute(
        'data-state',
        'pending'
      );
      expect(screen.getByTestId('step-3')).toHaveAttribute(
        'data-state',
        'pending'
      );
    });
  });

  describe('button configuration', () => {
    it('should render buttons with correct attributes', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2); // Cancel and Next buttons

      // Cancel button
      expect(buttons[0]).toHaveAttribute('data-variant', 'link');
      expect(buttons[0]).toHaveAttribute('data-size', 'small');

      // Next button
      expect(buttons[1]).toHaveAttribute('data-variant', 'solid');
      expect(buttons[1]).toHaveAttribute('data-size', 'small');
    });
  });

  describe('form state management', () => {
    it('should update form state when store changes', () => {
      render(<AlertsManager config={defaultConfig} isOpen={true} />);

      // Simula mudança no estado do formulário
      act(() => {
        useAlertFormStore.getState().setTitle('Test Title');
        useAlertFormStore.getState().setMessage('Test Message');
      });

      // O componente deve re-renderizar devido ao forceUpdate
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle missing onClose callback', () => {
      // Não deve quebrar se onClose não for fornecido
      expect(() => {
        render(<AlertsManager config={defaultConfig} isOpen={true} />);
      }).not.toThrow();
    });

    it('should handle missing behavior configuration', () => {
      const configWithoutBehavior: AlertsConfig = {
        categories: mockCategories,
      };

      expect(() => {
        render(<AlertsManager config={configWithoutBehavior} isOpen={true} />);
      }).not.toThrow();
    });
  });

  describe('component props', () => {
    it('should handle isOpen prop changes', () => {
      const { rerender } = render(
        <AlertsManager config={defaultConfig} isOpen={false} />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      rerender(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should handle onClose prop', () => {
      const onClose = jest.fn();
      render(
        <AlertsManager config={defaultConfig} isOpen={true} onClose={onClose} />
      );

      fireEvent.click(screen.getByTestId('modal-close'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto-selection', () => {
    it('should auto-select single options in hierarchical categories', async () => {
      const configWithHierarchy: AlertsConfig = {
        ...defaultConfig,
        categories: mockHierarchicalCategories,
      };

      render(<AlertsManager config={configWithHierarchy} isOpen={true} />);

      await act(async () => {
        // Wait for auto-selection to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Auto-selection should have been applied
      // The modal should still be rendered (auto-selection happens internally)
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      // The message step should be visible (first step)
      expect(screen.getByTestId('message-step')).toBeInTheDocument();
    });

    it('should call handleCategoriesChange after auto-selection when fetchStudentsByFilters is provided', async () => {
      const mockFetchStudents = jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          email: 'student@example.com',
          name: 'Student 1',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userInstitutionId: 'ui-1',
          institutionId: 'inst-1',
          profileId: 'profile-1',
          school: { id: 'school-1', name: 'Escola 1' },
          schoolYear: { id: 'serie-1', name: 'Série 1' },
          class: { id: 'turma-1', name: 'Turma 1' },
        },
      ]);

      const configWithFetch: AlertsConfig = {
        ...defaultConfig,
        categories: mockHierarchicalCategories,
        behavior: {
          ...defaultConfig.behavior,
          fetchStudentsByFilters: mockFetchStudents,
        },
      };

      render(<AlertsManager config={configWithFetch} isOpen={true} />);

      // Wait for auto-selection and student fetching to complete
      await waitFor(
        () => {
          expect(mockFetchStudents).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // fetchStudentsByFilters should be called after auto-selection
      // The function is called with the auto-selected categories
      const callArgs = mockFetchStudents.mock.calls[0]?.[0];
      expect(callArgs).toMatchObject({
        schoolIds: expect.arrayContaining(['school-1']),
        schoolYearIds: expect.arrayContaining(['serie-1']),
        classIds: expect.arrayContaining(['turma-1']),
      });
    });

    it('should not call fetchStudentsByFilters if not provided', async () => {
      const configWithoutFetch: AlertsConfig = {
        ...defaultConfig,
        categories: mockHierarchicalCategories,
      };

      render(<AlertsManager config={configWithoutFetch} isOpen={true} />);

      await act(async () => {
        // Wait for auto-selection to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should not throw error and should render normally
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should reset initialization flag when modal closes', () => {
      const { rerender } = render(
        <AlertsManager config={defaultConfig} isOpen={true} />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      // Close modal
      rerender(<AlertsManager config={defaultConfig} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Reopen modal - should re-initialize
      rerender(<AlertsManager config={defaultConfig} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should handle error when fetching students fails', async () => {
      const mockFetchStudents = jest
        .fn()
        .mockRejectedValue(new Error('Failed to fetch students'));

      const configWithFetch: AlertsConfig = {
        ...defaultConfig,
        categories: mockHierarchicalCategories,
        behavior: {
          ...defaultConfig.behavior,
          fetchStudentsByFilters: mockFetchStudents,
        },
      };

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<AlertsManager config={configWithFetch} isOpen={true} />);

      // Wait for auto-selection and error handling
      await waitFor(
        () => {
          expect(mockFetchStudents).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // Wait for error to be logged
      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error fetching students:',
            expect.any(Error)
          );
        },
        { timeout: 1000 }
      );

      // Modal should still be rendered
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
