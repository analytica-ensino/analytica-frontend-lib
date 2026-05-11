import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AccessibilityToggleRow from './AccessibilityToggleRow';

describe('AccessibilityToggleRow', () => {
  it('renders the label and the description text', () => {
    render(
      <AccessibilityToggleRow
        label="Pausar animações"
        description="Acalma elementos em movimento"
        checked={false}
        onChange={() => undefined}
      />
    );
    expect(screen.getByText('Pausar animações')).toBeInTheDocument();
    expect(
      screen.getByText('Acalma elementos em movimento')
    ).toBeInTheDocument();
  });

  it('uses the string label as aria-label when no override is given', () => {
    render(
      <AccessibilityToggleRow
        label="Cursor maior"
        checked={false}
        onChange={() => undefined}
      />
    );
    expect(
      screen.getByRole('switch', { name: 'Cursor maior' })
    ).toBeInTheDocument();
  });

  it('falls back to ariaLabel when label is a ReactNode', () => {
    render(
      <AccessibilityToggleRow
        label={<span>Texto com markup</span>}
        ariaLabel="Aria explícito"
        checked={false}
        onChange={() => undefined}
      />
    );
    expect(
      screen.getByRole('switch', { name: 'Aria explícito' })
    ).toBeInTheDocument();
  });

  it('triggers onChange on click', async () => {
    const onChange = jest.fn();
    render(
      <AccessibilityToggleRow
        label="Test"
        checked={false}
        onChange={onChange}
        rowTestId="row"
      />
    );
    await userEvent.click(screen.getByTestId('row'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('triggers onChange on Enter and Space keys', async () => {
    const onChange = jest.fn();
    render(
      <AccessibilityToggleRow
        label="Test"
        checked={false}
        onChange={onChange}
        rowTestId="row"
      />
    );
    const row = screen.getByTestId('row');
    row.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('ignores other keys', async () => {
    const onChange = jest.fn();
    render(
      <AccessibilityToggleRow
        label="Test"
        checked={false}
        onChange={onChange}
        rowTestId="row"
      />
    );
    const row = screen.getByTestId('row');
    row.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards the switch testid to the inner ToggleSwitch', () => {
    render(
      <AccessibilityToggleRow
        label="Test"
        checked
        onChange={() => undefined}
        switchTestId="inner-switch"
      />
    );
    expect(screen.getByTestId('inner-switch')).toBeInTheDocument();
  });
});
