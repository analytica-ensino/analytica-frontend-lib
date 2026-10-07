/**
 * Types of the "Desempenho por área de conhecimento" card.
 *
 * The shape two reports answer: `POST /enem-moment-report/questions` for the
 * Momento ENEM screen and
 * `POST /performance/simulated/activities/knowledge-performance` for the
 * Simulados and Atividades reports. Both are fetched by the consuming app,
 * which knows its own filter shape.
 */

/** The four answer counts of a block. */
export interface KnowledgeAnswerCounts {
  answered: number;
  correct: number;
  incorrect: number;
  blank: number;
}

/**
 * The totals of the whole cut.
 *
 * The percentages and the score are `null`, not zero, when nothing was
 * answered: zero would read as "answered and got none right".
 */
export interface KnowledgePerformanceTotals extends KnowledgeAnswerCounts {
  correctPercentage: number | null;
  incorrectPercentage: number | null;
  blankPercentage: number | null;
  /** 0–10, derived from the hit rate — no report grades an área on its own. */
  averageScore: number | null;
}

/**
 * One área de conhecimento.
 *
 * Counted on its own, never summed from its componentes: a question mapped to
 * two componentes of one área counts once here, so the área is not the sum of
 * its rows.
 */
export interface KnowledgeAreaPerformance extends KnowledgeAnswerCounts {
  areaKnowledgeId: string;
  areaKnowledgeName: string;
  correctPercentage: number | null;
  /** 0–10, derived from the hit rate. */
  averageScore: number | null;
}

/** One componente curricular, named with the área it belongs to. */
export interface KnowledgeSubjectPerformance extends KnowledgeAnswerCounts {
  subjectId: string;
  subjectName: string;
  areaKnowledgeId: string;
  areaKnowledgeName: string;
  /** 0–100, one decimal, over `answered`; `null` when there is none. */
  correctPercentage: number | null;
}

/**
 * A componente as the table draws it: the row plus the chip's colour and icon,
 * which the screen resolves from its own subject list.
 */
export type KnowledgeSubjectRow = KnowledgeSubjectPerformance & {
  color: string;
  icon: string;
};

/** Everything the card draws. */
export interface KnowledgePerformanceData {
  totals: KnowledgePerformanceTotals;
  areas: KnowledgeAreaPerformance[];
  subjects: KnowledgeSubjectRow[];
}
