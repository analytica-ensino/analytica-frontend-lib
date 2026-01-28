import {
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useSyncExternalStore,
  useRef,
} from 'react';
import { Button, Modal, Stepper } from '../..';
import { CaretLeft, CaretRight, PaperPlaneTilt } from 'phosphor-react';
import { StepData } from '../Stepper/Stepper';
import { useAlertFormStore } from './useAlertForm';
import type { AlertsConfig, CategoryConfig } from '.';
import {
  MessageStep,
  RecipientsStep,
  DateStep,
  PreviewStep,
} from './AlertSteps';
import {
  canFinish as canFinishValidation,
  isCurrentStepValid as isCurrentStepValidValidation,
  handleNext as handleNextValidation,
} from './validation';
import { applyChainedAutoSelection } from '../shared/SendModalBase';
import { useDynamicStudentFetching } from '../../utils/useDynamicStudentFetching';

interface AlertsManagerProps {
  config: AlertsConfig;
  isOpen?: boolean;
  onClose?: () => void;
  /** URL da imagem após upload (prioritária - será exibida primeiro) */
  imageLink?: string | null;
  /** Imagem padrão a ser exibida quando não há imagem selecionada (deve ser URL string - o front deve converter File para URL se necessário) */
  defaultImage?: string | null;
}

const StepWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

