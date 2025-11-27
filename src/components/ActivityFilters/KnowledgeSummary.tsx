import { Text, Chips } from '../..';
import type { KnowledgeStructureState } from '../../types/activityFilters';

export interface KnowledgeSummaryProps {
  knowledgeStructure: KnowledgeStructureState;
  selectedKnowledgeSummary: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
}

export const KnowledgeSummary = ({
  knowledgeStructure,
  selectedKnowledgeSummary,
}: KnowledgeSummaryProps) => {
  return (
    <div className="mt-4 p-3 bg-background-50 rounded-lg border border-border-200">
      <Text size="sm" weight="bold" className="mb-2 block">
        Resumo da seleção
      </Text>
      <div className="flex flex-col gap-2">
        {knowledgeStructure.topics.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Tema:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.topics.map((topic: string) => (
                <Chips key={topic} selected>
                  {topic}
                </Chips>
              ))}
            </div>
          </div>
        )}
        {knowledgeStructure.subtopics.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Subtema:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.subtopics.map((subtopic: string) => (
                <Chips key={subtopic} selected>
                  {subtopic}
                </Chips>
              ))}
            </div>
          </div>
        )}
        {knowledgeStructure.contents.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Assunto:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.contents.map((content) => (
                <Chips key={content} selected>
                  {content}
                </Chips>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
