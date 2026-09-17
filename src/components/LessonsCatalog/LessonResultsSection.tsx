import { useNavigate } from 'react-router-dom';
import { Text, CardProgress, IconRender, SkeletonCard } from '../../index';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity } from '../../utils/utils';
import type {
  LessonSearchResultItem,
  LessonsCatalogRoutes,
} from '../../types/lessonsCatalog';

export interface LessonResultsSectionProps {
  /** Lessons matched by the search. */
  lessons: LessonSearchResultItem[];
  /** Whether a search request is in flight. */
  loading: boolean;
  /** Paths used to navigate to a matched lesson. */
  routes: LessonsCatalogRoutes;
  /** Section title (defaults to "Aulas"). */
  title?: string;
}

/**
 * Grid of lesson search results, rendered with the same `CardProgress` cards as
 * the topics screen (subject color + icon), showing the content name and its
 * BNCC code. Clicking a card navigates straight to the lesson, since one
 * content maps to exactly one lesson.
 *
 * These cards use `direction="vertical"`, which renders the subhead instead of
 * a progress bar, so they look the same for every profile.
 */
export const LessonResultsSection = ({
  lessons,
  loading,
  routes,
  title = 'Aulas',
}: LessonResultsSectionProps) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  /**
   * Navigate to the lesson screen, opening the matched lesson directly.
   *
   * The lessons route's topic segment is semantically the SUBTOPIC id — the
   * lessons screen feeds it straight to GET /lesson/by-subtopic — so we use
   * `subtopic.id`, not `topic.id`. The specific lesson is pinned via the `?aula=`
   * query param (which the lesson page reads first) and also passed as
   * `selectedLessonId` in state, matching the other callers.
   */
  const handleLessonClick = (lesson: LessonSearchResultItem) => {
    navigate(
      `${routes.lessons(lesson.subject.id, lesson.subtopic.id)}?aula=${lesson.lessonId}`,
      {
        state: {
          topicName: lesson.subtopic.name,
          subjectName: lesson.subject.name,
          subjectIcon: lesson.subject.icon,
          subjectColor: lesson.subject.color,
          selectedLessonId: lesson.lessonId,
        },
      }
    );
  };

  const renderLessonCard = (lesson: LessonSearchResultItem) => (
    <CardProgress
      key={lesson.lessonId}
      header={lesson.content.name}
      subhead={lesson.content.bnccCode ?? lesson.subject.name}
      icon={
        <IconRender
          iconName={lesson.subject.icon}
          size={24}
          color="currentColor"
        />
      }
      color={getSubjectColorWithOpacity(lesson.subject.color, isDark)}
      direction="vertical"
      onClick={() => handleLessonClick(lesson)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    />
  );

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-row items-end pb-4 pt-6">
          <Text size="lg" weight="bold" className="text-text-950">
            {title}
          </Text>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard
              key={i}
              showAvatar={false}
              showTitle={true}
              showDescription={true}
              showActions={false}
              lines={1}
              className="h-[156px]"
              data-testid="skeleton-lesson-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-end pb-4 pt-6">
        <Text size="lg" weight="bold" className="text-text-950">
          {title}
        </Text>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {lessons.map(renderLessonCard)}
      </div>
    </div>
  );
};
