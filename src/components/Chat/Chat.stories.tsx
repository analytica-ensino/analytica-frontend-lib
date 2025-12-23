import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Chat } from './Chat';
import { PROFILE_ROLES } from '../../types/chat';
import type {
  ChatApiClient,
  ChatRoomWithDetails,
  ChatUser,
} from '../../types/chat';

// Mock data
const mockRooms: ChatRoomWithDetails[] = [
  {
    id: 'room-1',
    name: 'Matematica - Turma A',
    classId: 'class-1',
    createdById: 'user-1',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-2',
      senderName: 'Maria Silva',
      senderPhoto: null,
      senderRole: 'STUDENT',
      content: 'Professor, tenho uma duvida sobre a prova',
      messageType: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    participantCount: 5,
  },
  {
    id: 'room-2',
    name: 'Fisica - Turma B',
    classId: 'class-2',
    createdById: 'user-1',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: {
      id: 'msg-2',
      senderId: 'user-3',
      senderName: 'Joao Santos',
      senderPhoto: 'https://i.pravatar.cc/150?img=3',
      senderRole: 'STUDENT',
      content: 'Obrigado pela explicacao!',
      messageType: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    participantCount: 3,
  },
  {
    id: 'room-3',
    name: 'Quimica - Monitoria',
    classId: 'class-3',
    createdById: 'user-1',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: null,
    participantCount: 2,
  },
];

const mockAvailableUsers: ChatUser[] = [
  {
    userInstitutionId: 'user-2',
    name: 'Maria Silva',
    photo: null,
    profileName: 'Aluno',
  },
  {
    userInstitutionId: 'user-3',
    name: 'Joao Santos',
    photo: 'https://i.pravatar.cc/150?img=3',
    profileName: 'Aluno',
  },
  {
    userInstitutionId: 'user-4',
    name: 'Ana Paula',
    photo: 'https://i.pravatar.cc/150?img=5',
    profileName: 'Aluno',
  },
  {
    userInstitutionId: 'user-5',
    name: 'Carlos Eduardo',
    photo: null,
    profileName: 'Professor',
  },
];

// Mock API client that returns mock data
const createMockApiClient = (
  rooms: ChatRoomWithDetails[] = mockRooms,
  users: ChatUser[] = mockAvailableUsers
): ChatApiClient => ({
  get: async <T,>(url: string): Promise<{ data: T }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (url.includes('/rooms')) {
      return { data: rooms as T };
    }
    if (url.includes('/users')) {
      return { data: users as T };
    }
    return { data: [] as T };
  },
  post: async <T,>(): Promise<{ data: T }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        id: 'new-room',
        name: 'Nova Conversa',
        classId: 'class-1',
        createdById: 'user-1',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
        participantCount: 2,
      } as T,
    };
  },
});

// Mock API client with error
const createErrorApiClient = (): ChatApiClient => ({
  get: async <T,>(): Promise<{ data: T }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new Error('Erro ao carregar conversas');
  },
  post: async <T,>(): Promise<{ data: T }> => {
    throw new Error('Erro ao criar conversa');
  },
});

// Mock API client with loading state
const createLoadingApiClient = (): ChatApiClient => ({
  get: async <T,>(): Promise<{ data: T }> => {
    // Never resolves to show loading state
    await new Promise(() => {});
    return { data: [] as T };
  },
  post: async <T,>(): Promise<{ data: T }> => {
    await new Promise(() => {});
    return { data: {} as T };
  },
});

// Mock API client with empty data
const createEmptyApiClient = (): ChatApiClient => ({
  get: async <T,>(): Promise<{ data: T }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: [] as T };
  },
  post: async <T,>(): Promise<{ data: T }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: {} as T };
  },
});

/**
 * Showcase principal: Chat component
 */
