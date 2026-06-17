import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '@/utils/keys';

/**
 * Interface defining the application state
 */
interface AppState {
  institutionId: string | null;
  initialized: boolean;

  setInstitutionId: (institutionId: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: (id: string | null) => void;
}

/**
 * Zustand store for managing application-wide state with persistence
 * @returns {AppState} The application state store
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      institutionId: null,
      initialized: false,

      /**
       * Set the institution ID
       * @param {string | null} institutionId - The institution ID from meta tag
       * @returns {void}
       */
      setInstitutionId: (institutionId: string | null): void => {
        set({ institutionId });
      },

      /**
       * Set the initialized state
       * @param {boolean} initialized - Whether the app has been initialized
       * @returns {void}
       */
      setInitialized: (initialized: boolean): void => {
        set({ initialized });
      },

      /**
       * Initialize the app by reading the institution ID from meta tag.
       * The meta tag is the source of truth on each load: if the incoming
       * id differs from the persisted one (e.g. institution changed since
       * the last session), it overwrites the stale value.
       * @returns {void}
       */
      initialize: (id: string | null): void => {
        const { initialized, institutionId } = get();

        if (initialized && institutionId === id) {
          return; // Already initialized with the same institution
        }

        set({
          institutionId: id,
          initialized: true,
        });
      },
    }),
    {
      name: KEYS.APP_STORAGE,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
