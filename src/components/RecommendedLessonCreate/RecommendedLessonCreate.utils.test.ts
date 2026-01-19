import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToLessonFiltersData,
  getSubjectName,
  getGoalDraftTypeLabel,
  generateTitle,
  getTypeFromUrl,
  getTypeFromUrlString,
  convertLessonToPreview,
} from './RecommendedLessonCreate.utils';
import type { KnowledgeArea } from './RecommendedLessonCreate.utils';
import { RecommendedClassDraftType } from './RecommendedLessonCreate.types';
import type { LessonFiltersData } from '../../types/lessonFilters';
import type { LessonBackendFiltersFormat } from './RecommendedLessonCreate.types';
import type { Lesson } from '../../types/lessons';

describe('RecommendedLessonCreate.utils', () => {
  describe('convertFiltersToBackendFormat', () => {
    it('should return empty arrays when filters is null', () => {
      const result = convertFiltersToBackendFormat(null);

      expect(result).toEqual({
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      });
    });

    it('should convert LessonFiltersData to backend format', () => {
      const filters: LessonFiltersData = {
        subjectIds: ['subject-1', 'subject-2'],
        topicIds: ['topic-1'],
        subtopicIds: ['subtopic-1', 'subtopic-2'],
        contentIds: ['content-1'],
      };

      const result = convertFiltersToBackendFormat(filters);

      expect(result).toEqual({
        subjects: ['subject-1', 'subject-2'],
        topics: ['topic-1'],
        subtopics: ['subtopic-1', 'subtopic-2'],
        contents: ['content-1'],
      });
    });

    it('should handle empty arrays in filters', () => {
      const filters: LessonFiltersData = {
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const result = convertFiltersToBackendFormat(filters);

      expect(result).toEqual({
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      });
    });
  });

  describe('convertBackendFiltersToLessonFiltersData', () => {
    it('should return null when backendFilters is null', () => {
      const result = convertBackendFiltersToLessonFiltersData(null);

      expect(result).toBeNull();
    });

    it('should convert backend format to LessonFiltersData', () => {
      const backendFilters: LessonBackendFiltersFormat = {
        subjects: ['subject-1', 'subject-2'],
        topics: ['topic-1'],
        subtopics: ['subtopic-1'],
        contents: ['content-1', 'content-2'],
      };

      const result = convertBackendFiltersToLessonFiltersData(backendFilters);

      expect(result).toEqual({
        subjectIds: ['subject-1', 'subject-2'],
        topicIds: ['topic-1'],
        subtopicIds: ['subtopic-1'],
        contentIds: ['content-1', 'content-2'],
      });
    });

    it('should handle undefined arrays in backend filters', () => {
      const backendFilters: LessonBackendFiltersFormat = {};

      const result = convertBackendFiltersToLessonFiltersData(backendFilters);

      expect(result).toEqual({
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      });
    });

    it('should handle partial backend filters', () => {
      const backendFilters: LessonBackendFiltersFormat = {
        subjects: ['subject-1'],
        topics: undefined,
      };

      const result = convertBackendFiltersToLessonFiltersData(backendFilters);

      expect(result).toEqual({
        subjectIds: ['subject-1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      });
    });
  });

  describe('getSubjectName', () => {
    const knowledgeAreas: KnowledgeArea[] = [
      { id: 'math-1', name: 'Matemática' },
      { id: 'port-1', name: 'Português' },
      { id: 'hist-1', name: 'História' },
    ];

    it('should return null when subjectId is null', () => {
      const result = getSubjectName(null, knowledgeAreas);

      expect(result).toBeNull();
    });

    it('should return null when knowledgeAreas is empty', () => {
      const result = getSubjectName('math-1', []);

      expect(result).toBeNull();
    });

    it('should return subject name when found', () => {
      const result = getSubjectName('math-1', knowledgeAreas);

      expect(result).toBe('Matemática');
    });

    it('should return null when subject is not found', () => {
      const result = getSubjectName('unknown-id', knowledgeAreas);

      expect(result).toBeNull();
    });

    it('should return correct name for different subjects', () => {
      expect(getSubjectName('port-1', knowledgeAreas)).toBe('Português');
      expect(getSubjectName('hist-1', knowledgeAreas)).toBe('História');
    });
  });

  describe('getGoalDraftTypeLabel', () => {
    it('should return "Rascunho" for RASCUNHO type', () => {
      const result = getGoalDraftTypeLabel(RecommendedClassDraftType.RASCUNHO);

      expect(result).toBe('Rascunho');
    });

    it('should return "Modelo" for MODELO type', () => {
      const result = getGoalDraftTypeLabel(RecommendedClassDraftType.MODELO);

      expect(result).toBe('Modelo');
    });
  });

  describe('generateTitle', () => {
    const knowledgeAreas: KnowledgeArea[] = [
      { id: 'math-1', name: 'Matemática' },
      { id: 'port-1', name: 'Português' },
    ];

    it('should generate title with subject name for RASCUNHO', () => {
      const result = generateTitle(
        RecommendedClassDraftType.RASCUNHO,
        'math-1',
        knowledgeAreas
      );

      expect(result).toBe('Rascunho - Matemática');
    });

    it('should generate title with subject name for MODELO', () => {
      const result = generateTitle(
        RecommendedClassDraftType.MODELO,
        'port-1',
        knowledgeAreas
      );

      expect(result).toBe('Modelo - Português');
    });

    it('should generate title without subject when subjectId is null', () => {
      const result = generateTitle(
        RecommendedClassDraftType.RASCUNHO,
        null,
        knowledgeAreas
      );

      expect(result).toBe('Rascunho');
    });

    it('should generate title without subject when subject not found', () => {
      const result = generateTitle(
        RecommendedClassDraftType.MODELO,
        'unknown-id',
        knowledgeAreas
      );

      expect(result).toBe('Modelo');
    });

    it('should generate title without subject when knowledgeAreas is empty', () => {
      const result = generateTitle(
        RecommendedClassDraftType.RASCUNHO,
        'math-1',
        []
      );

      expect(result).toBe('Rascunho');
    });
  });

  describe('getTypeFromUrl', () => {
    it('should return "rascunho" for RASCUNHO type', () => {
      const result = getTypeFromUrl(RecommendedClassDraftType.RASCUNHO);

      expect(result).toBe('rascunho');
    });

    it('should return "modelo" for MODELO type', () => {
      const result = getTypeFromUrl(RecommendedClassDraftType.MODELO);

      expect(result).toBe('modelo');
    });

    it('should return "rascunho" as default for unknown type', () => {
      const result = getTypeFromUrl('UNKNOWN' as RecommendedClassDraftType);

      expect(result).toBe('rascunho');
    });
  });

  describe('getTypeFromUrlString', () => {
    it('should return RASCUNHO for "rascunho" string', () => {
      const result = getTypeFromUrlString('rascunho');

      expect(result).toBe(RecommendedClassDraftType.RASCUNHO);
    });

    it('should return MODELO for "modelo" string', () => {
      const result = getTypeFromUrlString('modelo');

      expect(result).toBe(RecommendedClassDraftType.MODELO);
    });

    it('should return RASCUNHO for undefined', () => {
      const result = getTypeFromUrlString(undefined);

      expect(result).toBe(RecommendedClassDraftType.RASCUNHO);
    });

    it('should return RASCUNHO for unknown string', () => {
      const result = getTypeFromUrlString('unknown');

      expect(result).toBe(RecommendedClassDraftType.RASCUNHO);
    });

    it('should return RASCUNHO for empty string', () => {
      const result = getTypeFromUrlString('');

      expect(result).toBe(RecommendedClassDraftType.RASCUNHO);
    });
  });

  describe('convertLessonToPreview', () => {
    it('should convert lesson to preview format with undefined position', () => {
      const lesson: Lesson = {
        id: 'lesson-1',
        title: 'Test Lesson',
      };

      const result = convertLessonToPreview(lesson);

      expect(result).toEqual({
        id: 'lesson-1',
        title: 'Test Lesson',
        position: undefined,
      });
    });

    it('should preserve all lesson properties', () => {
      const lesson: Lesson = {
        id: 'lesson-2',
        title: 'Another Lesson',
      };

      const result = convertLessonToPreview(lesson);

      expect(result.id).toBe('lesson-2');
      expect(result.title).toBe('Another Lesson');
      expect(result.position).toBeUndefined();
    });
  });
});
