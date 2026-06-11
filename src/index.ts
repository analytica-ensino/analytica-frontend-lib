// Complete bundle index - includes all components
// Individual imports still recommended for better tree-shaking

// CSS import
import './styles.css';

// Layout Components
export { PageContainer } from './components/PageContainer/PageContainer';
export type { PageContainerProps } from './components/PageContainer/PageContainer';

// Basic Components
export { default as Text } from './components/Text/Text';
export { default as Button } from './components/Button/Button';
export { default as Badge } from './components/Badge/Badge';
export { default as Alert } from './components/Alert/Alert';
export { default as LatexRenderer } from './components/LatexRenderer/LatexRenderer';
export type { LatexRendererProps } from './components/LatexRenderer/LatexRenderer';
export {
  HtmlMathRenderer,
  processHtmlWithMath,
  sanitizeHtmlForDisplay,
  cleanLatex,
  containsMath,
  stripHtml,
  looksLikeLatex,
  isLikelyMarkdown,
} from './components/HtmlMathRenderer';
export type {
  HtmlMathRendererProps,
  MathPart,
} from './components/HtmlMathRenderer';
export {
  MarkdownMathRenderer,
  protectCurrencyInlineMath,
  reflowDisplayMath,
} from './components/MarkdownMathRenderer';
export type { MarkdownMathRendererProps } from './components/MarkdownMathRenderer';
export { default as IconButton } from './components/IconButton/IconButton';
export { Tooltip } from './components/Tooltip/Tooltip';
export type { TooltipProps } from './components/Tooltip/Tooltip';
export { TruncatedText } from './components/TruncatedText/TruncatedText';
export type {
  TruncatedTextProps,
  TruncatedTextSize,
  TruncatedTextWeight,
  TruncatedTextTooltipPosition,
} from './components/TruncatedText/TruncatedText';
export { default as IconRoundedButton } from './components/IconRoundedButton/IconRoundedButton';
export { default as NavButton } from './components/NavButton/NavButton';
export { default as SelectionButton } from './components/SelectionButton/SelectionButton';
export { default as CheckBox } from './components/CheckBox/CheckBox';
export { default as ToggleSwitch } from './components/ToggleSwitch/ToggleSwitch';
export type { ToggleSwitchProps } from './components/ToggleSwitch/ToggleSwitch';
export { default as ImageUpload } from './components/ImageUpload/ImageUpload';
export type { ImageUploadProps } from './components/ImageUpload/ImageUpload';
export { default as FileDropzone } from './components/FileDropzone/FileDropzone';
export type {
  FileDropzoneProps,
  FileType,
} from './components/FileDropzone/FileDropzone';
export {
  default as CheckboxList,
  CheckboxListItem,
} from './components/CheckBox/CheckboxList';

// CheckboxGroup Component
export {
  CheckboxGroup,
  type CategoryConfig,
  type Item,
} from './components/CheckBoxGroup/CheckBoxGroup';
export { AlertsManager } from './components/AlertManager/AlertsManager';
export { useAlertFormStore } from './components/AlertManager/useAlertForm';
export { AlertsManagerView } from './components/AlertManagerView/AlertsManagerView';
export type {
  AlertViewData,
  RecipientStatus,
} from './components/AlertManagerView/AlertsManagerView';
export type {
  AlertsConfig,
  AlertData,
  RecipientItem,
} from './components/AlertManager/types';
export { AppHeader } from './components/AppHeader/AppHeader';
export type {
  AppHeaderProps,
  AppHeaderUser,
  AppHeaderSessionInfo,
  AppHeaderNotifications,
} from './components/AppHeader/AppHeader';
export { AppLayout } from './components/AppLayout/AppLayout';
export type {
  AppLayoutProps,
  AppLayoutMenuItem,
} from './components/AppLayout/AppLayout';
export {
  default as Radio,
  RadioGroup,
  RadioGroupItem,
} from './components/Radio/Radio';
export { default as TextArea } from './components/TextArea/TextArea';
export { default as Toast } from './components/Toast/Toast';
export { default as Toaster } from './components/Toast/utils/Toaster';
export { default as Divider } from './components/Divider/Divider';
export { default as useToastStore } from './components/Toast/utils/ToastStore';
export { default as Input } from './components/Input/Input';
export { default as ColorPicker } from './components/ColorPicker/ColorPicker';
export type { ColorPickerProps } from './components/ColorPicker/ColorPicker';
export { default as Search } from './components/Search/Search';
export { default as Chips } from './components/Chips/Chips';
export { default as ProgressBar } from './components/ProgressBar/ProgressBar';
export { default as ProgressCircle } from './components/ProgressCircle/ProgressCircle';
export { default as Stepper } from './components/Stepper/Stepper';
export { default as Calendar } from './components/Calendar/Calendar';
export { DateTimeInput } from './components/DateTimeInput';
export type { DateTimeInputProps } from './components/DateTimeInput';
export { default as Modal } from './components/Modal/Modal';
export { default as CorrectActivityModal } from './components/CorrectActivityModal/CorrectActivityModal';
export type { CorrectActivityModalProps } from './components/CorrectActivityModal/CorrectActivityModal';
export {
  QUESTION_STATUS as CORRECTION_QUESTION_STATUS,
  getQuestionStatusBadgeConfig,
  convertApiResponseToCorrectionData,
} from './utils/studentActivityCorrection';
export type {
  QuestionStatus as CorrectionQuestionStatus,
  StudentQuestion,
  StudentActivityCorrectionData,
  QuestionsAnswersByStudentResponse,
} from './utils/studentActivityCorrection';

// FileAttachment Component
export { default as FileAttachment } from './components/FileAttachment/FileAttachment';
export {
  generateFileId,
  formatFileSize,
} from './components/FileAttachment/FileAttachment';
export type {
  FileAttachmentProps,
  AttachedFile,
} from './components/FileAttachment/FileAttachment';

export { AlertDialog } from './components/AlertDialog/AlertDialog';
export { default as LoadingModal } from './components/LoadingModal/loadingModal';
export { default as ProgressModal } from './components/ProgressModal/ProgressModal';
export type { ProgressModalProps } from './components/ProgressModal/ProgressModal';
export { default as ScoreCircle } from './components/ScoreCircle/ScoreCircle';
export type {
  ScoreCircleProps,
  ScoreCircleVariant,
} from './components/ScoreCircle/ScoreCircle';
export { default as ImagePreviewCard } from './components/ImagePreviewCard/ImagePreviewCard';
export type { ImagePreviewCardProps } from './components/ImagePreviewCard/ImagePreviewCard';
export { default as NotificationCard } from './components/NotificationCard/NotificationCard';
export { default as CalendarCard } from './components/CalendarCard/CalendarCard';
export type { CalendarCardProps } from './components/CalendarCard/CalendarCard';
export { ThemeToggle } from './components/ThemeToggle/ThemeToggle';

// Choropleth Map Component
export { default as ChoroplethMap } from './components/ChoroplethMap/ChoroplethMap';
export type {
  ChoroplethMapProps,
  RegionData,
  MapBounds,
  LegendItem,
  ColorClass,
} from './components/ChoroplethMap/ChoroplethMap.types';

// Map Data Hook
export { createUseMapData } from './hooks/useMapData';
export type { UseMapDataReturn } from './hooks/useMapData';
export { REPORT_PERIOD, REPORT_MODAL_VARIANT } from './types/common';
export type {
  MapFilters as MapDataFilters,
  MapDataRegion,
  MapDataApiResponse,
  MapDataBounds,
} from './types/mapData';

// Export notification card types
export type {
  NotificationItem,
  NotificationGroup,
} from './components/NotificationCard/NotificationCard';

// Subject Components
export {
  SubjectInfo,
  getSubjectInfo,
  getSubjectIcon,
  getSubjectColorClass,
  getSubjectName,
} from './components/SubjectInfo/SubjectInfo';
export type {
  SubjectData,
  IconProps as SubjectIconProps,
} from './components/SubjectInfo/SubjectInfo';

