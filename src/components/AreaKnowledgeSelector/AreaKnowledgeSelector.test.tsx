import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AreaKnowledgeSelector } from './AreaKnowledgeSelector';
import { ESSAY_AREA_ID } from './types';
import type { AreaKnowledgePerformance } from '../GeneralOverviewSection/types';

/**
 * Mock areas data for testing
 */
const mockAreas: AreaKnowledgePerformance[] = [
  {
    id: 'area-1',
    name: 'Linguagens e Códigos',
    urlCover: null,
    percentage: 75,
    questionsTotal: 100,
    questionsCorrect: 75,
  },
  {
    id: 'area-2',
    name: 'Ciências Humanas',
    urlCover: null,
    percentage: 80,
    questionsTotal: 100,
    questionsCorrect: 80,
  },
  {
    id: 'area-3',
    name: 'Ciências da Natureza',
    urlCover: null,
    percentage: 65,
    questionsTotal: 100,
    questionsCorrect: 65,
  },
  {
    id: 'area-4',
    name: 'Matemática e suas Tecnologias',
    urlCover: null,
    percentage: 70,
    questionsTotal: 100,
    questionsCorrect: 70,
  },
];

describe('AreaKnowledgeSelector', () => {
  const defaultProps = {
    areas: mockAreas,
    selectedAreaId: null,
    onAreaChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with default label', () => {
      render(<AreaKnowledgeSelector {...defaultProps} />);
      expect(screen.getByText('Área de conhecimento')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <AreaKnowledgeSelector {...defaultProps} label="Filtrar por área" />
      );
      expect(screen.getByText('Filtrar por área')).toBeInTheDocument();
    });

    it('renders select trigger', () => {
      render(<AreaKnowledgeSelector {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows default placeholder when no area selected', () => {
      render(<AreaKnowledgeSelector {...defaultProps} />);
      const trigger = screen.getByRole('button');
      // Select component shows placeholder when using JSX children in SelectItem
      expect(trigger).toHaveTextContent('Selecione uma área');
    });
  });

  describe('Select options', () => {
    it('shows "Todos" option when dropdown is opened', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument();
      });
    });

    it('shows all area options when dropdown is opened', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        mockAreas.forEach((area) => {
          expect(screen.getByText(area.name)).toBeInTheDocument();
        });
      });
    });

    it('shows "Redação" option by default (includeEssay=true)', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Redação')).toBeInTheDocument();
      });
    });

    it('hides "Redação" option when includeEssay=false', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} includeEssay={false} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByText('Redação')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection behavior', () => {
    it('calls onAreaChange with null when "Todos" is selected', async () => {
      const onAreaChange = jest.fn();
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector
          {...defaultProps}
          selectedAreaId="area-1"
          onAreaChange={onAreaChange}
        />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument();
      });

      const todosOption = screen.getByText('Todos');
      await user.click(todosOption);

      expect(onAreaChange).toHaveBeenCalledWith(null);
    });

    it('calls onAreaChange with area id when an area is selected', async () => {
      const onAreaChange = jest.fn();
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector {...defaultProps} onAreaChange={onAreaChange} />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Linguagens e Códigos')).toBeInTheDocument();
      });

      const areaOption = screen.getByText('Linguagens e Códigos');
      await user.click(areaOption);

      expect(onAreaChange).toHaveBeenCalledWith('area-1');
    });

    it('calls onAreaChange with essay id when "Redação" is selected', async () => {
      const onAreaChange = jest.fn();
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector {...defaultProps} onAreaChange={onAreaChange} />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Redação')).toBeInTheDocument();
      });

      const essayOption = screen.getByText('Redação');
      await user.click(essayOption);

      expect(onAreaChange).toHaveBeenCalledWith(ESSAY_AREA_ID);
    });

    it('renders with selected area id', () => {
      render(
        <AreaKnowledgeSelector {...defaultProps} selectedAreaId="area-2" />
      );

      // Component renders with the correct value set internally
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('renders with essay selected', () => {
      render(
        <AreaKnowledgeSelector
          {...defaultProps}
          selectedAreaId={ESSAY_AREA_ID}
        />
      );

      // Component renders with essay value set internally
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('applies opacity class when loading', () => {
      render(<AreaKnowledgeSelector {...defaultProps} loading={true} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('opacity-50');
    });

    it('does not apply opacity class when not loading', () => {
      render(<AreaKnowledgeSelector {...defaultProps} loading={false} />);

      const trigger = screen.getByRole('button');
      expect(trigger).not.toHaveClass('opacity-50');
    });
  });

  describe('Empty areas', () => {
    it('renders with empty areas array', () => {
      render(<AreaKnowledgeSelector {...defaultProps} areas={[]} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('still shows "Todos" option with empty areas', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} areas={[]} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument();
      });
    });

    it('still shows "Redação" option with empty areas when includeEssay=true', async () => {
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector {...defaultProps} areas={[]} includeEssay={true} />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Redação')).toBeInTheDocument();
      });
    });
  });

  describe('Area colors', () => {
    it('renders color indicators for areas', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByText('Linguagens e Códigos')).toBeInTheDocument();
      });

      // Color indicators should be rendered (we can't easily test exact colors,
      // but we can verify the structure exists)
      // Select uses menuitem role instead of option
      const options = screen.getAllByRole('menuitem');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has accessible button role', () => {
      render(<AreaKnowledgeSelector {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('can be navigated with keyboard', async () => {
      const user = userEvent.setup();
      render(<AreaKnowledgeSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      trigger.focus();

      // Open dropdown with Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles unknown selectedAreaId gracefully', () => {
      render(
        <AreaKnowledgeSelector
          {...defaultProps}
          selectedAreaId="unknown-area-id"
        />
      );

      // Should render without crashing
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles rapid selection changes', async () => {
      const onAreaChange = jest.fn();
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector {...defaultProps} onAreaChange={onAreaChange} />
      );

      const trigger = screen.getByRole('button');

      // Multiple rapid interactions
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Linguagens e Códigos')).toBeInTheDocument();
      });

      const option1 = screen.getByText('Linguagens e Códigos');
      await user.click(option1);

      expect(onAreaChange).toHaveBeenCalled();
    });

    it('works with areas containing special characters in names', async () => {
      const specialAreas: AreaKnowledgePerformance[] = [
        {
          id: 'special-1',
          name: 'Área com "aspas" e (parênteses)',
          urlCover: null,
          percentage: 50,
          questionsTotal: 10,
          questionsCorrect: 5,
        },
      ];

      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector {...defaultProps} areas={specialAreas} />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.getByText('Área com "aspas" e (parênteses)')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Default props coverage', () => {
    it('uses default loading=false', () => {
      render(
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={jest.fn()}
        />
      );

      const trigger = screen.getByRole('button');
      expect(trigger).not.toHaveClass('opacity-50');
    });

    it('uses default label', () => {
      render(
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={jest.fn()}
        />
      );

      expect(screen.getByText('Área de conhecimento')).toBeInTheDocument();
    });

    it('uses default includeEssay=true', async () => {
      const user = userEvent.setup();
      render(
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={jest.fn()}
        />
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Redação')).toBeInTheDocument();
      });
    });
  });
});
