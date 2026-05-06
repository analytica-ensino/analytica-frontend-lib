/**
 * Voz disponível no provider de TTS.
 */
export interface TTSVoice {
  /** Identificador único (ex.: voiceURI no caso da Web Speech API) */
  id: string;
  /** Nome amigável da voz (ex.: "Google português do Brasil") */
  name: string;
  /** Tag BCP47 do idioma (ex.: "pt-BR") */
  lang: string;
  /** Indica se a síntese roda 100% local (sem chamada de rede) */
  isLocal: boolean;
}

export interface TTSSpeakOptions {
  /** Voz a ser usada — se omitida, o provider escolhe (preferindo pt-BR) */
  voiceId?: string;
  /** Taxa de fala (1 = padrão, 0.5 = lento, 2 = rápido) */
  rate?: number;
  /** Tom (1 = padrão) */
  pitch?: number;
  /** Idioma alvo do trecho (BCP47) — usado quando a voz não cobre o idioma */
  lang?: string;
}

export interface TTSProviderEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (message: string) => void;
}

/**
 * Contrato do provider de Text-to-Speech. A lib fornece um
 * `WebSpeechProvider` default; plataformas podem injetar um provider
 * remoto (ex.: backend com Azure/Google) sem mudar a UI.
 */
export interface TTSProvider {
  /** Indica se o provider funciona neste ambiente (ex.: API disponível). */
  isSupported(): boolean;
  /** Retorna a lista de vozes que o provider expõe. */
  getVoices(): Promise<TTSVoice[]>;
  /** Inicia a fala do texto informado. Cancela qualquer fala em andamento. */
  speak(
    text: string,
    options?: TTSSpeakOptions,
    events?: TTSProviderEvents
  ): void;
  /** Pausa a fala atual (se suportado). */
  pause(): void;
  /** Continua a fala pausada. */
  resume(): void;
  /** Interrompe e descarta qualquer fala em curso. */
  stop(): void;
}
