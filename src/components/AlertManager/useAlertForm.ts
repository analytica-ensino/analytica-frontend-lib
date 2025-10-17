import { create } from 'zustand';

// Estrutura genérica para itens de destinatários
export interface RecipientItem {
  id: string;
  name: string;
  [key: string]: unknown; // Permite propriedades adicionais (ex: abbreviation, parentId, etc)
}

// Estrutura genérica para categorias de destinatários (legado - mantido para compatibilidade)
export interface RecipientCategory {
  key: string; // ex: 'escola', 'turma', 'alunos', 'instituicoes'
  label: string; // ex: 'Escola', 'Turma', 'Alunos', 'Instituições'
  availableItems: RecipientItem[]; // Itens disponíveis para seleção
  selectedIds: string[]; // IDs dos itens selecionados
  allSelected: boolean; // Se todos os itens foram selecionados
  parentKey?: string; // Chave da categoria pai (para hierarquia)
  dependsOn?: string[]; // Array de chaves das categorias das quais esta depende
}

interface AlertFormData {
  title: string;
  message: string;
  image: File | null;
  date: string;
  time: string;
  sendToday: boolean;
  sendCopyToEmail: boolean;
  recipientCategories: Record<string, RecipientCategory>; // Categorias dinâmicas
}

interface AlertFormStore extends AlertFormData {
  // Actions
  setTitle: (title: string) => void;
  setMessage: (message: string) => void;
  setImage: (image: File | null) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setSendToday: (sendToday: boolean) => void;
  setSendCopyToEmail: (sendCopyToEmail: boolean) => void;

  // Ações dinâmicas para destinatários
  initializeCategory: (category: RecipientCategory) => void;
  updateCategoryItems: (key: string, items: RecipientItem[]) => void;
  updateCategorySelection: (
    key: string,
    selectedIds: string[],
    allSelected: boolean
  ) => void;
  clearCategorySelection: (key: string) => void;

  resetForm: () => void;
}

const initialState: AlertFormData = {
  title: '',
  message: '',
  image: null,
  date: '',
  time: '',
  sendToday: false,
  sendCopyToEmail: false,
  recipientCategories: {},
};

export const useAlertFormStore = create<AlertFormStore>((set) => ({
  ...initialState,

  // Step 1 - Mensagem
  setTitle: (title) => set({ title }),

  setMessage: (message) => set({ message }),

  setImage: (image) => set({ image }),

  // Step 2 - Destinatários (Dinâmico)
  initializeCategory: (category) =>
    set((state) => ({
      recipientCategories: {
        ...state.recipientCategories,
        [category.key]: {
          ...category,
          selectedIds: category.selectedIds || [],
          allSelected: category.allSelected || false,
        },
      },
    })),

  updateCategoryItems: (key, items) =>
    set((state) => {
      const base =
        state.recipientCategories[key] ??
        ({
          key,
          label: key,
          availableItems: [],
          selectedIds: [],
          allSelected: false,
        } as RecipientCategory);
      return {
        recipientCategories: {
          ...state.recipientCategories,
          [key]: { ...base, availableItems: items },
        },
      };
    }),

  updateCategorySelection: (key, selectedIds, allSelected) =>
    set((state) => {
      const base =
        state.recipientCategories[key] ??
        ({
          key,
          label: key,
          availableItems: [],
          selectedIds: [],
          allSelected: false,
        } as RecipientCategory);
      return {
        recipientCategories: {
          ...state.recipientCategories,
          [key]: { ...base, selectedIds, allSelected },
        },
      };
    }),

  clearCategorySelection: (key) =>
    set((state) => {
      const base =
        state.recipientCategories[key] ??
        ({
          key,
          label: key,
          availableItems: [],
          selectedIds: [],
          allSelected: false,
        } as RecipientCategory);
      return {
        recipientCategories: {
          ...state.recipientCategories,
          [key]: { ...base, selectedIds: [], allSelected: false },
        },
      };
    }),

  // Step 3 - Data de envio
  setDate: (date) => set({ date }),

  setTime: (time) => set({ time }),

  setSendToday: (sendToday) => {
    if (sendToday) {
      // Se marcar "Enviar Hoje", define data e hora atuais
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      set({
        sendToday,
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
      });
    } else {
      set({ sendToday });
    }
  },

  setSendCopyToEmail: (sendCopyToEmail) => set({ sendCopyToEmail }),

  // Reset form
  resetForm: () => set(initialState),
}));
