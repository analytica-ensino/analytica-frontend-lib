import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportChatMessage, {
  type SupportChatMessageProps,
} from './SupportChatMessage';
import {
  SUPPORT_CHAT_MESSAGE_TYPE,
  SUPPORT_CHAT_SEND_STATUS,
} from '../../types/supportChat';

const renderMessage = (overrides: Partial<SupportChatMessageProps> = {}) =>
  render(
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.USER}
      text="Mensagem"
      time="13:52"
      author={{ name: 'Ana Maria' }}
      {...overrides}
    />
  );

const getBubble = () => screen.getByTestId('support-chat-message-bubble');

describe('SupportChatMessage', () => {
  describe('USER', () => {
    it('renders text, time and initials avatar on the left', () => {
      const { container } = renderMessage();

      expect(screen.getByText('Mensagem')).toBeInTheDocument();
      expect(screen.getByText('13:52')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Ana Maria' })).toHaveTextContent(
        'AM'
      );
      expect(container.firstChild).toHaveClass('justify-start');
      expect(getBubble()).toHaveClass('bg-background-100');
      expect(screen.queryByText('Assistente virtual')).not.toBeInTheDocument();
    });

    it('uses custom initials and avatar color when provided', () => {
      renderMessage({
        author: {
          name: 'Ana Maria',
          initials: 'XY',
          avatarClassName: 'bg-success-500',
        },
      });

      const avatar = screen.getByRole('img', { name: 'Ana Maria' });
      expect(avatar).toHaveTextContent('XY');
      expect(avatar).toHaveClass('bg-success-500');
    });

    it('renders without avatar when there is no author', () => {
      renderMessage({ author: undefined });

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('merges a custom className on the root', () => {
      const { container } = renderMessage({ className: 'mt-4' });

      expect(container.firstChild).toHaveClass('mt-4');
    });
  });

  describe('AI', () => {
    it('renders the label and the sparkle avatar on the left', () => {
      const { container } = renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
        author: undefined,
      });

      expect(screen.getByText('Assistente virtual')).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: 'Assistente virtual' })
      ).toContainElement(screen.getByTestId('support-chat-ai-sparkle'));
      expect(screen.getByTestId('support-chat-ai-sparkle')).toHaveAttribute(
        'width',
        '12'
      );
      expect(container.firstChild).toHaveClass('justify-start');
      expect(getBubble()).toHaveClass('bg-primary-50/60');
      expect(screen.queryByText(/Baseado na FAQ/)).not.toBeInTheDocument();
    });

    it('renders the FAQ reference as text when not clickable', () => {
      renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
        faq: { title: 'Como redefinir a senha' },
      });

      expect(
        screen.getByText('Baseado na FAQ: Como redefinir a senha')
      ).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders the FAQ reference as a button when clickable', () => {
      const onClick = jest.fn();
      renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
        faq: { title: 'Como redefinir a senha', onClick },
      });

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Baseado na FAQ: Como redefinir a senha',
        })
      );
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('ignores the FAQ reference for non-AI messages', () => {
      renderMessage({ faq: { title: 'Senha' } });

      expect(screen.queryByText(/Baseado na FAQ/)).not.toBeInTheDocument();
    });
  });

  describe('AGENT', () => {
    it('renders name, white text and avatar on the right', () => {
      const { container } = renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.AGENT,
        author: { name: 'Marina Costa' },
      });

      expect(container.firstChild).toHaveClass('justify-end');
      expect(screen.getByText('Marina Costa')).toBeInTheDocument();
      expect(screen.getByText('Mensagem')).toHaveClass('text-white');
      expect(
        screen.getByRole('img', { name: 'Marina Costa' })
      ).toHaveTextContent('MC');
      expect(getBubble()).toHaveClass('bg-primary-950');
    });

    it('renders without name when there is no author', () => {
      renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.AGENT,
        author: undefined,
      });

      expect(screen.getByText('Mensagem')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('INTERNAL_NOTE', () => {
    it('renders the note label with the author on the right', () => {
      const { container } = renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE,
        author: { name: 'Marina Costa' },
      });

      expect(container.firstChild).toHaveClass('justify-end');
      expect(
        screen.getByText('Nota interna · Marina Costa')
      ).toBeInTheDocument();
      expect(getBubble()).toHaveClass('bg-exam-3');
    });

    it('renders the note label without author', () => {
      renderMessage({
        type: SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE,
        author: undefined,
      });

      expect(screen.getByText('Nota interna')).toBeInTheDocument();
    });
  });

  describe('attachments', () => {
    const attachments = [
      {
        id: '1',
        name: 'print.png',
        url: 'https://cdn.test/print.png',
        mimeType: 'image/png',
      },
      { id: '2', name: 'boleto.pdf', url: 'https://cdn.test/boleto.pdf' },
    ];

    it('renders image thumbnails and file links', () => {
      renderMessage({ attachments });

      expect(screen.getByAltText('print.png')).toHaveAttribute(
        'src',
        'https://cdn.test/print.png'
      );
      expect(screen.getByText('boleto.pdf').closest('a')).toHaveAttribute(
        'href',
        'https://cdn.test/boleto.pdf'
      );
      expect(screen.queryByAltText('boleto.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('print.png')).toHaveClass('text-text-700');
    });

    it('uses light text for attachments on agent messages', () => {
      renderMessage({ type: SUPPORT_CHAT_MESSAGE_TYPE.AGENT, attachments });

      expect(screen.getByText('boleto.pdf')).toHaveClass('text-white');
    });

    it('renders nothing for an empty attachment list', () => {
      renderMessage({ attachments: [] });

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('send status', () => {
    it('shows the sending state', () => {
      renderMessage({ status: SUPPORT_CHAT_SEND_STATUS.SENDING });

      expect(screen.getByText('Enviando…')).toBeInTheDocument();
      expect(getBubble()).toHaveClass('opacity-60');
    });

    it('shows the failed state and retries on click', () => {
      const onRetry = jest.fn();
      renderMessage({ status: SUPPORT_CHAT_SEND_STATUS.FAILED, onRetry });

      expect(screen.getByText('Falha no envio')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('hides the retry button when onRetry is not provided', () => {
      renderMessage({ status: SUPPORT_CHAT_SEND_STATUS.FAILED });

      expect(screen.getByText('Falha no envio')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Tentar novamente' })
      ).not.toBeInTheDocument();
    });

    it('shows no status for sent messages', () => {
      renderMessage();

      expect(screen.queryByText('Enviando…')).not.toBeInTheDocument();
      expect(screen.queryByText('Falha no envio')).not.toBeInTheDocument();
      expect(getBubble()).not.toHaveClass('opacity-60');
    });
  });
});
