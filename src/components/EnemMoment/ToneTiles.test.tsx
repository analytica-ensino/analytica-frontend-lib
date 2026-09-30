import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ToneTile,
  answerTiles,
  numberedExamScores,
  scoreText,
} from './ToneTiles';

const moments = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

describe('scoreText', () => {
  it('writes a score with one decimal, pt-BR', () => {
    expect(scoreText(7)).toBe('7,0');
    expect(scoreText(6.45)).toBe('6,5');
  });

  it('marks a score nobody has yet', () => {
    expect(scoreText(null)).toBe('—');
  });
});

describe('numberedExamScores', () => {
  it('numbers each exam by its moment, in the order of the moments', () => {
    expect(
      numberedExamScores(
        // Out of order on purpose: the tiles follow the moments.
        [
          { examId: 'day-2', averageScore: 6.5 },
          { examId: 'day-1', averageScore: null },
        ],
        moments
      )
    ).toEqual([
      { examId: 'day-1', averageScore: null, number: 1 },
      { examId: 'day-2', averageScore: 6.5, number: 2 },
    ]);
  });

  it('numbers an exam the tabs lack 0, ahead of the others', () => {
    expect(
      numberedExamScores(
        [
          { examId: 'day-1', averageScore: 7 },
          { examId: 'other', averageScore: 5 },
        ],
        moments
      ).map((exam) => [exam.examId, exam.number])
    ).toEqual([
      ['other', 0],
      ['day-1', 1],
    ]);
  });

  it('has nothing to number on a Momento tab', () => {
    expect(numberedExamScores([], moments)).toEqual([]);
  });
});

describe('answerTiles', () => {
  it('writes the three answer counts, each in its tone', () => {
    expect(answerTiles({ correct: 1200, incorrect: 700, blank: 100 })).toEqual([
      {
        key: 'correct',
        tone: 'correct',
        label: 'Nº de questões corretas',
        value: '1.200',
      },
      {
        key: 'incorrect',
        tone: 'incorrect',
        label: 'Nº de questões incorretas',
        value: '700',
      },
      {
        key: 'blank',
        tone: 'blank',
        label: 'Nº de questões em branco',
        value: '100',
      },
    ]);
  });
});

describe('ToneTile', () => {
  it.each([
    ['grade', 'star'],
    ['correct', 'medal'],
    ['incorrect', 'seal-warning'],
    ['blank', 'seal-question'],
  ] as const)(
    'draws a %s tile with its label, value and the %s icon',
    (tone, icon) => {
      render(<ToneTile tone={tone} label="Nota média" value="7,0" />);

      expect(screen.getByText('Nota média')).toBeInTheDocument();
      expect(screen.getByText('7,0')).toBeInTheDocument();
      expect(screen.getByTestId(`phosphor-${icon}`)).toHaveAttribute(
        'data-weight',
        'bold'
      );
    }
  );
});
