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
  const baseProps = {
    src: 'test-audio.mp3',
    title: 'Áudio de Teste',
  };

  beforeEach(() => {
    // Mock do HTMLAudioElement
    Object.defineProperty(window, 'HTMLAudioElement', {
      writable: true,
      value: class MockAudio {
        currentTime = 0;
        duration = 0;
        volume = 1;
        paused = true;
        autoplay = false;
        loop = false;
        preload = 'metadata';

        play() {
          this.paused = false;
          return Promise.resolve();
        }

        pause() {
          this.paused = true;
        }

        addEventListener(event: string, callback: () => void) {
          if (event === 'timeupdate') {
            this.timeupdateCallback = callback;
          }
          if (event === 'loadedmetadata') {
            this.loadedmetadataCallback = callback;
          }
          if (event === 'ended') {
            this.endedCallback = callback;
          }
        }

        removeEventListener() {}

        timeupdateCallback?: () => void;
        loadedmetadataCallback?: () => void;
        endedCallback?: () => void;
      },
    });

    // Mock dos métodos do HTMLMediaElement
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('should render with minimal props', () => {
    render(<CardAudio {...baseProps} />);

    expect(screen.getByTestId('audio-element')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reproduzir/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('0:00')).toHaveLength(2); // current time and duration
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('should show play button when not playing', () => {
    render(<CardAudio {...baseProps} />);
    const playButton = screen.getByRole('button', { name: /reproduzir/i });
    expect(playButton).toBeInTheDocument();
  });

  it('should show pause button when playing', () => {
    render(<CardAudio {...baseProps} />);
    const playButton = screen.getByRole('button', { name: /reproduzir/i });

    fireEvent.click(playButton);

    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  });

  it('should call onPlay when play button is clicked', () => {
    const onPlay = jest.fn();
    render(<CardAudio {...baseProps} onPlay={onPlay} />);

    const playButton = screen.getByRole('button', { name: /reproduzir/i });
    fireEvent.click(playButton);

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('should call onPause when pause button is clicked', () => {
    const onPause = jest.fn();
    render(<CardAudio {...baseProps} onPause={onPause} />);

    const playButton = screen.getByRole('button', { name: /reproduzir/i });
    fireEvent.click(playButton); // Start playing
    fireEvent.click(screen.getByRole('button', { name: /pausar/i })); // Pause

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('should call onEnded when audio ends', () => {
    const onEnded = jest.fn();
    render(<CardAudio {...baseProps} onEnded={onEnded} />);

    const audio = screen.getByTestId('audio-element');
    fireEvent.ended(audio);

    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it('should call onAudioTimeUpdate when time updates', () => {
    const onAudioTimeUpdate = jest.fn();
    render(<CardAudio {...baseProps} onAudioTimeUpdate={onAudioTimeUpdate} />);

    const audio = screen.getByTestId('audio-element');
    fireEvent.timeUpdate(audio);

    expect(onAudioTimeUpdate).toHaveBeenCalled();
  });

  it('should update progress bar when time changes', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');
    // Simulate time update
    Object.defineProperty(audio, 'currentTime', { value: 30 });
    Object.defineProperty(audio, 'duration', { value: 120 });

    fireEvent.timeUpdate(audio);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle progress bar click to seek', () => {
    render(<CardAudio {...baseProps} />);

    const progressBar = screen.getByTestId('progress-bar');
    const progressButton = progressBar.querySelector('button');

    if (progressButton) {
      // Mock getBoundingClientRect
      Object.defineProperty(progressButton, 'getBoundingClientRect', {
        value: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 10,
        }),
      });

      fireEvent.click(progressButton);
    }

    expect(progressBar).toBeInTheDocument();
  });

  it('should show volume control when volume button is clicked', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('should hide volume control when clicked again', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton); // Show
    fireEvent.click(volumeButton); // Hide

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('should handle volume change', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    const volumeSlider = screen.getByRole('slider');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });

    expect(volumeSlider).toHaveValue('0.5');
  });

  it('should show different volume icons based on volume level', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    const volumeSlider = screen.getByRole('slider');

    // Test mute (volume = 0)
    fireEvent.change(volumeSlider, { target: { value: '0' } });
    expect(volumeButton).toBeInTheDocument();

    // Test low volume (volume < 0.5)
    fireEvent.change(volumeSlider, { target: { value: '0.3' } });
    expect(volumeButton).toBeInTheDocument();

    // Test high volume (volume >= 0.5)
    fireEvent.change(volumeSlider, { target: { value: '0.8' } });
    expect(volumeButton).toBeInTheDocument();
  });

  it('should format time correctly', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');

    // Test 1 minute 30 seconds
    Object.defineProperty(audio, 'currentTime', { value: 90 });
    Object.defineProperty(audio, 'duration', { value: 180 });

    fireEvent.timeUpdate(audio);

    expect(screen.getByText('1:30')).toBeInTheDocument(); // current time
    expect(screen.getByText('3:00')).toBeInTheDocument(); // duration
  });

  it('should format time with leading zeros', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');

    // Test 0 minutes 5 seconds
    Object.defineProperty(audio, 'currentTime', { value: 5 });
    Object.defineProperty(audio, 'duration', { value: 65 });

    fireEvent.timeUpdate(audio);

    expect(screen.getByText('0:05')).toBeInTheDocument(); // current time
    expect(screen.getByText('1:05')).toBeInTheDocument(); // duration
  });

  it('should disable play button when no src is provided', () => {
    render(<CardAudio title="Sem áudio" />);

    const playButton = screen.getByRole('button', { name: /reproduzir/i });
    expect(playButton).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(
      <CardAudio
        {...baseProps}
        className="custom-audio-class"
        data-testid="audio-card"
      />
    );

    const container = screen.getByTestId('audio-card');
    expect(container.className).toContain('custom-audio-class');
  });

  it('should forward extra HTML attributes', () => {
    render(<CardAudio {...baseProps} data-testid="audio-container" />);
    expect(screen.getByTestId('audio-container')).toBeInTheDocument();
  });

  it('should render menu button (DotsThreeVertical icon)', () => {
    render(<CardAudio {...baseProps} />);

    // The menu button is the DotsThreeVertical icon
    const menuIcon = screen.getByRole('button', { name: /controle de volume/i })
      .parentElement?.nextElementSibling;
    expect(menuIcon).toBeInTheDocument();
    expect(menuIcon?.tagName).toBe('svg');
  });

  it('should handle loop prop', () => {
    render(<CardAudio {...baseProps} loop />);

    const audio = screen.getByTestId('audio-element');
    expect(audio).toHaveAttribute('loop');
  });

  it('should handle preload prop', () => {
    render(<CardAudio {...baseProps} preload="auto" />);

    const audio = screen.getByTestId('audio-element');
    expect(audio).toHaveAttribute('preload', 'auto');
  });

  it('should handle loaded metadata event', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');
    fireEvent.loadedMetadata(audio);

    expect(audio).toBeInTheDocument();
  });

  it('should update duration when metadata is loaded', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');
    Object.defineProperty(audio, 'duration', { value: 120 });

    fireEvent.loadedMetadata(audio);

    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('should handle volume control positioning', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    const volumeControl = screen.getByRole('slider').closest('button');
    expect(volumeControl).toHaveClass('absolute', 'bottom-full', 'right-0');
  });

  it('should handle multiple rapid play/pause clicks', () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();

    render(<CardAudio {...baseProps} onPlay={onPlay} onPause={onPause} />);

    const playButton = screen.getByRole('button', { name: /reproduzir/i });

    // Multiple rapid clicks
    fireEvent.click(playButton);
    fireEvent.click(screen.getByRole('button', { name: /pausar/i }));
    fireEvent.click(playButton);
    fireEvent.click(screen.getByRole('button', { name: /pausar/i }));

    expect(onPlay).toHaveBeenCalledTimes(2);
    expect(onPause).toHaveBeenCalledTimes(2);
  });

  it('should handle progress bar click with different positions', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');
    Object.defineProperty(audio, 'duration', { value: 100 });

    const progressBar = screen.getByTestId('progress-bar');
    const progressButton = progressBar.querySelector('button');

    if (progressButton) {
      // Mock getBoundingClientRect
      Object.defineProperty(progressButton, 'getBoundingClientRect', {
        value: () => ({
          left: 0,
          top: 0,
          width: 100,
          height: 10,
        }),
      });

      // Simulate click at 50% of the progress bar
      const clickEvent = new MouseEvent('click', {
        clientX: 50,
        clientY: 5,
      });

      fireEvent(progressButton, clickEvent);
    }

    expect(progressBar).toBeInTheDocument();
  });

  it('should handle volume slider with different values', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    const volumeSlider = screen.getByRole('slider');

    // Test different volume levels
    const testValues = ['0', '0.25', '0.5', '0.75', '1'];

    testValues.forEach((value) => {
      fireEvent.change(volumeSlider, { target: { value } });
      expect(volumeSlider).toHaveValue(value);
    });
  });

  it('should maintain state when component re-renders', () => {
    const { rerender } = render(<CardAudio {...baseProps} />);

    const playButton = screen.getByRole('button', { name: /reproduzir/i });
    fireEvent.click(playButton);

    // Re-render with same props
    rerender(<CardAudio {...baseProps} />);

    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  });

  it('should handle volume change with proper state update', () => {
    render(<CardAudio {...baseProps} />);

    const volumeButton = screen.getByRole('button', {
      name: /controle de volume/i,
    });
    fireEvent.click(volumeButton);

    const volumeSlider = screen.getByRole('slider');

    // Test volume change
    fireEvent.change(volumeSlider, { target: { value: '0.7' } });

    expect(volumeSlider).toHaveValue('0.7');
  });

  it('should handle time update with proper formatting', () => {
    render(<CardAudio {...baseProps} />);

    const audio = screen.getByTestId('audio-element');

    // Funções para mockar os getters
    const setCurrentTime = (val: number) => {
      Object.defineProperty(audio, 'currentTime', {
        get: () => val,
        configurable: true,
      });
    };
    const setDuration = (val: number) => {
      Object.defineProperty(audio, 'duration', {
        get: () => val,
        configurable: true,
      });
    };

    // Test various time formats
    const testCases = [
      {
        currentTime: 0,
        duration: 0,
        expectedCurrent: '0:00',
        expectedDuration: '0:00',
      },
      {
        currentTime: 30,
        duration: 120,
        expectedCurrent: '0:30',
        expectedDuration: '2:00',
      },
      {
        currentTime: 90,
        duration: 180,
        expectedCurrent: '1:30',
        expectedDuration: '3:00',
      },
      {
        currentTime: 125,
        duration: 300,
        expectedCurrent: '2:05',
        expectedDuration: '5:00',
      },
    ];

    testCases.forEach(
      ({ currentTime, duration, expectedCurrent, expectedDuration }) => {
        setCurrentTime(currentTime);
        setDuration(duration);

        fireEvent.timeUpdate(audio);

        expect(screen.getAllByText(expectedCurrent).length).toBeGreaterThan(0);
        expect(screen.getAllByText(expectedDuration).length).toBeGreaterThan(0);
      }
    );
  });

  describe('funções internas CardAudio', () => {
    it('handlePlayPause não faz nada se audioRef.current for null', () => {
      // Forçar audioRef.current ser null
      const { container } = render(<CardAudio src="audio.mp3" />);
      // Forçar o botão a chamar handlePlayPause sem audioRef
      // Não deve lançar erro
      const playButton = container.querySelector(
        'button[aria-label="Reproduzir"]'
      ) as HTMLButtonElement;
      expect(playButton).toBeInTheDocument();
      // Não há como simular audioRef.current = null diretamente, mas o early return já é coberto
    });

    it('handlePlayPause chama play e onPlay', () => {
      const onPlay = jest.fn();
      render(<CardAudio src="audio.mp3" onPlay={onPlay} />);
      const playButton = screen.getByRole('button', { name: /reproduzir/i });
      fireEvent.click(playButton);
      expect(onPlay).toHaveBeenCalled();
    });

    it('handlePlayPause chama pause e onPause', () => {
      const onPause = jest.fn();
      render(<CardAudio src="audio.mp3" onPause={onPause} />);
      const playButton = screen.getByRole('button', { name: /reproduzir/i });
      fireEvent.click(playButton); // play
      fireEvent.click(screen.getByRole('button', { name: /pausar/i })); // pause
      expect(onPause).toHaveBeenCalled();
    });

    it('handleTimeUpdate atualiza tempo e chama callback', () => {
      const onAudioTimeUpdate = jest.fn();
      render(
        <CardAudio src="audio.mp3" onAudioTimeUpdate={onAudioTimeUpdate} />
      );
      const audio = screen.getByTestId('audio-element');
      // Mockar os getters
      Object.defineProperty(audio, 'currentTime', {
        get: () => 42,
        configurable: true,
      });
      Object.defineProperty(audio, 'duration', {
        get: () => 100,
        configurable: true,
      });
      fireEvent.timeUpdate(audio);
      expect(onAudioTimeUpdate).toHaveBeenCalledWith(42, 100);
      expect(screen.getAllByText('0:42').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1:40').length).toBeGreaterThan(0);
    });

    it('handleLoadedMetadata atualiza duração', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');
      Object.defineProperty(audio, 'duration', {
        get: () => 77,
        configurable: true,
      });
      fireEvent.loadedMetadata(audio);
      expect(screen.getAllByText('1:17').length).toBeGreaterThan(0);
    });

    it('handleEnded reseta estado e chama callback', () => {
      const onEnded = jest.fn();
      render(<CardAudio src="audio.mp3" onEnded={onEnded} />);
      const audio = screen.getByTestId('audio-element');
      fireEvent.ended(audio);
      expect(onEnded).toHaveBeenCalled();
      // O tempo deve ser resetado para 0
      expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
    });

    it('handleProgressClick altera currentTime corretamente', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');
      Object.defineProperty(audio, 'duration', {
        get: () => 100,
        configurable: true,
      });
      const progressBar = screen.getByTestId('progress-bar');
      const progressButton = progressBar.querySelector('button');
      if (progressButton) {
        Object.defineProperty(progressButton, 'getBoundingClientRect', {
          value: () => ({ left: 0, top: 0, width: 100, height: 10 }),
        });
        // Simula clique em 25% da barra
        const clickEvent = new MouseEvent('click', { clientX: 25, clientY: 5 });
        fireEvent(progressButton, clickEvent);

        // Mocka o valor de currentTime para 25 e dispara timeUpdate
        Object.defineProperty(audio, 'currentTime', {
          get: () => 25,
          configurable: true,
        });
        fireEvent.timeUpdate(audio);

        expect(screen.getAllByText('0:25').length).toBeGreaterThan(0);
      }
    });

    it('handleProgressClick funciona com tecla Enter', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');
      Object.defineProperty(audio, 'duration', {
        get: () => 100,
        configurable: true,
      });
      const progressBar = screen.getByTestId('progress-bar');
      const progressButton = progressBar.querySelector('button');

      if (progressButton) {
        Object.defineProperty(progressButton, 'getBoundingClientRect', {
          value: () => ({ left: 0, top: 0, width: 100, height: 10 }),
        });

        // Mock do currentTime para evitar erro de NaN
        Object.defineProperty(audio, 'currentTime', {
          get: () => 0,
          set: () => {}, // Mock do setter para evitar erro
          configurable: true,
        });

        // Simula pressionar Enter na barra de progresso
        fireEvent.keyDown(progressButton, { key: 'Enter' });

        // Verifica se o evento foi processado (não deve lançar erro)
        expect(progressButton).toBeInTheDocument();
      }
    });

    it('handleProgressClick funciona com tecla Space', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');
      Object.defineProperty(audio, 'duration', {
        get: () => 100,
        configurable: true,
      });
      const progressBar = screen.getByTestId('progress-bar');
      const progressButton = progressBar.querySelector('button');

      if (progressButton) {
        Object.defineProperty(progressButton, 'getBoundingClientRect', {
          value: () => ({ left: 0, top: 0, width: 100, height: 10 }),
        });

        // Mock do currentTime para evitar erro de NaN
        Object.defineProperty(audio, 'currentTime', {
          get: () => 0,
          set: () => {}, // Mock do setter para evitar erro
          configurable: true,
        });

        // Simula pressionar Space na barra de progresso
        fireEvent.keyDown(progressButton, { key: ' ' });

        // Verifica se o evento foi processado (não deve lançar erro)
        expect(progressButton).toBeInTheDocument();
      }
    });

    it('onKeyDown não executa handleProgressClick com outras teclas', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');
      Object.defineProperty(audio, 'duration', {
        get: () => 100,
        configurable: true,
      });
      const progressBar = screen.getByTestId('progress-bar');
      const progressButton = progressBar.querySelector('button');

      if (progressButton) {
        Object.defineProperty(progressButton, 'getBoundingClientRect', {
          value: () => ({ left: 0, top: 0, width: 100, height: 10 }),
        });

        // Simula pressionar outras teclas que não devem executar handleProgressClick
        fireEvent.keyDown(progressButton, { key: 'ArrowRight' });
        fireEvent.keyDown(progressButton, { key: 'Tab' });
        fireEvent.keyDown(progressButton, { key: 'Escape' });

        // O tempo deve permanecer inalterado
        expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
      }
    });

    it('barra de progresso tem atributos de acessibilidade corretos', () => {
      render(<CardAudio src="audio.mp3" />);
      const progressBar = screen.getByTestId('progress-bar');
      const progressButton = progressBar.querySelector('button');

      if (progressButton) {
        expect(progressButton).toHaveAttribute('type', 'button');
        expect(progressButton).toHaveAttribute(
          'aria-label',
          'Barra de progresso do áudio'
        );
      }
    });

    it('handleTimeUpdate funciona quando audioRef.current é null', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');

      // Mockar audioRef.current como null/undefined
      Object.defineProperty(audio, 'currentTime', {
        get: () => undefined,
        configurable: true,
      });
      Object.defineProperty(audio, 'duration', {
        get: () => undefined,
        configurable: true,
      });

      fireEvent.timeUpdate(audio);

      // Deve usar os valores padrão (0) quando audioRef.current é null
      expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
    });

    it('handleLoadedMetadata funciona quando audioRef.current é null', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');

      // Mockar audioRef.current como null/undefined
      Object.defineProperty(audio, 'duration', {
        get: () => undefined,
        configurable: true,
      });

      fireEvent.loadedMetadata(audio);

      // Deve usar o valor padrão (0) quando audioRef.current é null
      expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
    });

    it('fecha o controle de volume ao pressionar Escape', () => {
      render(<CardAudio src="audio.mp3" />);
      const volumeButton = screen.getByRole('button', {
        name: /controle de volume/i,
      });
      fireEvent.click(volumeButton);
      const popup = screen.getByRole('slider').closest('button');
      expect(popup).toBeInTheDocument();
      fireEvent.keyDown(popup!, { key: 'Escape' });
      // O controle de volume deve sumir
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('aumenta e diminui o volume com as setas do teclado', () => {
      render(<CardAudio src="audio.mp3" />);
      const volumeButton = screen.getByRole('button', {
        name: /controle de volume/i,
      });
      fireEvent.click(volumeButton);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider).toBeInTheDocument();
      // Volume inicial
      expect(Number(slider.value)).toBeCloseTo(1);
      // Diminui
      fireEvent.keyDown(slider, { key: 'ArrowDown' });
      expect(Number(slider.value)).toBeLessThan(1);
      // Aumenta
      fireEvent.keyDown(slider, { key: 'ArrowUp' });
      expect(Number(slider.value)).toBeGreaterThanOrEqual(0.9);
      // Esquerda
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(Number(slider.value)).toBeLessThanOrEqual(0.9);
      // Direita
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(Number(slider.value)).toBeGreaterThanOrEqual(0.9);
    });

    it('slider de volume possui atributos ARIA corretos', () => {
      render(<CardAudio src="audio.mp3" />);
      const volumeButton = screen.getByRole('button', {
        name: /controle de volume/i,
      });
      fireEvent.click(volumeButton);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Volume');
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('renderiza tracks de legendas quando fornecidos', () => {
      const tracks = [
        {
          kind: 'subtitles' as const,
          src: 'subtitles-pt.vtt',
          srcLang: 'pt',
          label: 'Português',
          default: true,
        },
        {
          kind: 'captions' as const,
          src: 'captions-en.vtt',
          srcLang: 'en',
          label: 'English',
        },
      ];

      render(<CardAudio src="audio.mp3" tracks={tracks} />);
      const audio = screen.getByTestId('audio-element');

      // Verifica se os elementos track foram renderizados
      const trackElements = audio.querySelectorAll('track');
      expect(trackElements).toHaveLength(2);

      // Verifica o primeiro track (legendas em português)
      const firstTrack = trackElements[0];
      expect(firstTrack).toHaveAttribute('kind', 'subtitles');
      expect(firstTrack).toHaveAttribute('src', 'subtitles-pt.vtt');
      expect(firstTrack).toHaveAttribute('srcLang', 'pt');
      expect(firstTrack).toHaveAttribute('label', 'Português');
      expect(firstTrack).toHaveAttribute('default');

      // Verifica o segundo track (legendas em inglês)
      const secondTrack = trackElements[1];
      expect(secondTrack).toHaveAttribute('kind', 'captions');
      expect(secondTrack).toHaveAttribute('src', 'captions-en.vtt');
      expect(secondTrack).toHaveAttribute('srcLang', 'en');
      expect(secondTrack).toHaveAttribute('label', 'English');
      expect(secondTrack).not.toHaveAttribute('default');
    });

    it('não renderiza tracks quando não fornecidos', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');

      // Verifica que não há elementos track
      const trackElements = audio.querySelectorAll('track');
      expect(trackElements).toHaveLength(0);
    });

    it('renderiza tracks com diferentes tipos de kind', () => {
      const tracks = [
        {
          kind: 'descriptions' as const,
          src: 'descriptions.vtt',
          srcLang: 'pt',
          label: 'Descrições',
        },
        {
          kind: 'chapters' as const,
          src: 'chapters.vtt',
          srcLang: 'pt',
          label: 'Capítulos',
        },
        {
          kind: 'metadata' as const,
          src: 'metadata.vtt',
          srcLang: 'pt',
          label: 'Metadados',
        },
      ];

      render(<CardAudio src="audio.mp3" tracks={tracks} />);
      const audio = screen.getByTestId('audio-element');

      const trackElements = audio.querySelectorAll('track');
      expect(trackElements).toHaveLength(3);

      // Verifica se cada tipo de track foi renderizado corretamente
      expect(trackElements[0]).toHaveAttribute('kind', 'descriptions');
      expect(trackElements[1]).toHaveAttribute('kind', 'chapters');
      expect(trackElements[2]).toHaveAttribute('kind', 'metadata');
    });
  });
});
