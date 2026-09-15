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
      school: 'Escola Estadual A',
      class: '3º A',
      schoolYear: '3ª série do ensino médio',
      simulationsAnswered: 40,
      totalTimeSeconds: 5400,
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
          score: 42.1,
          timeSpentSeconds: 3725,
          answeredAt: '2024-03-05T12:00:00.000Z',
          bestContent: {
            contentId: 'c-1',
            contentName: 'Cinemática',
            correct: 3,
            totalQuestions: 4,
            correctPercentage: 75,
          },
          worstContent: {
            contentId: 'c-2',
            contentName: 'Óptica',
            correct: 1,
            totalQuestions: 4,
            correctPercentage: 25,
          },
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
    counts: { correct: 8, incorrect: 7, blank: 4, pending: 0 },
    questions: [
      {
        questionId: 'q1',
        statement: 'Um carro inicia do repouso...',
        status: 'INCORRECT',
        questionType: 'ALTERNATIVA',
        selectedOptionId: 'opt-b',
        answer: null,
        additionalContent: null,
        imageAnswer: null,
        correctPoint: null,
        imageTolerance: null,
        teacherComment: null,
        options: [
          {
            id: 'opt-a',
            option: '25 metros',
            isCorrect: true,
            isSelected: false,
            selectedValue: null,
          },
          {
            id: 'opt-b',
            option: '40 metros',
            isCorrect: false,
            isSelected: true,
            selectedValue: null,
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
      expect(screen.getByText('Dados de simulados')).toBeInTheDocument()
    );
    // Header: name plus "Escola • Turma • Ano".
    expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    expect(screen.getByText('Escola Estadual A')).toBeInTheDocument();
    expect(screen.getByText('3º A')).toBeInTheDocument();
    expect(screen.getByText('3ª série do ensino médio')).toBeInTheDocument();
    // "Dados de simulados": count and total time as hh:mm:ss. The label is
    // also the title of the list section below, hence two matches.
    expect(screen.getAllByText('Simulados realizados')).toHaveLength(2);
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Tempo total')).toBeInTheDocument();
    expect(screen.getByText('01:30:00')).toBeInTheDocument();
    // Each card: title, "Duração · Nota · Feito em" and the hit count.
    expect(screen.getByText('Simulado 1')).toBeInTheDocument();
    expect(
      screen.getByText('Duração: 01:02:05 · Nota: 4,2 · Feito em: 05/03/2024')
    ).toBeInTheDocument();
    expect(screen.getByText('8 de 19 corretas')).toBeInTheDocument();
  });

  it('shows the grade, the counts and the subtemas of a simulado when expanded', async () => {
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
    expect(screen.getByText('Nota média')).toBeInTheDocument();
    expect(screen.getByText('4,2')).toBeInTheDocument();
    expect(
      screen.getByText('Subtema com melhor resultado')
    ).toBeInTheDocument();
    expect(screen.getByText('Cinemática')).toBeInTheDocument();
    expect(
      screen.getByText('Subtema com maior dificuldade')
    ).toBeInTheDocument();
    expect(screen.getByText('Óptica')).toBeInTheDocument();
    expect(screen.getByText('Observação')).toBeInTheDocument();
  });

  it('tolerates a list payload that predates the score, duration and subtema fields', async () => {
    const legacyPayload = {
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
          total: 1,
        },
      },
    };
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({ data: detailPayload });
        }
        return Promise.resolve({ data: legacyPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));

    await waitFor(() =>
      expect(screen.getByText('Respostas')).toBeInTheDocument()
    );
    // No meta line, no "Tempo total" card, no grade card, dashes for subtemas.
    expect(screen.queryByText(/Duração:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Tempo total')).not.toBeInTheDocument();
    expect(screen.queryByText('Nota média')).not.toBeInTheDocument();
    expect(screen.getByText('Nº de questões corretas')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('shows an empty state when the student answered no simulado', async () => {
    const emptyPayload = {
      message: 'ok',
      data: {
        student: {
          ...listPayload.data.student,
          simulationsAnswered: 0,
          totalTimeSeconds: 0,
        },
        simulations: { data: [], page: 1, limit: 20, total: 0 },
      },
    };
    const api = {
      get: jest.fn(() => Promise.resolve({ data: emptyPayload })),
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
      expect(
        screen.getByText('Este estudante ainda não respondeu nenhum simulado.')
      ).toBeInTheDocument()
    );
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
        { note: 'Boa evolução', attachment: null }
      )
    );
  });

  it('uploads an attached image and saves its URL with the note', async () => {
    const post = jest.fn((url: string) => {
      if (url === '/user/get-pre-signed-url') {
        return Promise.resolve({
          data: {
            data: {
              signedUrl: 'https://storage.example.com/signed',
              publicUrl: 'https://cdn.example.com/notes/plano.png',
            },
          },
        });
      }
      return Promise.resolve({
        data: {
          message: 'ok',
          data: {
            id: 'n1',
            note: 'Segue o plano',
            attachment: 'https://cdn.example.com/notes/plano.png',
          },
        },
      });
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({ ok: true })
    ) as unknown as typeof fetch;

    try {
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
      fireEvent.change(textarea, { target: { value: 'Segue o plano' } });

      // Picking a file swaps the "Anexar" button for a chip with its name.
      const file = new File(['png'], 'plano.png', { type: 'image/png' });
      fireEvent.change(screen.getByLabelText('Selecionar arquivo'), {
        target: { files: [file] },
      });
      expect(screen.getByText('plano.png')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Anexar' })
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() =>
        expect(post).toHaveBeenCalledWith(
          '/performance/simulations/students/ui-1/sim-1/note',
          {
            note: 'Segue o plano',
            attachment: 'https://cdn.example.com/notes/plano.png',
          }
        )
      );
      expect(post).toHaveBeenCalledWith('/user/get-pre-signed-url', {
        fileName: 'plano.png',
        mimeType: 'image/png',
        fileSize: file.size,
      });
      // Collapsed again: the saved note shows the attachment chip and "Editar".
      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
      expect(screen.getByText('plano.png')).toBeInTheDocument();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('shows the saved attachment as a link and lets the teacher remove it', async () => {
    const post = jest.fn(() =>
      Promise.resolve({
        data: {
          message: 'ok',
          data: { id: 'n1', note: 'Boa evolução', attachment: null },
        },
      })
    );
    const api = {
      ...makeApi(post),
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({
            data: {
              message: 'ok',
              data: {
                id: 'n1',
                note: 'Boa evolução',
                attachment: 'https://cdn.example.com/notes/plano%20A.png',
              },
            },
          });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({ data: detailPayload });
        }
        return Promise.resolve({ data: listPayload });
      }),
    } as unknown as BaseApiClient;

    render(
      <SimulationsDetailModal
        api={api}
        isOpen
        onClose={jest.fn()}
        student={student}
      />
    );
    fireEvent.click(await screen.findByText('Simulado 1'));

    // Collapsed: file name decoded from the URL, linking to the file.
    const link = await screen.findByRole('link', { name: /plano A\.png/ });
    expect(link).toHaveAttribute(
      'href',
      'https://cdn.example.com/notes/plano%20A.png'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    // Removing the kept file brings the "Anexar" button back and saves null.
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover plano A.png' })
    );
    expect(screen.getByRole('button', { name: 'Anexar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-1/sim-1/note',
        { note: 'Boa evolução', attachment: null }
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
              title: '  Prova ENEM Matemática  ',
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

    const titleNode = await screen.findByText('Prova ENEM Matemática');
    // The title is rendered trimmed (no leading/trailing whitespace).
    expect(titleNode.textContent).toBe('Prova ENEM Matemática');
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

  it('saves a teacher comment on a question', async () => {
    const post = jest.fn(() =>
      Promise.resolve({
        data: {
          message: 'ok',
          data: { questionId: 'q1', teacherComment: 'Revise a cinemática.' },
        },
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
    fireEvent.click(await screen.findByText('Questão 1'));

    const textarea = await screen.findByPlaceholderText(
      'Escreva um comentário sobre esta questão'
    );
    fireEvent.change(textarea, {
      target: { value: 'Revise a cinemática.' },
    });

    const saveButtons = await screen.findAllByRole('button', {
      name: 'Salvar',
    });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-1/sim-1/questions/q1/comment',
        { comment: 'Revise a cinemática.' }
      )
    );

    // The saved value is folded back into the loaded detail, so Save goes
    // disabled again without a refetch.
    expect(
      await screen.findByDisplayValue('Revise a cinemática.')
    ).toBeInTheDocument();
  });

  it('prefills a comment already saved on the question', async () => {
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({
            data: {
              ...detailPayload,
              data: {
                ...detailPayload.data,
                questions: [
                  {
                    ...detailPayload.data.questions[0],
                    teacherComment: 'Comentário anterior',
                  },
                ],
              },
            },
          });
        }
        return Promise.resolve({ data: listPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));

    expect(
      await screen.findByDisplayValue('Comentário anterior')
    ).toBeInTheDocument();
  });

  it('renders the written answer for an essay question, not an empty Alternativas box', async () => {
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({
            data: {
              ...detailPayload,
              data: {
                ...detailPayload.data,
                counts: { correct: 0, incorrect: 0, blank: 0, pending: 1 },
                questions: [
                  {
                    questionId: 'q-essay',
                    statement: 'Explique a fotossíntese.',
                    questionType: 'DISSERTATIVA',
                    status: 'PENDING',
                    selectedOptionId: null,
                    answer: 'A fotossíntese ocorre nos cloroplastos.',
                    options: [],
                    teacherComment: null,
                  },
                ],
              },
            },
          });
        }
        return Promise.resolve({ data: listPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));

    // Answered essays used to be reported as "Em branco".
    expect(await screen.findByText('Pendente')).toBeInTheDocument();
    expect(
      screen.getByText('1 questão dissertativa aguarda correção')
    ).toBeInTheDocument();

    fireEvent.click(await screen.findByText('Questão 1'));

    expect(await screen.findByText('Resposta do aluno')).toBeInTheDocument();
    expect(screen.queryByText('Alternativas')).not.toBeInTheDocument();
    expect(
      screen.getByText('A fotossíntese ocorre nos cloroplastos.')
    ).toBeInTheDocument();
  });

  it('renders an empty state for an essay the student did not answer', async () => {
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({
            data: {
              ...detailPayload,
              data: {
                ...detailPayload.data,
                questions: [
                  {
                    questionId: 'q-essay',
                    statement: 'Explique a fotossíntese.',
                    questionType: 'DISSERTATIVA',
                    status: 'BLANK',
                    selectedOptionId: null,
                    answer: null,
                    options: [],
                    teacherComment: null,
                  },
                ],
              },
            },
          });
        }
        return Promise.resolve({ data: listPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));

    expect(
      await screen.findByText('Nenhuma resposta fornecida')
    ).toBeInTheDocument();
  });

  it('renders true/false statements with the student marks, not the answer key', async () => {
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({
            data: {
              ...detailPayload,
              data: {
                ...detailPayload.data,
                questions: [
                  {
                    questionId: 'q-tf',
                    statement: 'Julgue as afirmações.',
                    questionType: 'VERDADEIRO_FALSO',
                    status: 'INCORRECT',
                    selectedOptionId: null,
                    answer: '{"opt-t1":"V","opt-t2":"V"}',
                    options: [
                      {
                        id: 'opt-t1',
                        option: 'Afirmação certa',
                        isCorrect: true,
                        isSelected: false,
                        selectedValue: 'V',
                      },
                      {
                        id: 'opt-t2',
                        option: 'Afirmação errada',
                        isCorrect: false,
                        isSelected: false,
                        selectedValue: 'V',
                      },
                      {
                        id: 'opt-t3',
                        option: 'Afirmação em branco',
                        isCorrect: true,
                        isSelected: false,
                        selectedValue: null,
                      },
                    ],
                    teacherComment: null,
                  },
                ],
              },
            },
          });
        }
        return Promise.resolve({ data: listPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));

    // Statements, not "Alternativas" — true/false never writes option_id, so the
    // alternatives branch showed no mark at all.
    expect(await screen.findByText('Afirmações')).toBeInTheDocument();
    expect(screen.queryByText('Alternativas')).not.toBeInTheDocument();

    const marks = await screen.findAllByText('Resposta selecionada: V');
    expect(marks).toHaveLength(2);
    // Only the wrong one reveals the answer key.
    expect(screen.getByText('| Resposta correta: F')).toBeInTheDocument();
    expect(
      screen.getByText('Não respondida | Resposta correta: V')
    ).toBeInTheDocument();
  });

  it('renders the image, the answer area and the student click for an image question', async () => {
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: { message: 'ok', data: null } });
        }
        if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
          return Promise.resolve({
            data: {
              ...detailPayload,
              data: {
                ...detailPayload.data,
                questions: [
                  {
                    questionId: 'q-img',
                    statement: 'Clique na área correta.',
                    questionType: 'IMAGEM',
                    status: 'CORRECT',
                    selectedOptionId: null,
                    answer: '{"coordinateX":52,"coordinateY":28}',
                    additionalContent: 'https://cdn.example.com/mapa.png',
                    imageAnswer: { coordinateX: 52, coordinateY: 28 },
                    correctPoint: { x: 50, y: 30 },
                    imageTolerance: 10,
                    options: [],
                    teacherComment: null,
                  },
                ],
              },
            },
          });
        }
        return Promise.resolve({ data: listPayload });
      }),
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
    fireEvent.click(await screen.findByText('Simulado 1'));
    fireEvent.click(await screen.findByText('Questão 1'));

    // The alternatives branch used to render the answer key's raw JSON as an
    // option label, painted green, with no sign of the student's click.
    fireEvent.click(await screen.findByText('Imagem'));
    expect(screen.queryByText('Alternativas')).not.toBeInTheDocument();
    expect(screen.queryByText('{"x":50,"y":30}')).not.toBeInTheDocument();

    expect(
      screen.getByAltText(/Questão de imagem com área correta/)
    ).toHaveAttribute('src', 'https://cdn.example.com/mapa.png');
    expect(screen.getByTestId('image-student-point')).toHaveStyle({
      left: '52%',
      top: '28%',
    });
    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
  });

  describe('question label (subject + duration)', () => {
    /** A minimal answered-blank question; the label never depends on status. */
    const blankQuestion = {
      status: 'BLANK' as const,
      selectedOptionId: null,
      options: [],
    };

    /**
     * Build an api client whose detail endpoint serves `questions`, reusing the
     * same url routing as `makeApi` so only the detail payload varies.
     */
    function makeApiWithQuestions(
      questions: Record<string, unknown>[]
    ): BaseApiClient {
      const detail = {
        message: 'ok',
        data: {
          simulationId: 'sim-1',
          title: 'Simulado 1',
          counts: { correct: 0, incorrect: 0, blank: questions.length },
          questions,
        },
      };

      return {
        get: jest.fn((url: string) => {
          if (url.endsWith('/note')) {
            return Promise.resolve({ data: { message: 'ok', data: null } });
          }
          if (/\/students\/[^/]+\/[^/]+$/.test(url)) {
            return Promise.resolve({ data: detail });
          }
          return Promise.resolve({ data: listPayload });
        }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      } as unknown as BaseApiClient;
    }

    /** Render the modal and expand the simulation so the questions show up. */
    async function renderExpanded(questions: Record<string, unknown>[]) {
      const result = render(
        <SimulationsDetailModal
          api={makeApiWithQuestions(questions)}
          isOpen
          onClose={jest.fn()}
          student={student}
        />
      );
      fireEvent.click(await screen.findByText('Simulado 1'));
      // findByText, not waitFor + getByText: the detail loads lazily, and the
      // find* query is the one meant for content that is not there yet.
      await screen.findByText('Respostas');
      return result;
    }

    it('joins subject and duration when both are present', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: 'Biologia',
          timeSpent: 40,
        },
      ]);

      expect(
        screen.getByText('Questão 1 - Biologia - 40"')
      ).toBeInTheDocument();
    });

    it('keeps the subject when the time was never measured', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: 'Matemática',
          timeSpent: 0,
        },
      ]);

      expect(screen.getByText('Questão 1 - Matemática')).toBeInTheDocument();
    });

    it('keeps the duration when the question has no subject mapped', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: null,
          timeSpent: 40,
        },
      ]);

      expect(screen.getByText('Questão 1 - 40"')).toBeInTheDocument();
    });

    it('falls back to the bare question number when both are missing', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: null,
          timeSpent: 0,
        },
      ]);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
    });

    it('tolerates a payload that predates the fields entirely', async () => {
      await renderExpanded([
        { ...blankQuestion, questionId: 'q1', statement: 'Q1' },
      ]);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
    });

    it('formats a minutes-and-seconds duration the way the card specifies', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: 'Língua Portuguesa',
          timeSpent: 150,
        },
      ]);

      expect(
        screen.getByText('Questão 1 - Língua Portuguesa - 2\'30"')
      ).toBeInTheDocument();
    });

    it('formats an hour-long duration with an hour unit', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: 'Redação',
          timeSpent: 3930,
        },
      ]);

      expect(
        screen.getByText('Questão 1 - Redação - 1h05\'30"')
      ).toBeInTheDocument();
    });

    it('numbers questions by their position, independently of the fields', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Q1',
          subject: null,
          timeSpent: 0,
        },
        {
          ...blankQuestion,
          questionId: 'q2',
          statement: 'Q2',
          subject: 'Biologia',
          timeSpent: 40,
        },
        {
          ...blankQuestion,
          questionId: 'q3',
          statement: 'Q3',
          subject: 'História',
          timeSpent: 150,
        },
      ]);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
      expect(
        screen.getByText('Questão 2 - Biologia - 40"')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Questão 3 - História - 2\'30"')
      ).toBeInTheDocument();
    });

    it('still renders the status badge next to a long label', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          status: 'CORRECT' as const,
          questionId: 'q1',
          statement: 'Q1',
          subject: 'Língua Portuguesa e suas Tecnologias',
          timeSpent: 3930,
        },
      ]);

      expect(
        screen.getByText(
          'Questão 1 - Língua Portuguesa e suas Tecnologias - 1h05\'30"'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Correta')).toBeInTheDocument();
    });

    it('keeps the question expandable when the label carries extra segments', async () => {
      await renderExpanded([
        {
          ...blankQuestion,
          questionId: 'q1',
          statement: 'Enunciado da questão 1',
          subject: 'Biologia',
          timeSpent: 40,
        },
      ]);

      fireEvent.click(screen.getByText('Questão 1 - Biologia - 40"'));

      expect(
        await screen.findByText('Enunciado da questão 1')
      ).toBeInTheDocument();
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });
  });
});
