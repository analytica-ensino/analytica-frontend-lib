import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimulationsPage } from './SimulationsPage';
import type { BaseApiClient } from '../../types/api';

const studentsPayload = {
  message: 'ok',
  data: {
    students: {
      data: [
        {
          studentId: 's1',
          userInstitutionId: 'ui-1',
          name: 'Ana Costa',
          class: 'A',
          schoolYear: '3ª série do ensino médio',
          simulationsCount: 40,
        },
        {
          studentId: 's2',
          userInstitutionId: 'ui-2',
          name: 'Bruno Lima',
          class: null,
          schoolYear: null,
          simulationsCount: 0,
        },
      ],
      page: 1,
      limit: 10,
      total: 2,
    },
  },
};

const studentSimulationsPayload = {
  message: 'ok',
  data: {
    student: {
      userInstitutionId: 'ui-1',
      name: 'Ana Costa',
      simulationsAnswered: 40,
    },
    simulations: { data: [], page: 1, limit: 20, total: 40 },
  },
};

const accessPayload = {
  message: 'ok',
  data: {
    schools: [{ id: 'sch-1', name: 'Escola 1' }],
    schoolYears: [{ id: 'sy-1', name: '3º Ano', schoolId: 'sch-1' }],
    classes: [
      { id: 'c1', name: 'Turma A', schoolId: 'sch-1', schoolYearId: 'sy-1' },
      { id: 'c2', name: 'Turma B', schoolId: 'sch-1', schoolYearId: 'sy-1' },
    ],
  },
};

function makeApi(): BaseApiClient {
  return {
    get: jest.fn((url: string) => {
      if (url.endsWith('/auth/me')) {
        return Promise.resolve({ data: accessPayload });
      }
      if (url.endsWith('/students')) {
        return Promise.resolve({ data: studentsPayload });
      }
      return Promise.resolve({ data: studentSimulationsPayload });
    }),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;
}

describe('SimulationsPage', () => {
  it('renders the heading and the student row from the API', async () => {
    render(<SimulationsPage api={makeApi()} />);

    expect(screen.getByText('Simulados')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Veja o resultado de todos os simulados realizados por cada estudante'
      )
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Ana Costa')).toBeInTheDocument()
    );
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('shows the school year column, falling back to "-" without a class', async () => {
    render(<SimulationsPage api={makeApi()} />);

    await screen.findByText('Ana Costa');

    expect(screen.getByText('Ano letivo')).toBeInTheDocument();
    expect(screen.getByText('3ª série do ensino médio')).toBeInTheDocument();

    // Bruno não tem turma, então a API devolve schoolYear nulo: a célula do ano
    // letivo e a da turma caem no traço.
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(2);
  });

  it('opens the detail modal when clicking "Ver simulados"', async () => {
    render(<SimulationsPage api={makeApi()} />);

    // Uma linha por estudante, então há um botão por linha: o da Ana é o primeiro.
    const buttons = await screen.findAllByRole('button', {
      name: 'Ver simulados',
    });
    fireEvent.click(buttons[0]);

    await waitFor(() =>
      expect(screen.getByText('40 simulados respondidos')).toBeInTheDocument()
    );
  });

  it('lists the manager classes inside the filter modal', async () => {
    render(<SimulationsPage api={makeApi()} />);

    await screen.findByText('Ana Costa');
    fireEvent.click(screen.getByText('Filtros'));

    expect(await screen.findByText('Turma A')).toBeInTheDocument();
    expect(screen.getByText('Turma B')).toBeInTheDocument();
  });

  it('refetches students with classIds when a turma filter is applied', async () => {
    const api = makeApi();
    render(<SimulationsPage api={api} />);

    await screen.findByText('Ana Costa');
    fireEvent.click(screen.getByText('Filtros'));

    // Select "Turma A" and apply the filter.
    fireEvent.click(await screen.findByText('Turma A'));
    fireEvent.click(screen.getByText('Aplicar'));

    await waitFor(() => {
      const studentsCalls = (api.get as jest.Mock).mock.calls.filter(
        ([url]: [string]) => url.endsWith('/students')
      );
      const lastCall = studentsCalls.at(-1);
      // CSV, not an array: axios turns arrays into `classIds[]=…`, a key the
      // backend schema ignores, which silently disables the filter.
      expect(lastCall?.[1]?.params?.classIds).toBe('c1');
    });
  });
});