// Notification Store
export {
  createNotificationStore,
  formatTimeAgo,
} from './store/notificationStore';
export { createUseNotificationStore } from './hooks/useNotificationStore';
export {
  createUseNotifications,
  createNotificationsHook,
} from './hooks/useNotifications';
export { NotificationEntityType } from './types/notifications';
export { questionTypeLabels } from './types/questionTypes';
export type {
  Notification,
  NotificationType,
  BackendNotification,
  BackendNotificationsResponse,
  NotificationsResponse,
  FetchNotificationsParams,
  NotificationApiClient,
} from './types/notifications';
export type {
  NotificationState,
  NotificationActions,
  NotificationStore,
} from './store/notificationStore';

// Activity Filters Data Hook (consolidated hook for all filter data)
export {
  createUseActivityFiltersData,
  createActivityFiltersDataHook,
} from './hooks/useActivityFiltersData';
export type {
  UseActivityFiltersDataReturn,
  UseActivityFiltersDataOptions,
} from './hooks/useActivityFiltersData';

// Questions List Hook
export {
  createUseQuestionsList,
  createQuestionsListHook,
} from './hooks/useQuestionsList';
export { CreateActivity } from './components/ActivityCreate/ActivityCreate';
export {
  ActivityType,
  ActivityStatus,
} from './components/ActivityCreate/ActivityCreate';
export type {
  ActivityData,
  BackendFiltersFormat,
  ActivityDraftResponse,
  ActivityPreFiltersInput,
  ActivityCreatePayload,
  ActivityCreateResponse,
  School,
  SchoolYear,
  Class,
  Student,
} from './components/ActivityCreate/ActivityCreate';

// RecommendedLessonCreate Component
export { RecommendedLessonCreate } from './components/RecommendedLessonCreate';
export type {
  LessonBackendFiltersFormat,
  RecommendedLessonDraftResponse,
  RecommendedLessonData,
  RecommendedLessonPreFiltersInput,
  RecommendedLessonCreatePayload,
  RecommendedLessonCreateResponse,
} from './components/RecommendedLessonCreate';
export type { UseQuestionsListReturn } from './hooks/useQuestionsList';
export type {
  Question as QuestionActivity,
  Pagination,
  QuestionsFilterBody,
  QuestionOptionActivity,
  KnowledgeMatrixItemActivity,
  QuestionBankYearActivity,
  PaginationActivity,
  QuestionsListResponseActivity,
} from './types/questions';
export { DIFFICULTY_LEVEL_ENUM, QUESTION_STATUS_ENUM } from './types/questions';

// API Types
export type { BaseApiClient } from './types/api';

// Theme Store
export { useThemeStore } from './store/themeStore';
export type { ThemeStore, ThemeState, ThemeActions } from './store/themeStore';

// Storage Keys
export { KEYS, FEATURE_FLAGS_KEYS } from './utils/keys';

// DropdownMenu Components
export {
  default as DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ProfileMenuTrigger,
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuInfo,
  ProfileMenuSection,
  MenuLabel,
  DropdownMenuSeparator,
  ProfileToggleTheme,
} from './components/DropdownMenu/DropdownMenu';

export {
  default as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
  TablePagination,
  useTableSort,
} from './components/Table/Table';
export type {
  UseTableSortOptions,
  SortDirection,
} from './components/Table/Table';

// Filter Components
export { FilterModal, useTableFilter } from './components/Filter';
export type {
  FilterModalProps,
  FilterConfig,
  UseTableFilterOptions,
  UseTableFilterReturn,
} from './components/Filter';

// SimulatedFilters Components
export {
  SimulatedFiltersModal,
  StudentsFilterSection,
  useUserAccessData as useSimulatedUserAccessData,
  useStudentsFilter as useSimulatedStudentsFilter,
} from './components/SimulatedFilters';
export type {
  SimulatedFilters,
  SimulatedFiltersModalProps,
  SchoolItem as SimulatedSchoolItem,
  SchoolYearItem as SimulatedSchoolYearItem,
  ClassItem as SimulatedClassItem,
  StudentFilterItem,
  StudentGroup,
  UserAccessDataApiResponse as SimulatedUserAccessDataApiResponse,
  StudentsFilterApiResponse as SimulatedStudentsFilterApiResponse,
  StudentsFilterParams,
  UseUserAccessDataState,
  UseUserAccessDataReturn,
  UseStudentsFilterState,
  UseStudentsFilterReturn,
  StudentsFilterSectionProps,
} from './components/SimulatedFilters';

// GeneralOverviewSection Component
export {
  GeneralOverviewSection,
  useGeneralOverview,
} from './components/GeneralOverviewSection';
export type {
  AreaKnowledgePerformance,
  EssayPerformance,
  GeneralOverviewData,
  SubjectItem as GeneralOverviewSubjectItem,
  GeneralOverviewParams,
  GeneralOverviewApiResponse,
  UseGeneralOverviewState,
  UseGeneralOverviewReturn,
  GeneralOverviewSectionProps,
  GeneralOverviewLabels,
} from './components/GeneralOverviewSection';

// AreaKnowledgeSelector Component
export {
  AreaKnowledgeSelector,
  ESSAY_AREA_ID,
} from './components/AreaKnowledgeSelector';
export type { AreaKnowledgeSelectorProps } from './components/AreaKnowledgeSelector';

// SimulatedSubjectMenu Component
export {
  SimulatedSubjectMenu,
  useSimulatedSubjects,
} from './components/SimulatedSubjectMenu';
export type {
  SimulatedSubjectItem,
  SimulatedSubjectsApiResponse,
  UseSimulatedSubjectsState,
  UseSimulatedSubjectsReturn,
  SimulatedSubjectMenuProps,
} from './components/SimulatedSubjectMenu';

// SimulatedStudentRanking Component
export {
  SimulatedStudentRanking,
  SimulatedRankingCard,
} from './components/SimulatedStudentRanking';
export type {
  RankingVariant,
  SimulatedStudentRankingItem,
  SimulatedStudentRankingProps,
  SimulatedRankingCardProps,
} from './components/SimulatedStudentRanking';

// PerformanceDistributionChart Component
export { PerformanceDistributionChart } from './components/PerformanceDistributionChart';
export type {
  SimulatedPerformanceCounters,
  SliceData,
  PerformanceDistributionChartProps,
} from './components/PerformanceDistributionChart';

// SimulatedStudentDetailsModal Component
export {
  SimulatedStudentDetailsModal,
  useSimulatedStudentDetails,
  isStudentSubjectsData,
  isStudentContentsData,
  simulationTypeToActivityFilters,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  PERFORMANCE_TAG_TO_BADGE_ACTION,
  PerformanceBadgeAction,
  ReportSimulationType,
} from './components/SimulatedStudentDetailsModal';
export type {
  SimulatedPerformanceTag,
  SimulatedPerformanceTagConfig,
  SimulationType,
  StudentDetailsInfo,
  SubjectPerformanceItem,
  StudentContentPerformanceItem,
  StudentSubjectsData,
  StudentContentsData,
  StudentDetailsData,
  ActivityFilters as SimulatedActivityFilters,
  StudentDetailsParams,
  StudentDetailsApiResponse,
  UseSimulatedStudentDetailsState,
  UseSimulatedStudentDetailsReturn,
  SimulatedStudentDetailsModalProps,
} from './components/SimulatedStudentDetailsModal';

// SimulatedContentsPerformance Hook
export { useSimulatedContents } from './components/SimulatedContentsPerformance';
export type {
  SimulatedContentItem,
  ContentsPerformanceData,
  SimulatedContentsParams,
  ContentsPerformanceApiResponse,
  UseSimulatedContentsState,
  UseSimulatedContentsReturn,
} from './components/SimulatedContentsPerformance';

// SimulatedContentDetailsModal Component
export {
  SimulatedContentDetailsModal,
  useSimulatedContentDetails,
} from './components/SimulatedContentDetailsModal';
export type {
  ContentDetailsInfo,
  ContentPerformanceCounters,
  ContentStudentItem,
  ContentStudentsPaginated,
  ContentDetailsData,
  ContentDetailsParams,
  ContentDetailsApiResponse,
  UseSimulatedContentDetailsState,
  UseSimulatedContentDetailsReturn,
  SimulatedContentDetailsModalProps,
} from './components/SimulatedContentDetailsModal';

