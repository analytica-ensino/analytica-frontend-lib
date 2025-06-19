import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectValue,
} from './Select';

describe('Select component', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = (props?: any) => {
    return render(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectSeparator />
          <SelectItem value="option3" disabled>
            Option 3
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  it('should open and close content on trigger click', async () => {
    setup();
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('should close when clicking outside', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('should select an item and show correct label', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 2'));
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should not select a disabled item', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 3'));
    expect(screen.queryByText('Option 3')).toBeInTheDocument(); // Still visible
    expect(screen.queryByText('Option 3')).toHaveClass('pointer-events-none');
  });

  it('should disabled select', async () => {
    render(
      <Select value="option1">
        <SelectTrigger invalid>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-indicator-error/);
  });

  it('should support controlled mode', async () => {
    const onValueChange = jest.fn();
    render(
      <Select value="option1" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // expect(screen.getByText('Option 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 2'));

    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('should show placeholder if no value is selected', () => {
    render(
      <Select defaultValue="">
        <SelectTrigger>
          <SelectValue placeholder="Select something" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select something')).toBeInTheDocument();
  });

  it('should apply variant and size classes', () => {
    render(
      <Select size="large">
        <SelectTrigger variant="underlined">Trigger</SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-b-2/); // Variant class
  });

  it('should apply content alignment and side', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="center" side="top">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const content = screen.getByText('Option 1').closest('div')?.parentElement;

    expect(content?.className).toMatch(/bottom-full/);
    expect(content?.className).toMatch(/-translate-x-1\/2/);
  });

  it('should throw error if SelectTrigger used outside Select', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SelectTrigger>Trigger</SelectTrigger>)).toThrow(
      /must be used within a Select/
    );
    errorSpy.mockRestore();
  });

  it('should pre-select defaultValue', () => {
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
