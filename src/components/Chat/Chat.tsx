import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PaperPlaneTiltIcon,
  XIcon,
  PlusIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Modal from '../Modal/Modal';
import { SkeletonText, SkeletonRounded } from '../Skeleton/Skeleton';
import EmptyState from '../EmptyState/EmptyState';
import { useChat } from '../../hooks/useChat';
import { useChatRooms } from '../../hooks/useChatRooms';
import {
  PROFILE_ROLES,
  CHAT_MESSAGE_TYPES,
  type ChatApiClient,
  type ChatRoomWithDetails,
  type ChatMessage,
  type ChatParticipant,
  type ChatUser,
} from '../../types/chat';
import { cn } from '../../utils/utils';

/**
 * Props for the Chat component
 */
export interface ChatProps {
  /** API client for REST calls */
  apiClient: ChatApiClient;
  /** WebSocket URL for real-time messaging */
  wsUrl: string;
  /** JWT authentication token */
  token: string;
  /** Current user's userInstitutionId */
  userId: string;
  /** Current user's display name */
  userName: string;
  /** Current user's profile photo URL */
  userPhoto?: string | null;
  /** Current user's role */
  userRole: PROFILE_ROLES;
  /** Additional CSS classes */
  className?: string;
  /** Initial room ID to open (from URL) */
  initialRoomId?: string;
  /** Callback when room changes (for URL navigation) */
  onRoomChange?: (roomId: string) => void;
  /** Callback when returning to room list */
  onBackToList?: () => void;
}

/**
 * Chat view states
 */
type ChatView = 'list' | 'room' | 'create';

/**
 * Room item component for the list
 */
const RoomItem = ({
  room,
  onClick,
  isActive,
}: {
  room: ChatRoomWithDetails;
  onClick: () => void;
  isActive: boolean;
}) => (
  <Button
    variant="link"
    onClick={onClick}
    className={cn(
      'w-full p-3 rounded-lg text-left transition-colors justify-start h-auto',
      'hover:bg-background-100',
      isActive && 'bg-primary-50 border-l-4 border-primary-500'
    )}
  >
    <div className="flex items-start gap-3 w-full">
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <UsersIcon size={20} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-900 truncate">
          {room.name}
        </Text>
        {room.lastMessage && (
          <Text size="xs" className="text-text-500 truncate mt-1">
            {room.lastMessage.senderName}: {room.lastMessage.content}
          </Text>
        )}
        <Text size="xs" className="text-text-400 mt-1">
          {room.participantCount} participantes
        </Text>
      </div>
    </div>
  </Button>
);

/**
 * Message bubble component
 */
