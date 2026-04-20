/**
 * Enum representing keys for feature flags.
 */
export enum FEATURE_FLAGS_KEYS {
  LOGIN = 'LOGIN',
}

/**
 * Enum representing storage keys for authentication-related data.
 */
export enum KEYS {
  /**
   * Key for the Zustand persist storage.
   */
  AUTH_STORAGE = '@auth-storage:analytica:v2',

  /**
   * Key for the Zustand persist storage.
   */
  APP_STORAGE = '@app-storage:analytica:v2',

  /**
   * Key for the Zustand persist storage for lessons.
   */
  LESSONS_STORAGE = '@lessons-storage:analytica:v2',
}
