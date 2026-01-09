import { syncDropdownState } from './dropdown';

describe('dropdown', () => {
  describe('syncDropdownState', () => {
    it('should update state when open is false and isActive is true', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).toHaveBeenCalledWith(expect.any(Function));

      // Test the callback function
      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { notifications: true, profile: false };
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
        profile: false,
      });
    });

    it('should not update state when open is true', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(true, true, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should not update state when isActive is false', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, false, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should not update state when both open is true and isActive is false', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(true, false, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should work with profile key', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'profile');

      expect(mockSetActiveStates).toHaveBeenCalledWith(expect.any(Function));

      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { notifications: false, profile: true };
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
        profile: false,
      });
    });

    it('should preserve other keys in state when updating', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'notifications');

      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = {
        notifications: true,
        profile: true,
        settings: false,
        help: true,
      };
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
        profile: true,
        settings: false,
        help: true,
      });
    });

    it('should work with custom key names', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'customDropdown');

      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { customDropdown: true };
      const result = callback(prevState);

      expect(result).toEqual({
        customDropdown: false,
      });
    });

    it('should handle empty previous state', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'notifications');

      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = {};
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
      });
    });

    it('should add key to state if it does not exist', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'newKey');

      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { existingKey: true };
      const result = callback(prevState);

      expect(result).toEqual({
        existingKey: true,
        newKey: false,
      });
    });

    describe('edge cases', () => {
      it('should handle key with special characters', () => {
        const mockSetActiveStates = jest.fn();

        syncDropdownState(false, true, mockSetActiveStates, 'user-menu');

        const callback = mockSetActiveStates.mock.calls[0][0];
        const prevState = { 'user-menu': true };
        const result = callback(prevState);

        expect(result).toEqual({
          'user-menu': false,
        });
      });

      it('should handle key with numbers', () => {
        const mockSetActiveStates = jest.fn();

        syncDropdownState(false, true, mockSetActiveStates, 'dropdown1');

        const callback = mockSetActiveStates.mock.calls[0][0];
        const prevState = { dropdown1: true };
        const result = callback(prevState);

        expect(result).toEqual({
          dropdown1: false,
        });
      });
    });

    describe('real-world scenarios', () => {
      it('should sync notifications dropdown when closed externally', () => {
        const mockSetActiveStates = jest.fn();

        // Simulating: dropdown was open (isActive=true), now closing (open=false)
        syncDropdownState(false, true, mockSetActiveStates, 'notifications');

        expect(mockSetActiveStates).toHaveBeenCalled();
      });

      it('should not sync when dropdown opens', () => {
        const mockSetActiveStates = jest.fn();

        // Simulating: dropdown is opening (open=true)
        syncDropdownState(true, false, mockSetActiveStates, 'notifications');

        expect(mockSetActiveStates).not.toHaveBeenCalled();
      });

      it('should not sync when dropdown is already synced (both false)', () => {
        const mockSetActiveStates = jest.fn();

        // Simulating: dropdown is closed and button state is already false
        syncDropdownState(false, false, mockSetActiveStates, 'notifications');

        expect(mockSetActiveStates).not.toHaveBeenCalled();
      });

      it('should handle multiple dropdowns independently', () => {
        const mockSetActiveStates = jest.fn();

        // Close notifications dropdown
        syncDropdownState(false, true, mockSetActiveStates, 'notifications');

        const callback1 = mockSetActiveStates.mock.calls[0][0];
        const state1 = callback1({
          notifications: true,
          profile: true,
        });

        expect(state1.notifications).toBe(false);
        expect(state1.profile).toBe(true);

        // Now close profile dropdown
        mockSetActiveStates.mockClear();
        syncDropdownState(false, true, mockSetActiveStates, 'profile');

        const callback2 = mockSetActiveStates.mock.calls[0][0];
        const state2 = callback2(state1);

        expect(state2.notifications).toBe(false);
        expect(state2.profile).toBe(false);
      });
    });
  });
});
