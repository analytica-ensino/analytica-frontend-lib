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
import Radio from './components/Radio/Radio';
import TextArea from './components/TextArea/TextArea';
import Toast from './components/Toast/Toast';
import Toaster from './components/Toast/utils/Toaster';
import Divider from './components/Divider/Divider';
import useToastStore from './components/Toast/utils/ToastStore';
import Input from './components/Input/Input';
import Chips from './components/Chips/Chips';
import ProgressBar from './components/ProgressBar/ProgressBar';
import ProgressCircle from './components/ProgressCircle/ProgressCircle';
import Stepper from './components/Stepper/Stepper';
import Calendar from './components/Calendar/Calendar';
import Modal from './components/Modal/Modal';

// Import DropdownMenu and its sub-components
import DropdownMenu, {
  DropdownMenuTrigger,
  MenuContent,
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

import Menu, { MenuItem, MenuSeparator } from './components/Menu/Menu';

import {
  CardActivesResults,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardResults,
  CardStatus,
  CardTopic,
} from './components/Card/Card';

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
export { Radio };
export { TextArea };
export { Toast };
export { Toaster };
export { Divider };
export { useToastStore };
export { Input };
export { Chips };
export { ProgressBar };
export { ProgressCircle };
export { Stepper };
export { Calendar };
export { Modal };

// Export DropdownMenu and its sub-components
export { DropdownMenu };
export { DropdownMenuTrigger };
export { MenuContent };
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
export { MenuSeparator };

export { CardActivesResults };
export { CardPerformance };
export { CardProgress };
export { CardQuestions };
export { CardResults };
export { CardStatus };
export { CardTopic };
