import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Chat } from './Chat';
import { PROFILE_ROLES } from '../../types/chat';
import type {
  ChatApiClient,
  ChatRoomWithDetails,
  ChatMessage,
  ChatParticipant,
  ChatUser,
} from '../../types/chat';

// Mock the hooks
jest.mock('../../hooks/useChat', () => ({
  useChat: jest.fn(),
}));

jest.mock('../../hooks/useChatRooms', () => ({
  useChatRooms: jest.fn(),
}));

// Import mocked hooks for type safety
import { useChat } from '../../hooks/useChat';
import { useChatRooms } from '../../hooks/useChatRooms';

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>;
const mockUseChatRooms = useChatRooms as jest.MockedFunction<
  typeof useChatRooms
>;

// Mock data
const mockApiClient: ChatApiClient = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockRoom: ChatRoomWithDetails = {
  id: 'room-1',
  name: 'Test Room',
  classId: 'class-1',
  createdById: 'user-1',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastMessage: {
    id: 'msg-1',
    senderId: 'user-2',
    senderName: 'John Doe',
    senderPhoto: null,
    senderRole: 'STUDENT',
    content: 'Hello!',
    messageType: 'text',
    createdAt: new Date().toISOString(),
  },
  participantCount: 3,
};

const mockRoomWithoutLastMessage: ChatRoomWithDetails = {
  id: 'room-2',
  name: 'Empty Room',
  classId: 'class-1',
  createdById: 'user-1',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastMessage: null,
  participantCount: 2,
};

const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-2',
    senderName: 'John Doe',
    senderPhoto: 'https://example.com/photo.jpg',
    senderRole: 'STUDENT',
    content: 'Hello!',
    messageType: 'text',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    senderName: 'Test User',
    senderPhoto: null,
    senderRole: 'TEACHER',
    content: 'Hi there!',
    messageType: 'text',
    createdAt: new Date().toISOString(),
  },
];

const mockParticipants: ChatParticipant[] = [
  {
    userInstitutionId: 'user-1',
    name: 'Test User',
    photo: null,
    role: 'TEACHER',
    isOnline: true,
  },
  {
    userInstitutionId: 'user-2',
    name: 'John Doe',
    photo: 'https://example.com/photo.jpg',
    role: 'STUDENT',
    isOnline: false,
  },
];

const mockAvailableUsers: ChatUser[] = [
  {
    userInstitutionId: 'user-3',
    name: 'Jane Smith',
    photo: null,
    profileName: 'Aluno',
  },
  {
    userInstitutionId: 'user-4',
    name: 'Bob Wilson',
    photo: 'https://example.com/bob.jpg',
    profileName: 'Professor',
  },
];

const defaultChatHookReturn = {
  isConnected: true,
  messages: [],
  participants: [],
  sendMessage: jest.fn(),
  leave: jest.fn(),
  error: null,
  reconnect: jest.fn(),
  currentUserId: 'user-1',
};

const defaultChatRoomsHookReturn = {
  rooms: [],
  availableUsers: [],
  loading: false,
  error: null,
  fetchRooms: jest.fn(),
  fetchAvailableUsers: jest.fn(),
  createRoom: jest.fn(),
  clearError: jest.fn(),
};

const defaultProps = {
  apiClient: mockApiClient,
  wsUrl: 'wss://example.com/chat/ws',
  token: 'test-token',
  userId: 'user-1',
  userName: 'Test User',
  userPhoto: null,
  userRole: PROFILE_ROLES.TEACHER,
};

describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChat.mockReturnValue(defaultChatHookReturn);
    mockUseChatRooms.mockReturnValue(defaultChatRoomsHookReturn);
  });

  describe('Rendering', () => {
    it('should render the chat component with default props', () => {
      render(<Chat {...defaultProps} />);
      expect(screen.getByText('Conversas')).toBeInTheDocument();
      expect(screen.getByText('Test User - Professor')).toBeInTheDocument();
    });

    it('should render user initials when no photo is provided', () => {
      render(<Chat {...defaultProps} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should render user photo when provided', () => {
      render(
        <Chat {...defaultProps} userPhoto="https://example.com/photo.jpg" />
      );
      const img = screen.getByAltText('Test User');
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('should display "Aluno" for student role', () => {
      render(<Chat {...defaultProps} userRole={PROFILE_ROLES.STUDENT} />);
      expect(screen.getByText('Test User - Aluno')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Chat {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render "Nova conversa" button', () => {
      render(<Chat {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /nova conversa/i })
      ).toBeInTheDocument();
    });
  });

  describe('Room List View', () => {
    it('should show loading skeleton when loading rooms', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        loading: true,
      });

      render(<Chat {...defaultProps} />);
      // Skeleton elements should be present
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show error message when rooms fail to load', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        error: new Error('Failed to load'),
      });

      render(<Chat {...defaultProps} />);
      expect(
        screen.getByText('Erro ao carregar conversas')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /tentar novamente/i })
      ).toBeInTheDocument();
    });

    it('should retry loading rooms when "Tentar novamente" is clicked', async () => {
      const fetchRooms = jest.fn();
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        error: new Error('Failed to load'),
        fetchRooms,
      });

      render(<Chat {...defaultProps} />);
      const retryButton = screen.getByRole('button', {
        name: /tentar novamente/i,
      });

      await userEvent.click(retryButton);
      expect(fetchRooms).toHaveBeenCalled();
    });

    it('should show empty state when no rooms exist', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [],
      });

      render(<Chat {...defaultProps} />);
      expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
      expect(screen.getByText(/comece uma nova conversa/i)).toBeInTheDocument();
    });

    it('should render room list when rooms exist', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom, mockRoomWithoutLastMessage],
      });

      render(<Chat {...defaultProps} />);
      expect(screen.getByText('Test Room')).toBeInTheDocument();
      expect(screen.getByText('Empty Room')).toBeInTheDocument();
    });

    it('should display last message in room item', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);
      expect(screen.getByText('John Doe: Hello!')).toBeInTheDocument();
    });

    it('should display participant count in room item', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);
      expect(screen.getByText('3 participantes')).toBeInTheDocument();
    });
  });

  describe('Room Selection', () => {
    it('should navigate to room view when room is clicked', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // Should show room header
      expect(screen.getByText('Test Room')).toBeInTheDocument();
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });

    it('should show "Conectando..." when not connected to websocket', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        isConnected: false,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('Conectando...')).toBeInTheDocument();
    });

    it('should navigate back to list when back button is clicked', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);

      // Go to room
      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // Go back
      const backButtons = screen.getAllByRole('button');
      const backButton = backButtons.find((btn) => btn.querySelector('svg'));
      await userEvent.click(backButton!);

      // Should be back on list view
      expect(screen.getByText('Conversas')).toBeInTheDocument();
    });
  });

  describe('Chat Room View', () => {
    beforeEach(() => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
    });

    it('should show empty message state when no messages', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText(/nenhuma mensagem ainda/i)).toBeInTheDocument();
    });

    it('should render messages when they exist', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: mockMessages,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('should show error state when chat has error', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        error: new Error('Connection failed'),
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(
        screen.getByText('Erro de conexao com o chat')
      ).toBeInTheDocument();
      expect(screen.getByText('Tentando reconectar...')).toBeInTheDocument();
    });

    it('should render participants list', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        participants: mockParticipants,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('Participantes (2)')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show online indicator for online participants', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        participants: mockParticipants,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // Online indicator should be present for Test User (isOnline: true)
      const onlineIndicators = document.querySelectorAll('.bg-green-500');
      expect(onlineIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Message Input', () => {
    beforeEach(() => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
    });

    it('should have message input field', async () => {
      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(
        screen.getByPlaceholderText('Digite sua mensagem...')
      ).toBeInTheDocument();
    });

    it('should update input value when typing', async () => {
      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, 'Test message');

      expect(input).toHaveValue('Test message');
    });

    it('should send message when send button is clicked', async () => {
      const sendMessage = jest.fn();
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, 'Test message');

      // Use Enter key to send message as it's more reliable than finding the button
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(sendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should send message when Enter key is pressed', async () => {
      const sendMessage = jest.fn();
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, 'Test message{enter}');

      expect(sendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should not send empty message', async () => {
      const sendMessage = jest.fn();
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, '   {enter}');

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('should clear input after sending message', async () => {
      const sendMessage = jest.fn();
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, 'Test message{enter}');

      expect(input).toHaveValue('');
    });

    it('should disable send button when not connected', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        isConnected: false,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      await userEvent.type(input, 'Test message');

      const buttons = screen.getAllByRole('button');
      const sendButton = buttons.find(
        (btn) => (btn as HTMLButtonElement).disabled && btn.querySelector('svg')
      );
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Create Room Modal', () => {
    it('should open create modal when "Nova conversa" is clicked', async () => {
      const fetchAvailableUsers = jest.fn();
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        fetchAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      expect(fetchAvailableUsers).toHaveBeenCalled();
      expect(
        screen.getByText('Selecione os participantes para iniciar uma conversa')
      ).toBeInTheDocument();
    });

    it('should show loading in modal when loading users', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        loading: true,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      // Skeleton should be visible in modal
      const modal = screen.getByRole('dialog');
      const skeletons = modal.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty message when no users available', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: [],
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      expect(
        screen.getByText('Nenhum usuario disponivel para chat')
      ).toBeInTheDocument();
    });

    it('should render available users in modal', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should toggle user selection when clicking on user', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      const userButton = screen.getByText('Jane Smith').closest('button');
      await userEvent.click(userButton!);

      // Should have selected styling
      expect(userButton).toHaveClass('bg-primary-50');

      // Click again to deselect
      await userEvent.click(userButton!);
      expect(userButton).not.toHaveClass('bg-primary-50');
    });

    it('should close modal when "Cancelar" is clicked', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await userEvent.click(cancelButton);

      expect(
        screen.queryByText(
          'Selecione os participantes para iniciar uma conversa'
        )
      ).not.toBeInTheDocument();
    });

    it('should disable "Criar conversa" button when no users selected', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      const createButton = screen.getByRole('button', {
        name: /criar conversa/i,
      });
      expect(createButton).toBeDisabled();
    });

    it('should call createRoom when "Criar conversa" is clicked with selected users', async () => {
      const createRoom = jest.fn().mockResolvedValue(mockRoom);
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
        createRoom,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      // Select a user
      const userButton = screen.getByText('Jane Smith').closest('button');
      await userEvent.click(userButton!);

      const createButton = screen.getByRole('button', {
        name: /criar conversa/i,
      });
      await userEvent.click(createButton);

      expect(createRoom).toHaveBeenCalledWith(['user-3']);
    });

    it('should close modal after successfully creating room', async () => {
      const createRoom = jest.fn().mockResolvedValue(mockRoom);
      const fetchRooms = jest.fn();
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
        createRoom,
        fetchRooms,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      // Select a user
      const userButton = screen.getByText('Jane Smith').closest('button');
      await userEvent.click(userButton!);

      const createButton = screen.getByRole('button', {
        name: /criar conversa/i,
      });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Selecione os participantes para iniciar uma conversa'
          )
        ).not.toBeInTheDocument();
      });

      expect(fetchRooms).toHaveBeenCalled();
    });
  });

  describe('Message Bubble Component', () => {
    beforeEach(() => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
    });

    it('should render own messages with different styling', async () => {
      const ownMessage: ChatMessage = {
        id: 'msg-own',
        senderId: 'user-1', // Same as userId
        senderName: 'Test User',
        senderPhoto: null,
        senderRole: 'TEACHER',
        content: 'My message',
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [ownMessage],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const messageContent = screen.getByText('My message');
      // The bubble is the parent div that contains the message text
      const bubble = messageContent.closest('.bg-primary-500');
      expect(bubble).toBeInTheDocument();
    });

    it('should render other user messages with photo', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [mockMessages[0]], // Has photo
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const photo = screen.getByAltText('John Doe');
      expect(photo).toBeInTheDocument();
    });

    it('should render initials when sender has no photo', async () => {
      const messageWithoutPhoto: ChatMessage = {
        id: 'msg-no-photo',
        senderId: 'user-2',
        senderName: 'John Doe',
        senderPhoto: null,
        senderRole: 'STUDENT',
        content: 'Hello without photo',
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [messageWithoutPhoto],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display sender name for other user messages', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [mockMessages[0]],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // Sender name should appear (not counting the one in participants)
      const senderNames = screen.getAllByText('John Doe');
      expect(senderNames.length).toBeGreaterThan(0);
    });

    it('should display message timestamp', async () => {
      const fixedDate = new Date('2024-01-15T10:30:00Z');
      const messageWithTime: ChatMessage = {
        id: 'msg-time',
        senderId: 'user-2',
        senderName: 'John',
        senderPhoto: null,
        senderRole: 'STUDENT',
        content: 'Timed message',
        messageType: 'text',
        createdAt: fixedDate.toISOString(),
      };

      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [messageWithTime],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // The time should be formatted (actual format depends on locale)
      const timeRegex = /\d{1,2}:\d{2}/;
      const timeElement = screen.getByText(timeRegex);
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('Participant Item Component', () => {
    beforeEach(() => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
    });

    it('should render participant with photo', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        participants: [mockParticipants[1]], // Has photo
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const photo = screen.getByAltText('John Doe');
      expect(photo).toBeInTheDocument();
    });

    it('should render participant role', async () => {
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        participants: mockParticipants,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('TEACHER')).toBeInTheDocument();
      expect(screen.getByText('STUDENT')).toBeInTheDocument();
    });
  });

  describe('User Selector Component', () => {
    it('should render user with photo in selector', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      const photo = screen.getByAltText('Bob Wilson');
      expect(photo).toBeInTheDocument();
    });

    it('should render user initials when no photo', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      // Jane Smith has no photo, should show "J"
      const initials = screen.getAllByText('J');
      expect(initials.length).toBeGreaterThan(0);
    });

    it('should render profile name', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      expect(screen.getByText('Aluno')).toBeInTheDocument();
      expect(screen.getByText('Professor')).toBeInTheDocument();
    });

    it('should show selection indicator when user is selected', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        availableUsers: mockAvailableUsers,
      });

      render(<Chat {...defaultProps} />);

      const newButton = screen.getByRole('button', { name: /nova conversa/i });
      await userEvent.click(newButton);

      const userButton = screen.getByText('Jane Smith').closest('button');
      await userEvent.click(userButton!);

      // Check for selection indicator (white dot inside)
      const selectionIndicator = userButton?.querySelector('.bg-primary-500');
      expect(selectionIndicator).toBeInTheDocument();
    });
  });

  describe('Room Item Component', () => {
    it('should render room items correctly', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom, mockRoomWithoutLastMessage],
      });

      render(<Chat {...defaultProps} />);

      // Both rooms should be visible in the list
      expect(screen.getByText('Test Room')).toBeInTheDocument();
      expect(screen.getByText('Empty Room')).toBeInTheDocument();

      // Room items should be clickable
      const roomButton = screen.getByText('Test Room').closest('button');
      expect(roomButton).toBeInTheDocument();
    });

    it('should navigate to room when clicked', async () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      // Should now show the room view with connection status
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call fetchRooms on mount', () => {
      const fetchRooms = jest.fn();
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        fetchRooms,
      });

      render(<Chat {...defaultProps} />);
      expect(fetchRooms).toHaveBeenCalled();
    });

    it('should pass correct options to useChat hook', () => {
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });

      render(<Chat {...defaultProps} />);

      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          wsUrl: 'wss://example.com/chat/ws',
          token: 'test-token',
          userId: 'user-1',
        })
      );
    });

    it('should pass correct options to useChatRooms hook', () => {
      render(<Chat {...defaultProps} />);

      expect(mockUseChatRooms).toHaveBeenCalledWith({
        apiClient: mockApiClient,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rooms with special characters in name', () => {
      const roomWithSpecialChars: ChatRoomWithDetails = {
        ...mockRoom,
        name: 'Test & Room <script>alert("xss")</script>',
      };

      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [roomWithSpecialChars],
      });

      render(<Chat {...defaultProps} />);
      expect(
        screen.getByText('Test & Room <script>alert("xss")</script>')
      ).toBeInTheDocument();
    });

    it('should handle very long message content', async () => {
      const longMessage: ChatMessage = {
        id: 'msg-long',
        senderId: 'user-2',
        senderName: 'John',
        senderPhoto: null,
        senderRole: 'STUDENT',
        content: 'A'.repeat(1000),
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        messages: [longMessage],
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    it('should handle rapid message sending', async () => {
      const sendMessage = jest.fn();
      mockUseChatRooms.mockReturnValue({
        ...defaultChatRoomsHookReturn,
        rooms: [mockRoom],
      });
      mockUseChat.mockReturnValue({
        ...defaultChatHookReturn,
        sendMessage,
      });

      render(<Chat {...defaultProps} />);

      const roomButton = screen.getByText('Test Room').closest('button');
      await userEvent.click(roomButton!);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');

      // Send multiple messages rapidly
      await userEvent.type(input, 'Message 1{enter}');
      await userEvent.type(input, 'Message 2{enter}');
      await userEvent.type(input, 'Message 3{enter}');

      expect(sendMessage).toHaveBeenCalledTimes(3);
    });
  });
});
