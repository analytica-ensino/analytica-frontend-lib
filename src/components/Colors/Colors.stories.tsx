import { Story } from '@ladle/react';
import { Moon, Sun } from 'phosphor-react';
import { ReactNode } from 'react';

// Componente reutilizável para cada cor
const ColorCard = ({
  colorClass,
  label,
  className = '',
}: {
  colorClass: string;
  label: string;
  className?: string;
}) => (
  <div
    className={`w-[152px] h-[80px] rounded-md ${colorClass} flex items-end p-1 ${className}`}
  >
    <p className="bg-background text-text-900 rounded-md p-1 text-xs">
      {label}
    </p>
  </div>
);

// Componente reutilizável para seção de tema
const ThemeSection = ({
  isDark = false,
  children,
}: {
  isDark?: boolean;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1 px-10">
    <span className="flex flex-row gap-1 items-center border-b border-b-background-50 pb-2">
      <div
        className={`p-1 rounded-md ${isDark ? 'bg-background-900 text-background-100' : 'bg-background-50'}`}
      >
        {isDark ? <Moon /> : <Sun />}
      </div>
      <p className="text-lg text-950 font-semibold">
        {isDark ? 'Dark mode' : 'Light mode'}
      </p>
    </span>
    <div
      className="bg-background flex flex-row gap-2 flex-wrap p-2 rounded-md"
      data-theme={isDark ? 'dark' : 'light'}
    >
      {children}
    </div>
  </div>
);

// Componente reutilizável para seção de cores
const ColorSection = ({
  title,
  colors,
  showEnemParana = false,
}: {
  title: string;
  colors: Array<{ class: string; label: string }>;
  showEnemParana?: boolean;
}) => (
  <section className="flex flex-col gap-2">
    <h2 className="font-semibold text-4xl text-950">{title}</h2>

    <ThemeSection>
      {colors.map((color, index) => (
        <ColorCard
          key={`light-${index}`}
          colorClass={color.class}
          label={color.label}
        />
      ))}
    </ThemeSection>

    <ThemeSection isDark>
      {colors.map((color, index) => (
        <ColorCard
          key={`dark-${index}`}
          colorClass={color.class}
          label={color.label}
        />
      ))}
    </ThemeSection>

    {showEnemParana && (
      <>
        <div className="flex flex-col gap-1 px-10">
          <span className="flex flex-row gap-1 items-center border-b border-b-background-50 pb-2">
            <div className="p-1 rounded-md bg-background-50">
              <Sun />
            </div>
            <p className="text-lg text-950 font-semibold">
              Enem Paraná Light mode
            </p>
          </span>
          <div
            className="bg-background flex flex-row gap-2 flex-wrap p-2 rounded-md"
            data-theme="enem-parana-light"
          >
            {colors.map((color, index) => (
              <ColorCard
                key={`enem-light-${index}`}
                colorClass={color.class}
                label={color.label}
              />
            ))}
          </div>
        </div>
      </>
    )}
  </section>
);

// Dados das cores organizados
const colorData = {
  primary: [
    { class: 'bg-primary', label: 'Primary' },
    { class: 'bg-primary-50', label: 'Primary 50' },
    { class: 'bg-primary-100', label: 'Primary 100' },
    { class: 'bg-primary-200', label: 'Primary 200' },
    { class: 'bg-primary-300', label: 'Primary 300' },
    { class: 'bg-primary-400', label: 'Primary 400' },
    { class: 'bg-primary-500', label: 'Primary 500' },
    { class: 'bg-primary-600', label: 'Primary 600' },
    { class: 'bg-primary-700', label: 'Primary 700' },
    { class: 'bg-primary-800', label: 'Primary 800' },
    { class: 'bg-primary-900', label: 'Primary 900' },
    { class: 'bg-primary-950', label: 'Primary 950' },
  ],
  secondary: [
    { class: 'bg-secondary', label: 'Secondary' },
    { class: 'bg-secondary-50', label: 'Secondary 50' },
    { class: 'bg-secondary-100', label: 'Secondary 100' },
    { class: 'bg-secondary-200', label: 'Secondary 200' },
    { class: 'bg-secondary-300', label: 'Secondary 300' },
    { class: 'bg-secondary-400', label: 'Secondary 400' },
    { class: 'bg-secondary-500', label: 'Secondary 500' },
    { class: 'bg-secondary-600', label: 'Secondary 600' },
    { class: 'bg-secondary-700', label: 'Secondary 700' },
    { class: 'bg-secondary-800', label: 'Secondary 800' },
    { class: 'bg-secondary-900', label: 'Secondary 900' },
    { class: 'bg-secondary-950', label: 'Secondary 950' },
  ],
  tertiary: [
    { class: 'bg-tertiary', label: 'Tertiary' },
    { class: 'bg-tertiary-50', label: 'Tertiary 50' },
    { class: 'bg-tertiary-100', label: 'Tertiary 100' },
    { class: 'bg-tertiary-200', label: 'Tertiary 200' },
    { class: 'bg-tertiary-300', label: 'Tertiary 300' },
    { class: 'bg-tertiary-400', label: 'Tertiary 400' },
    { class: 'bg-tertiary-500', label: 'Tertiary 500' },
    { class: 'bg-tertiary-600', label: 'Tertiary 600' },
    { class: 'bg-tertiary-700', label: 'Tertiary 700' },
    { class: 'bg-tertiary-800', label: 'Tertiary 800' },
    { class: 'bg-tertiary-900', label: 'Tertiary 900' },
    { class: 'bg-tertiary-950', label: 'Tertiary 950' },
  ],
  text: [
    { class: 'bg-text', label: 'Text' },
    { class: 'bg-text-50', label: 'Text 50' },
    { class: 'bg-text-100', label: 'Text 100' },
    { class: 'bg-text-200', label: 'Text 200' },
    { class: 'bg-text-300', label: 'Text 300' },
    { class: 'bg-text-400', label: 'Text 400' },
    { class: 'bg-text-500', label: 'Text 500' },
    { class: 'bg-text-600', label: 'Text 600' },
    { class: 'bg-text-700', label: 'Text 700' },
    { class: 'bg-text-800', label: 'Text 800' },
    { class: 'bg-text-900', label: 'Text 900' },
    { class: 'bg-text-950', label: 'Text 950' },
  ],
  background: [
    { class: 'bg-background', label: 'Background' },
    { class: 'bg-background-50', label: 'Background 50' },
    { class: 'bg-background-100', label: 'Background 100' },
    { class: 'bg-background-200', label: 'Background 200' },
    { class: 'bg-background-300', label: 'Background 300' },
    { class: 'bg-background-400', label: 'Background 400' },
    { class: 'bg-background-500', label: 'Background 500' },
    { class: 'bg-background-600', label: 'Background 600' },
    { class: 'bg-background-700', label: 'Background 700' },
    { class: 'bg-background-800', label: 'Background 800' },
    { class: 'bg-background-900', label: 'Background 900' },
    { class: 'bg-background-950', label: 'Background 950' },
    { class: 'bg-background-muted', label: 'Background Muted' },
  ],
  border: [
    { class: 'bg-border', label: 'Border' },
    { class: 'bg-border-50', label: 'Border 50' },
    { class: 'bg-border-100', label: 'Border 100' },
    { class: 'bg-border-200', label: 'Border 200' },
    { class: 'bg-border-300', label: 'Border 300' },
    { class: 'bg-border-400', label: 'Border 400' },
    { class: 'bg-border-500', label: 'Border 500' },
    { class: 'bg-border-600', label: 'Border 600' },
    { class: 'bg-border-700', label: 'Border 700' },
    { class: 'bg-border-800', label: 'Border 800' },
    { class: 'bg-border-900', label: 'Border 900' },
    { class: 'bg-border-950', label: 'Border 950' },
  ],
  success: [
    { class: 'bg-success', label: 'Success' },
    { class: 'bg-success-50', label: 'Success 50' },
    { class: 'bg-success-100', label: 'Success 100' },
    { class: 'bg-success-200', label: 'Success 200' },
    { class: 'bg-success-300', label: 'Success 300' },
    { class: 'bg-success-400', label: 'Success 400' },
    { class: 'bg-success-500', label: 'Success 500' },
    { class: 'bg-success-600', label: 'Success 600' },
    { class: 'bg-success-700', label: 'Success 700' },
    { class: 'bg-success-800', label: 'Success 800' },
    { class: 'bg-success-900', label: 'Success 900' },
    { class: 'bg-success-950', label: 'Success 950' },
    { class: 'bg-success-background', label: 'Success Background' },
  ],
  error: [
    { class: 'bg-error', label: 'Error' },
    { class: 'bg-error-50', label: 'Error 50' },
    { class: 'bg-error-100', label: 'Error 100' },
    { class: 'bg-error-200', label: 'Error 200' },
    { class: 'bg-error-300', label: 'Error 300' },
    { class: 'bg-error-400', label: 'Error 400' },
    { class: 'bg-error-500', label: 'Error 500' },
    { class: 'bg-error-600', label: 'Error 600' },
    { class: 'bg-error-700', label: 'Error 700' },
    { class: 'bg-error-800', label: 'Error 800' },
    { class: 'bg-error-900', label: 'Error 900' },
    { class: 'bg-error-950', label: 'Error 950' },
    { class: 'bg-error-background', label: 'Error Background' },
  ],
  warning: [
    { class: 'bg-warning', label: 'Warning' },
    { class: 'bg-warning-50', label: 'Warning 50' },
    { class: 'bg-warning-100', label: 'Warning 100' },
    { class: 'bg-warning-200', label: 'Warning 200' },
    { class: 'bg-warning-300', label: 'Warning 300' },
    { class: 'bg-warning-400', label: 'Warning 400' },
    { class: 'bg-warning-500', label: 'Warning 500' },
    { class: 'bg-warning-600', label: 'Warning 600' },
    { class: 'bg-warning-700', label: 'Warning 700' },
    { class: 'bg-warning-800', label: 'Warning 800' },
    { class: 'bg-warning-900', label: 'Warning 900' },
    { class: 'bg-warning-950', label: 'Warning 950' },
    { class: 'bg-warning-background', label: 'Warning Background' },
  ],
  info: [
    { class: 'bg-info', label: 'Info' },
    { class: 'bg-info-50', label: 'Info 50' },
    { class: 'bg-info-100', label: 'Info 100' },
    { class: 'bg-info-200', label: 'Info 200' },
    { class: 'bg-info-300', label: 'Info 300' },
    { class: 'bg-info-400', label: 'Info 400' },
    { class: 'bg-info-500', label: 'Info 500' },
    { class: 'bg-info-600', label: 'Info 600' },
    { class: 'bg-info-700', label: 'Info 700' },
    { class: 'bg-info-800', label: 'Info 800' },
    { class: 'bg-info-900', label: 'Info 900' },
    { class: 'bg-info-950', label: 'Info 950' },
    { class: 'bg-info-background', label: 'Info Background' },
  ],
  indicator: [
    { class: 'bg-indicator-primary', label: 'Indicator Primary' },
    { class: 'bg-indicator-info', label: 'Indicator Info' },
    { class: 'bg-indicator-error', label: 'Indicator Error' },
    { class: 'bg-indicator-positive', label: 'Indicator Positive' },
    { class: 'bg-indicator-negative', label: 'Indicator Negative' },
  ],
  subjectsAndExams: [
    { class: 'bg-exam-1', label: 'Exam 1' },
    { class: 'bg-exam-2', label: 'Exam 2' },
    { class: 'bg-exam-3', label: 'Exam 3' },
    { class: 'bg-exam-4', label: 'Exam 4' },
    { class: 'bg-subject-1', label: 'Subject 1' },
    { class: 'bg-subject-2', label: 'Subject 2' },
    { class: 'bg-subject-3', label: 'Subject 3' },
    { class: 'bg-subject-4', label: 'Subject 4' },
    { class: 'bg-subject-5', label: 'Subject 5' },
    { class: 'bg-subject-6', label: 'Subject 6' },
    { class: 'bg-subject-7', label: 'Subject 7' },
    { class: 'bg-subject-8', label: 'Subject 8' },
    { class: 'bg-subject-9', label: 'Subject 9' },
    { class: 'bg-subject-10', label: 'Subject 10' },
    { class: 'bg-subject-11', label: 'Subject 11' },
    { class: 'bg-subject-12', label: 'Subject 12' },
    { class: 'bg-subject-13', label: 'Subject 13' },
    { class: 'bg-subject-14', label: 'Subject 14' },
    { class: 'bg-subject-15', label: 'Subject 15' },
    { class: 'bg-subject-16', label: 'Subject 16' },
  ],
  typography: [
    { class: 'bg-typography-1', label: 'Typography 1' },
    { class: 'bg-typography-2', label: 'Typography 2' },
  ],
};

export const AllColors: Story = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <h1 className="font-semibold text-6xl text-950">Colors</h1>

      <ColorSection title="Primary" colors={colorData.primary} showEnemParana />
      <ColorSection title="Secondary" colors={colorData.secondary} />
      <ColorSection title="Tertiary" colors={colorData.tertiary} />
      <ColorSection title="Text" colors={colorData.text} />
      <ColorSection title="Background" colors={colorData.background} />
      <ColorSection title="Border" colors={colorData.border} />
      <ColorSection title="Success" colors={colorData.success} />
      <ColorSection title="Error" colors={colorData.error} />
      <ColorSection title="Warning" colors={colorData.warning} />
      <ColorSection title="Info" colors={colorData.info} />
      <ColorSection title="Indicator" colors={colorData.indicator} />
      <ColorSection
        title="Subjects and Exams"
        colors={colorData.subjectsAndExams}
      />
      <ColorSection title="Typography" colors={colorData.typography} />
    </div>
  );
};
