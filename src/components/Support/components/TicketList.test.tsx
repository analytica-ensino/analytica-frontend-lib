import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { TicketList } from './TicketList';
import type { TicketListItemData } from './TicketList';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const SIX_MINUTES_AGO = new Date('2026-10-12T11:54:00.000Z');

const TICKETS: TicketListItemData[] = [
  { id: '1', name: 'Ana Clara Mendes', lastMessageAt: SIX_MINUTES_AGO },
  { id: '2', name: 'Bruno Faria', lastMessageAt: SIX_MINUTES_AGO },
  { id: '3', name: 'Carla Dias', lastMessageAt: SIX_MINUTES_AGO },
];

/**
 * O relógio falso fixa o tempo relativo dos itens, mas trava o `userEvent`,
 * que espera delays internos. Avançar os timers por ele destrava sem abrir mão
 * do tempo fixo.
 */
const setupUser = () =>
  userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TicketList', () => {
  it('renders one listitem per ticket', () => {
    render(<TicketList tickets={TICKETS} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Ana Clara Mendes')).toBeInTheDocument();
  });

  it('divides every item but the last', () => {
    render(<TicketList tickets={TICKETS} />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveClass('border-b');
    expect(items[1]).toHaveClass('border-b');
    expect(items[2]).not.toHaveClass('border-b');
  });

  it('calls onSelect with the ticket id', async () => {
    const onSelect = jest.fn();
    render(<TicketList tickets={TICKETS} onSelect={onSelect} />);

    await setupUser().click(
      screen.getByRole('button', { name: /Bruno Faria/ })
    );

    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('survives a click without onSelect', async () => {
    render(<TicketList tickets={TICKETS} />);

    await setupUser().click(
      screen.getByRole('button', { name: /Bruno Faria/ })
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('paints the selected ticket with the info tone', () => {
    render(<TicketList tickets={TICKETS} selectedId="2" />);

    const selected = screen.getByRole('button', { name: /Bruno Faria/ });

    expect(selected).toHaveClass('bg-[#EEF5FC]');
    expect(selected).toHaveAttribute('aria-current', 'true');
  });

  it('lets the selection win over the ticket own tone', () => {
    render(
      <TicketList
        tickets={[{ ...TICKETS[0], tone: 'danger' }]}
        selectedId="1"
      />
    );

    expect(screen.getByRole('button')).toHaveClass('bg-[#EEF5FC]');
  });

  it('keeps the ticket tone when it is not selected', () => {
    render(<TicketList tickets={[{ ...TICKETS[0], tone: 'danger' }]} />);

    expect(screen.getByRole('button')).toHaveClass('bg-[#FFF7F7]');
  });

  describe('loading', () => {
    it('replaces the list with skeletons on the first load', () => {
      render(<TicketList tickets={[]} loading />);

      expect(screen.getAllByTestId('ticket-list-skeleton')).toHaveLength(5);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('honours skeletonCount', () => {
      render(<TicketList tickets={[]} loading skeletonCount={2} />);

      expect(screen.getAllByTestId('ticket-list-skeleton')).toHaveLength(2);
    });

    it('keeps the loaded tickets while paginating', () => {
      render(<TicketList tickets={TICKETS} loadingMore />);

      expect(screen.getByText('Ana Clara Mendes')).toBeInTheDocument();
      expect(
        screen.getAllByTestId('ticket-list-skeleton').length
      ).toBeGreaterThan(0);
    });

    it('shows no skeleton when it is not loading', () => {
      render(<TicketList tickets={TICKETS} />);

      expect(
        screen.queryByTestId('ticket-list-skeleton')
      ).not.toBeInTheDocument();
    });
  });

  describe('empty', () => {
    it('shows the default empty state', () => {
      render(<TicketList tickets={[]} />);

      expect(screen.getByText('Nenhum ticket encontrado')).toBeInTheDocument();
    });

    it('shows a custom empty state', () => {
      render(
        <TicketList tickets={[]} emptyState={<p>Sem chamados por aqui</p>} />
      );

      expect(screen.getByText('Sem chamados por aqui')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum ticket encontrado')
      ).not.toBeInTheDocument();
    });

    it('does not show the empty state while loading', () => {
      render(<TicketList tickets={[]} loading />);

      expect(
        screen.queryByText('Nenhum ticket encontrado')
      ).not.toBeInTheDocument();
    });
  });

  it('merges an extra className', () => {
    render(<TicketList tickets={TICKETS} className="h-full" />);

    expect(screen.getByRole('list')).toHaveClass('h-full');
  });
});
