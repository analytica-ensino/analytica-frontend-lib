import { Moon, Sun } from 'phosphor-react';
import { useState, useEffect } from 'react';
import SelectionButton from '../SelectionButton/SelectionButton';
import { useTheme } from '@/hooks/useTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  variant?: 'default' | 'with-save';
  onToggle?: (theme: ThemeMode) => void;
  handleToggle?: (theme: ThemeMode) => void;
}

export const ThemeToggle = ({
  variant = 'default',
  onToggle,
  handleToggle,
}: ThemeToggleProps) => {
  const { themeMode, setTheme } = useTheme();
  const [tempTheme, setTempTheme] = useState<ThemeMode>(themeMode);

  // Update temp theme when themeMode changes externally
  useEffect(() => {
    setTempTheme(themeMode);
  }, [themeMode]);

  const problemTypes = [
    {
      id: 'light' as ThemeMode,
      title: 'Claro',
      icon: <Sun size={24} />,
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Escuro',
      icon: <Moon size={24} />,
    },
    {
      id: 'system' as ThemeMode,
      title: 'Sistema',
      icon: (
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 2.75C15.085 2.75276 17.5637 3.78054 19.3916 5.6084C21.2195 7.43628 22.2473 9.915 22.25 12.5C22.25 14.4284 21.6778 16.3136 20.6064 17.917C19.5352 19.5201 18.0128 20.7699 16.2314 21.5078C14.4499 22.2458 12.489 22.4387 10.5977 22.0625C8.70642 21.6863 6.96899 20.758 5.60547 19.3945C4.24197 18.031 3.31374 16.2936 2.9375 14.4023C2.56129 12.511 2.75423 10.5501 3.49219 8.76855C4.23012 6.98718 5.47982 5.46483 7.08301 4.39355C8.68639 3.32221 10.5716 2.75 12.5 2.75ZM11.75 4.28516C9.70145 4.47452 7.7973 5.42115 6.41016 6.94043C5.02299 8.4599 4.25247 10.4426 4.25 12.5C4.25247 14.5574 5.02299 16.5401 6.41016 18.0596C7.7973 19.5789 9.70145 20.5255 11.75 20.7148V4.28516Z"
            fill="#525252"
          />
        </svg>
      ),
    },
  ];

  const handleThemeSelect = (selectedTheme: ThemeMode) => {
    if (variant === 'with-save') {
      setTempTheme(selectedTheme);
    } else {
      setTheme(selectedTheme);
    }

    // Prefer onToggle over handleToggle for backward compatibility
    if (onToggle) {
      onToggle(selectedTheme);
    } else if (handleToggle) {
      // Emit deprecation warning in development environment
      console.warn(
        'ThemeToggle: handleToggle prop is deprecated. Please use onToggle instead.'
      );
      handleToggle(selectedTheme);
    }
  };

  const currentTheme = variant === 'with-save' ? tempTheme : themeMode;

  return (
    <div className="flex flex-row gap-2 sm:gap-4 py-2">
      {problemTypes.map((type) => (
        <SelectionButton
          key={type.id}
          icon={type.icon}
          label={type.title}
          selected={currentTheme === type.id}
          onClick={() => handleThemeSelect(type.id)}
          className="w-full p-2 sm:p-4"
        />
      ))}
    </div>
  );
};
