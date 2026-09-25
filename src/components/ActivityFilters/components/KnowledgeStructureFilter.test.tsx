import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import type { CategoryConfig } from '../../..';
import type { KnowledgeStructureState } from '../../../types/activityFilters';

jest.mock('../../..', () => ({
  Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  CheckboxGroup: ({ showDivider }: { showDivider?: boolean }) => (
    <div data-testid="checkbox-group" data-show-divider={String(showDivider)} />
  ),
}));

// Import after mocks
import { KnowledgeStructureFilter } from './KnowledgeStructureFilter';

describe('KnowledgeStructureFilter', () => {
  const knowledgeStructure: KnowledgeStructureState = {
    topics: [{ id: 't1', name: 'Tema 1' }],
    subtopics: [],
    contents: [],
    loading: false,
    error: null,
  };
  const knowledgeCategories = [
    { key: 'tema', label: 'Tema', itens: [], selectedIds: [] },
  ] as unknown as CategoryConfig[];

  it('shows dividers between rows by default', () => {
    render(
      <KnowledgeStructureFilter
        knowledgeStructure={knowledgeStructure}
        knowledgeCategories={knowledgeCategories}
        handleCategoriesChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('checkbox-group')).toHaveAttribute(
      'data-show-divider',
      'true'
    );
  });

  it('forwards showDivider={false} to the checkbox group', () => {
    render(
      <KnowledgeStructureFilter
        knowledgeStructure={knowledgeStructure}
        knowledgeCategories={knowledgeCategories}
        handleCategoriesChange={jest.fn()}
        showDivider={false}
      />
    );

    expect(screen.getByTestId('checkbox-group')).toHaveAttribute(
      'data-show-divider',
      'false'
    );
  });

  it('shows loading, error and empty messages', () => {
    const { rerender } = render(
      <KnowledgeStructureFilter
        knowledgeStructure={{ ...knowledgeStructure, loading: true }}
        knowledgeCategories={[]}
      />
    );
    expect(
      screen.getByText('Carregando estrutura de conhecimento...')
    ).toBeInTheDocument();

    rerender(
      <KnowledgeStructureFilter
        knowledgeStructure={{
          ...knowledgeStructure,
          topics: [],
          error: 'Falhou',
        }}
        knowledgeCategories={[]}
      />
    );
    expect(screen.getByText('Falhou')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhum tema disponível para os componentes curriculares selecionados'
      )
    ).toBeInTheDocument();
  });
});
