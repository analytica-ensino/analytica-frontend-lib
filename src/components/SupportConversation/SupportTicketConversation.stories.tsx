import type { Story } from '@ladle/react';
import { useState } from 'react';
import SupportTicketConversation from './SupportTicketConversation';
import SupportStatusBanner from './SupportStatusBanner';
import SupportUserPanel from '../SupportUserPanel/SupportUserPanel';
import Button from '../Button/Button';
import Toaster from '../Toast/utils/Toaster';
import {
  SUPPORT_CHAT_MESSAGE_TYPE,
  SUPPORT_CHAT_REPLY_MODE,
} from '../../types/supportChat';
import {
  SUPPORT_CONVERSATION_ITEM,
  SUPPORT_STATUS_BANNER_VARIANT,
  type SupportConversationItem,
  type SupportQuickReply,
} from '../../types/supportConversation';
import {
  SUPPORT_CHANNEL,
  SUPPORT_TICKET_PRIORITY,
} from '../../types/supportUserPanel';
import { SUPPORT_TIMELINE_STATUS } from '../../types/supportTimeline';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const helena = { name: 'Helena Martins', avatarClassName: 'bg-success-700' };

/** Timeline of the Figma frame "Aguardando humano" */
const waitingItems: SupportConversationItem[] = [
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
    text: 'Como lanço notas da turma? O botão não aparece',
    time: '14:00',
    author: helena,
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
    id: 'm2',
    type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
    text: 'Olá, Helena! Sou o assistente virtual. Encontrei uma orientação que pode ajudar — confira o passo a passo e me diga se resolveu.',
    time: '14:01',
    faq: { title: 'Como lançar notas no diário', onClick: () => undefined },
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
    id: 'm3',
    type: SUPPORT_CHAT_MESSAGE_TYPE.USER,
    text: 'No meu app não existe esse botão "Lançar notas". Uso a versão 3.7.',
    time: '14:02',
    author: helena,
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
    id: 'm4',
    type: SUPPORT_CHAT_MESSAGE_TYPE.AI,
    text: 'Entendi. Vou transferir você para um atendente humano — é só aguardar um pouquinho.',
    time: '14:03',
  },
  {
    kind: SUPPORT_CONVERSATION_ITEM.TRANSFER,
    id: 'e2',
    text: 'IA transferiu para humano — motivo: não encontrou resposta na FAQ',
    time: '14:04',
  },
];

const quickReplies: SupportQuickReply[] = [
  {
    id: 'q1',
    title: 'Saudação',
    text: 'Olá! Sou da equipe de suporte e vou te ajudar a partir de agora.',
  },
  {
    id: 'q2',
    title: 'Atualizar o app',
    text: 'Essa função está disponível a partir da versão 3.8. Atualize o app na loja e tente de novo.',
  },
  {
    id: 'q3',
    title: 'Encerramento',
    text: 'Fico à disposição! Se precisar de algo mais, é só chamar.',
  },
];

const statusOptions = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'HUMANO', label: 'Humano' },
  { value: 'EM_PROGRESSO', label: 'Em progresso' },
  { value: 'CONCLUIDO', label: 'Concluído' },
];

const STATUS_BADGE: Record<
  string,
  { label: string; tone: 'warning' | 'info' | 'success' }
> = {
  ABERTO: { label: 'ABERTO', tone: 'info' },
  HUMANO: { label: 'HUMANO', tone: 'warning' },
  EM_PROGRESSO: { label: 'EM PROGRESSO', tone: 'warning' },
  CONCLUIDO: { label: 'CONCLUÍDO', tone: 'success' },
};

const attendedByOptions = [
  { value: 'HUMANO', label: 'Humano' },
  { value: 'IA', label: 'IA' },
];

const formatNow = () =>
  new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Ticket screen of the Figma: conversation plus the details panel, which the
 * header button opens and closes. Every state is interactive: replying,
 * internal notes, quick replies ("/"), status and "Atendido por".
 */
