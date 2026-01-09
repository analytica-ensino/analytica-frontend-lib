import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

/**
 * Student data extracted from category selection
 */
export interface ExtractedStudent {
  studentId: string;
  userInstitutionId: string;
}

/**
 * Extract selected students from the students category
 * Looks for categories with key 'students', 'alunos', or 'student'
 * @param categories - Array of category configurations from CheckBoxGroup
 * @returns Array of extracted student data with studentId and userInstitutionId
 */
export function extractStudentsFromCategories(
  categories: CategoryConfig[]
): ExtractedStudent[] {
  // Find the students category (first matching by key 'students', 'alunos', or 'student')
  const studentsCategory = categories.find(
    (cat) =>
      cat.key === 'students' || cat.key === 'alunos' || cat.key === 'student'
  );

  if (!studentsCategory?.selectedIds || !studentsCategory.itens) {
    return [];
  }

  return studentsCategory.selectedIds
    .map((id) => {
      const student = studentsCategory.itens?.find((item) => item.id === id);
      if (student) {
        const rawStudentId = student.studentId;
        const rawUserInstId = student.userInstitutionId;
        const rawInstId = student.institutionId;

        // Extract studentId with type guard
        const studentId =
          typeof rawStudentId === 'string' || typeof rawStudentId === 'number'
            ? String(rawStudentId)
            : student.id;
        let userInstitutionId = '';
        if (
          typeof rawUserInstId === 'string' ||
          typeof rawUserInstId === 'number'
        ) {
          userInstitutionId = String(rawUserInstId);
        } else if (
          typeof rawInstId === 'string' ||
          typeof rawInstId === 'number'
        ) {
          userInstitutionId = String(rawInstId);
        }

        // Filter out entries without valid userInstitutionId
        if (!userInstitutionId) {
          return null;
        }

        return { studentId, userInstitutionId };
      }
      return null;
    })
    .filter((s): s is ExtractedStudent => s !== null);
}
