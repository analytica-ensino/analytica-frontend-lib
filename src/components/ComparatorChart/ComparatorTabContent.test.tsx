import { render, screen } from '@testing-library/react';
import { ComparatorTabContent } from './ComparatorTabContent';
import type {
  ComparatorData,
  ComparisonItem,
  ComparatorTabType,
} from '../../types/comparator';

// Mock the content components
jest.mock('./KnowledgeAreasContent', () => ({
  KnowledgeAreasContent: ({
    data,
    items,
    title,
  }: {
    data: unknown[];
    items: unknown[];
    title?: string;
  }) => (
    <div data-testid="knowledge-areas-content">
      <span data-testid="ka-data-length">{(data as unknown[]).length}</span>
      <span data-testid="ka-items-length">{(items as unknown[]).length}</span>
      {title && <span data-testid="ka-title">{title}</span>}
    </div>
  ),
}));

jest.mock('./CurricularComponentsContent', () => ({
  CurricularComponentsContent: ({
    data,
    items,
    title,
  }: {
    data: unknown[];
    items: unknown[];
    title?: string;
  }) => (
    <div data-testid="curricular-components-content">
      <span data-testid="cc-data-length">{(data as unknown[]).length}</span>
      <span data-testid="cc-items-length">{(items as unknown[]).length}</span>
      {title && <span data-testid="cc-title">{title}</span>}
    </div>
  ),
}));

jest.mock('./CompetenciesContent', () => ({
  CompetenciesContent: ({
    data,
    items,
    title,
  }: {
    data: unknown[];
    items: unknown[];
    title?: string;
  }) => (
    <div data-testid="competencies-content">
      <span data-testid="comp-data-length">{(data as unknown[]).length}</span>
      <span data-testid="comp-items-length">{(items as unknown[]).length}</span>
      {title && <span data-testid="comp-title">{title}</span>}
    </div>
  ),
}));

jest.mock('./NationalAveragesContent', () => ({
  NationalAveragesContent: ({
    data,
    items,
    title,
  }: {
    data: unknown[];
    items: unknown[];
    title?: string;
  }) => (
    <div data-testid="national-averages-content">
      <span data-testid="na-data-length">{(data as unknown[]).length}</span>
      <span data-testid="na-items-length">{(items as unknown[]).length}</span>
      {title && <span data-testid="na-title">{title}</span>}
    </div>
  ),
}));

