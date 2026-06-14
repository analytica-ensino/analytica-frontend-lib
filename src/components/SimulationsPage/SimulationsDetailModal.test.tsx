import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
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

  it('renders the alternatives for a question (shared AlternativesList)', async () => {
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
      expect(screen.getByText('25 metros')).toBeInTheDocument()
    );
    expect(screen.getByText('40 metros')).toBeInTheDocument();
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

  it('ignores a stale detail response after switching students', async () => {
    // Student A's detail fetch is deferred so it can resolve after the switch.
    let resolveADetail!: (value: unknown) => void;
    const aDetail = new Promise((resolve) => {
      resolveADetail = resolve;
    });

    const listFor = (uii: string) => ({
      message: 'ok',
      data: {
        student: { userInstitutionId: uii, name: uii, simulationsAnswered: 1 },
        simulations: {
          data: [
            {
              id: 'sim-1',
              title: 'Simulado 1',
              correctCount: 0,
              incorrectCount: 0,
              blankCount: 0,
              totalQuestions: 0,
              createdAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    });

    const get = jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return Promise.resolve({ data: { message: 'ok', data: null } });
      }
      if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
        // Detail: defer student A so it resolves after we switch to B.
        return url.includes('ui-A')
          ? aDetail
          : Promise.resolve({ data: detailPayload });
      }
      return Promise.resolve({
        data: listFor(url.includes('ui-A') ? 'ui-A' : 'ui-B'),
      });
    });
    const api = {
      get,
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    const { rerender } = render(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={{ userInstitutionId: 'ui-A', name: 'Ana' }}
      />
    );
    // Expand for A → starts the deferred A detail fetch.
    fireEvent.click(await screen.findByText('Simulado 1'));

    // Switch to student B before A's detail resolves.
    rerender(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={{ userInstitutionId: 'ui-B', name: 'Bruno' }}
      />
    );
    await screen.findByText('Simulado 1');

    // Now resolve A's (stale) detail — it must NOT populate B's session.
    await act(async () => {
      resolveADetail({ data: detailPayload });
    });

    // Expanding B's simulado must trigger a fresh B fetch (stale write ignored).
    fireEvent.click(screen.getByText('Simulado 1'));
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-B/sim-1'
      )
    );
  });

  it('shows the title the student gave the simulation', async () => {
    const titledList = {
      message: 'ok',
      data: {
        student: {
          userInstitutionId: 'ui-1',
          name: 'Ana Costa',
          simulationsAnswered: 1,
        },
        simulations: {
          data: [
            {
              id: 'sim-1',
              title: 'Prova ENEM Matemática',
              correctCount: 0,
              incorrectCount: 0,
              blankCount: 0,
              totalQuestions: 0,
              createdAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    };
    const get = jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return Promise.resolve({ data: { message: 'ok', data: null } });
      }
      return Promise.resolve({ data: titledList });
    });
    const api = {
      get,
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    render(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );

    await waitFor(() =>
      expect(screen.getByText('Prova ENEM Matemática')).toBeInTheDocument()
    );
  });

  it('falls back to "Simulado N" when the simulation has no title', async () => {
    const untitledList = {
      message: 'ok',
      data: {
        student: {
          userInstitutionId: 'ui-1',
          name: 'Ana Costa',
          simulationsAnswered: 1,
        },
        simulations: {
          data: [
            {
              id: 'sim-1',
              title: '   ',
              correctCount: 0,
              incorrectCount: 0,
              blankCount: 0,
              totalQuestions: 0,
              createdAt: null,
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        },
      },
    };
    const get = jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return Promise.resolve({ data: { message: 'ok', data: null } });
      }
      return Promise.resolve({ data: untitledList });
    });
    const api = {
      get,
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    render(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );

    await waitFor(() =>
      expect(screen.getByText('Simulado 1')).toBeInTheDocument()
    );
  });

  it('renders LaTeX in the question statement', async () => {
    const mathDetail = {
      message: 'ok',
      data: {
        simulationId: 'sim-1',
        title: 'Simulado 1',
        counts: { correct: 0, incorrect: 0, blank: 1 },
        questions: [
          {
            questionId: 'q1',
            statement: 'A energia é $E = mc^2$ no total',
            status: 'BLANK',
            selectedOptionId: null,
            options: [
              {
                id: 'opt-a',
                option: '25 metros',
                isCorrect: true,
                isSelected: false,
              },
            ],
          },
        ],
      },
    };
    const get = jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return Promise.resolve({ data: { message: 'ok', data: null } });
      }
      if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
        return Promise.resolve({ data: mathDetail });
      }
      return Promise.resolve({ data: listPayload });
    });
    const api = {
      get,
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    const { container } = render(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));

    // The `$E = mc^2$` is rendered by KaTeX (a `.katex` node), not shown raw.
    await waitFor(() =>
      expect(container.querySelector('.katex')).toBeInTheDocument()
    );
  });
});
