import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToActivityFiltersData,
  getSubjectName,
  getActivityTypeLabel,
  generateTitle,
  formatTime,
  convertQuestionToPreview,
  fetchAllStudents,
  loadCategoriesData,
  getTypeFromUrl,
  getTypeFromUrlString,
  type KnowledgeArea,
} from './ActivityCreate.utils';
import { ActivityType } from './ActivityCreate.types';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { BaseApiClient } from '../../types/api';
import type { ActivityFiltersData } from '../..';
import type {
  BackendFiltersFormat,
  School,
  SchoolYear,
  Class,
  Student,
} from './ActivityCreate.types';

describe('ActivityCreate.utils', () => {
  describe('convertFiltersToBackendFormat', () => {
    it('should convert ActivityFiltersData to BackendFiltersFormat', () => {
      const filters: ActivityFiltersData = {
        types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
        bankIds: ['bank1', 'bank2'],
        subjectIds: ['knowledge1', 'knowledge2'],
        topicIds: ['topic1', 'topic2'],
        subtopicIds: ['subtopic1', 'subtopic2'],
        contentIds: ['content1', 'content2'],
        yearIds: ['year1', 'year2'],
      };

      const result = convertFiltersToBackendFormat(filters);

      expect(result).toEqual({
        questionTypes: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
        questionBanks: ['bank1', 'bank2'],
        subjects: ['knowledge1', 'knowledge2'],
        topics: ['topic1', 'topic2'],
        subtopics: ['subtopic1', 'subtopic2'],
        contents: ['content1', 'content2'],
      });
    });

    it('should return empty arrays when filters is null', () => {
      const result = convertFiltersToBackendFormat(null);

      expect(result).toEqual({
        questionTypes: [],
        questionBanks: [],
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      });
    });

    it('should handle empty filter arrays', () => {
      const filters: ActivityFiltersData = {
        types: [],
        bankIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      };

      const result = convertFiltersToBackendFormat(filters);

      expect(result).toEqual({
        questionTypes: [],
        questionBanks: [],
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      });
    });

    it('should handle partial filters', () => {
      const filters: ActivityFiltersData = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        subjectIds: ['knowledge1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      };

      const result = convertFiltersToBackendFormat(filters);

      expect(result).toEqual({
        questionTypes: [QUESTION_TYPE.ALTERNATIVA],
        questionBanks: [],
        subjects: ['knowledge1'],
        topics: [],
        subtopics: [],
        contents: [],
      });
    });
  });

  describe('convertBackendFiltersToActivityFiltersData', () => {
    it('should convert BackendFiltersFormat to ActivityFiltersData', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
        questionBanks: ['bank1', 'bank2'],
        subjects: ['knowledge1', 'knowledge2'],
        topics: ['topic1', 'topic2'],
        subtopics: ['subtopic1', 'subtopic2'],
        contents: ['content1', 'content2'],
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
        bankIds: ['bank1', 'bank2'],
        subjectIds: ['knowledge1', 'knowledge2'],
        topicIds: ['topic1', 'topic2'],
        subtopicIds: ['subtopic1', 'subtopic2'],
        contentIds: ['content1', 'content2'],
        yearIds: [],
      });
    });

    it('should return null when backendFilters is null', () => {
      const result = convertBackendFiltersToActivityFiltersData(null);

      expect(result).toBeNull();
    });

    it('should handle empty arrays', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: [],
        questionBanks: [],
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [],
        bankIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      });
    });

    it('should handle undefined fields by using empty arrays', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: undefined,
        questionBanks: undefined,
        subjects: undefined,
        topics: undefined,
        subtopics: undefined,
        contents: undefined,
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [],
        bankIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      });
    });

    it('should handle partial backend filters', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: [QUESTION_TYPE.ALTERNATIVA],
        questionBanks: [],
        subjects: ['knowledge1'],
        topics: [],
        subtopics: [],
        contents: [],
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        subjectIds: ['knowledge1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      });
    });

    it('should filter out invalid question types', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: [
          QUESTION_TYPE.ALTERNATIVA,
          'INVALID_TYPE' as QUESTION_TYPE,
          QUESTION_TYPE.DISSERTATIVA,
          'ANOTHER_INVALID' as QUESTION_TYPE,
        ],
        questionBanks: [],
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
        bankIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      });
    });

    it('should return empty types array when all question types are invalid', () => {
      const backendFilters: BackendFiltersFormat = {
        questionTypes: [
          'INVALID_TYPE_1' as QUESTION_TYPE,
          'INVALID_TYPE_2' as QUESTION_TYPE,
        ],
        questionBanks: [],
        subjects: [],
        topics: [],
        subtopics: [],
        contents: [],
      };

      const result = convertBackendFiltersToActivityFiltersData(backendFilters);

      expect(result).toEqual({
        types: [],
        bankIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
        yearIds: [],
      });
    });
  });

  describe('getSubjectName', () => {
    const mockKnowledgeAreas: KnowledgeArea[] = [
      { id: 'math', name: 'Matemática' },
      { id: 'portuguese', name: 'Português' },
      { id: 'science', name: 'Ciências' },
    ];

    it('should return subject name when found', () => {
      const result = getSubjectName('math', mockKnowledgeAreas);

      expect(result).toBe('Matemática');
    });

    it('should return null when subjectId is null', () => {
      const result = getSubjectName(null, mockKnowledgeAreas);

      expect(result).toBeNull();
    });

    it('should return null when knowledgeAreas is empty', () => {
      const result = getSubjectName('math', []);

      expect(result).toBeNull();
    });

    it('should return null when subject not found', () => {
      const result = getSubjectName('nonexistent', mockKnowledgeAreas);

      expect(result).toBeNull();
    });

    it('should return null when subjectId is empty string', () => {
      const result = getSubjectName('', mockKnowledgeAreas);

      expect(result).toBeNull();
    });

    it('should handle single knowledge area', () => {
      const singleArea: KnowledgeArea[] = [{ id: 'math', name: 'Matemática' }];
      const result = getSubjectName('math', singleArea);

      expect(result).toBe('Matemática');
    });
  });

  describe('getActivityTypeLabel', () => {
    it('should return "Rascunho" for RASCUNHO type', () => {
      const result = getActivityTypeLabel(ActivityType.RASCUNHO);

      expect(result).toBe('Rascunho');
    });

    it('should return "Modelo" for MODELO type', () => {
      const result = getActivityTypeLabel(ActivityType.MODELO);

      expect(result).toBe('Modelo');
    });

    it('should return "Atividade" for ATIVIDADE type', () => {
      const result = getActivityTypeLabel(ActivityType.ATIVIDADE);

      expect(result).toBe('Atividade');
    });

    it('should handle all enum values', () => {
      const allTypes = [
        ActivityType.RASCUNHO,
        ActivityType.MODELO,
        ActivityType.ATIVIDADE,
      ];
      const labels = allTypes.map(getActivityTypeLabel);

      expect(labels).toEqual(['Rascunho', 'Modelo', 'Atividade']);
    });
  });

  describe('generateTitle', () => {
    const mockKnowledgeAreas: KnowledgeArea[] = [
      { id: 'math', name: 'Matemática' },
      { id: 'portuguese', name: 'Português' },
    ];

    it('should generate title with type and subject', () => {
      const result = generateTitle(
        ActivityType.RASCUNHO,
        'math',
        mockKnowledgeAreas
      );

      expect(result).toBe('Rascunho - Matemática');
    });

    it('should generate title with MODELO type', () => {
      const result = generateTitle(
        ActivityType.MODELO,
        'math',
        mockKnowledgeAreas
      );

      expect(result).toBe('Modelo - Matemática');
    });

    it('should generate title with ATIVIDADE type', () => {
      const result = generateTitle(
        ActivityType.ATIVIDADE,
        'portuguese',
        mockKnowledgeAreas
      );

      expect(result).toBe('Atividade - Português');
    });

    it('should return only type label when subjectId is null', () => {
      const result = generateTitle(
        ActivityType.RASCUNHO,
        null,
        mockKnowledgeAreas
      );

      expect(result).toBe('Rascunho');
    });

    it('should return only type label when subject not found', () => {
      const result = generateTitle(
        ActivityType.RASCUNHO,
        'nonexistent',
        mockKnowledgeAreas
      );

      expect(result).toBe('Rascunho');
    });

    it('should return only type label when knowledgeAreas is empty', () => {
      const result = generateTitle(ActivityType.RASCUNHO, 'math', []);

      expect(result).toBe('Rascunho');
    });

    it('should handle empty subjectId string', () => {
      const result = generateTitle(
        ActivityType.RASCUNHO,
        '',
        mockKnowledgeAreas
      );

      expect(result).toBe('Rascunho');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly with two digits', () => {
      const date = new Date('2025-01-15T14:30:00');
      const result = formatTime(date);

      expect(result).toBe('14:30');
    });

    it('should pad hours and minutes with zeros', () => {
      const date = new Date('2025-01-15T09:05:00');
      const result = formatTime(date);

      expect(result).toBe('09:05');
    });

    it('should handle midnight', () => {
      const date = new Date('2025-01-15T00:00:00');
      const result = formatTime(date);

      expect(result).toBe('00:00');
    });

    it('should handle end of day', () => {
      const date = new Date('2025-01-15T23:59:00');
      const result = formatTime(date);

      expect(result).toBe('23:59');
    });

    it('should handle single digit hours and minutes', () => {
      const date = new Date('2025-01-15T05:07:00');
      const result = formatTime(date);

      expect(result).toBe('05:07');
    });

    it('should ignore seconds and milliseconds', () => {
      const date = new Date('2025-01-15T14:30:45');
      const result = formatTime(date);

      expect(result).toBe('14:30');
    });
  });

  describe('convertQuestionToPreview', () => {
    it('should convert question with all fields', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        knowledgeMatrix: [
          {
            subject: {
              name: 'Matemática',
              color: '#FF0000',
              icon: 'Calculator',
            },
          },
        ],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        question: {
          options: [
            { id: 'opt1', option: 'Option 1' },
            { id: 'opt2', option: 'Option 2' },
          ],
          correctOptionIds: [],
        },
        subjectName: 'Matemática',
        subjectColor: '#FF0000',
        iconName: 'Calculator',
      });
    });

    it('should convert question without knowledgeMatrix', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        options: [],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        question: {
          options: [],
          correctOptionIds: [],
        },
      });
    });

    it('should convert question without options', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        options: undefined,
        knowledgeMatrix: [
          {
            subject: {
              name: 'Português',
              color: '#0000FF',
              icon: 'Book',
            },
          },
        ],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        question: undefined,
        subjectName: 'Português',
        subjectColor: '#0000FF',
        iconName: 'Book',
      });
    });

    it('should handle empty knowledgeMatrix array', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [{ id: 'opt1', option: 'Option 1' }],
        knowledgeMatrix: [],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        question: {
          options: [{ id: 'opt1', option: 'Option 1' }],
          correctOptionIds: [],
        },
        subjectName: undefined,
        subjectColor: undefined,
        iconName: undefined,
      });
    });

    it('should handle knowledgeMatrix with missing subject fields', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [],
        knowledgeMatrix: [
          {
            subject: {
              name: undefined,
              color: undefined,
              icon: undefined,
            },
          },
        ],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        question: {
          options: [],
          correctOptionIds: [],
        },
        subjectName: undefined,
        subjectColor: undefined,
        iconName: undefined,
      });
    });

    it('should handle knowledgeMatrix with null subject', () => {
      const question = {
        id: 'q1',
        statement: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [],
        knowledgeMatrix: [{ subject: null }],
      };

      const result = convertQuestionToPreview(question as never);

      expect(result).toEqual({
        id: 'q1',
        enunciado: 'Test question statement',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        question: {
          options: [],
          correctOptionIds: [],
        },
        subjectName: undefined,
        subjectColor: undefined,
        iconName: undefined,
      });
    });
  });

  describe('fetchAllStudents', () => {
    let mockApiClient: BaseApiClient;

    beforeEach(() => {
      mockApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };
    });

    it('should fetch all students from single page', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student1',
          name: 'Student 1',
          classId: 'class1',
          userInstitutionId: 'ui1',
        },
        {
          id: 'student2',
          name: 'Student 2',
          classId: 'class1',
          userInstitutionId: 'ui2',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
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
      });

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual(mockStudents);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/students?page=1&limit=100'
      );
    });

    it('should fetch all students from multiple pages', async () => {
      const page1Students: Student[] = [
        {
          id: 'student1',
          name: 'Student 1',
          classId: 'class1',
          userInstitutionId: 'ui1',
        },
      ];
      const page2Students: Student[] = [
        {
          id: 'student2',
          name: 'Student 2',
          classId: 'class2',
          userInstitutionId: 'ui2',
        },
      ];

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            data: {
              students: page1Students,
              pagination: {
                page: 1,
                limit: 100,
                total: 2,
                totalPages: 2,
              },
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              students: page2Students,
              pagination: {
                page: 2,
                limit: 100,
                total: 2,
                totalPages: 2,
              },
            },
          },
        });

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual([...page1Students, ...page2Students]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        1,
        '/students?page=1&limit=100'
      );
      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        2,
        '/students?page=2&limit=100'
      );
    });

    it('should handle empty students array', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            students: [],
            pagination: {
              page: 1,
              limit: 100,
              total: 0,
              totalPages: 1,
            },
          },
        },
      });

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toEqual([]);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle large number of pages', async () => {
      const studentsPerPage: Student[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `student${i + 1}`,
          name: `Student ${i + 1}`,
          classId: 'class1',
          userInstitutionId: `ui${i + 1}`,
        })
      );

      (mockApiClient.get as jest.Mock).mockImplementation((url: string) => {
        const pageMatch = url.match(/page=(\d+)/);
        const page = pageMatch ? parseInt(pageMatch[1], 10) : 1;
        return Promise.resolve({
          data: {
            data: {
              students: studentsPerPage,
              pagination: {
                page,
                limit: 100,
                total: 300,
                totalPages: 3,
              },
            },
          },
        });
      });

      const result = await fetchAllStudents(mockApiClient);

      expect(result).toHaveLength(300);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('loadCategoriesData', () => {
    let mockApiClient: BaseApiClient;

    beforeEach(() => {
      mockApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };
    });

    it('should return existing categories if already loaded', async () => {
      const existingCategories = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [],
          selectedIds: [],
        },
      ];

      const result = await loadCategoriesData(
        mockApiClient,
        existingCategories
      );

      expect(result).toEqual(existingCategories);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should load and transform categories data', async () => {
      const mockSchools: School[] = [
        {
          id: 'school1',
          companyName: 'Escola 1',
        },
      ];
      const mockSchoolYears: SchoolYear[] = [
        {
          id: 'year1',
          name: '1º Ano',
          schoolId: 'school1',
        },
      ];
      const mockClasses: Class[] = [
        {
          id: 'class1',
          name: 'Turma A',
          schoolYearId: 'year1',
        },
      ];
      const mockStudents: Student[] = [
        {
          id: 'student1',
          name: 'Student 1',
          classId: 'class1',
          userInstitutionId: 'ui1',
        },
      ];

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            data: {
              schools: mockSchools,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              schoolYears: mockSchoolYears,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              classes: mockClasses,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              students: mockStudents,
              pagination: {
                page: 1,
                limit: 100,
                total: 1,
                totalPages: 1,
              },
            },
          },
        });

      const result = await loadCategoriesData(mockApiClient, []);

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({
        key: 'escola',
        label: 'Escola',
        itens: [{ id: 'school1', name: 'Escola 1' }],
        selectedIds: [],
      });
      expect(result[1]).toMatchObject({
        key: 'serie',
        label: 'Série',
        dependsOn: ['escola'],
        itens: [
          {
            id: 'year1',
            name: '1º Ano',
            schoolId: 'school1',
          },
        ],
        selectedIds: [],
      });
      expect(result[2]).toMatchObject({
        key: 'turma',
        label: 'Turma',
        dependsOn: ['serie'],
        itens: [
          {
            id: 'class1',
            name: 'Turma A',
            schoolYearId: 'year1',
          },
        ],
        selectedIds: [],
      });
      expect(result[3]).toMatchObject({
        key: 'alunos',
        label: 'Alunos',
        dependsOn: ['turma'],
        itens: [
          {
            id: 'student1',
            name: 'Student 1',
            classId: 'class1',
            studentId: 'student1',
            userInstitutionId: 'ui1',
          },
        ],
        selectedIds: [],
      });
    });

    it('should handle empty data arrays', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            data: {
              schools: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              schoolYears: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              classes: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              students: [],
              pagination: {
                page: 1,
                limit: 100,
                total: 0,
                totalPages: 1,
              },
            },
          },
        });

      const result = await loadCategoriesData(mockApiClient, []);

      expect(result).toHaveLength(4);
      expect(result[0].itens).toEqual([]);
      expect(result[1].itens).toEqual([]);
      expect(result[2].itens).toEqual([]);
      expect(result[3].itens).toEqual([]);
    });

    it('should call fetchAllStudents for pagination', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student1',
          name: 'Student 1',
          classId: 'class1',
          userInstitutionId: 'ui1',
        },
      ];

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            data: {
              schools: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              schoolYears: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              classes: [],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              students: mockStudents,
              pagination: {
                page: 1,
                limit: 100,
                total: 1,
                totalPages: 1,
              },
            },
          },
        });

      await loadCategoriesData(mockApiClient, []);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/students?page=1&limit=100'
      );
    });
  });

  describe('getTypeFromUrl', () => {
    it('should return "rascunho" for RASCUNHO type', () => {
      const result = getTypeFromUrl(ActivityType.RASCUNHO);
      expect(result).toBe('rascunho');
    });

    it('should return "modelo" for MODELO type', () => {
      const result = getTypeFromUrl(ActivityType.MODELO);
      expect(result).toBe('modelo');
    });

    it('should return "rascunho" as default for unknown type', () => {
      const result = getTypeFromUrl(ActivityType.ATIVIDADE);
      expect(result).toBe('rascunho');
    });

    it('should handle all ActivityType enum values', () => {
      expect(getTypeFromUrl(ActivityType.RASCUNHO)).toBe('rascunho');
      expect(getTypeFromUrl(ActivityType.MODELO)).toBe('modelo');
      expect(getTypeFromUrl(ActivityType.ATIVIDADE)).toBe('rascunho');
    });
  });

  describe('getTypeFromUrlString', () => {
    it('should return RASCUNHO for "rascunho" string', () => {
      const result = getTypeFromUrlString('rascunho');
      expect(result).toBe(ActivityType.RASCUNHO);
    });

    it('should return MODELO for "modelo" string', () => {
      const result = getTypeFromUrlString('modelo');
      expect(result).toBe(ActivityType.MODELO);
    });

    it('should return RASCUNHO as default for undefined', () => {
      const result = getTypeFromUrlString(undefined);
      expect(result).toBe(ActivityType.RASCUNHO);
    });

    it('should return RASCUNHO as default for unknown string', () => {
      const result = getTypeFromUrlString('unknown');
      expect(result).toBe(ActivityType.RASCUNHO);
    });

    it('should return RASCUNHO for empty string', () => {
      const result = getTypeFromUrlString('');
      expect(result).toBe(ActivityType.RASCUNHO);
    });

    it('should handle all valid URL type strings', () => {
      expect(getTypeFromUrlString('rascunho')).toBe(ActivityType.RASCUNHO);
      expect(getTypeFromUrlString('modelo')).toBe(ActivityType.MODELO);
    });
  });
});
