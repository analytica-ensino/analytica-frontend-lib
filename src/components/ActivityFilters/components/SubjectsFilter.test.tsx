import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { KnowledgeArea } from '../../../types/activityFilters';

// Mock the barrel export that SubjectsFilter imports from. The Select compound
// is the component under test as far as behaviour goes, so it comes from the
// real module — only the leaf presentational pieces are stubbed.
jest.mock('../../..', () => {
  const actualSelect = jest.requireActual('../../Select/Select');

  return {
    Select: actualSelect.default,
    SelectTrigger: actualSelect.SelectTrigger,
    SelectValue: actualSelect.SelectValue,
    SelectContent: actualSelect.SelectContent,
    SelectItem: actualSelect.SelectItem,
    IconRender: ({ iconName, size }: { iconName: string; size: number }) => (
      <span data-testid={`icon-${iconName}`} data-size={size}>
        {iconName}
      </span>
    ),
    Text: ({
      children,
      size,
      className,
    }: {
      children: React.ReactNode;
      size: string;
      className: string;
    }) => (
      <span data-size={size} className={className}>
        {children}
      </span>
    ),
    TruncatedText: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="truncated-text">{children}</span>
    ),
    useTheme: () => ({ isDark: false }),
    getSubjectColorWithOpacity: (color: string) => `${color}20`,
  };
});

// Import after mocks
import { SubjectsFilter } from './SubjectsFilter';

