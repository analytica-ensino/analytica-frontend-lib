import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComponentProps } from 'react';
import { MultiSearchSelect } from './MultiSearchSelect';
import type { MultiSearchSelectOption } from './types';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

// JSDOM implements neither of these, and the component relies on both
Element.prototype.scrollIntoView = jest.fn();

const OPTIONS: MultiSearchSelectOption[] = [
  { value: 'c-1', label: 'A - NEM EPT' },
  { value: 'c-2', label: 'B - ENS MEDIO' },
  { value: 'c-3', label: 'C - ENS MEDIO' },
];

const SEARCH_PLACEHOLDER = 'Buscar turma...';

const setup = (props?: Partial<ComponentProps<typeof MultiSearchSelect>>) => {
  const onValuesChange = jest.fn();
  const utils = render(
    <MultiSearchSelect
      label="Turmas"
      values={[]}
      onValuesChange={onValuesChange}
      options={OPTIONS}
      placeholder="Selecione as turmas"
      searchPlaceholder={SEARCH_PLACEHOLDER}
      {...props}
    />
  );
  return { onValuesChange, ...utils };
};

const openPanel = () => fireEvent.click(screen.getByRole('combobox'));
const searchField = () => screen.getByPlaceholderText(SEARCH_PLACEHOLDER);

