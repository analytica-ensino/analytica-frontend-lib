import type { Story } from '@ladle/react';
import { useState } from 'react';
import NotificationCard from './NotificationCard';

/**
 * Notificação não lida (com indicador azul)
 */
export const Unread: Story = () => {
  const [isRead, setIsRead] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return (
      <div className="max-w-md border border-border-100 rounded-xl p-4 text-center text-text-600">
        Notificação deletada
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      <NotificationCard
        title="Nova atividade disponível"
        message="Uma nova tarefa foi adicionada à sua lista. Não perca a chance de se aprofundar no conteúdo!"
        time="Há 3h"
        isRead={isRead}
        onMarkAsRead={() => {
          setIsRead(true);
          console.log('Marked as read');
        }}
        onDelete={() => {
          setIsDeleted(true);
          console.log('Deleted');
        }}
      />
    </div>
  );
};

/**
 * Notificação já lida (sem indicador)
 */
export const Read: Story = () => {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return (
      <div className="max-w-md border border-border-100 rounded-xl p-4 text-center text-text-600">
        Notificação deletada
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      <NotificationCard
        title="Nova atividade disponível"
        message="Uma nova tarefa foi adicionada à sua lista."
        time="12 Fev"
        isRead={true}
        onMarkAsRead={() => console.log('Marked as read')}
        onDelete={() => {
          setIsDeleted(true);
          console.log('Deleted');
        }}
      />
    </div>
  );
};

/**
 * Notificação com conteúdo longo
 */
export const LongContent: Story = () => {
  const [isRead, setIsRead] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return (
      <div className="max-w-md border border-border-100 rounded-xl p-4 text-center text-text-600">
        Notificação deletada
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      <NotificationCard
        title="Nova atividade de física quântica disponível para estudantes avançados"
        message="Uma nova tarefa complexa de física quântica foi adicionada à sua lista de estudos. Esta atividade aborda conceitos avançados como superposição, entrelaçamento quântico e o princípio da incerteza de Heisenberg."
        time="Há 1 dia"
        isRead={isRead}
        actionLabel="Iniciar atividade"
        onNavigate={() => console.log('Navigate to activity')}
        onMarkAsRead={() => {
          setIsRead(true);
          console.log('Marked as read');
        }}
        onDelete={() => {
          setIsDeleted(true);
          console.log('Deleted');
        }}
      />
    </div>
  );
};

/**
 * Notificação tipo anúncio do sistema
 */
export const Announcement: Story = () => {
  const [isRead, setIsRead] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return (
      <div className="max-w-md border border-border-100 rounded-xl p-4 text-center text-text-600">
        Notificação deletada
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      <NotificationCard
        title="Sistema será atualizado"
        message="O sistema ficará indisponível das 02:00 às 06:00 para manutenção programada."
        time="Há 12h"
        isRead={isRead}
        onMarkAsRead={() => {
          setIsRead(true);
          console.log('Marked as read');
        }}
        onDelete={() => {
          setIsDeleted(true);
          console.log('Deleted');
        }}
      />
    </div>
  );
};

/**
 * Lista de notificações empilhadas
 */
export const Multiple: Story = () => {
  const [notification1IsRead, setNotification1IsRead] = useState(false);
  const [notification2IsRead, setNotification2IsRead] = useState(true);
  const [notification3IsRead, setNotification3IsRead] = useState(false);

  const [notification1IsDeleted, setNotification1IsDeleted] = useState(false);
  const [notification2IsDeleted, setNotification2IsDeleted] = useState(false);
  const [notification3IsDeleted, setNotification3IsDeleted] = useState(false);

  const allDeleted =
    notification1IsDeleted && notification2IsDeleted && notification3IsDeleted;

  if (allDeleted) {
    return (
      <div className="max-w-md border border-border-100 rounded-xl p-4 text-center text-text-600">
        Todas as notificações foram deletadas
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      {!notification1IsDeleted && (
        <NotificationCard
          title="Nova atividade disponível"
          message="Uma nova tarefa foi adicionada à sua lista."
          time="Há 3h"
          isRead={notification1IsRead}
          onMarkAsRead={() => {
            setNotification1IsRead(true);
            console.log('Marked as read');
          }}
          onDelete={() => {
            setNotification1IsDeleted(true);
            console.log('Deleted');
          }}
        />
      )}
      {!notification2IsDeleted && (
        <NotificationCard
          title="Nova atividade disponível"
          message="Uma nova tarefa foi adicionada à sua lista."
          time="Há 4h"
          isRead={notification2IsRead}
          onMarkAsRead={() => {
            setNotification2IsRead(true);
            console.log('Marked as read');
          }}
          onDelete={() => {
            setNotification2IsDeleted(true);
            console.log('Deleted');
          }}
        />
      )}
      {!notification3IsDeleted && (
        <NotificationCard
          title="Nova trilha disponível"
          message="Explore a nova trilha de matemática."
          time="12 Fev"
          isRead={notification3IsRead}
          actionLabel="Ver trilha"
          onNavigate={() => console.log('Navigate')}
          onMarkAsRead={() => {
            setNotification3IsRead(true);
            console.log('Marked as read');
          }}
          onDelete={() => {
            setNotification3IsDeleted(true);
            console.log('Deleted');
          }}
        />
      )}
    </div>
  );
};

/**
 * Estado de carregamento
 */
export const Loading: Story = () => (
  <div className="max-w-md border border-border-100 rounded-xl">
    <NotificationCard loading={true} />
  </div>
);

/**
 * Estado de erro
 */
export const Error: Story = () => (
  <div className="max-w-md border border-border-100 rounded-xl">
    <NotificationCard
      error="Erro ao carregar notificações"
      onRetry={() => console.log('Retry loading')}
    />
  </div>
);

/**
 * Lista agrupada por tempo
 */
export const Grouped: Story = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Nova atividade disponível',
      message: 'Uma nova tarefa foi adicionada à sua lista.',
      time: 'Há 3h',
      isRead: false,
      createdAt: new Date(),
      entityType: 'activity',
      entityId: 'act-123',
    },
    {
      id: '2',
      title: 'Nova trilha disponível',
      message: 'Explore a nova trilha de matemática.',
      time: 'Há 4h',
      isRead: true,
      createdAt: new Date(),
      entityType: 'trail',
      entityId: 'trail-456',
    },
    {
      id: '3',
      title: 'Sistema será atualizado',
      message: 'Manutenção programada.',
      time: '2 dias atrás',
      isRead: false,
      createdAt: new Date(),
    },
  ]);

  const groupedNotifications = [
    {
      label: 'Hoje',
      notifications: notifications.filter((n) => n.id === '1' || n.id === '2'),
    },
    {
      label: 'Última semana',
      notifications: notifications.filter((n) => n.id === '3'),
    },
  ];

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    console.log('Mark as read:', id);
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    console.log('Delete:', id);
  };

  return (
    <div className="max-w-md border border-border-100 rounded-xl">
      <NotificationCard
        groupedNotifications={groupedNotifications}
        onMarkAsReadById={handleMarkAsRead}
        onDeleteById={handleDelete}
        onNavigateById={(entityType, entityId) =>
          console.log('Navigate:', entityType, entityId)
        }
        getActionLabel={(entityType) => {
          if (entityType === 'activity') return 'Ver atividade';
          if (entityType === 'trail') return 'Ver trilha';
          return undefined;
        }}
      />
    </div>
  );
};
