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
export { default as IconButton } from './components/IconButton/IconButton';
export { default as IconRoundedButton } from './components/IconRoundedButton/IconRoundedButton';
export { default as NavButton } from './components/NavButton/NavButton';
export { default as SelectionButton } from './components/SelectionButton/SelectionButton';
export { default as CheckBox } from './components/CheckBox/CheckBox';
export { default as ImageUpload } from './components/ImageUpload/ImageUpload';
export type { ImageUploadProps } from './components/ImageUpload/ImageUpload';
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
} from './types/studentActivityCorrection';
export type {
  QuestionStatus as CorrectionQuestionStatus,
  StudentQuestion,
  StudentActivityCorrectionData,
} from './types/studentActivityCorrection';

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
export { default as NotificationCard } from './components/NotificationCard/NotificationCard';
export { ThemeToggle } from './components/ThemeToggle/ThemeToggle';

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

// Menu Components
export {
  default as Menu,
  MenuItem,
  MenuOverflow,
  MenuContent,
} from './components/Menu/Menu';

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
} from './components/Card/Card';
export { StatisticsCard } from './components/StatisticsCard/StatisticsCard';

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
export { default as NoSearchResult } from './components/NoSearchResult/NoSearchResult';
export type { NoSearchResultProps } from './components/NoSearchResult/NoSearchResult';
export { default as EmptyState } from './components/EmptyState/EmptyState';
export type { EmptyStateProps } from './components/EmptyState/EmptyState';
export { default as VideoPlayer } from './components/VideoPlayer/VideoPlayer';
export { default as Whiteboard } from './components/Whiteboard/Whiteboard';
export { default as DownloadButton } from './components/DownloadButton/DownloadButton';
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
export {
  CardAccordation,
  AccordionGroup,
} from './components/Accordation/index';
export { AlternativesList } from './components/Alternative/Alternative';
export { createZustandAuthAdapter } from './components/Auth/zustandAuthAdapter';
export { useUrlAuthentication } from './components/Auth/useUrlAuthentication';
export { useApiConfig } from './components/Auth/useApiConfig';

// Quiz Components
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
export { useQuizStore } from './components/Quiz/useQuizStore';

// Quiz Types and Enums
export {
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  QUESTION_STATUS,
  ANSWER_STATUS,
  SUBTYPE_ENUM,
  QUIZ_TYPE,
} from './components/Quiz/useQuizStore';
export { SubjectEnum } from './enums/SubjectEnum';
export type {
  QuestionResult,
  Question,
  UserAnswerItem,
  QuizState,
  QuizInterface,
} from './components/Quiz/useQuizStore';

// Multiple Choice and Icon Components
export { MultipleChoiceList } from './components/MultipleChoice/MultipleChoice';
export { default as IconRender } from './components/IconRender/IconRender';

// Hooks
export { useMobile, getDeviceType } from './hooks/useMobile';
export type { DeviceType } from './hooks/useMobile';
export { useTheme } from './hooks/useTheme';
export type { ThemeMode } from './hooks/useTheme';

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
export { useInstitutionId } from './hooks/useInstitution';
export { useAuthStore } from './store/authStore';
export { useAppStore } from './store/appStore';
export { useQuestionFiltersStore } from './store/questionFiltersStore';
export type { QuestionFiltersState } from './store/questionFiltersStore';
export type { AuthState } from './store/authStore';
export { ActivityCardQuestionBanks } from './components/ActivityCardQuestionBanks/ActivityCardQuestionBanks';
export { ActivityCardQuestionPreview } from './components/ActivityCardQuestionPreview/ActivityCardQuestionPreview';
export type { ActivityCardQuestionPreviewProps } from './components/ActivityCardQuestionPreview/ActivityCardQuestionPreview';
export { ActivityPreview } from './components/ActivityPreview/ActivityPreview';
export type {
  ActivityPreviewProps,
  PreviewQuestion,
} from './components/ActivityPreview/ActivityPreview';

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
} from './utils/utils';
export { convertActivityFiltersToQuestionsFilter } from './utils/questionFiltersConverter';
export {
  mapQuestionTypeToEnum,
  mapQuestionTypeToEnumRequired,
} from './utils/questionTypeUtils';
// Activity Details Types
export {
  STUDENT_ACTIVITY_STATUS,
  ACTIVITY_AVAILABILITY,
} from './types/activityDetails';

