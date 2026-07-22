/* eslint-disable no-undef -- tipos/globais do DOM (PermissionDescriptor, PermissionStatus, navigator) são verificados pelo TypeScript */
import { useCallback, useEffect, useState } from 'react';

export type MicrophonePermissionStatus =
  | 'checking'
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported';

export interface UseMicrophonePermissionReturn {
  /** Estado atual da permissão de microfone. */
  status: MicrophonePermissionStatus;
  /** Já concedeu o acesso. */
  isGranted: boolean;
  /** O navegador suporta captura de áudio (`getUserMedia`). */
  isSupported: boolean;
  /**
   * Ainda não concedeu (precisa perguntar) — `true` em `prompt`/`denied`.
   * Use para decidir se abre o modal de permissão.
   */
  shouldAsk: boolean;
  /**
   * Dispara o prompt do navegador (via `getUserMedia`). Encerra as tracks logo
   * após (só queríamos a permissão). Retorna `true` se foi concedida.
   */
  requestPermission: () => Promise<boolean>;
}

/**
 * Encapsula a lógica de permissão de microfone do navegador:
 * - consulta o estado (Permissions API) e reage a mudanças;
 * - `requestPermission()` abre o prompt nativo (`getUserMedia`).
 *
 * Não persiste nada: ao recarregar a página o estado é reconsultado — então um
 * "configurar depois" (que não concede) volta a pedir no próximo carregamento.
 */
export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [status, setStatus] = useState<MicrophonePermissionStatus>('checking');

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (!nav?.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }

    // Nem todo navegador permite consultar 'microphone' pela Permissions API
    // (ex.: Safari). Nesses casos assumimos 'prompt' (precisa perguntar).
    const permissions = nav.permissions;
    if (!permissions?.query) {
      setStatus('prompt');
      return;
    }

    let active = true;
    let permStatus: PermissionStatus | null = null;

    const micDescriptor = {
      name: 'microphone',
    } as unknown as PermissionDescriptor;

    permissions
      .query(micDescriptor)
      .then((result) => {
        if (!active) return;
        permStatus = result;
        setStatus(result.state as MicrophonePermissionStatus);
        result.onchange = () =>
          setStatus(result.state as MicrophonePermissionStatus);
      })
      .catch(() => {
        if (active) setStatus('prompt');
      });

    return () => {
      active = false;
      if (permStatus) permStatus.onchange = null;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (!nav?.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return false;
    }
    try {
      const stream = await nav.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setStatus('granted');
      return true;
    } catch {
      setStatus('denied');
      return false;
    }
  }, []);

  return {
    status,
    isGranted: status === 'granted',
    isSupported: status !== 'unsupported',
    shouldAsk: status === 'prompt' || status === 'denied',
    requestPermission,
  };
}
