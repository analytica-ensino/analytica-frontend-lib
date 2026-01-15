import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToLessonFiltersData,
  getSubjectName,
  getGoalDraftTypeLabel,
  generateTitle,
  formatTime,
  getTypeFromUrl,
  getTypeFromUrlString,
  convertLessonToPreview,
  fetchAllStudents,
  loadCategoriesData,
} from './RecommendedLessonCreate.utils';
import type { KnowledgeArea } from './RecommendedLessonCreate.utils';
import { GoalDraftType } from './RecommendedLessonCreate.types';
import type { LessonFiltersData } from '../../types/lessonFilters';
import type { LessonBackendFiltersFormat } from './RecommendedLessonCreate.types';
import type { Lesson } from '../../types/lessons';
import type { BaseApiClient } from '../../types/api';

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
      const result = getGoalDraftTypeLabel(GoalDraftType.RASCUNHO);

      expect(result).toBe('Rascunho');
    });

    it('should return "Modelo" for MODELO type', () => {
      const result = getGoalDraftTypeLabel(GoalDraftType.MODELO);

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
        GoalDraftType.RASCUNHO,
        'math-1',
        knowledgeAreas
      );

      expect(result).toBe('Rascunho - Matemática');
    });

    it('should generate title with subject name for MODELO', () => {
      const result = generateTitle(
        GoalDraftType.MODELO,
        'port-1',
        knowledgeAreas
      );

      expect(result).toBe('Modelo - Português');
    });

    it('should generate title without subject when subjectId is null', () => {
      const result = generateTitle(GoalDraftType.RASCUNHO, null, knowledgeAreas);

      expect(result).toBe('Rascunho');
    });

    it('should generate title without subject when subject not found', () => {
      const result = generateTitle(
        GoalDraftType.MODELO,
        'unknown-id',
        knowledgeAreas
      );

      expect(result).toBe('Modelo');
    });

    it('should generate title without subject when knowledgeAreas is empty', () => {
      const result = generateTitle(GoalDraftType.RASCUNHO, 'math-1', []);

      expect(result).toBe('Rascunho');
    });
  });

  describe('formatTime', () => {
    it('should format time with leading zeros for hours', () => {
      const date = new Date('2024-01-15T08:30:00');
      const result = formatTime(date);

      expect(result).toBe('08:30');
    });

    it('should format time with leading zeros for minutes', () => {
      const date = new Date('2024-01-15T14:05:00');
      const result = formatTime(date);

      expect(result).toBe('14:05');
    });

    it('should format midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00');
      const result = formatTime(date);

      expect(result).toBe('00:00');
    });

    it('should format end of day correctly', () => {
      const date = new Date('2024-01-15T23:59:00');
      const result = formatTime(date);

      expect(result).toBe('23:59');
    });

    it('should format time without leading zeros when not needed', () => {
      const date = new Date('2024-01-15T12:30:00');
      const result = formatTime(date);

      expect(result).toBe('12:30');
    });
  });

  describe('getTypeFromUrl', () => {
    it('should return "rascunho" for RASCUNHO type', () => {
      const result = getTypeFromUrl(GoalDraftType.RASCUNHO);

      expect(result).toBe('rascunho');
    });

    it('should return "modelo" for MODELO type', () => {
      const result = getTypeFromUrl(GoalDraftType.MODELO);

      expect(result).toBe('modelo');
    });

    it('should return "rascunho" as default for unknown type', () => {
      const result = getTypeFromUrl('UNKNOWN' as GoalDraftType);

      expect(result).toBe('rascunho');
    });
  });

  describe('getTypeFromUrlString', () => {
    it('should return RASCUNHO for "rascunho" string', () => {
      const result = getTypeFromUrlString('rascunho');

      expect(result).toBe(GoalDraftType.RASCUNHO);
    });

    it('should return MODELO for "modelo" string', () => {
      const result = getTypeFromUrlString('modelo');

      expect(result).toBe(GoalDraftType.MODELO);
    });

    it('should return RASCUNHO for undefined', () => {
      const result = getTypeFromUrlString(undefined);

      expect(result).toBe(GoalDraftType.RASCUNHO);
    });

    it('should return RASCUNHO for unknown string', () => {
      const result = getTypeFromUrlString('unknown');

      expect(result).toBe(GoalDraftType.RASCUNHO);
    });

    it('should return RASCUNHO for empty string', () => {
      const result = getTypeFromUrlString('');

      expect(result).toBe(GoalDraftType.RASCUNHO);
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

  describe('fetchAllStudents', () => {
    it('should fetch all students from single page', async () => {
      const mockStudents = [
        { id: 's1', name: 'Student 1', classId: 'c1', userInstitutionId: 'ui1' },
        { id: 's2', name: 'Student 2', classId: 'c1', userInstitutionId: 'ui2' },
      ];

      const mockApiClient: BaseApiClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            data: {
              students: mockStudents,
              pagination: {
                page: 1,
                limit: 100,
                total: 2,
                totalPages: 1,
              },
            },
          },
        }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual(mockStudents);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith('/students?page=1&limit=100');
    });

    it('should fetch all students from multiple pages', async () => {
      const page1Students = [
        { id: 's1', name: 'Student 1', classId: 'c1', userInstitutionId: 'ui1' },
      ];
      const page2Students = [
        { id: 's2', name: 'Student 2', classId: 'c1', userInstitutionId: 'ui2' },
      ];

      const mockApiClient: BaseApiClient = {
        get: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              data: {
                students: page1Students,
                pagination: { page: 1, limit: 100, total: 2, totalPages: 2 },
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              data: {
                students: page2Students,
                pagination: { page: 2, limit: 100, total: 2, totalPages: 2 },
              },
            },
          }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual([...page1Students, ...page2Students]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(mockApiClient.get).toHaveBeenNthCalledWith(1, '/students?page=1&limit=100');
      expect(mockApiClient.get).toHaveBeenNthCalledWith(2, '/students?page=2&limit=100');
    });

    it('should return empty array when no students', async () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            data: {
              students: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
            },
          },
        }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual([]);
    });
  });

  describe('loadCategoriesData', () => {
    const mockSchools = [{ id: 'school-1', companyName: 'School One' }];
    const mockSchoolYears = [
      { id: 'sy-1', name: 'Year 1', schoolId: 'school-1' },
    ];
    const mockClasses = [{ id: 'class-1', name: 'Class A', schoolYearId: 'sy-1' }];
    const mockStudents = [
      { id: 'student-1', name: 'Student One', classId: 'class-1', userInstitutionId: 'ui-1' },
    ];

    const createMockApiClient = (): BaseApiClient => ({
      get: jest
        .fn()
        .mockImplementation((url: string) => {
          if (url === '/school') {
            return Promise.resolve({
              data: { data: { schools: mockSchools } },
            });
          }
          if (url === '/schoolYear') {
            return Promise.resolve({
              data: { data: { schoolYears: mockSchoolYears } },
            });
          }
          if (url === '/classes') {
            return Promise.resolve({
              data: { data: { classes: mockClasses } },
            });
          }
          if (url.startsWith('/students')) {
            return Promise.resolve({
              data: {
                data: {
                  students: mockStudents,
                  pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
                },
              },
            });
          }
          return Promise.reject(new Error('Unknown URL'));
        }),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    it('should return existing categories if already loaded', async () => {
      const existingCategories = [
        { key: 'escola', label: 'Escola', itens: [], selectedIds: [] },
      ];
      const mockApiClient = createMockApiClient();

      const result = await loadCategoriesData(mockApiClient, existingCategories);

      expect(result).toBe(existingCategories);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch and transform categories when not loaded', async () => {
      const mockApiClient = createMockApiClient();

      const result = await loadCategoriesData(mockApiClient, []);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        key: 'escola',
        label: 'Escola',
        itens: [{ id: 'school-1', name: 'School One' }],
        selectedIds: [],
      });
      expect(result[1]).toEqual({
        key: 'serie',
        label: 'Série',
        dependsOn: ['escola'],
        filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
        itens: [{ id: 'sy-1', name: 'Year 1', schoolId: 'school-1' }],
        selectedIds: [],
      });
      expect(result[2]).toEqual({
        key: 'turma',
        label: 'Turma',
        dependsOn: ['serie'],
        filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
        itens: [{ id: 'class-1', name: 'Class A', schoolYearId: 'sy-1' }],
        selectedIds: [],
      });
      expect(result[3]).toEqual({
        key: 'students',
        label: 'Alunos',
        dependsOn: ['turma'],
        filteredBy: [{ key: 'turma', internalField: 'classId' }],
        itens: [
          {
            id: 'student-1',
            name: 'Student One',
            classId: 'class-1',
            studentId: 'student-1',
            userInstitutionId: 'ui-1',
          },
        ],
        selectedIds: [],
      });
    });

    it('should call all API endpoints in parallel', async () => {
      const mockApiClient = createMockApiClient();

      await loadCategoriesData(mockApiClient, []);

      expect(mockApiClient.get).toHaveBeenCalledWith('/school');
      expect(mockApiClient.get).toHaveBeenCalledWith('/schoolYear');
      expect(mockApiClient.get).toHaveBeenCalledWith('/classes');
      expect(mockApiClient.get).toHaveBeenCalledWith('/students?page=1&limit=100');
    });
  });
});
