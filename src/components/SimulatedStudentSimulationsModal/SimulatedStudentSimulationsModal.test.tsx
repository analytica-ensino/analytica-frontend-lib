import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  PerformanceBadge,
  SimulatedStudentSimulationsModal,
} from './SimulatedStudentSimulationsModal';
import type { StudentSimulationsData } from './types';
import type { BaseApiClient } from '../../types/api';

const data: StudentSimulationsData = {
  student: {
    studentId: 's-1',
    userInstitutionId: 'ui-1',
    institutionId: 'inst-1',
    name: 'Ana Costa',
    school: 'Escola BNCC',
    schoolYear: '3ª série',
    class: 'Turma A',
    average: 73.7,
    performance: 'ABOVE_AVERAGE',
  },
  totals: {
    simulationsCount: 2,
    totalTimeSeconds: 3725,
    correct: 14,
    incorrect: 4,
    blank: 1,
  },
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
  simulations: [
    {
      activityId: 'sim-1',
      title: 'Simulado ENEM',
      subtype: 'ENEM',
      score: 73.7,
      timeSpentSeconds: 3725,
      answeredAt: '2026-03-05T12:00:00.000Z',
      correct: 14,
      incorrect: 4,
      blank: 1,
      totalQuestions: 19,
      bestContent: null,
      worstContent: null,
    },
  ],
};

