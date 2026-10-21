import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportTicketConversation, {
  type SupportTicketConversationProps,
} from './SupportTicketConversation';
import { SUPPORT_CHAT_MESSAGE_TYPE } from '../../types/supportChat';
import {
  SUPPORT_CONVERSATION_ITEM,
  SUPPORT_STATUS_BANNER_VARIANT,
} from '../../types/supportConversation';

const baseProps = (): SupportTicketConversationProps => ({
  header: {
    ticketCode: '#4819',
    name: 'Helena Martins',
    status: { label: 'HUMANO', tone: 'warning' },
  },
  messages: {
    items: [
      {
        kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
        id: 'm1',
        type: SUPPORT_CHAT_MESSAGE_TYPE.USER,
        text: 'Como lanço notas?',
        time: '14:00',
      },
    ],
  },
  composer: { onSend: jest.fn() },
});

describe('SupportTicketConversation', () => {
  it('stacks header, timeline and composer', () => {
    render(<SupportTicketConversation {...baseProps()} />);

    expect(
      screen.getByRole('region', { name: 'Conversa do atendimento' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Helena Martins' })
    ).toBeInTheDocument();
    expect(screen.getByRole('log')).toHaveTextContent('Como lanço notas?');
    expect(screen.getByLabelText('Resposta')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the status banner when given', () => {
    render(
      <SupportTicketConversation
        {...baseProps()}
        banner={{
          variant: SUPPORT_STATUS_BANNER_VARIANT.WAITING,
          title: 'Aguardando resposta do backoffice',
        }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Aguardando resposta do backoffice'
    );
  });

  it('sends through the composer', () => {
    const props = baseProps();
    render(<SupportTicketConversation {...props} />);

    fireEvent.change(screen.getByLabelText('Resposta'), {
      target: { value: 'Vou verificar' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(props.composer.onSend).toHaveBeenCalledWith({
      text: 'Vou verificar',
      mode: 'USER',
    });
  });

  it('replaces the composer with the locked footer', () => {
    render(
      <SupportTicketConversation
        {...baseProps()}
        lockedMessage="Atendimento concluído. O histórico está disponível somente para leitura."
      />
    );

    expect(
      screen.getByTestId('support-ticket-conversation-locked')
    ).toHaveTextContent('Atendimento concluído.');
    expect(screen.queryByLabelText('Resposta')).not.toBeInTheDocument();
  });

  it('shows an alert above the composer', () => {
    render(
      <SupportTicketConversation
        {...baseProps()}
        alert="Não foi possível enviar"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível enviar'
    );
  });
});
