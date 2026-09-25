import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiCheckSelect } from './MultiCheckSelect';

const options = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h 30min' },
];

function renderSelect(values: number[], onValuesChange = jest.fn()) {
  render(
    <MultiCheckSelect
      options={options}
      values={values}
      onValuesChange={onValuesChange}
      placeholder="Tempo de prova"
      allLabel="Todos os tempos"
      formatSelected={(count) => `${count} tempos selecionados`}
      aria-label="Tempo de prova"
    />
  );
  return onValuesChange;
}

function open() {
  fireEvent.click(screen.getByRole('button', { name: 'Tempo de prova' }));
}

function checkboxOf(label: string) {
  return screen.getByLabelText(label) as HTMLInputElement;
}

describe('MultiCheckSelect', () => {
  it('shows the placeholder while every option is picked', () => {
    renderSelect([]);

    expect(screen.getByText('Tempo de prova')).toBeInTheDocument();
  });

  it('shows how many options are picked when only some are', () => {
    renderSelect([30, 90]);

    expect(screen.getByText('2 tempos selecionados')).toBeInTheDocument();
  });

  it('checks every box, "all" included, while nothing is narrowed', () => {
    renderSelect([]);
    open();

    expect(checkboxOf('Todos os tempos').checked).toBe(true);
    expect(checkboxOf('30 min').checked).toBe(true);
    expect(checkboxOf('1h').checked).toBe(true);
    expect(checkboxOf('1h 30min').checked).toBe(true);
  });

  it('checks only the picked boxes when narrowed', () => {
    renderSelect([60]);
    open();

    expect(checkboxOf('Todos os tempos').checked).toBe(false);
    expect(checkboxOf('30 min').checked).toBe(false);
    expect(checkboxOf('1h').checked).toBe(true);
  });

  it('unchecking one option out of all keeps the others', () => {
    const onValuesChange = renderSelect([]);
    open();

    fireEvent.click(screen.getByText('1h'));

    expect(onValuesChange).toHaveBeenCalledWith([30, 90]);
  });

  it('checking an option adds it, in the order of the options', () => {
    const onValuesChange = renderSelect([90]);
    open();

    fireEvent.click(screen.getByText('30 min'));

    expect(onValuesChange).toHaveBeenCalledWith([30, 90]);
  });

  it('checking the last missing option goes back to every option', () => {
    const onValuesChange = renderSelect([30, 60]);
    open();

    fireEvent.click(screen.getByText('1h 30min'));

    expect(onValuesChange).toHaveBeenCalledWith([]);
  });

  it('unchecking the last picked option goes back to every option', () => {
    const onValuesChange = renderSelect([60]);
    open();

    fireEvent.click(screen.getByText('1h'));

    expect(onValuesChange).toHaveBeenCalledWith([]);
  });

  it('the "all" item clears a narrowed pick', () => {
    const onValuesChange = renderSelect([60]);
    open();

    fireEvent.click(screen.getByText('Todos os tempos'));

    expect(onValuesChange).toHaveBeenCalledWith([]);
  });

  it('the "all" item does nothing when everything is already picked', () => {
    const onValuesChange = renderSelect([]);
    open();

    fireEvent.click(screen.getByText('Todos os tempos'));

    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it('stays open after a pick, so several can be made in a row', () => {
    renderSelect([]);
    open();

    fireEvent.click(screen.getByText('1h'));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('takes extra classes on the trigger', () => {
    render(
      <MultiCheckSelect
        options={options}
        values={[]}
        onValuesChange={jest.fn()}
        placeholder="Tempo de prova"
        allLabel="Todos os tempos"
        formatSelected={(count) => `${count} tempos selecionados`}
        aria-label="Tempo de prova"
        className="w-60"
      />
    );

    expect(screen.getByRole('button', { name: 'Tempo de prova' })).toHaveClass(
      'w-60'
    );
  });
});
