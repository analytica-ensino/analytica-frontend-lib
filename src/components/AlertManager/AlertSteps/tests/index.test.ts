import { describe, it, expect, jest } from '@jest/globals';
import * as AlertStepsModule from '../index';

// Mock the AlertSteps components
jest.mock('../MessageStep', () => ({
  MessageStep: () => null,
}));

jest.mock('../RecipientsStep', () => ({
  RecipientsStep: () => null,
}));

jest.mock('../DateStep', () => ({
  DateStep: () => null,
}));

jest.mock('../PreviewStep', () => ({
  PreviewStep: () => null,
}));

describe('AlertSteps index exports', () => {
  describe('component exports', () => {
    it('should export MessageStep component', () => {
      expect(AlertStepsModule.MessageStep).toBeDefined();
      expect(typeof AlertStepsModule.MessageStep).toBe('function');
    });

    it('should export RecipientsStep component', () => {
      expect(AlertStepsModule.RecipientsStep).toBeDefined();
      expect(typeof AlertStepsModule.RecipientsStep).toBe('function');
    });

    it('should export DateStep component', () => {
      expect(AlertStepsModule.DateStep).toBeDefined();
      expect(typeof AlertStepsModule.DateStep).toBe('function');
    });

    it('should export PreviewStep component', () => {
      expect(AlertStepsModule.PreviewStep).toBeDefined();
      expect(typeof AlertStepsModule.PreviewStep).toBe('function');
    });
  });

  describe('module structure', () => {
    it('should have all expected exports', () => {
      const exports = Object.keys(AlertStepsModule);

      expect(exports).toContain('MessageStep');
      expect(exports).toContain('RecipientsStep');
      expect(exports).toContain('DateStep');
      expect(exports).toContain('PreviewStep');

      // Should have exactly these 4 exports
      expect(exports).toHaveLength(4);
    });

    it('should maintain proper module structure', () => {
      // Verify all components are functions
      expect(typeof AlertStepsModule.MessageStep).toBe('function');
      expect(typeof AlertStepsModule.RecipientsStep).toBe('function');
      expect(typeof AlertStepsModule.DateStep).toBe('function');
      expect(typeof AlertStepsModule.PreviewStep).toBe('function');
    });
  });

  describe('re-export functionality', () => {
    it('should allow importing all exports from main index', () => {
      // Test that we can import from the main index file
      const indexModule = AlertStepsModule;

      // Check that all expected exports are present
      expect(indexModule).toHaveProperty('MessageStep');
      expect(indexModule).toHaveProperty('RecipientsStep');
      expect(indexModule).toHaveProperty('DateStep');
      expect(indexModule).toHaveProperty('PreviewStep');
    });

    it('should maintain proper export structure', () => {
      const indexModule = AlertStepsModule;

      // Verify all components are functions
      expect(typeof indexModule.MessageStep).toBe('function');
      expect(typeof indexModule.RecipientsStep).toBe('function');
      expect(typeof indexModule.DateStep).toBe('function');
      expect(typeof indexModule.PreviewStep).toBe('function');
    });
  });

  describe('component availability', () => {
    it('should have MessageStep available for import', () => {
      expect(AlertStepsModule.MessageStep).toBeDefined();
      expect(typeof AlertStepsModule.MessageStep).toBe('function');
    });

    it('should have RecipientsStep available for import', () => {
      expect(AlertStepsModule.RecipientsStep).toBeDefined();
      expect(typeof AlertStepsModule.RecipientsStep).toBe('function');
    });

    it('should have DateStep available for import', () => {
      expect(AlertStepsModule.DateStep).toBeDefined();
      expect(typeof AlertStepsModule.DateStep).toBe('function');
    });

    it('should have PreviewStep available for import', () => {
      expect(AlertStepsModule.PreviewStep).toBeDefined();
      expect(typeof AlertStepsModule.PreviewStep).toBe('function');
    });
  });

  describe('export consistency', () => {
    it('should export all components consistently', () => {
      // Since we're using mocks, we verify that all exports are functions
      expect(typeof AlertStepsModule.MessageStep).toBe('function');
      expect(typeof AlertStepsModule.RecipientsStep).toBe('function');
      expect(typeof AlertStepsModule.DateStep).toBe('function');
      expect(typeof AlertStepsModule.PreviewStep).toBe('function');
    });

    it('should not have any extra or missing exports', () => {
      const exports = Object.keys(AlertStepsModule);
      const expectedExports = [
        'MessageStep',
        'RecipientsStep',
        'DateStep',
        'PreviewStep',
      ];

      // Check that we have exactly the expected exports
      expect(exports.sort()).toEqual(expectedExports.sort());

      // Check that all expected exports are present
      expectedExports.forEach((exportName) => {
        expect(exports).toContain(exportName);
      });
    });
  });
});
