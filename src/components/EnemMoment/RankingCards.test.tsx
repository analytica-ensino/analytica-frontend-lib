import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  EMPTY_RANKING_TEXT,
  EnemMomentRankingCard,
  RANKING_ROWS,
  ScoreBadge,
  UnitStudentRankings,
  type EnemMomentRankedStudent,
} from './RankingCards';
import type { EnemMomentSectionState } from './types';
import type { StudentRankingItem } from '../StudentRanking/StudentRanking';

const student = (
  position: number,
  name: string,
  averageScore: number,
  overrides: Partial<EnemMomentRankedStudent> = {}
): EnemMomentRankedStudent => ({
  userInstitutionId: `id-${name}`,
  position,
  studentName: name,
  classId: 'class-1',
  className: '3ª Série A',
  schoolId: 'school-1',
  schoolName: 'Colégio Estadual',
  city: 'Curitiba',
  participatedExams: 1,
  partialParticipation: false,
  totalElapsedSeconds: 3600,
  answered: 90,
  correct: 60,
  incorrect: 20,
  blank: 10,
  hitRate: 66.7,
  averageScore,
  performance: 'HIGHLIGHT',
  ...overrides,
});

const ready = (
  data: EnemMomentRankedStudent[]
): EnemMomentSectionState<EnemMomentRankedStudent[]> => ({
  data,
  loading: false,
  error: null,
});

/** Name, city and school — how the network's card writes a student. */
const toNetworkItem = (item: EnemMomentRankedStudent): StudentRankingItem => ({
  id: item.userInstitutionId,
  position: item.position,
  name: `${item.studentName} (${item.city}) (${item.schoolName})`,
  percentage: item.hitRate ?? 0,
  badge: <ScoreBadge score={item.averageScore} variant="highlight" />,
});

const four = [
  student(1, 'Ana Maria', 9),
  student(2, 'João Rafael', 8),
  student(3, 'Ana Clara', 7),
  student(4, 'Quarto', 6),
];

function renderCard(
  props: Partial<Parameters<typeof EnemMomentRankingCard>[0]> = {}
) {
  return render(
    <EnemMomentRankingCard
      title="Estudantes em destaque"
      variant="highlight"
      ranking={ready(four)}
      toItem={toNetworkItem}
      headerIcon={<svg data-testid="header-icon" />}
      {...props}
    />
  );
}

describe('ScoreBadge', () => {
  it('prints the score, one decimal, in green on a highlight card', () => {
    render(<ScoreBadge score={9} variant="highlight" />);

    expect(screen.getByText('Nota 9,0')).toHaveClass('text-success-700');
  });

  it('prints the score in red on an attention card', () => {
    render(<ScoreBadge score={2.35} variant="attention" />);

    expect(screen.getByText('Nota 2,4')).toHaveClass('text-error-700');
  });
});

describe('EnemMomentRankingCard', () => {
  it('lists the top three: position, the row the app builds and the score', () => {
    renderCard();

    expect(RANKING_ROWS).toBe(3);
    expect(screen.getByText('Estudantes em destaque')).toBeInTheDocument();
    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
    expect(
      screen.getByText('Ana Maria (Curitiba) (Colégio Estadual)')
    ).toBeInTheDocument();
    expect(screen.getByText('Nota 9,0')).toBeInTheDocument();
    expect(screen.getByText('Posição 3:')).toHaveClass('sr-only');
    expect(screen.queryByText(/Quarto/)).not.toBeInTheDocument();
  });

  it('shades the rows from the strongest green down', () => {
    renderCard();

    const rowOf = (name: string) =>
      screen.getByText(new RegExp(`^${name} `)).parentElement!;
    expect(rowOf('Ana Maria')).toHaveClass('bg-success-200');
    expect(rowOf('João Rafael')).toHaveClass('bg-success-100');
    expect(rowOf('Ana Clara')).toHaveClass('bg-success-background');
  });

  it('hands back the student of the row clicked, by the enrolment it carries', () => {
    const onStudentClick = jest.fn();
    renderCard({ onStudentClick });

    fireEvent.click(
      screen.getByRole('button', { name: /João Rafael \(Curitiba\)/ })
    );

    expect(onStudentClick).toHaveBeenCalledTimes(1);
    expect(onStudentClick).toHaveBeenCalledWith(four[1]);
  });

  it('opens nothing for a row it cannot match to a student', () => {
    const onStudentClick = jest.fn();
    renderCard({
      onStudentClick,
      toItem: (item) => ({ ...toNetworkItem(item), id: undefined }),
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Ana Maria \(Curitiba\)/ })
    );

    expect(onStudentClick).not.toHaveBeenCalled();
  });

  it('leaves the rows alone when there is nowhere to go', () => {
    renderCard();

    expect(screen.queryAllByRole('button')).toEqual([]);
  });

  it('says so when nobody finished', () => {
    renderCard({ ranking: ready([]) });

    expect(screen.getByText(EMPTY_RANKING_TEXT)).toBeInTheDocument();
    expect(EMPTY_RANKING_TEXT).toBe(
      'Nenhum estudante finalizou o simulado neste recorte.'
    );
  });

  it('takes an empty text of its own', () => {
    renderCard({ ranking: ready([]), emptyText: 'Ninguém em dificuldade.' });

    expect(screen.getByText('Ninguém em dificuldade.')).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_RANKING_TEXT)).not.toBeInTheDocument();
  });

  it('treats a ranking the API has not answered yet as empty', () => {
    renderCard({ ranking: { data: null, loading: false, error: null } });

    expect(screen.getByText(EMPTY_RANKING_TEXT)).toBeInTheDocument();
  });

  it('draws the footer under the list', () => {
    renderCard({ footer: <button type="button">Baixar lista</button> });

    expect(
      screen.getByRole('button', { name: 'Baixar lista' })
    ).toBeInTheDocument();
  });

  it('shows a skeleton while it loads', () => {
    const { container } = renderCard({
      ranking: { data: null, loading: true, error: null },
    });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(
      screen.queryByText('Estudantes em destaque')
    ).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderCard({
      ranking: { data: null, loading: false, error: 'Erro ao carregar.' },
    });

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});

