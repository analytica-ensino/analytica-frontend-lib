import { useState, useEffect } from 'react';
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
  const [categories, setCategories] = useState(config.categories);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Força re-renderização quando o estado do formulário muda
  useEffect(() => {
    const unsubscribe = useAlertFormStore.subscribe((_state) => {
      // Força uma re-renderização para atualizar a validação
      setForceUpdate((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    useAlertFormStore.getState().resetForm();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Funções de validação para cada step
  const validateMessageStep = (formData: {
    title?: string;
    message?: string;
  }) => {
    if (!formData.title?.trim()) {
      return 'Título é obrigatório';
    }
    if (!formData.message?.trim()) {
      return 'Mensagem é obrigatória';
    }
    return true;
  };

  const validateRecipientsStep = (_formData: unknown) => {
    // Verifica se há pelo menos um item selecionado no ÚLTIMO grupo de categorias
    if (categories.length === 0) {
      return 'Nenhuma categoria de destinatários configurada';
    }

    const lastCategory = categories[categories.length - 1];
    const hasSelectedInLastCategory =
      lastCategory.selectedIds && lastCategory.selectedIds.length > 0;

    if (!hasSelectedInLastCategory) {
      return `Selecione pelo menos um ${lastCategory.label?.toLowerCase() || 'destinatário'} no último grupo`;
    }
    return true;
  };

  const validateDateStep = (formData: {
    sendToday?: boolean;
    date?: string;
  }) => {
    // Se não está enviando hoje, precisa de data
    if (!formData.sendToday && !formData.date) {
      return 'Data é obrigatória quando não está enviando hoje';
    }
    return true;
  };

  // Verifica se o step atual é válido
  const isCurrentStepValid = () => {
    // Usa forceUpdate para garantir que o estado está atualizado
    const _ = forceUpdate;
    const formData = useAlertFormStore.getState();

    switch (currentStep) {
      case 0: {
        // MessageStep
        return validateMessageStep(formData) === true;
      }
      case 1: {
        // RecipientsStep
        return validateRecipientsStep(formData) === true;
      }
      case 2: {
        // DateStep
        return validateDateStep(formData) === true;
      }
      case 3: {
        // PreviewStep
        return true;
      }
      default: {
        const currentStepConfig = customSteps?.[currentStep];
        if (currentStepConfig?.validate) {
          return currentStepConfig.validate(formData) === true;
        }
        return true;
      }
    }
  };

  // Verifica se pode finalizar (todos os steps obrigatórios estão completos)
  const canFinish = () => {
    // Usa forceUpdate para garantir que o estado está atualizado
    const _ = forceUpdate;
    const formData = useAlertFormStore.getState();

    // Valida todos os steps obrigatórios
    return (
      validateMessageStep(formData) === true &&
      validateRecipientsStep(formData) === true &&
      validateDateStep(formData) === true
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const formData = useAlertFormStore.getState();
      let validation: boolean | string = true;

      // Validação específica por step
      switch (currentStep) {
        case 0: {
          // MessageStep
          validation = validateMessageStep(formData);
          break;
        }
        case 1: {
          // RecipientsStep
          validation = validateRecipientsStep(formData);
          break;
        }
        case 2: {
          // DateStep
          validation = validateDateStep(formData);
          break;
        }
        case 3: {
          // PreviewStep - sempre pode avançar
          validation = true;
          break;
        }
        default: {
          // Validação customizada se existir
          const currentStepConfig = customSteps?.[currentStep];
          if (currentStepConfig?.validate) {
            validation = currentStepConfig.validate(formData);
          }
          break;
        }
      }

      if (validation !== true) {
        // Mostra erro
        console.error('Validação falhou:', validation);
        alert(
          typeof validation === 'string'
            ? validation
            : 'Preencha todos os campos obrigatórios'
        );
        return;
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
      sendCopyToEmail: formData.sendCopyToEmail,
      recipientCategories: Object.fromEntries(
        categories.map((cat) => [
          cat.key,
          {
            selectedIds: cat.selectedIds || [],
            allSelected:
              (cat.selectedIds?.length || 0) === (cat.itens?.length || 0),
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
    </>
  );
};
