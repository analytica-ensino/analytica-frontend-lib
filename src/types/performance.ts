/**
 * Performance tag types based on percentage ranges
 */
export type PerformanceTag =
  | 'DESTAQUE_DA_TURMA'
  | 'ACIMA_DA_MEDIA'
  | 'ABAIXO_DA_MEDIA'
  | 'PONTO_DE_ATENCAO';

/**
 * Performance tag configuration
 */
export interface PerformanceTagConfig {
  label: string;
  variant: 'success' | 'info' | 'warning' | 'error';
  minPercentage: number;
  maxPercentage: number;
}

/**
 * Performance tag configurations by type
 * 90-100%: Destaque da turma (success)
 * 70-89%: Acima da média (info)
 * 40-69%: Abaixo da média (warning)
 * 0-39%: Ponto de atenção (error)
 */
export const PERFORMANCE_TAG_CONFIG: Record<
  PerformanceTag,
  PerformanceTagConfig
> = {
  DESTAQUE_DA_TURMA: {
    label: 'Destaque da turma',
    variant: 'success',
    minPercentage: 90,
    maxPercentage: 100,
  },
  ACIMA_DA_MEDIA: {
    label: 'Acima da média',
    variant: 'info',
    minPercentage: 70,
    maxPercentage: 89,
  },
  ABAIXO_DA_MEDIA: {
    label: 'Abaixo da média',
    variant: 'warning',
    minPercentage: 40,
    maxPercentage: 69,
  },
  PONTO_DE_ATENCAO: {
    label: 'Ponto de atenção',
    variant: 'error',
    minPercentage: 0,
    maxPercentage: 39,
  },
};

/**
 * Get performance tag based on percentage
 * @param percentage - Performance percentage (0-100)
 * @returns Performance tag type
 */
export function getPerformanceTag(percentage: number): PerformanceTag {
  if (percentage >= 90) return 'DESTAQUE_DA_TURMA';
  if (percentage >= 70) return 'ACIMA_DA_MEDIA';
  if (percentage >= 40) return 'ABAIXO_DA_MEDIA';
  return 'PONTO_DE_ATENCAO';
}

/**
 * Get performance tag configuration based on percentage
 * @param percentage - Performance percentage (0-100)
 * @returns Performance tag configuration
 */
export function getPerformanceTagConfig(
  percentage: number
): PerformanceTagConfig {
  const tag = getPerformanceTag(percentage);
  return PERFORMANCE_TAG_CONFIG[tag] ?? PERFORMANCE_TAG_CONFIG.PONTO_DE_ATENCAO;
}
