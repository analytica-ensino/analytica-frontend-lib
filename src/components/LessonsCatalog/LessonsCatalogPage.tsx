import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Text,
  Search,
  SkeletonCard,
  SkeletonText,
  IconRender,
  CardProgress,
  EmptyState,
} from '../../index';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import type {
  KnowledgeArea,
  LessonsCatalogRoutes,
  LessonsMode,
  SubjectWithProgress,
} from '../../types/lessonsCatalog';
import { createUseClassesCatalog } from '../../hooks/useClassesCatalog';
import {
  createUseLessonSearch,
  MIN_SEARCH_LENGTH,
} from '../../hooks/useLessonSearch';
import { LessonResultsSection } from './LessonResultsSection';

export interface LessonsCatalogPageProps {
  /** API client used to load the knowledge matrix and run searches. */
  readonly api: BaseApiClient;
  /** Paths the catalogue navigates to. */
  readonly routes: LessonsCatalogRoutes;
  /**
   * `student` shows each subject's progress; `preview` hides it, for viewers
   * who have no progress of their own.
   */
  readonly mode?: LessonsMode;
  /** Page heading. */
  readonly title?: string;
  /** Image shown when a search returns no results. */
  readonly noSearchImage?: string;
}

/**
 * Find the knowledge area that contains a specific subject
 * @param knowledgeAreas - List of knowledge areas
 * @param subjectId - The subject ID to search for
 * @returns The knowledge area containing the subject, or undefined
 */
const findAreaBySubjectId = (
  knowledgeAreas: KnowledgeArea[],
  subjectId: string
): KnowledgeArea | undefined => {
  return knowledgeAreas.find((area) =>
    area.subjects.some((s) => s.id === subjectId)
  );
};

/**
 * First screen of the lessons catalogue: the curricular components the viewer
 * can reach, grouped by knowledge area.
 *
 * The backend scopes `GET /knowledge` by profile — the student's trail with
 * progress, the teacher's assigned subjects without progress, the manager's
 * school matrix without progress — so this page renders whatever it is given
 * and only decides whether to *show* progress.
 */