describe('ComparatorTabContent', () => {
  const defaultSelectedItems: ComparisonItem[] = [
    { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
    { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
  ];

  const defaultData: ComparatorData = {
    knowledgeAreas: [
      {
        area: 'Ciências Humanas',
        values: [
          { itemId: 'school-1', percentage: 75 },
          { itemId: 'school-2', percentage: 65 },
        ],
      },
    ],
    curricularComponents: [
      {
        component: 'Matemática',
        values: [
          { itemId: 'school-1', percentage: 80 },
          { itemId: 'school-2', percentage: 70 },
        ],
      },
      {
        component: 'Português',
        values: [
          { itemId: 'school-1', percentage: 85 },
          { itemId: 'school-2', percentage: 75 },
        ],
      },
    ],
    competencies: [
      {
        competency: 'Competência 1',
        values: [
          { itemId: 'school-1', percentage: 90 },
          { itemId: 'school-2', percentage: 85 },
        ],
      },
    ],
    nationalAverages: [
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
        status: 'above' as const,
      },
    ],
  };

  const defaultProps = {
    activeTab: 'knowledge-areas' as ComparatorTabType,
    data: defaultData,
    selectedItems: defaultSelectedItems,
  };

  describe('Tab Rendering', () => {
    it('should render KnowledgeAreasContent when activeTab is knowledge-areas', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="knowledge-areas" />
      );

      expect(screen.getByTestId('knowledge-areas-content')).toBeInTheDocument();
      expect(
        screen.queryByTestId('curricular-components-content')
      ).not.toBeInTheDocument();
    });

    it('should render CurricularComponentsContent when activeTab is curricular-components', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="curricular-components"
        />
      );

      expect(
        screen.getByTestId('curricular-components-content')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('knowledge-areas-content')
      ).not.toBeInTheDocument();
    });

    it('should render CompetenciesContent when activeTab is competencies', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="competencies" />
      );

      expect(screen.getByTestId('competencies-content')).toBeInTheDocument();
      expect(
        screen.queryByTestId('knowledge-areas-content')
      ).not.toBeInTheDocument();
    });

    it('should render NationalAveragesContent when activeTab is national-averages', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="national-averages" />
      );

      expect(
        screen.getByTestId('national-averages-content')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('knowledge-areas-content')
      ).not.toBeInTheDocument();
    });
  });

  describe('Data Passing', () => {
    it('should pass correct data to KnowledgeAreasContent', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="knowledge-areas" />
      );

      expect(screen.getByTestId('ka-data-length')).toHaveTextContent('1');
      expect(screen.getByTestId('ka-items-length')).toHaveTextContent('2');
    });

    it('should pass correct data to CurricularComponentsContent', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="curricular-components"
        />
      );

      expect(screen.getByTestId('cc-data-length')).toHaveTextContent('2');
      expect(screen.getByTestId('cc-items-length')).toHaveTextContent('2');
    });

    it('should pass correct data to CompetenciesContent', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="competencies" />
      );

      expect(screen.getByTestId('comp-data-length')).toHaveTextContent('1');
      expect(screen.getByTestId('comp-items-length')).toHaveTextContent('2');
    });

    it('should pass correct data to NationalAveragesContent', () => {
      render(
        <ComparatorTabContent {...defaultProps} activeTab="national-averages" />
      );

      expect(screen.getByTestId('na-data-length')).toHaveTextContent('1');
      expect(screen.getByTestId('na-items-length')).toHaveTextContent('2');
    });
  });

  describe('Custom Labels', () => {
    it('should pass custom knowledgeAreasTitle to KnowledgeAreasContent', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="knowledge-areas"
          labels={{ knowledgeAreasTitle: 'Custom KA Title' }}
        />
      );

      expect(screen.getByTestId('ka-title')).toHaveTextContent(
        'Custom KA Title'
      );
    });

    it('should pass custom curricularComponentsTitle to CurricularComponentsContent', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="curricular-components"
          labels={{ curricularComponentsTitle: 'Custom CC Title' }}
        />
      );

      expect(screen.getByTestId('cc-title')).toHaveTextContent(
        'Custom CC Title'
      );
    });

    it('should pass custom competenciesTitle to CompetenciesContent', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="competencies"
          labels={{ competenciesTitle: 'Custom Comp Title' }}
        />
      );

      expect(screen.getByTestId('comp-title')).toHaveTextContent(
        'Custom Comp Title'
      );
    });

    it('should pass custom nationalAveragesTitle to NationalAveragesContent', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab="national-averages"
          labels={{ nationalAveragesTitle: 'Custom NA Title' }}
        />
      );

      expect(screen.getByTestId('na-title')).toHaveTextContent(
        'Custom NA Title'
      );
    });
  });

  describe('Empty Data', () => {
    it('should handle empty knowledge areas data', () => {
      const emptyData: ComparatorData = {
        ...defaultData,
        knowledgeAreas: [],
      };

      render(
        <ComparatorTabContent
          {...defaultProps}
          data={emptyData}
          activeTab="knowledge-areas"
        />
      );

      expect(screen.getByTestId('ka-data-length')).toHaveTextContent('0');
    });

    it('should handle empty curricular components data', () => {
      const emptyData: ComparatorData = {
        ...defaultData,
        curricularComponents: [],
      };

      render(
        <ComparatorTabContent
          {...defaultProps}
          data={emptyData}
          activeTab="curricular-components"
        />
      );

      expect(screen.getByTestId('cc-data-length')).toHaveTextContent('0');
    });

    it('should handle empty competencies data', () => {
      const emptyData: ComparatorData = {
        ...defaultData,
        competencies: [],
      };

      render(
        <ComparatorTabContent
          {...defaultProps}
          data={emptyData}
          activeTab="competencies"
        />
      );

      expect(screen.getByTestId('comp-data-length')).toHaveTextContent('0');
    });

    it('should handle empty national averages data', () => {
      const emptyData: ComparatorData = {
        ...defaultData,
        nationalAverages: [],
      };

      render(
        <ComparatorTabContent
          {...defaultProps}
          data={emptyData}
          activeTab="national-averages"
        />
      );

      expect(screen.getByTestId('na-data-length')).toHaveTextContent('0');
    });
  });

  describe('Edge Cases', () => {
    it('should return null for unknown tab', () => {
      const { container } = render(
        <ComparatorTabContent
          {...defaultProps}
          activeTab={'unknown-tab' as ComparatorTabType}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle empty selected items', () => {
      render(
        <ComparatorTabContent
          {...defaultProps}
          selectedItems={[]}
          activeTab="knowledge-areas"
        />
      );

      expect(screen.getByTestId('ka-items-length')).toHaveTextContent('0');
    });
  });
});
