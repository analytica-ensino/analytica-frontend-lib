import type { StudentDetailsParams } from './types';

/**
 * Body type for POST request
 */
export interface StudentDetailsBody {
  userInstitutionId: string;
  period?: string;
  subjectId?: string | null;
  page?: number;
  limit?: number;
}

/**
 * Convert params to POST body format
 */
export function paramsToBody(params: StudentDetailsParams): StudentDetailsBody {
  return {
    userInstitutionId: params.userInstitutionId,
    period: params.period,
    subjectId: params.subjectId ?? undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
}
