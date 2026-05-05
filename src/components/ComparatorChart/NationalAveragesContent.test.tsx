import { render, screen } from '@testing-library/react';
import { NationalAveragesContent } from './NationalAveragesContent';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';
import type {
  NationalAverageData,
  ComparisonItem,
} from '../../types/comparator';

// Mock NationalAverageCard component
jest.mock('./NationalAverageCard', () => ({
  NationalAverageCard: ({
    data,
    color,
    labels,
  }: {
    data: NationalAverageData;
    color?: string;
    labels?: unknown;
  }) => (
    <div data-testid={`national-average-card-${data.itemId}`}>
      <span data-testid={`card-name-${data.itemId}`}>{data.itemName}</span>
      <span data-testid={`card-color-${data.itemId}`}>
        {color || 'no-color'}
      </span>
      {labels && <span data-testid={`card-has-labels-${data.itemId}`} />}
    </div>
  ),
}));

describe('NationalAveragesContent', () => {
  const defaultItems: ComparisonItem[] = [
    { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
    { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
  ];

  const defaultData: NationalAverageData[] = [
    {
      itemId: 'school-1',
      itemName: 'Escola A',
      simulatedProficiency: 650,
      publicAverage: 500,
      privateAverage: 600,
      details: {
        languages: 620,
        humanities: 680,
        essay: 720,
        naturalSciences: 590,
        mathematics: 640,
      },
      status: 'above',
    },
    {
      itemId: 'school-2',
      itemName: 'Escola B',
      simulatedProficiency: 580,
      publicAverage: 500,
      privateAverage: 600,
      details: {
        languages: 560,
        humanities: 600,
        essay: 620,
        naturalSciences: 540,
        mathematics: 580,
      },
      status: 'below',
    },
  ];

  const defaultProps = {
    data: defaultData,
    items: defaultItems,
  };

  describe('Basic Rendering', () => {
    it('should render the title', () => {
      render(<NationalAveragesContent {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.nationalAveragesTitle)
      ).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      render(
        <NationalAveragesContent {...defaultProps} title="Custom Title" />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render a card for each data item', () => {
      render(<NationalAveragesContent {...defaultProps} />);

      expect(
        screen.getByTestId('national-average-card-school-1')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('national-average-card-school-2')
      ).toBeInTheDocument();
    });
  });

  describe('Color Mapping', () => {
    it('should pass correct color to each card based on items', () => {
      render(<NationalAveragesContent {...defaultProps} />);

      expect(screen.getByTestId('card-color-school-1')).toHaveTextContent(
        '#1E40AF'
      );
      expect(screen.getByTestId('card-color-school-2')).toHaveTextContent(
        '#F59E0B'
      );
    });

    it('should pass undefined color when item is not found', () => {
      const items: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
        // school-2 is missing
      ];

      render(<NationalAveragesContent {...defaultProps} items={items} />);

      expect(screen.getByTestId('card-color-school-1')).toHaveTextContent(
        '#1E40AF'
      );
      expect(screen.getByTestId('card-color-school-2')).toHaveTextContent(
        'no-color'
      );
    });
  });

  describe('Data Passing', () => {
    it('should pass data to each card', () => {
      render(<NationalAveragesContent {...defaultProps} />);

      expect(screen.getByTestId('card-name-school-1')).toHaveTextContent(
        'Escola A'
      );
      expect(screen.getByTestId('card-name-school-2')).toHaveTextContent(
        'Escola B'
      );
    });
  });

  describe('Empty State', () => {
    it('should render title even with empty data', () => {
      render(<NationalAveragesContent {...defaultProps} data={[]} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.nationalAveragesTitle)
      ).toBeInTheDocument();
    });

    it('should not render any cards when data is empty', () => {
      render(<NationalAveragesContent {...defaultProps} data={[]} />);

      expect(
        screen.queryByTestId('national-average-card-school-1')
      ).not.toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom nationalAveragesTitle from labels', () => {
      render(
        <NationalAveragesContent
          {...defaultProps}
          labels={{ nationalAveragesTitle: 'Custom Labels Title' }}
        />
      );

      expect(screen.getByText('Custom Labels Title')).toBeInTheDocument();
    });

    it('should prefer title prop over labels', () => {
      render(
        <NationalAveragesContent
          {...defaultProps}
          title="Title Prop"
          labels={{ nationalAveragesTitle: 'Labels Title' }}
        />
      );

      expect(screen.getByText('Title Prop')).toBeInTheDocument();
      expect(screen.queryByText('Labels Title')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between cards', () => {
      const { container } = render(
        <NationalAveragesContent {...defaultProps} />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('space-y-6');
    });
  });

  describe('Single Item', () => {
    it('should render correctly with single data item', () => {
      const singleData: NationalAverageData[] = [
        {
          itemId: 'school-1',
          itemName: 'Escola A',
          simulatedProficiency: 650,
          publicAverage: 500,
          privateAverage: 600,
          details: {
            languages: 620,
            humanities: 680,
            essay: 720,
            naturalSciences: 590,
            mathematics: 640,
          },
          status: 'above',
        },
      ];

      render(<NationalAveragesContent {...defaultProps} data={singleData} />);

      expect(
        screen.getByTestId('national-average-card-school-1')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('national-average-card-school-2')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined labels gracefully', () => {
      render(<NationalAveragesContent {...defaultProps} labels={undefined} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.nationalAveragesTitle)
      ).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      render(<NationalAveragesContent {...defaultProps} items={[]} />);

      expect(screen.getByTestId('card-color-school-1')).toHaveTextContent(
        'no-color'
      );
      expect(screen.getByTestId('card-color-school-2')).toHaveTextContent(
        'no-color'
      );
    });
  });
});
