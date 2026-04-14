import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useState } from 'react';
import HierarchicalCheckboxGroup, {
  type HierarchicalCheckboxGroupItem,
} from './HierarchicalCheckboxGroup';

const GROUPS: HierarchicalCheckboxGroupItem[] = [
  {
    id: 'ef',
    label: 'Ensino fundamental',
    items: [
      { id: 'ef-6', label: '6º ano' },
      { id: 'ef-7', label: '7º ano' },
    ],
  },
  {
    id: 'em',
    label: 'Ensino médio',
    items: [
      { id: 'em-1', label: '1º ano' },
      { id: 'em-2', label: '2º ano' },
    ],
  },
];

const getCheckbox = (labelText: string): HTMLInputElement => {
  const label = screen.getByText(labelText).closest('label');
  if (!label) throw new Error(`label for ${labelText} not found`);
  const inputId = label.getAttribute('for');
  if (!inputId) throw new Error(`label for ${labelText} has no htmlFor`);
  const input = document.getElementById(inputId);
  if (!input) throw new Error(`input #${inputId} not found`);
  return input as HTMLInputElement;
};

describe('HierarchicalCheckboxGroup', () => {
  it('renders all groups and items', () => {
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={[]}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText('Ensino fundamental')).toBeInTheDocument();
    expect(screen.getByText('Ensino médio')).toBeInTheDocument();
    expect(screen.getByText('6º ano')).toBeInTheDocument();
    expect(screen.getByText('2º ano')).toBeInTheDocument();
  });

  it('marks the parent as checked when all children are selected', () => {
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={['ef-6', 'ef-7']}
        onChange={jest.fn()}
      />
    );
    const parent = getCheckbox('Ensino fundamental');
    expect(parent.checked).toBe(true);
    expect(parent.indeterminate).toBe(false);
  });

  it('does not mark parent as fully checked when only some children are selected', () => {
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={['ef-6']}
        onChange={jest.fn()}
      />
    );
    const parent = getCheckbox('Ensino fundamental');
    expect(parent.checked).toBe(false);
  });

  it('marks the parent as unchecked when no children are selected', () => {
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={[]}
        onChange={jest.fn()}
      />
    );
    const parent = getCheckbox('Ensino fundamental');
    expect(parent.checked).toBe(false);
    expect(parent.indeterminate).toBe(false);
  });

  it('toggles a single item on click', () => {
    const handleChange = jest.fn();
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={[]}
        onChange={handleChange}
      />
    );
    fireEvent.click(getCheckbox('6º ano'));
    expect(handleChange).toHaveBeenCalledWith(['ef-6']);
  });

  it('deselects a single item on click when already selected', () => {
    const handleChange = jest.fn();
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={['ef-6', 'ef-7']}
        onChange={handleChange}
      />
    );
    fireEvent.click(getCheckbox('6º ano'));
    expect(handleChange).toHaveBeenCalledWith(['ef-7']);
  });

  it('selects all items of a group when parent is clicked (from unchecked)', () => {
    const handleChange = jest.fn();
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={[]}
        onChange={handleChange}
      />
    );
    fireEvent.click(getCheckbox('Ensino fundamental'));
    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining(['ef-6', 'ef-7'])
    );
  });

  it('deselects all items of a group when parent is clicked (from checked)', () => {
    const handleChange = jest.fn();
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={['ef-6', 'ef-7', 'em-1']}
        onChange={handleChange}
      />
    );
    fireEvent.click(getCheckbox('Ensino fundamental'));
    expect(handleChange).toHaveBeenCalledWith(['em-1']);
  });

  it('selects all items of a group when parent is clicked (from indeterminate)', () => {
    const handleChange = jest.fn();
    render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={['ef-6']}
        onChange={handleChange}
      />
    );
    fireEvent.click(getCheckbox('Ensino fundamental'));
    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining(['ef-6', 'ef-7'])
    );
  });

  it('updates state correctly over multiple interactions', () => {
    const Wrapper = () => {
      const [ids, setIds] = useState<string[]>([]);
      return (
        <HierarchicalCheckboxGroup
          groups={GROUPS}
          selectedIds={ids}
          onChange={setIds}
        />
      );
    };
    render(<Wrapper />);

    fireEvent.click(getCheckbox('6º ano'));
    expect(getCheckbox('Ensino fundamental').checked).toBe(false);

    fireEvent.click(getCheckbox('7º ano'));
    expect(getCheckbox('Ensino fundamental').checked).toBe(true);

    fireEvent.click(getCheckbox('Ensino fundamental'));
    expect(getCheckbox('Ensino fundamental').checked).toBe(false);
    expect(getCheckbox('6º ano').checked).toBe(false);
    expect(getCheckbox('7º ano').checked).toBe(false);
  });

  it('does not render dividers when showGroupDividers is false', () => {
    const { container } = render(
      <HierarchicalCheckboxGroup
        groups={GROUPS}
        selectedIds={[]}
        onChange={jest.fn()}
        showGroupDividers={false}
      />
    );
    // Divider uses role="separator" by default (hr semantics)
    expect(container.querySelectorAll('hr').length).toBe(0);
  });
});
