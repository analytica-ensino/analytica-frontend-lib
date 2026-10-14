import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportUserPanel, {
  type SupportUserPanelProps,
} from './SupportUserPanel';
import useToastStore from '../Toast/utils/ToastStore';
import {
  SUPPORT_CHANNEL,
  SUPPORT_TICKET_CARD_STATUS,
  SUPPORT_TICKET_PRIORITY,
  SUPPORT_USER_PANEL_TAB,
  type SupportContact,
  type SupportTicketDetails,
  type SupportTicketSummary,
} from '../../types/supportUserPanel';
import { SUPPORT_TIMELINE_STATUS } from '../../types/supportTimeline';

const contact: SupportContact = {
  id: 'c-1',
  name: 'Mariana Costa',
  role: 'Estudante',
  institution: 'Rede Aprender Mais',
  linked: true,
  email: 'mariana@exemplo.com',
  phone: '11987654321',
  tags: ['Vestibular'],
  classOrPosition: '3º ano B',
  firstContactAt: '2026-03-03T11:00:00.000Z',
  lastContactAt: '2026-03-04T11:00:00.000Z',
  ticketsCount: 7,
  device: 'Android 14 · Moto G54',
  preferredChannel: SUPPORT_CHANNEL.APP,
  notes: [
    {
      id: 'n-old',
      text: 'Nota antiga',
      author: 'Carla',
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    {
      id: 'n-new',
      text: 'Nota nova',
      author: 'Bruno',
      createdAt: '2026-02-01T12:00:00.000Z',
    },
  ],
};

const tickets: SupportTicketSummary[] = [
  {
    id: 3,
    title: 'Resolvido pela IA',
    reason: 'Login',
    status: SUPPORT_TICKET_CARD_STATUS.DONE,
    createdAt: '2026-01-10T12:00:00.000Z',
    resolvedBy: { type: 'ai' },
    durationMin: 3,
  },
  {
    id: 1,
    title: 'Ticket atual',
    reason: 'Acesso',
    subreason: 'Simulado',
    status: SUPPORT_TICKET_CARD_STATUS.IN_PROGRESS,
    createdAt: '2026-01-01T12:00:00.000Z',
  },
  {
    id: 2,
    title: 'Resolvido pela Carla',
    status: SUPPORT_TICKET_CARD_STATUS.DONE,
    createdAt: '2026-01-20T12:00:00.000Z',
    resolvedBy: { type: 'agent', name: 'Carla' },
  },
  {
    id: 4,
    title: 'Aguardando',
    status: SUPPORT_TICKET_CARD_STATUS.WAITING_HUMAN,
    createdAt: '2026-01-05T12:00:00.000Z',
  },
];

const ticket: SupportTicketDetails = {
  id: 1,
  channel: SUPPORT_CHANNEL.WHATSAPP,
  openedAt: '2026-01-01T12:00:00.000Z',
  firstHumanAt: '2026-01-01T12:10:00.000Z',
  closedAt: null,
  done: false,
  reason: null,
  priority: SUPPORT_TICKET_PRIORITY.NORMAL,
  tags: [],
  aiSummary: 'Resumo gerado',
  timeline: [
    { status: SUPPORT_TIMELINE_STATUS.OPEN, at: '2026-01-01T12:00:00.000Z' },
    {
      status: SUPPORT_TIMELINE_STATUS.REOPENED,
      at: '2026-01-01T12:20:00.000Z',
    },
  ],
};

const reasonOptions = [
  { value: 'acesso', label: 'Acesso' },
  { value: 'login', label: 'Login' },
];

const renderPanel = (overrides: Partial<SupportUserPanelProps> = {}) => {
  const props: SupportUserPanelProps = {
    profile: { contact },
    history: {
      currentTicketId: 1,
      tickets,
      summary: { total: 4, resolved: 2, avgMin: 18 },
    },
    ticket: { ticket, reasonOptions },
    ...overrides,
  };
  return render(<SupportUserPanel {...props} />);
};

const lastToast = () => useToastStore.getState().toasts.at(-1)?.title;

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('SupportUserPanel', () => {
  describe('tabs', () => {
    it('opens on the ticket details tab', () => {
      renderPanel();
      expect(
        screen.getByRole('tab', { name: 'Detalhes do ticket' })
      ).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(
        'Detalhes do ticket'
      );
    });

    it('switches tabs on click and notifies', () => {
      const onTabChange = jest.fn();
      renderPanel({ onTabChange });
      fireEvent.click(screen.getByRole('tab', { name: 'Perfil' }));
      expect(onTabChange).toHaveBeenCalledWith(SUPPORT_USER_PANEL_TAB.PROFILE);
      expect(screen.getByText('Mariana Costa')).toBeInTheDocument();
    });

    it('switches tabs with Alt+1/2/3', () => {
      renderPanel();
      fireEvent.keyDown(window, { altKey: true, code: 'Digit2' });
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Histórico');
      fireEvent.keyDown(window, { altKey: true, code: 'Digit1' });
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Perfil');
      // Ignored: no Alt, other digit, or Ctrl held.
      fireEvent.keyDown(window, { code: 'Digit3' });
      fireEvent.keyDown(window, { altKey: true, code: 'Digit9' });
      fireEvent.keyDown(window, {
        altKey: true,
        ctrlKey: true,
        code: 'Digit3',
      });
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Perfil');
    });

    it('ignores shortcuts when disabled', () => {
      renderPanel({ enableShortcuts: false });
      fireEvent.keyDown(window, { altKey: true, code: 'Digit1' });
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(
        'Detalhes do ticket'
      );
    });

    it('follows a controlled tab', () => {
      const onTabChange = jest.fn();
      renderPanel({ tab: SUPPORT_USER_PANEL_TAB.HISTORY, onTabChange });
      fireEvent.keyDown(window, { altKey: true, code: 'Digit1' });
      expect(onTabChange).toHaveBeenCalledWith(SUPPORT_USER_PANEL_TAB.PROFILE);
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Histórico');
    });
  });

  describe('profile tab', () => {
    const openProfile = (overrides: Partial<SupportUserPanelProps> = {}) =>
      renderPanel({ tab: SUPPORT_USER_PANEL_TAB.PROFILE, ...overrides });

    it('renders the contact data, linked badge and newest note first', () => {
      const onOpenContact = jest.fn();
      openProfile({ profile: { contact, onOpenContact } });

      expect(
        screen.getByText('Estudante · Rede Aprender Mais')
      ).toBeInTheDocument();
      expect(screen.getByText(/Vinculado à plataforma/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'ver cadastro' }));
      expect(onOpenContact).toHaveBeenCalled();
      expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument();
      expect(screen.getByText('3º ano B')).toBeInTheDocument();
      expect(screen.getByText('03/03/2026')).toBeInTheDocument();

      const notes = screen
        .getAllByRole('listitem')
        .filter((item) => item.textContent?.startsWith('Nota'));
      expect(notes[0]).toHaveTextContent('Nota nova');
    });

    it('renders the unlinked badge and empty fields', () => {
      const onLinkContact = jest.fn();
      openProfile({
        profile: {
          contact: {
            ...contact,
            linked: false,
            email: null,
            phone: null,
            classOrPosition: null,
            device: null,
            notes: [],
          },
          onLinkContact,
        },
      });
      fireEvent.click(screen.getByRole('button', { name: 'vincular' }));
      expect(onLinkContact).toHaveBeenCalled();
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
      expect(
        screen.queryByRole('list', { name: 'Notas sobre o usuário' })
      ).not.toBeInTheDocument();
    });

    it('shows skeletons while loading', () => {
      openProfile({ profile: { loading: true } });
      expect(screen.getByLabelText('Carregando perfil')).toBeInTheDocument();
    });

    it('copies the e-mail', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      openProfile();
      fireEvent.click(screen.getByText('mariana@exemplo.com'));
      await waitFor(() => expect(lastToast()).toBe('Copiado'));
      expect(writeText).toHaveBeenCalledWith('mariana@exemplo.com');
    });

    it('warns when copying fails', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('x')) },
      });
      openProfile();
      fireEvent.click(screen.getByText('mariana@exemplo.com'));
      await waitFor(() => expect(lastToast()).toBe('Não foi possível copiar'));
    });

    it('adds a note and clears the box', async () => {
      const onAddNote = jest.fn().mockResolvedValue(undefined);
      openProfile({ profile: { contact, onAddNote } });
      const button = screen.getByRole('button', { name: 'Adicionar nota' });
      expect(button).toBeDisabled();

      const box = screen.getByLabelText('Nota sobre o usuário');
      fireEvent.change(box, { target: { value: '  Ligar amanhã  ' } });
      fireEvent.click(button);

      await waitFor(() =>
        expect(onAddNote).toHaveBeenCalledWith('Ligar amanhã')
      );
      await waitFor(() => expect(box).toHaveValue(''));
    });

    it('keeps the note when saving fails', async () => {
      const onAddNote = jest.fn().mockRejectedValue(new Error('x'));
      openProfile({ profile: { contact, onAddNote } });
      const box = screen.getByLabelText('Nota sobre o usuário');
      fireEvent.change(box, { target: { value: 'Ligar amanhã' } });
      fireEvent.click(screen.getByRole('button', { name: 'Adicionar nota' }));
      await waitFor(() =>
        expect(lastToast()).toBe('Não foi possível adicionar a nota')
      );
      expect(box).toHaveValue('Ligar amanhã');
    });

    it('adds and removes user tags', () => {
      const onAddTag = jest.fn();
      const onRemoveTag = jest.fn();
      openProfile({ profile: { contact, onAddTag, onRemoveTag } });

      fireEvent.click(
        screen.getByRole('button', { name: 'Remover tag Vestibular' })
      );
      expect(onRemoveTag).toHaveBeenCalledWith('Vestibular');

      fireEvent.click(screen.getByRole('button', { name: '+ Adicionar' }));
      const input = screen.getByLabelText('Nova tag');
      fireEvent.change(input, { target: { value: ' ENEM ' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onAddTag).toHaveBeenCalledWith('ENEM');

      // Duplicates and Esc do not add.
      fireEvent.click(screen.getByRole('button', { name: '+ Adicionar' }));
      fireEvent.change(screen.getByLabelText('Nova tag'), {
        target: { value: 'Vestibular' },
      });
      fireEvent.keyDown(screen.getByLabelText('Nova tag'), { key: 'Enter' });
      fireEvent.click(screen.getByRole('button', { name: '+ Adicionar' }));
      fireEvent.keyDown(screen.getByLabelText('Nova tag'), { key: 'Escape' });
      fireEvent.keyDown(screen.getByRole('button', { name: '+ Adicionar' }), {
        key: 'a',
      });
      expect(onAddTag).toHaveBeenCalledTimes(1);
      expect(screen.queryByLabelText('Nova tag')).not.toBeInTheDocument();
    });
  });

  describe('history tab', () => {
    const openHistory = (
      history: Partial<SupportUserPanelProps['history']> = {}
    ) =>
      renderPanel({
        tab: SUPPORT_USER_PANEL_TAB.HISTORY,
        history: {
          currentTicketId: 1,
          tickets,
          summary: { total: 4, resolved: 2, avgMin: 18 },
          ...history,
        },
      });

    it('pins the current ticket and orders the rest by date', () => {
      openHistory({ onOpenTicket: jest.fn() });
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Ticket atual');
      expect(items[0]).toHaveTextContent('Atendido por: Você');
      expect(items[1]).toHaveTextContent('Resolvido pela Carla');
      expect(items[2]).toHaveTextContent('Resolvido pela IA');
      expect(items[2]).toHaveTextContent('Resolvido por: IA');
      expect(items[2]).toHaveTextContent('3 min');
      expect(screen.getByText('EM ANDAMENTO')).toBeInTheDocument();
      expect(screen.getByText('AGUARDANDO HUMANO')).toBeInTheDocument();
      expect(screen.getAllByText('CONCLUÍDO')).toHaveLength(2);
      expect(screen.getByText('18 min')).toBeInTheDocument();
      expect(items).toHaveLength(4);
    });

    it('opens another ticket but not the current one', () => {
      const onOpenTicket = jest.fn();
      openHistory({ onOpenTicket });
      fireEvent.click(
        screen.getByRole('button', { name: /Resolvido pela Carla/ })
      );
      expect(onOpenTicket).toHaveBeenCalledWith(2);
      expect(
        screen.queryByRole('button', { name: /Ticket atual/ })
      ).not.toBeInTheDocument();
    });

    it('filters tickets and shows the empty message', () => {
      const onFilterChange = jest.fn();
      openHistory({
        onFilterChange,
        tickets: tickets.filter((t) => t.id !== 3),
      });
      fireEvent.click(screen.getByRole('button', { name: 'IA' }));
      expect(onFilterChange).toHaveBeenCalledWith('ai');
      expect(
        screen.getByText('Nenhum ticket com esse filtro')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Abertos' }));
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      fireEvent.click(screen.getByRole('button', { name: 'Concluídos' }));
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('shows the first-contact message', () => {
      openHistory({
        tickets: [tickets[1]],
        summary: { total: 1, resolved: 0, avgMin: null },
      });
      expect(
        screen.getByText('Primeiro atendimento deste usuário')
      ).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('pages 5 cards at a time and asks for more', () => {
      const many: SupportTicketSummary[] = Array.from(
        { length: 7 },
        (_, i) => ({
          id: 100 + i,
          title: `Ticket ${i}`,
          status: SUPPORT_TICKET_CARD_STATUS.DONE,
          createdAt: new Date(2026, 0, 1 + i).toISOString(),
        })
      );
      const onLoadMore = jest.fn();
      openHistory({
        currentTicketId: 100,
        tickets: many,
        hasMore: true,
        onLoadMore,
      });
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
      fireEvent.click(
        screen.getByRole('button', { name: 'Ver todos os atendimentos' })
      );
      expect(screen.getAllByRole('listitem')).toHaveLength(7);
      expect(onLoadMore).toHaveBeenCalled();
    });

    it('shows skeletons while loading', () => {
      openHistory({ loading: true });
      expect(screen.getByLabelText('Carregando histórico')).toBeInTheDocument();
    });
  });

  describe('ticket details tab', () => {
    const openTicket = (
      ticketProps: Partial<SupportUserPanelProps['ticket']> = {}
    ) =>
      renderPanel({
        ticket: { ticket, reasonOptions, ...ticketProps },
      });

    it('renders stats, summary and timeline', () => {
      openTicket();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('10 min')).toBeInTheDocument();
      expect(screen.getByText('Resumo gerado')).toBeInTheDocument();
      expect(screen.getByText('Reaberto')).toBeInTheDocument();
      expect(screen.getByText('sem tags')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Normal/ })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('shows the placeholder summary and skeletons', () => {
      const { unmount } = openTicket({
        ticket: { ...ticket, aiSummary: null, timeline: [] },
      });
      expect(
        screen.getByText('A IA ainda não gerou um resumo para este ticket.')
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('list', { name: 'Linha do tempo de status' })
      ).not.toBeInTheDocument();
      unmount();
      openTicket({ loading: true });
      expect(screen.getByLabelText('Carregando ticket')).toBeInTheDocument();
    });

    it('saves the priority optimistically', async () => {
      const onPriorityChange = jest.fn().mockResolvedValue(undefined);
      openTicket({ onPriorityChange });
      fireEvent.click(screen.getByRole('radio', { name: /Normal/ }));
      expect(onPriorityChange).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('radio', { name: /Urgente/ }));
      expect(screen.getByRole('radio', { name: /Urgente/ })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      await waitFor(() => expect(lastToast()).toBe('Salvo'));
      expect(onPriorityChange).toHaveBeenCalledWith('urgent');
    });

    it('rolls the priority back when saving fails', async () => {
      const onPriorityChange = jest.fn().mockRejectedValue(new Error('x'));
      openTicket({ onPriorityChange });
      fireEvent.click(screen.getByRole('radio', { name: /Alta/ }));
      await waitFor(() => expect(lastToast()).toBe('Não foi possível salvar'));
      expect(screen.getByRole('radio', { name: /Normal/ })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('saves the reason', async () => {
      const onReasonChange = jest.fn().mockResolvedValue(undefined);
      openTicket({ onReasonChange });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Login' }));
      await waitFor(() => expect(onReasonChange).toHaveBeenCalledWith('login'));
    });

    it('locks the fields of a concluded ticket', () => {
      const onAddTag = jest.fn();
      openTicket({
        ticket: {
          ...ticket,
          done: true,
          closedAt: '2026-01-01T12:45:00.000Z',
          tags: ['urgente'],
        },
        onPriorityChange: jest.fn(),
        onReasonChange: jest.fn(),
        onAddTag,
      });
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('radio', { name: /Alta/ })).toBeDisabled();
      expect(
        screen.queryByRole('button', { name: '+ Adicionar' })
      ).not.toBeInTheDocument();
    });

    it('keeps the wait counter running while nobody answered', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:30:00.000Z'));
      openTicket({ ticket: { ...ticket, firstHumanAt: null } });
      expect(screen.getAllByText('30 min')).toHaveLength(2);
      act(() => {
        jest.setSystemTime(new Date('2026-01-01T12:31:00.000Z'));
        jest.advanceTimersByTime(30_000);
      });
      expect(screen.getAllByText('31 min')).toHaveLength(2);
      jest.useRealTimers();
    });
  });
});
