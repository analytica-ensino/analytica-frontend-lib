import type { KeyboardEvent, MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { usePreviewCardToggle } from './PreviewCardParts';

/** Builds an event whose target is a child of a real `<button>` or not. */
const createTarget = (insideButton: boolean) => {
  const child = document.createElement('i');
  const parent = document.createElement(insideButton ? 'button' : 'div');
  parent.appendChild(child);
  return child;
};

const mouseEvent = (insideButton: boolean) =>
  ({
    target: createTarget(insideButton),
    preventDefault: jest.fn(),
  }) as unknown as MouseEvent<HTMLElement>;

const keyEvent = (key: string, insideButton = false) =>
  ({
    key,
    target: createTarget(insideButton),
    preventDefault: jest.fn(),
  }) as unknown as KeyboardEvent<HTMLElement>;

describe('usePreviewCardToggle', () => {
  it('starts with the given state and toggles', () => {
    const { result } = renderHook(() => usePreviewCardToggle(true));

    expect(result.current.isExpanded).toBe(true);

    act(() => result.current.toggleExpanded());

    expect(result.current.isExpanded).toBe(false);
  });

  it('toggles on click, except when it comes from a nested button', () => {
    const { result } = renderHook(() => usePreviewCardToggle(false));

    act(() => result.current.handleCardClick(mouseEvent(true)));
    expect(result.current.isExpanded).toBe(false);

    act(() => result.current.handleCardClick(mouseEvent(false)));
    expect(result.current.isExpanded).toBe(true);
  });

  it('toggles with Enter and Space only, ignoring nested buttons', () => {
    const { result } = renderHook(() => usePreviewCardToggle(false));

    const tab = keyEvent('Tab');
    act(() => result.current.handleCardKeyDown(tab));
    expect(result.current.isExpanded).toBe(false);
    expect(tab.preventDefault).not.toHaveBeenCalled();

    act(() => result.current.handleCardKeyDown(keyEvent('Enter', true)));
    expect(result.current.isExpanded).toBe(false);

    const enter = keyEvent('Enter');
    act(() => result.current.handleCardKeyDown(enter));
    expect(result.current.isExpanded).toBe(true);
    expect(enter.preventDefault).toHaveBeenCalled();

    act(() => result.current.handleCardKeyDown(keyEvent(' ')));
    expect(result.current.isExpanded).toBe(false);
  });
});
