import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { CheckboxGroup, type CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';
import { GraduationCap } from '@phosphor-icons/react';
import { useUserAccessData, useStudentsFilter } from './hooks';
import { StudentsFilterSection } from './StudentsFilterSection';
import type {
  SimuladosFiltersModalProps,
  SimuladosFilters,
  SimuladosFiltersLabels,
} from './types';

/**
 * Default labels for the modal
 */
const DEFAULT_LABELS: Required<SimuladosFiltersLabels> = {
  title: 'Filtros',
  clearButton: 'Limpar filtros',
  applyButton: 'Aplicar',
  academicDataSection: 'DADOS ACADÊMICOS',
  studentsSection: 'ESTUDANTES',
  loadingFilters: 'Carregando filtros...',
  loadingStudents: 'Carregando estudantes...',
  noStudentsForFilters: 'Nenhum estudante encontrado para os filtros selecionados',
  selectFiltersToSeeStudents: 'Selecione uma turma para ver os estudantes',
  allStudents: 'Todos os estudantes',
  searchPlaceholder: 'Buscar',
};

/**
 * Extracts selected IDs from categories
 */
function extractFiltersFromCategories(
  categories: CategoryConfig[]
): Omit<SimuladosFilters, 'studentsIds'> {
  const filters = {
    schoolIds: [] as string[],
    schoolYearIds: [] as string[],
    classIds: [] as string[],
  };

  for (const category of categories) {
    const selectedIds = category.selectedIds || [];
    switch (category.key) {
      case 'school':
        filters.schoolIds = selectedIds;
        break;
      case 'schoolYear':
        filters.schoolYearIds = selectedIds;
        break;
      case 'class':
        filters.classIds = selectedIds;
        break;
    }
  }

  return filters;
}

/**
 * SimuladosFiltersModal - Filters modal exclusive for Simulados
 *
 * Uses data from user access endpoint and CheckboxGroup component with cascading.
 * Filters: School → Grade → Class → Students
 *
 * Receives the api client and calls the endpoints directly:
 * - GET /auth/me - for schools, schoolYears, classes
 * - POST /students/filters - for students list
 *
 * @example
 * ```tsx
 * import api from '@/services/apiService';
 *
 * <SimuladosFiltersModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onApply={(filters) => handleApply(filters)}
 *   initialFilters={currentFilters}
 *   api={api}
 * />
 * ```
 */
export function SimuladosFiltersModal({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  api,
  labels: customLabels,
}: SimuladosFiltersModalProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  const { schools, schoolYears, classes, isLoading } = useUserAccessData(api);

  const {
    groupedStudents,
    isLoading: studentsLoading,
    fetchStudents,
    clearStudents,
  } = useStudentsFilter(api);

  // State for CheckboxGroup categories
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  // State for selected students
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialFilters?.studentsIds || []
  );
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Track if already initialized to avoid re-initialization
  const hasInitialized = useRef(false);

  // Initialize categories when data loads
  // If there's only 1 school, auto-select it
  useEffect(() => {
    if (
      !hasInitialized.current &&
      (schools.length > 0 || schoolYears.length > 0 || classes.length > 0)
    ) {
      hasInitialized.current = true;

      // Auto-select school if there's only one
      const hasInitialSchools =
        initialFilters?.schoolIds && initialFilters.schoolIds.length > 0;
      const autoSelectedSchoolIds = hasInitialSchools
        ? initialFilters.schoolIds
        : schools.length === 1
          ? [schools[0].id]
          : [];

      setCategories([
        {
          key: 'school',
          label: 'Escola',
          itens: schools,
          selectedIds: autoSelectedSchoolIds,
        },
        {
          key: 'schoolYear',
          label: 'Série',
          dependsOn: ['school'],
          filteredBy: [{ key: 'school', internalField: 'schoolId' }],
          itens: schoolYears,
          selectedIds: initialFilters?.schoolYearIds || [],
        },
        {
          key: 'class',
          label: 'Turma',
          dependsOn: ['school', 'schoolYear'],
          filteredBy: [
            { key: 'school', internalField: 'schoolId' },
            { key: 'schoolYear', internalField: 'schoolYearId' },
          ],
          itens: classes,
          selectedIds: initialFilters?.classIds || [],
        },
      ]);
    }
  }, [schools, schoolYears, classes, initialFilters]);

  // Extract current filters from categories
  const currentFilters = useMemo(
    () => extractFiltersFromCategories(categories),
    [categories]
  );

  // Check if there's at least one class selected to load students
  // Requires class selection to avoid backend inconsistency with empty classIds
  const hasClassSelected = useMemo(
    () => currentFilters.classIds.length > 0,
    [currentFilters]
  );

  // Fetch students when school/grade/class filters change
  useEffect(() => {
    if (hasClassSelected) {
      fetchStudents(currentFilters);
      // Clear student selection when filters change
      setSelectedStudentIds([]);
    } else {
      clearStudents();
      setSelectedStudentIds([]);
    }
  }, [
    currentFilters.schoolIds.join(','),
    currentFilters.schoolYearIds.join(','),
    currentFilters.classIds.join(','),
  ]);

  const handleCategoriesChange = useCallback(
    (updatedCategories: CategoryConfig[]) => {
      setCategories(updatedCategories);
    },
    []
  );

  const handleApply = useCallback(() => {
    const filters: SimuladosFilters = {
      ...currentFilters,
      studentsIds: selectedStudentIds,
    };
    onApply(filters);
    onClose();
  }, [currentFilters, selectedStudentIds, onApply, onClose]);

  const handleClear = useCallback(() => {
    setCategories((prev) => prev.map((cat) => ({ ...cat, selectedIds: [] })));
    setSelectedStudentIds([]);
    setStudentSearchQuery('');
    clearStudents();
  }, [clearStudents]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={labels.title}
      size="md"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="outline" onClick={handleClear}>
            {labels.clearButton}
          </Button>
          <Button onClick={handleApply}>{labels.applyButton}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Section Header - Academic Data */}
        <div className="flex items-center gap-2 text-text-400 text-sm font-medium uppercase">
          <GraduationCap size={16} className="text-text-400" />
          <span>{labels.academicDataSection}</span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Text size="sm" className="text-text-500">
              {labels.loadingFilters}
            </Text>
          </div>
        )}

        {/* CheckboxGroup with cascading */}
        {!isLoading && categories.length > 0 && (
          <CheckboxGroup
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
          />
        )}

        {/* Divider */}
        <div className="border-t border-border-200" />

        {/* Students Section */}
        <StudentsFilterSection
          groupedStudents={groupedStudents}
          selectedIds={selectedStudentIds}
          searchQuery={studentSearchQuery}
          isLoading={studentsLoading}
          hasFilters={hasClassSelected}
          onSearchChange={setStudentSearchQuery}
          onSelectionChange={setSelectedStudentIds}
          labels={{
            studentsSection: labels.studentsSection,
            loadingStudents: labels.loadingStudents,
            noStudentsForFilters: labels.noStudentsForFilters,
            selectFiltersToSeeStudents: labels.selectFiltersToSeeStudents,
            allStudents: labels.allStudents,
            searchPlaceholder: labels.searchPlaceholder,
          }}
        />
      </div>
    </Modal>
  );
}

export default SimuladosFiltersModal;
