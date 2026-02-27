import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToggleSwitch from './ToggleSwitch';

describe('ToggleSwitch', () => {
  describe('Renderização', () => {
    it('deve renderizar o toggle switch', () => {
      render(<ToggleSwitch />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('deve renderizar com estado unchecked por padrão', () => {
      render(<ToggleSwitch />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('deve renderizar com estado checked quando checked é true', () => {
      render(<ToggleSwitch checked />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Interação', () => {
    it('deve chamar onChange ao clicar', () => {
      const onChange = jest.fn();
      render(<ToggleSwitch onChange={onChange} />);

      fireEvent.click(screen.getByRole('switch'));

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onChange quando disabled', () => {
      const onChange = jest.fn();
      render(<ToggleSwitch onChange={onChange} disabled />);

      fireEvent.click(screen.getByRole('switch'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar classes de tamanho small por padrão', () => {
      render(<ToggleSwitch />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-5', 'w-9');
    });

    it('deve aplicar classes de tamanho small', () => {
      render(<ToggleSwitch size="small" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-5', 'w-9');
    });

    it('deve aplicar classes de tamanho medium', () => {
      render(<ToggleSwitch size="medium" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-6', 'w-11');
    });

    it('deve aplicar classes de tamanho large', () => {
      render(<ToggleSwitch size="large" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('h-7', 'w-14');
    });
  });

  describe('Estado disabled', () => {
    it('deve aplicar atributo disabled', () => {
      render(<ToggleSwitch disabled />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('deve aplicar classes de estilo disabled', () => {
      render(<ToggleSwitch disabled />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('cursor-not-allowed', 'opacity-40');
    });

    it('não deve ter classes de disabled quando habilitado', () => {
      render(<ToggleSwitch />);

      const toggle = screen.getByRole('switch');
      expect(toggle).not.toHaveClass('cursor-not-allowed');
      expect(toggle).not.toHaveClass('opacity-40');
    });
  });

  describe('Cores', () => {
    it('deve aplicar cor de unchecked por padrão quando unchecked', () => {
      render(<ToggleSwitch checked={false} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('bg-border-300');
    });

    it('deve aplicar cor de checked por padrão quando checked', () => {
      render(<ToggleSwitch checked />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('bg-success-500');
    });

    it('deve aplicar cor customizada quando checked', () => {
      render(<ToggleSwitch checked checkedColor="bg-primary-950" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('bg-primary-950');
    });

    it('deve aplicar cor customizada quando unchecked', () => {
      render(<ToggleSwitch checked={false} uncheckedColor="bg-border-400" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('bg-border-400');
    });
  });

  describe('Classes customizadas', () => {
    it('deve aplicar className adicional ao track', () => {
      render(<ToggleSwitch className="custom-track-class" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('custom-track-class');
    });

    it('deve aplicar thumbClassName adicional ao thumb', () => {
      render(<ToggleSwitch thumbClassName="custom-thumb-class" />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass('custom-thumb-class');
    });
  });

  describe('Thumb (indicador)', () => {
    it('deve ter thumb com translate-x-0 quando unchecked', () => {
      render(<ToggleSwitch checked={false} />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass('translate-x-0');
    });

    it('deve ter thumb com translate correto quando checked (small)', () => {
      render(<ToggleSwitch checked size="small" />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass('translate-x-4');
    });

    it('deve ter thumb com translate correto quando checked (medium)', () => {
      render(<ToggleSwitch checked size="medium" />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass('translate-x-5');
    });

    it('deve ter thumb com translate correto quando checked (large)', () => {
      render(<ToggleSwitch checked size="large" />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass('translate-x-7');
    });

    it('deve ter thumb com classes base corretas', () => {
      render(<ToggleSwitch />);

      const thumb = screen.getByRole('switch').querySelector('span');
      expect(thumb).toHaveClass(
        'pointer-events-none',
        'rounded-full',
        'bg-white',
        'shadow'
      );
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role switch', () => {
      render(<ToggleSwitch />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('deve ter aria-checked false quando unchecked', () => {
      render(<ToggleSwitch checked={false} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('deve ter aria-checked true quando checked', () => {
      render(<ToggleSwitch checked />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('deve ter type button', () => {
      render(<ToggleSwitch />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('type', 'button');
    });

    it('deve ter classes de focus visible', () => {
      render(<ToggleSwitch />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass(
        'focus-visible:ring-2',
        'focus-visible:ring-primary-500'
      );
    });
  });

  describe('Props adicionais', () => {
    it('deve passar props adicionais para o button', () => {
      render(<ToggleSwitch data-testid="custom-toggle" aria-label="Toggle" />);

      const toggle = screen.getByTestId('custom-toggle');
      expect(toggle).toHaveAttribute('aria-label', 'Toggle');
    });

    it('deve ter displayName correto', () => {
      expect(ToggleSwitch.displayName).toBe('ToggleSwitch');
    });
  });
});
