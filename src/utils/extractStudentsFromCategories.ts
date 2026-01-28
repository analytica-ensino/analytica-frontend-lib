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
 * @param categories - Array of category configurations from CheckBoxGroup
 * @returns Array of extracted student data with userInstitutionId
 */
export function extractStudentsFromCategories(
  categories: CategoryConfig[]
): ExtractedStudent[] {
  // Find the students category
  const studentsCategory = categories.find((cat) => cat.key === 'students');

  if (!studentsCategory?.selectedIds || !studentsCategory.itens) {
    return [];
  }

  return studentsCategory.selectedIds
    .map((id) => {
      const student = studentsCategory.itens?.find((item) => item.id === id);
      if (student) {
        const rawUserInstId = student.userInstitutionId;
        const rawInstId = student.institutionId;
        const rawStudentId = (student as { studentId?: string | number })
          .studentId;

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

        // Extract studentId if available, otherwise use id as studentId
        let studentId: string;
        if (
          typeof rawStudentId === 'string' ||
          typeof rawStudentId === 'number'
        ) {
          studentId = String(rawStudentId);
        } else {
          // If studentId is not available, use the item id
          studentId = String(student.id);
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
