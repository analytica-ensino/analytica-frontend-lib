import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  Chips,
  CheckboxGroup,
  Radio,
  IconRender,
  getSubjectColorWithOpacity,
  useTheme,
  type CategoryConfig,
} from '../..';

/**
 * Enum for question types
 */
export enum QuestionType {
  ALTERNATIVA = 'ALTERNATIVA',
  MULTIPLA_ESCOLHA = 'MULTIPLA_ESCOLHA',
  DISSERTATIVA = 'DISSERTATIVA',
  VERDADEIRO_FALSO = 'VERDADEIRO_FALSO',
  LIGAR_PONTOS = 'LIGAR_PONTOS',
  PREENCHER = 'PREENCHER',
  IMAGEM = 'IMAGEM',
}

/**
 * Map question types to display labels
 */
const questionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.ALTERNATIVA]: 'Alternativa',
  [QuestionType.VERDADEIRO_FALSO]: 'Verdadeiro ou Falso',
  [QuestionType.DISSERTATIVA]: 'Discursiva',
  [QuestionType.IMAGEM]: 'Imagem',
  [QuestionType.MULTIPLA_ESCOLHA]: 'Múltipla Escolha',
  [QuestionType.LIGAR_PONTOS]: 'Ligar Pontos',
  [QuestionType.PREENCHER]: 'Preencher Lacunas',
};

export interface ActivityFiltersData {
  types: QuestionType[];
  bankIds: string[];
  knowledgeIds: string[];
  topicIds: string[];
  subtopicIds: string[];
  contentIds: string[];
}

/**
 * Bank interface for vestibular banks
 */
export interface Bank {
  examInstitution: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Knowledge Area interface
 */
export interface KnowledgeArea {
  id: string;
  name: string;
  color: string;
  icon?: string;
  [key: string]: unknown;
}

/**
 * Knowledge Item interface for knowledge structure
 */
export interface KnowledgeItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Knowledge Structure State interface
 */
export interface KnowledgeStructureState {
  topics: KnowledgeItem[];
  subtopics: KnowledgeItem[];
  contents: KnowledgeItem[];
  loading: boolean;
  error: string | null;
}

export interface ActivityFiltersProps {
  onFiltersChange: (filters: ActivityFiltersData) => void;
  variant?: 'default' | 'popover';
  // Data
  banks?: Bank[];
  knowledgeAreas?: KnowledgeArea[];
  knowledgeStructure?: KnowledgeStructureState;
  knowledgeCategories?: CategoryConfig[];
  // Loading states
  loadingBanks?: boolean;
  loadingKnowledge?: boolean;
  loadingSubjects?: boolean;
  // Errors
  banksError?: string | null;
  subjectsError?: string | null;
  // Load functions
  loadBanks?: () => void | Promise<void>;
  loadKnowledge?: () => void | Promise<void>;
  loadTopics?: (subjectIds: string[]) => void | Promise<void>;
  loadSubtopics?: (topicIds: string[]) => void | Promise<void>;
  loadContents?: (subtopicIds: string[]) => void | Promise<void>;
  // Handlers
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
  selectedKnowledgeSummary?: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
  enableSummary?: boolean;
}

/**
 * ActivityFilters component for filtering questions
 * Manages question types, banks, subjects, and knowledge structure selections
 */
export const ActivityFilters = ({
  onFiltersChange,
  variant = 'default',
  // Data
  banks = [],
  knowledgeAreas = [],
  knowledgeStructure = {
    topics: [],
    subtopics: [],
    contents: [],
    loading: false,
    error: null,
  },
  knowledgeCategories = [],
  // Loading states
  loadingBanks = false,
  loadingKnowledge = false,
  loadingSubjects = false,
  // Errors
  banksError = null,
  subjectsError = null,
  // Load functions
  loadBanks,
  loadKnowledge,
  loadTopics,
  loadSubtopics: _loadSubtopics,
  loadContents: _loadContents,
  // Handlers
  handleCategoriesChange,
  selectedKnowledgeSummary = {
    topics: [],
    subtopics: [],
    contents: [],
  },
  enableSummary = false,
}: ActivityFiltersProps) => {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<
    QuestionType[]
  >([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Convert single subject to array for compatibility
  const selectedSubjects = useMemo(
    () => (selectedSubject ? [selectedSubject] : []),
    [selectedSubject]
  );

  const { isDark } = useTheme();

  const toggleQuestionType = (questionType: QuestionType) => {
    setSelectedQuestionTypes((prev) =>
      prev.includes(questionType)
        ? prev.filter((type) => type !== questionType)
        : [...prev, questionType]
    );
  };

  const toggleBank = (bankName: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bankName)
        ? prev.filter((name) => name !== bankName)
        : [...prev, bankName]
    );
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId === selectedSubject ? null : subjectId);
  };

