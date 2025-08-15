// Complete bundle index - includes all components
// Individual imports still recommended for better tree-shaking

// CSS import
import './styles.css';

// Import all components as default exports and re-export as named exports
import Text from './components/Text/Text';
import Button from './components/Button/Button';
import Badge from './components/Badge/Badge';
import Alert from './components/Alert/Alert';
import IconButton from './components/IconButton/IconButton';
import IconRoundedButton from './components/IconRoundedButton/IconRoundedButton';
import NavButton from './components/NavButton/NavButton';
import SelectionButton from './components/SelectionButton/SelectionButton';
import Table from './components/Table/Table';
import CheckBox from './components/CheckBox/CheckBox';
import CheckboxList, {
  CheckboxListItem,
} from './components/CheckBox/CheckboxList';
import Radio, { RadioGroup, RadioGroupItem } from './components/Radio/Radio';
import TextArea from './components/TextArea/TextArea';
import Toast from './components/Toast/Toast';
import Toaster from './components/Toast/utils/Toaster';
import Divider from './components/Divider/Divider';
import useToastStore from './components/Toast/utils/ToastStore';
import Input from './components/Input/Input';
import Search from './components/Search/Search';
import Chips from './components/Chips/Chips';
import ProgressBar from './components/ProgressBar/ProgressBar';
import ProgressCircle from './components/ProgressCircle/ProgressCircle';
import Stepper from './components/Stepper/Stepper';
import Calendar from './components/Calendar/Calendar';
import Modal from './components/Modal/Modal';
import { CardAccordation } from './components/Accordation/Accordation';
import { AlternativesList } from './components/Alternative/Alternative';
import { AlertDialog } from './components/AlertDialog/AlertDialog';
import { MultipleChoiceList } from './components/MultipleChoice/MultipleChoice';
import IconRender from './components/IconRender/IconRender';

// Import DropdownMenu and its sub-components
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ProfileMenuTrigger,
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuSection,
  MenuLabel,
  DropdownMenuSeparator,
} from './components/DropdownMenu/DropdownMenu';

import Select, {
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from './components/Select/Select';

import Menu, {
  MenuItem,
  MenuOverflow,
  MenuContent,
  Breadcrumb,
} from './components/Menu/Menu';

import {
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
} from './components/Card/Card';

import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from './components/Skeleton/Skeleton';

import NotFound from './components/NotFound/NotFound';

import {
  AuthProvider,
  ProtectedRoute,
  PublicRoute,
  withAuth,
  useAuth,
  useAuthGuard,
  useRouteAuth,
  getRootDomain,
} from './components/Auth/Auth';

import { createZustandAuthAdapter } from './components/Auth/zustandAuthAdapter';
import { useUrlAuthentication } from './components/Auth/useUrlAuthentication';
import { useApiConfig } from './components/Auth/useApiConfig';

// Import Quiz components
import {
  QuizHeaderResult,
  QuizTitle,
  Quiz,
  QuizHeader,
  QuizContent,
  QuizAlternative,
  QuizMultipleChoice,
  QuizDissertative,
  QuizTrueOrFalse,
  QuizConnectDots,
  QuizQuestionList,
  QuizImageQuestion,
  QuizFooter,
  QuizListResult,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizResultPerformance,
  QuizListResultByMateria,
  getStatusBadge,
} from './components/Quiz/Quiz';
import { useQuizStore } from './components/Quiz/useQuizStore';

// Export all components for bundled usage
export { Text };
export { Button };
export { Badge };
export { Alert };
export { IconButton };
export { IconRoundedButton };
export { NavButton };
export { SelectionButton };
export { Table };
export { CheckBox };
export { CheckboxList };
export { CheckboxListItem };
export { Radio };
export { RadioGroup };
export { RadioGroupItem };
export { TextArea };
export { Toast };
export { Toaster };
export { Divider };
export { useToastStore };
export { Input };
export { Search };
export { Chips };
export { ProgressBar };
export { ProgressCircle };
export { Stepper };
export { Calendar };
export { Modal };
export { AlertDialog };

// Export DropdownMenu and its sub-components
export { DropdownMenu };
export { DropdownMenuTrigger };
export { DropdownMenuContent };
export { DropdownMenuItem };
export { MenuLabel };
export { DropdownMenuSeparator };
export { ProfileMenuTrigger };
export { ProfileMenuHeader };
export { ProfileMenuSection };
export { ProfileMenuFooter };

export { Select };
export { SelectValue };
export { SelectTrigger };
export { SelectContent };
export { SelectItem };

export { Menu };
export { MenuItem };
export { MenuOverflow };
export { MenuContent };
export { Breadcrumb };

export { CardActivitiesResults };
export { CardPerformance };
export { CardProgress };
export { CardQuestions };
export { CardResults };
export { CardSimulado };
export { CardStatus };
export { CardTopic };
export { CardTest };
export { CardSimulationHistory };

export { Skeleton };
export { SkeletonText };
export { SkeletonCircle };
export { SkeletonRectangle };
export { SkeletonRounded };
export { SkeletonCard };
export { SkeletonList };
export { SkeletonTable };

export { NotFound };

// Export Auth components
export { AuthProvider };
export { ProtectedRoute };
export { PublicRoute };
export { withAuth };
export { useAuth };
export { useAuthGuard };
export { useRouteAuth };
export { getRootDomain };
export { CardAccordation };
export { AlternativesList };
export { createZustandAuthAdapter };
export { useUrlAuthentication };
export { useApiConfig };

// Export Quiz components
export { Quiz };
export { QuizTitle };
export { QuizHeader };
export { QuizContent };
export { useQuizStore };
export { QuizHeaderResult };
export { QuizAlternative };
export { QuizMultipleChoice };
export { QuizDissertative };
export { QuizTrueOrFalse };
export { QuizConnectDots };
export { QuizQuestionList };
export { QuizImageQuestion };
export { QuizFooter };
export { QuizListResult };
export { QuizResultHeaderTitle };
export { QuizResultTitle };
export { QuizResultPerformance };
export { QuizListResultByMateria };
export { getStatusBadge };

export { MultipleChoiceList };
export { IconRender };
