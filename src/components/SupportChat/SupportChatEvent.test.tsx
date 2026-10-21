import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportChatEvent from './SupportChatEvent';
import { SUPPORT_CHAT_EVENT_TYPE } from '../../types/supportChat';

const getPill = () => screen.getByTestId('support-chat-event-pill');

describe('SupportChatEvent', () => {
  it('renders a neutral pill by default', () => {
    render(<SupportChatEvent text="Atendimento passou para humano" />);

    const text = screen.getByText('Atendimento passou para humano');
    expect(text).toHaveClass('text-text-600', 'font-normal');
    expect(getPill()).toHaveClass('bg-background-100');
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('support-chat-event-line')
    ).not.toBeInTheDocument();
  });

  it.each([
    ['Atendimento iniciado via Web', '13:52'],
    ['Atendimento passou para humano', '13:49'],
    ['Concluído automaticamente pela IA', '12:44'],
  ])('renders the "%s" neutral event from the design', (text, time) => {
    render(<SupportChatEvent text={text} time={time} />);

    expect(screen.getByText(`${text} · ${time}`)).toHaveClass('text-text-600');
    expect(getPill()).toHaveClass('bg-background-100');
  });

  it('appends the time after the text', () => {
    render(
      <SupportChatEvent text="Atendimento passou para humano" time="13:49" />
    );

    expect(
      screen.getByText('Atendimento passou para humano · 13:49')
    ).toBeInTheDocument();
  });

  it.each([
    [SUPPORT_CHAT_EVENT_TYPE.AI, 'bg-primary-50', 'text-primary-700'],
    [SUPPORT_CHAT_EVENT_TYPE.SUCCESS, 'bg-success-50', 'text-success-700'],
  ])('renders the %s pill in its colors', (type, pill, text) => {
    render(<SupportChatEvent type={type} text="Evento" time="14:00" />);

    expect(screen.getByText('Evento · 14:00')).toHaveClass(text);
    expect(getPill()).toHaveClass(pill);
  });

  it('renders the transfer pill in warning colors', () => {
    render(
      <SupportChatEvent
        type={SUPPORT_CHAT_EVENT_TYPE.TRANSFER}
        text="IA transferiu para humano — motivo: não encontrou resposta na FAQ"
        time="13:45"
      />
    );

    expect(
      screen.getByText(
        'IA transferiu para humano — motivo: não encontrou resposta na FAQ · 13:45'
      )
    ).toHaveClass('text-warning-700');
    expect(getPill()).toHaveClass('bg-warning-50');
  });

  it('renders the date separator with lines on both sides', () => {
    render(
      <SupportChatEvent type={SUPPORT_CHAT_EVENT_TYPE.DATE} text="Hoje" />
    );

    expect(screen.getByRole('separator', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getAllByTestId('support-chat-event-line')).toHaveLength(2);
    expect(screen.getByText('Hoje')).toHaveClass(
      'font-medium',
      'text-text-600'
    );
    expect(getPill()).toHaveClass('bg-background-100');
  });

  it('merges a custom className on the root', () => {
    const { container } = render(
      <SupportChatEvent text="Evento" className="my-2" />
    );

    expect(container.firstChild).toHaveClass('my-2', 'justify-center');
  });
});
