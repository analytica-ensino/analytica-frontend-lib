/**
 * Exports centralizados do sistema de avisos componentizado
 *
 * Use este arquivo para importar tudo que você precisa
 */

// Componente principal
export { AlertsManager } from './AlertsManager';

// Componentes de steps (caso queira customizar)
export {
  MessageStep,
  RecipientsStep,
  DateStep,
  PreviewStep,
} from './AlertSteps';

// Tipos TypeScript
export type {
  AlertsConfig,
  CategoryConfig,
  StepConfig,
  StepComponentProps,
  LabelsConfig,
  AlertData,
  AlertTableItem,
} from './types';

// Store (caso precise acessar diretamente)
export {
  useAlertFormStore,
  type RecipientItem,
  type RecipientCategory,
} from './useAlertForm';
