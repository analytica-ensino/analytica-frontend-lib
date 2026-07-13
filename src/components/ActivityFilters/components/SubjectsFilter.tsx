import {
  Radio,
  CheckBox,
  IconRender,
  Text,
  TruncatedText,
  useTheme,
  getSubjectColorWithOpacity,
} from '../../..';
import type { KnowledgeArea } from '../../../types/activityFilters';
import { ProhibitIcon } from '@phosphor-icons/react/dist/csr/Prohibit';
import { GridFourIcon } from '@phosphor-icons/react/dist/csr/GridFour';

export interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  /** Single-select value (used when `multiple` is false) */
  selectedSubject?: string | null;
  /** Single-select handler (used when `multiple` is false) */
  onSubjectChange?: (subjectId: string) => void;
  loading?: boolean;
  error?: string | null;
  /** Show "Sem matéria" option to filter questions without subject */
  showNoSubjectOption?: boolean;
  /** Value to use for "Sem matéria" option */
  noSubjectValue?: string;
  /** Enable multi-select: renders CheckBoxes instead of Radios */
  multiple?: boolean;
  /** Selected subject ids (used when `multiple` is true) */
  selectedSubjectIds?: string[];
  /** Toggle handler for a single subject (used when `multiple` is true) */
  onToggleSubject?: (subjectId: string) => void;
  /** Show the "Todas as matérias" select-all card (multi-select only) */
  showAllSubjectsOption?: boolean;
  /** Whether every subject is currently selected */
  allSubjectsSelected?: boolean;
  /** Toggle handler for the "Todas as matérias" select-all card */
  onToggleAllSubjects?: () => void;
}

/**
 * SubjectsFilter component for selecting subjects/knowledge areas.
 *
 * Defaults to single-select (Radio). Pass `multiple` to render a multi-select
 * grid (CheckBox per subject) with an optional "Todas as matérias" select-all
 * card, keeping the same visual card style as the subjects.
 * @param props - Component props
 * @returns JSX element
 */
export const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubject = null,
  onSubjectChange,
  loading = false,
  error = null,
  showNoSubjectOption = false,
  noSubjectValue = '__NO_SUBJECT__',
  multiple = false,
  selectedSubjectIds = [],
  onToggleSubject,
  showAllSubjectsOption = false,
  allSubjectsSelected = false,
  onToggleAllSubjects,
}: SubjectsFilterProps) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <Text size="sm" className="text-text-600">
        Carregando matérias...
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

  // Colored icon chip + name — shared by the Radio and CheckBox renderings so
  // both selection modes look identical.
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

  if (multiple) {
    const someSelected = selectedSubjectIds.length > 0;
    return (
      <div className="grid grid-cols-3 gap-3">
        {showAllSubjectsOption && (
          <div className="flex items-center gap-2 min-w-0">
            <CheckBox
              id="subject-all"
              checked={allSubjectsSelected}
              indeterminate={!allSubjectsSelected && someSelected}
              onChange={() => onToggleAllSubjects?.()}
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
                Todas as matérias
              </TruncatedText>
            </label>
          </div>
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
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {showNoSubjectOption && (
        <Radio
          key={noSubjectValue}
          value={noSubjectValue}
          checked={selectedSubject === noSubjectValue}
          onChange={() => onSubjectChange?.(noSubjectValue)}
          label={
            <div className="flex items-center gap-2 w-full min-w-0">
              <span className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-600 bg-background-100">
                <ProhibitIcon size={14} weight="bold" />
              </span>
              <TruncatedText
                size="sm"
                weight="normal"
                color="text-text-600"
                wrapperClassName="flex-1"
              >
                Sem matéria
              </TruncatedText>
            </div>
          }
        />
      )}
      {knowledgeAreas.map((area: KnowledgeArea) => (
        <Radio
          key={area.id}
          value={area.id}
          checked={selectedSubject === area.id}
          onChange={() => onSubjectChange?.(area.id)}
          label={renderSubjectLabel(area)}
        />
      ))}
    </div>
  );
};
