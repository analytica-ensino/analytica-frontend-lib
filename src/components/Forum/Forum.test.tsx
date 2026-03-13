import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Forum } from './Forum';
import type { ForumApiClient, ForumTopic, ForumReply } from '../../types/forum';
import { PROFILE_ROLES } from '../../types/chat';

// RichEditor is lazy-loaded with Tiptap — replace with a simple controlled textarea in tests
jest.mock('../RichEditor/RichEditor', () => ({
  RichEditor: ({
    onChange,
    placeholder,
    content,
  }: {
    onChange?: (data: { json: object; html: string }) => void;
    placeholder?: string;
    content?: string;
  }) => (
    <textarea
      placeholder={placeholder}
      defaultValue={content}
      onChange={(e) => onChange?.({ json: {}, html: e.target.value })}
    />
  ),
}));

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTopic: ForumTopic = {
  id: 'topic-1',
  classId: 'class-1',
  userInstitutionId: 'user-1',
  content: 'Alguém já começou a trabalhar no projeto em grupo?',
  imageUrl: null,
  createdAt: '2025-05-05T09:35:00.000Z',
  updatedAt: '2025-05-05T09:35:00.000Z',
  authorName: 'Ana Silva',
  authorPhoto: null,
  authorRole: 'STUDENT',
  replyCount: 0,
};

const mockTopicWithReplies: ForumTopic = {
  ...mockTopic,
  replyCount: 2,
};

const mockReply: ForumReply = {
  id: 'reply-1',
  topicId: 'topic-1',
  userInstitutionId: 'user-2',
  content: 'Sim, já começamos a discutir as ideias ontem.',
  imageUrl: null,
  createdAt: '2025-05-05T10:00:00.000Z',
  updatedAt: '2025-05-05T10:00:00.000Z',
  authorName: 'Lucas Pereira',
  authorPhoto: null,
  authorRole: 'STUDENT',
};

const buildApiClient = (
  overrides: Partial<ForumApiClient> = {}
): ForumApiClient => ({
  getTopics: jest.fn().mockResolvedValue({
    topics: [mockTopic],
    pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
  }),
  getTopic: jest.fn().mockResolvedValue({
    topic: mockTopicWithReplies,
    replies: [mockReply],
  }),
  createTopic: jest.fn().mockResolvedValue(undefined),
  updateTopic: jest.fn().mockResolvedValue(undefined),
  deleteTopic: jest.fn().mockResolvedValue(undefined),
  createReply: jest.fn().mockResolvedValue(undefined),
  updateReply: jest.fn().mockResolvedValue(undefined),
  deleteReply: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const defaultProps = {
  currentUserId: 'user-1',
};

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

describe('Forum — list view', () => {
  it('renders the title, subtitle and create button', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => {
      expect(screen.getByText('Fórum')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Espaço para troca de conhecimento')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar post' })
    ).toBeInTheDocument();
  });

  it('accepts custom title and subtitle', async () => {
    const apiClient = buildApiClient();
    render(
      <Forum
        {...defaultProps}
        apiClient={apiClient}
        title="Discussões"
        subtitle="Troque ideias com seus colegas"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Discussões')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Troque ideias com seus colegas')
    ).toBeInTheDocument();
  });

  it('fetches topics on mount and renders them', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => {
      expect(apiClient.getTopics).toHaveBeenCalledWith({ limit: 50 });
      expect(screen.getByText(mockTopic.content)).toBeInTheDocument();
      expect(screen.getByText(/Ana Silva/)).toBeInTheDocument();
    });
  });

  it('shows empty state when there are no topics', async () => {
    const apiClient = buildApiClient({
      getTopics: jest.fn().mockResolvedValue({
        topics: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
      }),
    });
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum tópico ainda/)).toBeInTheDocument();
    });
  });

  it('shows reply count for each topic', async () => {
    const apiClient = buildApiClient({
      getTopics: jest.fn().mockResolvedValue({
        topics: [{ ...mockTopic, replyCount: 3 }],
        pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
      }),
    });
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => {
      expect(screen.getByText('3 respostas')).toBeInTheDocument();
    });
  });

  it('shows singular "1 resposta"', async () => {
    const apiClient = buildApiClient({
      getTopics: jest.fn().mockResolvedValue({
        topics: [{ ...mockTopic, replyCount: 1 }],
        pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
      }),
    });
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => {
      expect(screen.getByText('1 resposta')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Create topic modal
// ---------------------------------------------------------------------------

describe('Forum — create topic modal', () => {
  it('opens the modal when clicking "Criar post"', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Escreva o conteúdo do seu post aqui.')
      ).toBeInTheDocument();
    });
  });

  it('submit button is disabled when content is empty', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    // Both header and modal footer have "Criar post" — find the modal submit button
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: 'Criar post' });
      // Modal footer button should be disabled
      expect(buttons[buttons.length - 1]).toBeDisabled();
    });
  });

  it('calls createTopic and closes modal on submit', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.type(textarea, 'Novo tópico de teste');

    const buttons = screen.getAllByRole('button', { name: 'Criar post' });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(apiClient.createTopic).toHaveBeenCalledWith({
        content: 'Novo tópico de teste',
      });
    });

    // Modal should close and topics refreshed
    await waitFor(() => {
      expect(apiClient.getTopics).toHaveBeenCalledTimes(2);
    });
  });

  it('cancels and clears content when clicking Cancelar', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.type(textarea, 'Some content');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Escreva o conteúdo do seu post aqui.')
      ).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Detail view
