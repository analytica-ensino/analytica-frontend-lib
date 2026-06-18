import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import type { SearchSelectOption } from '../SearchSelect/SearchSelect';
import { ComparatorEmptyState } from './ComparatorEmptyState';
import { ComparatorLoadingState } from './ComparatorLoadingState';
import { ComparatorSelectTypeStep } from './ComparatorSelectTypeStep';
import { ComparatorSelectItemsStep } from './ComparatorSelectItemsStep';
import { ComparatorTabContent } from './ComparatorTabContent';
import {
  ComparatorTabValue,
  DEFAULT_COMPARATOR_LABELS,
  DEFAULT_COMPARATOR_TABS,
  type ComparisonType,
  type ComparatorTabType,
  type ComparatorStoreState,
  type UseComparatorReturn,
  type ComparatorLabels,
  type ComparatorTab,
} from '../../types/comparator';

export interface ComparatorViewProps {
  // Data sources
  readonly schools: SearchSelectOption[];
  readonly schoolYears: SearchSelectOption[];

  // Store hooks (injected)
  readonly useComparatorStore: () => ComparatorStoreState;
  readonly useComparator: () => UseComparatorReturn;

  // Navigation
  readonly onBack?: () => void;

  // Tab management
  readonly activeTab?: ComparatorTabType;
  readonly onTabChange?: (tab: ComparatorTabType) => void;
  readonly tabs?: ComparatorTab[];

  // Customization
  readonly labels?: Partial<ComparatorLabels>;
  readonly isUserLoading?: boolean;

  // Callbacks
  readonly onFetchUserData?: (force?: boolean) => void;
}