// EssayCompetencies Components
export {
  EssayCompetenciesTable,
  EssayCompetenceDetailsModal,
  useEssayCompetenciesOverview,
  useEssayCompetenceDetails,
} from './components/EssayCompetencies';
export type {
  EssayCompetencyOverviewItem,
  EssayCompetenciesOverviewData,
  EssayCompetenciesOverviewParams,
  EssayCompetenciesOverviewApiResponse,
  EssayCompetenceInfo,
  EssayCompetenceCounters,
  EssayCompetenceStudentItem,
  EssayCompetenceStudentsPaginated,
  EssayCompetenceDetailsData,
  EssayCompetenceDetailsParams,
  EssayCompetenceDetailsApiResponse,
  UseEssayCompetenciesOverviewState,
  UseEssayCompetenciesOverviewReturn,
  UseEssayCompetenceDetailsState,
  UseEssayCompetenceDetailsReturn,
  EssayCompetenciesTableProps,
  EssayCompetenceDetailsModalProps,
} from './components/EssayCompetencies';

// SimulatedStudentsOverview Hook
export { useSimulatedOverview } from './components/SimulatedStudentsOverview';
export type {
  SimulatedStudentItem,
  SimulatedStudentsPaginated,
  SimulatedOverviewData,
  SimulatedOverviewParams,
  SimulatedOverviewApiResponse,
  UseSimulatedOverviewState,
  UseSimulatedOverviewReturn,
} from './components/SimulatedStudentsOverview';

// EssayStudentDetailsModal Component
export {
  EssayStudentDetailsModal,
  useEssayStudentDetails,
} from './components/EssayStudentDetailsModal';
export type {
  EssayCompetencyPerformance,
  EssayStudentInfo,
  EssayStudentDetailsData,
  EssayStudentDetailsParams,
  EssayStudentDetailsApiResponse,
  UseEssayStudentDetailsState,
  UseEssayStudentDetailsReturn,
  EssayStudentDetailsLabels,
  EssayStudentDetailsModalProps,
} from './components/EssayStudentDetailsModal';

// ActivityFilters Component
export {
  ActivityFilters,
  ActivityFiltersPopover,
} from './components/ActivityFilters/ActivityFilters';
export type {
  ActivityFiltersProps,
  ActivityFiltersPopoverProps,
} from './components/ActivityFilters/ActivityFilters';
export type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeItem,
  KnowledgeStructureState,
} from './types/activityFilters';

export type { TablePaginationProps } from './components/Table/Table';

// TableProvider Component
export { TableProvider } from './components/TableProvider';
export type {
  ColumnConfig,
  TableParams,
  PaginationConfig,
  TableProviderProps,
  EmptyStateConfig,
} from './components/TableProvider';

