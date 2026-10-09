import type { Story } from '@ladle/react';
import SupportChatMessage from './SupportChatMessage';
import {
  SUPPORT_CHAT_MESSAGE_TYPE,
  SUPPORT_CHAT_SEND_STATUS,
} from '../../types/supportChat';

const LONG_TEXT =
  'Olá! Não estou conseguindo acessar as atividades da minha turma desde ontem. Já tentei sair e entrar novamente na plataforma, mas a lista continua vazia.';

const user = { name: 'Ana Maria' };
const agent = { name: 'Marina Costa' };

/**
 * All message types, short and long, as in the Figma frame
 */
export const AllTypes: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.USER}
      text="Mensagem"
      time="13:52"
      author={user}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AI}
      text="Mensagem"
      time="13:52"
      faq={{ title: 'Acesso às atividades' }}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AGENT}
      text="Mensagem"
      time="13:52"
      author={agent}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.USER}
      text={LONG_TEXT}
      time="13:52"
      author={user}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AI}
      text={LONG_TEXT}
      time="13:52"
      faq={{ title: 'Acesso às atividades', onClick: () => undefined }}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AGENT}
      text={LONG_TEXT}
      time="13:52"
      author={agent}
    />
  </div>
);

/**
 * Internal note (backoffice only)
 */
export const InternalNote: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE}
      text="Aluno já abriu outro chamado sobre o mesmo problema."
      time="13:52"
      author={agent}
    />
  </div>
);

/**
 * Messages with attachments
 */
export const WithAttachments: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.USER}
      text="Segue o print do erro"
      time="13:52"
      author={user}
      attachments={[
        {
          id: '1',
          name: 'print-erro.png',
          url: 'https://picsum.photos/seed/sac/200',
          mimeType: 'image/png',
        },
      ]}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AGENT}
      text="Segue o manual"
      time="13:53"
      author={agent}
      attachments={[
        { id: '2', name: 'manual.pdf', url: '#', mimeType: 'application/pdf' },
      ]}
    />
  </div>
);

/**
 * Sending and failed delivery states
 */
export const SendStatus: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AGENT}
      text="Enviando mensagem"
      time="13:52"
      author={agent}
      status={SUPPORT_CHAT_SEND_STATUS.SENDING}
    />
    <SupportChatMessage
      type={SUPPORT_CHAT_MESSAGE_TYPE.AGENT}
      text="Mensagem com falha"
      time="13:52"
      author={agent}
      status={SUPPORT_CHAT_SEND_STATUS.FAILED}
      onRetry={() => undefined}
    />
  </div>
);
