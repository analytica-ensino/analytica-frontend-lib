import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AlternativesList, Alternative } from './Alternative';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('AlternativesList', () => {
  const mockAlternatives: Alternative[] = [
    { value: 'a', label: 'Alternativa A' },
    { value: 'b', label: 'Alternativa B' },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockAlternativesWithStatus: Alternative[] = [
    { value: 'a', label: 'Alternativa A', status: 'correct' },
    { value: 'b', label: 'Alternativa B', status: 'incorrect' },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockAlternativesDetailed: Alternative[] = [
    {
      value: 'a',
      label: 'Alternativa A',
      description: 'Descrição da alternativa A',
      status: 'correct',
    },
    {
      value: 'b',
      label: 'Alternativa B',
      description: 'Descrição da alternativa B',
    },
    { value: 'c', label: 'Alternativa C', disabled: true },
  ];

  describe('Renderização básica', () => {
    it('renderiza lista de alternativas básica', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
      expect(screen.getByText('Alternativa C')).toBeInTheDocument();
    });

    it('renderiza com valor padrão selecionado', () => {
      render(
        <AlternativesList alternatives={mockAlternatives} defaultValue="b" />
      );

      const radioB = screen.getByDisplayValue('b');
      expect(radioB).toBeChecked();
    });

    it('gera nome único do grupo quando não fornecido', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radioA = screen.getByDisplayValue('a');
      expect(radioA).toHaveAttribute('name', 'alternatives-test-id');
    });

    it('usa nome customizado do grupo', () => {
      render(
        <AlternativesList alternatives={mockAlternatives} name="custom-group" />
      );

      const radioA = screen.getByDisplayValue('a');
      expect(radioA).toHaveAttribute('name', 'custom-group');
    });

    it('aplica classes CSS customizadas', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Layouts', () => {
    it('aplica layout padrão', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-3.5');
    });

    it('aplica layout compacto', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} layout="compact" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-2');
    });

    it('aplica layout detalhado com descrições', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-4');
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();
    });
  });

  describe('Status das alternativas', () => {
    it('aplica estilos para alternativa correta', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesWithStatus} />
      );

      const correctAlternative = container.querySelector(
        '.bg-success-background'
      );
      expect(correctAlternative).toBeInTheDocument();
      expect(correctAlternative).toHaveClass('border-success-300');
    });

    it('aplica estilos para alternativa incorreta', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesWithStatus} />
      );

      const incorrectAlternative = container.querySelector(
        '.bg-error-background'
      );
      expect(incorrectAlternative).toBeInTheDocument();
      expect(incorrectAlternative).toHaveClass('border-error-300');
    });

    it('aplica estilos padrão para alternativa neutra', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const neutralAlternatives = container.querySelectorAll('.bg-background');
      expect(neutralAlternatives.length).toBeGreaterThan(0);
    });

    it('exibe badge de resposta correta', () => {
      render(<AlternativesList alternatives={mockAlternativesWithStatus} />);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('exibe badge de resposta incorreta', () => {
      render(<AlternativesList alternatives={mockAlternativesWithStatus} />);

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });
  });

  describe('Estado desabilitado', () => {
    it('desabilita todas as alternativas quando disabled é true', () => {
      render(<AlternativesList alternatives={mockAlternatives} disabled />);

      // Check if hidden inputs are disabled
      const hiddenInputs = screen.getAllByDisplayValue(/[abc]/);
      hiddenInputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('desabilita alternativa específica', () => {
      const alternativesWithDisabled = [
        ...mockAlternatives,
        { value: 'd', label: 'Alternativa D', disabled: true },
      ];

      render(<AlternativesList alternatives={alternativesWithDisabled} />);

      const disabledRadio = screen.getByDisplayValue('d');
      expect(disabledRadio).toBeDisabled();

      const enabledRadio = screen.getByDisplayValue('a');
      expect(enabledRadio).not.toBeDisabled();
    });

    it('aplica opacidade para alternativa desabilitada', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesDetailed} />
      );

      const disabledElement = container.querySelector('.opacity-50');
      expect(disabledElement).toBeInTheDocument();
    });
  });

  describe('Modo interativo', () => {
    it('permite seleção de alternativas', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternatives}
          onValueChange={handleValueChange}
        />
      );

      const radioB = screen.getByDisplayValue('b');
      await user.click(radioB);

      expect(handleValueChange).toHaveBeenCalledWith('b');
    });

    it('funciona como componente controlado', () => {
      const { rerender } = render(
        <AlternativesList alternatives={mockAlternatives} value="a" />
      );

      let radioA = screen.getByDisplayValue('a');
      expect(radioA).toBeChecked();

      rerender(<AlternativesList alternatives={mockAlternatives} value="b" />);

      const radioB = screen.getByDisplayValue('b');
      expect(radioB).toBeChecked();
      expect(radioA).not.toBeChecked();
    });

    it('aplica classes hover em modo interativo', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const neutralAlternative = container.querySelector(
        '.hover\\:bg-background-50'
      );
      expect(neutralAlternative).toBeInTheDocument();
    });
  });

  describe('Modo readonly', () => {
    it('renderiza em modo readonly sem RadioGroup', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b"
        />
      );

      // Should not have functional radio elements
      const radioGroup = screen.queryByRole('radiogroup');
      expect(radioGroup).not.toBeInTheDocument();

      // Should display alternatives
      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
    });

    it('mostra alternativa selecionada pelo usuário em readonly', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b"
        />
      );

      // Check if there's a visual radio marked
      const selectedRadios = container.querySelectorAll('.border-primary-950');
      expect(selectedRadios.length).toBeGreaterThan(0);
    });

    it('marca resposta incorreta quando usuário seleciona alternativa errada', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b" // User selected 'b' which has status 'incorrect'
        />
      );

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('mostra resposta correta independente da seleção do usuário', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b" // User selected 'b'
        />
      );

      // Alternative 'a' has status 'correct', so should show as correct
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('não aplica classes hover em modo readonly', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} mode="readonly" />
      );

      const hoverClasses = container.querySelector('.hover\\:bg-background-50');
      expect(hoverClasses).not.toBeInTheDocument();
    });

    it('renderiza radio visual sem funcionalidade em readonly', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="readonly"
          selectedValue="a"
        />
      );

      const visualRadios = container.querySelectorAll('.rounded-full.border-2');
      expect(visualRadios.length).toBe(mockAlternatives.length);

      // Check if has cursor-default (not clickable)
      const radioWithCursor = container.querySelector('.cursor-default');
      expect(radioWithCursor).toBeInTheDocument();
    });
  });

  describe('Layout detalhado', () => {
    it('renderiza layout detalhado com todas as funcionalidades', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      // Check if descriptions are present
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();

      // Check if badge is present
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('renderiza layout detalhado em modo readonly', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
          mode="readonly"
          selectedValue="b"
        />
      );

      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('aplica estilos corretos para layout detalhado', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      const detailedItems = container.querySelectorAll(
        '.border-2.rounded-lg.p-4'
      );
      expect(detailedItems.length).toBe(mockAlternativesDetailed.length);
    });
  });

  describe('Alternativas sem valor', () => {
    it('gera ID alternativo quando value não está presente', () => {
      const alternativesWithoutValue: Alternative[] = [
        { value: '', label: 'Alternativa sem valor' },
        { value: 'b', label: 'Alternativa B' },
      ];

      const { container } = render(
        <AlternativesList alternatives={alternativesWithoutValue} />
      );

      // Should generate ID based on index
      const element = container.querySelector('#alt-0');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Interações do usuário', () => {
    it('permite clicar no label para selecionar', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternatives}
          onValueChange={handleValueChange}
        />
      );

      const labelB = screen.getByText('Alternativa B');
      await user.click(labelB);

      expect(handleValueChange).toHaveBeenCalledWith('b');
    });

    it('não permite interação com alternativas desabilitadas', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          onValueChange={handleValueChange}
        />
      );

      const disabledLabel = screen.getByText('Alternativa C');
      await user.click(disabledLabel);

      expect(handleValueChange).not.toHaveBeenCalledWith('c');
    });
  });

  describe('Acessibilidade', () => {
    it('associa labels corretamente com inputs', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radioA = screen.getByDisplayValue('a');
      const labelA = screen.getByText('Alternativa A');

      expect(labelA).toHaveAttribute('for', radioA.id);
    });

    it('tem estrutura acessível de radiogroup', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      const radios = screen.getAllByRole('radio', { hidden: true });
      // Now there are 2 radio elements per alternative (accessible + visual)
      expect(radios).toHaveLength(mockAlternatives.length);
    });
  });

  describe('Casos extremos', () => {
    it('lida com lista vazia de alternativas', () => {
      const { container } = render(<AlternativesList alternatives={[]} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.children).toHaveLength(0);
    });

    it('lida com alternativas que não têm label', () => {
      const alternativesWithoutLabel: Alternative[] = [
        { value: 'a', label: '' },
        { value: 'b', label: 'Alternativa B' },
      ];

      render(<AlternativesList alternatives={alternativesWithoutLabel} />);

      expect(screen.getByDisplayValue('a')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
    });

    it('funciona com apenas uma alternativa', () => {
      const singleAlternative: Alternative[] = [
        { value: 'single', label: 'Única alternativa' },
      ];

      render(<AlternativesList alternatives={singleAlternative} />);

      expect(screen.getByText('Única alternativa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('single')).toBeInTheDocument();
    });
  });

  describe('Estados visuais complexos', () => {
    it('combina status e disabled corretamente', () => {
      const complexAlternatives: Alternative[] = [
        {
          value: 'a',
          label: 'Correta e desabilitada',
          status: 'correct',
          disabled: true,
        },
        {
          value: 'b',
          label: 'Incorreta e desabilitada',
          status: 'incorrect',
          disabled: true,
        },
      ];

      const { container } = render(
        <AlternativesList alternatives={complexAlternatives} />
      );

      // Should have elements with opacity and status
      const correctDisabled = container.querySelector(
        '.bg-success-background.opacity-50'
      );
      const incorrectDisabled = container.querySelector(
        '.bg-error-background.opacity-50'
      );

      expect(correctDisabled).toBeInTheDocument();
      expect(incorrectDisabled).toBeInTheDocument();
    });

    it('renderiza corretamente em readonly com layout detailed', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          mode="readonly"
          layout="detailed"
          selectedValue="a"
        />
      );

      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });
  });

  describe('Renderização condicional de badges', () => {
    it('não renderiza badge quando status é neutro', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
      expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
    });

    it('renderiza badges apenas para alternativas com status', () => {
      const mixedAlternatives: Alternative[] = [
        { value: 'a', label: 'Alternativa A', status: 'correct' },
        { value: 'b', label: 'Alternativa B' }, // without status
        { value: 'c', label: 'Alternativa C', status: 'incorrect' },
      ];

      render(<AlternativesList alternatives={mixedAlternatives} />);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();

      // Should have only 2 badges (not 3)
      const badges = screen.getAllByText(/Resposta/);
      expect(badges).toHaveLength(2);
    });
  });

  describe('Função getStatusStyles com valor default', () => {
    it('aplica classes hover por padrão quando isReadonly não é fornecido (valor default false)', () => {
      // Test to cover line 96: isReadonly: boolean = false
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="interactive" // interactive mode uses default value of isReadonly = false
        />
      );

      // Check if hover classes are present (behavior when isReadonly = false by default)
      const hoverElements = container.querySelectorAll(
        '.hover\\:bg-background-50'
      );
      expect(hoverElements.length).toBeGreaterThan(0);

      // Check that there are no elements with specific status (neutral status)
      const neutralAlternatives = container.querySelectorAll(
        '.bg-background.border-border-100'
      );
      expect(neutralAlternatives.length).toBeGreaterThan(0);
    });

    it('não aplica classes hover quando isReadonly é explicitamente true', () => {
      // Comparison test to ensure default value is working
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="readonly" // readonly mode sets isReadonly = true explicitly
        />
      );

      // Check that there are NO hover classes (behavior when isReadonly = true)
      const hoverElements = container.querySelectorAll(
        '.hover\\:bg-background-50'
      );
      expect(hoverElements.length).toBe(0);
    });
  });

  describe('Alternative.disabled em modo readonly (linha 212)', () => {
    it('aplica opacity-50 para alternativa desabilitada em modo readonly', () => {
      // Specific test for line 212: alternative.disabled ? 'opacity-50' : ''
      const alternativesWithDisabled: Alternative[] = [
        { value: 'a', label: 'Alternativa habilitada' },
        { value: 'b', label: 'Alternativa desabilitada', disabled: true },
        {
          value: 'c',
          label: 'Alternativa com status e disabled',
          status: 'correct',
          disabled: true,
        },
      ];

      const { container } = render(
        <AlternativesList
          alternatives={alternativesWithDisabled}
          mode="readonly"
          selectedValue="a"
        />
      );

      // Check that there are exactly 2 elements with opacity-50 (the two disabled alternatives)
      const disabledElements = container.querySelectorAll('.opacity-50');
      expect(disabledElements).toHaveLength(2);

      // Check that enabled alternative does NOT have opacity-50
      const enabledElement = container.querySelector('span');
      expect(enabledElement?.closest('.opacity-50')).toBeNull();

      // Check that labels of disabled alternatives are present
      expect(screen.getByText('Alternativa desabilitada')).toBeInTheDocument();
      expect(
        screen.getByText('Alternativa com status e disabled')
      ).toBeInTheDocument();
    });

    it('não aplica opacity-50 quando alternative.disabled é false em modo readonly', () => {
      // Test for the opposite side of the condition (alternative.disabled ? 'opacity-50' : '')
      const alternativesEnabled: Alternative[] = [
        { value: 'a', label: 'Alternativa A', disabled: false },
        { value: 'b', label: 'Alternativa B' }, // disabled undefined (falsy)
      ];

      const { container } = render(
        <AlternativesList alternatives={alternativesEnabled} mode="readonly" />
      );

      // Check that there are NO elements with opacity-50
      const disabledElements = container.querySelectorAll('.opacity-50');
      expect(disabledElements).toHaveLength(0);
    });

    it('aplica opacity-50 para alternativa desabilitada em layout detailed readonly', () => {
      // Test to ensure line 212 also works in detailed layout
      const alternativesWithDisabledDetailed: Alternative[] = [
        {
          value: 'a',
          label: 'Alternativa detalhada desabilitada',
          description: 'Descrição da alternativa',
          disabled: true,
          status: 'incorrect',
        },
      ];

      const { container } = render(
        <AlternativesList
          alternatives={alternativesWithDisabledDetailed}
          mode="readonly"
          layout="detailed"
        />
      );

      // Check that element with opacity-50 exists in detailed layout
      const disabledElement = container.querySelector('.opacity-50');
      expect(disabledElement).toBeInTheDocument();
      expect(disabledElement).toHaveClass('border-2', 'rounded-lg', 'p-4');

      // Check that description is present even with disabled
      expect(screen.getByText('Descrição da alternativa')).toBeInTheDocument();
    });
  });
});
