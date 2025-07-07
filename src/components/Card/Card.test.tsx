import { fireEvent, render, screen } from '@testing-library/react';
import {
  CardActivesResults,
  CardForum,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardResults,
  CardSettings,
  CardStatus,
  CardSupport,
  CardTopic,
  CardAudio,
} from './Card';
import { ChartBar, CheckCircle, Gear, Star } from 'phosphor-react';

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

describe('CardResults', () => {
  const baseProps = {
    header: 'Resultado do Teste',
    icon: <CheckCircle data-testid="test-icon" />,
    correct_answers: 3,
    incorrect_answers: 1,
  };

  it('should render with header and answers', () => {
    render(<CardResults {...baseProps} />);
    expect(screen.getByText('Resultado do Teste')).toBeInTheDocument();
    expect(screen.getByText('3 Corretas')).toBeInTheDocument();
    expect(screen.getByText('1 Incorretas')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<CardResults {...baseProps} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should apply column layout by default', () => {
    render(<CardResults {...baseProps} />);
    const container = screen.getByText('Resultado do Teste').closest('div');
    expect(container?.className).toContain('flex-col');
  });

  it('should apply row layout when direction is "row"', () => {
    render(<CardResults {...baseProps} direction="row" />);
    const container = screen.getByText('Resultado do Teste').closest('div');
    expect(container?.className).toContain('flex-row');
  });

  it('should apply custom color as background', () => {
    render(<CardResults {...baseProps} color="#FF0000" />);
    const iconWrapper = screen.getByTestId('test-icon').parentElement;
    expect(iconWrapper).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('should apply custom className', () => {
    render(
      <CardResults
        {...baseProps}
        className="my-custom-class"
        data-testid="card-results"
      />
    );
    const wrapper = screen.getByTestId('card-results');
    expect(wrapper.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardResults {...baseProps} data-testid="custom-attr" />);
    expect(screen.getByTestId('custom-attr')).toBeInTheDocument();
  });
});

describe('CardStatus', () => {
  const baseProps = {
    header: 'Questão 1',
  };

  it('should render with header and "Correta" status', () => {
    render(<CardStatus {...baseProps} status="correct" />);
    expect(screen.getByText('Questão 1')).toBeInTheDocument();
    expect(screen.getByText('Correta')).toBeInTheDocument();
    expect(screen.getByText('Respondida')).toBeInTheDocument();
  });

  it('should render with "Incorreta" status', () => {
    render(<CardStatus {...baseProps} status="incorrect" />);
    expect(screen.getByText('Incorreta')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <CardStatus
        {...baseProps}
        status="correct"
        className="my-custom-class"
        data-testid="card-status"
      />
    );
    const wrapper = screen.getByTestId('card-status');
    expect(wrapper.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(
      <CardStatus {...baseProps} status="correct" data-testid="custom-status" />
    );
    expect(screen.getByTestId('custom-status')).toBeInTheDocument();
  });
});

describe('CardSettings', () => {
  const baseProps = {
    header: 'Configurações',
    icon: <Gear data-testid="icon-gear" />,
  };

  it('should render with icon and header', () => {
    render(<CardSettings {...baseProps} />);
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByTestId('icon-gear')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <CardSettings
        {...baseProps}
        className="my-custom-class"
        data-testid="card-settings"
      />
    );
    const card = screen.getByTestId('card-settings');
    expect(card.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardSettings {...baseProps} data-testid="settings-container" />);
    expect(screen.getByTestId('settings-container')).toBeInTheDocument();
  });
});

describe('CardSupport', () => {
  const baseProps = {
    header: 'Suporte Técnico',
    children: <span data-testid="support-child">Ajuda</span>,
  };

  it('should render with header and children', () => {
    render(<CardSupport {...baseProps} />);
    expect(screen.getByText('Suporte Técnico')).toBeInTheDocument();
    expect(screen.getByTestId('support-child')).toBeInTheDocument();
  });

  it('should default to "col" direction', () => {
    render(<CardSupport {...baseProps} data-testid="card-support" />);
    const container = screen.getByTestId('card-support');
    expect(container).toBeInTheDocument();
    const flexWrapper = container.querySelector('div > div');
    expect(flexWrapper?.className).toMatch(/flex-col/);
  });

  it('should apply "row" direction when specified', () => {
    render(
      <CardSupport {...baseProps} direction="row" data-testid="card-support" />
    );
    const container = screen.getByTestId('card-support');
    const flexWrapper = container.querySelector('div > div');
    expect(flexWrapper?.className).toMatch(/flex-row/);
  });

  it('should apply custom className', () => {
    render(
      <CardSupport
        {...baseProps}
        className="my-custom-class"
        data-testid="card-support"
      />
    );
    const card = screen.getByTestId('card-support');
    expect(card.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardSupport {...baseProps} data-testid="support-container" />);
    expect(screen.getByTestId('support-container')).toBeInTheDocument();
  });
});

describe('CardForum', () => {
  const baseProps = {
    title: 'Título do Fórum',
    content: 'Conteúdo do fórum para testes.',
    comments: 5,
    date: '01/06/2025',
    hour: '14:30',
  };

  it('should render title, content, date, hour and comments', () => {
    render(<CardForum {...baseProps} />);
    expect(screen.getByText('Título do Fórum')).toBeInTheDocument();
    expect(
      screen.getByText('Conteúdo do fórum para testes.')
    ).toBeInTheDocument();
    expect(screen.getByText(/01\/06\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/14:30/)).toBeInTheDocument();
    expect(screen.getByText(/5 respostas/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <CardForum
        {...baseProps}
        className="my-custom-class"
        data-testid="card-forum"
      />
    );
    const card = screen.getByTestId('card-forum');
    expect(card.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardForum {...baseProps} data-testid="forum-container" />);
    expect(screen.getByTestId('forum-container')).toBeInTheDocument();
  });

  it('should call onClickComments with the provided value when clicked', () => {
    const handleCommentsClick = jest.fn();

    render(
      <CardForum
        {...baseProps}
        onClickComments={handleCommentsClick}
        valueComments="commentValue"
      />
    );
    const button = screen.getByRole('button', { name: /ver comentários/i });
    fireEvent.click(button);
    expect(handleCommentsClick).toHaveBeenCalledWith('commentValue');
  });

  it('should call onClickProfile with the provided value when clicked', () => {
    const handleProfileClick = jest.fn();

    render(
      <CardForum
        {...baseProps}
        onClickProfile={handleProfileClick}
        valueProfile="profileValue"
      />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(handleProfileClick).toHaveBeenCalledWith('profileValue');
  });
});

describe('CardAudio', () => {
  it('should render with all audio player elements', () => {
    render(<CardAudio />);

    expect(screen.getAllByText('0:00')).toHaveLength(2);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render with correct default styling classes', () => {
    render(<CardAudio data-testid="card-audio" />);

    const container = screen.getByTestId('card-audio');
    expect(container.className).toContain('w-auto');
    expect(container.className).toContain('h-14');
    expect(container.className).toContain('p-4');
    expect(container.className).toContain('flex');
    expect(container.className).toContain('flex-row');
    expect(container.className).toContain('bg-background');
    expect(container.className).toContain('items-center');
    expect(container.className).toContain('gap-1');
  });

  it('should apply custom className', () => {
    render(<CardAudio className="my-custom-class" data-testid="card-audio" />);

    const container = screen.getByTestId('card-audio');
    expect(container.className).toContain('my-custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardAudio data-testid="audio-container" />);
    expect(screen.getByTestId('audio-container')).toBeInTheDocument();
  });

  it('should render with correct time display styling', () => {
    render(<CardAudio />);

    const timeElements = screen.getAllByText('0:00');
    timeElements.forEach((element) => {
      expect(element.className).toContain('text-text-800');
      expect(element.className).toContain('text-sm');
      expect(element.className).toContain('font-medium');
    });
  });
});
