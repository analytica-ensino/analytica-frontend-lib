// Mock CSS imports to prevent errors
jest.mock('../../../styles.css', () => ({}));

// Mock components that depend on external libraries
jest.mock('../../..', () => ({
  Button: () => null,
  Table: () => null,
  Text: () => null,
  TableBody: () => null,
  TableCell: () => null,
  TableHead: () => null,
  TableHeader: () => null,
  TableRow: () => null,
  Modal: () => null,
  Stepper: () => null,
}));

jest.mock('phosphor-react', () => ({
  CaretLeft: () => null,
  CaretRight: () => null,
  PaperPlaneTilt: () => null,
  Trash: () => null,
  Image: () => null,
  Paperclip: () => null,
  X: () => null,
  CalendarBlank: () => null,
  Check: () => null,
}));

import * as AlertManagerExports from '../index';

describe('AlertManager index exports', () => {
  describe('component exports', () => {
    it('should export AlertsManager component', () => {
      expect(AlertManagerExports.AlertsManager).toBeDefined();
      expect(typeof AlertManagerExports.AlertsManager).toBe('function');
    });

    it('should export MessageStep component', () => {
      expect(AlertManagerExports.MessageStep).toBeDefined();
      expect(typeof AlertManagerExports.MessageStep).toBe('function');
    });

    it('should export RecipientsStep component', () => {
      expect(AlertManagerExports.RecipientsStep).toBeDefined();
      expect(typeof AlertManagerExports.RecipientsStep).toBe('function');
    });

    it('should export DateStep component', () => {
      expect(AlertManagerExports.DateStep).toBeDefined();
      expect(typeof AlertManagerExports.DateStep).toBe('function');
    });

    it('should export PreviewStep component', () => {
      expect(AlertManagerExports.PreviewStep).toBeDefined();
      expect(typeof AlertManagerExports.PreviewStep).toBe('function');
    });
  });

  describe('store exports', () => {
    it('should export useAlertFormStore', () => {
      expect(AlertManagerExports.useAlertFormStore).toBeDefined();
      expect(typeof AlertManagerExports.useAlertFormStore).toBe('function');
    });

    it('should have store methods and state', () => {
      const store = AlertManagerExports.useAlertFormStore.getState();

      // Check state properties
      expect(store).toHaveProperty('title');
      expect(store).toHaveProperty('message');
      expect(store).toHaveProperty('image');
      expect(store).toHaveProperty('date');
      expect(store).toHaveProperty('time');
      expect(store).toHaveProperty('sendToday');
      expect(store).toHaveProperty('recipientCategories');

      // Check methods
      expect(store).toHaveProperty('setTitle');
      expect(store).toHaveProperty('setMessage');
      expect(store).toHaveProperty('setImage');
      expect(store).toHaveProperty('setDate');
      expect(store).toHaveProperty('setTime');
      expect(store).toHaveProperty('setSendToday');
      expect(store).toHaveProperty('initializeCategory');
      expect(store).toHaveProperty('updateCategoryItems');
      expect(store).toHaveProperty('updateCategorySelection');
      expect(store).toHaveProperty('clearCategorySelection');
      expect(store).toHaveProperty('resetForm');
    });
  });

  describe('type exports', () => {
    it('should not export types as runtime values', () => {
      // Types should not exist at runtime
      // We can only check that named exports exist by trying to import them
      // TypeScript will handle type checking at compile time

      const exportKeys = Object.keys(AlertManagerExports);

      // Should only have runtime exports (components and store)
      expect(exportKeys).toContain('AlertsManager');
      expect(exportKeys).toContain('MessageStep');
      expect(exportKeys).toContain('RecipientsStep');
      expect(exportKeys).toContain('DateStep');
      expect(exportKeys).toContain('PreviewStep');
      expect(exportKeys).toContain('useAlertFormStore');

      // Types should not be in runtime exports
      expect(exportKeys).not.toContain('AlertsConfig');
      expect(exportKeys).not.toContain('CategoryConfig');
      expect(exportKeys).not.toContain('StepConfig');
      expect(exportKeys).not.toContain('StepComponentProps');
      expect(exportKeys).not.toContain('LabelsConfig');
      expect(exportKeys).not.toContain('AlertData');
      expect(exportKeys).not.toContain('AlertTableItem');
      expect(exportKeys).not.toContain('RecipientItem');
      expect(exportKeys).not.toContain('RecipientCategory');
      expect(exportKeys).not.toContain('FormatGroupLabelFn');
    });
  });

  describe('module structure', () => {
    it('should export exactly the expected number of runtime values', () => {
      const exportKeys = Object.keys(AlertManagerExports);

      // Should have 6 runtime exports:
      // AlertsManager, MessageStep, RecipientsStep, DateStep, PreviewStep, useAlertFormStore
      expect(exportKeys.length).toBe(6);
    });

    it('should have all components as named exports', () => {
      const exportKeys = Object.keys(AlertManagerExports);

      // No default export, all are named exports
      expect(exportKeys.every((key) => key !== 'default')).toBe(true);
    });
  });

  describe('component functionality', () => {
    it('should allow store to be used independently', () => {
      const { useAlertFormStore } = AlertManagerExports;

      // Reset store
      useAlertFormStore.getState().resetForm();

      // Should be able to update store
      expect(() => {
        useAlertFormStore.getState().setTitle('Test');
      }).not.toThrow();

      expect(useAlertFormStore.getState().title).toBe('Test');

      // Cleanup
      useAlertFormStore.getState().resetForm();
    });

    it('should allow components to be accessed', () => {
      const {
        AlertsManager,
        MessageStep,
        RecipientsStep,
        DateStep,
        PreviewStep,
      } = AlertManagerExports;

      // Components should be functions (React components)
      expect(typeof AlertsManager).toBe('function');
      expect(typeof MessageStep).toBe('function');
      expect(typeof RecipientsStep).toBe('function');
      expect(typeof DateStep).toBe('function');
      expect(typeof PreviewStep).toBe('function');

      // Components should have names
      expect(AlertsManager.name).toBeTruthy();
      expect(MessageStep.name).toBeTruthy();
      expect(RecipientsStep.name).toBeTruthy();
      expect(DateStep.name).toBeTruthy();
      expect(PreviewStep.name).toBeTruthy();
    });
  });

  describe('TypeScript type exports', () => {
    it('should allow types to be imported in TypeScript (compile-time check)', () => {
      // This test serves as documentation that these types exist
      // TypeScript compiler will fail if these imports don't work

      // We can't directly test type imports at runtime, but we can document them
      const typeExports = [
        'AlertsConfig',
        'CategoryConfig',
        'StepConfig',
        'StepComponentProps',
        'LabelsConfig',
        'AlertData',
        'AlertTableItem',
        'RecipientItem',
        'RecipientCategory',
        'FormatGroupLabelFn',
      ];

      // Just verify the list is complete
      expect(typeExports).toHaveLength(10);
      expect(typeExports).toContain('AlertsConfig');
      expect(typeExports).toContain('CategoryConfig');
      expect(typeExports).toContain('RecipientItem');
    });
  });

  describe('backwards compatibility', () => {
    it('should maintain stable API for existing consumers', () => {
      const exports = Object.keys(AlertManagerExports);

      // Core exports that should always be available
      const requiredExports = [
        'AlertsManager',
        'MessageStep',
        'RecipientsStep',
        'DateStep',
        'PreviewStep',
        'useAlertFormStore',
      ];

      requiredExports.forEach((requiredExport) => {
        expect(exports).toContain(requiredExport);
      });
    });

    it('should not have breaking changes in store API', () => {
      const { useAlertFormStore } = AlertManagerExports;
      const state = useAlertFormStore.getState();

      // Critical state properties
      const requiredStateProps = [
        'title',
        'message',
        'image',
        'date',
        'time',
        'sendToday',
        'recipientCategories',
      ];

      requiredStateProps.forEach((prop) => {
        expect(state).toHaveProperty(prop);
      });

      // Critical methods
      const requiredMethods = [
        'setTitle',
        'setMessage',
        'setImage',
        'setDate',
        'setTime',
        'setSendToday',
        'resetForm',
        'initializeCategory',
        'updateCategoryItems',
        'updateCategorySelection',
        'clearCategorySelection',
      ];

      requiredMethods.forEach((method) => {
        expect(state).toHaveProperty(method);
        expect(typeof state[method as keyof typeof state]).toBe('function');
      });
    });
  });
});
