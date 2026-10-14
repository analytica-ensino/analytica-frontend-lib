import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModeToggleReadingFluency } from './ModeToggleReadingFluency';

const OPTIONS = [
  { value: 'ler', label: 'Ler', icon: <svg data-testid="icon-ler" /> },
  { value: 'contar', label: 'Contar', icon: <svg data-testid="icon-contar" /> },
] as const;

const renderToggle = (
  props: Partial<Parameters<typeof ModeToggleReadingFluency>[0]> = {}
) => {
  const onChange = jest.fn();
  render(
    <ModeToggleReadingFluency
      aria-label="Modo do Papolê"
      options={OPTIONS}
      value="ler"
      onChange={onChange}
      {...props}
    />
  );
  return { onChange };
};

describe('ModeToggleReadingFluency', () => {
  it('renders a named radiogroup with one radio per mode', () => {
    renderToggle();

    const group = screen.getByRole('radiogroup', { name: 'Modo do Papolê' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Ler' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Contar' })).toBeInTheDocument();
    expect(screen.getByTestId('icon-ler')).toBeInTheDocument();
    expect(screen.getByTestId('icon-contar')).toBeInTheDocument();
  });

  it('marks only the selected mode as checked and paints it', () => {
    renderToggle({ value: 'contar' });

    const ler = screen.getByRole('radio', { name: 'Ler' });
    const contar = screen.getByRole('radio', { name: 'Contar' });
    expect(contar).toHaveAttribute('aria-checked', 'true');
    expect(ler).toHaveAttribute('aria-checked', 'false');
    expect(contar).toHaveClass('bg-secondary-400', 'text-secondary-700');
    expect(ler).toHaveClass('bg-secondary-500', 'text-secondary-100');
  });

  it('keeps only the selected mode in the Tab order (roving tabindex)', () => {
    renderToggle({ value: 'ler' });

    expect(screen.getByRole('radio', { name: 'Ler' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('radio', { name: 'Contar' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('calls onChange with the clicked mode', () => {
    const { onChange } = renderToggle();

    fireEvent.click(screen.getByRole('radio', { name: 'Contar' }));

    expect(onChange).toHaveBeenCalledWith('contar');
  });

  it('moves the selection and the focus with the arrow keys, wrapping around', () => {
    const { onChange } = renderToggle({ value: 'contar' });
    const contar = screen.getByRole('radio', { name: 'Contar' });
    const ler = screen.getByRole('radio', { name: 'Ler' });

    fireEvent.keyDown(contar, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('ler');
    expect(ler).toHaveFocus();

    fireEvent.keyDown(contar, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('ler');

    fireEvent.keyDown(contar, { key: 'ArrowUp' });
    fireEvent.keyDown(contar, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('ignores keys that are not arrows', () => {
    const { onChange } = renderToggle();

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Ler' }), {
      key: 'Enter',
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses the inline layout (icon beside the label) by default', () => {
    renderToggle();

    expect(screen.getByRole('radiogroup')).toHaveClass(
      'rounded-full',
      'bg-secondary-500',
      'p-1'
    );
    expect(screen.getByRole('radio', { name: 'Ler' })).toHaveClass(
      'h-10',
      'flex-row'
    );
  });

  it('stacks the icon over the label in the stacked layout', () => {
    renderToggle({ layout: 'stacked' });

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('w-[214px]', 'gap-4');
    expect(group.className).toContain('inset_0px_-4px_0px_0px_#38A65C');
    expect(screen.getByRole('radio', { name: 'Ler' })).toHaveClass(
      'size-[57px]',
      'flex-col'
    );
  });

  it('forwards className to the group', () => {
    renderToggle({ className: 'custom-class' });

    expect(screen.getByRole('radiogroup')).toHaveClass('custom-class');
  });
});