const MessageBubble = ({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) => (
  <div className={cn('flex gap-2 mb-3', isOwn && 'flex-row-reverse')}>
    {!isOwn && (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        {message.senderPhoto ? (
          <img
            src={message.senderPhoto}
            alt={message.senderName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <Text size="xs" weight="bold" className="text-gray-600">
            {message.senderName.charAt(0).toUpperCase()}
          </Text>
        )}
      </div>
    )}
    <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
      {!isOwn && (
        <Text size="xs" className="text-text-500 mb-1">
          {message.senderName}
        </Text>
      )}
      <div
        className={cn(
          'px-4 py-2 rounded-2xl',
          isOwn
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-background-100 text-text-900 rounded-bl-md'
        )}
      >
        <Text size="sm">{message.content}</Text>
      </div>
      <Text
        size="xs"
        className={cn('text-text-400 mt-1', isOwn && 'text-right')}
      >
        {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </div>
  </div>
);

/**
 * Participant item component
 */
const ParticipantItem = ({ participant }: { participant: ChatParticipant }) => (
  <div className="flex items-center gap-2 py-2">
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        {participant.photo ? (
          <img
            src={participant.photo}
            alt={participant.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <Text size="xs" weight="bold" className="text-gray-600">
            {participant.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </div>
      {participant.isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <Text size="sm" className="text-text-900 truncate">
        {participant.name}
      </Text>
      <Text size="xs" className="text-text-500">
        {participant.role}
      </Text>
    </div>
  </div>
);

/**
 * User selector for creating new rooms
 */
const UserSelector = ({
  users,
  selectedIds,
  onToggle,
}: {
  users: ChatUser[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) => (
  <div className="space-y-2 max-h-64 overflow-y-auto">
    {users.map((user) => (
      <Button
        key={user.userInstitutionId}
        variant="link"
        onClick={() => onToggle(user.userInstitutionId)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg transition-colors justify-start h-auto',
          selectedIds.has(user.userInstitutionId)
            ? 'bg-primary-50 border border-primary-500'
            : 'bg-background-50 hover:bg-background-100 border border-transparent'
        )}
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <Text size="sm" weight="bold" className="text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </div>
        <div className="flex-1 text-left">
          <Text size="sm" weight="medium" className="text-text-900">
            {user.name}
          </Text>
          <Text size="xs" className="text-text-500">
            {user.profileName}
          </Text>
        </div>
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
            selectedIds.has(user.userInstitutionId)
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300'
          )}
        >
          {selectedIds.has(user.userInstitutionId) && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </Button>
    ))}
  </div>
);

/**
 * Main Chat component
 *
 * Provides complete chat functionality:
 * - List of chat rooms
 * - Create new chat rooms
 * - Real-time messaging within rooms
 *
 * @example
 * ```tsx
 * <Chat
 *   apiClient={api}
 *   wsUrl="wss://api.example.com/chat/ws"
 *   token={authToken}
 *   userId={user.userInstitutionId}
 *   userName={user.name}
 *   userPhoto={user.photo}
 *   userRole="teacher"
 * />
 * ```
 */
export function Chat(props: Readonly<ChatProps>) {
  const { userId, token } = props;

  // Show loading state if user info is not available
  if (!userId || !token) {
    return (
      <div className="flex items-center justify-center h-96">
        <Text size="sm" className="text-text-500">
          Carregando...
        </Text>
      </div>
    );
  }

  return <ChatContent {...props} />;
}

/**
 * Internal Chat content component (rendered when user info is available)
 */
function ChatContent({
  apiClient,
  wsUrl,
  token,
  userId,
  userName,
  userPhoto,
  userRole,
  className,
  initialRoomId,
  onRoomChange,
  onBackToList,
}: Readonly<ChatProps>) {
  const [view, setView] = useState<ChatView>('list');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomWithDetails | null>(
    null
  );
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasHandledInitialRoomRef = useRef(false);

  // Hooks for REST operations
  const {
    rooms,
    availableUsers,
    loading: roomsLoading,
    error: roomsError,
    fetchRooms,
    fetchAvailableUsers,
    createRoom,
  } = useChatRooms({ apiClient });

  // Hook for WebSocket (only when in a room)
  const {
    isConnected,
    messages,
    participants,
    sendMessage,
    error: chatError,
  } = useChat({
    wsUrl,
    token,
    roomId: selectedRoom?.id || '',
    userId,
    onConnect: () => console.log('Connected to chat'),
    onDisconnect: () => console.log('Disconnected from chat'),
    onError: (err) => console.error('Chat error:', err),
  });

  // Get role label for display
  const getRoleLabel = () => {
    return userRole === PROFILE_ROLES.TEACHER ? 'Professor' : 'Aluno';
  };

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle initial room from URL
  useEffect(() => {
    // Only handle initial room once
    if (hasHandledInitialRoomRef.current) {
      return;
    }

    // Wait for rooms to load before trying to find the initial room
    if (!initialRoomId || roomsLoading) {
      return;
    }

    // Only proceed if rooms have been loaded (not initial empty state)
    if (rooms?.length > 0) {
      const room = rooms.find((r) => r.id === initialRoomId);
      if (room) {
        hasHandledInitialRoomRef.current = true;
        setSelectedRoom(room);
        setView('room');
      } else {
        // Room not found in user's rooms, redirect to list
        hasHandledInitialRoomRef.current = true;
        onBackToList?.();
      }
    } else if (rooms !== undefined && !roomsLoading) {
      // Rooms loaded but empty, or room not found
      hasHandledInitialRoomRef.current = true;
      onBackToList?.();
    }
  }, [initialRoomId, rooms, roomsLoading, onBackToList]);

  // Handle room selection
  const handleSelectRoom = useCallback(
    (room: ChatRoomWithDetails) => {
      setSelectedRoom(room);
      setView('room');
      onRoomChange?.(room.id);
    },
    [onRoomChange]
  );

  // Handle create room
  const handleOpenCreateModal = useCallback(async () => {
    await fetchAvailableUsers();
    setSelectedUserIds(new Set());
    setShowCreateModal(true);
  }, [fetchAvailableUsers]);

  const handleToggleUser = useCallback((id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCreateRoom = useCallback(async () => {
    if (selectedUserIds.size === 0) return;

    const room = await createRoom(Array.from(selectedUserIds));
    if (room) {
      setShowCreateModal(false);
      setSelectedUserIds(new Set());
      // Navigate to the new room
      onRoomChange?.(room.id);
    }
  }, [selectedUserIds, createRoom, onRoomChange]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  }, [messageInput, sendMessage]);

  // Handle back to list
  const handleBackToList = useCallback(() => {
    setSelectedRoom(null);
    setView('list');
    onBackToList?.();
  }, [onBackToList]);

  // Render messages content
  const renderMessagesContent = () => {
    if (chatError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Text size="sm" className="text-red-500 mb-2">
              Erro de conexao com o chat
            </Text>
            <Text size="xs" className="text-text-500">
              Tentando reconectar...
            </Text>
          </div>
        </div>
      );
    }

    // Filter out system messages (user joined/left notifications)
    const userMessages = messages?.filter(
      (message) => message.messageType !== CHAT_MESSAGE_TYPES.SYSTEM
    );

    if (!userMessages?.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="sm" className="text-text-500">
            Nenhuma mensagem ainda. Comece a conversa!
          </Text>
        </div>
      );
    }

    return userMessages.map((message) => (
      <MessageBubble
        key={message.id}
        message={message}
        isOwn={message.senderId === userId}
      />
    ));
  };

  // Render room list
  const renderRoomList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-background-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Text size="sm" weight="bold" className="text-primary-600">
                {userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </div>
          <div>
            <Text size="lg" weight="bold" className="text-text-900">
              Conversas
            </Text>
            <Text size="xs" className="text-text-500">
              {userName} - {getRoleLabel()}
            </Text>
          </div>
        </div>
        <Button
          variant="solid"
          size="small"
          onClick={handleOpenCreateModal}
          iconLeft={<PlusIcon size={16} />}
        >
          Nova conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {roomsError && (
          <div className="p-4 text-center">
            <Text size="sm" className="text-red-500 mb-2">
              Erro ao carregar conversas
            </Text>
            <Button variant="outline" size="small" onClick={fetchRooms}>
              Tentar novamente
            </Button>
          </div>
        )}
        {!roomsError && roomsLoading && (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonRounded className="w-10 h-10" />
                <div className="flex-1">
                  <SkeletonText className="w-3/4 h-4 mb-2" />
                  <SkeletonText className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!roomsError && !roomsLoading && !rooms?.length && (
          <EmptyState
            title="Nenhuma conversa"
            description="Comece uma nova conversa clicando no botao acima"
          />
        )}
        {!roomsError && !roomsLoading && !!rooms?.length && (
          <div className="space-y-1">
            {rooms.map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                onClick={() => handleSelectRoom(room)}
                isActive={selectedRoom?.id === room.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render chat room
  const renderChatRoom = () => {
    if (!selectedRoom) return null;

    return (
      <div className="flex h-full">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-background-200 flex items-center gap-3">
            <Button variant="link" size="small" onClick={handleBackToList}>
              <XIcon size={20} />
            </Button>
            <div className="flex-1">
              <Text size="md" weight="semibold" className="text-text-900">
                {selectedRoom.name}
              </Text>
              <Text size="xs" className="text-text-500">
                {isConnected ? 'Conectado' : 'Conectando...'}
              </Text>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderMessagesContent()}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-background-200">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                variant="solid"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
              >
                <PaperPlaneTiltIcon size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Participants sidebar */}
        <div className="w-64 border-l border-background-200 p-4 hidden lg:block">
          <Text size="sm" weight="semibold" className="text-text-900 mb-3">
            Participantes ({participants?.length ?? 0})
          </Text>
          <div className="space-y-1">
            {participants?.map((participant) => (
              <ParticipantItem
                key={participant.userInstitutionId}
                participant={participant}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'bg-background rounded-xl border border-background-200 h-[600px]',
        className
      )}
    >
      {view === 'list' && renderRoomList()}
      {view === 'room' && renderChatRoom()}

      {/* Create room modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova conversa"
      >
        <div className="p-4">
          <Text size="sm" className="text-text-600 mb-4">
            Selecione os participantes para iniciar uma conversa
          </Text>

          {roomsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonRounded className="w-10 h-10" />
                  <SkeletonText className="flex-1 h-4" />
                </div>
              ))}
            </div>
          )}
          {!roomsLoading && !availableUsers?.length && (
            <Text size="sm" className="text-text-500 text-center py-4">
              Nenhum usuario disponivel para chat
            </Text>
          )}
          {!roomsLoading && !!availableUsers?.length && (
            <UserSelector
              users={availableUsers}
              selectedIds={selectedUserIds}
              onToggle={handleToggleUser}
            />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              onClick={handleCreateRoom}
              disabled={selectedUserIds.size === 0 || roomsLoading}
            >
              Criar conversa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Chat;
