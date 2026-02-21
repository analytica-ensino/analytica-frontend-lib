import {
  Radio,
  IconRender,
  Text,
  useTheme,
  getSubjectColorWithOpacity,
} from '../../..';
import type { KnowledgeArea } from '../../../types/activityFilters';
import { Prohibit } from 'phosphor-react';

export interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string) => void;
  loading?: boolean;
  error?: string | null;
  /** Show "Sem matéria" option to filter questions without subject */
  showNoSubjectOption?: boolean;
  /** Value to use for "Sem matéria" option */
  noSubjectValue?: string;
}

/**
 * SubjectsFilter component for selecting subjects/knowledge areas
 * @param props - Component props
 * @returns JSX element
 */
export const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubject,
  onSubjectChange,
  loading = false,
  error = null,
  showNoSubjectOption = false,
  noSubjectValue = '__NO_SUBJECT__',
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

  return (
    <div className="grid grid-cols-3 gap-3">
      {showNoSubjectOption && (
        <Radio
          key={noSubjectValue}
          value={noSubjectValue}
          checked={selectedSubject === noSubjectValue}
          onChange={() => onSubjectChange(noSubjectValue)}
          label={
            <div className="flex items-center gap-2 w-full min-w-0">
              <span className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-600 bg-background-100">
                <Prohibit size={14} weight="bold" />
              </span>
              <span className="truncate flex-1 text-text-600">Sem matéria</span>
            </div>
          }
        />
      )}
      {knowledgeAreas.map((area: KnowledgeArea) => (
        <Radio
          key={area.id}
          value={area.id}
          checked={selectedSubject === area.id}
          onChange={() => onSubjectChange(area.id)}
          label={
            <div className="flex items-center gap-2 w-full min-w-0">
              <span
                className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
                style={{
                  backgroundColor: getSubjectColorWithOpacity(
                    area.color,
                    isDark
                  ),
                }}
              >
                <IconRender
                  iconName={area.icon || 'BookOpen'}
                  size={14}
                  color="currentColor"
                />
              </span>
              <span className="truncate flex-1">{area.name}</span>
            </div>
          }
        />
      ))}
    </div>
  );
};
