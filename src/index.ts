import './styles.css';

// Re-export components individually for perfect tree-shaking
// Each component will only include its own dependencies
export { Text } from './components/Text/Text';
export { Button } from './components/Button/Button';
export { Badge } from './components/Badge/Badge';
export { Alert } from './components/Alert/Alert';
export { IconButton } from './components/IconButton/IconButton';
export { IconRoundedButton } from './components/IconRoundedButton/IconRoundedButton';
export { NavButton } from './components/NavButton/NavButton';
export { SelectionButton } from './components/SelectionButton/SelectionButton';
export { Table } from './components/Table/Table';

// Client components with 'use client'
export { CheckBox } from './components/CheckBox/CheckBox';
export { TextArea } from './components/TextArea/TextArea';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  MenuContent as DropdownMenuContent,
  MenuItem as DropdownMenuItem,
  MenuLabel as DropdownMenuLabel,
  MenuSeparator as DropdownMenuSeparator,
} from './components/DropdownMenu/DropdownMenu';
export { Toast } from './components/Toast/Toast';
export { Toaster } from './components/Toast/utils/Toaster';
export * from './components/Toast/utils/ToastStore';
