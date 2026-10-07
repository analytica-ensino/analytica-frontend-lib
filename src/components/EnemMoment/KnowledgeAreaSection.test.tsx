import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KnowledgeAreaSection } from './KnowledgeAreaSection';
import type { EnemMomentQuestionsView } from './types';

// The card itself is `KnowledgePerformanceCard`, tested there with the whole
// behaviour of its select, its bars and its table. What is left here is the
// section: its heading, its states, and that it hands the block over.
const data: EnemMomentQuestionsView = {
  totals: {
    answered: 380,
    correct: 210,
    incorrect: 152,
    blank: 18,
    correctPercentage: 55.3,
    incorrectPercentage: 40,
    blankPercentage: 4.7,
    averageScore: 5.5,
  },
  areas: [
    {
      areaKnowledgeId: 'ch',
      areaKnowledgeName: 'Ciências Humanas e suas Tecnologias',
      answered: 100,
      correct: 30,
      incorrect: 60,
      blank: 10,
      correctPercentage: 30,
      averageScore: 3,
    },
  ],
  subjects: [
    {
      subjectId: 'id-historia',
      subjectName: 'História',
      areaKnowledgeId: 'ch',
      areaKnowledgeName: 'Ciências Humanas e suas Tecnologias',
      color: '#000000',
      icon: 'BookOpen',
      answered: 100,
      correct: 30,
      incorrect: 60,
      blank: 10,
      correctPercentage: 30,
    },
  ],
};

function renderSection(
  overrides: Partial<{
    data: EnemMomentQuestionsView | null;
    loading: boolean;
    error: string | null;
  }> = {}
) {
  return render(
    <KnowledgeAreaSection
      questions={{ data, loading: false, error: null, ...overrides }}
    />
  );
}

describe('KnowledgeAreaSection', () => {
  beforeEach(() => {
    // The table keeps its sort in the URL: start each test from a clean one.
    globalThis.history.replaceState({}, '', '/');
  });

  it('opens with its heading and the "Dados de questões" card', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Desempenho por área de conhecimento',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Dados de questões' })
    ).toBeInTheDocument();
  });

  it('hands the block over to the card', () => {
    renderSection();

    expect(
      Array.from(screen.getByTestId('questions-legend').children)
        .map((card) => card.children[1].textContent)
        .join('|')
    ).toBe('380|210|152|18');
    expect(screen.getByText('História')).toBeInTheDocument();
  });

  it('shows a skeleton while it loads', () => {
    const { container } = renderSection({ data: null, loading: true });

    expect(container.querySelector('.min-h-\\[560px\\]')).toBeInTheDocument();
    expect(screen.queryByText('Dados de questões')).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderSection({ data: null, error: 'Erro ao carregar.' });

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});