export function ComparatorView({
  schools,
  schoolYears,
  useComparatorStore,
  useComparator,
  onBack,
  activeTab: externalActiveTab,
  onTabChange,
  tabs = DEFAULT_COMPARATOR_TABS,
  labels: customLabels,
  isUserLoading = false,
  onFetchUserData,
}: ComparatorViewProps) {
  const labels = useMemo(
    () => ({ ...DEFAULT_COMPARATOR_LABELS, ...customLabels }),
    [customLabels]
  );

  // Store state
  const {
    comparisonType,
    selectedItems,
    setComparisonType,
    addItem,
    removeItem,
    clearSelection,
  } = useComparatorStore();

  // Data hook
  const { data, loading, fetchData } = useComparator();

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [internalActiveTab, setInternalActiveTab] = useState<ComparatorTabType>(
    ComparatorTabValue.KNOWLEDGE_AREAS
  );
  const hasInitializedRef = useRef(false);

  // Use external tab if provided, otherwise internal
  const activeTab = externalActiveTab ?? internalActiveTab;

  // Determine comparison availability
  const canCompareSchools = schools.length > 1;
  const canCompareSchoolYears = schoolYears.length > 1;
  const hasAnyComparisonOption = canCompareSchools || canCompareSchoolYears;

  // Fetch user data on mount
  useEffect(() => {
    onFetchUserData?.(true);
  }, [onFetchUserData]);

  // Load comparison data on mount if there are persisted selections
  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (selectedItems.length > 0 && comparisonType) {
      hasInitializedRef.current = true;
      fetchData(
        selectedItems.map((i) => i.id),
        comparisonType,
        activeTab
      );
    }
  }, [selectedItems, comparisonType, activeTab, fetchData]);

  // Options based on comparison type
  const options = useMemo((): SearchSelectOption[] => {
    if (comparisonType === 'school') return schools;
    if (comparisonType === 'schoolYear') return schoolYears;
    return [];
  }, [comparisonType, schools, schoolYears]);

  // Filter out already selected items
  const availableOptions = useMemo(() => {
    return options.filter(
      (opt) => !selectedItems.some((item) => item.id === opt.value)
    );
  }, [options, selectedItems]);

  // Handlers
  const handleTabChange = useCallback(
    (tab: ComparatorTabType) => {
      if (onTabChange) {
        onTabChange(tab);
      } else {
        setInternalActiveTab(tab);
      }

      if (selectedItems.length > 0 && comparisonType) {
        fetchData(
          selectedItems.map((i) => i.id),
          comparisonType,
          tab
        );
      }
    },
    [selectedItems, comparisonType, onTabChange, fetchData]
  );

  const handleOpenModal = useCallback(() => {
    if (comparisonType) {
      setModalStep(2);
      setIsModalOpen(true);
      return;
    }

    if (canCompareSchools && !canCompareSchoolYears) {
      setComparisonType('school');
      setModalStep(2);
    } else if (canCompareSchoolYears && !canCompareSchools) {
      setComparisonType('schoolYear');
      setModalStep(2);
    } else {
      setModalStep(1);
    }
    setIsModalOpen(true);
  }, [
    comparisonType,
    canCompareSchools,
    canCompareSchoolYears,
    setComparisonType,
  ]);

  const handleSelectType = useCallback(
    (type: ComparisonType) => {
      clearSelection();
      setComparisonType(type);
      setModalStep(2);
    },
    [clearSelection, setComparisonType]
  );

  const handleSelectItem = useCallback(
    (value: string) => {
      if (selectedItems.length >= 5) return;

      const option = options.find((opt) => opt.value === value);
      if (!option) return;

      addItem({
        id: option.value,
        name: option.label,
        color: '',
      });
    },
    [options, selectedItems.length, addItem]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      removeItem(itemId);
    },
    [removeItem]
  );

  const handleConfirmSelection = useCallback(() => {
    setIsModalOpen(false);
    if (selectedItems.length > 0 && comparisonType) {
      fetchData(
        selectedItems.map((i) => i.id),
        comparisonType,
        activeTab
      );
    }
  }, [selectedItems, comparisonType, activeTab, fetchData]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleChangeType = useCallback(() => {
    setModalStep(1);
    clearSelection();
  }, [clearSelection]);

  // Get button text
  const buttonText = useMemo(() => {
    if (selectedItems.length > 0) {
      return comparisonType === 'school'
        ? labels.selectSchools
        : labels.selectSchoolYears;
    }
    if (canCompareSchools && canCompareSchoolYears) {
      return labels.selectComparison;
    }
    return canCompareSchools ? labels.selectSchools : labels.selectSchoolYears;
  }, [
    selectedItems.length,
    comparisonType,
    canCompareSchools,
    canCompareSchoolYears,
    labels,
  ]);

  const renderMainContent = () => {
    if (selectedItems.length === 0) {
      return (
        <ComparatorEmptyState
          onSelectClick={handleOpenModal}
          canCompareSchools={canCompareSchools}
          canCompareSchoolYears={canCompareSchoolYears}
          isLoading={isUserLoading}
          labels={labels}
        />
      );
    }

    if (loading) {
      return <ComparatorLoadingState />;
    }

    return (
      <ComparatorTabContent
        activeTab={activeTab}
        data={data}
        selectedItems={selectedItems}
        labels={labels}
      />
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-100 bg-secondary-50">
        {onBack ? (
          <Button
            variant="raw"
            onClick={onBack}
            className="flex items-center gap-2 text-text-950 hover:text-text-700 transition-colors"
          >
            <CaretLeftIcon size={20} weight="bold" />
            <Text size="lg" weight="semibold">
              {labels.title}
            </Text>
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-text-950">
            <Text size="lg" weight="semibold">
              {labels.title}
            </Text>
          </div>
        )}
        <Button
          variant="solid"
          action="primary"
          size="medium"
          onClick={handleOpenModal}
          disabled={!hasAnyComparisonOption || isUserLoading}
        >
          {buttonText}
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 px-6 py-4 border-b border-border-100 bg-secondary-50">
        {tabs.map((tab) => (
          <Button
            variant="raw"
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'text-primary-700 border-b-2 border-primary-600'
                : 'text-text-500 hover:text-text-700'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">{renderMainContent()}</main>

      {/* Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={labels.filters}
        size="md"
        footer={
          modalStep === 2 ? (
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={handleChangeType}>
                {labels.back}
              </Button>
              <Button
                variant="solid"
                action="primary"
                onClick={handleConfirmSelection}
                disabled={selectedItems.length === 0}
              >
                {labels.confirm} ({selectedItems.length}/5)
              </Button>
            </div>
          ) : undefined
        }
      >
        {modalStep === 1 ? (
          <ComparatorSelectTypeStep
            onSelectType={handleSelectType}
            canCompareSchools={canCompareSchools}
            canCompareSchoolYears={canCompareSchoolYears}
            labels={labels}
          />
        ) : (
          <ComparatorSelectItemsStep
            options={availableOptions}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onRemoveItem={handleRemoveItem}
            comparisonType={comparisonType!}
            labels={labels}
          />
        )}
      </Modal>
    </div>
  );
}
