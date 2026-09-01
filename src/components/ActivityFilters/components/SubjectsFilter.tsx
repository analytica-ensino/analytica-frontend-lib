import {
  Radio,
  IconRender,
  Text,
  TruncatedText,
  useTheme,
  getSubjectColorWithOpacity,
} from '../../..';
import type { KnowledgeArea } from '../../../types/activityFilters';

export interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  /** Currently selected subject id, or null when none is selected */
  selectedSubject?: string | null;
  /**
   * Called when the user picks a subject.
   *
   * May be async and may veto the pick (e.g. after asking the user to confirm
   * discarding the preview). No rollback is needed here: the selection is
   * controlled by `selectedSubject`, so a vetoed pick simply never arrives.
   */
  onSubjectChange?: (
    subjectId: string
  ) => void | boolean | Promise<void | boolean>;
  loading?: boolean;
  error?: string | null;
}

/**
 * SubjectsFilter component for selecting a single subject/knowledge area.
 *
 * An activity or recommended class is bound to exactly one subject, so the grid
 * uses Radios — there is no multi-select mode and no "todos os componentes
 * curriculares" card.
 * @param props - Component props
 * @returns JSX element
 */
export const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubject = null,
  onSubjectChange,
  loading = false,
  error = null,
}: SubjectsFilterProps) => {
  const { isDark } = useTheme();

  // O handler do pai é assíncrono (abre o diálogo de confirmação), então uma
  // rejeição viraria unhandled rejection se não fosse capturada aqui.
  const handleSubjectChange = (subjectId: string) => {
    Promise.resolve(onSubjectChange?.(subjectId)).catch((err) => {
      console.error('Erro ao trocar de componente curricular:', err);
    });
  };

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

  return (
    <div className="grid grid-cols-3 gap-3">
      {knowledgeAreas.map((area: KnowledgeArea) => (
        <Radio
          key={area.id}
          value={area.id}
          checked={selectedSubject === area.id}
          onChange={() => handleSubjectChange(area.id)}
          label={renderSubjectLabel(area)}
        />
      ))}
    </div>
  );
};
