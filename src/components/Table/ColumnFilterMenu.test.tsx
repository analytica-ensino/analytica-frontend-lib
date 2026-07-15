import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  describe('searchable', () => {
    const schools = {
      paramKey: 'schoolIds',
      searchable: true,
      searchPlaceholder: 'Buscar escola...',
      options: [
        {
          value: 's1',
          label: 'Colégio Estadual do Paraná',
          searchText: 'Colégio Estadual do Paraná',
        },
        {
          value: 's2',
          label: 'Escola Municipal São José',
          searchText: 'Escola Municipal São José',
        },
      ],
    } satisfies ColumnFilterConfig;

    const openSchools = () =>
      fireEvent.click(
        screen.getByRole('button', { name: 'Filtrar por Escola' })
      );

    it('has no search box unless asked for one', () => {
      render(
        <ColumnFilterMenu
          columnLabel="Status"
          config={config}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openMenu();

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('filters the given options locally when there is no onSearch', () => {
      render(
        <ColumnFilterMenu
          columnLabel="Escola"
          config={schools}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openSchools();

      expect(screen.getByText('Escola Municipal São José')).toBeInTheDocument();

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'paraná' },
      });

      expect(
        screen.getByText('Colégio Estadual do Paraná')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Escola Municipal São José')
      ).not.toBeInTheDocument();
    });

    it('matches on searchText, since the label can be a node and the value an id', () => {
      render(
        <ColumnFilterMenu
          columnLabel="Escola"
          config={schools}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openSchools();

      // 's1' is the value; searching for it must not match by accident.
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'municipal' },
      });

      expect(screen.getByText('Escola Municipal São José')).toBeInTheDocument();
      expect(
        screen.queryByText('Colégio Estadual do Paraná')
      ).not.toBeInTheDocument();
    });

    it('hands the query to onSearch and stops filtering locally', async () => {
      // With a server-side search the consumer owns the list — the options that
      // come back are already the answer, so filtering them again would drop rows.
      const onSearch = jest.fn();

      render(
        <ColumnFilterMenu
          columnLabel="Escola"
          config={{ ...schools, onSearch }}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openSchools();

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'nada casa com isto' },
      });

      await waitFor(() =>
        expect(onSearch).toHaveBeenCalledWith('nada casa com isto')
      );

      // Both options are still listed: the server decides, not us.
      expect(
        screen.getByText('Colégio Estadual do Paraná')
      ).toBeInTheDocument();
      expect(screen.getByText('Escola Municipal São José')).toBeInTheDocument();
    });

    it('shows a loading state while the search is in flight', () => {
      render(
        <ColumnFilterMenu
          columnLabel="Escola"
          config={{ ...schools, onSearch: jest.fn(), loading: true }}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openSchools();

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(
        screen.queryByText('Colégio Estadual do Paraná')
      ).not.toBeInTheDocument();
    });

    it('shows an empty state when nothing matches', () => {
      render(
        <ColumnFilterMenu
          columnLabel="Escola"
          config={{ ...schools, options: [] }}
          value={[]}
          onChange={jest.fn()}
        />
      );
      openSchools();

      expect(
        screen.getByText('Nenhum resultado encontrado')
      ).toBeInTheDocument();
      // "Todos" stays reachable so the filter can always be cleared.
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });
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
