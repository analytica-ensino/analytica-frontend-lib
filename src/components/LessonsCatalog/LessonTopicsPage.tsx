import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Text,
  Search,
  CardProgress,
  IconRender,
  SkeletonCard,
  SkeletonText,
  Menu,
  MenuContent,
  MenuItem,
  EmptyState,
} from '../../index';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import type {
  Topic,
  TopicCategory,
  LessonsCatalogNavigationState,
  LessonsCatalogRoutes,
  LessonsMode,
} from '../../types/lessonsCatalog';
import { createUseClassTopics } from '../../hooks/useClassTopics';
import {
  createUseLessonSearch,
  MIN_SEARCH_LENGTH,
} from '../../hooks/useLessonSearch';
import { LessonResultsSection } from './LessonResultsSection';

export interface LessonTopicsPageProps {
  /** API client used to load the subject's topics and run searches. */
  readonly api: BaseApiClient;
  /** Paths the catalogue navigates to. */
  readonly routes: LessonsCatalogRoutes;
  /**
   * `student` shows the "X de Y" completion counter; `preview` shows only how
   * many lessons the subtopic has.
   */
  readonly mode?: LessonsMode;
  /** Label of the catalogue root in the breadcrumb. */
  readonly rootLabel?: string;
  /** Image shown when a search returns no results. */
  readonly noSearchImage?: string;
}

/**
 * Helper function to check if a topic is in search results
 * @param topic - The topic to check
 * @param results - The search results array
 * @returns True if topic is in results
 */
const isTopicInResults = (topic: Topic, results: Topic[]): boolean => {
  return results.some((result) => result.id === topic.id);
};

/**
 * Second screen of the catalogue: the topics of one subject, each rendered as
 * its subtopic cards.
 *
 * For teachers `GET /knowledge/by-subject/:id` answers 403 when the subject is
 * not one they are assigned to, which surfaces through the error state.
 */
