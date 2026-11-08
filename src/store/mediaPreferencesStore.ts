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
 * O que fazer ao fim de cada vídeo, acima do avanço da fila. Um campo único
 * garante que "repetir um vídeo" e "voltar ao início" nunca fiquem ativos
 * ao mesmo tempo.
 */
export type VideoEndBehavior = 'none' | 'repeat-video' | 'back-to-start';

/**
 * Preferências de áudio e de fila compartilhadas pelos players da plataforma
 * (videoaula e podcast).
 */
export interface MediaPreferencesState {
  /** Ordem aleatória da fila de aulas */
  queueShuffle: boolean;
  /** Recomeça a fila ao terminar a última aula */
  queueRepeatList: boolean;
  videoEndBehavior: VideoEndBehavior;
  setQueueShuffle: (queueShuffle: boolean) => void;
  setQueueRepeatList: (queueRepeatList: boolean) => void;
  setVideoEndBehavior: (videoEndBehavior: VideoEndBehavior) => void;
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
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',

      setQueueShuffle: (queueShuffle: boolean): void => {
        set({ queueShuffle });
      },

      setQueueRepeatList: (queueRepeatList: boolean): void => {
        set({ queueRepeatList });
      },

      setVideoEndBehavior: (videoEndBehavior: VideoEndBehavior): void => {
        set({ videoEndBehavior });
      },

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
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        queueShuffle: state.queueShuffle,
        queueRepeatList: state.queueRepeatList,
        videoEndBehavior: state.videoEndBehavior,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<MediaPreferencesState>;
        return {
          ...current,
          volume:
            saved.volume === undefined
              ? current.volume
              : clampVolume(Number(saved.volume)),
          isMuted: saved.isMuted === true,
          queueShuffle: saved.queueShuffle === true,
          queueRepeatList: saved.queueRepeatList === true,
          videoEndBehavior:
            saved.videoEndBehavior === 'repeat-video' ||
            saved.videoEndBehavior === 'back-to-start'
              ? saved.videoEndBehavior
              : 'none',
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
