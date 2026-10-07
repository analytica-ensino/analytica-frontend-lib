import Text from '../Text/Text';
import { KnowledgePerformanceCard } from '../KnowledgePerformanceCard';
import { SectionContent } from './SectionContent';
import type { EnemMomentQuestionsView, EnemMomentSectionState } from './types';

/**
 * "Desempenho por área de conhecimento": how the answers split — overall or
 * for one area — and how each componente curricular did.
 *
 * The card itself is `KnowledgePerformanceCard`, shared with the Simulados and
 * Atividades reports of the NRE and SEED profiles: the two reports answer the
 * same shape, and the block is the same block.
 */
export function KnowledgeAreaSection({
  questions,
}: Readonly<{
  questions: EnemMomentSectionState<EnemMomentQuestionsView>;
}>) {
  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" size="xl" weight="bold" className="text-text-950">
        Desempenho por área de conhecimento
      </Text>
      <SectionContent
        loading={questions.loading}
        error={questions.error}
        minHeight="min-h-[560px]"
      >
        {questions.data && (
          <KnowledgePerformanceCard
            data={questions.data}
            tableId="enemMomentSubjects"
          />
        )}
      </SectionContent>
    </section>
  );
}
