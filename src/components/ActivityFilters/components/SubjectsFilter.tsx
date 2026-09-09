import {
  CheckBox,
  IconRender,
  Text,
  TruncatedText,
  useTheme,
  getSubjectColorWithOpacity,
} from '../../..';
import type { KnowledgeArea } from '../../../types/activityFilters';
import { GridFourIcon } from '@phosphor-icons/react/dist/csr/GridFour';

export interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  /** Currently selected subject ids */
  selectedSubjectIds?: string[];
  /** Called when the user checks or unchecks one subject */
  onToggleSubject?: (subjectId: string) => void;
  /** Show the "Todos os componentes curriculares" select-all card */
  showAllSubjectsOption?: boolean;
  /** Whether every available subject is currently selected */
  allSubjectsSelected?: boolean;
  /** Called when the user clicks the select-all card */
  onToggleAllSubjects?: () => void;
  loading?: boolean;
  error?: string | null;
}

interface SelectAllCardProps {
  checked: boolean;
  indeterminate: boolean;
  onToggle?: () => void;
}

/**
 * The "Todos os componentes curriculares" card.
 *
 * Extracted rather than inlined in the grid so the JSX below stays within the
 * nesting depth Sonar allows (S2004).
 * @param props - Component props
 * @returns JSX element
 */
const SelectAllCard = ({
  checked,
  indeterminate,
  onToggle,
}: SelectAllCardProps) => (
  <div className="flex items-center gap-2 min-w-0">
    <CheckBox
      id="subject-all"
      checked={checked}
      indeterminate={indeterminate}
      onChange={() => onToggle?.()}
    />
    <label
      htmlFor="subject-all"
      className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
    >
      <span className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-600 bg-background-100">
        <GridFourIcon size={14} weight="bold" />
      </span>
      <TruncatedText
        size="sm"
        weight="normal"
        color="text-text-600"
        wrapperClassName="flex-1"
      >
        Todos os componentes curriculares
      </TruncatedText>
    </label>
  </div>
);

/**
 * SubjectsFilter component for selecting subjects/knowledge areas.
 *
 * An activity or recommended class may span several subjects — the backend
 * derives them from the subjects of the selected questions — so the grid is
 * multi-select, with an optional "todos os componentes curriculares" card.
 * @param props - Component props
 * @returns JSX element
 */
export const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubjectIds = [],
  onToggleSubject,
  showAllSubjectsOption = false,
  allSubjectsSelected = false,
  onToggleAllSubjects,
  loading = false,
  error = null,
}: SubjectsFilterProps) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <Text size="sm" className="text-text-600">
        Carregando componentes curriculares...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-text-600">
        {error}
      </Text>
    );
  }

  // Colored icon chip + name.
  const renderSubjectLabel = (area: KnowledgeArea) => (
    <div className="flex items-center gap-2 w-full min-w-0">
      <span
        className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
        style={{
          backgroundColor: getSubjectColorWithOpacity(area.color, isDark),
        }}
      >
        <IconRender
          iconName={area.icon || 'BookOpen'}
          size={14}
          color="currentColor"
        />
      </span>
      <TruncatedText size="sm" weight="normal" wrapperClassName="flex-1">
        {area.name}
      </TruncatedText>
    </div>
  );

  const someSelected = selectedSubjectIds.length > 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {showAllSubjectsOption && (
        <SelectAllCard
          checked={allSubjectsSelected}
          indeterminate={!allSubjectsSelected && someSelected}
          onToggle={onToggleAllSubjects}
        />
      )}
      {knowledgeAreas.map((area: KnowledgeArea) => (
        <div key={area.id} className="flex items-center gap-2 min-w-0">
          <CheckBox
            id={`subject-${area.id}`}
            checked={selectedSubjectIds.includes(area.id)}
            onChange={() => onToggleSubject?.(area.id)}
          />
          <label
            htmlFor={`subject-${area.id}`}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
          >
            {renderSubjectLabel(area)}
          </label>
        </div>
      ))}
    </div>
  );
};