// Activity Details Utils
export {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
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
} from './types/support';

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

// Recommended Lessons / Goals History Component
export { RecommendedLessonsHistory } from './components/RecommendedLessonsHistory';
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
  determineGoalStatus,
  transformGoalToTableItem,
  handleGoalFetchError,
  goalsHistoryApiResponseSchema,
} from './hooks/useRecommendedLessons';
export type {
  UseRecommendedLessonsHistoryState,
  UseRecommendedLessonsHistoryReturn,
} from './hooks/useRecommendedLessons';

// Recommended Lesson Details Hook Factory
export {
  createUseRecommendedLessonDetails,
  createRecommendedLessonDetailsHook,
  handleLessonDetailsFetchError,
  goalApiResponseSchema,
  goalDetailsApiResponseSchema,
  historyApiResponseSchema,
} from './hooks/useRecommendedLessonDetails';
export type {
  UseRecommendedLessonDetailsState,
  UseRecommendedLessonDetailsReturn,
  LessonDetailsApiClient,
} from './hooks/useRecommendedLessonDetails';

// Recommended Lessons Types
export {
  GoalApiStatus,
  GoalDisplayStatus,
  GoalBadgeActionType,
  getGoalStatusBadgeAction,
  GOAL_FILTER_STATUS_OPTIONS,
  GOAL_STATUS_OPTIONS,
  StudentLessonStatus,
  getStudentStatusBadgeAction,
  isDeadlinePassed,
  deriveStudentStatus,
  formatDaysToComplete,
} from './types/recommendedLessons';
export type {
  GoalSubject,
  GoalCreator,
  GoalStats,
  GoalBreakdown,
  GoalData,
  GoalHistoryItem,
  GoalTableItem,
  GoalsHistoryApiResponse,
  GoalHistoryFilters,
  GoalHistoryPagination,
  GoalFilterOption,
  GoalUserFilterData,
  // Lesson Details API Types
  GoalDetailStudent,
  GoalDetailAggregated,
  GoalDetailContentPerformanceItem,
  GoalDetailContentPerformance,
  GoalDetailsData,
  GoalDetailsApiResponse,
  GoalLessonSubject,
  GoalLesson,
  GoalLessonProgress,
  GoalLessonGoalItem,
  GoalMetadata,
  GoalApiResponse,
  LessonDetailsData,
} from './types/recommendedLessons';

// Activities History Component
export { ActivitiesHistory } from './components/ActivitiesHistory';
export type { ActivitiesHistoryProps } from './components/ActivitiesHistory';

// Activities History Hook Factory
export {
  createUseActivitiesHistory,
  createActivitiesHistoryHook,
  transformActivityToTableItem,
  handleActivityFetchError,
  activitiesHistoryApiResponseSchema,
  DEFAULT_ACTIVITIES_PAGINATION,
} from './hooks/useActivitiesHistory';
export type {
  UseActivitiesHistoryState,
  UseActivitiesHistoryReturn,
} from './hooks/useActivitiesHistory';

// Activity Models Hook Factory
export {
  createUseActivityModels,
  createActivityModelsHook,
  transformModelToTableItem,
  handleModelFetchError,
  activityModelsApiResponseSchema,
  DEFAULT_MODELS_PAGINATION,
} from './hooks/useActivityModels';
export type {
  UseActivityModelsState,
  UseActivityModelsReturn,
} from './hooks/useActivityModels';

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

// Filter Helpers (robust version with deduplication)
export {
  getSchoolOptionsFromUserData,
  getSubjectOptionsFromUserData,
  getSchoolYearOptionsFromUserData,
  getClassOptionsFromUserData,
  buildUserFilterData,
} from './utils/filterHelpers';
export type {
  UserInstitutionData,
  SubTeacherTopicClassData,
  UserFilterSourceData,
} from './utils/filterHelpers';

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
