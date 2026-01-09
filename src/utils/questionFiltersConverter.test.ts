import { convertActivityFiltersToQuestionsFilter } from './questionFiltersConverter';
import type { ActivityFiltersData } from '../types/activityFilters';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

describe('convertActivityFiltersToQuestionsFilter', () => {
  it('should convert filters with all fields filled', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
      bankIds: ['bank1', 'bank2'],
      yearIds: ['year1', 'year2'],
      subjectIds: ['knowledge1', 'knowledge2'],
      topicIds: ['topic1', 'topic2'],
      subtopicIds: ['subtopic1', 'subtopic2'],
      contentIds: ['content1', 'content2'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
      questionBankYearId: ['year1', 'year2'],
      subjectId: ['knowledge1', 'knowledge2'],
      topicId: ['topic1', 'topic2'],
      subtopicId: ['subtopic1', 'subtopic2'],
      contentId: ['content1', 'content2'],
    });
  });

  it('should return empty arrays for empty arrays', () => {
    const filters: ActivityFiltersData = {
      types: [],
      bankIds: [],
      yearIds: [],
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [],
      questionBankYearId: [],
      subjectId: [],
      topicId: [],
      subtopicId: [],
      contentId: [],
    });
  });

  it('should return empty arrays for empty arrays and values for filled arrays', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: [],
      yearIds: ['year1'],
      subjectIds: [],
      topicIds: ['topic1'],
      subtopicIds: [],
      contentIds: ['content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [QUESTION_TYPE.ALTERNATIVA],
      questionBankYearId: ['year1'],
      subjectId: [],
      topicId: ['topic1'],
      subtopicId: [],
      contentId: ['content1'],
    });
  });

  it('should handle single element arrays', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: ['year1'],
      subjectIds: ['knowledge1'],
      topicIds: ['topic1'],
      subtopicIds: ['subtopic1'],
      contentIds: ['content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [QUESTION_TYPE.ALTERNATIVA],
      questionBankYearId: ['year1'],
      subjectId: ['knowledge1'],
      topicId: ['topic1'],
      subtopicId: ['subtopic1'],
      contentId: ['content1'],
    });
  });

  it('should handle filters with only some fields filled', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: [],
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [QUESTION_TYPE.ALTERNATIVA],
      questionBankYearId: [],
      subjectId: [],
      topicId: [],
      subtopicId: [],
      contentId: [],
    });
  });

  it('should handle filters with only subjectIds filled', () => {
    const filters: ActivityFiltersData = {
      types: [],
      bankIds: [],
      yearIds: [],
      subjectIds: ['knowledge1', 'knowledge2'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [],
      questionBankYearId: [],
      subjectId: ['knowledge1', 'knowledge2'],
      topicId: [],
      subtopicId: [],
      contentId: [],
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
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result).toEqual({
      questionType: [
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.VERDADEIRO_FALSO,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
      ],
      questionBankYearId: [],
      subjectId: [],
      topicId: [],
      subtopicId: [],
      contentId: [],
    });
  });

  it('should preserve array order', () => {
    const filters: ActivityFiltersData = {
      types: [QUESTION_TYPE.DISSERTATIVA, QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank2', 'bank1'],
      yearIds: ['year3', 'year1', 'year2'],
      subjectIds: ['knowledge3', 'knowledge1', 'knowledge2'],
      topicIds: ['topic2', 'topic1'],
      subtopicIds: ['subtopic2', 'subtopic1'],
      contentIds: ['content2', 'content1'],
    };

    const result = convertActivityFiltersToQuestionsFilter(filters);

    expect(result.questionType).toEqual([
      QUESTION_TYPE.DISSERTATIVA,
      QUESTION_TYPE.ALTERNATIVA,
    ]);
    expect(result.questionBankYearId).toEqual(['year3', 'year1', 'year2']);
    expect(result.subjectId).toEqual([
      'knowledge3',
      'knowledge1',
      'knowledge2',
    ]);
    expect(result.topicId).toEqual(['topic2', 'topic1']);
    expect(result.subtopicId).toEqual(['subtopic2', 'subtopic1']);
    expect(result.contentId).toEqual(['content2', 'content1']);
  });
});
