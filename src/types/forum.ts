export type ForumTopic = {
  id: string;
  classId: string;
  userInstitutionId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorPhoto: string | null;
  authorRole: string;
  replyCount: number;
  /** Whether participation in this topic counts toward the student's grade */
  countsForGrade?: boolean;
};

export type ForumReply = {
  id: string;
  topicId: string;
  userInstitutionId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorPhoto: string | null;
  authorRole: string;
  /** Grade assigned by teacher when topic counts for grade (0-10) */
  grade?: number;
};

export type ForumPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ForumTopicsResponse = {
  topics: ForumTopic[];
  pagination: ForumPagination;
};

export type ForumTopicDetailResponse = {
  topic: ForumTopic;
  replies: ForumReply[];
};

export type ForumApiClient = {
  getTopics: (params?: {
    limit?: number;
    offset?: number;
  }) => Promise<ForumTopicsResponse>;
  getTopic: (
    topicId: string,
    params?: { limit?: number; offset?: number }
  ) => Promise<ForumTopicDetailResponse>;
  createTopic: (body: {
    content: string;
    imageUrl?: string;
    /** Whether participation in this forum counts toward the student's grade */
    countsForGrade?: boolean;
  }) => Promise<void>;
  updateTopic: (
    topicId: string,
    body: { content?: string; imageUrl?: string | null }
  ) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  createReply: (
    topicId: string,
    body: { content: string; imageUrl?: string }
  ) => Promise<void>;
  updateReply: (
    replyId: string,
    body: { content?: string; imageUrl?: string | null }
  ) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
};