// Select Components
export {
  default as Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from './components/Select/Select';

// SearchSelect Component (Select with search functionality)
export { default as SearchSelect } from './components/SearchSelect/SearchSelect';
export type {
  SearchSelectProps,
  SearchSelectOption,
  SearchSelectPagination,
} from './components/SearchSelect/SearchSelect';

// TypeSelector Component (Activity/Exam type switcher)
export {
  TypeSelector,
  default as TypeSelectorDefault,
} from './components/TypeSelector';
export type { TypeSelectorProps } from './components/TypeSelector';
export {
  type ActivityCategory,
  type ActiveTab,
  type TypeLabels,
  type TypeRoutes,
  type TypeConfig,
  ATIVIDADE_LABELS,
  PROVA_LABELS,
  DEFAULT_STATUS_OPTIONS,
  getTabPath,
  getTabFromPath,
  createActivityCategoryConfig,
} from './components/TypeSelector';

// Menu Components
export {
  default as Menu,
  MenuItem,
  MenuOverflow,
  MenuContent,
} from './components/Menu/Menu';

// PeriodSelector Component
export {
  PeriodSelector,
  Period,
  PERIOD_OPTIONS,
} from './components/PeriodSelector';
export type {
  PeriodTab,
  PeriodValue,
  PeriodSelectorProps,
} from './components/PeriodSelector';

// Card Components
export {
  CardActivitiesResults,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardResults,
  CardSimulado,
  CardStatus,
  CardTopic,
  CardTest,
  CardSimulationHistory,
  CardAudio,
  CardEssayHistory,
  EssayStatus,
  EssayReviewStatus,
} from './components/Card/Card';
export type {
  EssayHistoryItem,
  EssayHistoryData,
} from './components/Card/Card';
export { StatisticsCard } from './components/StatisticsCard/StatisticsCard';
export {
  StudentRanking,
  RankingCard,
} from './components/StudentRanking/StudentRanking';
export type {
  StudentRankingProps,
  StudentRankingItem,
  StudentRankingVariant,
  RankingCardProps,
} from './components/StudentRanking/StudentRanking';
export { QuestionsData } from './components/QuestionsData/QuestionsData';
export type {
  QuestionsDataProps,
  QuestionsDataItem,
} from './components/QuestionsData/QuestionsData';

// Skeleton Components
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from './components/Skeleton/Skeleton';

// Media Components
export { default as NotFound } from './components/NotFound/NotFound';
export { default as RestrictedAccess } from './components/RestrictedAccess/RestrictedAccess';
export type { RestrictedAccessProps } from './components/RestrictedAccess/RestrictedAccess';
export { default as TokenValidation } from './components/TokenValidation/TokenValidation';
export type { TokenValidationProps } from './components/TokenValidation/TokenValidation';
export { default as NoSearchResult } from './components/NoSearchResult/NoSearchResult';
export type { NoSearchResultProps } from './components/NoSearchResult/NoSearchResult';
export { default as EmptyState } from './components/EmptyState/EmptyState';
export type { EmptyStateProps } from './components/EmptyState/EmptyState';
export { default as VideoPlayer } from './components/VideoPlayer/VideoPlayer';
export { default as Whiteboard } from './components/Whiteboard/Whiteboard';
export { default as DownloadButton } from './components/DownloadButton/DownloadButton';

// RichEditor - WYSIWYG editor with LaTeX support (requires @tiptap/* dependencies)
export { RichEditor } from './components/RichEditor/RichEditor';
export { FormulaDialog } from './components/RichEditor/components/FormulaDialog';
export { MathNode } from './components/RichEditor/components/MathNode';
export {
  processLatexInHtml,
  unprocessLatexInHtml,
} from './components/RichEditor/components/utils';
export type {
  DownloadContent,
  DownloadButtonProps,
} from './components/DownloadButton/DownloadButton';

// Auth Components
export type { AuthContextType } from './components/Auth/Auth';
export {
  AuthProvider,
  ProtectedRoute,
  PublicRoute,
  withAuth,
  useAuth,
  useAuthGuard,
  useRouteAuth,
  getRootDomain,
} from './components/Auth/Auth';
export { useTokenInUrl } from './components/Auth/useTokenInUrl';
export {
  CardAccordation,
  AccordionGroup,
} from './components/Accordation/index';
export {
  AlternativesList,
  HeaderAlternative,
} from './components/Alternative/Alternative';
export { createZustandAuthAdapter } from './components/Auth/zustandAuthAdapter';
export { useUrlAuthentication } from './components/Auth/useUrlAuthentication';
export { useApiConfig } from './components/Auth/useApiConfig';

// Quiz Components
export { QuizVariant } from './components/Quiz/Quiz.types';
export {
  QuizTitle,
  Quiz,
  QuizHeader,
  QuizContent,
  QuizQuestionList,
  QuizFooter,
} from './components/Quiz/Quiz';
export {
  getStatusBadge,
  QuizImageQuestion,
  QuizAlternative,
  QuizMultipleChoice,
  QuizDissertative,
  QuizTrueOrFalse,
  QuizConnectDots,
} from './components/Quiz/QuizContent';
export {
  QuizHeaderResult,
  QuizListResult,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizResultPerformance,
  QuizListResultByMateria,
} from './components/Quiz/QuizResult';
export { TeacherFeedbackSection } from './components/Quiz/TeacherFeedbackSection';
export type { TeacherFeedbackSectionProps } from './components/Quiz/TeacherFeedbackSection';
export { useQuizStore } from './components/Quiz/useQuizStore';
export { formatExamInfo } from './components/Quiz/Quiz.utils';

// Quiz Types and Enums
export {
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  QUESTION_STATUS,
  ANSWER_STATUS,
  SUBTYPE_ENUM,
  QUIZ_TYPE,
} from './components/Quiz/useQuizStore';
export { TrueFalseEnum } from './enums/Quiz';
export { SubjectEnum } from './enums/SubjectEnum';
export type {
  QuestionResult,
  Question,
  UserAnswerItem,
  QuizState,
  QuizInterface,
  DraftAnswerItem,
  SaveDraftPayload,
  DraftApiClient,
} from './components/Quiz/useQuizStore';

// Multiple Choice and Icon Components
export { MultipleChoiceList } from './components/MultipleChoice/MultipleChoice';
export { FillInBlanks } from './components/FillInBlanks/FillInBlanks';
export type {
  FillInBlanksProps,
  FillInBlanksOption,
} from './components/FillInBlanks/FillInBlanks';
export { ConnectDots } from './components/ConnectDots/ConnectDots';
export type {
  ConnectDotsProps,
  ConnectDotsOption,
} from './components/ConnectDots/ConnectDots';
export { default as IconRender } from './components/IconRender/IconRender';

// Hooks
export { useMobile, getDeviceType } from './hooks/useMobile';
export type { DeviceType } from './hooks/useMobile';
export { useTheme } from './hooks/useTheme';
export type { ThemeMode } from './hooks/useTheme';
export { useBrandingLogo } from './hooks/useBrandingLogo';
export type {
  BrandingLogoVariant,
  UseBrandingLogoOptions,
} from './hooks/useBrandingLogo';
export { BrandingLogo } from './components/BrandingLogo/BrandingLogo';
export type { BrandingLogoProps } from './components/BrandingLogo/BrandingLogo';
export { UserIcon } from './components/UserIcon/UserIcon';
export type { UserIconProps } from './components/UserIcon/UserIcon';
export { useDraftAutoSave } from './hooks/useDraftAutoSave';
export type {
  ApiClient as DraftApiClientAdapter,
  UseDraftAutoSaveOptions,
} from './hooks/useDraftAutoSave';
export { useCep } from './hooks/useCep';
export type { CepData } from './hooks/useCep';

// BreadcrumbMenu Components
export { BreadcrumbMenu } from './components/BreadcrumbMenu/BreadcrumbMenu';
export type { BreadcrumbMenuProps } from './components/BreadcrumbMenu/BreadcrumbMenu';
export { useBreadcrumbBuilder } from './components/BreadcrumbMenu/useBreadcrumbBuilder';
export type {
  BreadcrumbBuilderConfig,
  BreadcrumbLevel,
  BreadcrumbLevelWithData,
  BreadcrumbLevelStatic,
} from './components/BreadcrumbMenu/useBreadcrumbBuilder';
export { useUrlParams } from './components/BreadcrumbMenu/useUrlParams';
export type { UrlParamsConfig } from './components/BreadcrumbMenu/useUrlParams';
export { useBreadcrumb } from './components/BreadcrumbMenu/breadcrumbStore';
export type { BreadcrumbItem } from './components/BreadcrumbMenu/breadcrumbStore';
// Auth Hooks
export { useAppInitialization } from './hooks/useAppInitialization';
export { useAppContent } from './hooks/useAppContent';
export { useInstitutionId, useInstitution } from './hooks/useInstitution';
export type { InstitutionData } from './hooks/useInstitution';
export { useAuthStore } from './store/authStore';
export { useAppStore } from './store/appStore';
export { useQuestionFiltersStore } from './store/questionFiltersStore';
export type { QuestionFiltersState } from './store/questionFiltersStore';
export { useLessonFiltersStore } from './store/lessonFiltersStore';
export type { LessonFiltersState } from './store/lessonFiltersStore';
export { useModulesStore } from './store/modulesStore';
export type { ModulesState, ModulesConfig } from './store/modulesStore';
export { useModules } from './hooks/useModules';
export type { UseModulesReturn } from './hooks/useModules';
export { ModuleProtectedRoute } from './components/ModuleProtectedRoute';
export type { ModuleProtectedRouteProps } from './components/ModuleProtectedRoute';
export type {
  AuthState,
  SessionInfo,
  AuthTokens,
  User,
  UserProfile,
} from './store/authStore';
export { ActivityCardQuestionBanks } from './components/ActivityCardQuestionBanks/ActivityCardQuestionBanks';
export { ActivityCardQuestionPreview } from './components/ActivityCardQuestionPreview/ActivityCardQuestionPreview';
export { ActivityListQuestions } from './components/ActivityListQuestions/ActivityListQuestions';
export type { ActivityListQuestionsProps } from './components/ActivityListQuestions/ActivityListQuestions';
export type {
  ActivityCardQuestionPreviewProps,
  MatchingPairPreview,
} from './components/ActivityCardQuestionPreview/ActivityCardQuestionPreview';
export { ActivityPreview } from './components/ActivityPreview/ActivityPreview';
export type {
  ActivityPreviewProps,
  PreviewQuestion,
} from './components/ActivityPreview/ActivityPreview';

export { LessonPreview } from './components/LessonPreview/LessonPreview';
export type {
  LessonPreviewProps,
  PreviewLesson,
} from './components/LessonPreview/LessonPreview';

export {
  QuestionsPdfGenerator,
  QuestionsPdfContent,
  useQuestionsPdfPrint,
} from './components/QuestionsPdfGenerator';
export type { QuestionsPdfGeneratorProps } from './components/QuestionsPdfGenerator';
// Utils
export {
  cn,
  getSubjectColorWithOpacity,
  syncDropdownState,
  getSelectedIdsFromCategories,
  toggleArrayItem,
  toggleSingleValue,
  formatScore,
  formatPercentageRounded,
} from './utils/utils';
export { convertActivityFiltersToQuestionsFilter } from './utils/questionFiltersConverter';
export {
  MASK_TYPE,
  applyInputMask,
  formatCep,
  formatCnpj,
  formatCpf,
  formatDocument,
  formatPhone,
  maskCepInput,
  maskCnpjInput,
  maskCpfInput,
  maskPhoneInput,
} from './utils/brazilianFormatters';
export { BR_STATES_FULL, UF_LIST } from './utils/brazilianStates';
export type { UF } from './utils/brazilianStates';
export { default as MaskedInput } from './components/MaskedInput/MaskedInput';
export type { MaskedInputProps } from './components/MaskedInput/MaskedInput';
export { default as HierarchicalCheckboxGroup } from './components/HierarchicalCheckboxGroup/HierarchicalCheckboxGroup';
export type {
  HierarchicalCheckboxGroupItem,
  HierarchicalCheckboxGroupProps,
  HierarchicalCheckboxItem,
  HierarchicalCheckboxItemsLayout,
} from './components/HierarchicalCheckboxGroup/HierarchicalCheckboxGroup';
export {
  mapQuestionTypeToEnum,
  mapQuestionTypeToEnumRequired,
} from './utils/questionTypeUtils';
// Activity Details Types
export {
  STUDENT_ACTIVITY_STATUS,
  ACTIVITY_AVAILABILITY,
  studentActivityStatusSchema,
} from './types/activityDetails';

// Lesson Availability Types
export { LESSON_AVAILABILITY } from './types/lessonAvailability';
export type {
  LessonAvailability,
  LessonAvailabilityResult,
} from './types/lessonAvailability';

// Lesson Availability Utils
export {
  checkLessonAvailability,
  isLessonNotYetAvailable,
  isLessonExpired,
} from './utils/lessonAvailabilityUtils';

// Calendar Activity Utils (timezone-safe date helpers shared by aluno/professor)
export {
  getActivityDateKey,
  getCalendarActivityStatus,
  filterActivitiesFromDate,
} from './utils/calendarActivityUtils';
export type { DatedActivity } from './utils/calendarActivityUtils';

// Activity Details Utils
export {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
  formatActivityDateToBrazilian,
} from './utils/utils';
export type {
  StudentActivityStatus,
  ActivityAvailability,
  ActivityStudentData,
  Pagination as ActivityDetailsPagination,
  GeneralStats,
  QuestionStats,
  ActivityMetadata,
  ActivityDetailsData,
  ActivityDetailsQueryParams,
  ActivityStudentTableItem,
  StatusBadgeConfig,
} from './types/activityDetails';

// Activity Details Component
export { ActivityDetails } from './components/ActivityDetails/ActivityDetails';
export type { ActivityDetailsProps } from './components/ActivityDetails/ActivityDetails';
export { useActivityDetails } from './hooks/useActivityDetails';
export type { UseActivityDetailsReturn } from './hooks/useActivityDetails';

// Support Components
export {
  Support,
  TicketModal,
  getCategoryIcon,
  supportSchema,
} from './components/Support';
export type {
  SupportProps,
  TicketModalProps,
  SupportFormData,
} from './components/Support';

// Support Types
export {
  SupportStatus,
  SupportCategory,
  getStatusBadgeAction,
  getStatusText,
  getCategoryText,
  mapApiStatusToInternal,
  mapInternalStatusToApi,
  SupportType,
} from './types/support';
export type {
  TicketStatus,
  ProblemType,
  TabType,
  SupportResponse,
  SupportTicket,
  CreateSupportTicketRequest,
  CreateSupportTicketResponse,
  SupportTicketAPI,
  SupportPagination,
  GetSupportTicketsResponse,
  SupportAnswerAPI,
  GetSupportAnswersResponse,
  SubmitSupportAnswerRequest,
  SubmitSupportAnswerResponse,
  SupportApiClient,
  SupportFeatureFlags,
} from './types/support';

// Zendesk Widget Component
export { ZendeskWidget } from './components/ZendeskWidget';
export type { ZendeskWidgetProps } from './components/ZendeskWidget';

// Support Feature Flag Hook
export { useSupportFeatureFlag } from './hooks/useSupportFeatureFlag';
export type {
  UseSupportFeatureFlagConfig,
  UseSupportFeatureFlagReturn,
} from './hooks/useSupportFeatureFlag';

// SendActivityModal Component
export { SendActivityModal } from './components/SendActivityModal';
export { useSendActivityModal } from './components/SendActivityModal';
export type {
  SendActivityModalProps,
  SendActivityFormData,
  ActivitySubtype,
  StepErrors,
  StepState,
  StepConfig,
  SendActivityModalInitialData,
} from './components/SendActivityModal';
export {
  validateActivityStep,
  validateRecipientStep,
  validateDeadlineStep,
  validateStep,
  isStepValid,
  isFormValid,
  ERROR_MESSAGES,
} from './components/SendActivityModal';

// ChooseActivityModelModal Component
export { ChooseActivityModelModal } from './components/ChooseActivityModelModal';
export type { ChooseActivityModelModalProps } from './components/ChooseActivityModelModal';

// SaveActivityModelModal Component
export { SaveActivityModelModal } from './components/SaveActivityModelModal';
export type { SaveActivityModelModalProps } from './components/SaveActivityModelModal';

// SendLessonModal Component
export { SendLessonModal } from './components/SendLessonModal';
export { useSendLessonModal } from './components/SendLessonModal';
export type {
  SendLessonModalProps,
  SendLessonFormData,
  StepErrors as SendLessonStepErrors,
  StepState as SendLessonStepState,
  StepConfig as SendLessonStepConfig,
} from './components/SendLessonModal';

// Recommended Lessons / RecommendedClass History Component
export {
  RecommendedLessonsHistory,
  RecommendedClassPageTab,
} from './components/RecommendedLessonsHistory';
export type { RecommendedLessonsHistoryProps } from './components/RecommendedLessonsHistory';

// Recommended Lesson Details Component
export {
  RecommendedLessonDetails,
  StudentPerformanceModal,
} from './components/RecommendedLessonDetails';
export type {
  RecommendedLessonDetailsProps,
  StudentPerformanceModalProps,
  StudentPerformanceData,
  StudentPerformanceLabels,
  LessonProgress,
  LessonQuestion,
  QuestionAlternative,
  LessonDetailsLabels,
  DisplayStudent,
} from './components/RecommendedLessonDetails';

// Recommended Lessons Hook Factory
export {
  createUseRecommendedLessonsHistory,
  createRecommendedLessonsHistoryHook,
  determineRecommendedClassStatus,
  transformRecommendedClassToTableItem,
  handleRecommendedClassFetchError,
  recommendedClassHistoryApiResponseSchema,
} from './hooks/useRecommendedLessons';
export type {
  UseRecommendedLessonsHistoryState,
  UseRecommendedLessonsHistoryReturn,
} from './hooks/useRecommendedLessons';

// Recommended Lessons Page Hook Factory
export {
  createUseRecommendedLessonsPage,
  createRecommendedLessonsPageHook,
} from './hooks/useRecommendedLessonsPage';
export type {
  UseRecommendedLessonsPageConfig,
  UseRecommendedLessonsPageReturn,
  RecommendedLessonsApiClient,
  RecommendedLessonsUserData,
  RecommendedLessonsPagePaths,
  RecommendedLessonsPageEndpoints,
  RecommendedLessonsPageTexts,
  UserInstitution as RecommendedLessonsUserInstitution,
  SubTeacherTopicClass as RecommendedLessonsSubTeacherTopicClass,
} from './hooks/useRecommendedLessonsPage';

// Recommended Lesson Details Hook Factory
export {
  createUseRecommendedLessonDetails,
  createRecommendedLessonDetailsHook,
  handleLessonDetailsFetchError,
  recommendedClassApiResponseSchema,
  recommendedClassDetailsApiResponseSchema,
  historyApiResponseSchema,
} from './hooks/useRecommendedLessonDetails';
export type {
  UseRecommendedLessonDetailsState,
  UseRecommendedLessonDetailsReturn,
  LessonDetailsApiClient,
} from './hooks/useRecommendedLessonDetails';

// Recommended Lessons Types
export {
  RecommendedClassApiStatus,
  RecommendedClassDisplayStatus,
  RecommendedClassBadgeActionType,
  getRecommendedClassStatusBadgeAction,
  RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS,
  RECOMMENDED_CLASS_STATUS_OPTIONS,
  StudentLessonStatus,
  getStudentStatusBadgeAction,
  isDeadlinePassed,
  deriveStudentStatus,
  formatDaysToComplete,
  RecommendedClassDraftType,
  RECOMMENDED_CLASS_ACTIVITY_STATUS,
} from './types/recommendedLessons';
export type {
  RecommendedClassSubject,
  RecommendedClassCreator,
  RecommendedClassStats,
  RecommendedClassBreakdown,
  RecommendedClassData,
  RecommendedClassHistoryItem,
  RecommendedClassTableItem,
  RecommendedClassHistoryApiResponse,
  RecommendedClassHistoryFilters,
  RecommendedClassHistoryPagination,
  RecommendedClassFilterOption,
  RecommendedClassUserFilterData,
  // Lesson Details API Types
  RecommendedClassDetailStudent,
  RecommendedClassDetailAggregated,
  RecommendedClassDetailContentPerformanceItem,
  RecommendedClassDetailContentPerformance,
  RecommendedClassDetailsData,
  RecommendedClassDetailsApiResponse,
  RecommendedClassLessonSubject,
  RecommendedClassLesson,
  RecommendedClassLessonProgress,
  RecommendedClassLessonsItem,
  RecommendedClassMetadata,
  RecommendedClassApiResponse,
  LessonDetailsData,
  // RecommendedClass Models Types
  RecommendedClassModelResponse,
  RecommendedClassModelTableItem,
  RecommendedClassModelsApiResponse,
  RecommendedClassModelFilters,
  RecommendedClassModelPagination,
  // RecommendedClass Activity Types
  RecommendedClassActivityStatus,
  RecommendedClassActivity,
  RecommendedClassSupUsersActivities,
  RecommendedClassActivities,
} from './types/recommendedLessons';

// RecommendedClass Models Hook Factory
export {
  createUseRecommendedClassModels,
  createRecommendedClassModelsHook,
  transformRecommendedClassModelToTableItem,
  handleRecommendedClassModelFetchError,
  recommendedClassModelsApiResponseSchema,
  DEFAULT_RECOMMENDED_CLASS_MODELS_PAGINATION,
} from './hooks/useRecommendedClassModels';
export type {
  UseRecommendedClassModelsState,
  UseRecommendedClassModelsReturn,
} from './hooks/useRecommendedClassModels';

// RecommendedClass Drafts Hook Factory
export {
  createUseRecommendedClassDrafts,
  createRecommendedClassDraftsHook,
  handleRecommendedClassDraftFetchError,
  DEFAULT_RECOMMENDED_CLASS_DRAFTS_PAGINATION,
} from './hooks/useRecommendedClassDrafts';
export type {
  UseRecommendedClassDraftsState,
  UseRecommendedClassDraftsReturn,
} from './hooks/useRecommendedClassDrafts';

// RecommendedClass Drafts Tab Component
export { RecommendedClassDraftsTab } from './components/RecommendedLessonsHistory/tabs/DraftsTab';
export type { RecommendedClassDraftsTabProps } from './components/RecommendedLessonsHistory/tabs/DraftsTab';

// Activities History Component
export { ActivitiesHistory } from './components/ActivitiesHistory';
export type { ActivitiesHistoryProps } from './components/ActivitiesHistory';

// Activity Page Layout Component
export {
  ActivityPageLayout,
  ActivityTab,
} from './components/ActivityPageLayout';
export type { ActivityPageLayoutProps } from './components/ActivityPageLayout';

// Unified History Page Component
export { UnifiedHistoryPage } from './components/UnifiedHistoryPage';
export type {
  UnifiedHistoryPageProps,
  UserData as UnifiedHistoryPageUserData,
  ApiFilterOptions as UnifiedHistoryPageApiFilterOptions,
} from './components/UnifiedHistoryPage';

// Unified Draft Model Page Component
export { UnifiedDraftModelPage } from './components/UnifiedDraftModelPage';
export type {
  UnifiedDraftModelPageProps,
  UserData as UnifiedDraftModelPageUserData,
} from './components/UnifiedDraftModelPage';

// Activities History Hook Factory
export {
  createUseActivitiesHistory,
  createActivitiesHistoryHook,
  transformActivityToTableItem,
  extractActivityFilterOptions,
  DEFAULT_ACTIVITIES_PAGINATION,
  DEFAULT_ACTIVITY_FILTER_OPTIONS,
} from './hooks/useActivitiesHistory';
export type {
  UseActivitiesHistoryOptions,
  UseActivitiesHistoryState,
  UseActivitiesHistoryReturn,
  ActivityApiFilterOptions,
} from './hooks/useActivitiesHistory';

// Activity Drafts Hook Factory
export {
  createUseActivityDrafts,
  createActivityDraftsHook,
  transformDraftToTableItem as transformActivityDraftToTableItem,
  DEFAULT_DRAFTS_PAGINATION,
} from './hooks/useActivityDrafts';
export type {
  UseActivityDraftsOptions,
  UseActivityDraftsState,
  UseActivityDraftsReturn,
} from './hooks/useActivityDrafts';

// Activity Models Hook Factory
export {
  createUseActivityModels,
  createActivityModelsHook,
  transformModelToTableItem,
  DEFAULT_MODELS_PAGINATION,
} from './hooks/useActivityModels';

// Activity Draft Model Page Hook (shared logic for drafts/models pages)
export { useActivityDraftModelPage } from './hooks/useActivityDraftModelPage';
export type {
  UseActivityDraftModelPageOptions,
  UseActivityDraftModelPageReturn,
} from './hooks/useActivityDraftModelPage';
export type {
  UseActivityModelsOptions,
  UseActivityModelsState,
  UseActivityModelsReturn,
} from './hooks/useActivityModels';

// Students Highlight Hook Factory
export {
  createUseStudentsHighlight,
  createStudentsHighlightHook,
  calculatePerformancePercentage,
  transformStudentHighlightItem,
  handleStudentsHighlightFetchError,
  studentsHighlightApiResponseSchema,
  PERIOD_TABS,
} from './hooks/useStudentsHighlight';
export type {
  StudentsHighlightPeriod,
  StudentsHighlightType,
  TrendDirection,
  StudentsHighlightFilters,
  StudentHighlightApiItem,
  StudentsHighlightApiResponse,
  StudentHighlightItem,
  UseStudentsHighlightState,
  UseStudentsHighlightReturn,
} from './hooks/useStudentsHighlight';

// Questions Data Hook Factory
export {
  createUseQuestionsData,
  createQuestionsDataHook,
  transformQuestionsData,
  handleQuestionsDataFetchError,
  questionsDataApiResponseSchema,
} from './hooks/useQuestionsData';
export type {
  QuestionsDataPeriod,
  QuestionsDataTrendDirection,
  QuestionsDataFilters,
  QuestionsDataTrend,
  QuestionsDataApiData,
  QuestionsDataApiResponse,
  QuestionsDataHookResult,
  UseQuestionsDataState,
  UseQuestionsDataReturn,
} from './hooks/useQuestionsData';

// Activities History Types
export {
  ActivityApiStatus,
  ActivityDisplayStatus,
  ActivityBadgeActionType,
  ActivityDraftType,
  getActivityStatusBadgeAction,
  mapActivityStatusToDisplay,
  ACTIVITY_FILTER_STATUS_OPTIONS,
} from './types/activitiesHistory';
export type {
  ActivityHistoryResponse,
  ActivityTableItem,
  ActivityPagination,
  ActivitiesHistoryApiResponse,
  ActivityHistoryFilters,
  ActivityDraftFilters,
  ActivityModelResponse,
  ActivityModelTableItem,
  ActivityModelsApiResponse,
  ActivityModelFilters,
  ActivityFilterOption,
  ActivityUserFilterData,
} from './types/activitiesHistory';

// Subject Mappers
export {
  mapSubjectNameToEnum,
  mapSubjectEnumToName,
} from './utils/subjectMappers';

// Subject Cell Renderer
export { renderSubjectCell } from './utils/renderSubjectCell';
export { renderTextCell } from './utils/renderTextCell';

// Filter Helpers (robust version with deduplication)
export {
  getSchoolOptionsFromUserData,
  getSubjectOptionsFromUserData,
  getSchoolYearOptionsFromUserData,
  getClassOptionsFromUserData,
  buildUserFilterData,
  mergeFilterOptions,
} from './utils/filterHelpers';
export type {
  UserInstitutionData,
  SubTeacherTopicClassData,
  UserFilterSourceData,
} from './utils/filterHelpers';

// Draft Model Filter Helpers
export { createDraftsModelsFiltersConfig } from './utils/draftModelFilterHelpers';

// Pagination Types
export type { PaginationData } from './types/pagination';

// Chat Hooks
export { useChat, createUseChat, WS_STATES } from './hooks/useChat';
export type { UseChatOptions, UseChatReturn } from './hooks/useChat';
export { useChatRooms, createUseChatRooms } from './hooks/useChatRooms';
export type {
  UseChatRoomsOptions,
  UseChatRoomsReturn,
} from './hooks/useChatRooms';

// Chat Types
export { CHAT_MESSAGE_TYPES, PROFILE_ROLES } from './types/chat';
export type {
  ChatMessageType,
  ChatUser,
  AvailableUsers,
  ChatRoom,
  ChatRoomWithDetails,
  ChatMessage,
  ChatParticipant,
  WSUserInfo,
  WSClientMessageType,
  WSServerMessageType,
  WSClientMessage,
  WSServerMessage,
  ChatApiClient,
  AvailableUsersResponse,
  CreateRoomResponse,
  GetRoomsResponse,
  GetRoomDetailsResponse,
} from './types/chat';

// Chat Component
export { Chat, ChatLoading } from './components/Chat';
export type { ChatProps } from './components/Chat';

// Chat Utils
export {
  getChatWsUrl,
  getChatUserInfo,
  isChatUserInfoValid,
} from './utils/chatUtils';
export type { ChatUserInfo } from './utils/chatUtils';

// Chatbot Hook
export { createUseChatbot } from './hooks/useChatbot';
export type { UseChatbotReturn } from './hooks/useChatbot';

// Chatbot Types
export { CHATBOT_MESSAGE_ROLES } from './types/chatbot';
export type {
  ChatbotRole,
  ChatbotMessage as ChatbotMessageData,
  ChatbotConversation,
  ChatbotCurrentContext,
  SendChatbotMessagePayload,
  SendChatbotMessageResult,
  ChatbotUser,
  ChatbotApiClient,
} from './types/chatbot';

// Chatbot Components
export {
  Chatbot,
  ChatbotFab,
  ChatbotPanel,
  ChatbotMessageList,
  ChatbotMessage,
  ChatbotInput,
  ChatbotTypingIndicator,
  ChatbotConversationList,
  ChatbotContentRenderer,
} from './components/Chatbot';
export type {
  ChatbotProps,
  ChatbotFabProps,
  ChatbotPanelProps,
  ChatbotMessageListProps,
  ChatbotMessageProps,
  ChatbotInputProps,
  ChatbotTypingIndicatorProps,
  ChatbotConversationListProps,
  ChatbotContentRendererProps,
} from './components/Chatbot';

// Accessibility Widget
export {
  AccessibilityWidget,
  AccessibilityFab,
  AccessibilityPanel,
  LibrasFab,
  VLibrasLoader,
  ReadingAid,
  ColorBlindFilters,
  TTSController,
  WebSpeechProvider,
} from './components/AccessibilityWidget';
export type {
  AccessibilityWidgetProps,
  AccessibilityFabProps,
  AccessibilityFabPosition,
  AccessibilityFabVerticalAlign,
  AccessibilityPanelProps,
  LibrasFabProps,
  TTSProvider,
  TTSVoice,
  TTSSpeakOptions,
  TTSProviderEvents,
} from './components/AccessibilityWidget';

// Accessibility Store + Hook
export {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  ColorBlindMode,
  getColorBlindClass,
  getColorBlindFilterId,
} from './store/accessibilityStore';
export type {
  AccessibilityStore,
  AccessibilityState,
  AccessibilityActions,
  AccessibilityPreferences,
  ContrastMode,
  SaturationMode,
  FontSizeLevel,
  SpacingLevel,
  ReadingAid as ReadingAidMode,
  TTSMode,
  TTSStatus,
} from './store/accessibilityStore';
export { useA11yPreferences } from './hooks/useA11yPreferences';
export { useA11yKeyboardShortcut } from './hooks/useA11yKeyboardShortcut';
export { useTTS } from './hooks/useTTS';
export type { UseTTSReturn } from './hooks/useTTS';

// Forum Component
export { Forum } from './components/Forum/Forum';
export type { ForumProps } from './components/Forum/Forum';

// Forum Hook
export { createUseForum } from './hooks/useForum';
export type { UseForumReturn } from './hooks/useForum';

// Forum Types
export type {
  ForumPostBase,
  ForumTopic,
  ForumReply,
  ForumPagination,
  ForumTopicsResponse,
  ForumTopicDetailResponse,
  ForumApiClient,
} from './types/forum';

// General Activity Types (calendar, activity list)
export {
  ActivityStatus as GeneralActivityStatus,
  ActivityFilter,
  CalendarActivityStatus,
} from './types/activities';
export type {
  Activity,
  CalendarActivity,
  ActivityResponse,
  CalendarActivitiesResponse,
} from './types/activities';

// Send Activity Hook
export { useSendActivity } from './hooks/useSendActivity';
export type {
  UseSendActivityConfig,
  UseSendActivityReturn,
  SendActivityCategoriesData,
  CreateActivityPayload,
  StudentPayload,
  ActivityModelItem,
  RecipientItem as SendActivityRecipientItem,
} from './types/sendActivity';

// Performance Types and Utils
export {
  PERFORMANCE_TAG_CONFIG,
  getPerformanceTag,
  getPerformanceTagConfig,
} from './types/performance';
export { PerformanceTag } from './types/performance';
export type { PerformanceTagConfig, TimeInterval } from './types/performance';

// Student Performance Details Modal
export { StudentPerformanceDetailsModal } from './components/StudentPerformanceDetailsModal';
export type {
  StudentPerformanceDetailsModalProps,
  StudentPerformanceDetailsData,
  StudentPerformanceDetailsLabels,
  ActivityProgress,
} from './components/StudentPerformanceDetailsModal';

// Student Lesson Progress Modal
export { StudentLessonProgressModal } from './components/StudentLessonProgressModal';
export type {
  StudentLessonProgressModalProps,
  StudentLessonProgressData,
  StudentLessonProgressLabels,
  TopicProgressItem,
  SubtopicProgressItem,
  ContentProgressItem,
  LessonProgressStatus,
} from './components/StudentLessonProgressModal';
export { DEFAULT_LESSON_PROGRESS_LABELS } from './components/StudentLessonProgressModal';

// TimeChart Components
export {
  TimeChart,
  TIME_CHART_CATEGORY_KEY,
  STUDENT_CATEGORIES,
  DEFAULT_CATEGORIES,
  calculateHourTicks,
  bgClassToCssVar,
} from './components/TimeChart/TimeChart';
export type {
  TimeChartProps,
  TimeChartData,
  TimeChartCategory,
  TimeChartDayData,
  TimeChartRequest,
  TimeChartStudentPeriodItem,
  TimeChartStudentItemBreakdown,
  TimeChartStudentData,
  TimeChartDefaultPeriodItem,
  TimeChartDefaultItemBreakdown,
  TimeChartDefaultData,
  TimeChartResponse,
} from './components/TimeChart/TimeChart';

// TimeReport Components
export {
  TimeReport,
  TimeCard,
  formatHoursToTime,
  getTrendDirection,
  formatVariation,
} from './components/TimeReport/TimeReport';
export type {
  TimeReportProps,
  TimeCardProps,
  TimeReportTab,
  TimeCardData,
  TimeCardTrend,
  TimeReportPeriod,
  TimeReportRequest,
  TimeMetric,
  TimeReportData,
  TimeReportResponse,
} from './components/TimeReport/TimeReport';

// PerformanceReport Components
export {
  PerformanceReport,
  PerformanceCard,
} from './components/PerformanceReport/PerformanceReport';
export type {
  PerformanceReportProps,
  PerformanceCardProps,
  PerformanceReportTab,
  PerformanceCardData,
  PerformanceReportPeriod,
  PerformanceReportRequest,
  PerformanceStudentData,
  PerformanceDefaultData,
  PerformanceReportResponse,
} from './components/PerformanceReport/PerformanceReport';

// PerformanceQuestionsData Components
export {
  PerformanceQuestionsData,
  PerformanceQuestionsVariant,
} from './components/PerformanceQuestionsData/PerformanceQuestionsData';
export type {
  PerformanceQuestionsDataProps,
  QuestionsVariantData,
  ContentVariantData,
  PerformanceFilterOption,
  PerformanceFilterConfig,
  PerformanceQuestionsPeriod,
  PerformanceQuestionsRequest,
  PerformanceQuestionsStudentResponse,
  PerformanceQuestionsDefaultResponse,
} from './components/PerformanceQuestionsData/PerformanceQuestionsData';

// PerformanceRanking Components
export { PerformanceRanking } from './components/PerformanceRanking/PerformanceRanking';
export type {
  PerformanceRankingProps,
  PerformanceRankingItem,
  PerformanceRankingData,
  GroupedBy,
} from './components/PerformanceRanking/PerformanceRanking';

// PerformanceReportModal Components
export {
  PerformanceReportModal,
  PerformanceReportModalVariant,
} from './components/PerformanceReportModal/PerformanceReportModal';
export type {
  PerformanceReportModalProps,
  UserPerformanceRequest,
  UserPerformanceQuestionStats,
  UserPerformanceMaterialStats,
  UserPerformanceLesson,
  UserPerformanceStudentData,
  UserPerformanceProfessionalData,
} from './components/PerformanceReportModal/PerformanceReportModal';

// AccessReportModal Components
export {
  AccessReportModal,
  AccessReportModalVariant,
} from './components/AccessReportModal/AccessReportModal';
export type {
  AccessReportModalProps,
  AccessReportStudentData,
  AccessReportProfessionalData,
  AccessReportTimePercentage,
  AccessReportUser,
  AccessReportByPlatform,
} from './components/AccessReportModal/AccessReportModal';

// DownloadModal Components
export { default as DownloadModal } from './components/DownloadModal/DownloadModal';
export { DOWNLOAD_FORMAT } from './enums/DownloadFormat';
export { FILTER_CATEGORY, FILTER_GROUP } from './enums/FilterEnums';
export type {
  DownloadModalProps,
  DownloadFormat,
} from './components/DownloadModal/DownloadModal';

// PrintableUsersTable Component
export { default as PrintableUsersTable } from './components/PrintableUsersTable/PrintableUsersTable';
export type { PrintableUsersTableProps } from './components/PrintableUsersTable/PrintableUsersTable';

// Report Export Utils
export { downloadExcel } from './utils/exportExcel';
export { printAsPdf } from './utils/exportPdf';

// Report Export Types
export type { ExcelCell, SheetConfig } from './utils/exportExcel';

// SimulatedPerformance Component
export {
  useSimulatedPerformance,
  SimulatedPerformanceView,
  SCORE_TYPE_OPTIONS,
  SimulatedViewTab,
} from './components/SimulatedPerformance';
export type {
  UseSimulatedPerformanceOptions,
  UseSimulatedPerformanceReturn,
  SimulatedPerformanceViewProps,
} from './components/SimulatedPerformance';

// Profile Aggregation Utils
export {
  getAggregationTypeByProfile,
  shouldUseAggregatedOverview,
} from './utils/profileAggregation';

// Aggregated Overview Hook
export { useAggregatedOverview } from './components/SimulatedStudentsOverview';
export type {
  OverviewAggregationType,
  ClassOverviewItem,
  MunicipalityOverviewItem,
  StudentsOnlyOverviewData,
  ClassesOverviewData,
  MunicipalitiesOverviewData,
  AggregatedOverviewData,
  AggregatedOverviewParams,
  UseAggregatedOverviewState,
  UseAggregatedOverviewReturn,
} from './components/SimulatedStudentsOverview';
// Simulations Component (teacher-facing list + nested detail modal)
export {
  SimulationsPage,
  SimulationsDetailModal,
} from './components/SimulationsPage';
export type {
  SimulationsPageProps,
  SimulationsDetailModalProps,
} from './components/SimulationsPage';
export { createUseSimulations } from './hooks/useSimulations';
export type { UseSimulationsReturn } from './hooks/useSimulations';
export type {
  SimulationsStudentItem,
  SimulationsStudentsPage,
  SimulationsStudentsResponse,
  SimulationsStudentsFilters,
  StudentSimulationItem,
  SimulationsListData,
  SimulationsListResponse,
  SimulationsListFilters,
  SimulationQuestionStatus,
  SimulationDetailOption,
  SimulationDetailQuestion,
  SimulationDetailData,
  SimulationDetailResponse,
  NoteData,
  NoteResponse,
} from './types/simulations';

// ComparatorChart Components
export {
  // Base chart components
  Legend as ComparatorLegend,
  PercentageScale,
  ChartArea,
  BarChartRow,
  // Content components
  KnowledgeAreasContent,
  CurricularComponentsContent,
  CompetenciesContent,
  NationalAverageCard,
  NationalAveragesContent,
  // UI components
  ComparatorEmptyState,
  ComparatorLoadingState,
  ComparatorSelectTypeStep,
  ComparatorSelectItemsStep,
  ComparatorTabContent,
  // Main view
  ComparatorView,
} from './components/ComparatorChart';
export type {
  LegendProps as ComparatorLegendProps,
  LegendItem as ComparatorLegendItem,
  ChartAreaProps,
  BarChartRowProps,
  BarChartValue,
  KnowledgeAreasContentProps,
  CurricularComponentsContentProps,
  CompetenciesContentProps,
  NationalAverageCardProps,
  NationalAveragesContentProps,
  ComparatorEmptyStateProps,
  ComparatorSelectTypeStepProps,
  ComparatorSelectItemsStepProps,
  ComparatorTabContentProps,
  ComparatorViewProps,
} from './components/ComparatorChart';

// Comparator Types
export {
  ComparatorTabValue,
  DEFAULT_COMPARATOR_LABELS,
  DEFAULT_COMPARATOR_TABS,
  COMPARATOR_CHART_COLORS,
} from './types/comparator';
export type {
  ComparisonType,
  ComparatorTabType,
  ComparisonItem,
  KnowledgeAreaData,
  CurricularComponentData,
  CompetencyData,
  NationalAverageData,
  ComparatorData,
  ComparatorApiClient,
  ComparatorStoreState,
  UseComparatorReturn,
  ComparatorLabels,
  ComparatorTab,
} from './types/comparator';

// Comparator Hook
export {
  createUseComparator,
  createComparatorHook,
} from './hooks/useComparator';
export type { UseComparatorConfig } from './hooks/useComparator';

// Comparator Store
export {
  createComparatorStore,
  useComparatorStore,
} from './store/comparatorStore';
export type { CreateComparatorStoreConfig } from './store/comparatorStore';

// User Store
export { createUserStore } from './store/userStore';
export type {
  CreateUserStoreConfig,
  UserStoreApiClient,
  UserStoreState,
} from './store/userStore';

// User Types
export type {
  User as UserData,
  UserInfos,
  Profile,
  Institution,
  School as UserSchool,
  SchoolYear as UserSchoolYear,
  Class as UserClass,
  UserInstitution,
  Subject as UserSubject,
  SubTeacherTopicClass,
  MyDataResponse,
  UpdateMyDataRequest,
  UserTelemetryData,
  StudentDetailsResponse,
} from './types/user';

// Exam Types
export {
  ExamStatus,
  ExamDisplayStatus,
  mapExamStatusToDisplay,
} from './types/examsHistory';
export type {
  ExamFilterOption,
  ExamApiFilterOptions,
  ExamSubject,
  ExamBreakdownItem,
  ExamHistoryResponse,
  ExamTableItem,
  ExamsHistoryApiResponse,
  ExamHistoryFilters,
  ExamPagination,
} from './types/examsHistory';

export { ExamDraftType, ExamActivityCategory } from './types/examDrafts';
export type {
  ExamDraftFilters,
  ExamModelResponse,
  ExamModelTableItem,
  ExamModelsApiResponse,
  ExamModelFilters,
  ExamModelsPagination,
} from './types/examDrafts';

// Exam Hooks Factories
export {
  createUseExamsHistory,
  createExamsHistoryHook,
  transformExamToTableItem,
  handleExamFetchError,
  extractExamFilterOptions,
  DEFAULT_EXAMS_PAGINATION,
  DEFAULT_EXAM_FILTER_OPTIONS,
} from './hooks/useExamsHistory';
export type {
  UseExamsHistoryState,
  UseExamsHistoryReturn,
} from './hooks/useExamsHistory';

// NOTE: useExamDrafts and useExamModels removed - use createUseActivityDrafts/createUseActivityModels with { activityCategory: 'PROVA' }

// Exam Page Layout Component
export { ExamPageLayout, ExamTab } from './components/ExamPageLayout';
export type { ExamPageLayoutProps } from './components/ExamPageLayout';

// Exam Table Configs
export {
  examsTableColumns,
  getExamStatusBadgeAction,
  createExamDraftsModelsTableColumns,
} from './components/ExamPageLayout';
export type { ExamTableCallbacks } from './components/ExamPageLayout';

// Answer Sheet Preview Components
export {
  AnswerSheetPreview,
  AnswerSheetsBatchPreview,
  AnswerSheetCard,
  CardContainer as AnswerSheetCardContainer,
  PageContainer as AnswerSheetPageContainer,
  PrintStyles as AnswerSheetPrintStyles,
} from './components/ExamPageLayout';
export type {
  AnswerSheetPreviewProps,
  AnswerSheetsBatchPreviewProps,
  AnswerSheetData,
  AnswerSheetCardProps,
} from './components/ExamPageLayout';

// Exam Filter Helpers
export {
  EXAM_STATUS_OPTIONS,
  EXAM_FILTER_CATEGORY,
  EXAM_FILTER_GROUP,
  createExamDraftsModelsFiltersConfig,
  createExamHistoryFiltersConfig,
} from './utils/examFilterHelpers';

// Exam Details Types
export {
  StudentAnswerStatus,
  StudentAnswerDisplayStatus,
} from './types/examDetails';
export type {
  ExamStudentResult,
  ExamStudentTableItem,
  ExamStats,
  ExamDetailsData,
  ExamDetailsPagination,
  ExamDetailsFilters,
} from './types/examDetails';

// Exam Details Hook Factory
export {
  createUseExamDetails,
  createExamDetailsHook,
  transformStudent,
  mapBackendStatusToFrontend,
  handleExamDetailsFetchError,
  DEFAULT_EXAM_DETAILS_PAGINATION,
} from './hooks/useExamDetails';
export type {
  UseExamDetailsState,
  UseExamDetailsReturn,
} from './hooks/useExamDetails';

// Exam Details Layout Components
export {
  ExamDetailsHeader,
  ExamStatsCards,
  formatQuestions,
  ExamStudentsTable,
  createExamStudentsTableColumns,
  getExamStudentStatusBadgeAction,
  getExamStudentStatusDisplayText,
  ExamDetailsPage,
} from './components/ExamDetailsLayout';
export type {
  ExamDetailsHeaderProps,
  ExamStatsCardsProps,
  ExamStudentsTableProps,
  ExamDetailsPageProps,
} from './components/ExamDetailsLayout';
