import {
  useEffect,
  useCallback,
  useMemo,
  memo,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import {
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  Text,
  Button,
  CardTopic,
  CardQuestions,
  Menu,
  MenuContent,
  MenuItem,
  SkeletonCard,
  SkeletonText,
  DownloadButton,
  LoadingModal,
} from '../../index';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity, cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import type {
  ApiLessonData,
  LessonDetails,
  LessonsCatalogNavigationState,
  LessonsCatalogRoutes,
  LessonsMode,
} from '../../types/lessonsCatalog';
import { createUseClassLessons } from '../../hooks/useClassLessons';
import { createUseLessonProgressTracker } from '../../hooks/useLessonProgressTracker';
import { createUseLessonTelemetry } from '../../hooks/useLessonTelemetry';
import { useLessonsStore } from '../../store/lessonsStore';
import {
  LessonVideoSection,
  LessonPodcastSection,
  LessonBoardImagesSection,
} from '../shared/LessonMediaSections';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';

export interface LessonViewPageProps {
  /** API client used to load the subtopic's lessons and record progress. */
  readonly api: BaseApiClient;
  /** Paths the catalogue navigates to. */
  readonly routes: LessonsCatalogRoutes;
  /**
   * `student` shows and records progress; `preview` shows the lesson read-only:
   * no progress bars, no progress writes, no telemetry, no resume position and
   * a disabled questionnaire.
   */
  readonly mode?: LessonsMode;
  /** Label of the catalogue root in the breadcrumb. */
  readonly rootLabel?: string;
  /** Scopes the player's saved position per user. */
  readonly userId?: string;
  /**
   * Opens the lesson's questionnaire. The page shows a loading modal while the
   * promise is pending and surfaces a rejection's message inline. Omit it to
   * render the questionnaire card disabled — which is what `preview` does
   * regardless, since answering would create an attempt for the viewer.
   */
  readonly onOpenQuestionnaire?: (args: {
    lessonId: string;
    hasQuestionnaire: boolean;
  }) => Promise<void>;
  /**
   * Replaces the default breadcrumb trail. Used by entry points that reached
   * the lesson from somewhere other than the catalogue.
   */
  readonly breadcrumbItems?: ReactNode;
  /** Runs before any breadcrumb navigation away from the lesson. */
  readonly onNavigateAway?: () => void;
}

interface LessonCardProps {
  lesson: LessonDetails;
  isActive: boolean;
  progress: number;
  showProgress: boolean;
  onClick: (lesson: LessonDetails) => void;
}

/**
 * Memoized lesson card component to prevent unnecessary re-renders
 */
const LessonCard = memo<LessonCardProps>(
  ({ lesson, isActive, progress, showProgress, onClick }) => {
    return (
      <div
        className={`relative transition-all ${
          isActive ? 'ring-2 ring-primary-950 rounded-xl' : ''
        }`}
      >
        <CardTopic
          header={lesson.description || lesson.title}
          progress={progress}
          showProgress={showProgress}
          progressVariant="blue"
          onClick={() => onClick(lesson)}
          className="cursor-pointer hover:shadow-sm transition-all border border-border-50 rounded-xl"
        />
      </div>
    );
  }
);

LessonCard.displayName = 'LessonCard';

/**
 * Third screen of the catalogue: the lesson player with its materials, plus the
 * list of sibling lessons in the same subtopic.
 *
 * The route's topic segment is semantically the SUBTOPIC id — it is fed
 * straight to `GET /lesson/by-subtopic`.
 */
export function LessonViewPage({
  api,
  routes,
  mode = 'student',
  rootLabel = 'Aulas',
  userId,
  onOpenQuestionnaire,
  breadcrumbItems,
  onNavigateAway,
}: LessonViewPageProps) {
  const { subjectId, topicId } = useParams<{
    subjectId: string;
    topicId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  // Currently selected lesson reflected in the URL. Lets the lesson screen be
  // reloaded/shared on the exact lesson instead of always falling back to the
  // first one in the topic.
  const aulaParam = searchParams.get('aula');

  const isPreview = mode === 'preview';
  const showProgress = !isPreview;

  const useClassLessons = useMemo(
    () => createUseClassLessons(api, mode),
    [api, mode]
  );
  const useLessonProgressTracker = useMemo(
    () => createUseLessonProgressTracker(api, mode),
    [api, mode]
  );
  const useLessonTelemetry = useMemo(
    () => createUseLessonTelemetry(api, mode),
    [api, mode]
  );

  const { isDark } = useTheme();
  const [isOpeningQuiz, setIsOpeningQuiz] = useState(false);
  const [quizErrorMessage, setQuizErrorMessage] = useState<string | null>(null);

  // Local state for API data when not available from navigation state
  const [apiNavigationData, setApiNavigationData] = useState<{
    subjectName: string;
    subjectColor: string;
    subjectIcon: string;
    subtopicName: string;
  } | null>(null);

  const progressTracker = useLessonProgressTracker();
  const { lessonsProgress, updateTimestamp } = useLessonsStore();

  // Refs to track if progress has been marked for each step
  const hasMarkedVideo = useRef(false);
  const hasMarkedPodcast = useRef(false);
  const hasMarkedQuiz = useRef(false);
  const hasMarkedInitialFrame = useRef(false);
  const hasMarkedFinalFrame = useRef(false);
  const hasRegisteredDownload = useRef(false);

  const navState = location.state as LessonsCatalogNavigationState | null;
  const topicName =
    navState?.topicName || apiNavigationData?.subtopicName || '';
  const subjectName =
    navState?.subjectName || apiNavigationData?.subjectName || '';
  const subjectColor =
    navState?.subjectColor || apiNavigationData?.subjectColor || '';
  const subjectIcon =
    navState?.subjectIcon || apiNavigationData?.subjectIcon || 'BookBookmark';
  const selectedContentId = navState?.selectedContentId;
  const selectedLessonId = navState?.selectedLessonId;

  const {
    currentLesson,
    lessons,
    rawApiData,
    loading,
    error,
    fetchLessonsBySubtopic,
    handleVideoTimeUpdate: originalHandleVideoTimeUpdate,
    selectLesson,
    getInitialTimestamp,
    clearError,
    registerLessonDownload,
    getDownloadContent,
    getBoardImages,
    getPodcastData,
  } = useClassLessons();

  const activeLessonId = currentLesson?.id;
  const lessonQuestionnaire = currentLesson?.questionnaire;

  // Reset all progress tracking refs when lesson changes
  useEffect(() => {
    hasMarkedVideo.current = false;
    hasMarkedPodcast.current = false;
    hasMarkedQuiz.current = false;
    hasMarkedInitialFrame.current = false;
    hasMarkedFinalFrame.current = false;
    hasRegisteredDownload.current = false;
  }, [activeLessonId]);

  const { startTelemetryTracking, stopTelemetryTracking } =
    useLessonTelemetry(activeLessonId);

  useEffect(() => {
    if (activeLessonId) {
      startTelemetryTracking();
    }
    return () => {
      stopTelemetryTracking();
    };
  }, [activeLessonId, startTelemetryTracking, stopTelemetryTracking]);

  const lessonData = useMemo(
    () => ({
      title: currentLesson?.title || 'Sem título',
      subtitle: currentLesson?.description,
      bnccCode: currentLesson?.bnccCode,
      video: {
        src: currentLesson?.videoUrl ?? '',
        poster: currentLesson?.thumbnailUrl,
        subtitles: currentLesson?.subtitleUrl,
      },
      podcast: getPodcastData(currentLesson),
      boardImages: getBoardImages(currentLesson),
    }),
    [currentLesson, getPodcastData, getBoardImages]
  );

  const downloadContent = useMemo(
    () => getDownloadContent(currentLesson),
    [getDownloadContent, currentLesson]
  );

  /**
   * Forward the player's own duration, not the stored one. The backend leaves
   * `videoDuration` at 0 until a playback reports it, so gating on the stored
   * value suppressed the very call that would learn it — the lesson stayed at
   * 0 forever and no watched seconds were ever recorded.
   */
  const handleVideoTimeUpdate = useCallback(
    (seconds: number, duration?: number) => {
      originalHandleVideoTimeUpdate(seconds, duration);
    },
    [originalHandleVideoTimeUpdate]
  );

  /**
   * Identify the board by which frame it actually is, never by its position.
   * The mapper only emits a board for a frame the lesson has, so a lesson with
   * only a final frame renders it alone at index 0 — matching on position
   * marked it as the initial frame and never marked the final one.
   */
  const handleBoardImageClick = useCallback(
    async (image: WhiteboardImage) => {
      if (!activeLessonId) return;

      const isInitial =
        Boolean(currentLesson?.urlInitialFrame) &&
        image.imageUrl === currentLesson?.urlInitialFrame;
      const isFinal =
        Boolean(currentLesson?.urlFinalFrame) &&
        image.imageUrl === currentLesson?.urlFinalFrame;

      if (isInitial && !hasMarkedInitialFrame.current) {
        hasMarkedInitialFrame.current = true;
        const progress =
          await progressTracker.markInitialFrameViewed(activeLessonId);
        if (progress === null) {
          hasMarkedInitialFrame.current = false;
        }
      } else if (isFinal && !hasMarkedFinalFrame.current) {
        hasMarkedFinalFrame.current = true;
        const progress =
          await progressTracker.markFinalFrameViewed(activeLessonId);
        if (progress === null) {
          hasMarkedFinalFrame.current = false;
        }
      }
    },
    [activeLessonId, progressTracker, currentLesson]
  );

  const handleVideoCompleteCallback = useCallback(async () => {
    if (!activeLessonId || hasMarkedVideo.current) return;

    hasMarkedVideo.current = true;

    const progress = await progressTracker.markVideoComplete(activeLessonId);

    // Revert flag if the backend call failed, so a later attempt can retry.
    // In preview mode `markVideoComplete` always resolves to null by design,
    // and there is nothing to store either.
    if (progress === null) {
      hasMarkedVideo.current = false;
      return;
    }

    // Only the timestamp is ours to write. Completion belongs to the backend,
    // which consolidates every criterion the institution requires (boards,
    // questionnaire, document) — finishing the video is one of them, not all
    // of them. `markVideoComplete` already mirrored the consolidated result
    // into the store; flagging the lesson complete here would overwrite it and
    // show a lesson as done while criteria are still pending.
    if (currentLesson) {
      updateTimestamp(currentLesson.id, currentLesson.videoDuration);
    }
  }, [activeLessonId, progressTracker, currentLesson, updateTimestamp]);

  /**
   * Extract navigation data from API response when not available from
   * navigation state (e.g. a deep link straight into a lesson).
   */
  const extractNavigationDataFromAPI = useCallback(
    (apiData: ApiLessonData[]) => {
      if (!apiData || !currentLesson) return;

      const needsFallback =
        !navState?.topicName ||
        !navState?.subjectName ||
        !navState?.subjectColor ||
        !navState?.subjectIcon;

      if (!needsFallback) return;

      const selectedLesson = apiData.find(
        (lesson) => lesson.id === currentLesson.id
      );

      if (selectedLesson?.subject && selectedLesson?.subtopic) {
        setApiNavigationData({
          subjectName: selectedLesson.subject.name || '',
          subjectColor: selectedLesson.subject.color || '',
          subjectIcon: selectedLesson.subject.icon || '',
          subtopicName: selectedLesson.subtopic.name || '',
        });
      }
    },
    [navState, currentLesson]
  );

  useEffect(() => {
    if (topicId) {
      fetchLessonsBySubtopic(topicId);
    }
  }, [topicId, fetchLessonsBySubtopic]);

  useEffect(() => {
    if (rawApiData && rawApiData.length > 0 && currentLesson) {
      extractNavigationDataFromAPI(rawApiData);
    }
  }, [rawApiData, currentLesson, extractNavigationDataFromAPI]);

  /**
   * Auto-select the lesson pinned by the URL or by navigation state.
   */
  useEffect(() => {
    if (lessons.length === 0) return;

    let targetLesson = null;

    // Highest priority: the lesson pinned in the URL (?aula=), so a reload or
    // shared link lands on the exact lesson.
    if (aulaParam) {
      targetLesson = lessons.find((lesson) => lesson.id === aulaParam);
    }

    // Then the lessonId from navigation state (more specific).
    if (!targetLesson && selectedLessonId) {
      targetLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
    }

    // Fallback to contentId if lessonId was not found.
    if (!targetLesson && selectedContentId) {
      targetLesson = lessons.find(
        (lesson) => lesson.contentId === selectedContentId
      );
    }

    if (targetLesson) {
      selectLesson(targetLesson);
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aulaParam, selectedLessonId, selectedContentId, lessons, selectLesson]);

  /**
   * Keep the URL's ?aula= in sync with the lesson that is actually open, so the
   * address bar always reflects the visible lesson and a shared/copied link
   * points to it — even when the current param names a different (or stale)
   * lesson.
   *
   * Guard against a render loop with the auto-select effect above: only rewrite
   * when the param points to a lesson that is NOT in this topic (absent, or a
   * stale/foreign id). When ?aula= names a real lesson, the auto-select effect
   * owns reconciliation (URL -> store) and this effect stands down, so the two
   * never chase each other.
   */
  useEffect(() => {
    if (!currentLesson) return;
    if (aulaParam === currentLesson.id) return;

    const paramMatchesATopicLesson =
      !!aulaParam && lessons.some((lesson) => lesson.id === aulaParam);
    if (paramMatchesATopicLesson) return;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('aula', currentLesson.id);
        return next;
      },
      { replace: true }
    );
  }, [currentLesson, aulaParam, lessons, setSearchParams]);

  const handleBackToTopics = () => {
    onNavigateAway?.();
    if (!subjectId) return;
    navigate(routes.topics(subjectId), {
      state: { subjectName, subjectColor, subjectIcon },
    });
  };

  const handleBackToClasses = () => {
    onNavigateAway?.();
    navigate(routes.root);
  };

  const handleLessonClick = useCallback(
    (lesson: LessonDetails) => {
      selectLesson(lesson);
      // Reflect the chosen lesson in the URL so it can be reloaded/shared and
      // the back button walks through previously viewed lessons. Preserve any
      // other existing query params.
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('aula', lesson.id);
          return next;
        },
        { replace: false }
      );
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [selectLesson, setSearchParams]
  );

  /**
   * Handle download complete - register lesson download
   *
   * DownloadButton fires this callback once per file in the package, but the
   * registration represents the whole lesson: only the first one counts.
   */
  const handleDownloadComplete = useCallback(async () => {
    if (!activeLessonId || hasRegisteredDownload.current) return;

    hasRegisteredDownload.current = true;
    await registerLessonDownload(activeLessonId);
  }, [activeLessonId, registerLessonDownload]);

  const lessonProgressMap = useMemo(() => {
    const progressMap = new Map<string, number>();

    for (const [lessonId, progress] of Object.entries(lessonsProgress)) {
      if (progress) {
        progressMap.set(lessonId, progress.progressPercentage || 0);
      }
    }

    return progressMap;
  }, [lessonsProgress]);

  const memoizedLessonCards = useMemo(
    () =>
      lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          isActive={currentLesson?.id === lesson.id}
          progress={lessonProgressMap.get(lesson.id) || 0}
          showProgress={showProgress}
          onClick={handleLessonClick}
        />
      )),
    [lessons, currentLesson, lessonProgressMap, showProgress, handleLessonClick]
  );

  /**
   * Mark the questionnaire as completed once the student answers everything.
   */
  const initialQuizStateRef = useRef<{
    lessonId: string | undefined;
    wasAlreadyComplete: boolean;
  }>({ lessonId: undefined, wasAlreadyComplete: false });

  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (!lessonQuestionnaire || !activeLessonId || hasMarkedQuiz.current) {
        return;
      }

      const { statistics } = lessonQuestionnaire;
      const isQuizComplete =
        statistics.pendingAnswers === 0 && statistics.totalAnswered > 0;

      if (initialQuizStateRef.current.lessonId !== activeLessonId) {
        initialQuizStateRef.current = {
          lessonId: activeLessonId,
          wasAlreadyComplete: isQuizComplete,
        };
        return;
      }

      if (!initialQuizStateRef.current.wasAlreadyComplete && isQuizComplete) {
        hasMarkedQuiz.current = true;

        const progress = await progressTracker.markQuizComplete(activeLessonId);

        if (progress === null) {
          hasMarkedQuiz.current = false;
        }
      }
    };

    checkQuizCompletion();
  }, [lessonQuestionnaire, activeLessonId, progressTracker]);

  const handleQuestionnaireClick = useCallback(async () => {
    if (!activeLessonId || !onOpenQuestionnaire) return;

    setQuizErrorMessage(null);
    setIsOpeningQuiz(true);
    try {
      await onOpenQuestionnaire({
        lessonId: activeLessonId,
        hasQuestionnaire: Boolean(lessonQuestionnaire),
      });
    } catch (err) {
      setQuizErrorMessage(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir o questionário. Tente novamente mais tarde.'
      );
    } finally {
      setIsOpeningQuiz(false);
    }
  }, [activeLessonId, onOpenQuestionnaire, lessonQuestionnaire]);

  const renderDefaultBreadcrumbs = () => (
    <>
      <MenuItem
        variant="breadcrumb"
        value="classes"
        onClick={handleBackToClasses}
        separator
      >
        {rootLabel}
      </MenuItem>
      <MenuItem
        variant="breadcrumb"
        value="subject"
        onClick={handleBackToTopics}
        separator
      >
        {subjectName}
      </MenuItem>
      <MenuItem
        variant="breadcrumb"
        value="topic"
        onClick={handleBackToTopics}
        separator
      >
        {topicName}
      </MenuItem>
      <MenuItem variant="breadcrumb" value="current-page">
        {lessonData.bnccCode || lessonData.title}
      </MenuItem>
    </>
  );

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full overflow-y-auto bg-secondary-50">
        <Menu
          value="current-page"
          defaultValue="current-page"
          variant="breadcrumb"
          className="!px-0 py-4"
        >
          <MenuContent variant="breadcrumb">
            <MenuItem variant="breadcrumb" value="current-page">
              {rootLabel}
            </MenuItem>
          </MenuContent>
        </Menu>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-[70%] space-y-6">
            <SkeletonCard className="h-[400px] w-full" />
            <SkeletonCard className="h-20 w-full" />
            <SkeletonCard className="h-32 w-full" />
            <SkeletonCard className="h-48 w-full" />
          </div>

          <div className="w-full sm:w-[30%] h-fit bg-background rounded-xl px-8 py-6 border border-border-50">
            <SkeletonText width="150px" height={24} className="mb-6" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Text size="lg" className="text-red-600">
            Erro ao carregar lições
          </Text>
          <Text size="md" className="text-gray-600 text-center">
            {error}
          </Text>
          <Button
            onClick={() => {
              clearError();
              if (topicId) fetchLessonsBySubtopic(topicId);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center">
        <Text size="lg" className="text-gray-600">
          Nenhuma lição disponível
        </Text>
      </div>
    );
  }

  const renderMainContent = () => (
    <section className="flex flex-col bg-background rounded-xl pb-2 gap-2 min-w-0">
      <div className="flex flex-col">
        <span
          className={cn(
            'rounded-t-xl px-8 py-4 flex flex-row justify-between items-center gap-4',
            // If subjectColor is a CSS class (starts with 'bg-'), apply it directly
            subjectColor?.startsWith('bg-') && subjectColor
          )}
          style={
            // If subjectColor is a hex color, apply it with opacity
            subjectColor && !subjectColor.startsWith('bg-')
              ? {
                  backgroundColor: getSubjectColorWithOpacity(
                    subjectColor,
                    isDark
                  ),
                }
              : undefined
          }
        >
          <div className="min-w-0">
            <Text size="md" weight="bold" className="text-text-950 break-words">
              {lessonData.subtitle || lessonData.title}
            </Text>
            {(lessonData.bnccCode || lessonData.title) && (
              <Text size="sm" className="text-text-700">
                {lessonData.bnccCode || lessonData.title}
              </Text>
            )}
          </div>

          <DownloadButton
            content={downloadContent}
            lessonTitle={lessonData.title}
            onDownloadComplete={handleDownloadComplete}
            className="flex-shrink-0"
          />
        </span>

        <span
          className={cn(
            'overflow-hidden rounded-b-xl flex items-center justify-center',
            'max-sm:bg-transparent max-sm:h-auto',
            'sm:bg-gray-100 sm:aspect-video'
          )}
        >
          {/* Keyed by lesson: the player only rearms its completion flag when
              `src` changes, so switching between two lessons that share the
              same video file would leave it flagged as already completed and
              onVideoComplete would never fire again. */}
          <LessonVideoSection
            key={activeLessonId}
            video={lessonData.video}
            onTimeUpdate={handleVideoTimeUpdate}
            onVideoComplete={handleVideoCompleteCallback}
            initialTime={getInitialTimestamp(currentLesson.id)}
            persistProgress={!isPreview}
            storageKey={`lesson-${currentLesson.id}`}
            userId={userId}
            className="w-full h-full object-contain rounded-b-xl"
          />
        </span>
      </div>

      <div className="w-full px-8 h-auto flex flex-col gap-6 pt-6">
        <LessonPodcastSection
          podcast={lessonData.podcast}
          onEnded={async () => {
            if (!activeLessonId || hasMarkedPodcast.current) return;

            hasMarkedPodcast.current = true;
            const progress =
              await progressTracker.markPodcastComplete(activeLessonId);

            if (progress === null) {
              hasMarkedPodcast.current = false;
            }
          }}
        />

        {/* On-demand questionnaire (random questions). Disabled in preview,
            where answering would create an attempt tied to the viewer. */}
        <div className="w-full">
          <Text size="md" weight="bold" className="text-text-950 pb-2">
            Questionário
          </Text>
          <CardQuestions
            state={lessonQuestionnaire ? 'done' : 'undone'}
            header={currentLesson.description || lessonData.title}
            disabled={isPreview || !onOpenQuestionnaire}
            onClickButton={handleQuestionnaireClick}
          />
          {quizErrorMessage && (
            <Text size="sm" className="text-red-600 mt-2">
              {quizErrorMessage}
            </Text>
          )}
        </div>

        <LessonBoardImagesSection
          images={lessonData.boardImages}
          onImageClick={handleBoardImageClick}
        />
      </div>
    </section>
  );

  return (
    <div className="w-full h-full grid grid-cols-[1fr_430px] not-lg:grid-cols-1 gap-3">
      <div className="col-span-full">
        <Menu
          value="current-page"
          defaultValue="current-page"
          variant="breadcrumb"
          className="!px-0 py-4"
        >
          <MenuContent variant="breadcrumb">
            {breadcrumbItems ?? renderDefaultBreadcrumbs()}
          </MenuContent>
        </Menu>
      </div>

      {renderMainContent()}

      <section className="flex flex-col bg-background rounded-xl p-6 gap-2">
        <div className="mb-2">
          <Text size="lg" weight="bold" className="text-text-950">
            Aulas
          </Text>
        </div>
        <div className="space-y-2">{memoizedLessonCards}</div>
      </section>

      <LoadingModal
        open={isOpeningQuiz}
        title="Abrindo o Questionário..."
        subtitle="Aguarde um instante."
      />
    </div>
  );
}
