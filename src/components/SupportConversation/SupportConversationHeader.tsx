import { useId, type ReactNode } from 'react';
import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/csr/SidebarSimple';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { DeviceMobileIcon } from '@phosphor-icons/react/dist/csr/DeviceMobile';
import { DesktopIcon } from '@phosphor-icons/react/dist/csr/Desktop';
import { EnvelopeIcon } from '@phosphor-icons/react/dist/csr/Envelope';
import { ChatCircleTextIcon } from '@phosphor-icons/react/dist/csr/ChatCircleText';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import IconButton from '../IconButton/IconButton';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { cn } from '../../utils/utils';
import type {
  SupportConversationChannel,
  SupportConversationOption,
  SupportConversationStatusTone,
} from '../../types/supportConversation';

/**
 * Props of the SupportConversationHeader component
 */
export interface SupportConversationHeaderProps {
  /** Ticket code as shown in the list, e.g. "#4819" */
  ticketCode: string;
  /** Name of the requester */
  name: string;
  /** Current status, as a badge (e.g. "HUMANO" in warning) */
  status: { label: string; tone?: SupportConversationStatusTone };
  /**
   * Statuses the agent can switch to from the badge. Without them (or without
   * `onStatusChange`) the badge is read-only.
   */
  statusOptions?: SupportConversationOption[];
  onStatusChange?: (value: string) => void;
  /** Value of the "Atendido por" select (e.g. "HUMANO") */
  attendedBy?: string;
  /** Options of the "Atendido por" select (e.g. Humano / IA) */
  attendedByOptions?: SupportConversationOption[];
  onAttendedByChange?: (value: string) => void;
  /** Channel the ticket came from */
  channel?: SupportConversationChannel;
  /** Institution of the requester, after the channel ("App · Rede…") */
  institution?: string;
  /** Whether the details panel is open (drives the toggle button state) */
  isDetailsOpen?: boolean;
  /** Opens or closes the details panel; the button only renders with it */
  onToggleDetails?: () => void;
  /** Extra actions on the title row, e.g. "Concluir" and the "…" menu */
  actions?: ReactNode;
  /** Locks the selects (e.g. concluded ticket) */
  readOnly?: boolean;
  className?: string;
}

/** Default icon of each known channel */
const CHANNEL_ICONS: Record<string, ReactNode> = {
  App: <DeviceMobileIcon size={16} />,
  Web: <DesktopIcon size={16} />,
  'E-mail': <EnvelopeIcon size={16} />,
  WhatsApp: <ChatCircleTextIcon size={16} />,
};

/**
 * Header of the support conversation.
 *
 * Title row: ticket code, requester name, optional actions and the button
 * that opens or closes the details panel (the parent owns that state and the
 * layout). Meta row: status badge (with a dropdown to change it), the
 * "Atendido por" select and the channel and institution.
 */
export default function SupportConversationHeader({
  ticketCode,
  name,
  status,
  statusOptions,
  onStatusChange,
  attendedBy,
  attendedByOptions,
  onAttendedByChange,
  channel,
  institution,
  isDetailsOpen = false,
  onToggleDetails,
  actions,
  readOnly = false,
  className,
}: Readonly<SupportConversationHeaderProps>) {
  const attendedByLabelId = useId();
  const canChangeStatus =
    !readOnly && Boolean(onStatusChange && statusOptions?.length);
  const channelText = [channel?.label, institution].filter(Boolean).join(' · ');

  const badge = (
    <Badge
      variant="solid"
      action={status.tone ?? 'warning'}
      size="small"
      data-testid="support-conversation-status"
    >
      {status.label}
    </Badge>
  );

  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-border-100 px-6 py-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <Text size="sm" color="text-text-500" className="shrink-0">
            {ticketCode}
          </Text>
          <Text
            as="h2"
            size="xl"
            weight="bold"
            color="text-text-950"
            className="truncate"
          >
            {name}
          </Text>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onToggleDetails && (
            <IconButton
              icon={<SidebarSimpleIcon size={22} mirrored />}
              size="md"
              aria-label={isDetailsOpen ? 'Fechar detalhes' : 'Abrir detalhes'}
              aria-expanded={isDetailsOpen}
              active={isDetailsOpen}
              onClick={onToggleDetails}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Text size="sm" color="text-text-600">
            Status
          </Text>
          {canChangeStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Status: ${status.label}. Alterar status`}
                className="flex items-center gap-1 rounded-md p-0.5 hover:bg-background-50"
              >
                {badge}
                <CaretDownIcon size={16} className="text-text-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {statusOptions?.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onStatusChange?.(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            badge
          )}
        </div>

        {attendedByOptions && attendedByOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Text
              id={attendedByLabelId}
              size="sm"
              color="text-text-600"
              className="shrink-0"
            >
              Atendido por
            </Text>
            <Select
              value={attendedBy}
              onValueChange={(value) => {
                if (value !== attendedBy) onAttendedByChange?.(value);
              }}
            >
              <SelectTrigger
                aria-labelledby={attendedByLabelId}
                disabled={readOnly || !onAttendedByChange}
                className="w-48"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {attendedByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {channelText && (
          <div
            className="ml-auto flex items-center gap-1.5 text-text-600"
            data-testid="support-conversation-channel"
          >
            {channel && (
              <span aria-hidden="true" className="flex">
                {channel.icon ?? CHANNEL_ICONS[channel.label]}
              </span>
            )}
            <Text size="sm" color="text-text-600">
              {channelText}
            </Text>
          </div>
        )}
      </div>
    </header>
  );
}
