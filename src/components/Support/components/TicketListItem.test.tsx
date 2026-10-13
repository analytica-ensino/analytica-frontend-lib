import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { DeviceMobileIcon } from '@phosphor-icons/react/dist/csr/DeviceMobile';
import { TicketListItem } from './TicketListItem';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const SIX_MINUTES_AGO = new Date('2026-10-12T11:54:00.000Z');

/**
 * O relógio falso fixa o tempo relativo do item, mas trava o `userEvent`, que
 * espera delays internos. Avançar os timers por ele destrava sem abrir mão do
 * tempo fixo.
 */
const setupUser = () =>
  userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

const renderItem = (props = {}) =>
  render(
    <TicketListItem
      name="Ana Clara Mendes"
      lastMessageAt={SIX_MINUTES_AGO}
      {...props}
    />
  );

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TicketListItem', () => {
  it('renders a button named after the person', () => {
    renderItem();

    expect(
      screen.getByRole('button', { name: /Ana Clara Mendes/ })
    ).toBeInTheDocument();
  });

  it('renders as type="button" so it never submits a surrounding form', () => {
    renderItem();

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('formats the elapsed time', () => {
    renderItem();

    expect(screen.getByText('6 min')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    renderItem({ onClick });

    await setupUser().click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    renderItem({ onClick, disabled: true });

    await setupUser().click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <TicketListItem
        ref={ref}
        name="Ana Clara Mendes"
        lastMessageAt={SIX_MINUTES_AGO}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe('size', () => {
    it('is md by default', () => {
      renderItem();

      expect(screen.getByRole('button')).toHaveClass('gap-3', 'p-4');
      expect(screen.getByText('Ana Clara Mendes')).toHaveClass('text-base');
    });

    it('shrinks everything together on sm', () => {
      const { container } = renderItem({ size: 'sm' });

      expect(screen.getByRole('button')).toHaveClass('gap-2', 'p-3');
      expect(container.querySelector('[data-component="Avatar"]')).toHaveStyle({
        width: '32px',
        height: '32px',
      });
      expect(screen.getByText('Ana Clara Mendes')).toHaveClass('text-sm');
    });

    it('grows everything together on lg', () => {
      const { container } = renderItem({ size: 'lg' });

      expect(screen.getByRole('button')).toHaveClass('gap-4', 'p-5');
      expect(container.querySelector('[data-component="Avatar"]')).toHaveStyle({
        width: '48px',
        height: '48px',
      });
      expect(screen.getByText('Ana Clara Mendes')).toHaveClass('text-lg');
    });

    it('scales the left bar with the item', () => {
      renderItem({ size: 'sm' });

      expect(screen.getByTestId('ticket-list-item-bar')).toHaveClass('w-0.5');
    });
  });

  describe('tone', () => {
    it('is transparent by default', () => {
      renderItem();

      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('paints the info background', () => {
      renderItem({ tone: 'info' });

      expect(screen.getByRole('button')).toHaveClass('bg-[#EEF5FC]');
    });

    it('paints the danger background', () => {
      renderItem({ tone: 'danger' });

      expect(screen.getByRole('button')).toHaveClass('bg-[#FFF7F7]');
    });

    it('turns blue on hover regardless of the tone', () => {
      renderItem({ tone: 'danger' });

      expect(screen.getByRole('button')).toHaveClass('hover:bg-[#EEF5FC]');
    });
  });

  describe('left bar', () => {
    it('is visible when the tone is info', () => {
      renderItem({ tone: 'info' });

      expect(screen.getByTestId('ticket-list-item-bar')).toHaveClass(
        'opacity-100'
      );
    });

    it('is hidden until hover on the other tones', () => {
      renderItem({ tone: 'danger' });

      const bar = screen.getByTestId('ticket-list-item-bar');

      expect(bar).toHaveClass('opacity-0');
      expect(bar).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('optional blocks', () => {
    it('renders nothing optional by default', () => {
      renderItem();

      expect(
        screen.queryByTestId('ticket-list-item-profile')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('ticket-list-item-attendance')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('ticket-list-item-channel')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('ticket-list-item-unread')
      ).not.toBeInTheDocument();
    });

    it('renders the profile badge, organization, message and code', () => {
      renderItem({
        profileLabel: 'ESTUDANTE',
        organization: 'CE Santos Dumont',
        message: 'IA: Entendi. Vou transferir você para um atendente.',
        attendanceLabel: 'HUMANO',
        ticketCode: '#4826',
      });

      expect(screen.getByText('ESTUDANTE')).toBeInTheDocument();
      expect(screen.getByText('CE Santos Dumont')).toBeInTheDocument();
      expect(
        screen.getByText('IA: Entendi. Vou transferir você para um atendente.')
      ).toBeInTheDocument();
      expect(screen.getByText('HUMANO')).toBeInTheDocument();
      expect(screen.getByText('#4826')).toBeInTheDocument();
    });

    it('renders the channel icon passed by the consumer', () => {
      renderItem({
        channelIcon: <DeviceMobileIcon data-testid="channel-icon" size={16} />,
      });

      expect(screen.getByTestId('channel-icon')).toBeInTheDocument();
    });

    it('announces the unread state and paints the dot', () => {
      renderItem({ unread: true });

      expect(screen.getByTestId('ticket-list-item-unread')).toHaveClass(
        'bg-[#1C61B2]'
      );
      expect(screen.getByText('Não lido')).toBeInTheDocument();
    });

    it('applies the attendance tone', () => {
      renderItem({ attendanceLabel: 'HUMANO', attendanceTone: 'info' });

      expect(screen.getByTestId('ticket-list-item-attendance')).toHaveClass(
        'bg-info'
      );
    });

    it('truncates the message to a single line', () => {
      renderItem({ message: 'IA: Entendi.' });

      expect(screen.getByText('IA: Entendi.')).toHaveClass('truncate');
    });
  });

  describe('avatar', () => {
    it('shows the initials when there is no picture', () => {
      renderItem();

      expect(screen.getByText('AM')).toBeInTheDocument();
    });

    it('shows the picture when there is one', () => {
      renderItem({ avatarSrc: '/ana.png' });

      expect(screen.getByRole('img')).toHaveAttribute('src', '/ana.png');
    });
  });

  it('merges an extra className', () => {
    renderItem({ className: 'mt-4' });

    expect(screen.getByRole('button')).toHaveClass('mt-4');
  });
});
