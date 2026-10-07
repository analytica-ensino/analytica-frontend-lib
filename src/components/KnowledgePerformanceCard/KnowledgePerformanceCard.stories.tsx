import type { Story } from '@ladle/react';
import { KnowledgePerformanceCard } from './KnowledgePerformanceCard';
import type {
  KnowledgeAreaPerformance,
  KnowledgePerformanceData,
  KnowledgeSubjectRow,
} from './types';

const LC = {
  id: 'ak-lc',
  name: 'Linguagens, Códigos e suas Tecnologias',
  color: '#E8618C',
  icon: 'ChatText',
};
const CH = {
  id: 'ak-ch',
  name: 'Ciências Humanas e suas Tecnologias',
  color: '#F6A700',
  icon: 'Globe',
};
const MT = {
  id: 'ak-mt',
  name: 'Matemática e suas Tecnologias',
  color: '#1570EF',
  icon: 'MathOperations',
};

/** The hit rate is over the answers given, blanks included. */
const subject = (
  name: string,
  area: typeof LC,
  correct: number,
  incorrect: number,
  blank: number
): KnowledgeSubjectRow => {
  const answered = correct + incorrect + blank;
  return {
    subjectId: `sub-${name}`,
    subjectName: name,
    areaKnowledgeId: area.id,
    areaKnowledgeName: area.name,
    color: area.color,
    icon: area.icon,
    answered,
    correct,
    incorrect,
    blank,
    correctPercentage: Math.round((correct / answered) * 1000) / 10,
  };
};

/**
 * An área is counted on its own, never summed from its componentes: a question
 * mapped to two of them counts once here.
 */
const area = (
  source: typeof LC,
  correct: number,
  incorrect: number,
  blank: number
): KnowledgeAreaPerformance => {
  const answered = correct + incorrect + blank;
  const rate = Math.round((correct / answered) * 1000) / 10;
  return {
    areaKnowledgeId: source.id,
    areaKnowledgeName: source.name,
    answered,
    correct,
    incorrect,
    blank,
    correctPercentage: rate,
    averageScore: Math.round(rate) / 10,
  };
};

const DATA: KnowledgePerformanceData = {
  totals: {
    answered: 8426,
    correct: 3918,
    incorrect: 3604,
    blank: 904,
    correctPercentage: 46.5,
    incorrectPercentage: 42.8,
    blankPercentage: 10.7,
    averageScore: 4.7,
  },
  // Worst hit rate first, as the endpoint answers.
  areas: [
    area(MT, 702, 1188, 310),
    area(CH, 1264, 1301, 295),
    area(LC, 1952, 1115, 299),
  ],
  subjects: [
    subject('Matemática', MT, 702, 1188, 310),
    subject('História', CH, 598, 701, 151),
    subject('Geografia', CH, 666, 600, 144),
    subject('Língua Portuguesa', LC, 901, 605, 178),
    subject('Literatura', LC, 614, 342, 76),
    subject('Inglês', LC, 437, 168, 45),
  ],
};

/**
 * "Todas as áreas do conhecimento": the bars, the nota média and the table
 * carry the whole cut. The componentes come worst hit rate first and collapse
 * to four behind "Mostrar todos".
 */
export const Default: Story = () => <KnowledgePerformanceCard data={DATA} />;

/** Four componentes or fewer: no toggle, since there is nothing to reveal. */
export const FewSubjects: Story = () => (
  <KnowledgePerformanceCard
    data={{ ...DATA, subjects: DATA.subjects.slice(0, 3) }}
  />
);

/**
 * One área de conhecimento has no graded nota média — nobody answered its
 * questions — and the card marks it rather than printing a zero.
 */
export const AreaWithoutScore: Story = () => (
  <KnowledgePerformanceCard
    data={{
      ...DATA,
      areas: DATA.areas.map((item, index) =>
        index === 0 ? { ...item, averageScore: null } : item
      ),
    }}
  />
);

/** An empty cut still draws its axes instead of collapsing. */
export const Empty: Story = () => (
  <KnowledgePerformanceCard
    data={{
      totals: {
        answered: 0,
        correct: 0,
        incorrect: 0,
        blank: 0,
        correctPercentage: null,
        incorrectPercentage: null,
        blankPercentage: null,
        averageScore: null,
      },
      areas: [],
      subjects: [],
    }}
  />
);

/** The heading can be overridden when the report calls the card something else. */
export const CustomTitle: Story = () => (
  <KnowledgePerformanceCard data={DATA} title="Dados gerais de questões" />
);
