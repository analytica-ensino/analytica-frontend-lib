import { act, render, screen } from '@testing-library/react';
import { NativeSupportChat } from './NativeSupportChat';
import { createGuestSupportChatAdapter } from './guestSupportChatAdapter';
import { useSupportFeatureFlag } from '../../hooks/useSupportFeatureFlag';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

jest.mock('./SupportChatWidget', () => ({
  SupportChatWidget: (props: Record<string, unknown>) => (
    <div
      data-testid="support-chat-probe"
      data-channel={props.channel as string}
      data-institution={(props.institutionId as string) ?? ''}
      data-user={JSON.stringify(props.user ?? null)}
      data-theme={JSON.stringify(props.theme ?? null)}
      data-article-url={
        (props.faqArticleUrl as ((id: string) => string) | undefined)?.(
          'art-1'
        ) ?? ''
      }
      data-flags={JSON.stringify(props.flags)}
    />
  ),
}));
jest.mock('./guestSupportChatAdapter', () => ({
  createGuestSupportChatAdapter: jest.fn(() => ({ kind: 'guest-adapter' })),
}));
jest.mock('../../hooks/useSupportFeatureFlag', () => ({
  useSupportFeatureFlag: jest.fn(),
}));

const mockUseSupportFeatureFlag = useSupportFeatureFlag as jest.MockedFunction<
  typeof useSupportFeatureFlag
>;

const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

const setFlag = (
  overrides: Partial<ReturnType<typeof useSupportFeatureFlag>> = {}
) =>
  mockUseSupportFeatureFlag.mockReturnValue({
    supportType: null,
    loading: false,
    isZendesk: false,
    isNative: true,
    zendeskKey: undefined,
    faqArticleUrl: (id: string) => `https://ajuda.escola.com.br/artigo/${id}`,
    chatEnabled: true,
    openZendeskChat: jest.fn(),
    ...overrides,
  });

const probe = () => screen.getByTestId('support-chat-probe');
const attr = (name: string) => probe().getAttribute(name);
const flagsOf = () => JSON.parse(attr('data-flags')!);

describe('NativeSupportChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setFlag();
    act(() => {
      useAppStore.setState({ institutionId: 'inst-1' });
      useAuthStore.setState({ user: null, sessionInfo: null });
    });
  });

  afterEach(() => {
    act(() => {
      useAppStore.setState({ institutionId: null });
      useAuthStore.setState({ user: null, sessionInfo: null });
    });
  });

  it('shows the chat to a visitor of a native institution', () => {
    render(<NativeSupportChat apiClient={apiClient} channel="login" />);

    expect(createGuestSupportChatAdapter).toHaveBeenCalledWith({
      apiClient,
      wsUrl: undefined,
    });
    expect(mockUseSupportFeatureFlag).toHaveBeenCalledWith({ apiClient });
    expect(attr('data-channel')).toBe('login');
    expect(attr('data-institution')).toBe('inst-1');
    expect(attr('data-user')).toBe('null');
    expect(attr('data-article-url')).toBe(
      'https://ajuda.escola.com.br/artigo/art-1'
    );
    expect(flagsOf()).toEqual({ enabled: true, supportType: 'NATIVE' });
  });

  it('opens the ticket with the logged user', () => {
    act(() => {
      useAuthStore.setState({
        user: { id: 'u-1', name: 'Ana', email: 'ana@escola.pr.gov.br' },
      });
    });

    render(<NativeSupportChat apiClient={apiClient} channel="aluno" />);

    expect(JSON.parse(attr('data-user')!)).toEqual({
      name: 'Ana',
      email: 'ana@escola.pr.gov.br',
    });
  });

  it('falls back to the session name when the user has none', () => {
    act(() => {
      useAuthStore.setState({
        user: null,
        sessionInfo: { userName: 'Ana Sessão' } as never,
      });
    });

    render(<NativeSupportChat apiClient={apiClient} channel="aluno" />);

    expect(JSON.parse(attr('data-user')!)).toEqual({ name: 'Ana Sessão' });
  });

  it('uses the link, socket and theme given by the app', () => {
    render(
      <NativeSupportChat
        apiClient={apiClient}
        channel="faq"
        faqArticleUrl={(id) => `/artigo/${id}`}
        wsUrl="wss://chat.example.com?channel=support"
        theme={{ title: 'Ajuda' }}
      />
    );

    expect(createGuestSupportChatAdapter).toHaveBeenCalledWith({
      apiClient,
      wsUrl: 'wss://chat.example.com?channel=support',
    });
    expect(attr('data-article-url')).toBe('/artigo/art-1');
    expect(JSON.parse(attr('data-theme')!)).toEqual({ title: 'Ajuda' });
  });

  it('keeps the chat off when the app disables it', () => {
    render(
      <NativeSupportChat
        apiClient={apiClient}
        channel="aluno"
        enabled={false}
      />
    );
    expect(flagsOf()).toEqual({ enabled: false, supportType: 'NATIVE' });
  });

  it('keeps the chat off while the flag loads', () => {
    setFlag({ loading: true });
    render(<NativeSupportChat apiClient={apiClient} channel="aluno" />);
    expect(flagsOf()).toEqual({ enabled: false, supportType: 'NATIVE' });
  });

  it('keeps the chat off when the backoffice switched it off', () => {
    setFlag({ chatEnabled: false });
    render(<NativeSupportChat apiClient={apiClient} channel="aluno" />);
    expect(flagsOf()).toEqual({ enabled: false, supportType: 'NATIVE' });
  });

  it('keeps the chat off when the institution uses Zendesk', () => {
    setFlag({ isNative: false, isZendesk: true });
    act(() => {
      useAppStore.setState({ institutionId: null });
    });
    render(<NativeSupportChat apiClient={apiClient} channel="aluno" />);
    expect(flagsOf()).toEqual({ enabled: false, supportType: 'ZENDESK' });
    expect(attr('data-institution')).toBe('');
  });
});
