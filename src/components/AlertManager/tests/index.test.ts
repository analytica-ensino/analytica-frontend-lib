import { describe, it, expect, jest } from '@jest/globals';
import * as AlertManagerModule from '../index';

// Mock only the files that actually exist and cause issues
jest.mock('../../../styles.css', () => ({}));
jest.mock('../../../index', () => ({}));
jest.mock('../../../assets/img/notification.png', () => ({}));

// Mock all UI components
jest.mock('../../..', () => ({
  Text: () => null,
  Button: () => null,
  Input: () => null,
  TextArea: () => null,
  Modal: () => null,
  Stepper: () => null,
  Table: () => null,
  TableBody: () => null,
  TableCell: () => null,
  TableHead: () => null,
  TableHeader: () => null,
  TableRow: () => null,
}));

// Mock AlertSteps components
jest.mock('../AlertSteps', () => ({
  MessageStep: () => null,
  RecipientsStep: () => null,
  DateStep: () => null,
  PreviewStep: () => null,
}));

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  CaretLeft: () => null,
  CaretRight: () => null,
  PaperPlaneTilt: () => null,
  Trash: () => null,
}));

describe('AlertManager index exports', () => {
  describe('component exports', () => {
    it('should export AlertsManager component', () => {
      expect(AlertManagerModule.AlertsManager).toBeDefined();
      expect(typeof AlertManagerModule.AlertsManager).toBe('function');
    });

    it('should export MessageStep component', () => {
      expect(AlertManagerModule.MessageStep).toBeDefined();
      expect(typeof AlertManagerModule.MessageStep).toBe('function');
    });

    it('should export RecipientsStep component', () => {
      expect(AlertManagerModule.RecipientsStep).toBeDefined();
      expect(typeof AlertManagerModule.RecipientsStep).toBe('function');
    });

    it('should export DateStep component', () => {
      expect(AlertManagerModule.DateStep).toBeDefined();
      expect(typeof AlertManagerModule.DateStep).toBe('function');
    });

    it('should export PreviewStep component', () => {
      expect(AlertManagerModule.PreviewStep).toBeDefined();
      expect(typeof AlertManagerModule.PreviewStep).toBe('function');
    });
  });

  describe('store exports', () => {
    it('should export useAlertFormStore', () => {
      expect(AlertManagerModule.useAlertFormStore).toBeDefined();
      expect(typeof AlertManagerModule.useAlertFormStore).toBe('function');
    });

    it('should have useAlertFormStore with expected methods', () => {
      const store = AlertManagerModule.useAlertFormStore.getState();

      expect(store).toBeDefined();
      expect(typeof store.resetForm).toBe('function');
      expect(typeof store.setTitle).toBe('function');
      expect(typeof store.setMessage).toBe('function');
      expect(typeof store.setImage).toBe('function');
      expect(typeof store.setDate).toBe('function');
      expect(typeof store.setTime).toBe('function');
      expect(typeof store.setSendToday).toBe('function');
      expect(typeof store.initializeCategory).toBe('function');
      expect(typeof store.updateCategorySelection).toBe('function');
    });

    it('should have useAlertFormStore with expected state properties', () => {
      const store = AlertManagerModule.useAlertFormStore.getState();

      expect(store.title).toBeDefined();
      expect(store.message).toBeDefined();
      expect(store.image).toBeDefined();
      expect(store.date).toBeDefined();
      expect(store.time).toBeDefined();
      expect(store.sendToday).toBeDefined();
      expect(store.recipientCategories).toBeDefined();
    });
  });

  describe('module structure', () => {
    it('should have all expected exports', () => {
      const exports = Object.keys(AlertManagerModule);

      expect(exports).toContain('AlertsManager');
      expect(exports).toContain('MessageStep');
      expect(exports).toContain('RecipientsStep');
      expect(exports).toContain('DateStep');
      expect(exports).toContain('PreviewStep');
      expect(exports).toContain('useAlertFormStore');

      // Should have at least these 6 exports
      expect(exports.length).toBeGreaterThanOrEqual(6);
    });

    it('should maintain proper module structure', () => {
      // Verify all components are functions
      expect(typeof AlertManagerModule.AlertsManager).toBe('function');
      expect(typeof AlertManagerModule.MessageStep).toBe('function');
      expect(typeof AlertManagerModule.RecipientsStep).toBe('function');
      expect(typeof AlertManagerModule.DateStep).toBe('function');
      expect(typeof AlertManagerModule.PreviewStep).toBe('function');
      expect(typeof AlertManagerModule.useAlertFormStore).toBe('function');
    });
  });

  describe('store functionality', () => {
    it('should allow store state manipulation', () => {
      // Test that we can call store methods
      expect(() => {
        AlertManagerModule.useAlertFormStore.getState().setTitle('Test Title');
        AlertManagerModule.useAlertFormStore
          .getState()
          .setMessage('Test Message');
        AlertManagerModule.useAlertFormStore.getState().resetForm();
      }).not.toThrow();
    });

    it('should maintain store state consistency', () => {
      const initialState = AlertManagerModule.useAlertFormStore.getState();
      AlertManagerModule.useAlertFormStore.getState().setTitle('Test');

      const updatedState = AlertManagerModule.useAlertFormStore.getState();
      expect(updatedState.title).toBe('Test');

      // Reset and verify
      AlertManagerModule.useAlertFormStore.getState().resetForm();
      const resetState = AlertManagerModule.useAlertFormStore.getState();
      expect(resetState.title).toBe(initialState.title);
    });
  });
});
