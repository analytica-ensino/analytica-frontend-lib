import { create } from 'zustand';

/**
 * Interface para um item de breadcrumb
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  url: string;
}

/**
 * Interface para o estado do store de breadcrumbs
 */
interface BreadcrumbStore {
  // Múltiplas instâncias de breadcrumbs identificadas por namespace
  breadcrumbs: Record<string, BreadcrumbItem[]>;

  // Define todos os breadcrumbs de uma instância
  setBreadcrumbs: (namespace: string, items: BreadcrumbItem[]) => void;

  // Adiciona um breadcrumb ao final da lista
  addBreadcrumb: (namespace: string, item: BreadcrumbItem) => void;

  // Atualiza um breadcrumb existente
  updateBreadcrumb: (
    namespace: string,
    itemId: string,
    updates: Partial<BreadcrumbItem>
  ) => void;

  // Remove um breadcrumb e todos os seguintes
  removeBreadcrumbFrom: (namespace: string, itemId: string) => void;

  // Mantém apenas os breadcrumbs até o índice especificado
  sliceBreadcrumbs: (namespace: string, index: number) => void;

  // Limpa todos os breadcrumbs de uma instância
  clearBreadcrumbs: (namespace: string) => void;

  // Obtém os breadcrumbs de uma instância
  getBreadcrumbs: (namespace: string) => BreadcrumbItem[];
}

/**
 * Store Zustand para gerenciar breadcrumbs
 * Suporta múltiplas instâncias através de namespaces
 */
export const useBreadcrumbStore = create<BreadcrumbStore>((set, get) => ({
  breadcrumbs: {},

  setBreadcrumbs: (namespace: string, items: BreadcrumbItem[]) => {
    set((state) => ({
      breadcrumbs: {
        ...state.breadcrumbs,
        [namespace]: items,
      },
    }));
  },

  addBreadcrumb: (namespace: string, item: BreadcrumbItem) => {
    set((state) => {
      const current = state.breadcrumbs[namespace] || [];
      return {
        breadcrumbs: {
          ...state.breadcrumbs,
          [namespace]: [...current, item],
        },
      };
    });
  },

  updateBreadcrumb: (
    namespace: string,
    itemId: string,
    updates: Partial<BreadcrumbItem>
  ) => {
    set((state) => {
      const current = state.breadcrumbs[namespace] || [];
      return {
        breadcrumbs: {
          ...state.breadcrumbs,
          [namespace]: current.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        },
      };
    });
  },

  removeBreadcrumbFrom: (namespace: string, itemId: string) => {
    set((state) => {
      const current = state.breadcrumbs[namespace] || [];
      const index = current.findIndex((item) => item.id === itemId);
      if (index === -1) return state;

      return {
        breadcrumbs: {
          ...state.breadcrumbs,
          [namespace]: current.slice(0, index),
        },
      };
    });
  },

  sliceBreadcrumbs: (namespace: string, index: number) => {
    set((state) => {
      const current = state.breadcrumbs[namespace] || [];
      return {
        breadcrumbs: {
          ...state.breadcrumbs,
          [namespace]: current.slice(0, index + 1),
        },
      };
    });
  },

  clearBreadcrumbs: (namespace: string) => {
    set((state) => {
      const { [namespace]: _, ...rest } = state.breadcrumbs;
      return {
        breadcrumbs: rest,
      };
    });
  },

  getBreadcrumbs: (namespace: string) => {
    return get().breadcrumbs[namespace] || [];
  },
}));

/**
 * Hook customizado para facilitar o uso de breadcrumbs
 *
 * @param namespace - Identificador único para esta instância de breadcrumbs
 * @returns Objeto com breadcrumbs e métodos para manipulá-los
 *
 * @example
 * ```tsx
 * const { breadcrumbs, setBreadcrumbs, addBreadcrumb } = useBreadcrumb('performance');
 *
 * // Definir breadcrumbs iniciais
 * setBreadcrumbs([
 *   { id: 'home', name: 'Home', url: '/' },
 *   { id: 'page', name: 'Page', url: '/page' }
 * ]);
 *
 * // Adicionar novo breadcrumb
 * addBreadcrumb({ id: 'detail', name: 'Detail', url: '/page/detail' });
 * ```
 */
export const useBreadcrumb = (namespace: string) => {
  const store = useBreadcrumbStore();
  const breadcrumbs = store.breadcrumbs[namespace] || [];

  return {
    breadcrumbs,

    /**
     * Define todos os breadcrumbs de uma vez
     */
    setBreadcrumbs: (items: BreadcrumbItem[]) => {
      store.setBreadcrumbs(namespace, items);
    },

    /**
     * Adiciona um novo breadcrumb ao final
     */
    addBreadcrumb: (item: BreadcrumbItem) => {
      store.addBreadcrumb(namespace, item);
    },

    /**
     * Atualiza um breadcrumb existente
     */
    updateBreadcrumb: (itemId: string, updates: Partial<BreadcrumbItem>) => {
      store.updateBreadcrumb(namespace, itemId, updates);
    },

    /**
     * Remove um breadcrumb e todos os seguintes
     */
    removeBreadcrumbFrom: (itemId: string) => {
      store.removeBreadcrumbFrom(namespace, itemId);
    },

    /**
     * Mantém apenas os breadcrumbs até o índice especificado (inclusivo)
     */
    sliceBreadcrumbs: (index: number) => {
      store.sliceBreadcrumbs(namespace, index);
    },

    /**
     * Limpa todos os breadcrumbs
     */
    clearBreadcrumbs: () => {
      store.clearBreadcrumbs(namespace);
    },
  };
};
