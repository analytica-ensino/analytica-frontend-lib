import { convertActivityFiltersToQuestionsFilter } from './questionFiltersConverter';
import type { ActivityFiltersData } from '../types/activityFilters';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

describe('convertActivityFiltersToQuestionsFilter', () => {
  it('should convert filters with all fields filled', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
      bankIds: ['bank1', 'bank2'],
      yearIds: ['year1', 'year2'],
      knowledgeIds: ['knowledge1', 'knowledge2'],
      topicIds: ['topic1', 'topic2'],
      subtopicIds: ['subtopic1', 'subtopic2'],
      contentIds: ['content1', 'content2'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
      bankIds: ['bank1', 'bank2'],
      yearIds: ['year1', 'year2'],
      knowledgeIds: ['knowledge1', 'knowledge2'],
      topicIds: ['topic1', 'topic2'],
      subtopicIds: ['subtopic1', 'subtopic2'],
      contentIds: ['content1', 'content2'],
    });
  });

  it('should return undefined for empty arrays', () => {
    const filters: ActivityFiltersData = {
      types: [],
      bankIds: [],
      yearIds: [],
      knowledgeIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: undefined,
      bankIds: undefined,
      yearIds: undefined,
      knowledgeIds: undefined,
      topicIds: undefined,
      subtopicIds: undefined,
      contentIds: undefined,
    });
  });

  it('should return undefined for empty arrays and values for filled arrays', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: [],
      yearIds: ['year1'],
      knowledgeIds: [],
      topicIds: ['topic1'],
      subtopicIds: [],
      contentIds: ['content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: undefined,
      yearIds: ['year1'],
      knowledgeIds: undefined,
      topicIds: ['topic1'],
      subtopicIds: undefined,
      contentIds: ['content1'],
    });
  });

  it('should handle single element arrays', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: ['year1'],
      knowledgeIds: ['knowledge1'],
      topicIds: ['topic1'],
      subtopicIds: ['subtopic1'],
      contentIds: ['content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: ['year1'],
      knowledgeIds: ['knowledge1'],
      topicIds: ['topic1'],
      subtopicIds: ['subtopic1'],
      contentIds: ['content1'],
    });
  });

  it('should handle filters with only some fields filled', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: [],
      knowledgeIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: undefined,
      knowledgeIds: undefined,
      topicIds: undefined,
      subtopicIds: undefined,
      contentIds: undefined,
    });
  });

  it('should handle filters with only knowledgeIds filled', () => {
    const filters: ActivityFiltersData = {
      types: [],
      bankIds: [],
      yearIds: [],
      knowledgeIds: ['knowledge1', 'knowledge2'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: undefined,
      bankIds: undefined,
      yearIds: undefined,
      knowledgeIds: ['knowledge1', 'knowledge2'],
      topicIds: undefined,
      subtopicIds: undefined,
      contentIds: undefined,
    });
  });

  it('should handle filters with all question types', () => {
    const filters: ActivityFiltersData = {
      types: [
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.VERDADEIRO_FALSO,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
      ],
      bankIds: [],
      yearIds: [],
      knowledgeIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      types: [
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.VERDADEIRO_FALSO,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
      ],
      bankIds: undefined,
      yearIds: undefined,
      knowledgeIds: undefined,
      topicIds: undefined,
      subtopicIds: undefined,
      contentIds: undefined,
    });
  });

  it('should preserve array order', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.DISSERTATIVA, QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank2', 'bank1'],
      yearIds: ['year3', 'year1', 'year2'],
      knowledgeIds: ['knowledge3', 'knowledge1', 'knowledge2'],
      topicIds: ['topic2', 'topic1'],
      subtopicIds: ['subtopic2', 'subtopic1'],
      contentIds: ['content2', 'content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result.types).toEqual([
      QUESTION_TYPE.DISSERTATIVA,
      QUESTION_TYPE.ALTERNATIVA,
    ]);
    expect(result.bankIds).toEqual(['bank2', 'bank1']);
    expect(result.yearIds).toEqual(['year3', 'year1', 'year2']);
    expect(result.knowledgeIds).toEqual([
      'knowledge3',
      'knowledge1',
      'knowledge2',
    ]);
    expect(result.topicIds).toEqual(['topic2', 'topic1']);
    expect(result.subtopicIds).toEqual(['subtopic2', 'subtopic1']);
    expect(result.contentIds).toEqual(['content2', 'content1']);
  });
});
