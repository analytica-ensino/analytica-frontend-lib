import { useState, useRef } from 'react';
import { PencilSimple, Paperclip, X } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import { AlternativesList } from '../Alternative/Alternative';
import { CardAccordation, AccordionGroup } from '../Accordation';
import { generateFileId } from '../FileAttachment/FileAttachment';
import type { AttachedFile } from '../FileAttachment/FileAttachment';
import { cn } from '../../utils/utils';
import {
  type StudentActivityCorrectionData,
  getQuestionStatusBadgeConfig,
} from '../../types/studentActivityCorrection';

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
  onObservationSubmit?: (observation: string, files: File[]) => void;
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
 * Stat card component for displaying statistics
 * @param props - Component props
 * @returns JSX element
 */
const StatCard = ({ label, value, variant }: StatCardProps) => {
  const variantStyles = {
    score: {
      bg: 'bg-warning-background',
      text: 'text-warning-600',
    },
    correct: {
      bg: 'bg-success-200',
      text: 'text-success-700',
    },
    incorrect: {
      bg: 'bg-error-100',
      text: 'text-error-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-xl',
        styles.bg
      )}
    >
      <Text className={cn('text-2xs font-bold uppercase', styles.text)}>
        {label}
      </Text>
      <Text className={cn('text-2xl font-bold', styles.text)}>{value}</Text>
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
}: CorrectActivityModalProps) => {
  const [observation, setObservation] = useState('');
  const [isObservationExpanded, setIsObservationExpanded] = useState(false);
  const [isObservationSaved, setIsObservationSaved] = useState(false);
  const [savedObservation, setSavedObservation] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [savedFiles, setSavedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle opening observation section
   */
  const handleOpenObservation = () => {
    setIsObservationExpanded(true);
  };

  /**
   * Handle adding files
   * @param files - Files to add
   */
  const handleFilesAdd = (files: File[]) => {
    const newAttachedFiles = files.map((file) => ({
      file,
      id: generateFileId(),
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachedFiles]);
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
    if (observation.trim() || attachedFiles.length > 0) {
      setSavedObservation(observation);
      setSavedFiles([...attachedFiles]);
      setIsObservationSaved(true);
      setIsObservationExpanded(false);
      onObservationSubmit?.(
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

  if (!data) return null;

  const title = isViewOnly ? 'Detalhes da atividade' : 'Corrigir atividade';
  const formattedScore = data.score !== null ? data.score.toFixed(1) : '-';

  /**
   * Render observation section based on current state
   * @returns JSX element for observation section
   */
  const renderObservationSection = () => {
    if (isViewOnly) return null;

    // State: Saved
    if (isObservationSaved) {
      return (
        <div className="bg-white border border-border-100 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Text className="text-sm font-bold text-text-950">Observação</Text>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={handleEditObservation}
              className="flex items-center gap-2"
            >
              <PencilSimple size={16} />
              Editar
            </Button>
          </div>
          {savedObservation && (
            <div className="p-3 bg-background-50 rounded-lg">
              <Text className="text-sm text-text-700">{savedObservation}</Text>
            </div>
          )}
          {savedFiles.length > 0 && (
            <div className="flex">
              <div className="flex items-center gap-2 px-5 h-10 bg-secondary-500 rounded-full">
                <Paperclip size={18} className="text-text-800" />
                <span className="text-base font-medium text-text-800 truncate max-w-[82px]">
                  {savedFiles[0].file.name}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // State: Expanded
    if (isObservationExpanded) {
      return (
        <div className="bg-white border border-border-100 rounded-lg p-4 space-y-3">
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
          <div className="flex justify-between">
            {attachedFiles.length > 0 ? (
              <div className="flex items-center justify-center gap-2 px-5 h-10 bg-secondary-500 rounded-full">
                <Paperclip size={18} className="text-text-800" />
                <span className="text-base font-medium text-text-800 truncate max-w-[82px]">
                  {attachedFiles[0].file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleFileRemove(attachedFiles[0].id)}
                  className="text-text-700 hover:text-text-800"
                  aria-label={`Remover ${attachedFiles[0].file.name}`}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
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
            )}
            <Button
              type="button"
              size="small"
              onClick={handleSaveObservation}
              disabled={!observation.trim() && attachedFiles.length === 0}
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
      <div className="bg-white border border-border-100 rounded-lg p-4 flex items-center justify-between">
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
              {data.studentName.charAt(0).toUpperCase()}
            </Text>
          </div>
          <Text className="text-lg font-medium text-text-950">
            {data.studentName}
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
            {data.questions.map((question) => {
              const badgeConfig = getQuestionStatusBadgeConfig(question.status);

              return (
                <CardAccordation
                  key={question.questionNumber}
                  value={`question-${question.questionNumber}`}
                  trigger={
                    <div className="flex items-center gap-3">
                      <Text className="text-sm font-medium text-text-950">
                        Questão {question.questionNumber}
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
                  <div className="space-y-4">
                    {/* Question text */}
                    {question.questionText && (
                      <div className="text-sm text-text-700">
                        {question.questionText}
                      </div>
                    )}

                    {/* Alternatives sub-accordion */}
                    {question.alternatives &&
                      question.alternatives.length > 0 && (
                        <CardAccordation
                          value={`alternatives-${question.questionNumber}`}
                          trigger={
                            <Text className="text-sm font-medium text-text-700">
                              Alternativas
                            </Text>
                          }
                        >
                          <AlternativesList
                            mode="readonly"
                            selectedValue={question.studentAnswer}
                            alternatives={question.alternatives.map((alt) => ({
                              value: alt.value,
                              label: alt.label,
                              status: alt.isCorrect ? 'correct' : undefined,
                            }))}
                          />
                        </CardAccordation>
                      )}

                    {/* Fallback for essay questions */}
                    {(!question.alternatives ||
                      question.alternatives.length === 0) && (
                      <>
                        <div className="flex gap-2">
                          <Text className="text-xs text-text-500">
                            Resposta do aluno:
                          </Text>
                          <Text className="text-xs text-text-700">
                            {question.studentAnswer || 'Não respondeu'}
                          </Text>
                        </div>
                        <div className="flex gap-2">
                          <Text className="text-xs text-text-500">
                            Resposta correta:
                          </Text>
                          <Text className="text-xs text-success-700">
                            {question.correctAnswer || '-'}
                          </Text>
                        </div>
                      </>
                    )}
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
