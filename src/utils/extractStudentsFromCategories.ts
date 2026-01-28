import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

/**
 * Student data extracted from category selection
 */
export interface ExtractedStudent {
  userInstitutionId: string;
  userId?: string;
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
        const rawUserId = (student as { userId?: string | number }).userId;

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

        // Extract userId if available, otherwise use userInstitutionId as userId
        let userId: string | undefined;
        if (
          typeof rawUserId === 'string' ||
          typeof rawUserId === 'number'
        ) {
          userId = String(rawUserId);
        } else if (userInstitutionId) {
          // If userId is not available, use userInstitutionId as userId
          userId = userInstitutionId;
        }

        // Filter out entries without valid userInstitutionId
        if (!userInstitutionId) {
          return null;
        }

        return { userInstitutionId, ...(userId && { userId }) };
      }
      return null;
    })
    .filter((s): s is ExtractedStudent => s !== null);
}
