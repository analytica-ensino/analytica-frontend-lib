import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  PencilSimple,
  Paperclip,
  X,
  Star,
  Medal,
  WarningCircle,
} from 'phosphor-react';
import type { Icon } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import Radio from '../Radio/Radio';
import TextArea from '../TextArea/TextArea';
import { CardAccordation, AccordionGroup } from '../Accordation';
import { generateFileId } from '../FileAttachment/FileAttachment';
import type { AttachedFile } from '../FileAttachment/FileAttachment';
import { cn } from '../../utils/utils';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import {
  type StudentActivityCorrectionData,
  type SaveQuestionCorrectionPayload,
  getQuestionStatusBadgeConfig,
  getQuestionStatusFromData,
} from '../../utils/studentActivityCorrection';
import {
  renderQuestionAlternative,
  renderQuestionMultipleChoice,
  renderQuestionTrueOrFalse,
  renderQuestionDissertative,
  renderQuestionFill,
  renderQuestionImage,
  renderQuestionConnectDots,
} from '../../utils/questionRenderer/index';

/**
 * Props for the CorrectActivityModal component
 */
export interface CorrectActivityModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Student activity correction data */
  data: StudentActivityCorrectionData | null;
  /** Whether the modal is in view-only mode */
  isViewOnly?: boolean;
  /** Callback when observation is submitted with optional files */
  onObservationSubmit?: (
    studentId: string,
    observation: string,
    files: File[]
  ) => void;
  /** Callback when question correction is saved (for essay questions) */
  onQuestionCorrectionSubmit?: (
    studentId: string,
    payload: SaveQuestionCorrectionPayload
  ) => Promise<void>;
}

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  variant: 'score' | 'correct' | 'incorrect';
}

/**
 * Configuration for each stat card variant
 */
const variantConfig: Record<
  StatCardProps['variant'],
  {
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
    IconComponent: Icon;
  }
> = {
  score: {
    bg: 'bg-warning-background',
    text: 'text-warning-600',
    iconBg: 'bg-warning-300',
    iconColor: 'text-white',
    IconComponent: Star,
  },
  correct: {
    bg: 'bg-success-200',
    text: 'text-success-700',
    iconBg: 'bg-indicator-positive',
    iconColor: 'text-text-950',
    IconComponent: Medal,
  },
  incorrect: {
    bg: 'bg-error-100',
    text: 'text-error-700',
    iconBg: 'bg-indicator-negative',
    iconColor: 'text-white',
    IconComponent: WarningCircle,
  },
};

/**
 * Stat card component for displaying statistics with icon
 * @param props - Component props
 * @returns JSX element
 */
const StatCard = ({ label, value, variant }: StatCardProps) => {
  const config = variantConfig[variant];
  const IconComponent = config.IconComponent;

  return (
    <div
      className={cn(
        'border border-border-50 rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1',
        config.bg
      )}
    >
      <div
        className={cn(
          'w-[30px] h-[30px] rounded-2xl flex items-center justify-center',
          config.iconBg
        )}
      >
        <IconComponent
          size={16}
          className={config.iconColor}
          weight="regular"
        />
      </div>
      <Text
        className={cn('text-2xs font-bold uppercase text-center', config.text)}
      >
        {label}
      </Text>
      <Text className={cn('text-xl font-bold', config.text)}>{value}</Text>
    </div>
  );
};

/**
 * Modal component for correcting or viewing student activity details
 *
 * Displays student information, statistics cards, observation section,
 * and a list of questions with their status.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <CorrectActivityModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   data={studentData}
 *   isViewOnly={false}
 *   onObservationSubmit={(obs, files) => console.log(obs, files)}
 * />
 * ```
 */
