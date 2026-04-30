import { useMemo, useCallback } from 'react';
import Text from '../Text/Text';
import { Users, MagnifyingGlass } from '@phosphor-icons/react';
import type { StudentGroup, StudentsFilterSectionProps } from './types';

/**
 * Default labels for the component
 */
const DEFAULT_LABELS = {
  studentsSection: 'ESTUDANTES',
  loadingStudents: 'Carregando estudantes...',
  noStudentsForFilters:
    'Nenhum estudante encontrado para os filtros selecionados',
  selectFiltersToSeeStudents:
    'Selecione uma escola, série ou turma para ver os estudantes',
  allStudents: 'Todos os estudantes',
  searchPlaceholder: 'Buscar',
};

/**
 * Students filter section with search and grouping by school/year/class
 *
 * @example
 * ```tsx
 * <StudentsFilterSection
 *   groupedStudents={groupedStudents}
 *   selectedIds={selectedIds}
 *   searchQuery={searchQuery}
 *   isLoading={isLoading}
 *   hasFilters={hasFilters}
 *   onSearchChange={setSearchQuery}
 *   onSelectionChange={setSelectedIds}
 * />
 * ```
 */
export function StudentsFilterSection({
  groupedStudents,
  selectedIds,
  searchQuery,
  isLoading,
  hasFilters,
  onSearchChange,
  onSelectionChange,
  labels: customLabels,
}: StudentsFilterSectionProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  // Filter students by name based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedStudents;
    }

    const query = searchQuery.toLowerCase().trim();

    return groupedStudents
      .map((group) => ({
        ...group,
        students: group.students.filter((student) =>
          student.name.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.students.length > 0);
  }, [groupedStudents, searchQuery]);

  // Total students (after search filter)
  const totalStudents = useMemo(
    () => filteredGroups.reduce((acc, group) => acc + group.students.length, 0),
    [filteredGroups]
  );

  // All visible student IDs (after search filter)
  const allVisibleIds = useMemo(
    () => filteredGroups.flatMap((group) => group.students.map((s) => s.id)),
    [filteredGroups]
  );

  // Check if all are selected
  const allSelected =
    totalStudents > 0 && selectedIds.length === allVisibleIds.length;

  // Toggle individual student
  const handleStudentToggle = useCallback(
    (studentId: string) => {
      const newSelected = selectedIds.includes(studentId)
        ? selectedIds.filter((id) => id !== studentId)
        : [...selectedIds, studentId];
      onSelectionChange(newSelected);
    },
    [selectedIds, onSelectionChange]
  );

  // Toggle all students
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allVisibleIds);
    }
  }, [allSelected, allVisibleIds, onSelectionChange]);

  // Toggle entire group
  const handleGroupToggle = useCallback(
    (group: StudentGroup) => {
      const groupIds = group.students.map((s) => s.id);
      const allGroupSelected = groupIds.every((id) => selectedIds.includes(id));

      if (allGroupSelected) {
        // Deselect all from group
        onSelectionChange(selectedIds.filter((id) => !groupIds.includes(id)));
      } else {
        // Select all from group
        const newSelected = new Set([...selectedIds, ...groupIds]);
        onSelectionChange(Array.from(newSelected));
      }
    },
    [selectedIds, onSelectionChange]
  );

  // Check if group is fully selected
  const isGroupSelected = useCallback(
    (group: StudentGroup) => {
      return group.students.every((s) => selectedIds.includes(s.id));
    },
    [selectedIds]
  );

  // Check if group is partially selected
  const isGroupPartiallySelected = useCallback(
    (group: StudentGroup) => {
      const selected = group.students.filter((s) =>
        selectedIds.includes(s.id)
      ).length;
      return selected > 0 && selected < group.students.length;
    },
    [selectedIds]
  );

  // Message when no filters selected
  if (!hasFilters) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-text-400 text-sm font-medium uppercase">
          <Users size={16} className="text-text-400" />
          <span>{labels.studentsSection}</span>
        </div>
        <div className="flex items-center justify-center py-6 px-4 bg-background-100 rounded-lg">
          <Text size="sm" className="text-text-500 text-center">
            {labels.selectFiltersToSeeStudents}
          </Text>
        </div>
      </div>
    );
  }

  // No students (and not loading)
  if (totalStudents === 0 && !searchQuery && !isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-text-400 text-sm font-medium uppercase">
          <Users size={16} className="text-text-400" />
          <span>{labels.studentsSection}</span>
        </div>
        <div className="flex items-center justify-center py-6 px-4 bg-background-100 rounded-lg">
          <Text size="sm" className="text-text-500 text-center">
            {labels.noStudentsForFilters}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-text-400 text-sm font-medium uppercase">
        <Users size={16} className="text-text-400" />
        <span>{labels.studentsSection}</span>
        {totalStudents > 0 && !isLoading && (
          <span className="text-text-500 lowercase">({totalStudents})</span>
        )}
        {isLoading && (
          <span className="text-text-500 lowercase">
            {labels.loadingStudents}
          </span>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={labels.searchPlaceholder}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-2 border border-border-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-text-950 disabled:opacity-50"
        />
      </div>

      {/* Select all checkbox */}
      <label
        className={`flex items-center gap-3 cursor-pointer hover:bg-background-50 p-2 rounded-lg -mx-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          disabled={isLoading}
          className="w-5 h-5 rounded border-border-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-text-700">
          {labels.allStudents}
        </span>
      </label>

      {/* Students list grouped */}
      <div
        className={`flex flex-col gap-2 max-h-64 overflow-y-auto min-h-[100px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {filteredGroups.map((group) => (
          <div key={group.key} className="flex flex-col">
            {/* Group header */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-background-50 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={isGroupSelected(group)}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = isGroupPartiallySelected(group);
                  }
                }}
                onChange={() => handleGroupToggle(group)}
                disabled={isLoading}
                className="w-5 h-5 rounded border-border-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-text-600">
                {group.label}
              </span>
              <span className="text-xs text-text-400">
                ({group.students.length})
              </span>
            </label>

            {/* Students in group */}
            <div className="ml-6 flex flex-col">
              {group.students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-background-50 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    disabled={isLoading}
                    className="w-5 h-5 rounded border-border-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-700">{student.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* No results from search */}
        {filteredGroups.length === 0 && searchQuery && !isLoading && (
          <div className="flex items-center justify-center py-4">
            <Text size="sm" className="text-text-500">
              Nenhum estudante encontrado para "{searchQuery}"
            </Text>
          </div>
        )}

        {/* Loading placeholder when no previous data */}
        {filteredGroups.length === 0 && !searchQuery && isLoading && (
          <div className="flex items-center justify-center py-4">
            <Text size="sm" className="text-text-500">
              {labels.loadingStudents}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsFilterSection;
