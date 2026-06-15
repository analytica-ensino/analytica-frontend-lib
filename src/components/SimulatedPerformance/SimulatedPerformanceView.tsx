import Text from '../Text/Text';
import { TableProvider } from '../TableProvider';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { PeriodSelector } from '../PeriodSelector';
import { GeneralOverviewSection } from '../GeneralOverviewSection';
import { AreaKnowledgeSelector, ESSAY_AREA_ID } from '../AreaKnowledgeSelector';
import { SimulatedSubjectMenu } from '../SimulatedSubjectMenu';
import { SimulatedStudentRanking } from '../SimulatedStudentRanking';
import { PerformanceDistributionChart } from '../PerformanceDistributionChart';
import { SimulatedStudentDetailsModal } from '../SimulatedStudentDetailsModal';
import { SimulatedContentDetailsModal } from '../SimulatedContentDetailsModal';
import { EssayCompetenciesTable } from '../EssayCompetencies';
import { EssayStudentDetailsModal } from '../EssayStudentDetailsModal';
import { SimulatedFiltersModal } from '../SimulatedFilters';
import type { SimulatedStudentItem } from '../SimulatedStudentsOverview/types';
import {
  isStudentsData,
  isClassesData,
  isMunicipalitiesData,
} from '../SimulatedStudentsOverview/utils';
import type { SimulatedContentItem } from '../SimulatedContentsPerformance/types';
import { SimulatedViewTab, type SimulatedPerformanceViewProps } from './types';
import { ReactNode, useMemo } from 'react';

/**
 * Reusable section wrapper handling loading/error states
 */
