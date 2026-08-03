import {
  fetchStudentsByFilters,
  fetchClassesByFilters,
  loadCategoriesData,
  formatTime,
  type School,
  type SchoolYear,
  type Class,
  type Student,
} from './categoryDataUtils';
import type { BaseApiClient } from '../types/api';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

// Mock API client
const createMockApiClient = (
  overrides: Partial<BaseApiClient> = {}
): BaseApiClient => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  ...overrides,
});

describe('categoryDataUtils', () => {
  describe('fetchStudentsByFilters', () => {
    it('should return empty array when no filters are provided', async () => {
      const apiClient = createMockApiClient();

      const result = await fetchStudentsByFilters(apiClient, {});

      expect(result).toEqual([]);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should return empty array when all filter arrays are empty', async () => {
      const apiClient = createMockApiClient();

      const result = await fetchStudentsByFilters(apiClient, {
        schoolIds: [],
        schoolYearIds: [],
        classIds: [],
      });

      expect(result).toEqual([]);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should fetch students with schoolIds only', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student-1',
          name: 'John Doe',
          email: 'john@example.com',
          active: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userInstitutionId: 'ui-1',
          institutionId: 'inst-1',
          profileId: 'profile-1',
          school: { id: 'school-1', name: 'School 1' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Class A' },
        },
      ];

      const apiClient = createMockApiClient({
        post: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: { students: mockStudents },
          },
        }),
      });

      const result = await fetchStudentsByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      expect(result).toEqual(mockStudents);
      expect(apiClient.post).toHaveBeenCalledWith('/students/filters', {
        schoolIds: ['school-1'],
      });
    });

    it('should fetch students with schoolYearIds only', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          active: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userInstitutionId: 'ui-2',
          institutionId: 'inst-1',
          profileId: 'profile-2',
          school: { id: 'school-1', name: 'School 1' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Class A' },
        },
      ];

      const apiClient = createMockApiClient({
        post: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: { students: mockStudents },
          },
        }),
      });

      const result = await fetchStudentsByFilters(apiClient, {
        schoolYearIds: ['year-1'],
      });

      expect(result).toEqual(mockStudents);
      expect(apiClient.post).toHaveBeenCalledWith('/students/filters', {
        schoolYearIds: ['year-1'],
      });
    });

    it('should fetch students with classIds only', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student-1',
          name: 'Bob Smith',
          email: 'bob@example.com',
          active: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userInstitutionId: 'ui-3',
          institutionId: 'inst-1',
          profileId: 'profile-3',
          school: { id: 'school-1', name: 'School 1' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Class A' },
        },
      ];

      const apiClient = createMockApiClient({
        post: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: { students: mockStudents },
          },
        }),
      });

      const result = await fetchStudentsByFilters(apiClient, {
        classIds: ['class-1'],
      });

      expect(result).toEqual(mockStudents);
      expect(apiClient.post).toHaveBeenCalledWith('/students/filters', {
        classIds: ['class-1'],
      });
    });

    it('should fetch students with all filters combined', async () => {
      const mockStudents: Student[] = [
        {
          id: 'student-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          active: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          userInstitutionId: 'ui-4',
          institutionId: 'inst-1',
          profileId: 'profile-4',
          school: { id: 'school-1', name: 'School 1' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Class A' },
        },
      ];

      const apiClient = createMockApiClient({
        post: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: { students: mockStudents },
          },
        }),
      });

      const result = await fetchStudentsByFilters(apiClient, {
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
      });

      expect(result).toEqual(mockStudents);
      expect(apiClient.post).toHaveBeenCalledWith('/students/filters', {
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
      });
    });

    it('should return empty array when API returns undefined students', async () => {
      const apiClient = createMockApiClient({
        post: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: {},
          },
        }),
      });

      const result = await fetchStudentsByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      expect(result).toEqual([]);
    });
  });

  describe('loadCategoriesData', () => {
    it('should return existing categories if already loaded', async () => {
      const existingCategories: CategoryConfig[] = [
        { key: 'escola', label: 'Escola', itens: [], selectedIds: [] },
      ];
      const apiClient = createMockApiClient();

      const result = await loadCategoriesData(apiClient, existingCategories);

      expect(result).toEqual(existingCategories);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch and transform categories from API (single page)', async () => {
      const mockSchools: School[] = [
        { id: 'school-1', companyName: 'School One' },
        { id: 'school-2', companyName: 'School Two' },
      ];

      const mockSchoolYears: SchoolYear[] = [
        { id: 'year-1', name: '1st Grade', schoolId: 'school-1' },
        { id: 'year-2', name: '2nd Grade', schoolId: 'school-2' },
      ];

      const apiClient = createMockApiClient({
        get: jest.fn().mockImplementation((url: string) => {
          if (url === '/school') {
            return Promise.resolve({
              data: {
                message: 'Success',
                data: { schools: mockSchools, pagination: { totalPages: 1 } },
              },
            });
          }
          if (url === '/schoolYear') {
            return Promise.resolve({
              data: {
                message: 'Success',
                data: {
                  schoolYears: mockSchoolYears,
                  pagination: { totalPages: 1 },
                },
              },
            });
          }
          return Promise.reject(new Error('Unknown URL'));
        }),
      });

      const result = await loadCategoriesData(apiClient, []);

      // Only /school and /schoolYear are fetched now; /classes is dynamic
      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith('/school', {
        params: { page: 1, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/schoolYear', {
        params: { page: 1, limit: 100 },
      });
      expect(apiClient.get).not.toHaveBeenCalledWith(
        '/classes',
        expect.anything()
      );

      expect(result).toHaveLength(4);

      // Check escola category
      expect(result[0]).toEqual({
        key: 'escola',
        label: 'Escola',
        itens: [
          { id: 'school-1', name: 'School One' },
          { id: 'school-2', name: 'School Two' },
        ],
        selectedIds: [],
      });

      // Check serie category
      expect(result[1]).toEqual({
        key: 'serie',
        label: 'Série',
        dependsOn: ['escola'],
        filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
        itens: [
          { id: 'year-1', name: '1st Grade', schoolId: 'school-1' },
          { id: 'year-2', name: '2nd Grade', schoolId: 'school-2' },
        ],
        selectedIds: [],
      });

      // Check turma category — now dynamic (empty), no eager classes
      expect(result[2]).toEqual({
        key: 'turma',
        label: 'Turma',
        dependsOn: ['serie'],
        filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
        itens: [],
        selectedIds: [],
      });

      // Check students category
      expect(result[3]).toEqual({
        key: 'students',
        label: 'Alunos',
        dependsOn: ['turma'],
        filteredBy: [
          { key: 'escola', internalField: 'escolaId' },
          { key: 'serie', internalField: 'serieId' },
          { key: 'turma', internalField: 'turmaId' },
        ],
        itens: [],
        selectedIds: [],
      });
    });

    it('should paginate /school and /schoolYear across all pages', async () => {
      const apiClient = createMockApiClient({
        get: jest
          .fn()
          .mockImplementation(
            (url: string, config?: { params?: { page?: number } }) => {
              const page = config?.params?.page;
              if (url === '/school') {
                if (page === 1) {
                  return Promise.resolve({
                    data: {
                      message: 'Success',
                      data: {
                        schools: [
                          { id: 'school-1', companyName: 'School One' },
                        ],
                        pagination: { totalPages: 2 },
                      },
                    },
                  });
                }
                return Promise.resolve({
                  data: {
                    message: 'Success',
                    data: {
                      schools: [{ id: 'school-2', companyName: 'School Two' }],
                      pagination: { totalPages: 2 },
                    },
                  },
                });
              }
              if (url === '/schoolYear') {
                if (page === 1) {
                  return Promise.resolve({
                    data: {
                      message: 'Success',
                      data: {
                        schoolYears: [
                          { id: 'year-1', name: '1st', schoolId: 'school-1' },
                        ],
                        pagination: { totalPages: 2 },
                      },
                    },
                  });
                }
                return Promise.resolve({
                  data: {
                    message: 'Success',
                    data: {
                      schoolYears: [
                        { id: 'year-2', name: '2nd', schoolId: 'school-2' },
                      ],
                      pagination: { totalPages: 2 },
                    },
                  },
                });
              }
              return Promise.reject(new Error('Unknown URL'));
            }
          ),
      });

      const result = await loadCategoriesData(apiClient, []);

      // 2 pages each for /school and /schoolYear
      expect(apiClient.get).toHaveBeenCalledTimes(4);
      expect(apiClient.get).toHaveBeenCalledWith('/school', {
        params: { page: 1, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/school', {
        params: { page: 2, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/schoolYear', {
        params: { page: 1, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/schoolYear', {
        params: { page: 2, limit: 100 },
      });

      // escola aggregates items from BOTH pages
      expect(result[0].itens).toEqual([
        { id: 'school-1', name: 'School One' },
        { id: 'school-2', name: 'School Two' },
      ]);

      // serie aggregates items from BOTH pages
      expect(result[1].itens).toEqual([
        { id: 'year-1', name: '1st', schoolId: 'school-1' },
        { id: 'year-2', name: '2nd', schoolId: 'school-2' },
      ]);
    });

    it('should not fetch /classes eagerly (turma is dynamic)', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockImplementation((url: string) => {
          if (url === '/school') {
            return Promise.resolve({
              data: {
                message: 'Success',
                data: { schools: [], pagination: { totalPages: 1 } },
              },
            });
          }
          if (url === '/schoolYear') {
            return Promise.resolve({
              data: {
                message: 'Success',
                data: { schoolYears: [], pagination: { totalPages: 1 } },
              },
            });
          }
          return Promise.reject(new Error('Unknown URL'));
        }),
      });

      const result = await loadCategoriesData(apiClient, []);

      const calledUrls = (apiClient.get as jest.Mock).mock.calls.map(
        (call) => call[0]
      );
      expect(calledUrls).not.toContain('/classes');

      const turma = result.find((c) => c.key === 'turma');
      expect(turma?.itens).toEqual([]);
    });
  });

  describe('fetchClassesByFilters', () => {
    it('should return empty array when no filters are provided', async () => {
      const apiClient = createMockApiClient();

      const result = await fetchClassesByFilters(apiClient, {});

      expect(result).toEqual([]);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should return empty array when filter arrays are empty', async () => {
      const apiClient = createMockApiClient();

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: [],
        schoolYearIds: [],
      });

      expect(result).toEqual([]);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch classes with comma-joined schoolId and schoolYearId', async () => {
      const mockClasses: Class[] = [
        { id: 'class-1', name: 'Class A', schoolYearId: 'year-1' },
      ];

      const apiClient = createMockApiClient({
        get: jest.fn().mockResolvedValue({
          data: { message: 'Success', data: { classes: mockClasses } },
        }),
      });

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1', 'year-2'],
      });

      expect(result).toEqual(mockClasses);
      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: {
          schoolId: 'school-1,school-2',
          schoolYearId: 'year-1,year-2',
          page: 1,
          limit: 100,
        },
      });
    });

    it('should send only schoolYearId when only schoolYearIds provided', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockResolvedValue({
          data: { message: 'Success', data: { classes: [] } },
        }),
      });

      await fetchClassesByFilters(apiClient, {
        schoolYearIds: ['year-1'],
      });

      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: {
          schoolYearId: 'year-1',
          page: 1,
          limit: 100,
        },
      });
    });

    it('should send only schoolId when only schoolIds provided', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockResolvedValue({
          data: { message: 'Success', data: { classes: [] } },
        }),
      });

      await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: {
          schoolId: 'school-1',
          page: 1,
          limit: 100,
        },
      });
    });

    it('should aggregate classes across multiple pages', async () => {
      const apiClient = createMockApiClient({
        get: jest
          .fn()
          .mockImplementation(
            (_url: string, config?: { params?: { page?: number } }) => {
              const page = config?.params?.page;
              if (page === 1) {
                return Promise.resolve({
                  data: {
                    message: 'Success',
                    data: {
                      classes: [
                        { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
                      ],
                      pagination: { totalPages: 2 },
                    },
                  },
                });
              }
              return Promise.resolve({
                data: {
                  message: 'Success',
                  data: {
                    classes: [
                      { id: 'class-2', name: 'Class B', schoolYearId: 'y-2' },
                    ],
                    pagination: { totalPages: 2 },
                  },
                },
              });
            }
          ),
      });

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
      });

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: {
          schoolId: 'school-1,school-2',
          schoolYearId: 'year-1',
          page: 1,
          limit: 100,
        },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: {
          schoolId: 'school-1,school-2',
          schoolYearId: 'year-1',
          page: 2,
          limit: 100,
        },
      });
      expect(result).toEqual([
        { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
        { id: 'class-2', name: 'Class B', schoolYearId: 'y-2' },
      ]);
    });

    it('should aggregate three pages IN ORDER even when later pages resolve first', async () => {
      // Page 3 resolves before page 2 to prove ordering comes from the
      // Promise.all array index, not resolution order.
      let resolvePage2: (value: unknown) => void = () => {};
      const page2Promise = new Promise((resolve) => {
        resolvePage2 = resolve;
      });

      const apiClient = createMockApiClient({
        get: jest
          .fn()
          .mockImplementation(
            (_url: string, config?: { params?: { page?: number } }) => {
              const page = config?.params?.page;
              if (page === 1) {
                return Promise.resolve({
                  data: {
                    message: 'Success',
                    data: {
                      classes: [
                        { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
                      ],
                      pagination: { totalPages: 3 },
                    },
                  },
                });
              }
              if (page === 2) {
                // Deferred: only resolves after page 3 has already resolved.
                return page2Promise;
              }
              // page === 3 resolves immediately, then releases page 2.
              const page3 = Promise.resolve({
                data: {
                  message: 'Success',
                  data: {
                    classes: [
                      { id: 'class-3', name: 'Class C', schoolYearId: 'y-3' },
                    ],
                    pagination: { totalPages: 3 },
                  },
                },
              });
              page3.then(() =>
                resolvePage2({
                  data: {
                    message: 'Success',
                    data: {
                      classes: [
                        { id: 'class-2', name: 'Class B', schoolYearId: 'y-2' },
                      ],
                      pagination: { totalPages: 3 },
                    },
                  },
                })
              );
              return page3;
            }
          ),
      });

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      // Page 1 requested first.
      expect((apiClient.get as jest.Mock).mock.calls[0]).toEqual([
        '/classes',
        { params: { schoolId: 'school-1', page: 1, limit: 100 } },
      ]);
      // Pages 2 AND 3 both requested with limit:100 and the extraParams.
      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: { schoolId: 'school-1', page: 2, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledWith('/classes', {
        params: { schoolId: 'school-1', page: 3, limit: 100 },
      });
      expect(apiClient.get).toHaveBeenCalledTimes(3);
      // Final result concatenated IN PAGE ORDER (page1, page2, page3) despite
      // page 3 resolving before page 2.
      expect(result).toEqual([
        { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
        { id: 'class-2', name: 'Class B', schoolYearId: 'y-2' },
        { id: 'class-3', name: 'Class C', schoolYearId: 'y-3' },
      ]);
    });

    it('should make a single request when response has no pagination (fallback to 1 page)', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: {
              classes: [
                { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
              ],
            },
          },
        }),
      });

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { id: 'class-1', name: 'Class A', schoolYearId: 'y-1' },
      ]);
    });

    it('should return empty array when API returns undefined classes', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockResolvedValue({
          data: { message: 'Success', data: {} },
        }),
      });

      const result = await fetchClassesByFilters(apiClient, {
        schoolIds: ['school-1'],
      });

      expect(result).toEqual([]);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly for morning hours', () => {
      const date = new Date('2024-01-01T09:05:00');
      expect(formatTime(date)).toBe('09:05');
    });

    it('should format time correctly for afternoon hours', () => {
      const date = new Date('2024-01-01T14:30:00');
      expect(formatTime(date)).toBe('14:30');
    });

    it('should format time correctly for midnight', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(formatTime(date)).toBe('00:00');
    });

    it('should format time correctly for noon', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(formatTime(date)).toBe('12:00');
    });

    it('should format time correctly for end of day', () => {
      const date = new Date('2024-01-01T23:59:00');
      expect(formatTime(date)).toBe('23:59');
    });

    it('should pad single-digit hours and minutes with zeros', () => {
      const date = new Date('2024-01-01T01:02:00');
      expect(formatTime(date)).toBe('01:02');
    });
  });
});