export const AllChats: Story = () => {
  const [roomId, setRoomId] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-bold text-3xl text-text-900">Chat</h2>
      <p className="text-text-700">
        Componente de chat em tempo real com suporte a múltiplas salas
      </p>

      <h3 className="font-bold text-2xl text-text-900">Professor View</h3>
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl"
        initialRoomId={roomId}
        onRoomChange={(id) => {
          console.log('Room changed:', id);
          setRoomId(id);
        }}
        onBackToList={() => {
          console.log('Back to list');
          setRoomId(undefined);
        }}
      />

      <h3 className="font-bold text-2xl text-text-900 mt-8">Student View</h3>
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-2"
        userName="Maria Silva"
        userPhoto={null}
        userRole={PROFILE_ROLES.STUDENT}
        className="max-w-4xl"
      />
    </div>
  );
};

/**
 * Chat com usuário professor
 */
export const TeacherView: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat com usuário aluno
 */
export const StudentView: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-2"
        userName="Maria Silva"
        userPhoto={null}
        userRole={PROFILE_ROLES.STUDENT}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat em estado de loading (sem userId/token)
 */
export const LoadingState: Story = () => {
  return (
    <div className="p-4">
      <h3 className="font-bold text-xl text-text-900 mb-4">
        Estado de Loading (sem userId)
      </h3>
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId=""
        userName="Usuario"
        userPhoto={null}
        userRole={PROFILE_ROLES.STUDENT}
        className="max-w-4xl mx-auto"
      />

      <h3 className="font-bold text-xl text-text-900 mb-4 mt-8">
        Estado de Loading (sem token)
      </h3>
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token=""
        userId="user-1"
        userName="Usuario"
        userPhoto={null}
        userRole={PROFILE_ROLES.STUDENT}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat carregando salas
 */
export const LoadingRooms: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createLoadingApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto={null}
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat com erro ao carregar salas
 */
export const ErrorState: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createErrorApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto={null}
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat sem conversas
 */
export const EmptyState: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createEmptyApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat com foto do usuário
 */
export const WithUserPhoto: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat sem foto do usuário (mostra iniciais)
 */
export const WithoutUserPhoto: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto={null}
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat com initialRoomId (abre direto na sala)
 */
export const WithInitialRoom: Story = () => {
  return (
    <div className="p-4">
      <p className="text-text-700 mb-4">
        O chat abrirá diretamente na sala "room-1" (Matematica - Turma A)
      </p>
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
        initialRoomId="room-1"
        onRoomChange={(id) => console.log('Room changed:', id)}
        onBackToList={() => console.log('Back to list')}
      />
    </div>
  );
};

/**
 * Chat com muitas salas
 */
export const ManyRooms: Story = () => {
  const manyRooms: ChatRoomWithDetails[] = Array.from(
    { length: 15 },
    (_, i) => ({
      id: `room-${i + 1}`,
      name: `Sala de Aula ${i + 1}`,
      classId: `class-${i + 1}`,
      createdById: 'user-1',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage:
        i % 2 === 0
          ? {
              id: `msg-${i}`,
              senderId: `user-${i + 2}`,
              senderName: `Aluno ${i + 1}`,
              senderPhoto: null,
              senderRole: 'STUDENT',
              content: `Mensagem da sala ${i + 1}`,
              messageType: 'text',
              createdAt: new Date(
                Date.now() - 1000 * 60 * (i + 1)
              ).toISOString(),
            }
          : null,
      participantCount: i + 2,
    })
  );

  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient(manyRooms)}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

/**
 * Chat com customização de className
 */
export const CustomClassName: Story = () => {
  return (
    <div className="p-4">
      <Chat
        apiClient={createMockApiClient()}
        wsUrl="wss://example.com/chat/ws"
        token="mock-token"
        userId="user-1"
        userName="Professor Carlos"
        userPhoto="https://i.pravatar.cc/150?img=12"
        userRole={PROFILE_ROLES.TEACHER}
        className="max-w-2xl mx-auto shadow-xl"
      />
    </div>
  );
};
