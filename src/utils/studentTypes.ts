/**
 * Student type with nested school, schoolYear, and class data
 * Used for dynamic student fetching
 */
export interface StudentWithNestedData {
  id: string;
  email: string;
  name: string;
  /**
   * Opcional pelo mesmo motivo do `Student` em `categoryDataUtils`: a resposta
   * de `/students/filters` nem sempre traz o campo, e os dois tipos descrevem o
   * mesmo payload — se um exigir e o outro não, deixam de ser atribuíveis.
   */
  active?: boolean;
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
