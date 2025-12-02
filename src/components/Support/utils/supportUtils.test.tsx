import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getCategoryIcon } from './supportUtils';
import { SupportCategory } from '../../../types/support';

describe('supportUtils', () => {
  describe('getCategoryIcon', () => {
    it('deve retornar null quando categoria é null', () => {
      const result = getCategoryIcon(null);
      expect(result).toBeNull();
    });

    it('deve retornar KeyIcon para categoria ACESSO', () => {
      const icon = getCategoryIcon(SupportCategory.ACESSO);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('deve retornar BugIcon para categoria TECNICO', () => {
      const icon = getCategoryIcon(SupportCategory.TECNICO);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('deve retornar InfoIcon para categoria OUTROS', () => {
      const icon = getCategoryIcon(SupportCategory.OUTROS);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('deve retornar InfoIcon para categoria desconhecida', () => {
      const icon = getCategoryIcon('unknown' as SupportCategory);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('deve usar tamanho padrão de 16', () => {
      const icon = getCategoryIcon(SupportCategory.ACESSO);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('deve aceitar tamanho customizado', () => {
      const icon = getCategoryIcon(SupportCategory.ACESSO, 24);
      const { container } = render(<>{icon}</>);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });
});