export function LessonsCatalogPage({
  api,
  routes,
  mode = 'student',
  title = 'Aulas',
  noSearchImage,
}: LessonsCatalogPageProps) {
  const navigate = useNavigate();
  const useClassesCatalog = useMemo(() => createUseClassesCatalog(api), [api]);
  const useLessonSearch = useMemo(() => createUseLessonSearch(api), [api]);

  const {
    knowledgeAreas,
    loading,
    error,
    getKnowledgeAreas,
    searchSubjects,
    clearError,
  } = useClassesCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();
  const {
    results: lessonResults,
    loading: lessonsLoading,
    error: lessonsError,
    search: searchLessons,
    clear: clearLessonSearch,
  } = useLessonSearch();

  const showProgress = mode === 'student';
  const isSearching = searchTerm.trim().length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    getKnowledgeAreas();
  }, [getKnowledgeAreas]);

  /**
   * Get all subject names for search dropdown options
   */
  const subjectOptions = useMemo((): string[] => {
    const allSubjects: string[] = [];
    for (const area of knowledgeAreas) {
      for (const subject of area.subjects) {
        allSubjects.push(subject.name);
      }
    }
    return allSubjects.sort((a, b) => a.localeCompare(b));
  }, [knowledgeAreas]);

  /**
   * Filter knowledge areas based on search term
   */
  const filteredAreas = useMemo((): KnowledgeArea[] => {
    if (!searchTerm.trim()) {
      return knowledgeAreas;
    }

    const searchResults = searchSubjects(searchTerm);
    const areasMap = new Map<string, KnowledgeArea>();

    for (const subject of searchResults) {
      const area = findAreaBySubjectId(knowledgeAreas, subject.id);

      if (area) {
        if (!areasMap.has(area.id)) {
          areasMap.set(area.id, { ...area, subjects: [] });
        }
        areasMap.get(area.id)!.subjects.push(subject);
      }
    }

    return Array.from(areasMap.values());
  }, [knowledgeAreas, searchTerm, searchSubjects]);

  /**
   * Total que o `Search` anuncia ao confirmar a busca com Enter. Soma os dois
   * lados que a tela mostra: componentes curriculares filtrados no cliente e
   * aulas vindas do servidor.
   *
   * `undefined` sem busca ativa — aí não há o que confirmar, e o `Search` fica
   * calado em vez de anunciar um total que ninguém pediu.
   */
  const searchResultsCount = useMemo((): number | undefined => {
    if (!searchTerm.trim()) {
      return undefined;
    }

    const subjects = filteredAreas.reduce(
      (total, area) => total + area.subjects.length,
      0
    );

    return subjects + lessonResults.length;
  }, [searchTerm, filteredAreas, lessonResults]);

  /**
   * Handle search input change. Filters subjects client-side (instant) and, once
   * the term reaches MIN_SEARCH_LENGTH, also queries lessons server-side
   * (debounced) so a single field searches both subjects and lessons.
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchLessons(value);
    if (error) {
      clearError();
    }
  };

  const handleSubjectSelect = (subjectName: string) => {
    setSearchTerm(subjectName);
    searchLessons(subjectName);
    if (error) {
      clearError();
    }
  };

  const handleSubjectClick = (subject: SubjectWithProgress) => {
    navigate(routes.topics(subject.id), {
      state: {
        subjectName: subject.name,
        subjectIcon: subject.icon,
        subjectColor: subject.color,
      },
    });
  };

  const renderSubjectCard = (subject: SubjectWithProgress) => (
    <CardProgress
      key={subject.id}
      header={subject.name}
      // `progress` is absent for teachers and managers, so it is read through a
      // guard rather than dereferenced.
      progress={subject.progress?.percentage ?? 0}
      showProgress={showProgress}
      showDates={false}
      icon={
        <IconRender iconName={subject.icon} size={24} color="currentColor" />
      }
      color={getSubjectColorWithOpacity(subject?.color, isDark)}
      progressVariant="blue"
      direction="horizontal"
      onClick={() => handleSubjectClick(subject)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    />
  );

  const renderKnowledgeArea = (area: KnowledgeArea, index: number) => (
    <div key={area.id} className="flex flex-col">
      <div
        className={`flex flex-row items-end pb-4 ${index === 0 ? 'pt-2' : 'pt-6'}`}
      >
        <Text size="lg" weight="bold" className="text-text-950">
          {area.name}
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        {area.subjects.map(renderSubjectCard)}
      </div>
    </div>
  );

  /**
   * Render the search results view: a subjects section (client-side filtered)
   * plus a lessons section (server-side search). Shows the empty state only when
   * both are empty and no lesson request is in flight.
   */
  const renderSearchResults = () => {
    const hasSubjectMatches = filteredAreas.length > 0;
    const hasLessonMatches = lessonResults.length > 0;
    const isEmpty =
      !hasSubjectMatches &&
      !hasLessonMatches &&
      !lessonsLoading &&
      !lessonsError;

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
        {hasSubjectMatches && (
          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-6">
              <Text size="lg" weight="bold" className="text-text-950">
                Componentes curriculares
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              {filteredAreas.flatMap((area) =>
                area.subjects.map(renderSubjectCard)
              )}
            </div>
          </div>
        )}
        <LessonResultsSection
          lessons={lessonResults}
          loading={lessonsLoading}
          routes={routes}
          error={lessonsError}
          onRetry={() => searchLessons(searchTerm)}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isSearching) {
      return renderSearchResults();
    }

    if (filteredAreas.length > 0) {
      return filteredAreas.map((area, index) =>
        renderKnowledgeArea(area, index)
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Text size="lg" className="text-gray-600">
          Nenhum componente curricular disponível
        </Text>
        <Text size="md" className="text-gray-500 text-center">
          Os componentes curriculares serão carregados conforme a configuração
          da sua escola
        </Text>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full bg-secondary-50">
        <div className="flex flex-row items-center justify-between pt-4 pb-2 gap-4">
          <Text size="2xl" weight="bold" className="text-text-950">
            {title}
          </Text>
        </div>

        <div className="flex flex-col pb-8">
          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-2">
              <SkeletonText width="30%" height={24} />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonCard
                data-testid="skeleton-card"
                showAvatar={true}
                showTitle={true}
                showDescription={true}
                showActions={false}
                lines={1}
                className="h-20"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row items-end pb-4 pt-6">
              <SkeletonText width="25%" height={24} />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonCard
                showAvatar={true}
                showTitle={true}
                showDescription={true}
                showActions={false}
                lines={1}
                className="h-20"
              />
              <SkeletonCard
                showAvatar={true}
                showTitle={true}
                showDescription={true}
                showActions={false}
                lines={1}
                className="h-20"
              />
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
            Erro ao carregar aulas
          </Text>
          <Text size="md" className="text-gray-600 text-center">
            {error}
          </Text>
          <button
            onClick={getKnowledgeAreas}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-secondary-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 pb-2 gap-4">
        <Text size="2xl" weight="bold" className="text-text-950">
          {title}
        </Text>
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[500px]">
          <Search
            options={loading ? [] : subjectOptions}
            placeholder={
              loading
                ? 'Carregando componentes curriculares...'
                : 'Buscar componente curricular ou aula'
            }
            value={searchTerm}
            onChange={handleSearchChange}
            onSelect={handleSubjectSelect}
            resultsCount={searchResultsCount}
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
