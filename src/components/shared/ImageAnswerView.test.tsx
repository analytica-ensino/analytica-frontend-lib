import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageAnswerView } from './ImageAnswerView';

describe('ImageAnswerView', () => {
  const defaultProps = {
    imageUrl: 'https://cdn.example.com/mapa.png',
    correctPoint: { x: 50, y: 30 },
    studentPoint: { x: 52, y: 28 },
    toleranceRadius: 10,
  };

  it('should render the given image', () => {
    render(<ImageAnswerView {...defaultProps} />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/mapa.png'
    );
  });

  it('should place both markers at their own coordinates', () => {
    render(<ImageAnswerView {...defaultProps} />);

    expect(screen.getByTestId('image-correct-area')).toHaveStyle({
      left: '50%',
      top: '30%',
    });
    expect(screen.getByTestId('image-student-point')).toHaveStyle({
      left: '52%',
      top: '28%',
    });
  });

  it('should size the target circle by the tolerance', () => {
    render(<ImageAnswerView {...defaultProps} toleranceRadius={5} />);

    // Diameter is twice the radius, so the drawn circle is the pass mark.
    expect(screen.getByTestId('image-correct-area')).toHaveStyle({
      width: '10%',
    });
  });

  it('should call a click within the tolerance correct', () => {
    render(<ImageAnswerView {...defaultProps} />);

    expect(screen.getByText('Área correta')).toBeInTheDocument();
    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
  });

  it('should call a click outside the tolerance incorrect', () => {
    render(
      <ImageAnswerView {...defaultProps} studentPoint={{ x: 80, y: 80 }} />
    );

    expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
  });

  it('should treat a click exactly on the tolerance as correct', () => {
    // Distance is exactly 10 from (50,30); the backend grades with `<=`.
    render(
      <ImageAnswerView {...defaultProps} studentPoint={{ x: 60, y: 30 }} />
    );

    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
  });

  it('should show no verdict when the student did not answer', () => {
    render(<ImageAnswerView {...defaultProps} studentPoint={null} />);

    expect(screen.getByText('Área correta')).toBeInTheDocument();
    expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('image-student-point')).not.toBeInTheDocument();
  });

  it('should hide the answer key when the question has none', () => {
    render(<ImageAnswerView {...defaultProps} correctPoint={null} />);

    expect(screen.queryByText('Área correta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('image-correct-area')).not.toBeInTheDocument();
    // The student's own click still shows, just without a verdict.
    expect(screen.getByTestId('image-student-point')).toBeInTheDocument();
    expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
  });

  it('should hide correctness while the answer is pending', () => {
    render(<ImageAnswerView {...defaultProps} showCorrectness={false} />);

    expect(screen.queryByTestId('image-correct-area')).not.toBeInTheDocument();
    expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
    expect(screen.getByTestId('image-student-point')).toBeInTheDocument();
  });

  it('should say so when there is no image to show', () => {
    render(<ImageAnswerView {...defaultProps} imageUrl="" />);

    expect(
      screen.getByText('Imagem da questão indisponível')
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  describe('screen reader summary', () => {
    it('should describe both points, the distance and the verdict', () => {
      // dx and dy tie at 2, and the tie falls to the vertical axis.
      const { container } = render(<ImageAnswerView {...defaultProps} />);

      expect(container.querySelector('.sr-only')?.textContent).toBe(
        'Área correta localizada em 50% da esquerda, 30% do topo. Resposta do aluno em 52% da esquerda, 28% do topo. A resposta do aluno está 3% de distância acima da área correta. A resposta está dentro da área de tolerância e é considerada correta.'
      );
    });

    it('should describe a wrong answer as outside the tolerance', () => {
      const { container } = render(
        <ImageAnswerView {...defaultProps} studentPoint={{ x: 50, y: 80 }} />
      );

      expect(container.querySelector('.sr-only')?.textContent).toContain(
        'abaixo da área correta'
      );
      expect(container.querySelector('.sr-only')?.textContent).toContain(
        'fora da área de tolerância'
      );
    });

    it('should describe a leftward answer', () => {
      const { container } = render(
        <ImageAnswerView {...defaultProps} studentPoint={{ x: 10, y: 30 }} />
      );

      expect(container.querySelector('.sr-only')?.textContent).toContain(
        'à esquerda'
      );
    });

    it('should describe an upward answer', () => {
      const { container } = render(
        <ImageAnswerView {...defaultProps} studentPoint={{ x: 50, y: 5 }} />
      );

      expect(container.querySelector('.sr-only')?.textContent).toContain(
        'acima'
      );
    });

    it('should say when nothing was answered', () => {
      const { container } = render(
        <ImageAnswerView {...defaultProps} studentPoint={null} />
      );

      expect(container.querySelector('.sr-only')?.textContent).toBe(
        'Área correta localizada em 50% da esquerda, 30% do topo. Nenhuma resposta do aluno fornecida.'
      );
    });

    it('should describe the click alone when there is no answer key', () => {
      const { container } = render(
        <ImageAnswerView {...defaultProps} correctPoint={null} />
      );

      expect(container.querySelector('.sr-only')?.textContent).toBe(
        'Resposta do aluno em 52% da esquerda, 28% do topo.'
      );
    });

    it('should say nothing was answered when there is neither', () => {
      const { container } = render(
        <ImageAnswerView
          {...defaultProps}
          correctPoint={null}
          studentPoint={null}
        />
      );

      expect(container.querySelector('.sr-only')?.textContent).toBe(
        'Nenhuma resposta do aluno fornecida.'
      );
    });
  });
});
