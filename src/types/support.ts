export enum SupportStatus {
  ABERTO = 'aberto',
  RESPONDIDO = 'respondido',
  ENCERRADO = 'encerrado',
}

export enum SupportCategory {
  ACESSO = 'acesso',
  TECNICO = 'tecnico',
  OUTROS = 'outros',
}

export type TicketStatus = SupportStatus;
export type ProblemType = SupportCategory | null;
export type TabType = 'criar-pedido' | 'historico';

export interface SupportResponse {
  id: string;
  receivedAt: string;
  message: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  category: ProblemType;
  description?: string;
  response?: SupportResponse;
}

export const getStatusBadgeAction = (
  status: SupportStatus
): 'success' | 'error' | 'warning' | 'info' => {
  switch (status) {
    case SupportStatus.ABERTO:
      return 'success';
    case SupportStatus.RESPONDIDO:
      return 'warning';
    case SupportStatus.ENCERRADO:
      return 'info';
    default:
      return 'info';
  }
};

export const getStatusText = (status: SupportStatus): string => {
  switch (status) {
    case SupportStatus.ABERTO:
      return 'Aberto';
    case SupportStatus.RESPONDIDO:
      return 'Respondido';
    case SupportStatus.ENCERRADO:
      return 'Encerrado';
    default:
      return status;
  }
};

export const getCategoryText = (category: SupportCategory | null): string => {
  if (!category) return '';
  switch (category) {
    case SupportCategory.ACESSO:
      return 'Acesso';
    case SupportCategory.TECNICO:
      return 'Técnico';
    case SupportCategory.OUTROS:
      return 'Outros';
    default:
      return category;
  }
};

// API Types
export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  type: string;
}

export interface CreateSupportTicketResponse {
  message: string;
  data: {
    id: string;
    ownerId: string;
    type: string;
    email: string;
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SupportTicketAPI {
  id: string;
  ownerId: string;
  type: string;
  email: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetSupportTicketsResponse {
  message: string;
  data: {
    support: SupportTicketAPI[];
    pagination: Pagination;
  };
}

export interface SupportAnswerAPI {
  id: string;
  userId: string;
  supportId: string;
  answer: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetSupportAnswersResponse {
  message: string;
  data: SupportAnswerAPI[];
}

export interface SubmitSupportAnswerRequest {
  userId: string;
  supportId: string;
  answer: string;
}

export interface SubmitSupportAnswerResponse {
  message: string;
  data: SupportAnswerAPI;
}

// Mapping functions for API status to internal status
export const mapApiStatusToInternal = (apiStatus: string): SupportStatus => {
  switch (apiStatus) {
    case 'ABERTO':
      return SupportStatus.ABERTO;
    case 'PENDENTE':
      return SupportStatus.RESPONDIDO;
    case 'FECHADO':
      return SupportStatus.ENCERRADO;
    default:
      return SupportStatus.ABERTO;
  }
};

export const mapInternalStatusToApi = (
  internalStatus: SupportStatus
): string => {
  switch (internalStatus) {
    case SupportStatus.ABERTO:
      return 'ABERTO';
    case SupportStatus.RESPONDIDO:
      return 'PENDENTE';
    case SupportStatus.ENCERRADO:
      return 'FECHADO';
    default:
      return 'ABERTO';
  }
};

// API Client interface for dependency injection
export interface SupportApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
  patch: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}
