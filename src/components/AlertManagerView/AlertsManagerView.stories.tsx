import { useState } from 'react';
import type { Story } from '@ladle/react';
import { AlertsManagerView, type AlertViewData } from './AlertsManagerView';
import { Button } from '../..';

export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const alertData: AlertViewData = {
    title: 'Aviso Importante - Início das Aulas',
    message:
      'As aulas do semestre 2024.1 começam na próxima segunda-feira, dia 15/01. Todos os alunos devem comparecer pontualmente às 8h.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    date: '2024-01-10',
    time: '08:00',
    sendToday: false,
    recipientCategories: {
      alunos: {
        selectedIds: ['1', '2', '3'],
        allSelected: false,
      },
    },
    sentAt: '2024-01-10T08:00:00',
    recipients: [
      { id: '1', name: 'João Silva', status: 'viewed' },
      { id: '2', name: 'Maria Santos', status: 'viewed' },
      { id: '3', name: 'Pedro Oliveira', status: 'pending' },
      { id: '4', name: 'Ana Costa', status: 'viewed' },
      { id: '5', name: 'Carlos Ferreira', status: 'pending' },
      { id: '6', name: 'Juliana Lima', status: 'viewed' },
      { id: '7', name: 'Lucas Souza', status: 'pending' },
      { id: '8', name: 'Fernanda Rocha', status: 'viewed' },
      { id: '9', name: 'Rafael Almeida', status: 'pending' },
      { id: '10', name: 'Beatriz Dias', status: 'viewed' },
    ],
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Button onClick={() => setIsOpen(true)}>Visualizar Alerta</Button>
      <AlertsManagerView
        alertData={alertData}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
      />
    </div>
  );
};

export const ManyRecipients: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const recipients = Array.from({ length: 30 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Destinatário ${i + 1}`,
    status: i % 2 === 0 ? ('viewed' as const) : ('pending' as const),
  }));

  const totalPages = Math.ceil(recipients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRecipients = recipients.slice(startIndex, endIndex);

  const alertData: AlertViewData = {
    title: 'Aviso com Muitos Destinatários',
    message:
      'Este é um aviso que foi enviado para 30 destinatários diferentes. A tabela deve mostrar apenas 10 destinatários por página.',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    date: '2024-01-10',
    time: '08:00',
    sendToday: false,
    recipientCategories: {
      alunos: {
        selectedIds: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
        allSelected: false,
      },
    },
    sentAt: '2024-01-10T08:00:00',
    recipients: paginatedRecipients,
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Button onClick={() => setIsOpen(true)}>Visualizar Alerta</Button>
      <AlertsManagerView
        alertData={alertData}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export const AllViewed: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const alertData: AlertViewData = {
    title: 'Todos Visualizaram',
    message: 'Este aviso foi visualizado por todos os destinatários.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    date: '2024-01-10',
    time: '08:00',
    sendToday: false,
    recipientCategories: {
      alunos: {
        selectedIds: ['1', '2', '3', '4', '5'],
        allSelected: false,
      },
    },
    sentAt: '2024-01-10T08:00:00',
    recipients: [
      { id: '1', name: 'João Silva', status: 'viewed' },
      { id: '2', name: 'Maria Santos', status: 'viewed' },
      { id: '3', name: 'Pedro Oliveira', status: 'viewed' },
      { id: '4', name: 'Ana Costa', status: 'viewed' },
      { id: '5', name: 'Carlos Ferreira', status: 'viewed' },
    ],
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Button onClick={() => setIsOpen(true)}>Visualizar Alerta</Button>
      <AlertsManagerView
        alertData={alertData}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
      />
    </div>
  );
};

export const AllPending: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const alertData: AlertViewData = {
    title: 'Nenhum Visualizou',
    message:
      'Este aviso foi enviado recentemente e ainda não foi visualizado por nenhum destinatário.',
    image: undefined, // Exemplo sem imagem
    date: '2024-01-10',
    time: '08:00',
    sendToday: false,
    recipientCategories: {
      alunos: {
        selectedIds: ['1', '2', '3'],
        allSelected: false,
      },
    },
    sentAt: '2024-01-10T08:00:00',
    recipients: [
      { id: '1', name: 'João Silva', status: 'pending' },
      { id: '2', name: 'Maria Santos', status: 'pending' },
      { id: '3', name: 'Pedro Oliveira', status: 'pending' },
    ],
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Button onClick={() => setIsOpen(true)}>Visualizar Alerta</Button>
      <AlertsManagerView
        alertData={alertData}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
      />
    </div>
  );
};
