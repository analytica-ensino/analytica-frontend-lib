import { fireEvent, render, screen } from '@testing-library/react';
import {
  CardActivesResults,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardTopic,
} from './Card';
import { ChartBar, Star } from 'phosphor-react';

describe('CardActivesResults', () => {
  const baseProps = {
    icon: <Star data-testid="icon" />,
    title: 'Título Teste',
    subTitle: 'Subtítulo Teste',
    header: 'Header Teste',
  };

  it('should render with minimal props', () => {
    render(<CardActivesResults {...baseProps} />);
    expect(screen.getByText('Título Teste')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo Teste')).toBeInTheDocument();
    expect(screen.queryByText('Header Teste')).not.toBeInTheDocument();
  });

  it('should render extended content when extended=true', () => {
    render(
      <CardActivesResults
        {...baseProps}
        extended
        description="Descrição teste"
      />
    );
    expect(screen.getByText('Header Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição teste')).toBeInTheDocument();
  });

  it('should render all action variations with correct class', () => {
    const actions: Array<'success' | 'warning' | 'error' | 'info'> = [
      'success',
      'warning',
      'error',
      'info',
    ];

    actions.forEach((action) => {
      const { unmount } = render(
        <CardActivesResults {...baseProps} action={action} />
      );
      const subtitle = screen.getByText('Subtítulo Teste');
      expect(subtitle.className).toContain(`text-${action}-`);
      unmount();
    });
  });

  it('should render icon', () => {
    render(<CardActivesResults {...baseProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should accept and apply custom className', () => {
    render(
      <CardActivesResults
        {...baseProps}
        className="custom-class"
        data-testid="test-class"
      />
    );
    const container = screen.getByTestId('test-class').closest('div');
    expect(container?.className).toContain('custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardActivesResults {...baseProps} data-testid="card-container" />);
    expect(screen.getByTestId('card-container')).toBeInTheDocument();
  });
});

describe('CardQuestions', () => {
  const baseProps = {
    header: 'Questão de Teste',
  };

  it('should render with minimal props and show "Não Realizado" and "Sem nota"', () => {
    render(<CardQuestions {...baseProps} />);
    expect(screen.getByText('Questão de Teste')).toBeInTheDocument();
    expect(screen.getByText('Não Realizado')).toBeInTheDocument();
    expect(screen.getByText('Sem nota')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Responder/i })
    ).toBeInTheDocument();
  });

  it('should render with state="done" and show "Realizado", "Nota", and badge with 00', () => {
    render(<CardQuestions {...baseProps} state="done" />);
    expect(screen.getByText('Realizado')).toBeInTheDocument();
    expect(screen.getByText('Nota')).toBeInTheDocument();
    expect(screen.getByText('00')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Ver Questão/i })
    ).toBeInTheDocument();
  });

  it('should call onClickButton with valueButton when button is clicked', () => {
    const handleClick = jest.fn();

    render(
      <CardQuestions
        {...baseProps}
        state="done"
        onClickButton={handleClick}
        valueButton="123"
      />
    );

    const button = screen.getByRole('button', { name: /Ver Questão/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledWith('123');
  });

  it('should accept and apply custom className', () => {
    render(
      <CardQuestions
        {...baseProps}
        className="custom-class"
        data-testid="card-question"
      />
    );

    const container = screen.getByTestId('card-question');
    expect(container.className).toContain('custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardQuestions {...baseProps} data-testid="card-container" />);
    expect(screen.getByTestId('card-container')).toBeInTheDocument();
  });
});

describe('CardProgress', () => {
  const baseProps = {
    header: 'Progresso do Projeto',
    icon: <ChartBar />,
  };

  it('should render subhead in vertical layout', () => {
    render(
      <CardProgress {...baseProps} direction="vertical" subhead="SubHead" />
    );
    expect(screen.getByText('SubHead')).toBeInTheDocument();
  });

  it('should render horizontal layout with dates and progress bar', () => {
    render(
      <CardProgress
        {...baseProps}
        direction="horizontal"
        initialDate="01 Jan 2025"
        endDate="31 Jan 2025"
        progress={75}
      />
    );

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('01 Jan 2025')).toBeInTheDocument();
    expect(screen.getByText('Fim')).toBeInTheDocument();
    expect(screen.getByText('31 Jan 2025')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render vertical layout with subhead', () => {
    render(
      <CardProgress
        {...baseProps}
        direction="vertical"
        subhead="Este é um subtítulo"
      />
    );

    expect(screen.getByText('Progresso do Projeto')).toBeInTheDocument();
    expect(screen.getByText('Este é um subtítulo')).toBeInTheDocument();
    expect(screen.queryByText('Início')).not.toBeInTheDocument();
  });

  it('should not render dates or progress bar if not provided', () => {
    render(<CardProgress {...baseProps} direction="horizontal" />);
    expect(screen.queryByText('Início')).not.toBeInTheDocument();
  });

  it('should apply custom className and forward props', () => {
    render(
      <CardProgress
        {...baseProps}
        className="custom-class"
        data-testid="card-progress"
      />
    );
    const container = screen.getByTestId('card-progress');
    expect(container).toBeInTheDocument();
    expect(container.className).toContain('custom-class');
  });
});

describe('CardTopic', () => {
  const baseProps = {
    header: 'Tópico de Teste',
    progress: 0,
  };

  it('should render with minimal props and header text', () => {
    render(<CardTopic {...baseProps} />);
    expect(screen.getByText('Tópico de Teste')).toBeInTheDocument();
  });

  it('should render subHead with separators (•)', () => {
    render(
      <CardTopic
        {...baseProps}
        subHead={['Módulo 1', 'Unidade 2', 'Semana 3']}
      />
    );

    expect(screen.getByText('Módulo 1')).toBeInTheDocument();
    expect(screen.getByText('Unidade 2')).toBeInTheDocument();
    expect(screen.getByText('Semana 3')).toBeInTheDocument();
    expect(screen.getAllByText('•')).toHaveLength(2);
  });

  it('should render progress bar and show percentage if enabled', () => {
    render(<CardTopic {...baseProps} progress={75} showPercentage={true} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <CardTopic
        {...baseProps}
        className="my-custom-class"
        data-testid="card-topic"
      />
    );

    const container = screen.getByTestId('card-topic');
    expect(container.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardTopic {...baseProps} data-testid="topic-container" />);
    expect(screen.getByTestId('topic-container')).toBeInTheDocument();
  });
});

describe('CardPerformance', () => {
  const baseProps = {
    header: 'Desempenho de Teste',
  };

  it('should render with header text', () => {
    render(<CardPerformance {...baseProps} />);
    expect(screen.getByText('Desempenho de Teste')).toBeInTheDocument();
  });

  it('should show default description when no progress is provided', () => {
    render(<CardPerformance {...baseProps} />);
    expect(
      screen.getByText(
        'Sem dados ainda! Você ainda não fez um questionário neste assunto.'
      )
    ).toBeInTheDocument();
  });

  it('should render ProgressBar with percentage when progress is given', () => {
    render(<CardPerformance {...baseProps} progress={80} />);
    expect(screen.getByText('80% corretas')).toBeInTheDocument();
  });

  it('should show button "Ver Aula" when progress exists', () => {
    render(<CardPerformance {...baseProps} progress={50} />);
    expect(
      screen.getByRole('button', { name: 'Ver Aula' })
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <CardPerformance
        {...baseProps}
        className="my-custom-class"
        data-testid="card-perf"
      />
    );
    const card = screen.getByTestId('card-perf');
    expect(card.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardPerformance {...baseProps} data-testid="custom-id" />);
    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });

  it('should trigger onClickButton when button is clicked', () => {
    const handleClick = jest.fn();

    render(
      <CardPerformance
        {...baseProps}
        progress={90}
        onClickButton={handleClick}
        valueButton="foo"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver Aula' }));
    expect(handleClick).toHaveBeenCalledWith('foo');
  });

  it('should trigger onClickButton when CaretRight is clicked', () => {
    const handleClick = jest.fn();

    render(
      <CardPerformance
        {...baseProps}
        onClickButton={handleClick}
        valueButton="bar"
      />
    );

    fireEvent.click(screen.getByTestId('caret-icon'));
    expect(handleClick).toHaveBeenCalledWith('bar');
  });
});