// ---------------------------------------------------------------------------

describe('Forum — detail view', () => {
  it('navigates to detail view when clicking a topic', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => {
      expect(apiClient.getTopic).toHaveBeenCalledWith('topic-1');
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });
  });

  it('shows the original post content in detail view', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => {
      expect(screen.getAllByText(mockTopic.content).length).toBeGreaterThan(0);
    });
  });

  it('shows replies in detail view', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => {
      expect(screen.getByText(mockReply.content)).toBeInTheDocument();
      expect(screen.getByText(/Lucas Pereira/)).toBeInTheDocument();
    });
  });

  it('returns to list view when clicking Voltar', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => screen.getByText('Voltar'));
    fireEvent.click(screen.getByText('Voltar'));

    await waitFor(() => {
      expect(screen.getByText('Fórum')).toBeInTheDocument();
    });
  });

  it('refreshes topic list when returning from detail view', async () => {
    const apiClient = buildApiClient();
    render(<Forum {...defaultProps} apiClient={apiClient} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => screen.getByText('Voltar'));
    fireEvent.click(screen.getByText('Voltar'));

    await waitFor(() => {
      // Initial fetch + fetch on back
      expect(apiClient.getTopics).toHaveBeenCalledTimes(2);
    });
  });
});

// ---------------------------------------------------------------------------
// Reply modal
// ---------------------------------------------------------------------------

describe('Forum — reply modal', () => {
  async function openDetailView(apiClient: ForumApiClient) {
    render(<Forum {...defaultProps} apiClient={apiClient} />);
    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));
    await waitFor(() => screen.getByRole('button', { name: 'Responder' }));
  }

  it('opens reply modal when clicking Responder', async () => {
    const apiClient = buildApiClient();
    await openDetailView(apiClient);

    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    await waitFor(() => {
      // Modal title is rendered as a heading
      expect(
        screen.getByRole('heading', { name: 'Responder' })
      ).toBeInTheDocument();
      expect(
        screen.getAllByPlaceholderText('Escreva o conteúdo do seu post aqui.')
          .length
      ).toBeGreaterThan(0);
    });
  });

  it('calls createReply and refreshes topic on submit', async () => {
    const apiClient = buildApiClient();
    await openDetailView(apiClient);

    fireEvent.click(screen.getByRole('button', { name: 'Responder' }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.type(textarea, 'Minha resposta');

    const submitButtons = screen.getAllByRole('button', { name: 'Responder' });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(apiClient.createReply).toHaveBeenCalledWith('topic-1', {
        content: 'Minha resposta',
      });
      expect(apiClient.getTopic).toHaveBeenCalledTimes(2);
    });
  });
});

