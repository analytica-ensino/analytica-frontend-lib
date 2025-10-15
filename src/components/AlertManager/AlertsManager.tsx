import { useState } from 'react';
import {
  Button,
  Table,
  Text,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Modal,
  Stepper,
} from '../..';
import { CaretLeft, CaretRight, PaperPlaneTilt, Trash } from 'phosphor-react';
import { StepData } from '../Stepper/Stepper';
import { useAlertFormStore } from './useAlertForm';
import type { AlertsConfig, AlertTableItem } from '.';
import {
  MessageStep,
  RecipientsStep,
  DateStep,
  PreviewStep,
} from './AlertSteps';

interface AlertsManagerProps {
  config: AlertsConfig;
}

export const AlertsManager = ({ config }: AlertsManagerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<AlertTableItem[]>([]);

  const { categories, labels, behavior, steps: customSteps } = config;

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    useAlertFormStore.getState().resetForm();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Valida antes de avançar (se tiver validação customizada)
      const currentStepConfig = customSteps?.[currentStep];
      if (currentStepConfig?.validate) {
        const formData = useAlertFormStore.getState();
        const validation = currentStepConfig.validate(formData);

        if (validation === false || typeof validation === 'string') {
          // Mostra erro (você pode implementar um toast aqui)
          console.error('Validação falhou:', validation);
          return;
        }
      }

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
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
      recipientCategories: Object.fromEntries(
        Object.entries(formData.recipientCategories).map(([key, cat]) => [
          key,
          {
            selectedIds: cat.selectedIds,
            allSelected: cat.allSelected,
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

      // Recarrega avisos se houver callback
      if (behavior?.onLoadAlerts) {
        const loadedAlerts = await behavior.onLoadAlerts();
        setAlerts(loadedAlerts);
      }
    } catch (error) {
      console.error('Erro ao enviar aviso:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      if (behavior?.onDeleteAlert) {
        await behavior.onDeleteAlert(alertId);

        // Recarrega avisos
        if (behavior?.onLoadAlerts) {
          const loadedAlerts = await behavior.onLoadAlerts();
          setAlerts(loadedAlerts);
        }
      } else {
        console.log('Deletar aviso:', alertId);
      }
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
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
    // Se tem componente customizado, usa ele
    if (customSteps?.[currentStep]?.component) {
      const CustomComponent = customSteps[currentStep].component!;
      return (
        <CustomComponent onNext={handleNext} onPrevious={handlePrevious} />
      );
    }

    // Caso contrário, usa os steps padrão
    switch (currentStep) {
      case 0:
        return (
          <MessageStep
            labels={labels}
            allowImageAttachment={behavior?.allowImageAttachment}
          />
        );
      case 1:
        return <RecipientsStep categories={categories} labels={labels} />;
      case 2:
        return (
          <DateStep
            labels={labels}
            allowScheduling={behavior?.allowScheduling}
            allowEmailCopy={behavior?.allowEmailCopy}
          />
        );
      case 3:
        return <PreviewStep labels={labels} />;
      default:
        return null;
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      <div className="bg-background rounded-xl p-4 gap-2 flex flex-col items-center justify-center">
        <div className="flex flex-row justify-between items-center w-full">
          <Text size="sm" weight="medium">
            {labels?.pageTitle || 'Avisos'}
          </Text>

          <Button size="extra-small" onClick={handleOpenModal}>
            {labels?.sendButton || 'Enviar aviso'}
          </Button>
        </div>

        {behavior?.showAlertsTable !== false && (
          <Table variant="borderless" className="table-fixed">
            <TableHeader>
              <TableRow variant="borderless">
                <TableHead className="py-2 px-3.5 text-start">Titulo</TableHead>
                <TableHead className="py-2 px-3.5 w-[120px] text-center">
                  Enviado em
                </TableHead>
                <TableHead className="py-2 px-3.5 w-[32px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="py-2 px-3.5 text-start truncate">
                    {alert.title}
                  </TableCell>
                  <TableCell className="py-2 px-3.5 text-center">
                    {alert.sentAt}
                  </TableCell>
                  <TableCell className="py-2 px-3.5 text-center">
                    <button onClick={() => handleDeleteAlert(alert.id)}>
                      <Trash />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={labels?.modalTitle || 'Enviar aviso'}
        size={'lg'}
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
                >
                  {labels?.finishButton || 'Enviar Aviso'}
                </Button>
              ) : (
                <Button
                  variant="solid"
                  iconRight={<CaretRight />}
                  size="small"
                  onClick={handleNext}
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
            size="medium"
            showProgress
            responsive
            progressText={`Etapa ${currentStep + 1} de ${steps.length}`}
          />
          {renderCurrentStep()}
        </div>
      </Modal>
    </>
  );
};
