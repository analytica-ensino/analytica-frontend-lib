/**
 * Chat utility functions
 */

/**
 * User info for chat from auth store
 */
export interface ChatUserInfo {
  userId: string;
  userName: string;
  userPhoto: string | null;
  token: string;
}

/**
 * Check if chat user info is valid (has userId and token)
 *
 * @param userInfo - Chat user info object
 * @returns boolean indicating if user info is valid for chat
 *
 * @example
 * ```ts
 * const userInfo = getChatUserInfo(user, tokens, sessionInfo);
 * if (!isChatUserInfoValid(userInfo)) {
 *   return <ChatLoading />;
 * }
 * ```
 */
export const isChatUserInfoValid = (userInfo: ChatUserInfo): boolean => {
  return Boolean(userInfo.userId && userInfo.token);
};

/**
 * Get WebSocket URL from API URL
 * Converts https:// to wss:// and http:// to ws://
 *
 * @param apiUrl - The API URL (defaults to VITE_API_URL or http://localhost:3000)
 * @returns WebSocket URL for chat
 *
 * @example
 * ```ts
 * const wsUrl = getChatWsUrl('https://api.example.com');
 * // Returns: 'wss://api.example.com/chat/ws'
 * ```
 */
export const getChatWsUrl = (apiUrl: string): string => {
  const baseUrl = apiUrl;
  return baseUrl.replace(/^http/, 'ws');
};

/**
 * Extract user info for chat from auth store data
 *
 * @param user - User object from auth store
 * @param tokens - Tokens object from auth store
 * @param sessionInfo - Session info object from auth store
 * @param defaultUserName - Default user name if not found (e.g., 'Professor' or 'Aluno')
 * @returns Chat user info
 *
 * @example
 * ```ts
 * const { user, tokens, sessionInfo } = useAuthStore();
 * const userInfo = getChatUserInfo(user, tokens, sessionInfo, 'Aluno');
 *
 * if (!isChatUserInfoValid(userInfo)) {
 *   return <ChatLoading />;
 * }
 *
 * const { userId, userName, userPhoto, token } = userInfo;
 * ```
 */
export const getChatUserInfo = (
  user:
    | {
        userInstitutionId?: string | number;
        name?: string;
        urlProfilePicture?: string;
      }
    | null
    | undefined,
  tokens: { token?: string } | null | undefined,
  sessionInfo:
    | {
        userId?: string | number;
        userName?: string;
        urlProfilePicture?: string;
      }
    | null
    | undefined,
  defaultUserName: string = 'Usuario'
): ChatUserInfo => {
  const userId = String(user?.userInstitutionId ?? sessionInfo?.userId ?? '');
  const userName = String(
    user?.name ?? sessionInfo?.userName ?? defaultUserName
  );
  const photoUrl = String(
    user?.urlProfilePicture ?? sessionInfo?.urlProfilePicture ?? ''
  );
  const userPhoto = photoUrl || null;
  const token = tokens?.token || '';

  return {
    userId,
    userName,
    userPhoto,
    token,
  };
};
