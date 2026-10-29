import { useId, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import Button from '../Button/Button';
import Text from '../Text/Text';
import TextArea from '../TextArea/TextArea';
import { Skeleton, SkeletonText } from '../Skeleton/Skeleton';
import useToastStore from '../Toast/utils/ToastStore';
import { cn } from '../../utils/utils';
import type { SupportContact } from '../../types/supportUserPanel';
import { FieldLabel } from './SupportPanelShared';
import {
  formatDate,
  formatPhone,
  formatRelativeDay,
} from './supportUserPanelUtils';

/** Props for the profile tab */
export interface SupportProfileTabProps {
  contact?: SupportContact | null;
  loading?: boolean;
  /** Opens "Usuários / Contatos – Detalhe do contato" */
  onOpenContact?: () => void;
  /** Starts linking an unlinked contact to a platform user */
  onLinkContact?: () => void;
  /** Persists a note; reject to keep the text in the box */
  onAddNote?: (text: string) => Promise<void> | void;
}

const linkClasses =
  'underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info';

/** Read-only field; clicking copies the value */
const CopyField = ({ label, value }: { label: string; value?: string }) => {
  const addToast = useToastStore((state) => state.addToast);
  const labelId = useId();

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      addToast({ title: 'Copiado', action: 'success', position: 'top-right' });
    } catch {
      addToast({
        title: 'Não foi possível copiar',
        action: 'warning',
        position: 'top-right',
      });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={labelId}>{label}</FieldLabel>
      {value ? (
        <Button
          variant="raw"
          onClick={copy}
          aria-labelledby={labelId}
          aria-describedby={`${labelId}-value`}
          title="Clique para copiar"
          className="w-full rounded-lg border border-border-300 bg-background px-3 py-2.5 text-left hover:border-border-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
        >
          <Text
            as="span"
            id={`${labelId}-value`}
            size="sm"
            color="text-text-950"
            className="block truncate"
          >
            {value}
          </Text>
        </Button>
      ) : (
        <div
          aria-labelledby={labelId}
          className="w-full rounded-lg border border-border-300 bg-background px-3 py-2.5"
        >
          <Text as="span" size="sm" color="text-text-400">
            —
          </Text>
        </div>
      )}
    </div>
  );
};

const ProfileSkeleton = () => (
  <div
    className="flex flex-col gap-4"
    aria-busy="true"
    aria-label="Carregando perfil"
  >
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={44} height={44} />
      <div className="flex flex-1 flex-col gap-1.5">
        <SkeletonText width="60%" />
        <SkeletonText width="80%" />
      </div>
    </div>
    <Skeleton variant="rounded" height={40} />
    <Skeleton variant="rounded" height={40} />
    <SkeletonText lines={5} spacing="medium" />
  </div>
);

/**
 * Profile tab: contact header, link badge, e-mail/phone (with a warning when
 * the e-mail was not verified), key/value facts and the team notes about the
 * user.
 */
export default function SupportProfileTab({
  contact,
  loading = false,
  onOpenContact,
  onLinkContact,
  onAddNote,
}: Readonly<SupportProfileTabProps>) {
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  if (loading || !contact) return <ProfileSkeleton />;

  const canAddNote =
    Boolean(onAddNote) && note.trim().length > 0 && !savingNote;

  const submitNote = async () => {
    if (!canAddNote || !onAddNote) return;
    setSavingNote(true);
    try {
      await onAddNote(note.trim());
      setNote('');
    } catch {
      // The text stays in the box so the agent can retry.
      addToast({
        title: 'Não foi possível adicionar a nota',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setSavingNote(false);
    }
  };

  const facts: [string, string][] = [
    ['Turma / cargo', contact.classOrPosition || '—'],
    ['Instituição', contact.institution || '—'],
    ['Primeiro contato', formatDate(contact.firstContactAt)],
    ['Último contato', formatRelativeDay(contact.lastContactAt)],
    ['Total de atendimentos', String(contact.ticketsCount)],
    ['Dispositivo', contact.device || '—'],
    ['Canal preferido', contact.preferredChannel],
  ];

  const notes = [...contact.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar
          src={contact.avatarUrl}
          name={contact.name}
          size={44}
          fallback="initials"
        />
        <div className="flex min-w-0 flex-col">
          <Text
            size="sm"
            weight="bold"
            color="text-text-950"
            className="truncate"
          >
            {contact.name}
          </Text>
          <Text size="xs" color="text-text-600" className="truncate">
            {contact.role} · {contact.institution}
          </Text>
        </div>
      </div>

      {contact.linked ? (
        <Text
          size="xs"
          color="text-success-800"
          className="rounded-lg border border-success-200 bg-success-background px-3 py-2"
        >
          ✓ Vinculado à plataforma
          {onOpenContact && (
            <>
              {' · '}
              <Button
                variant="raw"
                onClick={onOpenContact}
                className={linkClasses}
              >
                ver cadastro
              </Button>
            </>
          )}
        </Text>
      ) : (
        <Text
          size="xs"
          color="text-warning-800"
          className="rounded-lg bg-warning-background px-3 py-2"
        >
          Usuário não vinculado
          {onLinkContact && (
            <>
              {' · '}
              <Button
                variant="raw"
                onClick={onLinkContact}
                className={linkClasses}
              >
                vincular
              </Button>
            </>
          )}
        </Text>
      )}

      <CopyField label="E-mail" value={contact.email ?? undefined} />
      {contact.email && contact.emailVerified === false && (
        <Text
          size="xs"
          color="text-warning-800"
          className="-mt-2 rounded-lg bg-warning-background px-3 py-2"
        >
          E-mail não verificado: informado por um visitante, não confirme dados
          da conta por ele
        </Text>
      )}
      <CopyField
        label="Telefone"
        value={contact.phone ? formatPhone(contact.phone) : undefined}
      />

      <dl className="flex flex-col">
        {facts.map(([key, value]) => (
          <div
            key={key}
            className="flex items-baseline justify-between gap-3 border-b border-border-100 py-2 last:border-b-0"
          >
            <Text as="dt" size="xs" color="text-text-600">
              {key}
            </Text>
            <Text
              as="dd"
              size="xs"
              weight="medium"
              color="text-text-950"
              className="text-right"
            >
              {value}
            </Text>
          </div>
        ))}
      </dl>

      <hr className="border-border-100" />

      <div className="flex flex-col gap-2">
        <FieldLabel>Notas sobre o usuário</FieldLabel>
        <TextArea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Escreva uma nota visível para a equipe"
          aria-label="Nota sobre o usuário"
          size="small"
          className="!h-16 min-h-16"
          disabled={!onAddNote}
        />
        <div className="flex justify-end">
          <Button
            size="small"
            className="rounded-full"
            onClick={submitNote}
            disabled={!canAddNote}
          >
            Adicionar nota
          </Button>
        </div>
        {notes.length > 0 && (
          <ul
            aria-label="Notas sobre o usuário"
            className="flex flex-col gap-2"
          >
            {notes.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-1 rounded-lg border border-warning-200 bg-exam-3 px-3 py-2'
                )}
              >
                <Text
                  size="xs"
                  color="text-text-950"
                  className="whitespace-pre-line"
                >
                  {item.text}
                </Text>
                <Text size="2xs" color="text-warning-800">
                  {item.author} · {formatDate(item.createdAt)}
                </Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
