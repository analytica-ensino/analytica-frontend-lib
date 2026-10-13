import {
  SUPPORT_PROBLEM_TYPE,
  type SupportConclusionReason,
} from '../../types/supportConclusion';

/**
 * Mocked conclusion reasons until the backend exposes a reasons catalog.
 * Each reason maps to one backend problem type.
 */
export const SUPPORT_CONCLUSION_REASONS: SupportConclusionReason[] = [
  {
    value: 'access',
    label: 'Acesso e login',
    problemType: SUPPORT_PROBLEM_TYPE.LOGIN,
    subReasons: [
      { value: 'forgot-password', label: 'Esqueci a senha' },
      { value: 'blocked-account', label: 'Conta bloqueada' },
      { value: 'email-not-received', label: 'Não recebo e-mail' },
    ],
  },
  {
    value: 'content',
    label: 'Conteúdo',
    problemType: SUPPORT_PROBLEM_TYPE.CONTENT,
    subReasons: [
      { value: 'video-not-loading', label: 'Vídeo não carrega' },
      { value: 'missing-material', label: 'Material ausente' },
      { value: 'activity-not-opening', label: 'Atividade não abre' },
    ],
  },
  {
    value: 'question-error',
    label: 'Erro em questão',
    problemType: SUPPORT_PROBLEM_TYPE.QUESTION_ERROR,
    subReasons: [
      { value: 'wrong-answer-key', label: 'Gabarito incorreto' },
      { value: 'statement-error', label: 'Enunciado com erro' },
      { value: 'wrong-grade', label: 'Nota incorreta' },
    ],
  },
  {
    value: 'platform-error',
    label: 'Erro da plataforma',
    problemType: SUPPORT_PROBLEM_TYPE.PLATFORM_ERROR,
    suggestsTechTicket: true,
    subReasons: [
      { value: 'bug', label: 'Bug' },
      { value: 'slowness', label: 'Lentidão' },
      { value: 'unavailable', label: 'Indisponibilidade' },
    ],
  },
  {
    value: 'other',
    label: 'Outros',
    problemType: SUPPORT_PROBLEM_TYPE.OTHER,
    requiresDescription: true,
    subReasons: [],
  },
];
