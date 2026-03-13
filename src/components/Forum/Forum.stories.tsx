import type { Story } from '@ladle/react';
import { Forum } from './Forum';
import type { ForumApiClient, ForumTopic, ForumReply } from '../../types/forum';
import { PROFILE_ROLES } from '../../types/chat';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTopics: ForumTopic[] = [
  {
    id: 'topic-1',
    classId: 'class-1',
    userInstitutionId: 'user-2',
    content:
      'Alguém já começou a trabalhar no projeto em grupo da turma do Professor Wilson?',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Ana Silva',
    authorPhoto: null,
    authorRole: 'STUDENT',
    replyCount: 0,
  },
  {
    id: 'topic-2',
    classId: 'class-1',
    userInstitutionId: 'user-3',
    content:
      'Oi pessoal! Alguém já deu início ao trabalho em grupo da turma da Professora Márcia? Estou curioso para saber como estão as ideias e se já temos um plano definido.',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Lucas Pereira',
    authorPhoto: null,
    authorRole: 'STUDENT',
    replyCount: 1,
  },
  {
    id: 'topic-3',
    classId: 'class-1',
    userInstitutionId: 'user-4',
    content:
      'Oi gente! Estou pensando em como podemos dividir as tarefas do projeto do Professor Wilson. Alguém tem sugestões?',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Carla Mendez',
    authorPhoto: null,
    authorRole: 'STUDENT',
    replyCount: 1,
  },
  {
    id: 'topic-4',
    classId: 'class-1',
    userInstitutionId: 'user-5',
    content:
      'Olá, estudante! Este é um espaço onde você poderá debater, trocar conhecimento e conversar com seus colegas de turma. Basta criar um post para iniciar!',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'EJA Paraná',
    authorPhoto: null,
    authorRole: 'UNIT_MANAGER',
    replyCount: 0,
  },
];

const mockReplies: ForumReply[] = [
  {
    id: 'reply-1',
    topicId: 'topic-2',
    userInstitutionId: 'user-3',
    content:
      'Oi pessoal! Alguém já deu início ao trabalho em grupo da turma da Professora Márcia? Estou curioso para saber como estão as ideias e se já temos um plano definido.',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Lucas Pereira',
    authorPhoto: null,
    authorRole: 'STUDENT',
  },
  {
    id: 'reply-2',
    topicId: 'topic-2',
    userInstitutionId: 'user-4',
    content:
      'Oi gente! Estou pensando em como podemos dividir as tarefas do projeto do Professor Wilson. Alguém tem sugestões?',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Carla Mendez',
    authorPhoto: null,
    authorRole: 'STUDENT',
  },
  {
    id: 'reply-3',
    topicId: 'topic-2',
    userInstitutionId: 'user-6',
    content:
      'Oi turma! Já temos um grupo formado para o projeto da Professora Márcia. Vamos nos reunir amanhã para discutir!',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'João Souza',
    authorPhoto: null,
    authorRole: 'STUDENT',
  },
  {
    id: 'reply-4',
    topicId: 'topic-2',
    userInstitutionId: 'user-7',
    content:
      'Alguém mais está tendo dificuldade em entender o tema do projeto do Professor Wilson? Podemos ajudar juntos!',
    imageUrl: null,
    createdAt: '2025-05-05T09:35:00.000Z',
    updatedAt: '2025-05-05T09:35:00.000Z',
    authorName: 'Mariana Costa',
    authorPhoto: null,
    authorRole: 'STUDENT',
  },
  {
    id: 'reply-5',
    topicId: 'topic-2',
    userInstitutionId: 'user-2',
    content:
      'Já entrei em contato com o professor sobre o tema. Ele disse que podemos escolher qualquer área relacionada ao conteúdo das últimas três aulas.',
    imageUrl: null,
    createdAt: '2025-05-05T10:15:00.000Z',
    updatedAt: '2025-05-05T10:15:00.000Z',
    authorName: 'Ana Silva',
    authorPhoto: null,
    authorRole: 'STUDENT',
  },
];

const buildMockApiClient = (): ForumApiClient => ({
  getTopics: async () => ({
    topics: mockTopics,
    pagination: {
      total: mockTopics.length,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
  }),
  getTopic: async (topicId) => {
    const topic = mockTopics.find((t) => t.id === topicId) ?? mockTopics[0];
    return {
      topic: {
        ...topic,
        replyCount: mockReplies.filter((r) => r.topicId === topicId).length,
      },
      replies: mockReplies.filter((r) => r.topicId === topicId),
    };
  },
  createTopic: async () => undefined,
  updateTopic: async () => undefined,
  deleteTopic: async () => undefined,
  createReply: async () => undefined,
  updateReply: async () => undefined,
  deleteReply: async () => undefined,
});

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Forum apiClient={buildMockApiClient()} currentUserId="user-1" />
  </div>
);
Default.storyName = 'Lista de tópicos';

export const EmptyForum: Story = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Forum
      apiClient={{
        ...buildMockApiClient(),
        getTopics: async () => ({
          topics: [],
          pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
        }),
      }}
      currentUserId="user-1"
    />
  </div>
);
EmptyForum.storyName = 'Fórum vazio';

export const WithImageUpload: Story = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Forum
      apiClient={buildMockApiClient()}
      currentUserId="user-1"
      onUploadImage={async (file) => {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return URL.createObjectURL(file);
      }}
    />
  </div>
);
WithImageUpload.storyName = 'Com upload de imagem';

export const WithOwnPosts: Story = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Forum apiClient={buildMockApiClient()} currentUserId="user-2" />
  </div>
);
WithOwnPosts.storyName = 'Com posts próprios (editar/deletar)';

export const TeacherView: Story = () => (
  <div className="max-w-3xl mx-auto p-6">
    <Forum
      apiClient={{
        ...buildMockApiClient(),
        getTopics: async () => ({
          topics: mockTopics.map((t) =>
            t.id === 'topic-2' ? { ...t, countsForGrade: true } : t
          ),
          pagination: {
            total: mockTopics.length,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        }),
        getTopic: async (topicId) => {
          const topic =
            mockTopics.find((t) => t.id === topicId) ?? mockTopics[0];
          const withGrade =
            topicId === 'topic-2' ? { ...topic, countsForGrade: true } : topic;
          return {
            topic: {
              ...withGrade,
              replyCount: mockReplies.filter((r) => r.topicId === topicId)
                .length,
            },
            replies: mockReplies.filter((r) => r.topicId === topicId),
          };
        },
      }}
      currentUserId="user-2"
      userRole={PROFILE_ROLES.TEACHER}
      onEvaluateReply={async (replyId, grade) => {
        console.log('Avaliando reply', replyId, 'com nota:', grade);
      }}
    />
  </div>
);
TeacherView.storyName = 'Visão professor';
