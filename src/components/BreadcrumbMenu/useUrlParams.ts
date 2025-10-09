import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Configuração para extração de parâmetros da URL
 */
export interface UrlParamsConfig {
  /** Mapa de nome do parâmetro para seu índice no path */
  [key: string]: number;
}

/**
 * Hook genérico para extrair parâmetros de uma URL baseado em índices
 *
 * @param config - Configuração com os índices dos parâmetros no path
 * @returns Objeto com os parâmetros extraídos
 *
 * @example
 * ```tsx
 * // URL: /desempenho/lista-temas/123/subtemas/456
 * // Path segments: ['desempenho', 'lista-temas', '123', 'subtemas', '456']
 * const params = useUrlParams({
 *   subjectId: 2,  // índice 2 = '123'
 *   topicId: 4,    // índice 4 = '456'
 * });
 *
 * console.log(params); // { subjectId: '123', topicId: '456' }
 * ```
 */
export const useUrlParams = <T extends UrlParamsConfig>(
  config: T
): Record<keyof T, string | undefined> => {
  const location = useLocation();

  return useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const params: Record<string, string | undefined> = {};

    for (const [key, index] of Object.entries(config)) {
      params[key] = segments[index];
    }

    return params as Record<keyof T, string | undefined>;
  }, [location.pathname, config]);
};
