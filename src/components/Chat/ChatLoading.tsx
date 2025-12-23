import Text from '../Text/Text';

/**
 * Loading state component for Chat
 * Displayed when user info is not yet available
 */
export function ChatLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <Text size="sm" className="text-text-500">
        Carregando...
      </Text>
    </div>
  );
}

export default ChatLoading;