// ---------------------------------------------------------------------------
// Helpers shared by actions tests
// ---------------------------------------------------------------------------

/** Returns the three-dots trigger button (icon-only, no visible text). */
function getMenuTriggerButton() {
  const buttons = screen.getAllByRole('button');
  return buttons.find((btn) => !btn.textContent?.trim())!;
}

// ---------------------------------------------------------------------------
// PostActionsMenu — own topic (list view)
// ---------------------------------------------------------------------------

describe('Forum — own topic actions', () => {
  it('shows three-dots trigger for own topic', async () => {
    // mockTopic.userInstitutionId = 'user-1' = currentUserId
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));

    expect(getMenuTriggerButton()).toBeInTheDocument();
  });

  it('hides three-dots trigger for others topics', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-999" />);

    await waitFor(() => screen.getByText(mockTopic.content));

    const buttons = screen.getAllByRole('button');
    const iconOnlyButtons = buttons.filter((btn) => !btn.textContent?.trim());
    expect(iconOnlyButtons).toHaveLength(0);
  });

  it('opens edit modal with heading "Editar" on clicking Editar', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /editar/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Editar' })
      ).toBeInTheDocument();
    });
  });

  it('edit modal pre-fills the existing topic content', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /editar/i }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    expect(textarea).toHaveValue(mockTopic.content);
  });

  it('calls updateTopic on edit submit', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /editar/i }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Conteúdo editado');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(apiClient.updateTopic).toHaveBeenCalledWith(
        'topic-1',
        expect.objectContaining({ content: 'Conteúdo editado' })
      );
    });
  });

  it('opens delete confirmation modal on clicking Deletar', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /deletar/i }));

    await waitFor(() => {
      expect(screen.getByText('Deseja deletar post?')).toBeInTheDocument();
    });
  });

  it('calls deleteTopic when confirming delete', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /deletar/i }));

    await waitFor(() => screen.getByText('Deseja deletar post?'));
    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));

    await waitFor(() => {
      expect(apiClient.deleteTopic).toHaveBeenCalledWith('topic-1');
    });
  });

  it('does not call deleteTopic when canceling delete confirmation', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /deletar/i }));

    await waitFor(() => screen.getByText('Deseja deletar post?'));
    // Click the last "Cancelar" button (inside the confirmation modal)
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(apiClient.deleteTopic).not.toHaveBeenCalled();
      expect(
        screen.queryByText('Deseja deletar post?')
      ).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// PostActionsMenu — own reply (detail view)
// ---------------------------------------------------------------------------

describe('Forum — own reply actions', () => {
  const ownReplyProps = { currentUserId: 'user-2' }; // matches mockReply.userInstitutionId

  it('shows three-dots trigger for own reply', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} {...ownReplyProps} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));
    await waitFor(() => screen.getByText(mockReply.content));

    expect(getMenuTriggerButton()).toBeInTheDocument();
  });

  it('calls updateReply on edit submit', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} {...ownReplyProps} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));
    await waitFor(() => screen.getByText(mockReply.content));

    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /editar/i }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Resposta editada');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(apiClient.updateReply).toHaveBeenCalledWith(
        'reply-1',
        expect.objectContaining({ content: 'Resposta editada' })
      );
    });
  });

  it('calls deleteReply when confirming delete', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} {...ownReplyProps} />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));
    await waitFor(() => screen.getByText(mockReply.content));

    fireEvent.click(getMenuTriggerButton());
    await waitFor(() => screen.getByRole('menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /deletar/i }));

    await waitFor(() => screen.getByText('Deseja deletar post?'));
    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));

    await waitFor(() => {
      expect(apiClient.deleteReply).toHaveBeenCalledWith('reply-1');
    });
  });
});

// ---------------------------------------------------------------------------
// Teacher features
// ---------------------------------------------------------------------------

