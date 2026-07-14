import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnFilterMenu from './ColumnFilterMenu';
import type { ColumnFilterConfig } from './useColumnFilters';

const config: ColumnFilterConfig = {
  paramKey: 'statusFilter',
  allLabel: 'Todos os status',
  options: [
    { value: 'DESTAQUE', label: 'DESTAQUE' },
    { value: 'SEM_ACESSO', label: 'SEM ACESSO' },
  ],
};

const openMenu = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Filtrar por Status' }));

describe('ColumnFilterMenu', () => {
  it('uses a caret as its trigger — an arrow would read as "sorted"', () => {
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={config}
        value={[]}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('phosphor-caret-down')).toBeInTheDocument();
    expect(screen.queryByTestId('phosphor-arrow-down')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phosphor-arrow-up')).not.toBeInTheDocument();
  });

  it('opens the menu on the trigger and lists the options', () => {
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={config}
        value={[]}
        onChange={jest.fn()}
      />
    );

    expect(screen.queryByText('DESTAQUE')).not.toBeInTheDocument();

    openMenu();

    expect(screen.getByText('Todos os status')).toBeInTheDocument();
    expect(screen.getByText('DESTAQUE')).toBeInTheDocument();
    expect(screen.getByText('SEM ACESSO')).toBeInTheDocument();
  });

  it('selects a value', () => {
    const onChange = jest.fn();
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={config}
        value={[]}
        onChange={onChange}
      />
    );

    openMenu();
    fireEvent.click(screen.getByText('DESTAQUE'));

    expect(onChange).toHaveBeenCalledWith(['DESTAQUE']);
  });

  it('clears the filter through the "all" entry', () => {
    const onChange = jest.fn();
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={config}
        value={['DESTAQUE']}
        onChange={onChange}
      />
    );

    openMenu();
    fireEvent.click(screen.getByText('Todos os status'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('deselects when the active value is picked again', () => {
    const onChange = jest.fn();
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={config}
        value={['DESTAQUE']}
        onChange={onChange}
      />
    );

    openMenu();
    fireEvent.click(screen.getByText('DESTAQUE'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('accumulates values when multiple is set', () => {
    const onChange = jest.fn();
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={{ ...config, multiple: true }}
        value={['DESTAQUE']}
        onChange={onChange}
      />
    );

    openMenu();
    fireEvent.click(screen.getByText('SEM ACESSO'));

    expect(onChange).toHaveBeenCalledWith(['DESTAQUE', 'SEM_ACESSO']);
  });

  it('removes a value when toggled off in multiple mode', () => {
    const onChange = jest.fn();
    render(
      <ColumnFilterMenu
        columnLabel="Status"
        config={{ ...config, multiple: true }}
        value={['DESTAQUE', 'SEM_ACESSO']}
        onChange={onChange}
      />
    );

    openMenu();
    fireEvent.click(screen.getByText('DESTAQUE'));

    expect(onChange).toHaveBeenCalledWith(['SEM_ACESSO']);
  });

  it('does not trigger an enclosing sort handler', () => {
    // The menu sits in a <th> that also toggles sorting. Neither opening the
    // menu nor picking an option may bubble up into that.
    const onSort = jest.fn();
    render(
      <th onClick={onSort}>
        <ColumnFilterMenu
          columnLabel="Status"
          config={config}
          value={[]}
          onChange={jest.fn()}
        />
      </th>,
      {
        container: document.body.appendChild(document.createElement('table')),
        wrapper: ({ children }) => (
          <tbody>
            <tr>{children}</tr>
          </tbody>
        ),
      }
    );

    openMenu();
    expect(onSort).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('DESTAQUE'));
    expect(onSort).not.toHaveBeenCalled();
  });
});
