import { BookBookmarkIcon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import { getSubjectInfo } from '../../SubjectInfo/SubjectInfo';
import { cn } from '../../../utils/utils';
import type { LessonDetailsData } from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';
import { formatDate } from '../utils/lessonDetailsUtils';

/**
 * Props for LessonHeader component
 */
interface LessonHeaderProps {
  /** Lesson details data */
  data: LessonDetailsData;
  /** Callback when "Ver aula" button is clicked */
  onViewLesson?: () => void;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null;
  /** Label for the view lesson button */
  viewLessonLabel: string;
}

/**
 * Header section with lesson metadata
 * Displays title, dates, school, subject, and class information
 */
export const LessonHeader = ({
  data,
  onViewLesson,
  mapSubjectNameToEnum,
  viewLessonLabel,
}: LessonHeaderProps) => {
  const { recommendedClass, breakdown } = data;

  // Extract subject from first lesson if available
  const subjectName =
    recommendedClass.lessons[0]?.supLessonsProgress?.lesson?.subject?.name ||
    '';
  const subjectEnum = mapSubjectNameToEnum?.(subjectName);
  const subjectInfo = subjectEnum ? getSubjectInfo(subjectEnum) : null;

  return (
    <div className="bg-background rounded-xl border border-border-50 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h1"
            size="xl"
            weight="bold"
            className="text-text-950 lg:text-2xl"
          >
            {recommendedClass.title}
          </Text>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-600">
            <Text as="span" size="sm" className="text-text-600">
              Início em {formatDate(recommendedClass.startDate)}
            </Text>
            <Text as="span" size="sm" className="text-text-400">
              •
            </Text>
            <Text as="span" size="sm" className="text-text-600">
              Prazo final {formatDate(recommendedClass.finalDate)}
            </Text>
            {breakdown?.schoolName && (
              <>
                <Text as="span" size="sm" className="text-text-400">
                  •
                </Text>
                <Text as="span" size="sm" className="text-text-600">
                  {breakdown.schoolName}
                </Text>
              </>
            )}
            {subjectName && (
              <>
                <Text as="span" size="sm" className="text-text-400">
                  •
                </Text>
                <Text as="span" size="sm" className="flex items-center gap-1">
                  {subjectInfo && (
                    <Text
                      as="span"
                      className={cn(
                        'size-5 rounded flex items-center justify-center text-white',
                        subjectInfo.colorClass
                      )}
                    >
                      {subjectInfo.icon}
                    </Text>
                  )}
                  {subjectName}
                </Text>
              </>
            )}
            {breakdown?.className && (
              <>
                <Text as="span" size="sm" className="text-text-400">
                  •
                </Text>
                <Text as="span" size="sm" className="text-text-600">
                  {breakdown.className}
                </Text>
              </>
            )}
          </div>
        </div>
        {onViewLesson && (
          <Button
            variant="solid"
            action="primary"
            size="small"
            iconLeft={<BookBookmarkIcon size={16} />}
            onClick={onViewLesson}
          >
            {viewLessonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonHeader;
