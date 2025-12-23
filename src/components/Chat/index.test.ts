import { Chat, default as DefaultChat } from './index';
import type { ChatProps } from './index';

describe('Chat index exports', () => {
  it('should export Chat component', () => {
    expect(Chat).toBeDefined();
    expect(typeof Chat).toBe('function');
  });

  it('should export Chat as default', () => {
    expect(DefaultChat).toBeDefined();
    expect(DefaultChat).toBe(Chat);
  });

  it('should export ChatProps type', () => {
    // TypeScript type checking - this just ensures the type is exported
    const props: ChatProps = {
      apiClient: { get: jest.fn(), post: jest.fn() },
      wsUrl: 'wss://test.com',
      token: 'token',
      userId: 'user-1',
      userName: 'Test User',
      userRole: 'TEACHER' as const,
    } as unknown as ChatProps;

    expect(props).toBeDefined();
  });
});
