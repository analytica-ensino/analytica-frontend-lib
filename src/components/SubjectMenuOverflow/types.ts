/**
 * One componente curricular of the strip.
 *
 * `color` and `icon` come from the knowledge catalogue and are nullable there,
 * so the strip falls back to a neutral square and the `Shapes` icon.
 */
export interface SubjectMenuItem {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface SubjectMenuOverflowProps {
  /** Subjects to offer, in the order they should appear after "Todos". */
  readonly subjects: SubjectMenuItem[];
  /** Currently selected subject; null means "Todos". */
  readonly selectedSubjectId: string | null;
  /** Reports the new cut. Receives null when "Todos" is chosen. */
  readonly onSubjectChange: (subjectId: string | null) => void;
  /** Dims the strip and stops clicks while the subjects are loading. */
  readonly loading?: boolean;
}
