import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface UseUrlAuthOptions<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
> {
  setTokens: (tokens: Tokens) => void;
  setSessionInfo: (session: Session) => void;
  setSelectedProfile?: (profile: Profile) => void;
  api: { get: (endpoint: string, config: unknown) => Promise<unknown> };
  endpoint: string;
  extractParams?: (searchParams: URLSearchParams) => {
    sessionId: string;
    token: string;
    refreshToken: string;
  };
  clearParamsFromURL?: () => void;
}

export function useUrlAuthentication<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
>(options: UseUrlAuthOptions<Tokens, Session, Profile>) {
  const location = useLocation();

  useEffect(() => {
    const handleAuthentication = async () => {
      const searchParams = new URLSearchParams(location.search);
      const authParams = options.extractParams
        ? options.extractParams(searchParams)
        : {
            sessionId: searchParams.get('sessionId'),
            token: searchParams.get('token'),
            refreshToken: searchParams.get('refreshToken'),
          };

      if (
        authParams?.sessionId &&
        authParams?.token &&
        authParams?.refreshToken
      ) {
        try {
          options.setTokens({
            token: authParams.token,
            refreshToken: authParams.refreshToken,
          } as Tokens);

          const response = (await options.api.get(options.endpoint, {
            headers: {
              'Session-Id': authParams.sessionId,
              Authorization: `Bearer ${authParams.token}`,
            },
          })) as { data: { data: unknown; [key: string]: unknown } };

          options.setSessionInfo(response.data.data as Session);

          if (options.setSelectedProfile) {
            // Validate response.data.data structure before accessing profileId
            const responseData = response.data.data;
            if (
              responseData &&
              typeof responseData === 'object' &&
              'profileId' in responseData
            ) {
              const profileId = (responseData as Record<string, unknown>)
                .profileId;
              // Only call setSelectedProfile if profileId is valid
              if (profileId !== null && profileId !== undefined) {
                options.setSelectedProfile({
                  id: profileId,
                } as Profile);
              }
            }
          }

          options.clearParamsFromURL?.();
        } catch (error) {
          console.error('Erro ao obter informações da sessão:', error);
        }
      }
    };

    handleAuthentication();
  }, [
    location.search,
    options.setSessionInfo,
    options.setSelectedProfile,
    options.setTokens,
    options.api,
    options.endpoint,
    options.extractParams,
    options.clearParamsFromURL,
  ]);
}