describe('UnitStudentRankings', () => {
  const highlights = ready([
    student(1, 'Ana Maria', 9),
    student(2, 'João Rafael', 8),
  ]);
  const struggling = ready([
    student(1, 'Arthur Ribeiro', 0),
    // A student with no hit rate still ranks by the score.
    student(2, 'George Santos', 1, { hitRate: null }),
  ]);

  it('shows the top and the bottom of the cut side by side', () => {
    const { container } = render(
      <UnitStudentRankings highlights={highlights} struggling={struggling} />
    );

    expect(screen.getByText('Estudantes em destaque')).toBeInTheDocument();
    expect(
      screen.getByText('Estudantes com maior dificuldade')
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Maria')).toBeInTheDocument();
    expect(screen.getByText('Arthur Ribeiro')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('lg:grid-cols-2');
  });

  it('names the student alone: the school is the report’s', () => {
    render(
      <UnitStudentRankings highlights={highlights} struggling={struggling} />
    );

    expect(screen.queryByText(/Curitiba/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Colégio Estadual/)).not.toBeInTheDocument();
  });

  it('prints each score in its card’s color, not the hit rate', () => {
    render(
      <UnitStudentRankings highlights={highlights} struggling={struggling} />
    );

    expect(screen.getByText('Nota 9,0')).toHaveClass('text-success-700');
    expect(screen.getByText('Nota 0,0')).toHaveClass('text-error-700');
    expect(screen.getByText('Nota 1,0')).toHaveClass('text-error-700');
    expect(screen.queryByText(/66,7|66.7/)).not.toBeInTheDocument();
  });

  it('says so when nobody of the cut has a score', () => {
    render(
      <UnitStudentRankings highlights={ready([])} struggling={ready([])} />
    );

    expect(screen.getAllByText(EMPTY_RANKING_TEXT)).toHaveLength(2);
  });

  it('hands back the student of the row clicked', () => {
    const onStudentClick = jest.fn();
    render(
      <UnitStudentRankings
        highlights={highlights}
        struggling={struggling}
        onStudentClick={onStudentClick}
      />
    );

    fireEvent.click(screen.getByText('George Santos'));
    expect(onStudentClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ studentName: 'George Santos' })
    );

    fireEvent.click(screen.getByText('Ana Maria'));
    expect(onStudentClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ studentName: 'Ana Maria' })
    );
  });

  it('waits for each card on its own', () => {
    const { container } = render(
      <UnitStudentRankings
        highlights={highlights}
        struggling={{ data: null, loading: true, error: null }}
      />
    );

    expect(screen.getByText('Ana Maria')).toBeInTheDocument();
    // The skeleton keeps the card's height.
    const skeleton = container
      .querySelector('.animate-pulse')!
      .closest('.min-h-\\[254px\\]');
    expect(skeleton).not.toBeNull();
    expect(
      screen.queryByText('Estudantes com maior dificuldade')
    ).not.toBeInTheDocument();
  });
});
