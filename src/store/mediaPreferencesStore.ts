import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';

/** Volume usado enquanto o usuário nunca mexeu no controle. */
export const DEFAULT_MEDIA_VOLUME = 1;

/**
 * Volume aplicado ao desmutar quando o volume salvo era 0 — sem isso o
 * "desmutar" não teria efeito audível.
 */
export const UNMUTE_FALLBACK_VOLUME = 0.5;

/**
 * Preferências de áudio compartilhadas por todos os players da plataforma
 * (videoaula e podcast).
 */
export interface MediaPreferencesState {
  /** Volume normalizado entre 0 e 1 */
  volume: number;
  /** Estado de mudo */
  isMuted: boolean;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
}

/**
 * Mantém o volume dentro de [0, 1] e descarta valores inválidos vindos de um
 * storage corrompido (a API do `<video>` lança `IndexSizeError` fora da faixa).
 *
 * @param value - Volume candidato
 * @returns Volume válido entre 0 e 1
 */
const clampVolume = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_MEDIA_VOLUME;
  return Math.min(1, Math.max(0, value));
};

/**
 * Store das preferências de áudio dos players.
 *
 * O estado é global — videoaula e podcast leem o mesmo valor — e persistido em
 * `localStorage`, então o último volume/mudo escolhido é reaplicado em qualquer
 * mídia carregada depois: outra aula, outra aba, outro dia. É uma preferência
 * do aparelho (como o volume do sistema), não da conta, por isso a chave não é
 * escopada por usuário.
 */
export const useMediaPreferencesStore = create<MediaPreferencesState>()(
  persist(
    (set) => ({
      volume: DEFAULT_MEDIA_VOLUME,
      isMuted: false,

      /**
       * Salva o volume escolhido pelo usuário
       * @param volume - Volume entre 0 e 1
       * @returns {void}
       */
      setVolume: (volume: number): void => {
        set({ volume: clampVolume(volume) });
      },

      /**
       * Salva o estado de mudo escolhido pelo usuário
       * @param isMuted - `true` quando mudo
       * @returns {void}
       */
      setIsMuted: (isMuted: boolean): void => {
        set({ isMuted });
      },
    }),
    {
      name: KEYS.MEDIA_PREFERENCES_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ volume: state.volume, isMuted: state.isMuted }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<MediaPreferencesState>;
        return {
          ...current,
          volume:
            saved.volume === undefined
              ? current.volume
              : clampVolume(Number(saved.volume)),
          isMuted: saved.isMuted === true,
        };
      },
    }
  )
);

/**
 * Lê as preferências de áudio com seletores primitivos, evitando o re-render
 * extra que um seletor de objeto causaria a cada `set` do store.
 *
 * @returns Volume, estado de mudo e os respectivos setters
 */
export const useMediaVolumePreference = () => {
  const volume = useMediaPreferencesStore((state) => state.volume);
  const isMuted = useMediaPreferencesStore((state) => state.isMuted);
  const setVolume = useMediaPreferencesStore((state) => state.setVolume);
  const setIsMuted = useMediaPreferencesStore((state) => state.setIsMuted);

  return { volume, isMuted, setVolume, setIsMuted };
};
