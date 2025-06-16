import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert } from './Alert';

describe('Alert Component', () => {
  it('renders alert with description correctly', () => {
    render(<Alert description="Test description" variant="solid" action="default" />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders alert with title and description correctly', () => {
    render(
      <Alert
        title="Test title"
        description="Test description"
        variant="solid"
        action="default"
      />
    );
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  describe('Variant tests', () => {
    it('applies solid variant classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background-50');
      expect(alert).toHaveClass('border-transparent');
    });

    it('applies outline variant classes correctly', () => {
      render(<Alert description="Test" variant="outline" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('border-border-100');
    });
  });

  describe('Action tests', () => {
    it('applies default action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background-50');
    });

    it('applies info action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-info');
    });

    it('applies success action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="success" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-success');
    });

    it('applies warning action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="warning" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-warning');
    });

    it('applies error action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-error');
    });
  });

  describe('Icon tests', () => {
    it('renders default icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-950');
    });

    it('renders info icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-info-800');
    });

    it('renders success icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="success" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-success-800');
    });

    it('renders warning icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="warning" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-warning-800');
    });

    it('renders error icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-error-800');
    });
  });

  describe('Text styling tests', () => {
    it('applies correct text styling when title is present', () => {
      render(
        <Alert
          title="Test title"
          description="Test description"
          variant="solid"
          action="default"
        />
      );
      const title = screen.getByText('Test title');
      const description = screen.getByText('Test description');
      
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('text-950');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-700');
    });

    it('applies correct text styling when title is not present', () => {
      render(<Alert description="Test description" variant="solid" action="default" />);
      const description = screen.getByText('Test description');
      
      expect(description).toHaveClass('text-base');
      expect(description).toHaveClass('text-950');
    });
  });

  describe('Base classes and functionality', () => {
    it('applies base classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('flex');
      expect(alert).toHaveClass('items-start');
      expect(alert).toHaveClass('gap-2');
      expect(alert).toHaveClass('w-[384px]');
      expect(alert).toHaveClass('py-3');
      expect(alert).toHaveClass('px-4');
      expect(alert).toHaveClass('font-inherit');
      expect(alert).toHaveClass('rounded-md');
    });

    it('applies custom className', () => {
      render(
        <Alert
          description="Test"
          variant="solid"
          action="default"
          className="custom-class"
        />
      );
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('custom-class');
    });
  });

  describe('Combined variant and action classes', () => {
    it('combines solid variant with info action correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-info');
      expect(alert).toHaveClass('border-transparent');
    });

    it('combines outline variant with error action correctly', () => {
      render(<Alert description="Test" variant="outline" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('border-border-100');
    });
  });
}); 