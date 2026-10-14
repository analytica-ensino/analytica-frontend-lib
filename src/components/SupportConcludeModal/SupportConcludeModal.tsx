import { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Chips from '../Chips/Chips';
import TextArea from '../TextArea/TextArea';
import CheckBox from '../CheckBox/CheckBox';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import type { SupportApiClient } from '../../types/support';
import {
  SUPPORT_CONCLUSION_OUTCOME,
  type ConcludeSupportTicketRequest,
  type SupportConclusionFormData,
  type SupportConclusionOutcome,
  type SupportConclusionReason,
} from '../../types/supportConclusion';
import { SUPPORT_CONCLUSION_REASONS } from './supportConclusionReasons';
import {
  buildConcludeTicketRequest,
  findConclusionReason,
  getConcludeTicketErrorMessage,
  isConclusionFormValid,
} from './supportConclusionUtils';

/**
 * Props for the "Concluir atendimento" modal
 */
export interface SupportConcludeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ticket id (uuid) used in `PATCH /support/admin/:id` */
  ticketId: string;
  /** Ticket number shown in the title, e.g. "4808" */
  ticketLabel?: string;
  /** API client of the consumer app (only `patch` is used) */
  apiClient: Pick<SupportApiClient, 'patch'>;
  /** Reasons catalog; defaults to the mocked reasons */
  reasons?: SupportConclusionReason[];
  /**
   * Called after the backend concludes the ticket, with every collected value
   * (including the ones the backend does not store yet) and the updated ticket
   */
  onConcluded?: (form: SupportConclusionFormData, ticket: unknown) => void;
}

/** Options of "Resolvido?" */
const OUTCOME_OPTIONS: { value: SupportConclusionOutcome; label: string }[] = [
  { value: SUPPORT_CONCLUSION_OUTCOME.RESOLVED, label: 'Sim, resolvido' },
  {
    value: SUPPORT_CONCLUSION_OUTCOME.NOT_RESOLVED_FORWARDED,
    label: 'Não resolvido (encaminhado)',
  },
  {
    value: SUPPORT_CONCLUSION_OUTCOME.NO_USER_RESPONSE,
    label: 'Sem resposta do usuário',
  },
];

const INITIAL_FORM: SupportConclusionFormData = {
  reason: '',
  subReason: '',
  description: '',
  outcome: SUPPORT_CONCLUSION_OUTCOME.RESOLVED,
  internalNote: '',
  suggestFaq: false,
  openTechTicket: false,
};

/**
 * Bold section label of the form
 */
function SectionLabel({ children }: Readonly<{ children: string }>) {
  return (
    <Text size="sm" weight="bold" color="text-text-950">
      {children}
    </Text>
  );
}

/**
 * Modal that concludes a support ticket: classifies the reason, records the
 * outcome and an optional internal note, then closes the ticket in the
 * backend (`status: FECHADO` + `problemType` + `notes`).
 */
export default function SupportConcludeModal({
  isOpen,
  onClose,
  ticketId,
  ticketLabel,
  apiClient,
  reasons = SUPPORT_CONCLUSION_REASONS,
  onConcluded,
}: Readonly<SupportConcludeModalProps>) {
  const [form, setForm] = useState<SupportConclusionFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [isOpen]);

  const reason = findConclusionReason(reasons, form.reason);
  const hasSubReasons = !!reason && reason.subReasons.length > 0;
  const request =
    reason && isConclusionFormValid(form, reasons) && !isSubmitting
      ? buildConcludeTicketRequest(form, reason)
      : null;

  const updateForm = (changes: Partial<SupportConclusionFormData>) =>
    setForm((current) => ({ ...current, ...changes }));

  const handleReasonChange = (value: string) =>
    updateForm({
      reason: value,
      subReason: '',
      description: '',
      openTechTicket: false,
    });

  const submit = async (body: ConcludeSupportTicketRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<unknown>(
        `/support/admin/${ticketId}`,
        body
      );
      onConcluded?.(form, response.data);
      onClose();
    } catch (requestError) {
      setError(getConcludeTicketErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        ticketLabel
          ? `Concluir atendimento #${ticketLabel}`
          : 'Concluir atendimento'
      }
      footer={
        <>
          <Button
            variant="outline"
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            size="small"
            onClick={request ? () => submit(request) : undefined}
            disabled={!request}
          >
            Concluir atendimento
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Text size="sm" color="text-text-600">
          Esses dados são obrigatórios e alimentam o dashboard.
        </Text>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Motivo da abertura *</SectionLabel>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Select
                size="medium"
                value={form.reason}
                onValueChange={handleReasonChange}
              >
                <SelectTrigger aria-label="Categoria">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 flex-1">
              <Select
                key={form.reason}
                size="medium"
                value={form.subReason}
                onValueChange={(value) => updateForm({ subReason: value })}
              >
                <SelectTrigger aria-label="Submotivo" disabled={!hasSubReasons}>
                  <SelectValue
                    placeholder={
                      hasSubReasons ? 'Selecione o submotivo' : 'Sem submotivos'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {reason?.subReasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {reason?.requiresDescription && (
            <TextArea
              label="Descreva o motivo *"
              rows={3}
              maxLength={2000}
              placeholder="Explique o motivo do atendimento"
              value={form.description}
              onChange={(event) =>
                updateForm({ description: event.target.value })
              }
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Resolvido?</SectionLabel>
          <div
            role="radiogroup"
            aria-label="Resolvido?"
            className="flex flex-wrap items-center gap-2"
          >
            {OUTCOME_OPTIONS.map((option) => (
              <Chips
                key={option.value}
                role="radio"
                aria-checked={form.outcome === option.value}
                selected={form.outcome === option.value}
                onClick={() => updateForm({ outcome: option.value })}
              >
                {option.label}
              </Chips>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Observação interna</SectionLabel>
          <Text size="2xs" color="text-text-600">
            Opcional
          </Text>
          <TextArea
            aria-label="Observação interna"
            rows={4}
            maxLength={2000}
            placeholder="Ex.: usuário orientado a limpar o cache; problema persistiu no Android 14"
            value={form.internalNote}
            onChange={(event) =>
              updateForm({ internalNote: event.target.value })
            }
          />
        </div>

        {reason?.suggestsTechTicket && (
          <CheckBox
            size="small"
            label="Abrir ticket técnico"
            checked={form.openTechTicket}
            onChange={(event) =>
              updateForm({ openTechTicket: event.target.checked })
            }
          />
        )}

        <CheckBox
          size="small"
          label="Esta dúvida deveria virar FAQ"
          checked={form.suggestFaq}
          onChange={(event) => updateForm({ suggestFaq: event.target.checked })}
        />

        {error && (
          <Text size="sm" color="text-error-600" role="alert">
            {error}
          </Text>
        )}
      </div>
    </Modal>
  );
}
