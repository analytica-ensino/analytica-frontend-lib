import type { Story } from '@ladle/react';
import SupportChatEvent from './SupportChatEvent';
import { SUPPORT_CHAT_EVENT_TYPE } from '../../types/supportChat';

/**
 * The three event types, as in the Figma frame
 */
export const AllTypes: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatEvent text="Evento" />
    <SupportChatEvent type={SUPPORT_CHAT_EVENT_TYPE.TRANSFER} text="Evento" />
    <SupportChatEvent type={SUPPORT_CHAT_EVENT_TYPE.DATE} text="Evento" />
  </div>
);

/**
 * Real messenger examples
 */
export const InConversation: Story = () => (
  <div className="flex w-full max-w-3xl flex-col gap-4 p-4">
    <SupportChatEvent type={SUPPORT_CHAT_EVENT_TYPE.DATE} text="Hoje" />
    <SupportChatEvent
      type={SUPPORT_CHAT_EVENT_TYPE.TRANSFER}
      text="IA transferiu para humano — motivo: não encontrou resposta na FAQ"
      time="13:45"
    />
    <SupportChatEvent text="Atendimento passou para humano" time="13:49" />
  </div>
);
