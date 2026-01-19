// Mock all barrel export dependencies to avoid module loading issues
jest.mock('../..', () => ({
  Button: () => null,
  Text: () => null,
  SkeletonText: () => null,
  Skeleton: () => null,
  SkeletonCard: () => null,
  useToastStore: () => ({ addToast: jest.fn() }),
  SendLessonModal: () => null,
  CategoryConfig: {},
}));

jest.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useNavigate: () => jest.fn(),
}));

jest.mock('phosphor-react', () => ({
  CaretLeft: () => null,
  PaperPlaneTilt: () => null,
  Funnel: () => null,
}));

jest.mock('../LessonFilters/LessonFilters', () => ({
  LessonFilters: () => null,
}));

jest.mock('../LessonBank/LessonBank', () => ({
  LessonBank: () => null,
}));

jest.mock('../LessonPreview/LessonPreview', () => ({
  LessonPreview: () => null,
}));

jest.mock('../../store/lessonFiltersStore', () => ({
  useLessonFiltersStore: () => ({
    applyFilters: jest.fn(),
    draftFilters: null,
    appliedFilters: null,
    setDraftFilters: jest.fn(),
    clearFilters: jest.fn(),
  }),
}));

import {
  RecommendedLessonCreate,
  RecommendedClassDraftType,
  convertFiltersToBackendFormat,
  convertBackendFiltersToLessonFiltersData,
  generateTitle,
  getGoalDraftTypeLabel,
  getSubjectName,
  getTypeFromUrl,
  getTypeFromUrlString,
  convertLessonToPreview,
} from './index';
import type {
  LessonBackendFiltersFormat,
  RecommendedLessonDraftResponse,
  RecommendedLessonData,
  RecommendedLessonPreFiltersInput,
  RecommendedLessonCreatePayload,
  RecommendedLessonCreateResponse,
  RecommendedLessonIdWithSequence,
  RecommendedLessonWithData,
  RecommendedLessonActivityDraft,
  School,
  SchoolYear,
  Class,
  Student,
  KnowledgeArea,
  PreviewLesson,
} from './index';