function SectionContent({
  loading,
  error,
  minHeight,
  children,
}: {
  readonly loading: boolean;
  readonly error: string | null;
  readonly minHeight: string;
  readonly children: ReactNode;
}) {
  if (loading) {
    return <SkeletonCard className={minHeight} />;
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${minHeight} bg-background border border-border-50 rounded-xl p-5`}
      >
        <Text size="sm" className="text-text-500">
          {error}
        </Text>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Componente de apresentação para a view de Simulados.
 * Renderiza a UI com base nos dados e handlers do hook useSimulatedPerformance.
 */
export function SimulatedPerformanceView({
  api,
  period,
  scoreType,
  selectedAreaKnowledgeId,
  selectedAreaRelatedIds,
  selectedSubjectId,
  simulatedViewTab,
  isEssaySelected,
  filters,
  aggregationType,
  generalOverview,
  aggregatedOverview,
  studentsOverview,
  contentsPerformance,
  handlePeriodChange,
  handleAreaKnowledgeChange,
  handleSubjectChange,
  handleViewTabChange,
  handleFiltersApply,
  handleStudentsParamsChange,
  handleContentsParamsChange,
  handleStudentRowClick,
  handleContentRowClick,
  studentModal,
  contentModal,
  filtersModal,
  studentsTableColumns,
  contentsTableColumns,
  noSearchImage,
}: Readonly<SimulatedPerformanceViewProps>) {
  // Transform aggregated data to ranking format based on aggregation type
  const { highlightItems, attentionItems, highlightTitle, attentionTitle } =
    useMemo(() => {
      const data = aggregatedOverview.data;

      if (isStudentsData(data, aggregationType)) {
        return {
          highlightItems:
            data.topHighlights?.map((s, index) => ({
              position: index + 1,
              name: s.name,
              average: s.average,
              userInstitutionId: s.userInstitutionId,
            })) || [],
          attentionItems:
            data.topDifficulties?.map((s, index) => ({
              position: index + 1,
              name: s.name,
              average: s.average,
              userInstitutionId: s.userInstitutionId,
            })) || [],
          highlightTitle: 'Estudantes em destaque',
          attentionTitle: 'Estudantes com maior dificuldade',
        };
      }

      if (isClassesData(data, aggregationType)) {
        return {
          highlightItems:
            data.topHighlights?.map((c, index) => ({
              position: index + 1,
              name: `${c.className} - ${c.schoolName}`,
              average: c.average,
              subtitle: `${c.studentCount} estudantes`,
              userInstitutionId: c.classId,
            })) || [],
          attentionItems:
            data.topDifficulties?.map((c, index) => ({
              position: index + 1,
              name: `${c.className} - ${c.schoolName}`,
              average: c.average,
              subtitle: `${c.studentCount} estudantes`,
              userInstitutionId: c.classId,
            })) || [],
          highlightTitle: 'Turmas em destaque',
          attentionTitle: 'Turmas com maior dificuldade',
        };
      }

      if (isMunicipalitiesData(data, aggregationType)) {
        return {
          highlightItems:
            data.topHighlights?.map((m, index) => ({
              position: index + 1,
              name: `${m.municipality} - ${m.state}`,
              average: m.average,
              subtitle: `${m.schoolCount} escolas, ${m.studentCount} estudantes`,
            })) || [],
          attentionItems:
            data.topDifficulties?.map((m, index) => ({
              position: index + 1,
              name: `${m.municipality} - ${m.state}`,
              average: m.average,
              subtitle: `${m.schoolCount} escolas, ${m.studentCount} estudantes`,
            })) || [],
          highlightTitle: 'Municípios em destaque',
          attentionTitle: 'Municípios com maior dificuldade',
        };
      }

      return {
        highlightItems: [],
        attentionItems: [],
        highlightTitle: 'Em destaque',
        attentionTitle: 'Com maior dificuldade',
      };
    }, [aggregatedOverview.data, aggregationType]);
  return (
    <>
      {/* Period tabs */}
      <PeriodSelector
        value={period}
        onChange={handlePeriodChange}
        excludeValues={['3_MONTHS']}
      />

      {/* General Overview Section */}
      <GeneralOverviewSection
        data={generalOverview.data}
        loading={generalOverview.loading}
        error={generalOverview.error}
        scoreType={scoreType}
      />

      {/* Filters: Area Knowledge and Subject */}
      <div className="flex flex-col gap-4 w-full">
        {/* Area Knowledge Selector */}
        <AreaKnowledgeSelector
          areas={generalOverview.data?.areas || []}
          selectedAreaId={selectedAreaKnowledgeId}
          onAreaChange={handleAreaKnowledgeChange}
          loading={generalOverview.loading}
          includeEssay={!!generalOverview.data?.essay}
        />

        {/* Subject Menu - Hidden when essay is selected */}
        {selectedAreaKnowledgeId !== ESSAY_AREA_ID && (
          <SimulatedSubjectMenu
            api={api}
            areaKnowledgeId={selectedAreaKnowledgeId}
            relatedIds={selectedAreaRelatedIds}
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={handleSubjectChange}
            loading={studentsOverview.loading}
          />
        )}
      </div>

      {/* Ranking Section (adapts to aggregation type: students/classes/municipalities) */}
      <SectionContent
        loading={aggregatedOverview.loading}
        error={aggregatedOverview.error}
        minHeight="min-h-[200px]"
      >
        <SimulatedStudentRanking
          highlightStudents={highlightItems}
          attentionStudents={attentionItems}
          highlightTitle={highlightTitle}
          attentionTitle={attentionTitle}
          scoreType={scoreType}
        />
      </SectionContent>

      {/* View tabs: Students vs Skills */}
      <Menu
        defaultValue={SimulatedViewTab.STUDENTS}
        value={simulatedViewTab}
        variant="breadcrumb"
        className="px-0!"
        onValueChange={handleViewTabChange}
      >
        <MenuContent className="px-0!">
          <MenuItem variant="menu2" value={SimulatedViewTab.STUDENTS}>
            Desempenho por estudante
          </MenuItem>
          <MenuItem variant="menu2" value={SimulatedViewTab.SKILLS}>
            Desempenho por habilidade
          </MenuItem>
        </MenuContent>
      </Menu>

      {/* Students view content */}
      {simulatedViewTab === SimulatedViewTab.STUDENTS && (
        <>
          {/* Performance Distribution Chart */}
          {!studentsOverview.error && (
            <PerformanceDistributionChart
              counters={studentsOverview.data?.counters}
              totalStudents={studentsOverview.data?.totalStudents}
              loading={studentsOverview.loading}
            />
          )}

          {/* Students Table */}
          {studentsOverview.error ? (
            <div className="bg-background border border-border-50 rounded-xl p-5">
              <Text
                as="h3"
                size="lg"
                weight="bold"
                className="text-text-950 mb-4"
              >
                Desempenho por estudante
              </Text>
              <div className="flex items-center justify-center py-8 bg-error-50 rounded-lg">
                <Text size="sm" className="text-error-500">
                  {studentsOverview.error}
                </Text>
              </div>
            </div>
          ) : (
            <div
              className={`bg-background border border-border-50 rounded-xl p-5 transition-opacity duration-200 ${
                studentsOverview.isRefreshing
                  ? 'opacity-60 pointer-events-none'
                  : ''
              }`}
            >
              <TableProvider<SimulatedStudentItem>
                data={studentsOverview.data?.students?.data || []}
                headers={studentsTableColumns}
                variant="borderless"
                loading={studentsOverview.loading}
                enableSearch
                enableTableSort
                enablePagination
                enableRowClick
                onRowClick={handleStudentRowClick}
                onParamsChange={handleStudentsParamsChange}
                rowKey="studentId"
                paginationConfig={{
                  itemLabel: 'estudantes',
                  itemsPerPageOptions: [10, 20, 50, 100],
                  defaultItemsPerPage:
                    studentsOverview.data?.students?.limit || 10,
                  totalItems: studentsOverview.data?.students?.total || 0,
                }}
                searchPlaceholder="Buscar estudante"
                noSearchResultState={
                  noSearchImage ? { image: noSearchImage } : undefined
                }
                headerContent={
                  <Text
                    as="h3"
                    size="lg"
                    weight="bold"
                    className="text-text-950"
                  >
                    Desempenho por estudante
                  </Text>
                }
              />
            </div>
          )}
        </>
      )}

      {/* Skills/Contents view content */}
      {simulatedViewTab === SimulatedViewTab.SKILLS &&
        !isEssaySelected &&
        (contentsPerformance.error ? (
          <div className="bg-background border border-border-50 rounded-xl p-5">
            <Text
              as="h3"
              size="lg"
              weight="bold"
              className="text-text-950 mb-4"
            >
              Desempenho por habilidade
            </Text>
            <div className="flex items-center justify-center py-8 bg-error-50 rounded-lg">
              <Text size="sm" className="text-error-500">
                {contentsPerformance.error}
              </Text>
            </div>
          </div>
        ) : (
          <div
            className={`bg-background border border-border-50 rounded-xl p-5 transition-opacity duration-200 ${
              contentsPerformance.isRefreshing
                ? 'opacity-60 pointer-events-none'
                : ''
            }`}
          >
            <TableProvider<SimulatedContentItem>
              data={contentsPerformance.data?.data || []}
              headers={contentsTableColumns}
              variant="borderless"
              loading={contentsPerformance.loading}
              enableSearch
              enableTableSort
              enablePagination
              enableRowClick
              onRowClick={handleContentRowClick}
              onParamsChange={handleContentsParamsChange}
              rowKey="contentId"
              paginationConfig={{
                itemLabel: 'habilidades',
                itemsPerPageOptions: [10, 20, 50, 100],
                defaultItemsPerPage: contentsPerformance.data?.limit || 10,
                totalItems: contentsPerformance.data?.total || 0,
              }}
              searchPlaceholder="Buscar habilidade"
              noSearchResultState={
                noSearchImage ? { image: noSearchImage } : undefined
              }
              headerContent={
                <Text as="h3" size="lg" weight="bold" className="text-text-950">
                  Desempenho por habilidade
                </Text>
              }
            />
          </div>
        ))}

      {/* Essay Competencies Table */}
      {simulatedViewTab === SimulatedViewTab.SKILLS && isEssaySelected && (
        <div className="bg-background border border-border-50 rounded-xl p-5">
          <EssayCompetenciesTable
            api={api}
            period={period}
            schoolIds={filters.schoolIds}
            schoolYearIds={filters.schoolYearIds}
            classIds={filters.classIds}
          />
        </div>
      )}

      {/* Simulated Student Details Modal */}
      {isEssaySelected ? (
        <EssayStudentDetailsModal
          api={api}
          isOpen={studentModal.isOpen}
          onClose={studentModal.close}
          userInstitutionId={studentModal.student?.userInstitutionId ?? null}
          studentName={studentModal.student?.name}
          period={period}
          schoolIds={filters.schoolIds}
          schoolYearIds={filters.schoolYearIds}
          classIds={filters.classIds}
        />
      ) : (
        <SimulatedStudentDetailsModal
          api={api}
          isOpen={studentModal.isOpen}
          onClose={studentModal.close}
          simulationType="enem-1"
          userInstitutionId={studentModal.student?.userInstitutionId ?? null}
          studentName={studentModal.student?.name}
          period={period}
        />
      )}

      {/* Simulated Content Details Modal */}
      <SimulatedContentDetailsModal
        api={api}
        isOpen={contentModal.isOpen}
        onClose={contentModal.close}
        activityFilters={{
          types: ['SIMULADO'],
          subtypes: [],
          statuses: ['CONCLUIDA'],
        }}
        contentId={contentModal.content?.contentId ?? null}
        contentName={contentModal.content?.contentName}
        period={period}
        filters={filters}
      />

      {/* Simulados Filters Modal */}
      <SimulatedFiltersModal
        isOpen={filtersModal.isOpen}
        onClose={filtersModal.close}
        onApply={handleFiltersApply}
        initialFilters={filters}
        api={api}
      />
    </>
  );
}