const detailPayload = {
  message: 'ok',
  data: {
    simulationId: 'sim-1',
    title: 'Simulado ENEM',
    counts: { correct: 14, incorrect: 4, blank: 1, pending: 0 },
    questions: [
      {
        questionId: 'q1',
        statement: 'Um carro parte do repouso...',
        status: 'INCORRECT',
        questionType: 'ALTERNATIVA',
        selectedOptionId: 'opt-b',
        answer: null,
        additionalContent: null,
        imageAnswer: null,
        correctPoint: null,
        imageTolerance: null,
        teacherComment: null,
        subject: null,
        timeSpent: null,
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

const notePayload = {
  message: 'ok',
  data: { id: 'n-1', note: 'Revisar cinemática', attachment: null },
};

/** Fake client answering the three endpoints the expanded card calls. */
function makeApi(
  overrides: { note?: () => Promise<unknown>; post?: jest.Mock } = {}
): BaseApiClient {
  return {
    get: jest.fn((url: string) => {
      if (url.endsWith('/note')) {
        return overrides.note
          ? overrides.note()
          : Promise.resolve({ data: notePayload });
      }
      return Promise.resolve({ data: detailPayload });
    }),
    post:
      overrides.post ??
      jest.fn(() =>
        Promise.resolve({
          data: {
            message: 'ok',
            data: { id: 'n-1', note: 'Nova nota', attachment: null },
          },
        })
      ),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;
}

function renderModal(
  props: Partial<Parameters<typeof SimulatedStudentSimulationsModal>[0]> = {}
) {
  const api = props.api ?? makeApi();
  render(
    <SimulatedStudentSimulationsModal
      api={api}
      isOpen
      onClose={jest.fn()}
      title="Simulados Enem em 1 mês"
      data={data}
      loading={false}
      error={null}
      {...props}
    />
  );
  return api;
}

describe('SimulatedStudentSimulationsModal', () => {
  it('shows the title and the student header with band and location', () => {
    renderModal();

    expect(screen.getByText('Simulados Enem em 1 mês')).toBeInTheDocument();
    expect(screen.getByText('Ana Costa')).toBeInTheDocument();
    expect(screen.getByText('Acima da média')).toBeInTheDocument();
    expect(screen.getByText('Escola BNCC')).toBeInTheDocument();
    expect(screen.getByText('Turma A')).toBeInTheDocument();
    expect(screen.getByText('3ª série')).toBeInTheDocument();
  });

  it('shows the totals, the overall performance and the subtemas', () => {
    renderModal();

    expect(screen.getByText('Dados de simulados')).toBeInTheDocument();
    // The label of the totals card and the section title share the wording.
    expect(screen.getAllByText('Simulados realizados')).toHaveLength(2);
    expect(screen.getByText('2')).toBeInTheDocument();
    // 3725s = 01:02:05, the same format the Simulados page uses.
    expect(screen.getAllByText('01:02:05').length).toBeGreaterThan(0);

    expect(screen.getByText('Desempenho geral')).toBeInTheDocument();
    // 73.7% of 10, one decimal.
    expect(screen.getAllByText('7,4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nº de questões corretas')).toHaveLength(2);
    // The overall card and the simulado's own card both show 14 correct.
    expect(screen.getAllByText('14')).toHaveLength(2);

    expect(screen.getByText('Cinemática')).toBeInTheDocument();
    expect(screen.getByText('Óptica')).toBeInTheDocument();
  });

  it('lists each simulado with its meta line and progress label', () => {
    renderModal();

    expect(screen.getByText('Simulado ENEM')).toBeInTheDocument();
    expect(
      screen.getByText(/Duração: 01:02:05 · Nota: 7,4 · Feito em:/)
    ).toBeInTheDocument();
    expect(screen.getByText('14 de 19 corretas')).toBeInTheDocument();
  });

  it('renders the skeleton while the caller is loading', () => {
    renderModal({ loading: true, data: null });

    expect(screen.queryByText('Dados de simulados')).not.toBeInTheDocument();
    expect(screen.queryByText('Ana Costa')).not.toBeInTheDocument();
  });

  it('renders the caller error instead of the content', () => {
    renderModal({ loading: false, data: null, error: 'Falhou' });

    expect(screen.getByText('Falhou')).toBeInTheDocument();
    expect(screen.queryByText('Dados de simulados')).not.toBeInTheDocument();
  });

  it('renders nothing but the title when there is no data', () => {
    renderModal({ loading: false, data: null, error: null });

    expect(screen.getByText('Simulados Enem em 1 mês')).toBeInTheDocument();
    expect(screen.queryByText('Dados de simulados')).not.toBeInTheDocument();
  });

  it('shows the empty state when the cut has no simulado', () => {
    renderModal({ data: { ...data, simulations: [] } });

    expect(screen.getByText('Nenhum simulado no período')).toBeInTheDocument();
  });

  it('loads questions and observation when a simulado is expanded', async () => {
    const api = renderModal();

    fireEvent.click(screen.getByText('Simulado ENEM'));

    await waitFor(() =>
      expect(screen.getByText('Respostas')).toBeInTheDocument()
    );
    expect(screen.getByText('Questão 1')).toBeInTheDocument();
    expect(screen.getByText('Revisar cinemática')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1'
    );
    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulations/students/ui-1/sim-1/note'
    );
  });

  it('does not fetch again when the same simulado is collapsed and reopened', async () => {
    const api = renderModal();

    fireEvent.click(screen.getByText('Simulado ENEM'));
    await waitFor(() =>
      expect(screen.getByText('Respostas')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Simulado ENEM'));
    fireEvent.click(screen.getByText('Simulado ENEM'));
    await waitFor(() =>
      expect(screen.getByText('Respostas')).toBeInTheDocument()
    );

    // One detail request and one note request, no matter how often it toggles.
    expect((api.get as jest.Mock).mock.calls).toHaveLength(2);
  });

  it('shows the question error when the detail request fails', async () => {
    const api = {
      get: jest.fn((url: string) =>
        url.endsWith('/note')
          ? Promise.resolve({ data: notePayload })
          : Promise.reject(new Error('boom'))
      ),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    renderModal({ api });
    fireEvent.click(screen.getByText('Simulado ENEM'));

    await waitFor(() =>
      expect(
        screen.getByText('Erro ao carregar as respostas')
      ).toBeInTheDocument()
    );
  });

  describe('when the observation request fails', () => {
    const failingNote = () => Promise.reject(new Error('boom'));

    it('offers a retry instead of an editor, so no note is overwritten', async () => {
      renderModal({ api: makeApi({ note: failingNote }) });

      fireEvent.click(screen.getByText('Simulado ENEM'));

      await waitFor(() =>
        expect(
          screen.getByText('Erro ao carregar a observação')
        ).toBeInTheDocument()
      );
      // The write path must be unreachable while the note is unknown.
      expect(screen.queryByText('Incluir')).not.toBeInTheDocument();
      expect(screen.queryByText('Editar')).not.toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    it('loads the observation again when the retry is clicked', async () => {
      let shouldFail = true;
      const api = makeApi({
        note: () =>
          shouldFail
            ? Promise.reject(new Error('boom'))
            : Promise.resolve({ data: notePayload }),
      });

      renderModal({ api });
      fireEvent.click(screen.getByText('Simulado ENEM'));
      await waitFor(() =>
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
      );

      shouldFail = false;
      fireEvent.click(screen.getByText('Tentar novamente'));

      await waitFor(() =>
        expect(screen.getByText('Revisar cinemática')).toBeInTheDocument()
      );
      expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
    });
  });

  it('saves the observation of the expanded simulado', async () => {
    const post = jest.fn(() =>
      Promise.resolve({
        data: {
          message: 'ok',
          data: { id: 'n-1', note: 'Nota nova', attachment: null },
        },
      })
    );
    renderModal({ api: makeApi({ post }) });

    fireEvent.click(screen.getByText('Simulado ENEM'));
    await waitFor(() =>
      expect(screen.getByText('Revisar cinemática')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(
      screen.getByPlaceholderText('Escreva uma observação para este simulado'),
      { target: { value: 'Nota nova' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-1/sim-1/note',
        { note: 'Nota nova', attachment: null }
      )
    );
    await waitFor(() =>
      expect(screen.getByText('Nota nova')).toBeInTheDocument()
    );
  });

  it('saves a teacher comment and folds it back into the loaded questions', async () => {
    const post = jest.fn((url: string) =>
      Promise.resolve({
        data: url.endsWith('/comment')
          ? {
              message: 'ok',
              data: { questionId: 'q1', teacherComment: 'Revise cinemática.' },
            }
          : { message: 'ok', data: notePayload.data },
      })
    );
    renderModal({ api: makeApi({ post }) });

    fireEvent.click(screen.getByText('Simulado ENEM'));
    fireEvent.click(await screen.findByText('Questão 1'));

    fireEvent.change(
      await screen.findByPlaceholderText(
        'Escreva um comentário sobre esta questão'
      ),
      { target: { value: 'Revise cinemática.' } }
    );
    const saveButtons = await screen.findAllByRole('button', {
      name: 'Salvar',
    });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/performance/simulations/students/ui-1/sim-1/questions/q1/comment',
        { comment: 'Revise cinemática.' }
      )
    );
    expect(
      await screen.findByDisplayValue('Revise cinemática.')
    ).toBeInTheDocument();
  });

  it('uploads an attached file before saving the observation', async () => {
    const post = jest.fn((url: string) =>
      Promise.resolve({
        data: url.includes('pre-signed')
          ? {
              message: 'ok',
              data: {
                signedUrl: 'https://storage/put',
                publicUrl: 'https://cdn/nota.png',
              },
            }
          : {
              message: 'ok',
              data: {
                id: 'n-1',
                note: 'Com anexo',
                attachment: 'https://cdn/nota.png',
              },
            },
      })
    );
    // The upload goes straight to storage with the global fetch; put the real
    // one back afterwards so no other suite inherits this stub.
    const realFetch = globalThis.fetch;
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({ ok: true } as Response)
    ) as typeof globalThis.fetch;

    try {
      renderModal({ api: makeApi({ post }) });

      fireEvent.click(screen.getByText('Simulado ENEM'));
      await waitFor(() =>
        expect(screen.getByText('Revisar cinemática')).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
      fireEvent.change(
        screen.getByPlaceholderText(
          'Escreva uma observação para este simulado'
        ),
        { target: { value: 'Com anexo' } }
      );
      fireEvent.change(screen.getByLabelText('Selecionar arquivo'), {
        target: {
          files: [new File(['x'], 'nota.png', { type: 'image/png' })],
        },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() =>
        expect(post).toHaveBeenCalledWith('/user/get-pre-signed-url', {
          fileName: 'nota.png',
          mimeType: 'image/png',
          fileSize: 1,
        })
      );
      await waitFor(() =>
        expect(post).toHaveBeenCalledWith(
          '/performance/simulations/students/ui-1/sim-1/note',
          { note: 'Com anexo', attachment: 'https://cdn/nota.png' }
        )
      );
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it('drops a response that arrives after the modal switched student', async () => {
    let resolveDetail: ((value: unknown) => void) | undefined;
    const api = {
      get: jest.fn((url: string) => {
        if (url.endsWith('/note')) {
          return Promise.resolve({ data: notePayload });
        }
        return new Promise((resolve) => {
          resolveDetail = resolve;
        });
      }),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    const other = {
      ...data,
      student: { ...data.student, userInstitutionId: 'ui-2', name: 'Bruno' },
    };

    const { rerender } = render(
      <SimulatedStudentSimulationsModal
        api={api}
        isOpen
        onClose={jest.fn()}
        title="Simulados"
        data={data}
        loading={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByText('Simulado ENEM'));
    rerender(
      <SimulatedStudentSimulationsModal
        api={api}
        isOpen
        onClose={jest.fn()}
        title="Simulados"
        data={other}
        loading={false}
        error={null}
      />
    );

    resolveDetail?.({ data: detailPayload });

    // The late answer belongs to the previous student: nothing expands.
    await waitFor(() => expect(screen.getByText('Bruno')).toBeInTheDocument());
    expect(screen.queryByText('Respostas')).not.toBeInTheDocument();
  });

  // The ranking modal of the teacher's Atividades report: logins on top,
  // assignments not answered yet at the end of the list, badge on the far end.
  describe('access, pending and empty states', () => {
    const access = {
      accessCount: 6,
      totalTimeMinutes: 95,
      lastAccess: '2026-09-07T13:50:00',
    };
    const pending = [{ activityId: 'act-9', title: 'Lista 3', subtype: null }];

    it('shows the logins block only when asked, with a zeroed date for no login', () => {
      const { rerender } = render(
        <SimulatedStudentSimulationsModal
          api={makeApi()}
          isOpen
          onClose={jest.fn()}
          title="Desempenho em 1 mês"
          data={{ ...data, access }}
          loading={false}
          error={null}
        />
      );
      expect(screen.queryByText('Dados de acesso')).not.toBeInTheDocument();

      rerender(
        <SimulatedStudentSimulationsModal
          api={makeApi()}
          isOpen
          onClose={jest.fn()}
          title="Desempenho em 1 mês"
          data={{ ...data, access }}
          loading={false}
          error={null}
          showAccess
          badgePlacement="end"
        />
      );
      expect(screen.getByText('Dados de acesso')).toBeInTheDocument();
      expect(screen.getByText('06')).toBeInTheDocument();
      expect(screen.getByText('01:35:00')).toBeInTheDocument();
      expect(screen.getByText('07/09/2026 • 13:50h')).toBeInTheDocument();

      rerender(
        <SimulatedStudentSimulationsModal
          api={makeApi()}
          isOpen
          onClose={jest.fn()}
          title="Desempenho em 1 mês"
          data={{ ...data, access: { ...access, lastAccess: null } }}
          loading={false}
          error={null}
          showAccess
        />
      );
      expect(screen.getByText('00/00/0000 • 00:00h')).toBeInTheDocument();
    });

    it('lists the pending assignments after the answered ones, with the pending copy', () => {
      renderModal({
        data: { ...data, pending },
        showPending: true,
        labels: {
          questionsAnswered: 'Questões respondidas',
          pendingMessage: 'Ainda não feita.',
        },
      });

      expect(screen.getByText('Simulado ENEM')).toBeInTheDocument();
      expect(screen.getByText('Lista 3')).toBeInTheDocument();
      expect(screen.getByText('Ainda não feita.')).toBeInTheDocument();
      // 14 correct + 4 incorrect + 1 blank
      expect(screen.getByText('Questões respondidas')).toBeInTheDocument();
      expect(screen.getByText('19')).toBeInTheDocument();
    });

    it('ignores the pending list unless asked to show it', () => {
      renderModal({ data: { ...data, pending } });
      expect(screen.queryByText('Lista 3')).not.toBeInTheDocument();
    });

    it('shows only pending cards, with zeroed counts, when nothing was answered yet', () => {
      renderModal({
        data: { ...data, simulations: [], pending },
        showPending: true,
      });

      expect(screen.getByText('Lista 3')).toBeInTheDocument();
      expect(screen.getByText('00')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum simulado no período')
      ).not.toBeInTheDocument();
    });

    it('draws the illustrated empty state when nothing was assigned', () => {
      renderModal({
        data: { ...data, simulations: [], pending: [] },
        showPending: true,
        emptyState: {
          image: 'activity.png',
          title: 'Sem atividades ainda',
          description: 'Crie atividades para os alunos',
        },
      });

      expect(screen.getByText('Sem atividades ainda')).toBeInTheDocument();
      expect(
        screen.getByText('Crie atividades para os alunos')
      ).toBeInTheDocument();
      expect(document.querySelector('img[src="activity.png"]')).not.toBeNull();
      expect(
        screen.queryByText('Nenhum simulado no período')
      ).not.toBeInTheDocument();
    });

    it('falls back to the plain empty copy without an empty state', () => {
      renderModal({ data: { ...data, simulations: [] } });
      expect(
        screen.getByText('Nenhum simulado no período')
      ).toBeInTheDocument();
    });

    it('expands a card without asking for its answers when details are disabled', async () => {
      const api = renderModal({ detailsEnabled: false });
      fireEvent.click(screen.getByText('Simulado ENEM'));

      await waitFor(() =>
        expect(screen.getAllByText('Cinemática').length).toBeGreaterThan(0)
      );
      expect(screen.queryByText('Respostas')).not.toBeInTheDocument();
      expect(api.get).not.toHaveBeenCalled();
    });
  });
});

describe('PerformanceBadge', () => {
  it.each([
    ['HIGHLIGHT', 'Destaque da turma'],
    ['ABOVE_AVERAGE', 'Acima da média'],
    ['BELOW_AVERAGE', 'Abaixo da média'],
    ['ATTENTION_POINT', 'Ponto de atenção'],
  ] as const)('labels the %s band', (tag, label) => {
    render(<PerformanceBadge tag={tag} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders nothing for a band the config does not know', () => {
    const { container } = render(
      <PerformanceBadge tag={'UNKNOWN' as 'HIGHLIGHT'} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
