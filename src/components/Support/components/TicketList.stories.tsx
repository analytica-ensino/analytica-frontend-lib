import type { Story } from '@ladle/react';
import { useState } from 'react';
import { DeviceMobileIcon } from '@phosphor-icons/react/dist/csr/DeviceMobile';
import { TicketList, TicketListItemData } from './TicketList';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000);

const TICKETS: TicketListItemData[] = [
  {
    id: '1',
    name: 'Ana Clara Mendes',
    lastMessageAt: minutesAgo(6),
    profileLabel: 'ESTUDANTE',
    organization: 'CE Santos Dumont',
    message: 'IA: Entendi. Vou transferir você para um atendente.',
    attendanceLabel: 'HUMANO',
    channelIcon: <DeviceMobileIcon size={16} />,
    ticketCode: '#4826',
    unread: true,
  },
  {
    id: '2',
    name: 'Bruno Faria',
    lastMessageAt: minutesAgo(90),
    profileLabel: 'PROFESSOR',
    organization: 'EE Monteiro Lobato',
    message: 'Não consigo acessar o diário de classe.',
    attendanceLabel: 'IA',
    attendanceTone: 'info',
    ticketCode: '#4825',
  },
  {
    id: '3',
    name: 'Carla Dias',
    lastMessageAt: minutesAgo(60 * 50),
    profileLabel: 'GESTOR',
    organization: 'SEDUC',
    message: 'Preciso do relatório consolidado da rede.',
    attendanceLabel: 'HUMANO',
    ticketCode: '#4810',
    tone: 'danger',
  },
];

/** Lista com seleção controlada: clique para ver o tone `info` se mover. */
export const SelectableTicketList: Story = () => {
  const [selectedId, setSelectedId] = useState('1');

  return (
    <div className="max-w-xl rounded-xl border border-border-200">
      <TicketList
        tickets={TICKETS}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
};

/** Primeira carga. */
export const LoadingTicketList: Story = () => (
  <div className="max-w-xl rounded-xl border border-border-200">
    <TicketList tickets={[]} loading />
  </div>
);

/** Paginando: o que já carregou continua visível. */
export const LoadingMoreTicketList: Story = () => (
  <div className="max-w-xl rounded-xl border border-border-200">
    <TicketList tickets={TICKETS} loadingMore />
  </div>
);

/** Sem tickets. */
export const EmptyTicketList: Story = () => (
  <div className="max-w-xl rounded-xl border border-border-200">
    <TicketList tickets={[]} />
  </div>
);
