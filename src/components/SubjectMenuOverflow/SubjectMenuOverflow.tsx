import { useMemo } from 'react';
import { GridFourIcon } from '@phosphor-icons/react/dist/csr/GridFour';
import { MenuItem, MenuOverflow as MenuOverflowRoot } from '../Menu/Menu';
import IconRender from '../IconRender/IconRender';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';
import type { SubjectMenuItem, SubjectMenuOverflowProps } from './types';

/** The synthetic "every subject" entry that leads the strip. */
const ALL_SUBJECTS: SubjectMenuItem = {
  id: 'all',
  name: 'Todos',
  color: null,
  icon: null,
};

/**
 * "Dados por componente curricular" — the horizontal subject strip.
 *
 * Presentational on purpose: it takes the subjects it should show instead of
 * fetching them, because the reports that use it resolve their own list —
 * the teacher's Atividades report lists the subjects of the activities they
 * created, the Simulados reports list the institution's.
 *
 * @example
 * ```tsx
 * <SubjectMenuOverflow
 *   subjects={subjects}
 *   selectedSubjectId={selectedSubjectId}
 *   onSubjectChange={setSelectedSubjectId}
 *   loading={subjectsLoading}
 * />
 * ```
 */
export function SubjectMenuOverflow({
  subjects,
  selectedSubjectId,
  onSubjectChange,
  loading = false,
}: SubjectMenuOverflowProps) {
  const { isDark } = useTheme();

  const menuItems = useMemo(() => [ALL_SUBJECTS, ...subjects], [subjects]);

  const selectedValue = selectedSubjectId ?? ALL_SUBJECTS.id;

  return (
    <div
      data-testid="subject-menu-overflow"
      className={cn(
        'relative transition-opacity',
        loading && 'opacity-50 pointer-events-none'
      )}
    >
      <MenuOverflowRoot
        defaultValue={ALL_SUBJECTS.id}
        value={selectedValue}
        className="max-w-full min-h-fit"
        onValueChange={(value: string | null) =>
          onSubjectChange(value === ALL_SUBJECTS.id ? null : value)
        }
      >
        {menuItems.map((subject) => {
          const isAll = subject.id === ALL_SUBJECTS.id;

          return (
            <MenuItem
              key={subject.id}
              variant="menu-overflow"
              value={subject.id}
              className="whitespace-nowrap"
              // The printed report names the cut it shows; the other subjects
              // are navigation, not content, so only the selected one prints.
              // An attribute rather than a class: MenuItem puts `className` on
              // an inner span and spreads the rest of its props on the <li>,
              // which the print stylesheet hides by `[data-print-hide]`.
              data-print-hide={subject.id === selectedValue ? undefined : true}
            >
              <span
                className={cn(
                  'w-[21px] h-[21px] flex items-center justify-center [&>svg]:w-[17px] [&>svg]:h-[17px] rounded-sm text-text-950',
                  isAll && 'bg-border-200'
                )}
                style={
                  isAll
                    ? undefined
                    : {
                        backgroundColor: getSubjectColorWithOpacity(
                          subject.color ?? undefined,
                          isDark
                        ),
                      }
                }
              >
                {isAll ? (
                  <GridFourIcon size={17} weight="bold" />
                ) : (
                  <IconRender
                    iconName={subject.icon ?? 'Shapes'}
                    size={17}
                    color="currentColor"
                  />
                )}
              </span>
              <span className="whitespace-nowrap">{subject.name}</span>
            </MenuItem>
          );
        })}
      </MenuOverflowRoot>
    </div>
  );
}
