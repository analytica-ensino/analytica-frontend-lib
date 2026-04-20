import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '@/utils/keys';

/**
 * Interface representing institution branding data.
 */
export interface BrandingData {
  institutionId: string;
  theme: string | null;
  favicon: string | null;
  icon: string | null;
  mainLogo: string | null;
  internalLogo: string | null;
  loginImage: string | null;
}

/**
 * Interface defining the branding state and actions.
 */
export interface BrandingState {
  branding: BrandingData | null;
  setBranding: (branding: BrandingData) => void;
  getBranding: () => BrandingData | null;
  clearBranding: () => void;
}

/**
 * Zustand store for managing institution branding data with persistence.
 * This store caches branding information (theme, logos, favicon, etc.) from the backend.
 */
export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      branding: null,

      /**
       * Set the institution branding data.
       * @param branding - The branding data to store
       */
      setBranding: (branding: BrandingData) => {
        set({ branding });
      },

      /**
       * Get the current branding data.
       * @returns The stored branding data or null
       */
      getBranding: () => {
        return get().branding;
      },

      /**
       * Clear all branding data (useful for logout).
       */
      clearBranding: () => {
        set({ branding: null });
      },
    }),
    {
      name: KEYS.BRANDING_STORAGE || '@branding-storage:analytica:v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