describe('SubjectsFilter', () => {
  const mockKnowledgeAreas: KnowledgeArea[] = [
    { id: 'math-1', name: 'Matemática', color: '#FF5733', icon: 'Calculator' },
    { id: 'physics-1', name: 'Física', color: '#3357FF', icon: 'Atom' },
    { id: 'chemistry-1', name: 'Química', color: '#33FF57', icon: 'Flask' },
  ];

  const defaultProps = {
    knowledgeAreas: mockKnowledgeAreas,
    selectedSubject: null,
    onSubjectChange: jest.fn(),
  };

  const getTrigger = () => screen.getByTestId('subjects-filter-trigger');

  const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(getTrigger());
    return screen.getByRole('menu');
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Trigger', () => {
    it('shows the placeholder when no subject is selected', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(getTrigger()).toHaveTextContent(
        'Selecione um componente curricular'
      );
    });

    it('accepts a custom placeholder', () => {
      render(<SubjectsFilter {...defaultProps} placeholder="Escolha aí" />);

      expect(getTrigger()).toHaveTextContent('Escolha aí');
    });

    it('shows the selected subject name', async () => {
      render(<SubjectsFilter {...defaultProps} selectedSubject="physics-1" />);

      await waitFor(() => {
        expect(getTrigger()).toHaveTextContent('Física');
      });
    });

    it('falls back to the placeholder when the selection is cleared', async () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} selectedSubject="physics-1" />
      );
      await waitFor(() => expect(getTrigger()).toHaveTextContent('Física'));

      rerender(<SubjectsFilter {...defaultProps} selectedSubject={null} />);

      await waitFor(() => {
        expect(getTrigger()).toHaveTextContent(
          'Selecione um componente curricular'
        );
      });
    });

    it('starts closed — no options are rendered', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Options', () => {
    it('lists every knowledge area once opened', async () => {
      const user = userEvent.setup();
      render(<SubjectsFilter {...defaultProps} />);

      const menu = await openDropdown(user);

      expect(within(menu).getByText('Matemática')).toBeInTheDocument();
      expect(within(menu).getByText('Física')).toBeInTheDocument();
      expect(within(menu).getByText('Química')).toBeInTheDocument();
      expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    });

    it('renders each subject icon', async () => {
      const user = userEvent.setup();
      render(<SubjectsFilter {...defaultProps} />);

      await openDropdown(user);

      expect(screen.getByTestId('icon-Calculator')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Atom')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Flask')).toBeInTheDocument();
    });

    it('falls back to the BookOpen icon when a subject has none', async () => {
      const user = userEvent.setup();
      render(
        <SubjectsFilter
          {...defaultProps}
          knowledgeAreas={[
            { id: 'no-icon', name: 'Sem ícone', color: '#000000' },
          ]}
        />
      );

      await openDropdown(user);

      expect(screen.getByTestId('icon-BookOpen')).toBeInTheDocument();
    });

    it('renders no options when there are no knowledge areas', async () => {
      const user = userEvent.setup();
      render(<SubjectsFilter {...defaultProps} knowledgeAreas={[]} />);

      const menu = await openDropdown(user);

      expect(within(menu).queryAllByRole('menuitem')).toHaveLength(0);
    });
  });

  describe('Selection', () => {
    it('calls onSubjectChange with the picked subject id', async () => {
      const user = userEvent.setup();
      const onSubjectChange = jest.fn();
      render(
        <SubjectsFilter
          {...defaultProps}
          onSubjectChange={onSubjectChange}
          selectedSubject="math-1"
        />
      );

      const menu = await openDropdown(user);
      await user.click(within(menu).getByText('Química'));

      expect(onSubjectChange).toHaveBeenCalledTimes(1);
      expect(onSubjectChange).toHaveBeenCalledWith('chemistry-1');
    });

    it('closes the dropdown after picking', async () => {
      const user = userEvent.setup();
      render(<SubjectsFilter {...defaultProps} />);

      const menu = await openDropdown(user);
      await user.click(within(menu).getByText('Física'));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('uses the latest onSubjectChange handler', async () => {
      const user = userEvent.setup();
      const first = jest.fn();
      const second = jest.fn();
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} onSubjectChange={first} />
      );

      rerender(<SubjectsFilter {...defaultProps} onSubjectChange={second} />);

      const menu = await openDropdown(user);
      await user.click(within(menu).getByText('Física'));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith('physics-1');
    });

    it('reverts the trigger when the parent vetoes the change', async () => {
      const user = userEvent.setup();
      // A vetoing parent returns false and never updates `selectedSubject`.
      const onSubjectChange = jest.fn().mockResolvedValue(false);
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubject="math-1"
          onSubjectChange={onSubjectChange}
        />
      );
      await waitFor(() => expect(getTrigger()).toHaveTextContent('Matemática'));

      const menu = await openDropdown(user);
      await user.click(within(menu).getByText('Física'));

      expect(onSubjectChange).toHaveBeenCalledWith('physics-1');
      await waitFor(() => {
        expect(getTrigger()).toHaveTextContent('Matemática');
      });
      expect(getTrigger()).not.toHaveTextContent('Física');
    });

    it('keeps the pick when the handler throws is reported and rolled back', async () => {
      const user = userEvent.setup();
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onSubjectChange = jest.fn().mockRejectedValue(new Error('boom'));
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubject="math-1"
          onSubjectChange={onSubjectChange}
        />
      );

      const menu = await openDropdown(user);
      await user.click(within(menu).getByText('Física'));

      await waitFor(() => {
        expect(getTrigger()).toHaveTextContent('Matemática');
      });
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Loading and error states', () => {
    it('renders the loading message instead of the dropdown', () => {
      render(<SubjectsFilter {...defaultProps} loading />);

      expect(
        screen.getByText('Carregando componentes curriculares...')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('subjects-filter-trigger')
      ).not.toBeInTheDocument();
    });

    it('renders the error message instead of the dropdown', () => {
      render(<SubjectsFilter {...defaultProps} error="Erro ao carregar" />);

      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
      expect(
        screen.queryByTestId('subjects-filter-trigger')
      ).not.toBeInTheDocument();
    });

    it('prefers the loading state over the error state', () => {
      render(<SubjectsFilter {...defaultProps} loading error="Erro" />);

      expect(
        screen.getByText('Carregando componentes curriculares...')
      ).toBeInTheDocument();
      expect(screen.queryByText('Erro')).not.toBeInTheDocument();
    });

    it('shows the dropdown once loading finishes', () => {
      const { rerender } = render(<SubjectsFilter {...defaultProps} loading />);
      expect(
        screen.getByText('Carregando componentes curriculares...')
      ).toBeInTheDocument();

      rerender(<SubjectsFilter {...defaultProps} loading={false} />);

      expect(getTrigger()).toBeInTheDocument();
      expect(
        screen.queryByText('Carregando componentes curriculares...')
      ).not.toBeInTheDocument();
    });
  });
});
