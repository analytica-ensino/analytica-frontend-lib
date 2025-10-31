import { ComponentType } from 'react';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Re-export para facilitar imports
export type { RecipientItem } from './useAlertForm';

// Re-export dos tipos do CheckboxGroup (usamos diretamente)
export type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';
export type { Item } from '../CheckBoxGroup/CheckBoxGroup';

// Configuração de um step do wizard
export interface StepConfig {
  id: string;
  label: string;
  // Componente customizado para o step (opcional)
  component?: ComponentType<StepComponentProps>;
  // Validação antes de avançar
  validate?: (formData: unknown) => boolean | string;
  // Se deve mostrar este step (pode ser condicional)
  shouldShow?: (formData: unknown) => boolean;
}

// Props que cada componente de step recebe
export interface StepComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  formData?: unknown;
}

// Configuração de textos/labels customizáveis
export interface LabelsConfig {
  // Títulos
  pageTitle?: string;
  modalTitle?: string;

  // Botões
  sendButton?: string;
  cancelButton?: string;
  nextButton?: string;
  previousButton?: string;
  finishButton?: string;

  // Step 1 (Mensagem)
  titleLabel?: string;
  titlePlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  imageLabel?: string;

  // Step 2 (Destinatários)
  recipientsTitle?: string;
  recipientsDescription?: string;

  // Step 3 (Data)
  dateLabel?: string;
  timeLabel?: string;
  sendTodayLabel?: string;
  sendCopyToEmailLabel?: string;

  // Step 4 (Prévia)
  previewTitle?: string;
  previewWarning?: string;

  // Mensagens
  noRecipientsSelected?: string;
  titleNotDefined?: string;
  messageNotDefined?: string;
  dateNotDefined?: string;
}

// Configuração completa do componente de Avisos
export interface AlertsConfig {
  // Categorias de destinatários (agora usando o formato do CheckboxGroup)
  categories: CategoryConfig[];

  // Steps do wizard (opcional - usa padrão se não fornecido)
  steps?: StepConfig[];

  // Labels customizáveis
  labels?: LabelsConfig;

  // Configurações de comportamento
  behavior?: {
    // Se deve mostrar a tabela de avisos enviados
    showAlertsTable?: boolean;

    // Se deve permitir anexar imagem
    allowImageAttachment?: boolean;

    // Se deve permitir agendar envio
    allowScheduling?: boolean;

    // Se deve enviar cópia para email
    allowEmailCopy?: boolean;

    // Callback ao enviar aviso
    onSendAlert?: (alertData: AlertData) => Promise<void>;
  };
}

// Dados do aviso a ser enviado
export interface AlertData {
  title: string;
  message: string;
  image?: string | File | null;
  date: string;
  time: string;
  sendToday: boolean;
  recipientCategories: Record<
    string,
    {
      selectedIds: string[];
      allSelected: boolean;
    }
  >;
}

// Item da tabela de avisos
export interface AlertTableItem {
  id: string;
  title: string;
  sentAt: string;
  recipientsCount?: number;
}