describe('Forum — teacher features', () => {
  const teacherProps = {
    currentUserId: 'user-1',
    userRole: PROFILE_ROLES.TEACHER,
  } as const;

  it('shows grade question radio buttons in create modal for teacher', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} {...teacherProps} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    // Radio uses a custom button + visibility:hidden input; query by label text
    await waitFor(() => {
      expect(
        screen.getByText('Este fórum vale nota no boletim?')
      ).toBeInTheDocument();
      expect(screen.getByText('Sim')).toBeInTheDocument();
      expect(screen.getByText('Não')).toBeInTheDocument();
    });
  });

  it('does not show grade question for student role', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} currentUserId="user-1" />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    await waitFor(() =>
      screen.getByPlaceholderText('Escreva o conteúdo do seu post aqui.')
    );
    expect(
      screen.queryByText('Este fórum vale nota no boletim?')
    ).not.toBeInTheDocument();
  });

  it('passes countsForGrade to createTopic when teacher selects Sim', async () => {
    const apiClient = buildApiClient();
    render(<Forum apiClient={apiClient} {...teacherProps} />);

    await waitFor(() => screen.getByRole('button', { name: 'Criar post' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));

    const textarea = await screen.findByPlaceholderText(
      'Escreva o conteúdo do seu post aqui.'
    );
    await userEvent.type(textarea, 'Tópico com nota');
    // Radio uses a custom button + visibility:hidden input; clicking the label triggers onChange
    fireEvent.click(screen.getByText('Sim'));

    const buttons = screen.getAllByRole('button', { name: 'Criar post' });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(apiClient.createTopic).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Tópico com nota',
          countsForGrade: true,
        })
      );
    });
  });

  it('shows Avaliar button on replies when topic countsForGrade and onEvaluateReply provided', async () => {
    const onEvaluateReply = jest.fn().mockResolvedValue(undefined);
    const apiClient = buildApiClient({
      getTopic: jest.fn().mockResolvedValue({
        topic: { ...mockTopicWithReplies, countsForGrade: true },
        replies: [mockReply],
      }),
    });
    render(
      <Forum
        apiClient={apiClient}
        {...teacherProps}
        onEvaluateReply={onEvaluateReply}
      />
    );

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /avaliar/i })
      ).toBeInTheDocument();
    });
  });

  it('calls onEvaluateReply and shows grade after submitting evaluation', async () => {
    const onEvaluateReply = jest.fn().mockResolvedValue(undefined);
    const apiClient = buildApiClient({
      getTopic: jest.fn().mockResolvedValue({
        topic: { ...mockTopicWithReplies, countsForGrade: true },
        replies: [mockReply],
      }),
    });
    render(
      <Forum
        apiClient={apiClient}
        {...teacherProps}
        onEvaluateReply={onEvaluateReply}
      />
    );

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => screen.getByRole('button', { name: /avaliar/i }));
    fireEvent.click(screen.getByRole('button', { name: /avaliar/i }));

    const gradeInput = await screen.findByPlaceholderText('Nota (0-10)');
    await userEvent.type(gradeInput, '8');
    // Two "Avaliar" buttons exist: the reply button and the modal submit — click the modal one (last)
    const avaliarButtons = screen.getAllByRole('button', { name: /avaliar/i });
    fireEvent.click(avaliarButtons[avaliarButtons.length - 1]);

    await waitFor(() => {
      expect(onEvaluateReply).toHaveBeenCalledWith('reply-1', 8);
      expect(screen.getByText('Nota 8')).toBeInTheDocument();
    });
  });

  it('student sees their own grade but not Avaliar button', async () => {
    const gradedReply: ForumReply = {
      ...mockReply,
      userInstitutionId: 'user-99',
      grade: 9,
    };
    const apiClient = buildApiClient({
      getTopic: jest.fn().mockResolvedValue({
        topic: { ...mockTopicWithReplies, countsForGrade: true },
        replies: [gradedReply],
      }),
    });
    // Render as the student who received the grade
    render(<Forum apiClient={apiClient} currentUserId="user-99" />);

    await waitFor(() => screen.getByText(mockTopic.content));
    fireEvent.click(screen.getByText(mockTopic.content));

    await waitFor(() => {
      expect(screen.getByText('Nota 9')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /avaliar/i })
      ).not.toBeInTheDocument();
    });
  });
});
