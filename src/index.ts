// Dynamic proxy index - redirects to individual components
// This allows both syntax styles:
// import { Text } from 'analytica-frontend-lib' ← works
// import Text from 'analytica-frontend-lib/Text' ← also works

// CSS import
import './styles.css';

// Import all components as default exports and re-export as named exports
import TextComponent from './components/Text/Text';
import ButtonComponent from './components/Button/Button';
import BadgeComponent from './components/Badge/Badge';
import AlertComponent from './components/Alert/Alert';
import IconButtonComponent from './components/IconButton/IconButton';
import IconRoundedButtonComponent from './components/IconRoundedButton/IconRoundedButton';
import NavButtonComponent from './components/NavButton/NavButton';
import SelectionButtonComponent from './components/SelectionButton/SelectionButton';
import TableComponent from './components/Table/Table';
import CheckBoxComponent from './components/CheckBox/CheckBox';
import RadioComponent from './components/Radio/Radio';
import TextAreaComponent from './components/TextArea/TextArea';
import ToastComponent from './components/Toast/Toast';
import ToasterComponent from './components/Toast/utils/Toaster';
import useToastStoreHook from './components/Toast/utils/ToastStore';

// Import DropdownMenu and its sub-components
import DropdownMenuComponent, {
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from './components/DropdownMenu/DropdownMenu';

// Re-export as named exports for bundled usage
export { TextComponent as Text };
export { ButtonComponent as Button };
export { BadgeComponent as Badge };
export { AlertComponent as Alert };
export { IconButtonComponent as IconButton };
export { IconRoundedButtonComponent as IconRoundedButton };
export { NavButtonComponent as NavButton };
export { SelectionButtonComponent as SelectionButton };
export { TableComponent as Table };
export { CheckBoxComponent as CheckBox };
export { RadioComponent as Radio };
export { TextAreaComponent as TextArea };
export { ToastComponent as Toast };
export { ToasterComponent as Toaster };
export { useToastStoreHook as useToastStore };

// Export DropdownMenu and its sub-components
export { DropdownMenuComponent as DropdownMenu };
export { DropdownMenuTrigger };
export { MenuContent as DropdownMenuContent };
export { MenuItem as DropdownMenuItem };
export { MenuLabel as DropdownMenuLabel };
export { MenuSeparator as DropdownMenuSeparator };
