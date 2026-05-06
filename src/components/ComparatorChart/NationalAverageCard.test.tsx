import { render, screen } from '@testing-library/react';
import { NationalAverageCard } from './NationalAverageCard';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';
import type { NationalAverageData } from '../../types/comparator';

describe('NationalAverageCard', () => {
  const defaultData: NationalAverageData = {
    itemId: 'school-1',
    itemName: 'Escola A',
    simulatedProficiency: 650.5,
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
  };

  const defaultProps = {
    data: defaultData,
  };

  describe('Basic Rendering', () => {
    it('should render the item name', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('Escola A')).toBeInTheDocument();
    });

    it('should render simulated proficiency score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('650.5')).toBeInTheDocument();
    });

    it('should render public school average', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should render private school average', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('600')).toBeInTheDocument();
    });
  });

  describe('Score Labels', () => {
    it('should render simulated proficiency label', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.simulatedProficiency)
      ).toBeInTheDocument();
    });

    it('should render public school average label', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.publicSchoolAverage)
      ).toBeInTheDocument();
    });

    it('should render private school average label', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.privateSchoolAverage)
      ).toBeInTheDocument();
    });
  });

  describe('Detail Scores', () => {
    it('should render languages score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('620')).toBeInTheDocument();
    });

    it('should render humanities score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('680')).toBeInTheDocument();
    });

    it('should render essay score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('720')).toBeInTheDocument();
    });

    it('should render natural sciences score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('590')).toBeInTheDocument();
    });

    it('should render mathematics score', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('640')).toBeInTheDocument();
    });

    it('should render detail labels', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(
        screen.getByText('LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS')
      ).toBeInTheDocument();
      expect(
        screen.getByText('CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS')
      ).toBeInTheDocument();
      expect(screen.getByText('REDAÇÃO')).toBeInTheDocument();
      expect(
        screen.getByText('CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS')
      ).toBeInTheDocument();
      expect(
        screen.getByText('MATEMÁTICA E SUAS TECNOLOGIAS')
      ).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should show above average message when status is above', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.aboveAverage)
      ).toBeInTheDocument();
    });

    it('should show below average message when status is below', () => {
      const dataBelow: NationalAverageData = {
        ...defaultData,
        status: 'below',
      };

      render(<NationalAverageCard data={dataBelow} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.belowAverage)
      ).toBeInTheDocument();
    });

    it('should apply success styling when status is above', () => {
      const { container } = render(<NationalAverageCard {...defaultProps} />);

      const statusBadge = container.querySelector('.bg-success');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should apply warning styling when status is below', () => {
      const dataBelow: NationalAverageData = {
        ...defaultData,
        status: 'below',
      };

      const { container } = render(<NationalAverageCard data={dataBelow} />);

      const statusBadge = container.querySelector('.bg-warning');
      expect(statusBadge).toBeInTheDocument();
    });
  });

  describe('Color Prop', () => {
    it('should apply border color from color prop', () => {
      const { container } = render(
        <NationalAverageCard {...defaultProps} color="#FF0000" />
      );

      const coloredElement = container.querySelector('.border-l-4');
      expect(coloredElement).toHaveStyle({ borderColor: '#FF0000' });
    });

    it('should work without color prop', () => {
      const { container } = render(<NationalAverageCard {...defaultProps} />);

      const coloredElement = container.querySelector('.border-l-4');
      expect(coloredElement).toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom simulatedProficiency label', () => {
      render(
        <NationalAverageCard
          {...defaultProps}
          labels={{ simulatedProficiency: 'Custom Proficiency' }}
        />
      );

      expect(screen.getByText('Custom Proficiency')).toBeInTheDocument();
    });

    it('should use custom publicSchoolAverage label', () => {
      render(
        <NationalAverageCard
          {...defaultProps}
          labels={{ publicSchoolAverage: 'Public Average' }}
        />
      );

      expect(screen.getByText('Public Average')).toBeInTheDocument();
    });

    it('should use custom privateSchoolAverage label', () => {
      render(
        <NationalAverageCard
          {...defaultProps}
          labels={{ privateSchoolAverage: 'Private Average' }}
        />
      );

      expect(screen.getByText('Private Average')).toBeInTheDocument();
    });

    it('should use custom aboveAverage label', () => {
      render(
        <NationalAverageCard
          {...defaultProps}
          labels={{ aboveAverage: 'Great job!' }}
        />
      );

      expect(screen.getByText('Great job!')).toBeInTheDocument();
    });

    it('should use custom belowAverage label', () => {
      const dataBelow: NationalAverageData = {
        ...defaultData,
        status: 'below',
      };

      render(
        <NationalAverageCard
          data={dataBelow}
          labels={{ belowAverage: 'Needs improvement' }}
        />
      );

      expect(screen.getByText('Needs improvement')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper card container styling', () => {
      const { container } = render(<NationalAverageCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('bg-secondary-50', 'rounded-2xl', 'p-6');
    });

    it('should render main scores in a 3-column grid', () => {
      const { container } = render(<NationalAverageCard {...defaultProps} />);

      const mainGrid = container.querySelector('.grid.grid-cols-3');
      expect(mainGrid).toBeInTheDocument();
    });

    it('should render detail scores in a 5-column grid', () => {
      const { container } = render(<NationalAverageCard {...defaultProps} />);

      const detailGrid = container.querySelector('.grid.grid-cols-5');
      expect(detailGrid).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format simulated proficiency with one decimal place', () => {
      const data: NationalAverageData = {
        ...defaultData,
        simulatedProficiency: 650.123,
      };

      render(<NationalAverageCard data={data} />);

      expect(screen.getByText('650.1')).toBeInTheDocument();
    });

    it('should display whole numbers for averages', () => {
      render(<NationalAverageCard {...defaultProps} />);

      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('600')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const data: NationalAverageData = {
        ...defaultData,
        simulatedProficiency: 0,
        publicAverage: 0,
        privateAverage: 0,
        details: {
          languages: 0,
          humanities: 0,
          essay: 0,
          naturalSciences: 0,
          mathematics: 0,
        },
      };

      render(<NationalAverageCard data={data} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('should handle undefined labels gracefully', () => {
      render(<NationalAverageCard {...defaultProps} labels={undefined} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.simulatedProficiency)
      ).toBeInTheDocument();
    });
  });
});