describe('RecommendedLessonCreate index exports', () => {
  describe('component exports', () => {
    it('should export RecommendedLessonCreate component', () => {
      expect(RecommendedLessonCreate).toBeDefined();
      expect(typeof RecommendedLessonCreate).toBe('function');
    });
  });

  describe('enum exports', () => {
    it('should export RecommendedClassDraftType enum', () => {
      expect(RecommendedClassDraftType).toBeDefined();
      expect(RecommendedClassDraftType.RASCUNHO).toBe('RASCUNHO');
      expect(RecommendedClassDraftType.MODELO).toBe('MODELO');
    });
  });

  describe('utility function exports', () => {
    it('should export convertFiltersToBackendFormat', () => {
      expect(convertFiltersToBackendFormat).toBeDefined();
      expect(typeof convertFiltersToBackendFormat).toBe('function');
    });

    it('should export convertBackendFiltersToLessonFiltersData', () => {
      expect(convertBackendFiltersToLessonFiltersData).toBeDefined();
      expect(typeof convertBackendFiltersToLessonFiltersData).toBe('function');
    });

    it('should export generateTitle', () => {
      expect(generateTitle).toBeDefined();
      expect(typeof generateTitle).toBe('function');
    });

    it('should export getGoalDraftTypeLabel', () => {
      expect(getGoalDraftTypeLabel).toBeDefined();
      expect(typeof getGoalDraftTypeLabel).toBe('function');
    });

    it('should export getSubjectName', () => {
      expect(getSubjectName).toBeDefined();
      expect(typeof getSubjectName).toBe('function');
    });

    it('should export getTypeFromUrl', () => {
      expect(getTypeFromUrl).toBeDefined();
      expect(typeof getTypeFromUrl).toBe('function');
    });

    it('should export getTypeFromUrlString', () => {
      expect(getTypeFromUrlString).toBeDefined();
      expect(typeof getTypeFromUrlString).toBe('function');
    });

    it('should export convertLessonToPreview', () => {
      expect(convertLessonToPreview).toBeDefined();
      expect(typeof convertLessonToPreview).toBe('function');
    });
  });

  describe('type exports validation', () => {
    it('should allow creating LessonBackendFiltersFormat type', () => {
      const filters: LessonBackendFiltersFormat = {
        subjects: ['subject-1'],
        topics: ['topic-1'],
        subtopics: ['subtopic-1'],
        contents: ['content-1'],
      };
      expect(filters.subjects).toHaveLength(1);
    });

    it('should allow creating RecommendedLessonDraftResponse type', () => {
      const response: RecommendedLessonDraftResponse = {
        message: 'Success',
        data: {
          id: 'draft-1',
          type: RecommendedClassDraftType.RASCUNHO,
          title: 'Test Draft',
          description: null,
          creatorUserInstitutionId: 'user-1',
          subjectId: 'subject-1',
          filters: {
            subjects: [],
            topics: [],
            subtopics: [],
            contents: [],
          },
          startDate: null,
          finalDate: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      expect(response.message).toBe('Success');
    });

    it('should allow creating RecommendedLessonData type', () => {
      const data: RecommendedLessonData = {
        id: 'lesson-1',
        type: RecommendedClassDraftType.RASCUNHO,
        title: 'Test Lesson',
        subjectId: 'subject-1',
        filters: {
          subjects: [],
          topics: [],
          subtopics: [],
          contents: [],
        },
        lessonIds: [],
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(data.id).toBe('lesson-1');
    });

    it('should allow creating RecommendedLessonPreFiltersInput type', () => {
      const preFilters: RecommendedLessonPreFiltersInput = {
        subjects: ['subject-1'],
        topics: ['topic-1'],
        subtopics: [],
        contents: [],
      };
      expect(preFilters.subjects).toHaveLength(1);
    });

    it('should allow creating RecommendedLessonCreatePayload type', () => {
      const payload: RecommendedLessonCreatePayload = {
        title: 'New Lesson',
        subjectId: 'subject-1',
        lessonIds: [{ lessonId: 'lesson-1', sequence: 1 }],
        startDate: '2024-01-01T00:00:00Z',
        finalDate: '2024-01-02T00:00:00Z',
      };
      expect(payload.title).toBe('New Lesson');
    });

    it('should allow creating RecommendedLessonCreateResponse type', () => {
      const response: RecommendedLessonCreateResponse = {
        message: 'Created',
        data: {
          id: 'new-lesson-1',
          title: 'New Lesson',
          description: null,
          subjectId: 'subject-1',
          startDate: '2024-01-01T00:00:00Z',
          finalDate: '2024-01-02T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };
      expect(response.data.id).toBe('new-lesson-1');
    });

    it('should allow creating RecommendedLessonIdWithSequence type', () => {
      const item: RecommendedLessonIdWithSequence = {
        lessonId: 'lesson-1',
        sequence: 1,
      };
      expect(item.lessonId).toBe('lesson-1');
    });

    it('should allow creating RecommendedLessonWithData type', () => {
      const lesson: RecommendedLessonWithData = {
        lessonId: 'lesson-1',
        sequence: 1,
        lesson: {
          id: 'lesson-1',
          title: 'Test Lesson',
        },
      };
      expect(lesson.lesson.title).toBe('Test Lesson');
    });

    it('should allow creating RecommendedLessonActivityDraft type', () => {
      const draft: RecommendedLessonActivityDraft = {
        activityDraftId: 'draft-1',
        sequence: 1,
      };
      expect(draft.activityDraftId).toBe('draft-1');
    });

    it('should allow creating School type', () => {
      const school: School = {
        id: 'school-1',
        companyName: 'Test School',
      };
      expect(school.companyName).toBe('Test School');
    });

    it('should allow creating SchoolYear type', () => {
      const schoolYear: SchoolYear = {
        id: 'year-1',
        name: '2024',
        schoolId: 'school-1',
      };
      expect(schoolYear.name).toBe('2024');
    });

    it('should allow creating Class type', () => {
      const classItem: Class = {
        id: 'class-1',
        name: 'Class A',
        schoolYearId: 'year-1',
      };
      expect(classItem.name).toBe('Class A');
    });

    it('should allow creating Student type', () => {
      const student: Student = {
        id: 'student-1',
        name: 'John Doe',
        classId: 'class-1',
        userInstitutionId: 'user-1',
      };
      expect(student.name).toBe('John Doe');
    });

    it('should allow creating KnowledgeArea type', () => {
      const area: KnowledgeArea = {
        id: 'area-1',
        name: 'Mathematics',
      };
      expect(area.name).toBe('Mathematics');
    });

    it('should allow creating PreviewLesson type', () => {
      const preview: PreviewLesson = {
        id: 'lesson-1',
        title: 'Test Lesson',
        position: 1,
      };
      expect(preview.position).toBe(1);
    });
  });
});
