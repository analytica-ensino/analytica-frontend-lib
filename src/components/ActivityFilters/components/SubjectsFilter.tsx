import { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
   * May be async, and may veto the pick (e.g. after asking the user to confirm
   * discarding the preview) by returning `false` — the dropdown then re-syncs
   * with `selectedSubject` so the trigger never shows a subject that was never
   * applied. Any other return value means the pick went through.
   */
  onSubjectChange?: (
    subjectId: string
  ) => void | boolean | Promise<void | boolean>;
  loading?: boolean;
  error?: string | null;
  /** Placeholder shown while no subject is selected */
  placeholder?: string;
}

/**
 * SubjectsFilter component for selecting a single subject/knowledge area.
 *
 * An activity or recommended class is bound to exactly one subject, so this is
 * a single-select dropdown — there is no multi-select mode.
 * @param props - Component props
 * @returns JSX element
 */
export const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubject = null,
  onSubjectChange,
  loading = false,
  error = null,
  placeholder = 'Selecione um componente curricular',
}: SubjectsFilterProps) => {
  const { isDark } = useTheme();

  // Select captures its onValueChange once (the internal store is created on
  // first render), so read the latest handler through a ref.
  const onSubjectChangeRef = useRef(onSubjectChange);
  useEffect(() => {
    onSubjectChangeRef.current = onSubjectChange;
  }, [onSubjectChange]);

  // Select applies the pick to its own state right away. When the parent vetoes
  // it, remounting is how we re-derive that state from `selectedSubject`.
  const [selectKey, setSelectKey] = useState(0);

  const handleValueChange = async (subjectId: string) => {
    let applied: void | boolean = false;
    try {
      applied = await onSubjectChangeRef.current?.(subjectId);
    } catch (error) {
      console.error('Erro ao trocar de componente curricular:', error);
    }

    if (applied === false) {
      setSelectKey((prev) => prev + 1);
    }
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

  // Colored icon chip + name — used both for the dropdown items and, via the
  // resolved label, for the trigger.
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
    <Select
      key={selectKey}
      value={selectedSubject ?? ''}
      onValueChange={handleValueChange}
      size="medium"
    >
      <SelectTrigger data-testid="subjects-filter-trigger">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {knowledgeAreas.map((area: KnowledgeArea) => (
          <SelectItem key={area.id} value={area.id}>
            {renderSubjectLabel(area)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
