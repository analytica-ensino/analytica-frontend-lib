// Complete bundle index - includes all components
// Individual imports still recommended for better tree-shaking

// CSS import
import './styles.css';

// Basic Components
export { default as Text } from './components/Text/Text';
export { default as Button } from './components/Button/Button';
export { default as Badge } from './components/Badge/Badge';
export { default as Alert } from './components/Alert/Alert';
export { default as IconButton } from './components/IconButton/IconButton';
export { default as IconRoundedButton } from './components/IconRoundedButton/IconRoundedButton';
export { default as NavButton } from './components/NavButton/NavButton';
export { default as SelectionButton } from './components/SelectionButton/SelectionButton';
export { default as Table } from './components/Table/Table';
export { default as CheckBox } from './components/CheckBox/CheckBox';
export {
  default as CheckboxList,
  CheckboxListItem,
} from './components/CheckBox/CheckboxList';
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
export { default as Modal } from './components/Modal/Modal';
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
  ProfileMenuSection,
  MenuLabel,
  DropdownMenuSeparator,
  ProfileToggleTheme,
} from './components/DropdownMenu/DropdownMenu';

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
export { CardAccordation } from './components/Accordation/Accordation';
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

// Auth Hooks
export { useAppInitialization } from './hooks/useAppInitialization';
export { useAppContent } from './hooks/useAppContent';
export { useInstitutionId } from './hooks/useInstitution';
export { useAuthStore } from './store/authStore';
export { useAppStore } from './store/appStore';
export type { AuthState } from './store/authStore';

// Utils
export {
  cn,
  getSubjectColorWithOpacity,
  syncDropdownState,
} from './utils/utils';
