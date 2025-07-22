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

// Helper function to extract authentication parameters from URL
const getAuthParams = (
  location: { search: string },
  extractParams?: (searchParams: URLSearchParams) => {
    sessionId: string;
    token: string;
    refreshToken: string;
  }
) => {
  const searchParams = new URLSearchParams(location.search);
  return extractParams
    ? extractParams(searchParams)
    : {
        sessionId: searchParams.get('sessionId'),
        token: searchParams.get('token'),
        refreshToken: searchParams.get('refreshToken'),
      };
};

// Helper function to validate auth parameters
const hasValidAuthParams = (authParams: {
  sessionId: string | null;
  token: string | null;
  refreshToken: string | null;
}) => {
  return !!(
    authParams?.sessionId &&
    authParams?.token &&
    authParams?.refreshToken
  );
};

// Helper function to check if response has valid profile data
const hasValidProfileData = (
  data: unknown
): data is Record<string, unknown> => {
  return data !== null && typeof data === 'object' && data !== undefined;
};

// Helper function to handle profile selection
const handleProfileSelection = <Profile>(
  responseData: unknown,
  setSelectedProfile?: (profile: Profile) => void
) => {
  if (!setSelectedProfile) return;
  if (!hasValidProfileData(responseData)) return;

  const profileId = responseData.profileId;
  const isValidProfileId = profileId !== null && profileId !== undefined;

  if (isValidProfileId) {
    setSelectedProfile({
      id: profileId,
    } as Profile);
  }
};

export function useUrlAuthentication<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
>(options: UseUrlAuthOptions<Tokens, Session, Profile>) {
  const location = useLocation();

  useEffect(() => {
    const handleAuthentication = async () => {
      const authParams = getAuthParams(location, options.extractParams);

      if (!hasValidAuthParams(authParams)) {
        return;
      }

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
        handleProfileSelection(response.data.data, options.setSelectedProfile);
        options.clearParamsFromURL?.();
      } catch (error) {
        console.error('Erro ao obter informações da sessão:', error);
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