describe('MultiSearchSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('closed state', () => {
    it('renders the placeholder when nothing is selected', () => {
      setup();
      expect(screen.getByText('Selecione as turmas')).toBeInTheDocument();
    });

    it('renders the label', () => {
      setup();
      expect(screen.getByText('Turmas')).toBeInTheDocument();
    });

    it('names the trigger after the label', () => {
      setup();
      expect(
        screen.getByRole('combobox', { name: 'Turmas' })
      ).toBeInTheDocument();
    });

    it('omits aria-labelledby when there is no label', () => {
      setup({ label: undefined });
      expect(screen.getByRole('combobox')).not.toHaveAttribute(
        'aria-labelledby'
      );
    });

    it('renders one chip per selected value', () => {
      setup({ values: ['c-1', 'c-2'] });

      expect(screen.getByText('A - NEM EPT')).toBeInTheDocument();
      expect(screen.getByText('B - ENS MEDIO')).toBeInTheDocument();
      expect(screen.queryByText('Selecione as turmas')).not.toBeInTheDocument();
    });

    it('collapses chips beyond maxVisibleChips into a counter', () => {
      setup({ values: ['c-1', 'c-2', 'c-3'], maxVisibleChips: 2 });

      expect(screen.getByText('A - NEM EPT')).toBeInTheDocument();
      expect(screen.getByText('B - ENS MEDIO')).toBeInTheDocument();
      expect(screen.queryByText('C - ENS MEDIO')).not.toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('keeps a value missing from options and labels it as unknown', () => {
      setup({
        values: ['gone'],
        unknownValueLabel: 'Turma não encontrada',
      });

      expect(screen.getByText('Turma não encontrada')).toBeInTheDocument();
    });

    it('removes only the clicked chip', () => {
      const { onValuesChange } = setup({ values: ['c-1', 'c-2'] });

      fireEvent.click(screen.getByLabelText('Remover A - NEM EPT'));

      expect(onValuesChange).toHaveBeenCalledWith(['c-2']);
    });

    it('does not open the panel when a chip is removed', () => {
      setup({ values: ['c-1'] });

      fireEvent.click(screen.getByLabelText('Remover A - NEM EPT'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('keeps a key pressed on a chip from reaching the trigger', () => {
      setup({ values: ['c-1'] });

      fireEvent.keyDown(screen.getByLabelText('Remover A - NEM EPT'), {
        key: 'Enter',
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('lets an unknown value be removed', () => {
      const { onValuesChange } = setup({
        values: ['gone'],
        unknownValueLabel: 'Turma não encontrada',
      });

      fireEvent.click(screen.getByLabelText('Remover Turma não encontrada'));

      expect(onValuesChange).toHaveBeenCalledWith([]);
    });

    it('shows the loading text instead of chips', () => {
      setup({ values: ['c-1'], loading: true, loadingText: 'Carregando...' });

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(screen.queryByText('A - NEM EPT')).not.toBeInTheDocument();
    });
  });

  describe('opening', () => {
    it('reveals the search box and the option list', () => {
      setup();
      openPanel();

      expect(searchField()).toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('marks the listbox as multiselectable and focusable', () => {
      setup();
      openPanel();

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable');
      expect(listbox).toHaveAttribute('tabindex', '-1');
    });

    it('does not open when disabled', () => {
      setup({ disabled: true });
      openPanel();

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not open when loading', () => {
      setup({ loading: true });
      openPanel();

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('opens on Enter from the trigger', () => {
      setup();
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens on ArrowDown from the trigger', () => {
      setup();
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('ignores unrelated keys on the trigger', () => {
      setup();
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'a' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('ignores keys on the trigger while disabled', () => {
      setup({ disabled: true });
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes when the trigger is clicked again', () => {
      setup();
      openPanel();
      openPanel();

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('shows emptyText when there are no options', () => {
      setup({ options: [], emptyText: 'Nenhuma turma encontrada' });
      openPanel();

      expect(screen.getByText('Nenhuma turma encontrada')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('appends the clicked value', () => {
      const { onValuesChange } = setup({ values: ['c-1'] });
      openPanel();

      fireEvent.click(
        within(screen.getByRole('listbox')).getByText('B - ENS MEDIO')
      );

      expect(onValuesChange).toHaveBeenCalledWith(['c-1', 'c-2']);
    });

    it('removes an already selected value', () => {
      const { onValuesChange } = setup({ values: ['c-1', 'c-2'] });
      openPanel();

      fireEvent.click(
        within(screen.getByRole('listbox')).getByText('A - NEM EPT')
      );

      expect(onValuesChange).toHaveBeenCalledWith(['c-2']);
    });

    it('keeps the panel open after toggling', () => {
      setup();
      openPanel();

      fireEvent.click(
        within(screen.getByRole('listbox')).getByText('A - NEM EPT')
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('marks selected options with aria-selected', () => {
      setup({ values: ['c-2'] });
      openPanel();

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('ignores clicks on disabled options', () => {
      const { onValuesChange } = setup({
        options: [{ value: 'c-1', label: 'A - NEM EPT', disabled: true }],
      });
      openPanel();

      fireEvent.click(
        within(screen.getByRole('listbox')).getByText('A - NEM EPT')
      );

      expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('toggles a focused option with Enter', () => {
      const { onValuesChange } = setup();
      openPanel();

      fireEvent.keyDown(screen.getAllByRole('option')[1], { key: 'Enter' });

      expect(onValuesChange).toHaveBeenCalledWith(['c-2']);
    });

    it('toggles a focused option with Space', () => {
      const { onValuesChange } = setup({ values: ['c-1'] });
      openPanel();

      fireEvent.keyDown(screen.getAllByRole('option')[0], { key: ' ' });

      expect(onValuesChange).toHaveBeenCalledWith([]);
    });

    it('ignores other keys on a focused option', () => {
      const { onValuesChange } = setup();
      openPanel();

      fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'a' });

      expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('ignores keyboard activation on a disabled option', () => {
      const { onValuesChange } = setup({
        options: [{ value: 'c-1', label: 'A - NEM EPT', disabled: true }],
      });
      openPanel();

      fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'Enter' });

      expect(onValuesChange).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('filters options locally, case-insensitively', () => {
      setup();
      openPanel();

      fireEvent.change(searchField(), { target: { value: 'ens medio' } });

      expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    it('keeps the query after a toggle', () => {
      setup();
      openPanel();

      fireEvent.change(searchField(), { target: { value: 'ens medio' } });
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText('B - ENS MEDIO')
      );

      expect(searchField()).toHaveValue('ens medio');
    });

    it('shows emptyText when nothing matches', () => {
      setup({ emptyText: 'Nenhuma turma encontrada' });
      openPanel();

      fireEvent.change(searchField(), { target: { value: 'zzz' } });

      expect(screen.getByText('Nenhuma turma encontrada')).toBeInTheDocument();
    });

    it('resets the query when the dropdown is reopened', () => {
      setup();
      openPanel();
      fireEvent.change(searchField(), { target: { value: 'zzz' } });
      openPanel();
      openPanel();

      expect(searchField()).toHaveValue('');
    });
  });

  describe('keyboard navigation', () => {
    it('toggles the highlighted option with ArrowDown then Enter', () => {
      const { onValuesChange } = setup();
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'ArrowDown' });
      fireEvent.keyDown(searchField(), { key: 'Enter' });

      expect(onValuesChange).toHaveBeenCalledWith(['c-1']);
    });

    it('wraps around with ArrowUp', () => {
      const { onValuesChange } = setup();
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'ArrowUp' });
      fireEvent.keyDown(searchField(), { key: 'Enter' });

      expect(onValuesChange).toHaveBeenCalledWith(['c-3']);
    });

    it('skips disabled options while arrowing', () => {
      const { onValuesChange } = setup({
        options: [
          { value: 'c-1', label: 'A - NEM EPT', disabled: true },
          { value: 'c-2', label: 'B - ENS MEDIO' },
        ],
      });
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'ArrowDown' });
      fireEvent.keyDown(searchField(), { key: 'Enter' });

      expect(onValuesChange).toHaveBeenCalledWith(['c-2']);
    });

    it('highlights nothing when every option is disabled', () => {
      const { onValuesChange } = setup({
        options: OPTIONS.map((option) => ({ ...option, disabled: true })),
      });
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'ArrowDown' });
      fireEvent.keyDown(searchField(), { key: 'Enter' });

      expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('does nothing on Enter without a highlighted option', () => {
      const { onValuesChange } = setup();
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'Enter' });

      expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('removes the last chip on Backspace with an empty query', () => {
      const { onValuesChange } = setup({ values: ['c-1', 'c-2'] });
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'Backspace' });

      expect(onValuesChange).toHaveBeenCalledWith(['c-1']);
    });

    it('does not remove a chip on Backspace while typing', () => {
      const { onValuesChange } = setup({ values: ['c-1'] });
      openPanel();

      fireEvent.change(searchField(), { target: { value: 'a' } });
      fireEvent.keyDown(searchField(), { key: 'Backspace' });

      expect(onValuesChange).not.toHaveBeenCalled();
    });
  });

  describe('dismissal', () => {
    it('closes on Escape from the search field', () => {
      setup();
      openPanel();

      fireEvent.keyDown(searchField(), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes on Escape from a focused option', () => {
      setup();
      openPanel();

      fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes on Escape from the trigger', () => {
      setup();
      openPanel();

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    /**
     * Modals in this library close on a document-level Escape listener, so a
     * bubbling key would discard the surrounding form along with the dropdown.
     */
    it.each([
      ['the search field', () => searchField()],
      ['an option', () => screen.getAllByRole('option')[0]],
      ['the trigger', () => screen.getByRole('combobox')],
    ])('does not let Escape from %s bubble out', (_label, getTarget) => {
      const onOuterEscape = jest.fn();

      render(
        <div
          onKeyDown={(event) => {
            if (event.key === 'Escape') onOuterEscape();
          }}
        >
          <MultiSearchSelect
            label="Turmas"
            values={[]}
            onValuesChange={jest.fn()}
            options={OPTIONS}
            searchPlaceholder={SEARCH_PLACEHOLDER}
          />
        </div>
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.keyDown(getTarget(), { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onOuterEscape).not.toHaveBeenCalled();
    });

    it('closes on a mousedown outside the trigger and panel', () => {
      setup();
      openPanel();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('stays open on a mousedown inside the panel', () => {
      setup();
      openPanel();

      fireEvent.mouseDown(screen.getByRole('listbox'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('positioning', () => {
    const stubTriggerRect = (rect: Partial<DOMRect>) => {
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue({
          top: 0,
          bottom: 0,
          left: 0,
          width: 200,
          height: 32,
          right: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
          ...rect,
        } as DOMRect);
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('opens below the trigger when there is room', () => {
      window.innerHeight = 800;
      stubTriggerRect({ top: 100, bottom: 132 });
      setup();
      openPanel();

      const panel = screen.getByRole('listbox').parentElement as HTMLElement;
      expect(panel.style.top).toBe('136px');
      expect(panel.style.bottom).toBe('');
    });

    it('flips above the trigger when the space below is too tight', () => {
      window.innerHeight = 800;
      stubTriggerRect({ top: 700, bottom: 732 });
      setup();
      openPanel();

      const panel = screen.getByRole('listbox').parentElement as HTMLElement;
      expect(panel.style.bottom).toBe('104px');
      expect(panel.style.top).toBe('');
    });

    it.each([
      ['scrolled past the bottom edge', { top: 900, bottom: 932 }],
      ['scrolled past the top edge', { top: -200, bottom: -168 }],
    ])('keeps a usable height when the trigger is %s', (_label, rect) => {
      window.innerHeight = 800;
      stubTriggerRect(rect);
      setup();
      openPanel();

      const panel = screen.getByRole('listbox').parentElement as HTMLElement;
      const maxHeight = Number.parseInt(panel.style.maxHeight, 10);

      expect(maxHeight).toBeGreaterThan(0);
      expect(maxHeight).toBeLessThanOrEqual(300);
    });

    it('caps the height at the documented maximum when there is plenty of room', () => {
      window.innerHeight = 2000;
      stubTriggerRect({ top: 100, bottom: 132 });
      setup();
      openPanel();

      const panel = screen.getByRole('listbox').parentElement as HTMLElement;
      expect(panel.style.maxHeight).toBe('300px');
    });

    it('keeps the panel glued to the trigger on scroll', () => {
      window.innerHeight = 800;
      stubTriggerRect({ top: 100, bottom: 132 });
      setup();
      openPanel();

      stubTriggerRect({ top: 60, bottom: 92 });
      fireEvent.scroll(window);

      const panel = screen.getByRole('listbox').parentElement as HTMLElement;
      expect(panel.style.top).toBe('96px');
    });
  });

  describe('helper and error text', () => {
    it('renders the helper text', () => {
      setup({ helperText: 'Escolha ao menos uma' });
      expect(screen.getByText('Escolha ao menos uma')).toBeInTheDocument();
    });

    it('renders the error message and flags the trigger as invalid', () => {
      setup({ errorMessage: 'Campo obrigatório' });

      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('hides the helper text when an error is present', () => {
      setup({ helperText: 'Ajuda', errorMessage: 'Campo obrigatório' });

      expect(screen.queryByText('Ajuda')).not.toBeInTheDocument();
    });
  });

  describe('sizes and variants', () => {
    it.each(['small', 'medium', 'large'] as const)(
      'renders size %s',
      (size) => {
        setup({ size });
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      }
    );

    it.each(['outlined', 'underlined', 'rounded'] as const)(
      'renders variant %s',
      (variant) => {
        setup({ variant });
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      }
    );

    it('accepts a custom id', () => {
      setup({ id: 'turmas-select' });
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'id',
        'turmas-select'
      );
    });
  });
});
