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
  describe('module structure', () => {
    it('should export AlertsManager component', () => {
      // Test that the component can be imported
      expect(() => {
        const { AlertsManager } = require('../index');
        expect(AlertsManager).toBeDefined();
        expect(typeof AlertsManager).toBe('function');
      }).not.toThrow();
    });

    it('should export AlertSteps components', () => {
      expect(() => {
        const {
          MessageStep,
          RecipientsStep,
          DateStep,
          PreviewStep,
        } = require('../AlertSteps');

        expect(MessageStep).toBeDefined();
        expect(typeof MessageStep).toBe('function');
        expect(RecipientsStep).toBeDefined();
        expect(typeof RecipientsStep).toBe('function');
        expect(DateStep).toBeDefined();
        expect(typeof DateStep).toBe('function');
        expect(PreviewStep).toBeDefined();
        expect(typeof PreviewStep).toBe('function');
      }).not.toThrow();
    });

    it('should export useAlertFormStore', () => {
      expect(() => {
        const { useAlertFormStore } = require('../useAlertForm');
        expect(useAlertFormStore).toBeDefined();
        expect(typeof useAlertFormStore).toBe('function');
      }).not.toThrow();
    });

    it('should have useAlertFormStore with expected methods', () => {
      const { useAlertFormStore } = require('../useAlertForm');
      const store = useAlertFormStore.getState();

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
      const { useAlertFormStore } = require('../useAlertForm');
      const store = useAlertFormStore.getState();

      expect(store.title).toBeDefined();
      expect(store.message).toBeDefined();
      expect(store.image).toBeDefined();
      expect(store.date).toBeDefined();
      expect(store.time).toBeDefined();
      expect(store.sendToday).toBeDefined();
      expect(store.recipientCategories).toBeDefined();
    });
  });

  describe('re-export functionality', () => {
    it('should allow importing all exports from main index', () => {
      expect(() => {
        // Test that we can import from the main index file
        const indexModule = require('../index');

        // Check that all expected exports are present
        expect(indexModule).toHaveProperty('AlertsManager');
        expect(indexModule).toHaveProperty('MessageStep');
        expect(indexModule).toHaveProperty('RecipientsStep');
        expect(indexModule).toHaveProperty('DateStep');
        expect(indexModule).toHaveProperty('PreviewStep');
        expect(indexModule).toHaveProperty('useAlertFormStore');
      }).not.toThrow();
    });

    it('should maintain proper module structure', () => {
      const indexModule = require('../index');

      // Verify all components are functions
      expect(typeof indexModule.AlertsManager).toBe('function');
      expect(typeof indexModule.MessageStep).toBe('function');
      expect(typeof indexModule.RecipientsStep).toBe('function');
      expect(typeof indexModule.DateStep).toBe('function');
      expect(typeof indexModule.PreviewStep).toBe('function');
      expect(typeof indexModule.useAlertFormStore).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should have type definitions available', () => {
      // Types don't exist at runtime, but we can test that the module structure
      // supports type imports by checking the module exists
      expect(() => {
        require('../types');
        require('../useAlertForm');
      }).not.toThrow();
    });
  });

  describe('store functionality', () => {
    it('should allow store state manipulation', () => {
      const { useAlertFormStore } = require('../useAlertForm');

      // Test that we can call store methods
      expect(() => {
        useAlertFormStore.getState().setTitle('Test Title');
        useAlertFormStore.getState().setMessage('Test Message');
        useAlertFormStore.getState().resetForm();
      }).not.toThrow();
    });

    it('should maintain store state consistency', () => {
      const { useAlertFormStore } = require('../useAlertForm');

      const initialState = useAlertFormStore.getState();
      useAlertFormStore.getState().setTitle('Test');

      const updatedState = useAlertFormStore.getState();
      expect(updatedState.title).toBe('Test');

      // Reset and verify
      useAlertFormStore.getState().resetForm();
      const resetState = useAlertFormStore.getState();
      expect(resetState.title).toBe(initialState.title);
    });
  });
});
