// Types
export type {
  CategoryConfig,
  Item,
  StudentRecipient,
  BaseDateTimeFormData,
  BaseFormDataWithStudents,
  BaseDateTimeErrors,
  BaseStepErrors,
  StepState,
  StepConfig,
  StepDefinition,
  SendModalConfig,
  BaseSendModalStore,
  BaseSendModalProps,
  DateTimeChangeHandler,
  CategoriesChangeHandler,
} from './types';

// Store factory
export {
  createSendModalStore,
  type CreateSendModalStoreConfig,
} from './createSendModalStore';

// Utils
export { applyChainedAutoSelection } from './utils/applyChainedAutoSelection';

// Hooks
export {
  useDateTimeHandlers,
  type UseDateTimeHandlersProps,
  type UseDateTimeHandlersReturn,
} from './hooks/useDateTimeHandlers';
export {
  useCategoryInitialization,
  type UseCategoryInitializationProps,
} from './hooks/useCategoryInitialization';

// Components
export {
  SendModalError,
  type SendModalErrorProps,
  RecipientStep,
  type RecipientStepProps,
  DeadlineStep,
  type DeadlineStepProps,
  SendModalFooter,
  type SendModalFooterProps,
} from './components';
