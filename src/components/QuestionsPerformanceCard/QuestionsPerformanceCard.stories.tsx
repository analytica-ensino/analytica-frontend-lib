import type { Story } from '@ladle/react';
import { QuestionsPerformanceCard } from './QuestionsPerformanceCard';
import type { ActivitiesQuestionsData, SubtopicPerformanceItem } from './types';

const DATA: ActivitiesQuestionsData = {
  totalAnswered: 285,
  correctAnswers: 174,
  incorrectAnswers: 96,
  blankAnswers: 15,
};

/**
 * Rows as the endpoint answers them: the blanks are counted, and the hit rate
 * is over the total with the blanks in it.
 */
const subtopic = (
  id: string,
  name: string,
  topic: { id: string; name: string },
  correct: number,
  incorrect: number,
  blank: number
): SubtopicPerformanceItem => {
  const total = correct + incorrect + blank;
  return {
    subtopicId: id,
    subtopicName: name,
    topic,
    total,
    correct,
    incorrect,
    blank,
    correctPercentage: Math.round((correct / total) * 1000) / 10,
  };
};

const MODERNA = { id: 't-1', name: 'Arte Moderna' };
const ANTIGA = { id: 't-2', name: 'Arte Antiga' };
const CONTEMPORANEA = { id: 't-3', name: 'Arte contemporânea' };

const SUBTOPICS: SubtopicPerformanceItem[] = [
  subtopic('st-1', 'Impressionismo', MODERNA, 12, 61, 17),
  subtopic('st-2', 'Grécia Antiga', ANTIGA, 598, 1901, 638),
  subtopic('st-3', 'Pop Art', CONTEMPORANEA, 206, 218, 78),
  subtopic('st-4', 'Vanguardas Europeias', MODERNA, 875, 1491, 799),
  subtopic('st-5', 'Arte conceitual', CONTEMPORANEA, 2017, 2757, 1860),
  subtopic('st-6', 'Modernismo brasileiro', MODERNA, 415, 713, 440),
  subtopic('st-7', 'Roma Antiga', ANTIGA, 149, 815, 178),
];

/**
 * "Todos" selected: the card carries the report's own totals and nothing else.
 * The heading says "gerais" precisely because no subject narrows it.
 */
export const Default: Story = () => <QuestionsPerformanceCard data={DATA} />;

/**
 * One componente curricular selected: the card grows a tema filter and the
 * subtema table, and the heading drops the "gerais". Rows come worst hit rate
 * first and collapse to four behind "Mostrar todos".
 */
export const WithSubtopics: Story = () => (
  <QuestionsPerformanceCard data={DATA} subtopics={SUBTOPICS} />
);

/** Four subtemas or fewer: no toggle, since there is nothing to reveal. */
export const FewSubtopics: Story = () => (
  <QuestionsPerformanceCard data={DATA} subtopics={SUBTOPICS.slice(0, 3)} />
);

/** The subject has no answered question yet. */
export const NoSubtopics: Story = () => (
  <QuestionsPerformanceCard data={DATA} subtopics={[]} />
);

/** The table is in flight; the bars above it are already on screen. */
export const LoadingSubtopics: Story = () => (
  <QuestionsPerformanceCard data={DATA} subtopics={[]} subtopicsLoading />
);

/** The table failed on its own, without taking the card down with it. */
export const SubtopicsError: Story = () => (
  <QuestionsPerformanceCard
    data={DATA}
    subtopics={[]}
    subtopicsError="Erro ao carregar o desempenho por subtema."
  />
);

/** An empty cut still draws its axes instead of collapsing. */
export const Empty: Story = () => (
  <QuestionsPerformanceCard
    data={{
      totalAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      blankAnswers: 0,
    }}
  />
);

/** The heading can be overridden when the report calls the card something else. */
export const CustomTitle: Story = () => (
  <QuestionsPerformanceCard
    data={DATA}
    subtopics={SUBTOPICS}
    title="Questões do simulado"
  />
);