export function LessonTopicsPage({
  api,
  routes,
  mode = 'student',
  rootLabel = 'Aulas',
  noSearchImage,
}: LessonTopicsPageProps) {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const useClassTopics = useMemo(() => createUseClassTopics(api), [api]);
  const useLessonSearch = useMemo(() => createUseLessonSearch(api), [api]);

  const { data, loading, error, fetchTopics, searchTopics, clearError } =
    useClassTopics();
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();
  const {
    results: lessonResults,
    loading: lessonsLoading,
    search: searchLessons,
    clear: clearLessonSearch,
  } = useLessonSearch(subjectId);

  const showProgress = mode === 'student';
  const isSearching = searchTerm.trim().length >= MIN_SEARCH_LENGTH;

  // Get subject info from navigation state
  const navState = location.state as LessonsCatalogNavigationState | null;
  const subjectName = navState?.subjectName || data?.subjectName || '';
  const subjectIcon = navState?.subjectIcon || data?.subjectIcon || '';
  const subjectColor = navState?.subjectColor || data?.subjectColor || '';

  useEffect(() => {
    if (subjectId) {
      fetchTopics(subjectId);
    }
  }, [subjectId, fetchTopics]);

  const topicOptions = useMemo((): string[] => {
    if (!data) return [];

    const allTopics: string[] = [];
    for (const category of data.categories) {
      for (const topic of category.topics) {
        allTopics.push(topic.name);
      }
    }
    return allTopics.sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredCategories = useMemo((): TopicCategory[] => {
    if (!data) return [];

    if (!searchTerm.trim()) {
      return data.categories;
    }

    const searchResults = searchTopics(searchTerm);
    const categoriesMap = new Map<string, TopicCategory>();

    for (const category of data.categories) {
      const matchingTopics = category.topics.filter((topic) =>
        isTopicInResults(topic, searchResults)
      );

      if (matchingTopics.length > 0) {
        categoriesMap.set(category.id, {
          ...category,
          topics: matchingTopics,
        });
      }
    }

    return Array.from(categoriesMap.values());
  }, [data, searchTerm, searchTopics]);

  /**
   * Handle search input change. Filters topics client-side (instant) and, once
   * the term reaches MIN_SEARCH_LENGTH, also queries lessons server-side
   * (debounced), scoped to this subject.
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchLessons(value);
    if (error) {
      clearError();
    }
  };

  const handleTopicSelect = (topicName: string) => {
    setSearchTerm(topicName);
    searchLessons(topicName);
    if (error) {
      clearError();
    }
  };

  const handleTopicClick = (topic: Topic) => {
    if (!subjectId) return;
    navigate(routes.lessons(subjectId, topic.id), {
      state: {
        topicName: topic.name,
        subjectName,
        subjectIcon,
        subjectColor,
      },
    });
  };

  const handleBackClick = () => {
    navigate(routes.root);
  };

  const renderTopicCard = (topic: Topic) => {
    const completedLessons = topic.completedLessons || 0;
    const totalLessons = topic.totalLessons || 0;
    // A preview viewer completes nothing, so "0 de 12" would read as a stalled
    // student rather than as a catalogue entry. Show the size instead.
    const counterText = showProgress
      ? `${completedLessons} de ${totalLessons}`
      : `${totalLessons} ${totalLessons === 1 ? 'aula' : 'aulas'}`;

    return (
      <CardProgress
        key={topic.id}
        header={topic.name}
        subhead={counterText}
        icon={
          <IconRender iconName={subjectIcon} size={24} color="currentColor" />
        }
        color={getSubjectColorWithOpacity(subjectColor, isDark)}
        direction="vertical"
        onClick={() => handleTopicClick(topic)}
        className="cursor-pointer hover:shadow-md transition-shadow"
      />
    );
  };

  const renderCategory = (category: TopicCategory, index: number) => (
    <div key={category.id} className="flex flex-col">
      <div
        className={`flex flex-row items-end pb-4 ${index === 0 ? 'pt-2' : 'pt-6'}`}
      >
        <Text size="lg" weight="bold" className="text-text-950">
          {category.name}
        </Text>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {category.topics.map(renderTopicCard)}
      </div>
    </div>
  );

  const renderBreadcrumb = (currentLabel: string) => (
    <Menu
      value="current-page"
      defaultValue="current-page"
      variant="breadcrumb"
      className="!px-0 py-4"
    >
      <MenuContent variant="breadcrumb">
        <MenuItem
          variant="breadcrumb"
          value="parent"
          onClick={handleBackClick}
          separator
        >
          {rootLabel}
        </MenuItem>
        <MenuItem variant="breadcrumb" value="current-page">
          {currentLabel}
        </MenuItem>
      </MenuContent>
    </Menu>
  );

  /**
   * Render the search results view: a "Temas" section (client-side filtered
   * topics) plus an "Aulas" section (server-side lesson search scoped to this
   * subject). Shows the empty state only when both are empty and no lesson
   * request is in flight.
   */
  const renderSearchResults = () => {
    const hasTopicMatches = filteredCategories.length > 0;
    const hasLessonMatches = lessonResults.length > 0;
    const isEmpty = !hasTopicMatches && !hasLessonMatches && !lessonsLoading;

    if (isEmpty) {
      return (
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-end pb-4 pt-6">
            <Text className="text-primary-950 font-bold text-lg leading-tight w-full">
              Resultados
            </Text>
          </div>
          <div className="flex justify-center">
            <EmptyState
              image={noSearchImage}
              title="Nenhum resultado encontrado"
              description="Não encontramos nenhum resultado com esse nome. Tente revisar a busca ou usar outra palavra-chave."
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full">
        {hasTopicMatches && (
          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-6">
              <Text size="lg" weight="bold" className="text-text-950">
                Temas
              </Text>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCategories.flatMap((category) =>
                category.topics.map(renderTopicCard)
              )}
            </div>
          </div>
        )}
        <LessonResultsSection
          lessons={lessonResults}
          loading={lessonsLoading}
          routes={routes}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isSearching) {
      return renderSearchResults();
    }

    if (filteredCategories.length > 0) {
      return filteredCategories.map((category, index) =>
        renderCategory(category, index)
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Text size="lg" className="text-gray-600">
          Nenhum tema disponível
        </Text>
        <Text size="md" className="text-gray-500 text-center">
          Os temas serão carregados conforme o conteúdo do componente curricular
        </Text>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full overflow-y-auto bg-secondary-50">
        {renderBreadcrumb(subjectName || 'Carregando...')}

        <div className="flex flex-row justify-between items-center gap-6 mb-8">
          <SkeletonText width="200px" height={28} data-testid="skeleton-text" />
          <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[500px]">
            <SkeletonText
              width="100%"
              height={40}
              data-testid="skeleton-text"
            />
          </div>
        </div>

        <div className="flex flex-col pb-8">
          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-2">
              <SkeletonText
                width="30%"
                height={24}
                data-testid="skeleton-text"
              />
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
                  data-testid="skeleton-card"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-6">
              <SkeletonText
                width="25%"
                height={24}
                data-testid="skeleton-text"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard
                  key={i}
                  showAvatar={false}
                  showTitle={true}
                  showDescription={true}
                  showActions={false}
                  lines={1}
                  className="h-[156px]"
                  data-testid="skeleton-card"
                />
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
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <Text size="lg" className="text-red-600">
            Erro ao carregar temas
          </Text>
          <Text size="md" className="text-gray-600 text-center">
            {error}
          </Text>
          <button
            onClick={() => subjectId && fetchTopics(subjectId)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-secondary-50">
      {renderBreadcrumb(subjectName)}

      <div className="flex flex-row justify-between items-center gap-6 mb-8">
        <Text size="2xl" weight="bold" className="text-text-950">
          {subjectName}
        </Text>
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[500px]">
          <Search
            options={loading ? [] : topicOptions}
            placeholder={
              loading ? 'Carregando temas...' : 'Buscar tema ou aula'
            }
            value={searchTerm}
            onChange={handleSearchChange}
            onSelect={handleTopicSelect}
            showDropdown={false}
            onClear={() => {
              setSearchTerm('');
              clearLessonSearch();
              if (error) {
                clearError();
              }
            }}
            className={`w-full ${loading ? 'opacity-75' : ''}`}
          />
        </div>
      </div>

      <div className="flex flex-col pb-8">{renderContent()}</div>
    </div>
  );
}
