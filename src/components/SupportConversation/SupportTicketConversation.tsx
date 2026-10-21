import { LockSimpleIcon } from '@phosphor-icons/react/dist/csr/LockSimple';
import Text from '../Text/Text';
import SupportChatComposer, {
  type SupportChatComposerProps,
} from '../SupportChat/SupportChatComposer';
import SupportConversationHeader, {
  type SupportConversationHeaderProps,
} from './SupportConversationHeader';
import SupportStatusBanner, {
  type SupportStatusBannerProps,
} from './SupportStatusBanner';
import SupportConversationMessages, {
  type SupportConversationMessagesProps,
} from './SupportConversationMessages';
import { cn } from '../../utils/utils';

/**
 * Props of the SupportTicketConversation component
 */
export interface SupportTicketConversationProps {
  /** Header: code, name, status, "Atendido por", channel and details toggle */
  header: SupportConversationHeaderProps;
  /** Fixed notice on top of the timeline; omit or null to hide it */
  banner?: SupportStatusBannerProps | null;
  /** Timeline: items, loading and empty text */
  messages: SupportConversationMessagesProps;
  /** Composer of the agent reply */
  composer: SupportChatComposerProps;
  /**
   * Replaces the composer with a locked footer, e.g. "O assistente virtual
   * está atendendo. Clique em 'Responder como humano' para escrever." or
   * "Atendimento concluído. O histórico está disponível somente para leitura."
   */
  lockedMessage?: string | null;
  /** Message shown above the composer (e.g. a send error) */
  alert?: string | null;
  className?: string;
}

/**
 * Central area of the agent's ticket screen: header, status banner, message
 * timeline and composer, stacked in a full-height column. Only the timeline
 * scrolls; the header, the banner and the footer stay fixed.
 *
 * Presentational: data comes in through props and every action goes out
 * through callbacks. The details panel (SupportUserPanel) is laid out by the
 * parent, which owns `isDetailsOpen` and passes `onToggleDetails` in the
 * header props.
 *
 * @example
 * ```tsx
 * <div className="flex h-full">
 *   <SupportTicketConversation
 *     header={{ ticketCode: '#4819', name: 'Helena Martins', status,
 *       isDetailsOpen, onToggleDetails: () => setOpen((o) => !o) }}
 *     banner={{ variant: 'waiting', title: 'Aguardando resposta do backoffice' }}
 *     messages={{ items }}
 *     composer={{ onSend }}
 *   />
 *   {isDetailsOpen && <SupportUserPanel {...panel} />}
 * </div>
 * ```
 */
export default function SupportTicketConversation({
  header,
  banner,
  messages,
  composer,
  lockedMessage,
  alert,
  className,
}: Readonly<SupportTicketConversationProps>) {
  return (
    <section
      aria-label="Conversa do atendimento"
      data-testid="support-ticket-conversation"
      className={cn('flex h-full min-h-0 min-w-0 flex-1 flex-col', className)}
    >
      <SupportConversationHeader {...header} />

      {banner && (
        <div className="px-6 pt-4">
          <SupportStatusBanner {...banner} />
        </div>
      )}

      <SupportConversationMessages {...messages} />

      {alert && (
        <Text
          as="p"
          size="sm"
          role="alert"
          color="text-error-700"
          className="bg-error-50 px-6 py-2"
        >
          {alert}
        </Text>
      )}

      <footer className="border-t border-border-100 px-6 py-4">
        {lockedMessage ? (
          <div
            data-testid="support-ticket-conversation-locked"
            className="flex items-center gap-2 rounded-lg bg-background-50 px-4 py-3"
          >
            <LockSimpleIcon
              size={18}
              aria-hidden="true"
              className="shrink-0 text-text-500"
            />
            <Text size="sm" color="text-text-600">
              {lockedMessage}
            </Text>
          </div>
        ) : (
          <SupportChatComposer {...composer} />
        )}
      </footer>
    </section>
  );
}
