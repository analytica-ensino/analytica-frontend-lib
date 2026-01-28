import { extractStudentsFromCategories } from './extractStudentsFromCategories';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

describe('extractStudentsFromCategories', () => {
  it('should return empty array when categories is empty', () => {
    const result = extractStudentsFromCategories([]);
    expect(result).toEqual([]);
  });

  it('should return empty array when no students category exists', () => {
    const categories: CategoryConfig[] = [
      { key: 'schools', label: 'Escolas', selectedIds: ['1'], itens: [] },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([]);
  });

  it('should find category with key "students"', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'ui-1' }]);
  });

  it('should not find category with key "alunos" (only "students" is valid)', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'alunos',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            studentId: 'student-1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([]);
  });

  it('should not find category with key "student" (only "students" is valid)', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'student',
        label: 'Aluno',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            studentId: 'student-1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([]);
  });

  it('should return empty array when selectedIds is undefined', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            studentId: 'student-1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([]);
  });

  it('should return empty array when itens is undefined', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([]);
  });

  it('should handle multiple selected students', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1', 's2', 's3'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
          },
          {
            id: 's2',
            name: 'Student 2',
            userInstitutionId: 'ui-2',
          },
          {
            id: 's3',
            name: 'Student 3',
            userInstitutionId: 'ui-3',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { studentId: 's1', userInstitutionId: 'ui-1' },
      { studentId: 's2', userInstitutionId: 'ui-2' },
      { studentId: 's3', userInstitutionId: 'ui-3' },
    ]);
  });

  it('should filter out students without matching id in itens', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1', 'non-existent'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toHaveLength(1);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'ui-1' }]);
  });

  it('should use id as studentId when studentId is not available', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'ui-1' }]);
  });

  it('should use institutionId when userInstitutionId is not available', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            institutionId: 'inst-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'inst-1' }]);
  });

  it('should handle numeric studentId and userInstitutionId', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            studentId: 123,
            userInstitutionId: 456,
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: '123', userInstitutionId: '456' }]);
  });

  it('should handle numeric institutionId fallback', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            institutionId: 789,
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: '789' }]);
  });

  it('should filter out students without userInstitutionId or institutionId', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1', 's2'],
        itens: [
          { id: 's1', name: 'Student 1' },
          {
            id: 's2',
            name: 'Student 2',
            userInstitutionId: 'ui-2',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toHaveLength(1);
    expect(result).toEqual([{ studentId: 's2', userInstitutionId: 'ui-2' }]);
  });

  it('should prioritize userInstitutionId over institutionId', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
            institutionId: 'inst-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'ui-1' }]);
  });

  it('should only use "students" key and ignore other category keys', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Students',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            userInstitutionId: 'ui-1',
          },
        ],
      },
      {
        key: 'alunos',
        label: 'Alunos',
        selectedIds: ['a1'],
        itens: [
          {
            id: 'a1',
            name: 'Aluno 1',
            userInstitutionId: 'ui-a1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    // Only "students" category is used, "alunos" is ignored
    expect(result).toEqual([{ studentId: 's1', userInstitutionId: 'ui-1' }]);
  });

  it('should use explicit studentId when available', () => {
    const categories: CategoryConfig[] = [
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: ['s1'],
        itens: [
          {
            id: 's1',
            name: 'Student 1',
            studentId: 'explicit-student-id',
            userInstitutionId: 'ui-1',
          },
        ],
      },
    ];
    const result = extractStudentsFromCategories(categories);
    expect(result).toEqual([
      { studentId: 'explicit-student-id', userInstitutionId: 'ui-1' },
    ]);
  });
});
