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
          simulationsCount: 40,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
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

function makeApi(): BaseApiClient {
  return {
    get: jest.fn((url: string) => {
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

  it('opens the detail modal when clicking "Ver simulados"', async () => {
    render(<SimulationsPage api={makeApi()} />);

    const button = await screen.findByRole('button', { name: 'Ver simulados' });
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText('40 simulados respondidos')).toBeInTheDocument()
    );
  });
});
