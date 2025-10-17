import { renderHook, act } from '@testing-library/react';
import {
  useAlertFormStore,
  RecipientCategory,
  RecipientItem,
} from '../useAlertForm';

describe('useAlertFormStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useAlertFormStore());
    act(() => {
      result.current.resetForm();
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useAlertFormStore());

      expect(result.current.title).toBe('');
      expect(result.current.message).toBe('');
      expect(result.current.image).toBeNull();
      expect(result.current.date).toBe('');
      expect(result.current.time).toBe('');
      expect(result.current.sendToday).toBe(false);
      expect(result.current.recipientCategories).toEqual({});
    });
  });

  describe('message step actions', () => {
    it('should update title', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.setTitle('Test Title');
      });

      expect(result.current.title).toBe('Test Title');
    });

    it('should update message', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.setMessage('Test Message');
      });

      expect(result.current.message).toBe('Test Message');
    });

    it('should update image', () => {
      const { result } = renderHook(() => useAlertFormStore());
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setImage(mockFile);
      });

      expect(result.current.image).toBe(mockFile);
    });

    it('should clear image by setting null', () => {
      const { result } = renderHook(() => useAlertFormStore());
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.setImage(mockFile);
      });

      expect(result.current.image).toBe(mockFile);

      act(() => {
        result.current.setImage(null);
      });

      expect(result.current.image).toBeNull();
    });
  });

  describe('date and time actions', () => {
    it('should update date', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.setDate('2024-10-15');
      });

      expect(result.current.date).toBe('2024-10-15');
    });

    it('should update time', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.setTime('14:30');
      });

      expect(result.current.time).toBe('14:30');
    });

    it('should set sendToday to true and auto-fill date and time', () => {
      const { result } = renderHook(() => useAlertFormStore());

      // Mock current date using Jest fake timers
      const mockDate = new Date('2024-10-15T14:30:00');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      act(() => {
        result.current.setSendToday(true);
      });

      expect(result.current.sendToday).toBe(true);
      expect(result.current.date).toBe('2024-10-15');
      expect(result.current.time).toBe('14:30');

      jest.useRealTimers();
    });

    it('should set sendToday to false and still update date and time', () => {
      const { result } = renderHook(() => useAlertFormStore());

      // Mock current date using Jest fake timers
      const mockDate = new Date('2024-10-15T14:30:00');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      act(() => {
        // Reset first to ensure clean state
        result.current.resetForm();
        result.current.setDate('2024-12-25');
        result.current.setTime('10:00');
        result.current.setSendToday(false);
      });

      expect(result.current.sendToday).toBe(false);
      expect(result.current.date).toBe('2024-10-15');
      expect(result.current.time).toBe('14:30');

      jest.useRealTimers();
    });

    it('should always update date and time regardless of sendToday value', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.setDate('2024-12-25');
        result.current.setTime('10:00');
      });

      expect(result.current.date).toBe('2024-12-25');
      expect(result.current.time).toBe('10:00');

      const mockDate = new Date('2024-10-15T14:30:00');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      act(() => {
        result.current.setSendToday(true);
      });

      expect(result.current.sendToday).toBe(true);
      expect(result.current.date).toBe('2024-10-15');
      expect(result.current.time).toBe('14:30');

      // Test with false as well
      act(() => {
        result.current.setSendToday(false);
      });

      expect(result.current.sendToday).toBe(false);
      expect(result.current.date).toBe('2024-10-15');
      expect(result.current.time).toBe('14:30');

      jest.useRealTimers();
    });
  });

  describe('recipient category actions', () => {
    const mockItems: RecipientItem[] = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
    ];

    const mockCategory: RecipientCategory = {
      key: 'test-category',
      label: 'Test Category',
      availableItems: mockItems,
      selectedIds: [],
      allSelected: false,
    };

    it('should initialize a category', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.initializeCategory(mockCategory);
      });

      expect(result.current.recipientCategories['test-category']).toEqual({
        key: 'test-category',
        label: 'Test Category',
        availableItems: mockItems,
        selectedIds: [],
        allSelected: false,
      });
    });

    it('should initialize category with default selectedIds if not provided', () => {
      const { result } = renderHook(() => useAlertFormStore());
      const categoryWithoutSelection = {
        ...mockCategory,
        selectedIds: undefined as unknown as string[],
      };

      act(() => {
        result.current.initializeCategory(categoryWithoutSelection);
      });

      expect(
        result.current.recipientCategories['test-category'].selectedIds
      ).toEqual([]);
      expect(
        result.current.recipientCategories['test-category'].allSelected
      ).toBe(false);
    });

    it('should update category items', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.initializeCategory(mockCategory);
      });

      const newItems: RecipientItem[] = [
        { id: '4', name: 'Item 4' },
        { id: '5', name: 'Item 5' },
      ];

      act(() => {
        result.current.updateCategoryItems('test-category', newItems);
      });

      expect(
        result.current.recipientCategories['test-category'].availableItems
      ).toEqual(newItems);
    });

    it('should update category selection', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.initializeCategory(mockCategory);
      });

      act(() => {
        result.current.updateCategorySelection(
          'test-category',
          ['1', '2'],
          false
        );
      });

      expect(
        result.current.recipientCategories['test-category'].selectedIds
      ).toEqual(['1', '2']);
      expect(
        result.current.recipientCategories['test-category'].allSelected
      ).toBe(false);
    });

    it('should mark all items as selected', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.initializeCategory(mockCategory);
      });

      act(() => {
        result.current.updateCategorySelection(
          'test-category',
          ['1', '2', '3'],
          true
        );
      });

      expect(
        result.current.recipientCategories['test-category'].selectedIds
      ).toEqual(['1', '2', '3']);
      expect(
        result.current.recipientCategories['test-category'].allSelected
      ).toBe(true);
    });

    it('should clear category selection', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.initializeCategory(mockCategory);
        result.current.updateCategorySelection(
          'test-category',
          ['1', '2'],
          true
        );
      });

      expect(
        result.current.recipientCategories['test-category'].selectedIds
      ).toEqual(['1', '2']);

      act(() => {
        result.current.clearCategorySelection('test-category');
      });

      expect(
        result.current.recipientCategories['test-category'].selectedIds
      ).toEqual([]);
      expect(
        result.current.recipientCategories['test-category'].allSelected
      ).toBe(false);
    });

    it('should handle multiple categories independently', () => {
      const { result } = renderHook(() => useAlertFormStore());

      const category1: RecipientCategory = {
        key: 'category-1',
        label: 'Category 1',
        availableItems: [{ id: '1', name: 'Item 1' }],
        selectedIds: [],
        allSelected: false,
      };

      const category2: RecipientCategory = {
        key: 'category-2',
        label: 'Category 2',
        availableItems: [{ id: '2', name: 'Item 2' }],
        selectedIds: [],
        allSelected: false,
      };

      act(() => {
        result.current.initializeCategory(category1);
        result.current.initializeCategory(category2);
      });

      act(() => {
        result.current.updateCategorySelection('category-1', ['1'], false);
      });

      expect(
        result.current.recipientCategories['category-1'].selectedIds
      ).toEqual(['1']);
      expect(
        result.current.recipientCategories['category-2'].selectedIds
      ).toEqual([]);
    });

    it('should preserve category properties when updating items', () => {
      const { result } = renderHook(() => useAlertFormStore());

      const categoryWithExtras: RecipientCategory = {
        ...mockCategory,
        dependsOn: ['parent-category'],
      };

      act(() => {
        result.current.initializeCategory(categoryWithExtras);
      });

      const newItems: RecipientItem[] = [{ id: '10', name: 'New Item' }];

      act(() => {
        result.current.updateCategoryItems('test-category', newItems);
      });

      expect(
        result.current.recipientCategories['test-category'].availableItems
      ).toEqual(newItems);
      expect(
        result.current.recipientCategories['test-category'].dependsOn
      ).toEqual(['parent-category']);
    });
  });

  describe('resetForm', () => {
    it('should reset all form fields to initial state', () => {
      const { result } = renderHook(() => useAlertFormStore());
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
      const mockCategory: RecipientCategory = {
        key: 'test-category',
        label: 'Test Category',
        availableItems: [{ id: '1', name: 'Item 1' }],
        selectedIds: ['1'],
        allSelected: false,
      };

      // Mock current date using Jest fake timers
      const mockDate = new Date('2024-10-15T14:30:00');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      // Set all fields
      act(() => {
        // Reset first to ensure clean state
        result.current.resetForm();
        result.current.setTitle('Test Title');
        result.current.setMessage('Test Message');
        result.current.setImage(mockFile);
        result.current.setDate('2024-10-15');
        result.current.setTime('14:30');
        result.current.setSendToday(false);
        result.current.initializeCategory(mockCategory);
      });

      // Verify fields are set
      expect(result.current.title).toBe('Test Title');
      expect(result.current.message).toBe('Test Message');
      expect(result.current.image).toBe(mockFile);
      expect(result.current.date).toBe('2024-10-15');
      expect(result.current.time).toBe('14:30');
      expect(Object.keys(result.current.recipientCategories).length).toBe(1);

      // Reset
      act(() => {
        result.current.resetForm();
      });

      // Verify reset
      expect(result.current.title).toBe('');
      expect(result.current.message).toBe('');
      expect(result.current.image).toBeNull();
      expect(result.current.date).toBe('');
      expect(result.current.time).toBe('');
      expect(result.current.sendToday).toBe(false);
      expect(result.current.recipientCategories).toEqual({});

      jest.useRealTimers();
    });
  });

  describe('complex scenarios', () => {
    it('should handle complete form workflow', () => {
      const { result } = renderHook(() => useAlertFormStore());

      // Step 1: Set message
      act(() => {
        result.current.setTitle('Important Alert');
        result.current.setMessage('This is an important message');
      });

      expect(result.current.title).toBe('Important Alert');
      expect(result.current.message).toBe('This is an important message');

      // Step 2: Set recipients
      const schoolCategory: RecipientCategory = {
        key: 'school',
        label: 'School',
        availableItems: [
          { id: 'school-1', name: 'School A' },
          { id: 'school-2', name: 'School B' },
        ],
        selectedIds: [],
        allSelected: false,
      };

      act(() => {
        result.current.initializeCategory(schoolCategory);
        result.current.updateCategorySelection('school', ['school-1'], false);
      });

      expect(result.current.recipientCategories['school'].selectedIds).toEqual([
        'school-1',
      ]);

      // Step 3: Set date
      act(() => {
        result.current.setDate('2024-10-20');
        result.current.setTime('09:00');
      });

      expect(result.current.date).toBe('2024-10-20');
      expect(result.current.time).toBe('09:00');
    });

    it('should handle hierarchical categories', () => {
      const { result } = renderHook(() => useAlertFormStore());

      const schoolCategory: RecipientCategory = {
        key: 'school',
        label: 'School',
        availableItems: [{ id: 'school-1', name: 'School A' }],
        selectedIds: [],
        allSelected: false,
      };

      const classCategory: RecipientCategory = {
        key: 'class',
        label: 'Class',
        availableItems: [],
        selectedIds: [],
        allSelected: false,
        dependsOn: ['school'],
      };

      act(() => {
        result.current.initializeCategory(schoolCategory);
        result.current.initializeCategory(classCategory);
      });

      // Select school
      act(() => {
        result.current.updateCategorySelection('school', ['school-1'], false);
      });

      // Update class items based on school selection
      act(() => {
        result.current.updateCategoryItems('class', [
          { id: 'class-1', name: 'Class 1A', parentId: 'school-1' },
          { id: 'class-2', name: 'Class 1B', parentId: 'school-1' },
        ]);
      });

      expect(
        result.current.recipientCategories['class'].availableItems
      ).toHaveLength(2);
      expect(
        result.current.recipientCategories['class'].availableItems[0].parentId
      ).toBe('school-1');
    });
  });

  describe('guard against missing categories', () => {
    it('should create default category when updateCategoryItems is called before initializeCategory', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.updateCategoryItems('new-category', [
          { id: '1', name: 'Item 1' },
        ]);
      });

      expect(result.current.recipientCategories['new-category']).toEqual({
        key: 'new-category',
        label: 'new-category',
        availableItems: [{ id: '1', name: 'Item 1' }],
        selectedIds: [],
        allSelected: false,
      });
    });

    it('should create default category when updateCategorySelection is called before initializeCategory', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.updateCategorySelection(
          'new-category',
          ['1', '2'],
          true
        );
      });

      expect(result.current.recipientCategories['new-category']).toEqual({
        key: 'new-category',
        label: 'new-category',
        availableItems: [],
        selectedIds: ['1', '2'],
        allSelected: true,
      });
    });

    it('should create default category when clearCategorySelection is called before initializeCategory', () => {
      const { result } = renderHook(() => useAlertFormStore());

      act(() => {
        result.current.clearCategorySelection('new-category');
      });

      expect(result.current.recipientCategories['new-category']).toEqual({
        key: 'new-category',
        label: 'new-category',
        availableItems: [],
        selectedIds: [],
        allSelected: false,
      });
    });

    it('should preserve existing category properties when updating non-existent category', () => {
      const { result } = renderHook(() => useAlertFormStore());

      // First initialize a category
      act(() => {
        result.current.initializeCategory({
          key: 'existing-category',
          label: 'Existing Category',
          availableItems: [{ id: '1', name: 'Item 1' }],
          selectedIds: ['1'],
          allSelected: false,
        });
      });

      // Then update a non-existent category - should not affect existing one
      act(() => {
        result.current.updateCategoryItems('new-category', [
          { id: '2', name: 'Item 2' },
        ]);
      });

      expect(result.current.recipientCategories['existing-category']).toEqual({
        key: 'existing-category',
        label: 'Existing Category',
        availableItems: [{ id: '1', name: 'Item 1' }],
        selectedIds: ['1'],
        allSelected: false,
      });

      expect(result.current.recipientCategories['new-category']).toEqual({
        key: 'new-category',
        label: 'new-category',
        availableItems: [{ id: '2', name: 'Item 2' }],
        selectedIds: [],
        allSelected: false,
      });
    });
  });
});
