import { useMemo, useCallback } from 'react';
import Text from '../Text/Text';
import CheckBox from '../CheckBox/CheckBox';
import { Users, MagnifyingGlass } from '@phosphor-icons/react';
import type { StudentGroup, StudentsFilterSectionProps } from './types';
import Input from '../Input/Input';

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
}: StudentsFilterSectionProps) {
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
          <span>ESTUDANTES</span>
        </div>
        <div className="flex items-center justify-center py-6 px-4 bg-background-100 rounded-lg">
          <Text size="sm" className="text-text-500 text-center">
            Selecione uma escola, série ou turma para ver os estudantes
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
          <span>ESTUDANTES</span>
        </div>
        <div className="flex items-center justify-center py-6 px-4 bg-background-100 rounded-lg">
          <Text size="sm" className="text-text-500 text-center">
            Nenhum estudante encontrado para os filtros selecionados
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
        <Text size="sm" weight="semibold" className="text-text-400 uppercase">
          ESTUDANTES
        </Text>
        {totalStudents > 0 && !isLoading && (
          <Text size="sm" className="text-text-500 lowercase">
            ({totalStudents})
          </Text>
        )}
        {isLoading && (
          <Text size="sm" className="text-text-500 lowercase">
            Carregando estudantes...
          </Text>
        )}
      </div>

      {/* Search input */}
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar"
        disabled={isLoading}
        iconLeft={<MagnifyingGlass size={18} />}
      />

      {/* Select all checkbox */}
      <div
        className={`hover:bg-background-50 p-2 rounded-lg -mx-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <CheckBox
          checked={allSelected}
          onChange={handleSelectAll}
          disabled={isLoading}
          label="Todos os estudantes"
          size="medium"
        />
      </div>

      {/* Students list grouped */}
      <div
        className={`flex flex-col gap-2 max-h-64 overflow-y-auto min-h-[100px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {filteredGroups.map((group) => (
          <div key={group.key} className="flex flex-col">
            {/* Group header */}
            <div className="hover:bg-background-50 p-2 rounded-lg">
              <CheckBox
                checked={isGroupSelected(group)}
                indeterminate={isGroupPartiallySelected(group)}
                onChange={() => handleGroupToggle(group)}
                disabled={isLoading}
                size="medium"
                label={
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-600">
                      {group.label}
                    </span>
                    <span className="text-xs text-text-400">
                      ({group.students.length})
                    </span>
                  </span>
                }
              />
            </div>

            {/* Students in group */}
            <div className="ml-6 flex flex-col">
              {group.students.map((student) => (
                <div
                  key={student.id}
                  className="hover:bg-background-50 p-2 rounded-lg"
                >
                  <CheckBox
                    checked={selectedIds.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    disabled={isLoading}
                    size="medium"
                    label={student.name}
                  />
                </div>
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
              Carregando estudantes...
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsFilterSection;
