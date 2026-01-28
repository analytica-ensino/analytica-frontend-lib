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
import { calculateFormattedItemsForAutoSelection } from '../CheckBoxGroup/CheckBoxGroup.helpers';

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

  // Refs to track previous selections and prevent unnecessary API calls
  const previousSelectionsRef = useRef<{
    schoolIds: string[];
    schoolYearIds: string[];
    classIds: string[];
  }>({
    schoolIds: [],
    schoolYearIds: [],
    classIds: [],
  });

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
   * Apply the same "single visible option" auto-selection behavior that the CheckboxGroup
   * applies internally, but during initialization.
   *
   * This fixes the scenario where the first category (e.g. Escola) is rendered in compact
   * mode (single item) and therefore has no UI affordance to manually select it, leaving
   * dependent categories disabled.
   */
  const applyChainedAutoSelection = useCallback(
    (categories: CategoryConfig[]): CategoryConfig[] => {
      let current = categories;
      let safety = 0;
      let changed = true;

      while (changed && safety < categories.length + 2) {
        safety += 1;
        changed = false;

        const next = current.map((category) => {
          const filteredItems = calculateFormattedItemsForAutoSelection(
            category,
            current
          );

          const hasNoSelection =
            !category.selectedIds || category.selectedIds.length === 0;

          if (filteredItems.length === 1 && hasNoSelection) {
            changed = true;
            return { ...category, selectedIds: [filteredItems[0].id] };
          }

          return category;
        });

        current = next;
      }

      return current;
    },
    []
  );

  /**
   * Track if categories have been initialized for this modal session
   */
  const categoriesInitializedRef = useRef(false);

  const { labels, behavior, steps: customSteps } = config;

  /**
   * Handle categories change and fetch students dynamically if fetchStudentsByFilters is provided
   */
  const handleCategoriesChange = useCallback(
    async (updatedCategories: CategoryConfig[]) => {
      // If fetchStudentsByFilters is not provided, just update categories
      if (!behavior?.fetchStudentsByFilters) {
        setCategories(updatedCategories);
        return;
      }

      // Find selected schools, schoolYears, and classes BEFORE updating state
      const escolaCategory = updatedCategories.find((c) => c.key === 'escola');
      const serieCategory = updatedCategories.find((c) => c.key === 'serie');
      const turmaCategory = updatedCategories.find((c) => c.key === 'turma');
      const studentsCategory = updatedCategories.find(
        (c) => c.key === 'students'
      );

      const selectedSchoolIds = escolaCategory?.selectedIds || [];
      const selectedSchoolYearIds = serieCategory?.selectedIds || [];
      const selectedClassIds = turmaCategory?.selectedIds || [];

      // Check if school, series, or class selections actually changed
      const previousSelections = previousSelectionsRef.current;

      // If previous selections are empty (initial state), consider it a change
      const isInitialState =
        previousSelections.schoolIds.length === 0 &&
        previousSelections.schoolYearIds.length === 0 &&
        previousSelections.classIds.length === 0;

      const schoolIdsChanged =
        isInitialState ||
        previousSelections.schoolIds.length !== selectedSchoolIds.length ||
        previousSelections.schoolIds.some(
          (id) => !selectedSchoolIds.includes(id)
        ) ||
        selectedSchoolIds.some(
          (id) => !previousSelections.schoolIds.includes(id)
        );

      const schoolYearIdsChanged =
        isInitialState ||
        previousSelections.schoolYearIds.length !==
          selectedSchoolYearIds.length ||
        previousSelections.schoolYearIds.some(
          (id) => !selectedSchoolYearIds.includes(id)
        ) ||
        selectedSchoolYearIds.some(
          (id) => !previousSelections.schoolYearIds.includes(id)
        );

      const classIdsChanged =
        isInitialState ||
        previousSelections.classIds.length !== selectedClassIds.length ||
        previousSelections.classIds.some(
          (id) => !selectedClassIds.includes(id)
        ) ||
        selectedClassIds.some(
          (id) => !previousSelections.classIds.includes(id)
        );

      const shouldFetchStudents =
        schoolIdsChanged || schoolYearIdsChanged || classIdsChanged;

      // Update previous selections
      previousSelectionsRef.current = {
        schoolIds: [...selectedSchoolIds],
        schoolYearIds: [...selectedSchoolYearIds],
        classIds: [...selectedClassIds],
      };

      // Only fetch students if school/series/class selections changed
      if (
        shouldFetchStudents &&
        selectedClassIds.length > 0 &&
        studentsCategory
      ) {
        try {
          const students = await behavior.fetchStudentsByFilters({
            schoolIds:
              selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
            schoolYearIds:
              selectedSchoolYearIds.length > 0
                ? selectedSchoolYearIds
                : undefined,
            classIds:
              selectedClassIds.length > 0 ? selectedClassIds : undefined,
          });

          // Transform students to items format with nested data
          // Use userInstitutionId + classId as unique ID to allow same user in different classes
          const studentItems = students.map((s) => ({
            id: `${s.userInstitutionId}-${s.class.id}`, // Unique ID combining userInstitutionId and classId
            name: s.name,
            classId: String(s.class.id),
            schoolId: String(s.school.id),
            schoolYearId: String(s.schoolYear.id),
            studentId: s.id,
            userInstitutionId: s.userInstitutionId,
            // Include nested data for filtering (matching filteredBy in category config)
            // These fields must match the IDs in the parent categories' selectedIds (as strings)
            escolaId: String(s.school.id),
            serieId: String(s.schoolYear.id),
            turmaId: String(s.class.id),
          }));

          // Update students category with fetched students
          // Preserve all other categories exactly as they are (including selectedIds)
          const finalCategories = updatedCategories.map((cat) =>
            cat.key === 'students' ? { ...cat, itens: studentItems } : cat
          );

          setCategories(finalCategories);
        } catch (error) {
          console.error('Error fetching students:', error);
          // On error, clear students but keep all other categories unchanged
          const finalCategories = updatedCategories.map((cat) =>
            cat.key === 'students' ? { ...cat, itens: [] } : cat
          );
          setCategories(finalCategories);
        }
      } else if (shouldFetchStudents && studentsCategory) {
        // If no classes selected after a change, clear students but keep all other categories
        const finalCategories = updatedCategories.map((cat) =>
          cat.key === 'students' ? { ...cat, itens: [] } : cat
        );
        setCategories(finalCategories);
      } else {
        // No relevant changes (only student selections changed), just update categories as-is
        setCategories(updatedCategories);
      }
    },
    [behavior]
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
