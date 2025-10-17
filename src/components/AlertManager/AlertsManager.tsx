import { useState, useEffect } from 'react';
import { Button, Modal, Stepper } from '../..';
import { CaretLeft, CaretRight, PaperPlaneTilt } from 'phosphor-react';
import { StepData } from '../Stepper/Stepper';
import { useAlertFormStore } from './useAlertForm';
import type { AlertsConfig } from '.';
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

interface AlertsManagerProps {
  config: AlertsConfig;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AlertsManager = ({
  config,
  isOpen = false,
  onClose,
}: AlertsManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [categories, setCategories] = useState(config.categories);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Força re-renderização quando o estado do formulário muda
  useEffect(() => {
    const unsubscribe = useAlertFormStore.subscribe((_state) => {
      setForceUpdate((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Sincroniza com a prop isOpen
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const { labels, behavior, steps: customSteps } = config;

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
  const isCurrentStepValid = () => {
    // Usa forceUpdate para garantir que o estado está atualizado
    const _ = forceUpdate;
    const formData = useAlertFormStore.getState();
    return isCurrentStepValidValidation(
      currentStep,
      formData,
      categories,
      customSteps
    );
  };

  // Verifica se pode finalizar
  const canFinish = () => {
    // Usa forceUpdate para garantir que o estado está atualizado
    const _ = forceUpdate;
    const formData = useAlertFormStore.getState();
    return canFinishValidation(formData, categories);
  };

  const handleNext = () => {
    const formData = useAlertFormStore.getState();
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
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    const formData = useAlertFormStore.getState();
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

  const renderCurrentStep = () => {
    if (customSteps?.[currentStep]?.component) {
      const CustomComponent = customSteps[currentStep].component;
      return (
        <CustomComponent onNext={handleNext} onPrevious={handlePrevious} />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <MessageStep
            labels={labels}
            allowImageAttachment={behavior?.allowImageAttachment}
          />
        );
      case 1:
        return (
          <RecipientsStep
            categories={categories}
            labels={labels}
            onCategoriesChange={setCategories}
          />
        );
      case 2:
        return (
          <DateStep
            labels={labels}
            allowScheduling={behavior?.allowScheduling}
            allowEmailCopy={behavior?.allowEmailCopy}
          />
        );
      case 3:
        return <PreviewStep />;
      default:
        return null;
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title={labels?.modalTitle || 'Enviar aviso'}
      size={'md'}
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
      <div className="flex flex-col gap-4">
        <Stepper
          steps={dynamicSteps}
          size="small"
          showProgress
          responsive
          progressText={`Etapa ${currentStep + 1} de ${steps.length}`}
        />
        {renderCurrentStep()}
      </div>
    </Modal>
  );
};
