import type { Story } from '@ladle/react';
import { useState } from 'react';
import { StudentsFilterSection } from './StudentsFilterSection';
import type { StudentGroup } from './types';

const baseGroups: StudentGroup[] = [
  {
    key: 'school-1-year-1-class-1',
    label: 'Escola Centro > 1 ano > A',
    students: [
      {
        id: 'student-1',
        name: 'Ana Souza',
        schoolId: 'school-1',
        schoolYearId: 'year-1',
        classId: 'class-1',
        schoolName: 'Escola Centro',
        schoolYearName: '1 ano',
        className: 'A',
      },
      {
        id: 'student-2',
        name: 'Bruno Lima',
        schoolId: 'school-1',
        schoolYearId: 'year-1',
        classId: 'class-1',
        schoolName: 'Escola Centro',
        schoolYearName: '1 ano',
        className: 'A',
      },
    ],
  },
  {
    key: 'school-2-year-3-class-2',
    label: 'Colégio Alfa > 3 ano > B',
    students: [
      {
        id: 'student-3',
        name: 'Carla Dias',
        schoolId: 'school-2',
        schoolYearId: 'year-3',
        classId: 'class-2',
        schoolName: 'Colégio Alfa',
        schoolYearName: '3 ano',
        className: 'B',
      },
    ],
  },
];

function InteractiveSection({
  groupedStudents,
  hasFilters,
  isLoading,
  initialSearchQuery = '',
}: {
  groupedStudents: StudentGroup[];
  hasFilters: boolean;
  isLoading: boolean;
  initialSearchQuery?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  return (
    <div className="max-w-xl">
      <StudentsFilterSection
        groupedStudents={groupedStudents}
        selectedIds={selectedIds}
        searchQuery={searchQuery}
        isLoading={isLoading}
        hasFilters={hasFilters}
        onSearchChange={setSearchQuery}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}

export const Default: Story = () => (
  <InteractiveSection groupedStudents={baseGroups} hasFilters={true} isLoading={false} />
);

export const NoFiltersSelected: Story = () => (
  <InteractiveSection groupedStudents={baseGroups} hasFilters={false} isLoading={false} />
);

export const EmptyStudents: Story = () => (
  <InteractiveSection groupedStudents={[]} hasFilters={true} isLoading={false} />
);

export const LoadingState: Story = () => (
  <InteractiveSection groupedStudents={[]} hasFilters={true} isLoading={true} />
);

export const SearchNoResults: Story = () => (
  <InteractiveSection
    groupedStudents={baseGroups}
    hasFilters={true}
    isLoading={false}
    initialSearchQuery="joao"
  />
);
