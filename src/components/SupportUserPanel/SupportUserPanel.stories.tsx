import type { Story } from '@ladle/react';
import { useState } from 'react';
import SupportUserPanel from './SupportUserPanel';
import Toaster from '../Toast/utils/Toaster';
import {
  SUPPORT_CHANNEL,
  SUPPORT_TICKET_CARD_STATUS,
  SUPPORT_TICKET_PRIORITY,
  type SupportContact,
  type SupportTicketDetails,
  type SupportTicketSummary,
} from '../../types/supportUserPanel';
import { SUPPORT_TIMELINE_STATUS } from '../../types/supportTimeline';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const contact: SupportContact = {
  id: 'c-1',
  name: 'Mariana Costa',
  role: 'Estudante',
  institution: 'Rede Aprender Mais',
  linked: true,
  email: 'mariana.costa@aprendermais.com.br',
  phone: '11987654321',
  tags: ['3º ano', 'Vestibular'],
  classOrPosition: '3º ano B — Ensino Médio',
  firstContactAt: daysAgo(120),
  lastContactAt: minutesAgo(30),
  ticketsCount: 7,
  device: 'Android 14 · Moto G54',
  preferredChannel: SUPPORT_CHANNEL.APP,
  notes: [
    {
      id: 'n-1',
      text: 'Prefere ser atendida pelo WhatsApp à noite.',
      author: 'Carla',
      createdAt: daysAgo(10),
    },
  ],
};

const tickets: SupportTicketSummary[] = [
  {
    id: 4821,
    title: 'Não consigo acessar o simulado de matemática',
    reason: 'Acesso',
    subreason: 'Simulado bloqueado',
    status: SUPPORT_TICKET_CARD_STATUS.IN_PROGRESS,
    createdAt: minutesAgo(25),
  },
  {
    id: 4710,
    title: 'Nota da redação não apareceu',
    reason: 'Redação',
    subreason: 'Correção',
    status: SUPPORT_TICKET_CARD_STATUS.DONE,
    createdAt: daysAgo(6),
    resolvedBy: { type: 'agent', name: 'Carla' },
    durationMin: 32,
  },
  {
    id: 4502,
    title: 'Como redefinir minha senha?',
    reason: 'Login',
    subreason: 'Senha',
    status: SUPPORT_TICKET_CARD_STATUS.DONE,
    createdAt: daysAgo(30),
    resolvedBy: { type: 'ai' },
    durationMin: 3,
  },
];

const ticket: SupportTicketDetails = {
  id: 4821,
  channel: SUPPORT_CHANNEL.APP,
  openedAt: minutesAgo(25),
  firstHumanAt: minutesAgo(18),
  done: false,
  reason: null,
  priority: SUPPORT_TICKET_PRIORITY.NORMAL,
  tags: [],
  aiSummary:
    'A aluna não consegue abrir o simulado de matemática liberado hoje. Já tentou sair e entrar de novo e limpar o cache do app.',
  timeline: [
    { status: SUPPORT_TIMELINE_STATUS.OPEN, at: minutesAgo(25) },
    { status: SUPPORT_TIMELINE_STATUS.HUMAN, at: minutesAgo(20) },
    { status: SUPPORT_TIMELINE_STATUS.IN_PROGRESS, at: minutesAgo(18) },
  ],
};

const reasonOptions = [
  { value: 'acesso', label: 'Acesso' },
  { value: 'login', label: 'Login' },
  { value: 'redacao', label: 'Redação' },
  { value: 'conteudo', label: 'Conteúdo' },
];

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-[890px] justify-end bg-background-50">
    {children}
    <Toaster />
  </div>
);

/**
 * Open ticket, every tab interactive (saves resolve after 400ms)
 */
export const Default: Story = () => {
  const [contactState, setContact] = useState(contact);
  const [ticketState, setTicket] = useState(ticket);

  return (
    <Frame>
      <SupportUserPanel
        profile={{
          contact: contactState,
          onOpenContact: () => undefined,
          onAddTag: (tag) =>
            setContact((c) => ({ ...c, tags: [...c.tags, tag] })),
          onRemoveTag: (tag) =>
            setContact((c) => ({
              ...c,
              tags: c.tags.filter((t) => t !== tag),
            })),
          onAddNote: async (text) => {
            await wait();
            setContact((c) => ({
              ...c,
              notes: [
                ...c.notes,
                {
                  id: crypto.randomUUID(),
                  text,
                  author: 'Você',
                  createdAt: new Date().toISOString(),
                },
              ],
            }));
          },
        }}
        history={{
          currentTicketId: 4821,
          tickets,
          summary: { total: 3, resolved: 2, avgMin: 18 },
          onOpenTicket: () => undefined,
        }}
        ticket={{
          ticket: ticketState,
          reasonOptions,
          onReasonChange: async (reason) => {
            await wait();
            setTicket((t) => ({ ...t, reason }));
          },
          onPriorityChange: async (priority) => {
            await wait();
            setTicket((t) => ({ ...t, priority }));
          },
          onAddTag: (tag) =>
            setTicket((t) => ({ ...t, tags: [...t.tags, tag] })),
          onRemoveTag: (tag) =>
            setTicket((t) => ({ ...t, tags: t.tags.filter((x) => x !== tag) })),
        }}
      />
    </Frame>
  );
};

/**
 * Saves fail: priority/reason roll back with an error toast
 */
export const SaveFails: Story = () => (
  <Frame>
    <SupportUserPanel
      profile={{ contact }}
      history={{
        currentTicketId: 4821,
        tickets,
        summary: { total: 3, resolved: 2, avgMin: 18 },
      }}
      ticket={{
        ticket,
        reasonOptions,
        onReasonChange: () => Promise.reject(new Error('offline')),
        onPriorityChange: () => Promise.reject(new Error('offline')),
      }}
    />
  </Frame>
);

/**
 * Concluded ticket: fields are read-only and counters stop
 */
export const ConcludedTicket: Story = () => (
  <Frame>
    <SupportUserPanel
      profile={{ contact: { ...contact, linked: false, phone: null } }}
      history={{
        currentTicketId: 4710,
        tickets: [tickets[1]],
        summary: { total: 1, resolved: 1, avgMin: 32 },
      }}
      ticket={{
        ticket: {
          ...ticket,
          done: true,
          reason: 'redacao',
          priority: SUPPORT_TICKET_PRIORITY.HIGH,
          tags: ['urgente'],
          closedAt: minutesAgo(1),
          aiSummary: null,
          timeline: [
            ...ticket.timeline,
            { status: SUPPORT_TIMELINE_STATUS.DONE, at: minutesAgo(1) },
          ],
        },
        reasonOptions,
      }}
    />
  </Frame>
);

/**
 * Loading state on every tab
 */
export const Loading: Story = () => (
  <Frame>
    <SupportUserPanel
      profile={{ loading: true }}
      history={{
        currentTicketId: 4821,
        tickets: [],
        summary: { total: 0, resolved: 0, avgMin: null },
        loading: true,
      }}
      ticket={{ loading: true, reasonOptions }}
    />
  </Frame>
);
