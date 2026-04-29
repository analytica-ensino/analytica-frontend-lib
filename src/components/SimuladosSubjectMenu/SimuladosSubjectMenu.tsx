import { useEffect, useMemo } from 'react';
import { MenuItem, MenuOverflow } from '../Menu/Menu';
import IconRender from '../IconRender/IconRender';
import Text from '../Text/Text';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';
import { GridFour } from 'phosphor-react';
import { useSimulatedSubjects } from './useSimulatedSubjects';
import type { SimuladosSubjectMenuProps, SimulatedSubjectItem } from './types';

/**
 * SimuladosSubjectMenu - Menu component for selecting subjects in simulated exams
 *
 * Fetches subjects that have questions in simulated exams.
 * Subjects can be filtered by area of knowledge (Área de Conhecimento).
 *
 * @example
 * ```tsx
 * import api from '@/services/apiService';
 *
 * <SimuladosSubjectMenu
 *   api={api}
 *   areaKnowledgeId={selectedAreaKnowledgeId}
 *   selectedSubjectId={selectedSubjectId}
 *   onSubjectChange={handleSubjectChange}
 *   loading={generalOverviewLoading}
 * />
 * ```
 */
export function SimuladosSubjectMenu({
  api,
  areaKnowledgeId,
  selectedSubjectId,
  onSubjectChange,
  loading: externalLoading = false,
  label = 'Disciplina',
}: SimuladosSubjectMenuProps) {
  const {
    subjects,
    loading: subjectsLoading,
    fetchSubjects,
  } = useSimulatedSubjects(api);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchSubjects(areaKnowledgeId);
  }, [fetchSubjects, areaKnowledgeId]);

  const loading = externalLoading || subjectsLoading;

  // Add "Todos" option at the beginning
  const allOption: SimulatedSubjectItem = useMemo(
    () => ({
      id: 'all',
      name: 'Todos',
      color: '#6B7280',
      icon: 'shapes',
    }),
    []
  );

  const menuItems = useMemo(
    () => [allOption, ...subjects],
    [allOption, subjects]
  );

  const effectiveValue = selectedSubjectId || 'all';

  return (
    <div className="space-y-2">
      <Text size="sm" weight="medium" className="text-text-700">
        {label}
      </Text>
      {/* Keep MenuOverflow mounted to preserve state, use opacity for loading */}
      <div
        className={cn(
          'relative transition-opacity',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        <MenuOverflow
          defaultValue="all"
          value={effectiveValue}
          className="max-w-full min-h-fit"
          onValueChange={onSubjectChange}
        >
          {menuItems.map((subject: SimulatedSubjectItem) => (
            <MenuItem
              key={subject.id}
              variant="menu-overflow"
              value={subject.id}
              className="whitespace-nowrap"
            >
              <span
                className={cn(
                  'w-[21px] h-[21px] flex items-center justify-center [&>svg]:w-[17px] [&>svg]:h-[17px] rounded-sm text-text-950'
                )}
                style={{
                  backgroundColor:
                    subject.id === 'all'
                      ? 'rgba(107, 114, 128, 0.2)'
                      : getSubjectColorWithOpacity(subject?.color ?? undefined, isDark),
                }}
              >
                {subject.id === 'all' ? (
                  <GridFour size={17} weight="bold" />
                ) : (
                  <IconRender
                    iconName={subject.icon || 'shapes'}
                    size={17}
                    color="currentColor"
                  />
                )}
              </span>
              <span className="whitespace-nowrap">{subject.name}</span>
            </MenuItem>
          ))}
        </MenuOverflow>
      </div>
    </div>
  );
}

export default SimuladosSubjectMenu;
