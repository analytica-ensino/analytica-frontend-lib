import type { Dispatch, SetStateAction } from 'react';

/**
 * Synchronizes dropdown state when it closes externally
 * This ensures the toggle button state matches the dropdown state
 *
 * @param open - Current dropdown open state
 * @param isActive - Current active state of the toggle button
 * @param setActiveStates - Function to update active states
 * @param key - Key identifier for the specific dropdown
 */
export const syncDropdownState = (
  open: boolean,
  isActive: boolean,
  setActiveStates: Dispatch<SetStateAction<Record<string, boolean>>>,
  key: string
) => {
  if (!open && isActive) {
    setActiveStates((prev) => ({ ...prev, [key]: false }));
  }
};
