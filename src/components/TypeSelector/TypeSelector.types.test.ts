import {
  getTabPath,
  getTabFromPath,
  createActivityCategoryConfig,
  ATIVIDADE_LABELS,
  PROVA_LABELS,
  DEFAULT_STATUS_OPTIONS,
  type TypeRoutes,
  type ActivityCategory,
} from './TypeSelector.types';

describe('TypeSelector.types', () => {
  describe('getTabPath', () => {
    it('should return empty string for history tab', () => {
      expect(getTabPath('history')).toBe('');
    });

    it('should return /rascunhos for drafts tab', () => {
      expect(getTabPath('drafts')).toBe('/rascunhos');
    });

    it('should return /modelos for models tab', () => {
      expect(getTabPath('models')).toBe('/modelos');
    });
  });

  describe('getTabFromPath', () => {
    it('should return history for root path', () => {
      expect(getTabFromPath('/atividades')).toBe('history');
      expect(getTabFromPath('/provas')).toBe('history');
    });

    it('should return drafts for path containing /rascunhos', () => {
      expect(getTabFromPath('/atividades/rascunhos')).toBe('drafts');
      expect(getTabFromPath('/provas/rascunhos')).toBe('drafts');
    });

    it('should return models for path containing /modelos', () => {
      expect(getTabFromPath('/atividades/modelos')).toBe('models');
      expect(getTabFromPath('/provas/modelos')).toBe('models');
    });

    it('should return history for unknown paths', () => {
      expect(getTabFromPath('/unknown')).toBe('history');
      expect(getTabFromPath('')).toBe('history');
    });
  });

  describe('createActivityCategoryConfig', () => {
    const mockRoutes: Record<ActivityCategory, TypeRoutes> = {
      ATIVIDADE: {
        base: '/atividades',
        create: '/criar-atividade',
        details: (id: string) => `/atividades/${id}`,
        editDraft: (id: string) => `/criar-atividade?id=${id}`,
        editModel: (id: string) => `/criar-atividade?id=${id}`,
      },
      PROVA: {
        base: '/provas',
        create: '/criar-prova',
        details: (id: string) => `/provas/${id}`,
        editDraft: (id: string) => `/criar-prova?id=${id}`,
        editModel: (id: string) => `/criar-prova?id=${id}`,
      },
    };

    it('should create config with ATIVIDADE labels and routes', () => {
      const config = createActivityCategoryConfig(mockRoutes);

      expect(config.ATIVIDADE.labels).toBe(ATIVIDADE_LABELS);
      expect(config.ATIVIDADE.routes).toBe(mockRoutes.ATIVIDADE);
      expect(config.ATIVIDADE.statusOptions).toBe(
        DEFAULT_STATUS_OPTIONS.ATIVIDADE
      );
    });

    it('should create config with PROVA labels and routes', () => {
      const config = createActivityCategoryConfig(mockRoutes);

      expect(config.PROVA.labels).toBe(PROVA_LABELS);
      expect(config.PROVA.routes).toBe(mockRoutes.PROVA);
      expect(config.PROVA.statusOptions).toBe(DEFAULT_STATUS_OPTIONS.PROVA);
    });

    it('should include all required label fields for ATIVIDADE', () => {
      const config = createActivityCategoryConfig(mockRoutes);
      const labels = config.ATIVIDADE.labels;

      expect(labels.pageTitle.history).toBe('Histórico de atividades');
      expect(labels.pageTitle.drafts).toBe('Rascunhos de atividades');
      expect(labels.pageTitle.models).toBe('Modelos de atividades');
      expect(labels.createButton).toBe('Criar atividade');
      expect(labels.selectorLabel).toBe('Atividades');
      expect(labels.emptyState.title).toBeDefined();
      expect(labels.emptyState.description).toBeDefined();
      expect(labels.emptyState.buttonText).toBe('Criar atividade');
    });

    it('should include all required label fields for PROVA', () => {
      const config = createActivityCategoryConfig(mockRoutes);
      const labels = config.PROVA.labels;

      expect(labels.pageTitle.history).toBe('Histórico de provas');
      expect(labels.pageTitle.drafts).toBe('Rascunhos de provas');
      expect(labels.pageTitle.models).toBe('Modelos de provas');
      expect(labels.createButton).toBe('Criar prova');
      expect(labels.selectorLabel).toBe('Provas');
      expect(labels.emptyState.title).toBeDefined();
      expect(labels.emptyState.description).toBeDefined();
      expect(labels.emptyState.buttonText).toBe('Criar prova');
    });

    it('should preserve route functions', () => {
      const config = createActivityCategoryConfig(mockRoutes);

      expect(config.ATIVIDADE.routes.details('123')).toBe('/atividades/123');
      expect(config.PROVA.routes.details('456')).toBe('/provas/456');
      expect(config.ATIVIDADE.routes.editDraft('789')).toBe(
        '/criar-atividade?id=789'
      );
      expect(config.PROVA.routes.editModel('abc')).toBe('/criar-prova?id=abc');
    });
  });

  describe('ATIVIDADE_LABELS', () => {
    it('should have correct itemLabel values', () => {
      expect(ATIVIDADE_LABELS.itemLabel.history).toBe('atividades');
      expect(ATIVIDADE_LABELS.itemLabel.drafts).toBe('rascunhos');
      expect(ATIVIDADE_LABELS.itemLabel.models).toBe('modelos');
    });

    it('should have correct searchPlaceholder values', () => {
      expect(ATIVIDADE_LABELS.searchPlaceholder.history).toBe(
        'Buscar atividade'
      );
      expect(ATIVIDADE_LABELS.searchPlaceholder.drafts).toBe('Buscar rascunho');
      expect(ATIVIDADE_LABELS.searchPlaceholder.models).toBe('Buscar modelo');
    });

    it('should have correct statusLabel', () => {
      expect(ATIVIDADE_LABELS.statusLabel).toBe('Status da Atividade');
    });
  });

  describe('PROVA_LABELS', () => {
    it('should have correct itemLabel values', () => {
      expect(PROVA_LABELS.itemLabel.history).toBe('provas');
      expect(PROVA_LABELS.itemLabel.drafts).toBe('rascunhos');
      expect(PROVA_LABELS.itemLabel.models).toBe('modelos');
    });

    it('should have correct searchPlaceholder values', () => {
      expect(PROVA_LABELS.searchPlaceholder.history).toBe('Buscar prova');
      expect(PROVA_LABELS.searchPlaceholder.drafts).toBe('Buscar rascunho');
      expect(PROVA_LABELS.searchPlaceholder.models).toBe('Buscar modelo');
    });

    it('should have correct statusLabel', () => {
      expect(PROVA_LABELS.statusLabel).toBe('Status da Prova');
    });
  });

  describe('DEFAULT_STATUS_OPTIONS', () => {
    it('should have status options for ATIVIDADE', () => {
      expect(Array.isArray(DEFAULT_STATUS_OPTIONS.ATIVIDADE)).toBe(true);
      expect(DEFAULT_STATUS_OPTIONS.ATIVIDADE.length).toBeGreaterThan(0);
    });

    it('should have status options for PROVA', () => {
      expect(Array.isArray(DEFAULT_STATUS_OPTIONS.PROVA)).toBe(true);
      expect(DEFAULT_STATUS_OPTIONS.PROVA.length).toBeGreaterThan(0);
    });

    it('should have id and name for each status option', () => {
      DEFAULT_STATUS_OPTIONS.ATIVIDADE.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      });
      DEFAULT_STATUS_OPTIONS.PROVA.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
      });
    });
  });
});
