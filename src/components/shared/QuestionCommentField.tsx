import { useEffect, useRef, useState } from 'react';
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
  }, [value]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch {
      // Keep the draft so the teacher does not lose what they wrote.
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
      />
      {error && (
        <Text size="sm" className="text-error-600">
          {error}
        </Text>
      )}
      <div className="flex justify-end">
        <Button
          variant="solid"
          size="small"
          onClick={handleSave}
          disabled={saving || draft === value}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}

export default QuestionCommentField;