  const questionTypes = [
    QuestionType.ALTERNATIVA,
    QuestionType.VERDADEIRO_FALSO,
    QuestionType.DISSERTATIVA,
    QuestionType.IMAGEM,
    QuestionType.MULTIPLA_ESCOLHA,
    QuestionType.LIGAR_PONTOS,
    QuestionType.PREENCHER,
  ];

  // Load banks and knowledge areas on component mount
  useEffect(() => {
    if (loadBanks) {
      loadBanks();
    }
    if (loadKnowledge) {
      loadKnowledge();
    }
  }, [loadBanks, loadKnowledge]);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubject && loadTopics) {
      loadTopics([selectedSubject]);
    }
  }, [selectedSubject, loadTopics]);

  // Extract selected IDs from knowledge categories
  const getSelectedKnowledgeIds = useCallback(() => {
    const temaCategory = knowledgeCategories.find(
      (c: CategoryConfig) => c.key === 'tema'
    );
    const subtemaCategory = knowledgeCategories.find(
      (c: CategoryConfig) => c.key === 'subtema'
    );
    const assuntoCategory = knowledgeCategories.find(
      (c: CategoryConfig) => c.key === 'assunto'
    );

    return {
      topicIds: temaCategory?.selectedIds || [],
      subtopicIds: subtemaCategory?.selectedIds || [],
      contentIds: assuntoCategory?.selectedIds || [],
    };
  }, [knowledgeCategories]);

  // Notify parent component when filters change
  useEffect(() => {
    const knowledgeIds = getSelectedKnowledgeIds();
    const filters: ActivityFiltersData = {
      types: selectedQuestionTypes,
      bankIds: selectedBanks,
      knowledgeIds: selectedSubjects,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };
    onFiltersChange(filters);
  }, [
    selectedQuestionTypes,
    selectedBanks,
    selectedSubjects,
    knowledgeCategories,
    getSelectedKnowledgeIds,
    onFiltersChange,
  ]);

  const containerClassName =
    variant === 'popover' ? 'w-full' : 'w-[400px] flex-shrink-0 p-4';

  const contentClassName = variant === 'popover' ? 'p-4' : '';

  return (
    <div className={containerClassName}>
      {variant === 'default' && (
        <section className="flex flex-row items-center gap-2 text-text-950 mb-4">
          <Text size="lg" weight="bold">
            Filtro de questões
          </Text>
        </section>
      )}

      <div className={contentClassName}>
        <section className="flex flex-col gap-4">
          <div>
            <Text size="sm" weight="bold" className="mb-3 block">
              Tipo de questão
            </Text>
            <div className="grid grid-cols-2 gap-2">
              {questionTypes.map((questionType) => (
                <Chips
                  key={questionType}
                  selected={selectedQuestionTypes.includes(questionType)}
                  onClick={() => toggleQuestionType(questionType)}
                >
                  {questionTypeLabels[questionType]}
                </Chips>
              ))}
            </div>
          </div>

          <div>
            <Text size="sm" weight="bold" className="mb-3 block">
              Banca de vestibular
            </Text>
            {loadingBanks ? (
              <Text size="sm" className="text-text-600">
                Carregando bancas...
              </Text>
            ) : banksError ? (
              <Text size="sm" className="text-text-600">
                {banksError}
              </Text>
            ) : banks.length === 0 ? (
              <Text size="sm" className="text-text-600">
                Nenhuma banca encontrada
              </Text>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {banks.map((bank: Bank) => (
                  <Chips
                    key={bank.examInstitution}
                    selected={selectedBanks.includes(bank.examInstitution)}
                    onClick={() => toggleBank(bank.examInstitution)}
                  >
                    {bank.examInstitution}
                  </Chips>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-row justify-between items-center mb-3">
              <Text size="sm" weight="bold">
                Matéria
              </Text>
            </div>

            {loadingSubjects ? (
              <Text size="sm" className="text-text-600">
                Carregando matérias...
              </Text>
            ) : subjectsError ? (
              <Text size="sm" className="text-text-600">
                {subjectsError}
              </Text>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {knowledgeAreas.map((area: KnowledgeArea) => (
                  <Radio
                    key={area.id}
                    value={area.id}
                    checked={selectedSubject === area.id}
                    onChange={() => handleSubjectChange(area.id)}
                    label={
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <span
                          className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
                          style={{
                            backgroundColor: getSubjectColorWithOpacity(
                              area.color,
                              isDark
                            ),
                          }}
                        >
                          <IconRender
                            iconName={area.icon || 'BookOpen'}
                            size={14}
                            color="currentColor"
                          />
                        </span>
                        <span className="truncate flex-1">{area.name}</span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Knowledge Structure CheckboxGroup */}
          {selectedSubject && (
            <div className="mt-4">
              <Text size="sm" weight="bold" className="mb-3 block">
                Tema, Subtema e Assunto
              </Text>
              {loadingKnowledge && (
                <Text size="sm" className="text-text-600 mb-3">
                  Carregando estrutura de conhecimento...
                </Text>
              )}
              {knowledgeStructure.error && (
                <Text size="sm" className="mb-3 text-error-500">
                  {knowledgeStructure.error}
                </Text>
              )}
              {knowledgeCategories.length > 0 && handleCategoriesChange && (
                <CheckboxGroup
                  categories={knowledgeCategories}
                  onCategoriesChange={handleCategoriesChange}
                />
              )}
              {!loadingKnowledge &&
                knowledgeCategories.length === 0 &&
                knowledgeStructure.topics.length === 0 && (
                  <Text size="sm" className="text-text-600">
                    Nenhum tema disponível para as matérias selecionadas
                  </Text>
                )}

              {/* Summary of selected items */}
              {enableSummary && (
                <div className="mt-4 p-3 bg-background-50 rounded-lg border border-border-200">
                  <Text size="sm" weight="bold" className="mb-2 block">
                    Resumo da seleção
                  </Text>
                  <div className="flex flex-col gap-2">
                    {knowledgeStructure.topics.length === 1 && (
                      <div>
                        <Text
                          size="xs"
                          weight="medium"
                          className="text-text-600"
                        >
                          Tema:
                        </Text>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedKnowledgeSummary.topics.map(
                            (topic: string) => (
                              <Chips key={topic} selected>
                                {topic}
                              </Chips>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {knowledgeStructure.subtopics.length === 1 && (
                      <div>
                        <Text
                          size="xs"
                          weight="medium"
                          className="text-text-600"
                        >
                          Subtema:
                        </Text>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedKnowledgeSummary.subtopics.map(
                            (subtopic: string) => (
                              <Chips key={subtopic} selected>
                                {subtopic}
                              </Chips>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {knowledgeStructure.contents.length === 1 && (
                      <div>
                        <Text
                          size="xs"
                          weight="medium"
                          className="text-text-600"
                        >
                          Assunto:
                        </Text>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedKnowledgeSummary.contents.map((content) => (
                            <Chips key={content} selected>
                              {content}
                            </Chips>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