const CorrectActivityModal = ({
  isOpen,
  onClose,
  data,
  isViewOnly = false,
  onObservationSubmit,
  onQuestionCorrectionSubmit,
}: CorrectActivityModalProps) => {
  const [observation, setObservation] = useState('');
  const [isObservationExpanded, setIsObservationExpanded] = useState(false);
  const [isObservationSaved, setIsObservationSaved] = useState(false);
  const [savedObservation, setSavedObservation] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [savedFiles, setSavedFiles] = useState<AttachedFile[]>([]);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for essay question corrections
  const [essayCorrections, setEssayCorrections] = useState<
    Record<
      number,
      {
        isCorrect: boolean | null;
        teacherFeedback: string;
        isSaving: boolean;
      }
    >
  >({});

  /**
   * Reset state when modal opens or student changes
   * Load existing observation and attachment if available
   */
  useEffect(() => {
    if (isOpen) {
      setObservation('');
      setIsObservationExpanded(false);
      setAttachedFiles([]);
      setSavedFiles([]);
      setExistingAttachment(data?.attachment ?? null);

      // Load existing observation/attachment if available
      if (data?.observation || data?.attachment) {
        setIsObservationSaved(true);
        setSavedObservation(data.observation || '');
      } else {
        setIsObservationSaved(false);
        setSavedObservation('');
      }

      // Initialize essay corrections from data
      const initialCorrections: Record<
        number,
        {
          isCorrect: boolean | null;
          teacherFeedback: string;
          isSaving: boolean;
        }
      > = {};
      data?.questions?.forEach((questionData) => {
        if (questionData.question.questionType === QUESTION_TYPE.DISSERTATIVA) {
          initialCorrections[questionData.questionNumber] = {
            isCorrect: questionData.correction?.isCorrect ?? null,
            teacherFeedback: questionData.correction?.teacherFeedback || '',
            isSaving: false,
          };
        }
      });
      setEssayCorrections(initialCorrections);
    }
  }, [
    isOpen,
    data?.studentId,
    data?.observation,
    data?.attachment,
    data?.questions,
  ]);

  /**
   * Handle opening observation section
   */
  const handleOpenObservation = () => {
    setIsObservationExpanded(true);
  };

  /**
   * Handle adding files (single file mode - replaces existing file)
   * @param files - Files to add
   */
  const handleFilesAdd = (files: File[]) => {
    const newFile = files[0];
    if (newFile) {
      setAttachedFiles([{ file: newFile, id: generateFileId() }]);
    }
  };

  /**
   * Handle removing a file
   * @param id - File ID to remove
   */
  const handleFileRemove = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  /**
   * Handle saving observation
   */
  const handleSaveObservation = () => {
    if (observation.trim() || attachedFiles.length > 0 || existingAttachment) {
      // Validate studentId before saving to prevent silent no-op
      if (!data?.studentId) {
        return;
      }

      setSavedObservation(observation);
      setSavedFiles([...attachedFiles]);
      setIsObservationSaved(true);
      setIsObservationExpanded(false);

      // Pass studentId explicitly from data prop to avoid stale closure issues
      onObservationSubmit?.(
        data.studentId,
        observation,
        attachedFiles.map((f) => f.file)
      );
    }
  };

  /**
   * Handle editing observation
   */
  const handleEditObservation = () => {
    setObservation(savedObservation);
    setAttachedFiles([...savedFiles]);
    setIsObservationSaved(false);
    setIsObservationExpanded(true);
  };

  /**
   * Handle saving essay question correction
   */
  const handleSaveEssayCorrection = useCallback(
    async (questionNumber: number) => {
      if (!data?.studentId || !onQuestionCorrectionSubmit) return;

      const correction = essayCorrections[questionNumber];
      if (correction?.isCorrect == null) {
        return;
      }

      setEssayCorrections((prev) => ({
        ...prev,
        [questionNumber]: { ...prev[questionNumber], isSaving: true },
      }));

      try {
        // Find the question data to get questionId
        const questionData = data?.questions.find(
          (q) => q.questionNumber === questionNumber
        );
        if (!questionData) {
          console.error('Questão não encontrada:', questionNumber);
          return;
        }

        await onQuestionCorrectionSubmit(data.studentId, {
          questionId: questionData.question.id,
          isCorrect: correction.isCorrect,
          teacherFeedback: correction.teacherFeedback,
        });
      } catch (error) {
        console.error('Erro ao salvar correção da questão:', error);
      } finally {
        setEssayCorrections((prev) => ({
          ...prev,
          [questionNumber]: { ...prev[questionNumber], isSaving: false },
        }));
      }
    },
    [
      data?.studentId,
      data?.questions,
      essayCorrections,
      onQuestionCorrectionSubmit,
    ]
  );

  /**
   * Update essay correction state
   */
  const updateEssayCorrection = useCallback(
    (
      questionNumber: number,
      field: 'isCorrect' | 'teacherFeedback',
      value: boolean | string
    ) => {
      setEssayCorrections((prev) => ({
        ...prev,
        [questionNumber]: {
          ...prev[questionNumber],
          [field]: value,
        },
      }));
    },
    []
  );

  /**
   * Get accordion title based on question type
   */
  const getAccordionTitle = (questionType: QUESTION_TYPE): string => {
    switch (questionType) {
      case QUESTION_TYPE.ALTERNATIVA:
      case QUESTION_TYPE.MULTIPLA_ESCOLHA:
      case QUESTION_TYPE.VERDADEIRO_FALSO:
        return 'Alternativas';
      case QUESTION_TYPE.DISSERTATIVA:
        return 'Resposta';
      case QUESTION_TYPE.PREENCHER:
        return 'Preencher Lacunas';
      case QUESTION_TYPE.IMAGEM:
        return 'Imagem';
      case QUESTION_TYPE.LIGAR_PONTOS:
        return 'Ligar Pontos';
      default:
        return 'Resposta';
    }
  };

  /**
   * Render question content using Quiz format renderers with accordion
   */
  const renderQuestionContent = (
    questionData: StudentActivityCorrectionData['questions'][number]
  ) => {
    const { question, result } = questionData;
    const questionType = question.questionType;
    const accordionTitle = getAccordionTitle(questionType);

    let content: ReactNode;

    switch (questionType) {
      case QUESTION_TYPE.ALTERNATIVA:
        content = renderQuestionAlternative({
          question,
          result,
        });
        break;
      case QUESTION_TYPE.MULTIPLA_ESCOLHA:
        content = renderQuestionMultipleChoice({
          question,
          result,
        });
        break;
      case QUESTION_TYPE.VERDADEIRO_FALSO:
        content = renderQuestionTrueOrFalse({
          question,
          result,
        });
        break;
      case QUESTION_TYPE.DISSERTATIVA:
        content = (
          <>
            {renderQuestionDissertative({
              result,
            })}
            {onQuestionCorrectionSubmit && (
              <div className="space-y-4 border-t border-border-100 pt-4 mt-4">
                {renderEssayCorrectionFields(questionData)}
              </div>
            )}
          </>
        );
        break;
      case QUESTION_TYPE.PREENCHER:
        content = renderQuestionFill({
          question,
          result,
        });
        break;
      case QUESTION_TYPE.IMAGEM:
        content = renderQuestionImage({
          result,
        });
        break;
      case QUESTION_TYPE.LIGAR_PONTOS:
        content = renderQuestionConnectDots({ paddingBottom: '' });
        break;
      default:
        // Fallback: try to render based on options presence
        if (question.options && question.options.length > 0) {
          content = renderQuestionAlternative({
            question,
            result,
          });
        } else {
          content = renderQuestionDissertative({
            result,
          });
        }
    }

    return (
      <CardAccordation
        value={`accordion-${questionData.questionNumber}`}
        className="border border-border-100 rounded-lg"
        trigger={
          <div className="py-3 pr-2 w-full">
            <Text className="text-sm font-bold text-text-950">
              {accordionTitle}
            </Text>
          </div>
        }
      >
        {content}
      </CardAccordation>
    );
  };

  /**
   * Render essay correction fields (radio group, textarea, save button)
   */
  const renderEssayCorrectionFields = (
    questionData: StudentActivityCorrectionData['questions'][number]
  ) => {
    const correction = essayCorrections[questionData.questionNumber] || {
      isCorrect: null,
      teacherFeedback: '',
      isSaving: false,
    };

    let radioValue;
    if (correction.isCorrect === null) {
      radioValue = undefined;
    } else if (correction.isCorrect) {
      radioValue = 'true';
    } else {
      radioValue = 'false';
    }

    return (
      <>
        {/* Is correct radio group */}
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-text-950">
            Resposta está correta?
          </Text>
          <div className="flex gap-4">
            <Radio
              name={`isCorrect-${questionData.questionNumber}`}
              value="true"
              id={`correct-yes-${questionData.questionNumber}`}
              label="Sim"
              size="medium"
              checked={radioValue === 'true'}
              onChange={(e) => {
                if (e.target.checked) {
                  updateEssayCorrection(
                    questionData.questionNumber,
                    'isCorrect',
                    true
                  );
                }
              }}
            />
            <Radio
              name={`isCorrect-${questionData.questionNumber}`}
              value="false"
              id={`correct-no-${questionData.questionNumber}`}
              label="Não"
              size="medium"
              checked={radioValue === 'false'}
              onChange={(e) => {
                if (e.target.checked) {
                  updateEssayCorrection(
                    questionData.questionNumber,
                    'isCorrect',
                    false
                  );
                }
              }}
            />
          </div>
        </div>

        {/* Teacher feedback textarea */}
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-text-950">
            Incluir observação
          </Text>
          <TextArea
            value={correction.teacherFeedback}
            onChange={(e) => {
              updateEssayCorrection(
                questionData.questionNumber,
                'teacherFeedback',
                e.target.value
              );
            }}
            placeholder="Escreva uma observação sobre a resposta do aluno"
            rows={4}
            size="medium"
          />
        </div>

        {/* Save button */}
        <Button
          size="small"
          onClick={() => handleSaveEssayCorrection(questionData.questionNumber)}
          disabled={
            correction.isCorrect === null ||
            correction.isSaving ||
            !onQuestionCorrectionSubmit
          }
        >
          {correction.isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </>
    );
  };

  if (!data) return null;

  const title = isViewOnly ? 'Detalhes da atividade' : 'Corrigir atividade';
  const formattedScore = data.score == null ? '-' : data.score.toFixed(1);

  /**
   * Render observation section based on current state
   * Allows observations in all activity statuses (not just pending correction)
   * @returns JSX element for observation section
   */
  const renderObservationSection = () => {
    /**
     * Get file name from URL
     * @param url - File URL
     * @returns File name extracted from URL
     */
    const getFileNameFromUrl = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const urlPath = urlObj.pathname;
        return urlPath.split('/').pop() || 'Anexo';
      } catch {
        return 'Anexo';
      }
    };

    /**
     * Render attachment input section for expanded state
     * @returns JSX element for attachment input
     */
    const renderAttachmentInput = () => {
      if (attachedFiles.length > 0) {
        return (
          <div className="flex items-center justify-center gap-2 px-5 h-10 bg-secondary-500 rounded-full min-w-0 max-w-[150px]">
            <Paperclip size={18} className="text-text-800 flex-shrink-0" />
            <span className="text-base font-medium text-text-800 truncate">
              {attachedFiles[0].file.name}
            </span>
            <button
              type="button"
              onClick={() => handleFileRemove(attachedFiles[0].id)}
              className="text-text-700 hover:text-text-800 flex-shrink-0"
              aria-label={`Remover ${attachedFiles[0].file.name}`}
            >
              <X size={18} />
            </button>
          </div>
        );
      }

      if (existingAttachment) {
        return (
          <div className="flex items-center gap-2">
            <a
              href={existingAttachment}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 h-10 bg-secondary-500 rounded-full min-w-0 max-w-[150px] hover:bg-secondary-600 transition-colors"
            >
              <Paperclip size={18} className="text-text-800 flex-shrink-0" />
              <span className="text-base font-medium text-text-800 truncate">
                {getFileNameFromUrl(existingAttachment)}
              </span>
            </a>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Paperclip size={18} />
              Trocar
            </Button>
          </div>
        );
      }

      return (
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Paperclip size={18} />
          Anexar
        </Button>
      );
    };

    // State: Saved
    if (isObservationSaved) {
      return (
        <div className="bg-background border border-border-100 rounded-lg p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Text className="text-sm font-bold text-text-950">Observação</Text>
            <div className="flex items-center gap-3">
              {/* Show newly attached file */}
              {savedFiles.length > 0 && (
                <div className="flex items-center gap-2 px-5 h-10 bg-secondary-500 rounded-full min-w-0 max-w-[150px]">
                  <Paperclip
                    size={18}
                    className="text-text-800 flex-shrink-0"
                  />
                  <span className="text-base font-medium text-text-800 truncate">
                    {savedFiles[0].file.name}
                  </span>
                </div>
              )}
              {/* Show existing attachment from server (URL) */}
              {savedFiles.length === 0 && existingAttachment && (
                <a
                  href={existingAttachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 h-10 bg-secondary-500 rounded-full min-w-0 max-w-[150px] hover:bg-secondary-600 transition-colors"
                >
                  <Paperclip
                    size={18}
                    className="text-text-800 flex-shrink-0"
                  />
                  <span className="text-base font-medium text-text-800 truncate">
                    {getFileNameFromUrl(existingAttachment)}
                  </span>
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleEditObservation}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <PencilSimple size={16} />
                Editar
              </Button>
            </div>
          </div>
          {savedObservation && (
            <div className="p-3 bg-background-50 rounded-lg">
              <Text className="text-sm text-text-700">{savedObservation}</Text>
            </div>
          )}
        </div>
      );
    }

    // State: Expanded
    if (isObservationExpanded) {
      return (
        <div className="bg-background border border-border-100 rounded-lg p-4 space-y-3">
          <Text className="text-sm font-bold text-text-950">Observação</Text>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Escreva uma observação para o estudante"
            className="w-full min-h-[80px] p-3 border border-border-100 rounded-lg text-sm text-text-700 placeholder:text-text-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const selectedFiles = e.target.files;
              if (selectedFiles && selectedFiles.length > 0) {
                handleFilesAdd(Array.from(selectedFiles));
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            aria-label="Selecionar arquivo"
          />
          {/* Buttons row: File indicator or Anexar button left, Salvar right */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
            {renderAttachmentInput()}
            <Button
              type="button"
              size="small"
              onClick={handleSaveObservation}
              disabled={
                !observation.trim() &&
                attachedFiles.length === 0 &&
                !existingAttachment
              }
            >
              Salvar
            </Button>
          </div>
          {data.observation && (
            <div className="p-3 bg-background-50 rounded-lg">
              <Text className="text-xs text-text-500">
                Observação anterior:
              </Text>
              <Text className="text-sm text-text-700">{data.observation}</Text>
            </div>
          )}
        </div>
      );
    }

    // State: Closed (default)
    return (
      <div className="bg-background border border-border-100 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Text className="text-sm font-bold text-text-950">Observação</Text>
        <Button type="button" size="small" onClick={handleOpenObservation}>
          Incluir
        </Button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Text className="text-lg font-semibold text-primary-700">
              {data.studentName?.charAt(0).toUpperCase() || '-'}
            </Text>
          </div>
          <Text className="text-lg font-medium text-text-950">
            {data.studentName || 'Aluno'}
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Nota" value={formattedScore} variant="score" />
          <StatCard
            label="N° de questões corretas"
            value={data.correctCount}
            variant="correct"
          />
          <StatCard
            label="N° de questões incorretas"
            value={data.incorrectCount}
            variant="incorrect"
          />
        </div>

        {/* Observation Section */}
        {renderObservationSection()}

        {/* Questions List */}
        <div className="space-y-2">
          <Text className="text-sm font-bold text-text-950">Respostas</Text>
          <AccordionGroup type="multiple" className="space-y-2">
            {data.questions?.map((questionData) => {
              const status = getQuestionStatusFromData(questionData);
              const badgeConfig = getQuestionStatusBadgeConfig(status);

              return (
                <CardAccordation
                  key={questionData.questionNumber}
                  value={`question-${questionData.questionNumber}`}
                  className="bg-background rounded-xl"
                  trigger={
                    <div className="flex items-center justify-between w-full py-3 pr-2">
                      <Text className="text-base font-bold text-text-950">
                        Questão {questionData.questionNumber}
                      </Text>
                      <Badge
                        className={cn(
                          'text-xs px-2 py-1',
                          badgeConfig.bgColor,
                          badgeConfig.textColor
                        )}
                      >
                        {badgeConfig.label}
                      </Badge>
                    </div>
                  }
                >
                  <div className="space-y-4 pt-2">
                    {/* Question statement */}
                    {questionData.question.statement && (
                      <Text
                        size="sm"
                        weight="normal"
                        color="text-text-700"
                        className="whitespace-pre-wrap"
                      >
                        {questionData.question.statement}
                      </Text>
                    )}

                    {/* Question content based on type */}
                    {renderQuestionContent(questionData)}
                  </div>
                </CardAccordation>
              );
            })}
          </AccordionGroup>
        </div>
      </div>
    </Modal>
  );
};

export default CorrectActivityModal;
