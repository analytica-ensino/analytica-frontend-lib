/**
 * Student type with nested school, schoolYear, and class data
 * Used for dynamic student fetching
 */
export interface StudentWithNestedData {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  userInstitutionId: string;
  institutionId: string;
  profileId: string;
  school: { id: string; name: string };
  schoolYear: { id: string; name: string };
  class: { id: string; name: string };
}

/**
 * Filters for fetching students
 */
export interface StudentFilters {
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
}

/**
 * Function type for fetching students by filters
 */
export type FetchStudentsByFiltersFunction = (
  filters: StudentFilters
) => Promise<StudentWithNestedData[]>;
