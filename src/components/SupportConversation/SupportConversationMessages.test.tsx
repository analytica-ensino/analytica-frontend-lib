import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportConversationMessages from './SupportConversationMessages';
import { SUPPORT_CHAT_MESSAGE_TYPE } from '../../types/supportChat';
import {
  SUPPORT_CONVERSATION_ITEM,
  type SupportConversationItem,
} from '../../types/supportConversation';

const items: SupportConversationItem[] = [
  { kind: SUPPORT_CONVERSATION_ITEM.DATE, id: 'd1', label: 'Hoje' },
  {
    kind: SUPPORT_CONVERSATION_ITEM.SYSTEM,
    id: 'e1',
    text: 'Atendimento iniciado via App',
    time: '14:00',
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
    id: 'm1',
    type: SUPPORT_CHAT_MESSAGE_TYPE.USER,
    text: 'Como lanço notas?',
    time: '14:00',
    author: { name: 'Helena Martins' },
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
    id: 'm2',
    type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
    text: 'Encontrei uma orientação.',
    time: '14:01',
    faq: { title: 'Como lançar notas no diário' },
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.TRANSFER,
    id: 'e2',
    text: 'IA transferiu para humano',
    time: '14:04',
  },
];

describe('SupportConversationMessages', () => {
  it('renders each kind of item in order', () => {
    render(<SupportConversationMessages items={items} />);

    const log = screen.getByRole('log', { name: 'Mensagens do atendimento' });
    expect(screen.getByRole('separator', { name: 'Hoje' })).toBeInTheDocument();
    expect(log).toHaveTextContent('Atendimento iniciado via App · 14:00');
    expect(log).toHaveTextContent('Como lanço notas?');
    expect(log).toHaveTextContent('Encontrei uma orientação.');
    expect(log).toHaveTextContent('Como lançar notas no diário');
    expect(log).toHaveTextContent('IA transferiu para humano · 14:04');
    expect(log.textContent?.indexOf('Como lanço notas?')).toBeLessThan(
      log.textContent?.indexOf('IA transferiu para humano') ?? 0
    );
  });

  it('starts at the latest message and follows new ones', () => {
    const scrollTo = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });

    const { rerender } = render(
      <SupportConversationMessages items={items.slice(0, 2)} />
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);

    rerender(<SupportConversationMessages items={items} />);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it('shows the loading text instead of the timeline', () => {
    render(<SupportConversationMessages items={items} loading />);

    expect(screen.getByText('Carregando conversa…')).toBeInTheDocument();
    expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Como lanço notas?')).not.toBeInTheDocument();
  });

  it('shows the empty text, customizable', () => {
    const { rerender } = render(<SupportConversationMessages items={[]} />);
    expect(
      screen.getByText('Nenhuma mensagem neste atendimento ainda.')
    ).toBeInTheDocument();

    rerender(<SupportConversationMessages items={[]} emptyText="Vazio" />);
    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });
});