export const TicketScreen: Story = () => {
  const [status, setStatus] = useState('HUMANO');
  const [attendedBy, setAttendedBy] = useState('HUMANO');
  const [items, setItems] = useState(waitingItems);
  const [isDetailsOpen, setDetailsOpen] = useState(true);

  const done = status === 'CONCLUIDO';
  const withAi = attendedBy === 'IA' && !done;

  const takeOver = () => {
    setAttendedBy('HUMANO');
    setStatus('EM_PROGRESSO');
    setItems((list) => [
      ...list,
      {
        kind: SUPPORT_CONVERSATION_ITEM.SYSTEM,
        id: crypto.randomUUID(),
        text: 'Atendimento passou para humano',
        time: formatNow(),
      },
    ]);
  };

  const banner = (() => {
    if (done) {
      return {
        variant: SUPPORT_STATUS_BANNER_VARIANT.DONE,
        title: 'Atendimento concluído',
        description: 'Concluído por você · motivo: dúvida de uso',
      };
    }
    if (withAi) {
      return {
        variant: SUPPORT_STATUS_BANNER_VARIANT.AI,
        title: 'O assistente virtual está atendendo.',
        description: 'Você está acompanhando.',
        action: { label: 'Responder como humano', onClick: takeOver },
      };
    }
    if (status === 'HUMANO') {
      return {
        variant: SUPPORT_STATUS_BANNER_VARIANT.WAITING,
        title: 'Aguardando resposta do backoffice',
        description: 'Na fila há 17 min · transferido pela IA',
      };
    }
    return null;
  })();

  const lockedMessage = (() => {
    if (done) {
      return 'Atendimento concluído. O histórico está disponível somente para leitura.';
    }
    if (withAi) {
      return "O assistente virtual está atendendo. Clique em 'Responder como humano' para escrever.";
    }
    return null;
  })();

  return (
    <div className="flex h-[890px] bg-background">
      <SupportTicketConversation
        header={{
          ticketCode: '#4819',
          name: 'Helena Martins',
          status: STATUS_BADGE[status],
          statusOptions,
          onStatusChange: setStatus,
          attendedBy,
          attendedByOptions,
          onAttendedByChange: setAttendedBy,
          channel: { label: SUPPORT_CHANNEL.APP },
          institution: 'Rede Aprender Mais',
          isDetailsOpen,
          onToggleDetails: () => setDetailsOpen((open) => !open),
          readOnly: done,
          actions:
            status === 'EM_PROGRESSO' ? (
              <Button
                variant="solid"
                action="primary"
                size="small"
                onClick={() => setStatus('CONCLUIDO')}
              >
                Concluir
              </Button>
            ) : undefined,
        }}
        banner={banner}
        messages={{ items }}
        lockedMessage={lockedMessage}
        composer={{
          quickReplies,
          onOpenFaq: () => undefined,
          onAttachImages: () => undefined,
          onSend: ({ text, mode }) => {
            setItems((list) => [
              ...list,
              {
                kind: SUPPORT_CONVERSATION_ITEM.MESSAGE,
                id: crypto.randomUUID(),
                type:
                  mode === SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE
                    ? SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE
                    : SUPPORT_CHAT_MESSAGE_TYPE.AGENT,
                text,
                time: formatNow(),
                author: { name: 'Marina Costa' },
              },
            ]);
            if (status === 'HUMANO') setStatus('EM_PROGRESSO');
          },
        }}
      />
      {isDetailsOpen && (
        <SupportUserPanel
          className="shrink-0 border-l border-border-100"
          profile={{
            contact: {
              id: 'c-1',
              name: 'Helena Martins',
              role: 'Professora',
              institution: 'Rede Aprender Mais',
              linked: true,
              email: 'helena.martins@aprendermais.com.br',
              firstContactAt: minutesAgo(60 * 24 * 90),
              lastContactAt: minutesAgo(17),
              ticketsCount: 1,
              preferredChannel: SUPPORT_CHANNEL.APP,
              notes: [],
            },
          }}
          history={{
            currentTicketId: 4819,
            tickets: [
              {
                id: 4819,
                title: 'Lançar notas da turma',
                status: 'WAITING_HUMAN',
                createdAt: minutesAgo(21),
              },
            ],
            summary: { total: 1, resolved: 0, avgMin: null },
          }}
          ticket={{
            ticket: {
              id: 4819,
              channel: SUPPORT_CHANNEL.APP,
              openedAt: minutesAgo(21),
              done,
              priority: SUPPORT_TICKET_PRIORITY.NORMAL,
              timeline: [
                { status: SUPPORT_TIMELINE_STATUS.OPEN, at: minutesAgo(21) },
                { status: SUPPORT_TIMELINE_STATUS.HUMAN, at: minutesAgo(17) },
              ],
            },
            reasonOptions: [
              { value: 'uso', label: 'Dúvida de uso' },
              { value: 'erro', label: 'Erro na plataforma' },
            ],
          }}
        />
      )}
      <Toaster />
    </div>
  );
};

/** First load of the timeline */
export const Loading: Story = () => (
  <div className="flex h-[600px] bg-background">
    <SupportTicketConversation
      header={{
        ticketCode: '#4819',
        name: 'Helena Martins',
        status: { label: 'HUMANO', tone: 'warning' },
        channel: { label: SUPPORT_CHANNEL.WEB },
        institution: 'CE Santos Dumont',
      }}
      messages={{ items: [], loading: true }}
      composer={{ onSend: () => undefined, disabled: true }}
    />
  </div>
);

/** Every banner variant */
export const StatusBanners: Story = () => (
  <div className="flex max-w-3xl flex-col gap-3 p-6">
    <SupportStatusBanner
      variant={SUPPORT_STATUS_BANNER_VARIANT.WAITING}
      title="Aguardando resposta do backoffice"
      description="Na fila há 17 min · transferido pela IA"
    />
    <SupportStatusBanner
      variant={SUPPORT_STATUS_BANNER_VARIANT.AI}
      title="O assistente virtual está atendendo."
      description="Você está acompanhando."
      action={{ label: 'Responder como humano', onClick: () => undefined }}
    />
    <SupportStatusBanner
      variant={SUPPORT_STATUS_BANNER_VARIANT.DONE}
      title="Atendimento concluído"
      description="Concluído por você · motivo: dúvida de uso"
    />
    <SupportStatusBanner
      variant={SUPPORT_STATUS_BANNER_VARIANT.INFO}
      title="Ticket reaberto pelo usuário"
    />
  </div>
);
