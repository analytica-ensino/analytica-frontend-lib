import { useEffect } from 'react';
import { useBreadcrumb, type BreadcrumbItem } from './breadcrumbStore';

/**
 * Interface para configuração de um nível de breadcrumb dinâmico (com dados)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BreadcrumbLevelWithData<T = any> {
  /** Dados do nível atual */
  data: T | null;
  /** ID extraído da URL para comparação */
  urlId?: string;
  /** Função para obter o ID dos dados */
  getId: (data: T) => string;
  /** Função para obter o nome dos dados */
  getName: (data: T) => string;
  /** Função para construir a URL do breadcrumb */
  getUrl: (data: T, previousIds: string[]) => string;
}

/**
 * Interface para configuração de um nível de breadcrumb estático (sem dados)
 */
export interface BreadcrumbLevelStatic {
  /** Breadcrumb estático */
  breadcrumb: BreadcrumbItem;
  /** ID extraído da URL para validação (se não estiver na URL, não mostra) */
  urlId?: string;
}

/**
 * Union type para aceitar ambos os tipos de breadcrumb
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BreadcrumbLevel<T = any> =
  | BreadcrumbLevelWithData<T>
  | BreadcrumbLevelStatic;

/**
 * Configuração do builder de breadcrumbs
 */
export interface BreadcrumbBuilderConfig {
  /** Namespace único para este breadcrumb */
  namespace: string;
  /** Breadcrumb inicial (raiz) */
  root: BreadcrumbItem;
  /** Níveis hierárquicos de breadcrumbs (cada um pode ter tipo diferente) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  levels: BreadcrumbLevel<any>[];
}

/**
 * Hook para construir breadcrumbs hierárquicos automaticamente
 *
 * Suporta dois tipos de breadcrumbs:
 * 1. Dinâmico (com dados): Requer dados carregados do backend
 * 2. Estático: Breadcrumb fixo que aparece baseado na URL
 *
 * @param config - Configuração do builder
 * @returns Breadcrumbs e métodos para manipulá-los
 *
 * @example
 * // Breadcrumb dinâmico (com dados do backend)
 * ```tsx
 * const { breadcrumbs } = useBreadcrumbBuilder({
 *   namespace: 'performance',
 *   root: { id: 'home', name: 'Home', url: '/' },
 *   levels: [
 *     {
 *       data: subjectData,
 *       urlId: subjectId,
 *       getId: (data) => data.subjectId,
 *       getName: (data) => data.subjectName,
 *       getUrl: (data) => `/subjects/${data.subjectId}`,
 *     },
 *   ],
 * });
 * ```
 *
 * @example
 * // Breadcrumb estático (sem dados)
 * ```tsx
 * const { breadcrumbs } = useBreadcrumbBuilder({
 *   namespace: 'settings',
 *   root: { id: 'home', name: 'Home', url: '/' },
 *   levels: [
 *     {
 *       breadcrumb: { id: 'settings', name: 'Configurações', url: '/settings' },
 *       urlId: 'settings', // Mostra apenas se 'settings' estiver na URL
 *     },
 *     {
 *       breadcrumb: { id: 'profile', name: 'Perfil', url: '/settings/profile' },
 *       urlId: 'profile',
 *     },
 *   ],
 * });
 * ```
 *
 * @example
 * // Misturar estático e dinâmico
 * ```tsx
 * const { breadcrumbs } = useBreadcrumbBuilder({
 *   namespace: 'mixed',
 *   root: { id: 'home', name: 'Home', url: '/' },
 *   levels: [
 *     // Estático
 *     {
 *       breadcrumb: { id: 'products', name: 'Produtos', url: '/products' },
 *       urlId: 'products',
 *     },
 *     // Dinâmico
 *     {
 *       data: categoryData,
 *       urlId: categoryId,
 *       getId: (data) => data.id,
 *       getName: (data) => data.name,
 *       getUrl: (data) => `/products/${data.id}`,
 *     },
 *   ],
 * });
 * ```
 */
/**
 * Type guard para verificar se é um breadcrumb com dados
 */
const isBreadcrumbWithData = (
  level: BreadcrumbLevel
): level is BreadcrumbLevelWithData => {
  return 'data' in level;
};

export const useBreadcrumbBuilder = (config: BreadcrumbBuilderConfig) => {
  const { namespace, root, levels } = config;
  const { breadcrumbs, setBreadcrumbs, sliceBreadcrumbs } =
    useBreadcrumb(namespace);

  // Extrair apenas os dados dos levels que são as verdadeiras dependências
  const levelDependencies = levels.map((level) =>
    isBreadcrumbWithData(level) ? level.data : null
  );
  const levelUrlIds = levels.map((level) => level.urlId);

  useEffect(() => {
    const newBreadcrumbs: BreadcrumbItem[] = [root];
    const previousIds: string[] = [];

    // Construir breadcrumbs hierarquicamente
    for (const level of levels) {
      const { urlId } = level;

      // Verificar se é breadcrumb com dados ou estático
      if (isBreadcrumbWithData(level)) {
        // Breadcrumb dinâmico (com dados)
        const { data, getId, getName, getUrl } = level;

        // Parar se não temos dados
        if (!data) break;

        const dataId = getId(data);

        // Se urlId está definido, deve corresponder ao dataId
        // Se urlId é undefined, significa que estamos em nível superior, então parar
        if (urlId === undefined || dataId !== urlId) break;

        // Adicionar breadcrumb
        newBreadcrumbs.push({
          id: dataId,
          name: getName(data),
          url: getUrl(data, previousIds),
        });

        previousIds.push(dataId);
      } else {
        // Breadcrumb estático
        const { breadcrumb } = level;

        // Se urlId é undefined, parar (não estamos neste nível)
        if (urlId === undefined) break;

        // Adicionar breadcrumb estático
        newBreadcrumbs.push(breadcrumb);
        previousIds.push(breadcrumb.id);
      }
    }

    setBreadcrumbs(newBreadcrumbs);
  }, [namespace, ...levelDependencies, ...levelUrlIds, root.id]);

  return {
    breadcrumbs,
    sliceBreadcrumbs,
  };
};
