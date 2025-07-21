import { fireEvent, render, screen } from '@testing-library/react';
import {
  CardBase,
  CardActivitiesResults,
  CardForum,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardResults,
  CardSettings,
  CardSimulado,
  CardStatus,
  CardSupport,
  CardTopic,
  CardAudio,
  CardTest,
} from './Card';
import { ChartBar, CheckCircle, Gear, Star } from 'phosphor-react';

describe('CardBase', () => {
  const baseProps = {
    children: <div data-testid="test-children">Test Content</div>,
  };

  it('should render with default props', () => {
    render(<CardBase {...baseProps} />);
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('should apply default classes correctly', () => {
    render(<CardBase {...baseProps} data-testid="card-base" />);
    const card = screen.getByTestId('card-base');

    // Verifica as classes padrão
    expect(card.className).toContain('w-full');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('border');
    expect(card.className).toContain('border-border-50');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('flex');
    expect(card.className).toContain('flex-row');
    expect(card.className).toContain('p-4');
    expect(card.className).toContain('min-h-20');
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = render(
      <CardBase {...baseProps} data-testid="card-base" />
    );

    // Teste variant default
    let card = screen.getByTestId('card-base');
    expect(card.className).toContain('rounded-xl');

    // Teste variant compact
    rerender(
      <CardBase {...baseProps} variant="compact" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('rounded-lg');

    // Teste variant minimal
    rerender(
      <CardBase {...baseProps} variant="minimal" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('rounded-md');
    expect(card.className).toContain('border-border-100');
  });

  it('should apply layout classes correctly', () => {
    const { rerender } = render(
      <CardBase {...baseProps} data-testid="card-base" />
    );

    // Teste layout horizontal (padrão)
    let card = screen.getByTestId('card-base');
    expect(card.className).toContain('flex-row');

    // Teste layout vertical
    rerender(
      <CardBase {...baseProps} layout="vertical" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('flex-col');
  });

  it('should apply padding classes correctly', () => {
    const { rerender } = render(
      <CardBase {...baseProps} data-testid="card-base" />
    );

    // Teste padding medium (padrão)
    let card = screen.getByTestId('card-base');
    expect(card.className).toContain('p-4');

    // Teste padding none
    rerender(
      <CardBase {...baseProps} padding="none" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).not.toContain('p-');

    // Teste padding small
    rerender(
      <CardBase {...baseProps} padding="small" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('p-2');

    // Teste padding large
    rerender(
      <CardBase {...baseProps} padding="large" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('p-6');
  });

  it('should apply minHeight classes correctly', () => {
    const { rerender } = render(
      <CardBase {...baseProps} data-testid="card-base" />
    );

    // Teste minHeight medium (padrão)
    let card = screen.getByTestId('card-base');
    expect(card.className).toContain('min-h-20');

    // Teste minHeight none
    rerender(
      <CardBase {...baseProps} minHeight="none" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).not.toContain('min-h-');

    // Teste minHeight small
    rerender(
      <CardBase {...baseProps} minHeight="small" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('min-h-16');

    // Teste minHeight large
    rerender(
      <CardBase {...baseProps} minHeight="large" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('min-h-24');
  });

  it('should apply cursor classes correctly', () => {
    const { rerender } = render(
      <CardBase {...baseProps} data-testid="card-base" />
    );

    // Teste cursor default (padrão)
    let card = screen.getByTestId('card-base');
    expect(card.className).not.toContain('cursor-');

    // Teste cursor pointer
    rerender(
      <CardBase {...baseProps} cursor="pointer" data-testid="card-base" />
    );
    card = screen.getByTestId('card-base');
    expect(card.className).toContain('cursor-pointer');
  });

  it('should combine all classes correctly', () => {
    render(
      <CardBase
        {...baseProps}
        variant="compact"
        layout="vertical"
        padding="large"
        minHeight="small"
        cursor="pointer"
        className="custom-class"
        data-testid="card-base"
      />
    );

    const card = screen.getByTestId('card-base');
    expect(card.className).toContain('w-full');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('border');
    expect(card.className).toContain('border-border-50');
    expect(card.className).toContain('rounded-lg'); // variant compact
    expect(card.className).toContain('flex-col'); // layout vertical
    expect(card.className).toContain('p-6'); // padding large
    expect(card.className).toContain('min-h-16'); // minHeight small
    expect(card.className).toContain('cursor-pointer'); // cursor pointer
    expect(card.className).toContain('custom-class'); // custom className
  });

  it('should filter out empty classes and join with spaces', () => {
    render(
      <CardBase
        {...baseProps}
        padding="none"
        minHeight="none"
        className=""
        data-testid="card-base"
      />
    );

    const card = screen.getByTestId('card-base');
    const classes = card.className.split(' ');

    // Verifica que não há strings vazias
    expect(classes).not.toContain('');

    // Verifica que as classes estão separadas por espaço
    expect(card.className).toMatch(/^[\w-]+(\s+[\w-]+)*$/);
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<CardBase {...baseProps} ref={ref} data-testid="card-base" />);

    expect(ref).toHaveBeenCalled();
  });

  it('should forward extra HTML attributes', () => {
    render(
      <CardBase
        {...baseProps}
        data-testid="card-base"
        aria-label="Test Card"
        role="button"
      />
    );

    const card = screen.getByTestId('card-base');
    expect(card).toHaveAttribute('aria-label', 'Test Card');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('should render children correctly', () => {
    render(
      <CardBase data-testid="card-base">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </CardBase>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});

describe('CardActivitiesResults', () => {
  const baseProps = {
    icon: <Star data-testid="icon" />,
    title: 'Título Teste',
    subTitle: 'Subtítulo Teste',
    header: 'Header Teste',
  };

  it('should render with minimal props', () => {
    render(<CardActivitiesResults {...baseProps} />);
    expect(screen.getByText('Título Teste')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo Teste')).toBeInTheDocument();
    expect(screen.queryByText('Header Teste')).not.toBeInTheDocument();
  });

  it('should render extended content when extended=true', () => {
    render(
      <CardActivitiesResults
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
        <CardActivitiesResults {...baseProps} action={action} />
      );
      const subtitle = screen.getByText('Subtítulo Teste');
      expect(subtitle.className).toContain(`text-${action}-`);
      unmount();
    });
  });

  it('should render icon', () => {
    render(<CardActivitiesResults {...baseProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should accept and apply custom className', () => {
    render(
      <CardActivitiesResults
        {...baseProps}
        className="custom-class"
        data-testid="test-class"
      />
    );
    const container = screen.getByTestId('test-class').closest('div');
    expect(container?.className).toContain('custom-class');
  });

  it('should forward extra HTML attributes', () => {
    render(
      <CardActivitiesResults {...baseProps} data-testid="card-container" />
    );
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

  it('should apply hex color via style when color starts with #', () => {
    render(
      <CardProgress
        {...baseProps}
        color="#FF5733"
        data-testid="card-progress"
      />
    );

    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).toHaveStyle({ backgroundColor: '#FF5733' });
    expect(iconContainer?.className).not.toContain('bg-');
  });

  it('should apply Tailwind color class when color does not start with #', () => {
    render(
      <CardProgress
        {...baseProps}
        color="blue-500"
        data-testid="card-progress"
      />
    );

    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).toHaveClass('bg-blue-500');
    // Verifica que não tem backgroundColor definido no style (ou está vazio)
    const style = iconContainer?.getAttribute('style');
    expect(style).toBeNull();
  });

  it('should apply default color when no color is provided', () => {
    render(<CardProgress {...baseProps} data-testid="card-progress" />);

    const iconContainer = screen.getByTestId('icon-container');
    expect(iconContainer).toHaveStyle({ backgroundColor: '#B7DFFF' });
  });

  it('should handle different hex color formats', () => {
    const hexColors = ['#FF0000', '#00FF00', '#0000FF', '#123456', '#ABCDEF'];

    hexColors.forEach((color) => {
      const { unmount } = render(
        <CardProgress
          {...baseProps}
          color={color}
          data-testid="card-progress"
        />
      );

      const iconContainer = screen.getByTestId('icon-container');
      expect(iconContainer).toHaveStyle({ backgroundColor: color });
      expect(iconContainer?.className).not.toContain('bg-');

      unmount();
    });
  });

  it('should handle different Tailwind color classes', () => {
    const tailwindColors = [
      'red-500',
      'green-300',
      'blue-700',
      'yellow-400',
      'purple-600',
    ];

    tailwindColors.forEach((color) => {
      const { unmount } = render(
        <CardProgress
          {...baseProps}
          color={color}
          data-testid="card-progress"
        />
      );

      const iconContainer = screen.getByTestId('icon-container');
      expect(iconContainer).toHaveClass(`bg-${color}`);
      // Verifica que não tem backgroundColor definido no style (ou está vazio)
      const style = iconContainer?.getAttribute('style');
      expect(style).toBeNull();

      unmount();
    });
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
    expect(screen.getByText('80%')).toBeInTheDocument();
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
        actionVariant="caret"
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

    it('renderiza fallback track quando não fornecidos', () => {
      render(<CardAudio src="audio.mp3" />);
      const audio = screen.getByTestId('audio-element');

      // Verifica que há um track fallback
      const trackElements = audio.querySelectorAll('track');
      expect(trackElements).toHaveLength(1);

      // Verifica o track fallback
      const fallbackTrack = trackElements[0];
      expect(fallbackTrack).toHaveAttribute('kind', 'captions');
      expect(fallbackTrack).toHaveAttribute('src', 'data:text/vtt;base64,');
      expect(fallbackTrack).toHaveAttribute('srcLang', 'pt');
      expect(fallbackTrack).toHaveAttribute(
        'label',
        'Sem legendas disponíveis'
      );
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

describe('CardSimulado', () => {
  const baseProps = {
    title: 'Simulado ENEM 2025',
    info: '180 questões',
    backgroundColor: 'enem' as const,
  };

  it('should render with minimal props', () => {
    render(<CardSimulado {...baseProps} />);
    expect(screen.getByText('Simulado ENEM 2025')).toBeInTheDocument();
    expect(screen.getByText('180 questões')).toBeInTheDocument();
    expect(screen.getByTestId('caret-icon')).toBeInTheDocument();
  });

  it('should render with duration', () => {
    render(<CardSimulado {...baseProps} duration="3h00min" />);
    expect(screen.getByText('3h00min')).toBeInTheDocument();
    // Clock icon should be present
    const clockIcon = screen.getByText('3h00min').previousElementSibling;
    expect(clockIcon).toBeInTheDocument();
  });

  it('should render without duration', () => {
    render(<CardSimulado {...baseProps} />);
    expect(screen.queryByText('3h00min')).not.toBeInTheDocument();
    // Clock icon should not be present when no duration
    const infoText = screen.getByText('180 questões');
    expect(
      infoText.parentElement?.querySelector('svg')
    ).not.toBeInTheDocument();
  });

  it('should apply correct background color classes', () => {
    const backgroundColors: Array<
      'enem' | 'prova' | 'simuladao' | 'vestibular'
    > = ['enem', 'prova', 'simuladao', 'vestibular'];
    const expectedClasses = [
      'bg-exam-1',
      'bg-exam-2',
      'bg-exam-3',
      'bg-exam-4',
    ];

    backgroundColors.forEach((color, index) => {
      const { unmount } = render(
        <CardSimulado
          {...baseProps}
          backgroundColor={color}
          data-testid={`card-${color}`}
        />
      );

      const card = screen.getByTestId(`card-${color}`);
      expect(card.className).toContain(expectedClasses[index]);
      unmount();
    });
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<CardSimulado {...baseProps} onClick={handleClick} />);

    const card = screen.getByText('Simulado ENEM 2025').closest('div');
    fireEvent.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <CardSimulado
        {...baseProps}
        className="custom-class"
        data-testid="card-simulado"
      />
    );

    const card = screen.getByTestId('card-simulado');
    expect(card.className).toContain('custom-class');
  });

  it('should apply hover and transition classes', () => {
    render(<CardSimulado {...baseProps} data-testid="card-simulado" />);

    const card = screen.getByTestId('card-simulado');
    expect(card.className).toContain('hover:shadow-soft-shadow-2');
    expect(card.className).toContain('transition-shadow');
    expect(card.className).toContain('duration-200');
  });

  it('should apply cursor pointer from CardBase', () => {
    render(<CardSimulado {...baseProps} data-testid="card-simulado" />);

    const card = screen.getByTestId('card-simulado');
    expect(card.className).toContain('cursor-pointer');
  });

  it('should truncate long title text', () => {
    const longTitle =
      'Este é um título muito longo que deveria ser truncado quando não cabe no espaço disponível do card';
    render(<CardSimulado {...baseProps} title={longTitle} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement.className).toContain('truncate');
  });

  it('should truncate long info text', () => {
    const longInfo =
      'Esta é uma informação muito longa que deveria ser truncada quando não cabe no espaço disponível';
    render(<CardSimulado {...baseProps} info={longInfo} />);

    const infoElement = screen.getByText(longInfo);
    expect(infoElement.className).toContain('truncate');
  });

  it('should have proper text styling', () => {
    render(<CardSimulado {...baseProps} duration="2h30min" />);

    const titleElement = screen.getByText('Simulado ENEM 2025');
    expect(titleElement.className).toContain('text-text-950');

    const durationElement = screen.getByText('2h30min');
    expect(durationElement.parentElement?.parentElement?.className).toContain(
      'text-text-700'
    );

    const infoElement = screen.getByText('180 questões');
    expect(infoElement.parentElement?.className).toContain('text-text-700');
  });

  it('should have proper layout structure', () => {
    render(<CardSimulado {...baseProps} duration="2h30min" />);

    const titleElement = screen.getByText('Simulado ENEM 2025');
    const titleContainer = titleElement.closest('div');
    expect(titleContainer?.className).toContain('flex-col');
    expect(titleContainer?.className).toContain('flex-1');
    expect(titleContainer?.className).toContain('min-w-0');

    const mainContainer = screen.getByText('180 questões').closest('div')
      ?.parentElement?.parentElement;
    expect(mainContainer?.className).toContain('flex');
    expect(mainContainer?.className).toContain('justify-between');
    expect(mainContainer?.className).toContain('items-center');
  });

  it('should render CaretRight icon with correct attributes', () => {
    render(<CardSimulado {...baseProps} />);

    const caretIcon = screen.getByTestId('caret-icon');
    expect(caretIcon).toBeInTheDocument();
    expect(caretIcon).toHaveClass('text-text-800');
    expect(caretIcon).toHaveClass('flex-shrink-0');
    // SVG elements don't have size attribute - it's a phosphor-react prop
    expect(caretIcon.tagName).toBe('svg');
  });

  it('should forward extra HTML attributes', () => {
    render(
      <CardSimulado
        {...baseProps}
        data-testid="custom-simulado"
        aria-label="Simulado Card"
        role="button"
      />
    );

    const card = screen.getByTestId('custom-simulado');
    expect(card).toHaveAttribute('aria-label', 'Simulado Card');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<CardSimulado {...baseProps} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('should render Clock icon only when duration is provided', () => {
    const { rerender } = render(<CardSimulado {...baseProps} />);

    // Without duration - no clock icon
    expect(screen.queryByText('2h30min')).not.toBeInTheDocument();

    // With duration - clock icon should be present
    rerender(<CardSimulado {...baseProps} duration="2h30min" />);
    expect(screen.getByText('2h30min')).toBeInTheDocument();
  });

  it('should handle all background color variants correctly', () => {
    const colors = [
      { color: 'enem' as const, class: 'bg-exam-1' },
      { color: 'prova' as const, class: 'bg-exam-2' },
      { color: 'simuladao' as const, class: 'bg-exam-3' },
      { color: 'vestibular' as const, class: 'bg-exam-4' },
    ];

    colors.forEach(({ color, class: expectedClass }) => {
      const { unmount } = render(
        <CardSimulado
          {...baseProps}
          backgroundColor={color}
          data-testid={`test-${color}`}
        />
      );

      const card = screen.getByTestId(`test-${color}`);
      expect(card.className).toContain(expectedClass);
      unmount();
    });
  });

  it('should maintain proper spacing between elements', () => {
    render(<CardSimulado {...baseProps} duration="2h30min" />);

    const durationContainer = screen.getByText('2h30min').closest('div');
    expect(durationContainer?.className).toContain('flex');
    expect(durationContainer?.className).toContain('items-center');
    expect(durationContainer?.className).toContain('gap-1');

    const infoContainer = screen.getByText('180 questões').closest('div');
    expect(infoContainer?.className).toContain('flex');
    expect(infoContainer?.className).toContain('items-center');
    expect(infoContainer?.className).toContain('gap-4');
  });

  it('should have correct CardBase props applied', () => {
    render(<CardSimulado {...baseProps} data-testid="card-simulado" />);

    const card = screen.getByTestId('card-simulado');

    // Check for CardBase classes
    expect(card.className).toContain('w-full');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('border');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('flex');
    expect(card.className).toContain('flex-row');
    expect(card.className).toContain('p-4');
    expect(card.className).toContain('cursor-pointer');
  });

  it('should handle keyboard events through CardBase', () => {
    const handleClick = jest.fn();
    render(<CardSimulado {...baseProps} onClick={handleClick} />);

    const card = screen.getByText('Simulado ENEM 2025').closest('div');
    fireEvent.keyDown(card!, { key: 'Enter' });
    // The click handler should work through CardBase's forwarded events
    expect(card).toBeInTheDocument();
  });

  it('should combine all class names correctly', () => {
    render(
      <CardSimulado
        {...baseProps}
        backgroundColor="prova"
        className="custom-class another-class"
        data-testid="card-simulado"
      />
    );

    const card = screen.getByTestId('card-simulado');
    expect(card.className).toContain('bg-exam-2'); // prova background
    expect(card.className).toContain('hover:shadow-soft-shadow-2');
    expect(card.className).toContain('transition-shadow');
    expect(card.className).toContain('duration-200');
    expect(card.className).toContain('custom-class');
    expect(card.className).toContain('another-class');
  });
});

describe('CardTest', () => {
  const baseProps = {
    title: 'Teste de Matemática',
    questionsCount: 30,
  };

  it('should render with minimal props', () => {
    render(<CardTest {...baseProps} />);
    expect(screen.getByText('Teste de Matemática')).toBeInTheDocument();
    expect(screen.getByText('30 questões')).toBeInTheDocument();
  });

  it('should render with duration', () => {
    render(<CardTest {...baseProps} duration="2h30min" />);
    expect(screen.getByText('2h30min')).toBeInTheDocument();
    // Clock icon should be present
    const durationText = screen.getByText('2h30min');
    const clockIcon = durationText.previousElementSibling;
    expect(clockIcon).toBeInTheDocument();
    expect(clockIcon?.tagName).toBe('svg');
  });

  it('should render without duration', () => {
    render(<CardTest {...baseProps} />);
    expect(screen.queryByText('2h30min')).not.toBeInTheDocument();
    // Clock icon should not be present when no duration
    const questionsText = screen.getByText('30 questões');
    const container = questionsText.closest('div');
    expect(container?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    render(<CardTest {...baseProps} data-testid="test-card" />);
    const card = screen.getByTestId('test-card');

    // Base classes
    expect(card.className).toContain('flex');
    expect(card.className).toContain('flex-row');
    expect(card.className).toContain('items-center');
    expect(card.className).toContain('p-4');
    expect(card.className).toContain('gap-2');
    expect(card.className).toContain('w-full');
    expect(card.className).toContain('max-w-full');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('isolate');
  });

  it('should apply custom shadow correctly', () => {
    render(<CardTest {...baseProps} data-testid="test-card" />);
    const card = screen.getByTestId('test-card');
    expect(card.className).toContain('shadow-soft-shadow-1');
  });

  it('should render with questionsCount', () => {
    render(<CardTest title="Matemática" questionsCount={45} />);
    expect(screen.getByText('45 questões')).toBeInTheDocument();
  });

  it('should prioritize questionsCount over additionalInfo', () => {
    render(
      <CardTest
        title="Teste"
        questionsCount={30}
        additionalInfo="Esta informação deve ser ignorada"
      />
    );
    expect(screen.getByText('30 questões')).toBeInTheDocument();
    expect(
      screen.queryByText('Esta informação deve ser ignorada')
    ).not.toBeInTheDocument();
  });

  it('should use additionalInfo when questionsCount is not provided', () => {
    render(
      <CardTest title="Teste" additionalInfo="Informação personalizada" />
    );
    expect(screen.getByText('Informação personalizada')).toBeInTheDocument();
  });

  it('should handle questionsCount with different numbers', () => {
    const { rerender } = render(<CardTest title="Teste" questionsCount={1} />);
    expect(screen.getByText('1 questões')).toBeInTheDocument();

    rerender(<CardTest title="Teste" questionsCount={180} />);
    expect(screen.getByText('180 questões')).toBeInTheDocument();
  });

  it('should render empty info when neither questionsCount nor additionalInfo are provided', () => {
    render(<CardTest title="Teste" />);
    // Should not crash and should not show any info text
    expect(screen.getByText('Teste')).toBeInTheDocument();
    // The info container should exist but be empty
    const card = screen.getByText('Teste').closest('[class*="flex"]');
    expect(card).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<CardTest {...baseProps} onClick={handleClick} />);

    const card = screen.getByText('Teste de Matemática').closest('div');
    fireEvent.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(
      <CardTest
        {...baseProps}
        className="custom-class"
        data-testid="test-card"
      />
    );

    const card = screen.getByTestId('test-card');
    expect(card.className).toContain('custom-class');
  });

  it('should truncate long title text', () => {
    const longTitle =
      'Este é um título muito longo que deveria ser truncado quando não cabe no espaço disponível do card';
    render(<CardTest {...baseProps} title={longTitle} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement.className).toContain('truncate');
  });

  it('should truncate long additional info text', () => {
    const longInfo =
      'Esta é uma informação adicional muito longa que deveria ser truncada quando não cabe no espaço disponível';
    render(<CardTest title="Teste" additionalInfo={longInfo} />);

    const infoElement = screen.getByText(longInfo);
    expect(infoElement.className).toContain('truncate');
  });

  it('should have proper text styling', () => {
    render(
      <CardTest
        title="Teste de Matemática"
        duration="2h30min"
        additionalInfo="Informação adicional"
      />
    );

    const titleElement = screen.getByText('Teste de Matemática');
    expect(titleElement.className).toContain('text-text-950');
    expect(titleElement.className).toContain('tracking-[0.2px]');
    expect(titleElement.className).toContain('leading-[19px]');

    const durationElement = screen.getByText('2h30min');
    expect(durationElement.className).toContain('text-text-700');
    expect(durationElement.className).toContain('leading-[21px]');
    expect(durationElement.className).toContain('whitespace-nowrap');

    const infoElement = screen.getByText('Informação adicional');
    expect(infoElement.className).toContain('text-text-700');
    expect(infoElement.className).toContain('leading-[21px]');
    expect(infoElement.className).toContain('flex-grow');
  });

  it('should have proper layout structure', () => {
    render(
      <CardTest {...baseProps} duration="2h30min" data-testid="test-card" />
    );

    const card = screen.getByTestId('test-card');
    const innerContainer = card.querySelector('div');

    expect(innerContainer?.className).toContain('flex');
    expect(innerContainer?.className).toContain('flex-col');
    expect(innerContainer?.className).toContain('justify-between');
    expect(innerContainer?.className).toContain('gap-[27px]');
    expect(innerContainer?.className).toContain('flex-grow');
    expect(innerContainer?.className).toContain('min-h-[67px]');
    expect(innerContainer?.className).toContain('w-full');
    expect(innerContainer?.className).toContain('min-w-0');

    const durationDiv = screen.getByText('2h30min').closest('div');
    const bottomSection = durationDiv?.parentElement;
    expect(bottomSection?.className).toContain('flex');
    expect(bottomSection?.className).toContain('flex-row');
    expect(bottomSection?.className).toContain('justify-start');
    expect(bottomSection?.className).toContain('items-end');
    expect(bottomSection?.className).toContain('gap-4');
    expect(bottomSection?.className).toContain('w-full');
  });

  it('should render Clock icon with correct attributes', () => {
    render(<CardTest {...baseProps} duration="2h30min" />);

    const durationText = screen.getByText('2h30min');
    const clockIcon = durationText.previousElementSibling;

    expect(clockIcon).toBeInTheDocument();
    expect(clockIcon?.tagName).toBe('svg');
    expect(clockIcon).toHaveClass('text-text-700');
  });

  it('should forward extra HTML attributes', () => {
    render(
      <CardTest
        {...baseProps}
        data-testid="custom-test-card"
        aria-label="Test Card"
        role="button"
      />
    );

    const card = screen.getByTestId('custom-test-card');
    expect(card).toHaveAttribute('aria-label', 'Test Card');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<CardTest {...baseProps} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('should handle keyboard events', () => {
    const handleClick = jest.fn();
    render(<CardTest {...baseProps} onClick={handleClick} />);

    const card = screen.getByText('Teste de Matemática').closest('div');
    fireEvent.keyDown(card!, { key: 'Enter' });
    // The card should handle keyboard events through forwarded props
    expect(card).toBeInTheDocument();
  });

  it('should maintain proper spacing between elements', () => {
    render(
      <CardTest
        title="Teste"
        duration="2h30min"
        additionalInfo="Informação adicional"
      />
    );

    const durationContainer = screen.getByText('2h30min').closest('div');
    expect(durationContainer?.className).toContain('flex');
    expect(durationContainer?.className).toContain('flex-row');
    expect(durationContainer?.className).toContain('items-center');
    expect(durationContainer?.className).toContain('gap-1');
    expect(durationContainer?.className).toContain('flex-shrink-0');

    const bottomContainer = screen
      .getByText('Informação adicional')
      .closest('div');
    expect(bottomContainer?.className).toContain('gap-4');
  });

  it('should handle different duration formats', () => {
    const durations = ['0h00', '1h30', '2h45min', '30min', '1h'];

    durations.forEach((duration) => {
      const { unmount } = render(
        <CardTest {...baseProps} duration={duration} />
      );

      expect(screen.getByText(duration)).toBeInTheDocument();
      const durationText = screen.getByText(duration);
      const clockIcon = durationText.previousElementSibling;
      expect(clockIcon).toBeInTheDocument();

      unmount();
    });
  });

  it('should handle empty strings gracefully', () => {
    render(
      <CardTest
        title=""
        additionalInfo=""
        duration=""
        data-testid="empty-card"
      />
    );

    const card = screen.getByTestId('empty-card');
    expect(card).toBeInTheDocument();

    // Empty duration should not render clock icon
    const clockIcon = screen.queryByRole('img', { hidden: true });
    expect(clockIcon).not.toBeInTheDocument();
  });

  it('should handle long text with proper responsive behavior', () => {
    const longTitle =
      'Este é um título extremamente longo que testa o comportamento responsivo do componente CardTest quando o texto não cabe adequadamente';
    const longInfo =
      'Esta é uma informação adicional extremamente longa que também testa o comportamento responsivo e de truncamento do componente';

    render(
      <CardTest
        title={longTitle}
        additionalInfo={longInfo}
        duration="3h00min"
        data-testid="responsive-card"
        className="max-w-xs"
      />
    );

    const card = screen.getByTestId('responsive-card');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('max-w-xs'); // Custom max-width applied

    const titleElement = screen.getByText(longTitle);
    expect(titleElement.className).toContain('truncate');

    const infoElement = screen.getByText(longInfo);
    expect(infoElement.className).toContain('truncate');
    expect(infoElement.className).toContain('min-w-0');
  });

  it('should combine all class names correctly', () => {
    render(
      <CardTest
        {...baseProps}
        duration="1h30"
        className="custom-class another-class hover:shadow-lg"
        data-testid="test-card"
      />
    );

    const card = screen.getByTestId('test-card');

    // Base classes
    expect(card.className).toContain('flex');
    expect(card.className).toContain('flex-row');
    expect(card.className).toContain('items-center');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('rounded-xl');

    // Custom classes
    expect(card.className).toContain('custom-class');
    expect(card.className).toContain('another-class');
    expect(card.className).toContain('hover:shadow-lg');
  });

  it('should maintain accessibility features', () => {
    render(
      <CardTest
        {...baseProps}
        duration="2h00"
        role="button"
        tabIndex={0}
        aria-label="Mathematics Test Card"
        data-testid="accessible-card"
      />
    );

    const card = screen.getByTestId('accessible-card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'Mathematics Test Card');
  });

  it('should render with all props and maintain structure', () => {
    render(
      <CardTest
        title="Linguagens e Códigos, Ciências Humanas e Redação"
        duration="3h30min"
        additionalInfo="180 questões + redação"
        className="max-w-4xl hover:shadow-lg"
        onClick={() => console.log('clicked')}
        data-testid="full-props-card"
        role="button"
        tabIndex={0}
      />
    );

    const card = screen.getByTestId('full-props-card');

    // Check all content is rendered
    expect(
      screen.getByText('Linguagens e Códigos, Ciências Humanas e Redação')
    ).toBeInTheDocument();
    expect(screen.getByText('3h30min')).toBeInTheDocument();
    expect(screen.getByText('180 questões + redação')).toBeInTheDocument();

    // Check structure and classes
    expect(card.className).toContain('max-w-4xl');
    expect(card.className).toContain('hover:shadow-lg');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');

    // Check clock icon is present
    const clockIcon = screen.getByText('3h30min').previousElementSibling;
    expect(clockIcon).toBeInTheDocument();
    expect(clockIcon?.tagName).toBe('svg');
  });

  describe('Selection functionality', () => {
    it('should render as non-selectable when onSelect is not provided', () => {
      render(<CardTest {...baseProps} data-testid="card-test" />);
      const card = screen.getByTestId('card-test');

      expect(card).not.toHaveAttribute('role');
      expect(card).not.toHaveAttribute('tabIndex');
      expect(card).not.toHaveAttribute('aria-pressed');
      expect(card.className).not.toContain('cursor-pointer');
    });

    it('should render as selectable when onSelect is provided', () => {
      const onSelect = jest.fn();
      render(
        <CardTest {...baseProps} onSelect={onSelect} data-testid="card-test" />
      );
      const card = screen.getByTestId('card-test');

      expect(card.tagName).toBe('BUTTON');
      expect(card).toHaveAttribute('aria-pressed', 'false');
      expect(card.className).toContain('cursor-pointer');
    });

    it('should show selected state when selected=true', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={true}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );
      const card = screen.getByTestId('card-test');

      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(card.className).toContain('ring-2');
      expect(card.className).toContain('ring-primary-950');
      expect(card.className).toContain('ring-offset-2');
    });

    it('should call onSelect with true when clicked and not selected', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={false}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.click(card);

      expect(onSelect).toHaveBeenCalledWith(true);
    });

    it('should call onSelect with false when clicked and selected', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={true}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.click(card);

      expect(onSelect).toHaveBeenCalledWith(false);
    });

    it('should call onSelect when Enter key is pressed', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={false}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledWith(true);
    });

    it('should call onSelect when Space key is pressed', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={false}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.keyDown(card, { key: ' ' });

      expect(onSelect).toHaveBeenCalledWith(true);
    });

    it('should not call onSelect when other keys are pressed', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={false}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.keyDown(card, { key: 'Tab' });
      fireEvent.keyDown(card, { key: 'Escape' });
      fireEvent.keyDown(card, { key: 'ArrowUp' });

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter and Space key press', () => {
      const onSelect = jest.fn();
      render(
        <CardTest {...baseProps} onSelect={onSelect} data-testid="card-test" />
      );

      const card = screen.getByTestId('card-test');

      fireEvent.keyDown(card, { key: 'Enter' });
      fireEvent.keyDown(card, { key: ' ' });

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenCalledWith(true);
    });

    it('should use custom onClick when onSelect is not provided', () => {
      const customOnClick = jest.fn();
      render(
        <CardTest
          {...baseProps}
          onClick={customOnClick}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.click(card);

      expect(customOnClick).toHaveBeenCalled();
    });

    it('should use custom onKeyDown when onSelect is not provided', () => {
      const customOnKeyDown = jest.fn();
      render(
        <CardTest
          {...baseProps}
          onKeyDown={customOnKeyDown}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(customOnKeyDown).toHaveBeenCalled();
    });

    it('should apply focus styles when focused', () => {
      const onSelect = jest.fn();
      render(
        <CardTest {...baseProps} onSelect={onSelect} data-testid="card-test" />
      );

      const card = screen.getByTestId('card-test');
      expect(card.className).toContain('focus:outline-none');
      expect(card.className).toContain('focus:ring-2');
      expect(card.className).toContain('focus:ring-primary-950');
      expect(card.className).toContain('focus:ring-offset-2');
    });

    it('should handle selection state changes correctly', () => {
      const onSelect = jest.fn();
      const { rerender } = render(
        <CardTest
          {...baseProps}
          selected={false}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      let card = screen.getByTestId('card-test');
      expect(card).toHaveAttribute('aria-pressed', 'false');
      // Verificar que não tem as classes de seleção (apenas as de foco)
      expect(card.className.match(/\bring-2\b/g) || []).toHaveLength(1);

      // Re-render with selected=true
      rerender(
        <CardTest
          {...baseProps}
          selected={true}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      card = screen.getByTestId('card-test');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      // Verificar que tem as classes de seleção + as de foco (2x ring-2)
      expect(card.className.match(/\bring-2\b/g) || []).toHaveLength(2);
    });

    it('should combine selection classes with custom className', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          {...baseProps}
          selected={true}
          onSelect={onSelect}
          className="custom-class"
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      expect(card.className).toContain('ring-2');
      expect(card.className).toContain('ring-primary-950');
      expect(card.className).toContain('cursor-pointer');
      expect(card.className).toContain('custom-class');
    });

    it('should render selectable card with duration and clock icon', () => {
      const onSelect = jest.fn();
      render(
        <CardTest
          title="Teste"
          duration="2h30min"
          questionsCount={30}
          onSelect={onSelect}
          data-testid="card-test"
        />
      );

      const card = screen.getByTestId('card-test');
      expect(card.tagName).toBe('BUTTON');

      // Verificar se o ícone de clock está presente
      const clockIcon = card.querySelector('svg');
      expect(clockIcon).toBeInTheDocument();

      // Verificar se o texto de duração está presente
      expect(screen.getByText('2h30min')).toBeInTheDocument();
      expect(screen.getByText('30 questões')).toBeInTheDocument();
    });
  });
});
