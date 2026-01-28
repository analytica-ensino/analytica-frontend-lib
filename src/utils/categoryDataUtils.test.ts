import {
  fetchStudentsByFilters,
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

    it('should fetch and transform categories from API', async () => {
      const mockSchools: School[] = [
        { id: 'school-1', companyName: 'School One' },
        { id: 'school-2', companyName: 'School Two' },
      ];

      const mockSchoolYears: SchoolYear[] = [
        { id: 'year-1', name: '1st Grade', schoolId: 'school-1' },
        { id: 'year-2', name: '2nd Grade', schoolId: 'school-2' },
      ];

      const mockClasses: Class[] = [
        { id: 'class-1', name: 'Class A', schoolYearId: 'year-1' },
        { id: 'class-2', name: 'Class B', schoolYearId: 'year-2' },
      ];

      const apiClient = createMockApiClient({
        get: jest
          .fn()
          .mockResolvedValueOnce({
            data: { message: 'Success', data: { schools: mockSchools } },
          })
          .mockResolvedValueOnce({
            data: {
              message: 'Success',
              data: { schoolYears: mockSchoolYears },
            },
          })
          .mockResolvedValueOnce({
            data: { message: 'Success', data: { classes: mockClasses } },
          }),
      });

      const result = await loadCategoriesData(apiClient, []);

      expect(apiClient.get).toHaveBeenCalledTimes(3);
      expect(apiClient.get).toHaveBeenCalledWith('/school');
      expect(apiClient.get).toHaveBeenCalledWith('/schoolYear');
      expect(apiClient.get).toHaveBeenCalledWith('/classes');

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

      // Check turma category
      expect(result[2]).toEqual({
        key: 'turma',
        label: 'Turma',
        dependsOn: ['serie'],
        filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
        itens: [
          { id: 'class-1', name: 'Class A', schoolYearId: 'year-1' },
          { id: 'class-2', name: 'Class B', schoolYearId: 'year-2' },
        ],
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

    it('should make parallel API calls', async () => {
      const apiClient = createMockApiClient({
        get: jest.fn().mockImplementation((url: string) => {
          if (url === '/school') {
            return Promise.resolve({
              data: { message: 'Success', data: { schools: [] } },
            });
          }
          if (url === '/schoolYear') {
            return Promise.resolve({
              data: { message: 'Success', data: { schoolYears: [] } },
            });
          }
          if (url === '/classes') {
            return Promise.resolve({
              data: { message: 'Success', data: { classes: [] } },
            });
          }
          return Promise.reject(new Error('Unknown URL'));
        }),
      });

      await loadCategoriesData(apiClient, []);

      // All calls should have been made
      expect(apiClient.get).toHaveBeenCalledWith('/school');
      expect(apiClient.get).toHaveBeenCalledWith('/schoolYear');
      expect(apiClient.get).toHaveBeenCalledWith('/classes');
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