export const AlertsManager = ({
  config,
  isOpen = false,
  onClose,
  imageLink,
  defaultImage,
}: AlertsManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [categories, setCategories] = useState(config.categories);

  // Subscribe to form store changes using useSyncExternalStore
  const formData = useSyncExternalStore(
    useAlertFormStore.subscribe,
    useAlertFormStore.getState
  );

  // Sincroniza com a prop isOpen
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  /**
   * Track if categories have been initialized for this modal session
   */
  const categoriesInitializedRef = useRef(false);

  const { labels, behavior, steps: customSteps } = config;

  /**
   * Handle categories change and fetch students dynamically if fetchStudentsByFilters is provided
   */
  const { handleCategoriesChange: baseHandleCategoriesChange } =
    useDynamicStudentFetching(setCategories, {
      fetchStudentsByFilters: behavior?.fetchStudentsByFilters,
    });

  const handleCategoriesChange = useCallback(
    async (updatedCategories: CategoryConfig[]) => {
      await baseHandleCategoriesChange(updatedCategories);
    },
    [baseHandleCategoriesChange]
  );

  /**
   * Initialize categories with auto-selection when modal opens
   */
  useEffect(() => {
    if (
      isModalOpen &&
      config.categories.length > 0 &&
      !categoriesInitializedRef.current
    ) {
      const autoSelectedCategories = applyChainedAutoSelection(
        config.categories
      );
      setCategories(autoSelectedCategories);

      // Trigger handleCategoriesChange to fetch students if needed
      // This is important when auto-selection happens (e.g., single school/series/class)
      // Note: previousSelectionsRef will be updated inside handleCategoriesChange
      void handleCategoriesChange(autoSelectedCategories);

      categoriesInitializedRef.current = true;
    }
  }, [
    isModalOpen,
    config.categories,
    applyChainedAutoSelection,
    handleCategoriesChange,
  ]);

  /**
   * Reset initialization flag when modal closes
   */
  useEffect(() => {
    if (!isModalOpen) {
      categoriesInitializedRef.current = false;
    }
  }, [isModalOpen]);

  // Steps padrão se não fornecidos
  const defaultSteps: StepData[] = [
    {
      id: '1',
      label: 'Mensagem',
      state: 'completed',
    },
    {
      id: '2',
      label: labels?.recipientsTitle || 'Destinatários',
      state: 'current',
    },
    {
      id: '3',
      label: labels?.dateLabel || 'Data de envio',
      state: 'pending',
    },
    {
      id: '4',
      label: labels?.previewTitle || 'Prévia',
      state: 'pending',
    },
  ];

  const steps = customSteps || defaultSteps;

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  // Verifica se o step atual é válido
  const isCurrentStepValid = useCallback(() => {
    return isCurrentStepValidValidation(
      currentStep,
      formData,
      categories,
      customSteps
    );
  }, [currentStep, categories, customSteps, formData]);

  // Verifica se pode finalizar
  const canFinish = useCallback(() => {
    return canFinishValidation(formData, categories);
  }, [categories, formData]);

  const handleNext = useCallback(() => {
    const result = handleNextValidation({
      currentStep,
      steps,
      formData,
      categories,
      customSteps,
      completedSteps,
      setCompletedSteps,
      setCurrentStep,
    });

    if (!result.success && result.error) {
      alert(result.error);
    }
  }, [
    currentStep,
    steps,
    categories,
    customSteps,
    completedSteps,
    setCompletedSteps,
    setCurrentStep,
    formData,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleFinish = async () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    const alertData = {
      title: formData.title,
      message: formData.message,
      image: formData.image,
      date: formData.date,
      time: formData.time,
      sendToday: formData.sendToday,
      sendCopyToEmail: formData.sendCopyToEmail,
      recipientCategories: Object.fromEntries(
        Object.entries(formData.recipientCategories).map(([key, c]) => [
          key,
          {
            selectedIds: c.selectedIds || [],
            allSelected: !!c.allSelected,
          },
        ])
      ),
    };

    try {
      if (behavior?.onSendAlert) {
        await behavior.onSendAlert(alertData);
      } else {
        console.log('Dados do formulário:', alertData);
        alert('Aviso enviado com sucesso!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao enviar aviso:', error);
    }
  };

  const dynamicSteps: StepData[] = (steps as StepData[]).map(
    (step, index: number) => {
      if (completedSteps.includes(index)) {
        return { ...step, state: 'completed' as const };
      }

      if (index === currentStep) {
        return { ...step, state: 'current' as const };
      }

      return { ...step, state: 'pending' as const };
    }
  );

  // Memoize step content to prevent re-renders and focus loss
  const currentStepContent = useMemo(() => {
    if (customSteps?.[currentStep]?.component) {
      const CustomComponent = customSteps[currentStep].component;
      return (
        <StepWrapper>
          <CustomComponent onNext={handleNext} onPrevious={handlePrevious} />
        </StepWrapper>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <StepWrapper>
            <MessageStep
              labels={labels}
              allowImageAttachment={behavior?.allowImageAttachment}
            />
          </StepWrapper>
        );
      case 1:
        return (
          <StepWrapper>
            <RecipientsStep
              categories={categories}
              labels={labels}
              onCategoriesChange={handleCategoriesChange}
            />
          </StepWrapper>
        );
      case 2:
        return (
          <StepWrapper>
            <DateStep
              labels={labels}
              allowScheduling={behavior?.allowScheduling}
              allowEmailCopy={behavior?.allowEmailCopy}
            />
          </StepWrapper>
        );
      case 3:
        return (
          <StepWrapper>
            <PreviewStep imageLink={imageLink} defaultImage={defaultImage} />
          </StepWrapper>
        );
      default:
        return null;
    }
  }, [
    currentStep,
    customSteps,
    categories,
    labels,
    behavior,
    handleNext,
    handlePrevious,
    imageLink,
    defaultImage,
  ]); // handleNext e handlePrevious agora estão nas dependências

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title={labels?.modalTitle || 'Enviar aviso'}
      size={'md'}
      contentClassName="p-0"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <div className="flex gap-3">
            <Button variant="link" size="small" onClick={handleCloseModal}>
              {labels?.cancelButton || 'Cancelar'}
            </Button>
            {!isFirstStep && (
              <Button
                variant="outline"
                size="small"
                iconLeft={<CaretLeft />}
                onClick={handlePrevious}
              >
                {labels?.previousButton || 'Anterior'}
              </Button>
            )}
            {isLastStep ? (
              <Button
                variant="solid"
                iconLeft={<PaperPlaneTilt />}
                size="small"
                onClick={handleFinish}
                disabled={!canFinish()}
              >
                {labels?.finishButton || 'Enviar Aviso'}
              </Button>
            ) : (
              <Button
                variant="solid"
                iconRight={<CaretRight />}
                size="small"
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
              >
                {labels?.nextButton || 'Próximo'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-14rem)] max-h-[600px]">
        {/* Stepper fixo no topo */}
        <div className="shrink-0 px-6 pt-4">
          <Stepper
            steps={dynamicSteps}
            size="small"
            showProgress
            responsive
            progressText={`Etapa ${currentStep + 1} de ${steps.length}`}
          />
        </div>

        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {currentStepContent}
        </div>
      </div>
    </Modal>
  );
};
