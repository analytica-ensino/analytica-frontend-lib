import { useEffect, useRef, useState } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import Text from '../Text/Text';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';

export interface QuestionCommentFieldProps {
  /** Comment currently persisted for this question */
  readonly value: string;
  /** Saves the comment. An empty string clears it. */
  readonly onSave: (comment: string) => Promise<void>;
  /** Heading shown above the textarea */
  readonly label?: string;
  /** Textarea placeholder */
  readonly placeholder?: string;
  /** Textarea height in rows */
  readonly rows?: number;
}

/**
 * Teacher comment on a single question, shared by the activity correction modal
 * and the simulation detail modal.
 *
 * There is deliberately no "is the answer correct?" control here: this field is
 * for objective questions, whose status is computed automatically and must not
 * move because a teacher wrote a note. Essay questions use the grading fields
 * in `CorrectActivityModal` instead.
 *
 * An empty comment is a valid value — it is how a teacher deletes one written by
 * mistake — so Save is gated on the draft differing from what is saved, not on
 * the draft being non-empty.
 *
 * A comment that already exists opens read-only behind an "Editar" button, so
 * changing one takes a deliberate click. Clearing a comment therefore returns
 * the field to its blank, directly editable state: there is nothing left to
 * edit, only a new note to write.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <QuestionCommentField
 *   value={question.teacherComment ?? ''}
 *   onSave={(comment) => saveComment(question.id, comment)}
 * />
 * ```
 */
export function QuestionCommentField({
  value,
  onSave,
  label = 'Comentário para o estudante',
  placeholder = 'Escreva um comentário sobre esta questão',
  rows = 3,
}: QuestionCommentFieldProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A comment already written opens locked, so it takes a deliberate click to
  // change it.
  //
  // `draft === value` is part of the condition, not a redundancy: the textarea
  // stays editable while a save is in flight, so the teacher can type past the
  // save. Locking on the echo alone would shut the field on text that is not
  // saved yet, forcing another click on Editar to submit it.
  const [isEditing, setIsEditing] = useState(false);
  const isLocked = value !== '' && !isEditing && draft === value;

  // What we last knew to be persisted. Compared against the draft to tell an
  // untouched field from one carrying edits that must not be thrown away.
  const persistedRef = useRef(value);

  // Follow the persisted value when it changes underneath (a refetch, or the
  // modal being reopened on a different student) — but only into a draft the
  // teacher has not edited since. The textarea stays editable while a save is
  // in flight, so a plain `setDraft(value)` here discarded whatever was typed
  // between clicking Save and the parent echoing the saved comment back.
  useEffect(() => {
    if (value === persistedRef.current) return;

    const previouslyPersisted = persistedRef.current;
    persistedRef.current = value;
    setDraft((current) => (current === previouslyPersisted ? value : current));
    setError(null);
    // A new record arrived under the same mounted field: it must open locked
    // again, like any comment the teacher has not chosen to edit yet.
    setIsEditing(false);
  }, [value]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      // Back to read-only, now showing what was just saved. Clearing the
      // comment lands on `value === ''`, which reads as "nothing to edit" and
      // leaves the field open — the teacher is writing a new one from scratch.
      setIsEditing(false);
    } catch {
      // Keep the draft AND the unlocked field so the teacher does not lose what
      // they wrote and can retry without an extra click.
      setError('Erro ao salvar o comentário. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Text size="sm" weight="bold" className="text-text-950">
        {label}
      </Text>
      <TextArea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        size="medium"
        // `readOnly`, not `disabled`: a locked comment still has to be
        // selectable so the teacher can read and copy it.
        readOnly={isLocked}
      />
      {error && (
        <Text size="sm" className="text-error-600">
          {error}
        </Text>
      )}
      <div className="flex justify-end">
        {isLocked ? (
          <Button
            variant="outline"
            size="medium"
            iconLeft={<PencilSimpleIcon size={18} />}
            onClick={() => setIsEditing(true)}
          >
            Editar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="medium"
            onClick={handleSave}
            disabled={saving || draft === value}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuestionCommentField;
