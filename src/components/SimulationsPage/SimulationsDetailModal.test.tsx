import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimulationsDetailModal } from './SimulationsDetailModal';
import type { BaseApiClient } from '../../types/api';

const listPayload = {
  message: 'ok',
  data: {
    student: {
      userInstitutionId: 'ui-1',
      name: 'Ana Costa',
      simulationsAnswered: 40,
    },
    simulations: {
      data: [
        {
          id: 'sim-1',
          title: 'Simulado 1',
          correctCount: 8,
          incorrectCount: 7,
          blankCount: 4,
          totalQuestions: 19,
          createdAt: null,
        },
      ],
      page: 1,
      limit: 20,
      total: 40,
    },
  },
};

const detailPayload = {
  message: 'ok',
  data: {
    simulationId: 'sim-1',
    title: 'Simulado 1',
    counts: { correct: 8, incorrect: 7, blank: 4 },
    questions: [
      {
        questionId: 'q1',
        statement: 'Um carro inicia do repouso...',
        status: 'INCORRECT',
        selectedOptionId: 'opt-b',
        options: [
          {
            id: 'opt-a',
            option: '25 metros',
            isCorrect: true,
            isSelected: false,
          },
          {
            id: 'opt-b',
            option: '40 metros',
            isCorrect: false,
            isSelected: true,
          },
        ],
      },
    ],
  },
};

function makeApi(postImpl?: jest.Mock): BaseApiClient {
  return {
    get: jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return Promise.resolve({ data: { message: 'ok', data: null } });
      }
      if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
        return Promise.resolve({ data: detailPayload });
      }
      return Promise.resolve({ data: listPayload });
    }),
    post:
      postImpl ??
      jest.fn(() =>
        Promise.resolve({
          data: { message: 'ok', data: { id: 'n1', note: 'Boa' } },
        })
      ),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;
}

const student = { userInstitutionId: 'ui-1', name: 'Ana Costa' };

describe('SimulationsDetailModal', () => {
  it('loads and lists the student simulations', async () => {
    render(
      <SimulationsDetailModal
        api={makeApi()}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    await waitFor(() =>
      expect(screen.getByText('40 simulados respondidos')).toBeInTheDocument()
    );
    expect(screen.getByText('Simulado 1')).toBeInTheDocument();
  });

  it('lazily loads detail with stat cards and question status when expanded', async () => {
    render(
      <SimulationsDetailModal
        api={makeApi()}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));

    await waitFor(() =>
      expect(screen.getByText('Respostas')).toBeInTheDocument()
    );
    expect(screen.getByText('Nº de questões corretas')).toBeInTheDocument();
    expect(screen.getByText('Questão 1')).toBeInTheDocument();
    expect(screen.getByText('Incorreta')).toBeInTheDocument();
  });

  it('shows the options with correct/incorrect markers', async () => {
    render(
      <SimulationsDetailModal
        api={makeApi()}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));
    fireEvent.click(await screen.findByText('Alternativas'));

    await waitFor(() =>
      expect(screen.getByText('Resposta correta')).toBeInTheDocument()
    );
    expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
  });

  it('saves a note via the Incluir flow', async () => {
    const post = jest.fn(() =>
      Promise.resolve({
        data: { message: 'ok', data: { id: 'n1', note: 'Boa evolução' } },
      })
    );
    render(
      <SimulationsDetailModal
        api={makeApi(post)}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));

    const incluir = await screen.findByRole('button', { name: 'Incluir' });
    fireEvent.click(incluir);

    const textarea = await screen.findByPlaceholderText(
      'Escreva uma observação para este simulado'
    );
    fireEvent.change(textarea, { target: { value: 'Boa evolução' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-1/sim-1/note',
        { note: 'Boa evolução' }
      )
    );
  });

  it('shows an error and keeps editing open when saving the note fails', async () => {
    const post = jest.fn(() => Promise.reject(new Error('network')));
    render(
      <SimulationsDetailModal
        api={makeApi(post)}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));

    fireEvent.click(await screen.findByRole('button', { name: 'Incluir' }));
    const textarea = await screen.findByPlaceholderText(
      'Escreva uma observação para este simulado'
    );
    fireEvent.change(textarea, { target: { value: 'Boa evolução' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(
        screen.getByText('Erro ao salvar a observação. Tente novamente.')
      ).toBeInTheDocument()
    );
    // Editing stays open with the draft preserved.
    expect(
      screen.getByPlaceholderText('Escreva uma observação para este simulado')
    ).toHaveValue('Boa evolução');
  });
});
