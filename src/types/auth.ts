/**
 * Interface representing user authentication tokens.
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
}

/**
 * Interface representing a user profile.
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Interface representing a user.
 */
export interface User {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Interface representing URL authentication parameters.
 */
export interface AuthURLParams {
  sessionId: string;
  token: string;
  refreshToken: string;
}

/**
 * Interface representing session information from the API.
 */
export interface SessionInfo {
  sessionId: string;
  userId: string;
  profileId: string;
  institutionId: string;
  schoolId: string;
  schoolYearId: string;
  classId: string;
  subjects: string[];
  schools: string[];
}

/**
 * Interface representing the API response for session-info.
 */
export interface SessionApiResponse {
  message: string;
  data: SessionInfo;
}
