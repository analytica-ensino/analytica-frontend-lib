import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceByDifficulty,
  getDifficultyAccessibleLabel,
} from './PerformanceByDifficulty';

const difficulties = [
  { label: 'Fáceis', spokenLabel: 'fáceis', correct: 28, total: 30 },
  { label: 'Médias', spokenLabel: 'médias', correct: 0, total: 0 },
];

describe('getDifficultyAccessibleLabel', () => {
  it('reads a bar as hits, and an empty one as no question', () => {
    expect(getDifficultyAccessibleLabel('fáceis', 2, 5)).toBe(
      'Questões fáceis: 2 de 5 corretas.'
    );
    expect(getDifficultyAccessibleLabel('médias', 0, 0)).toBe(
      'Questões médias: nenhuma questão.'
    );
  });
});

describe('PerformanceByDifficulty', () => {
  it('draws the ring with the time and the bars it is given', () => {
    render(
      <PerformanceByDifficulty
        percentage={50}
        correct={45}
        total={90}
        timeSpent="3h30"
        circleAccessibleLabel="45 de 90 questões corretas."
        difficulties={difficulties}
      />
    );

    expect(screen.getByText('45 de 90')).toBeInTheDocument();
    expect(screen.getByText('3h30')).toBeInTheDocument();
    expect(
      screen.getByLabelText('45 de 90 questões corretas.')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Questões fáceis: 28 de 30 corretas.')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Questões médias: nenhuma questão.')
    ).toBeInTheDocument();
  });

  it('shows no clock without a time and no bars without difficulties', () => {
    render(
      <PerformanceByDifficulty
        percentage={0}
        correct="--"
        total={10}
        timeSpent={null}
        circleAccessibleLabel="-- de 10 questões corretas."
        difficulties={null}
      />
    );

    expect(screen.getByText('-- de 10')).toBeInTheDocument();
    expect(screen.queryByText('Fáceis')).not.toBeInTheDocument();
    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
  });
});
