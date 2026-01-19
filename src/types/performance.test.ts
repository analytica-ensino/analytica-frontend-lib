import {
  PERFORMANCE_TAG_CONFIG,
  getPerformanceTag,
  getPerformanceTagConfig,
} from './performance';

describe('performance', () => {
  describe('PERFORMANCE_TAG_CONFIG', () => {
    it('should have all four performance tags', () => {
      expect(PERFORMANCE_TAG_CONFIG.DESTAQUE_DA_TURMA).toBeDefined();
      expect(PERFORMANCE_TAG_CONFIG.ACIMA_DA_MEDIA).toBeDefined();
      expect(PERFORMANCE_TAG_CONFIG.ABAIXO_DA_MEDIA).toBeDefined();
      expect(PERFORMANCE_TAG_CONFIG.PONTO_DE_ATENCAO).toBeDefined();
    });

    it('should have correct config for DESTAQUE_DA_TURMA', () => {
      const config = PERFORMANCE_TAG_CONFIG.DESTAQUE_DA_TURMA;
      expect(config.label).toBe('Destaque da turma');
      expect(config.variant).toBe('success');
      expect(config.minPercentage).toBe(90);
      expect(config.maxPercentage).toBe(100);
    });

    it('should have correct config for ACIMA_DA_MEDIA', () => {
      const config = PERFORMANCE_TAG_CONFIG.ACIMA_DA_MEDIA;
      expect(config.label).toBe('Acima da média');
      expect(config.variant).toBe('info');
      expect(config.minPercentage).toBe(70);
      expect(config.maxPercentage).toBe(89);
    });

    it('should have correct config for ABAIXO_DA_MEDIA', () => {
      const config = PERFORMANCE_TAG_CONFIG.ABAIXO_DA_MEDIA;
      expect(config.label).toBe('Abaixo da média');
      expect(config.variant).toBe('warning');
      expect(config.minPercentage).toBe(40);
      expect(config.maxPercentage).toBe(69);
    });

    it('should have correct config for PONTO_DE_ATENCAO', () => {
      const config = PERFORMANCE_TAG_CONFIG.PONTO_DE_ATENCAO;
      expect(config.label).toBe('Ponto de atenção');
      expect(config.variant).toBe('error');
      expect(config.minPercentage).toBe(0);
      expect(config.maxPercentage).toBe(39);
    });
  });

  describe('getPerformanceTag', () => {
    it('should return DESTAQUE_DA_TURMA for 90-100%', () => {
      expect(getPerformanceTag(90)).toBe('DESTAQUE_DA_TURMA');
      expect(getPerformanceTag(95)).toBe('DESTAQUE_DA_TURMA');
      expect(getPerformanceTag(100)).toBe('DESTAQUE_DA_TURMA');
    });

    it('should return ACIMA_DA_MEDIA for 70-89%', () => {
      expect(getPerformanceTag(70)).toBe('ACIMA_DA_MEDIA');
      expect(getPerformanceTag(80)).toBe('ACIMA_DA_MEDIA');
      expect(getPerformanceTag(89)).toBe('ACIMA_DA_MEDIA');
    });

    it('should return ABAIXO_DA_MEDIA for 40-69%', () => {
      expect(getPerformanceTag(40)).toBe('ABAIXO_DA_MEDIA');
      expect(getPerformanceTag(55)).toBe('ABAIXO_DA_MEDIA');
      expect(getPerformanceTag(69)).toBe('ABAIXO_DA_MEDIA');
    });

    it('should return PONTO_DE_ATENCAO for 0-39%', () => {
      expect(getPerformanceTag(0)).toBe('PONTO_DE_ATENCAO');
      expect(getPerformanceTag(20)).toBe('PONTO_DE_ATENCAO');
      expect(getPerformanceTag(39)).toBe('PONTO_DE_ATENCAO');
    });

    it('should handle boundary values correctly', () => {
      expect(getPerformanceTag(89)).toBe('ACIMA_DA_MEDIA');
      expect(getPerformanceTag(90)).toBe('DESTAQUE_DA_TURMA');
      expect(getPerformanceTag(69)).toBe('ABAIXO_DA_MEDIA');
      expect(getPerformanceTag(70)).toBe('ACIMA_DA_MEDIA');
      expect(getPerformanceTag(39)).toBe('PONTO_DE_ATENCAO');
      expect(getPerformanceTag(40)).toBe('ABAIXO_DA_MEDIA');
    });

    it('should handle values above 100', () => {
      expect(getPerformanceTag(101)).toBe('DESTAQUE_DA_TURMA');
      expect(getPerformanceTag(150)).toBe('DESTAQUE_DA_TURMA');
    });

    it('should handle negative values', () => {
      expect(getPerformanceTag(-1)).toBe('PONTO_DE_ATENCAO');
      expect(getPerformanceTag(-50)).toBe('PONTO_DE_ATENCAO');
    });
  });

  describe('getPerformanceTagConfig', () => {
    it('should return correct config for DESTAQUE_DA_TURMA range', () => {
      const config = getPerformanceTagConfig(95);
      expect(config.label).toBe('Destaque da turma');
      expect(config.variant).toBe('success');
    });

    it('should return correct config for ACIMA_DA_MEDIA range', () => {
      const config = getPerformanceTagConfig(75);
      expect(config.label).toBe('Acima da média');
      expect(config.variant).toBe('info');
    });

    it('should return correct config for ABAIXO_DA_MEDIA range', () => {
      const config = getPerformanceTagConfig(50);
      expect(config.label).toBe('Abaixo da média');
      expect(config.variant).toBe('warning');
    });

    it('should return correct config for PONTO_DE_ATENCAO range', () => {
      const config = getPerformanceTagConfig(25);
      expect(config.label).toBe('Ponto de atenção');
      expect(config.variant).toBe('error');
    });

    it('should return config matching the tag from getPerformanceTag', () => {
      const percentages = [0, 25, 39, 40, 55, 69, 70, 85, 89, 90, 95, 100];

      percentages.forEach((percentage) => {
        const tag = getPerformanceTag(percentage);
        const config = getPerformanceTagConfig(percentage);
        expect(config).toEqual(PERFORMANCE_TAG_CONFIG[tag]);
      });
    });

    it('should handle edge cases gracefully', () => {
      // Negative values should return PONTO_DE_ATENCAO config
      const negativeConfig = getPerformanceTagConfig(-10);
      expect(negativeConfig.label).toBe('Ponto de atenção');

      // Values above 100 should return DESTAQUE_DA_TURMA config
      const aboveConfig = getPerformanceTagConfig(150);
      expect(aboveConfig.label).toBe('Destaque da turma');
    });
  });
});
