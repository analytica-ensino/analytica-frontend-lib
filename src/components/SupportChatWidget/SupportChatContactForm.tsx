import { useState, type FormEvent } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import type {
  SupportChatContact,
  SupportChatContactField,
} from '../../types/supportChat';
import { cn } from '../../utils/utils';

export interface SupportChatContactFormProps {
  /** Fields the AI asked for, in order (one step each) */
  fields: SupportChatContactField[];
  /** Saves the contact; resolves true when it worked */
  onSubmit: (contact: SupportChatContact) => Promise<boolean>;
  /** Accent color of the theme, for the button */
  accentColor?: string;
}

const STEPS: Record<
  SupportChatContactField,
  { label: string; type: string; autoComplete: string; placeholder: string }
> = {
  name: {
    label: 'Seu nome',
    type: 'text',
    autoComplete: 'name',
    placeholder: 'Como podemos te chamar?',
  },
  email: {
    label: 'Seu e-mail',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'nome@exemplo.com',
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Problem with a typed value, or null when it can be sent */
const validate = (
  field: SupportChatContactField,
  value: string
): string | null => {
  if (field === 'name') {
    return value.length >= 2 ? null : 'Digite seu nome';
  }
  return EMAIL_PATTERN.test(value) ? null : 'Digite um e-mail válido';
};

/**
 * Step-by-step form for the contact the AI asks on the first contact (name,
 * then e-mail), shown under the AI message like the Zendesk pre-chat form.
 * The values go to the backend as fields, not as a chat message. Once sent,
 * it shows what was saved.
 */
export const SupportChatContactForm = ({
  fields,
  onSubmit,
  accentColor,
}: SupportChatContactFormProps) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const field = fields[step];
  const config = STEPS[field];
  const value = values[field] ?? '';
  const isLast = step === fields.length - 1;

  if (saved) {
    return (
      <div
        data-testid="support-chat-contact-saved"
        className="mb-3 ml-1 flex max-w-[85%] flex-col gap-1 rounded-2xl border border-border-100 px-4 py-3"
      >
        {fields.map((item) => (
          <Text key={item} size="xs" className="text-text-600">
            {STEPS[item].label}:{' '}
            <Text as="span" size="xs" weight="semibold" color="text-text-900">
              {values[item]}
            </Text>
          </Text>
        ))}
      </div>
    );
  }

  const advance = async (event: FormEvent) => {
    event.preventDefault();
    const typed = value.trim();
    const error = validate(field, typed);
    setProblem(error);
    if (error) return;

    const next = { ...values, [field]: typed };
    setValues(next);
    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    const ok = await onSubmit({
      ...(next.name ? { requesterName: next.name } : {}),
      ...(next.email ? { email: next.email.toLowerCase() } : {}),
    });
    setSaving(false);
    if (ok) setSaved(true);
  };

  const inputId = `support-chat-contact-${field}`;

  return (
    <form
      aria-label="Seus dados"
      onSubmit={(event) => void advance(event)}
      className="mb-3 ml-1 flex max-w-[85%] flex-col gap-3 rounded-2xl border border-border-100 px-4 py-3"
    >
      <label htmlFor={inputId}>
        <Text size="sm" weight="semibold" color="text-text-950">
          {config.label}
        </Text>
      </label>
      <input
        id={inputId}
        key={field}
        type={config.type}
        autoComplete={config.autoComplete}
        placeholder={config.placeholder}
        value={value}
        autoFocus
        disabled={saving}
        aria-invalid={!!problem || undefined}
        onChange={(event) =>
          setValues((current) => ({ ...current, [field]: event.target.value }))
        }
        className={cn(
          'w-full rounded-full border-2 px-4 py-2 text-sm text-text-900 focus:outline-none',
          problem
            ? 'border-error-500'
            : 'border-border-300 focus:border-primary-500'
        )}
      />
      {problem && (
        <Text size="xs" role="alert" className="text-error-700">
          {problem}
        </Text>
      )}
      <div className="flex items-center justify-between">
        <Text size="xs" className="text-text-500">
          {fields.length > 1 ? `${step + 1} de ${fields.length}` : ''}
        </Text>
        <Button
          type="submit"
          size="small"
          disabled={saving}
          style={accentColor ? { backgroundColor: accentColor } : undefined}
        >
          {isLast ? 'Enviar' : 'Avançar'}
        </Button>
      </div>
    </form>
  );
};
