import type { Story } from '@ladle/react';
import ProgressCircle from './ProgressCircle';

/**
 * Default ProgressCircle showcase
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <ProgressCircle value={50} />
    <ProgressCircle value={75} label="Progress" />
    <ProgressCircle value={100} label="Complete" showPercentage />
  </div>
);

/**
 * Sizes
 */
export const Sizes: Story = () => (
  <div className="flex gap-8 p-8">
    <ProgressCircle size="small" value={60} label="Small" />
    <ProgressCircle size="medium" value={60} label="Medium" />
  </div>
);

/**
 * Variants
 */
export const Variants: Story = () => (
  <div className="flex gap-8 p-8">
    <ProgressCircle variant="blue" value={70} label="Blue" />
    <ProgressCircle variant="green" value={70} label="Green" />
  </div>
);

/**
 * Size Variants
 */
export const SizeVariants: Story = () => (
  <div className="flex items-center justify-center gap-16 min-h-[300px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Small</h3>
      <ProgressCircle size="small" value={75} label="CONCLUÍDO" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Medium</h3>
      <ProgressCircle size="medium" value={85} label="MÉDIA" />
    </div>
  </div>
);

/**
 * Color Variants
 */
export const ColorVariants: Story = () => (
  <div className="flex items-center justify-center gap-16 min-h-[300px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">
        Blue (Activity Progress)
      </h3>
      <ProgressCircle variant="blue" value={65} label="PROGRESSO" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Green (Performance)</h3>
      <ProgressCircle variant="green" value={85} label="PERFORMANCE" />
    </div>
  </div>
);

/**
 * All Combinations
 */
export const AllCombinations: Story = () => (
  <div className="grid grid-cols-2 gap-8 min-h-[600px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Small Blue</h3>
      <ProgressCircle size="small" variant="blue" value={45} label="NOTA" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Small Green</h3>
      <ProgressCircle size="small" variant="green" value={75} label="NOTA" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Medium Blue</h3>
      <ProgressCircle
        size="medium"
        variant="blue"
        value={65}
        label="PROGRESSO"
      />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Medium Green</h3>
      {/* Custom ProgressCircle with hit count format */}
      <div className="relative">
        <ProgressCircle
          size="medium"
          variant="green"
          value={25}
          showPercentage={false}
          label=""
        />

        {/* Custom content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Timer - acima do hit count */}
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-text-800 flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 14 14"
                fill="none"
                className="text-background"
              >
                <path
                  d="M7 1.75C4.1 1.75 1.75 4.1 1.75 7S4.1 12.25 7 12.25 12.25 9.9 12.25 7 9.9 1.75 7 1.75zM7 11.25C4.65 11.25 2.75 9.35 2.75 7S4.65 2.75 7 2.75 11.25 4.65 11.25 7 9.35 11.25 7 11.25z"
                  fill="currentColor"
                />
                <path
                  d="M7.25 4.5V7L9.5 8.25L9 9.25L6.25 7.5V4.5H7.25Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-2xs font-medium text-text-800">0h00</span>
          </div>

          {/* Hit count - no meio */}
          <div className="text-2xl font-medium text-text-800 leading-7">
            0 de 0
          </div>

          {/* Label - abaixo do hit count */}
          <div className="text-2xs font-medium text-text-600 mt-1">
            Corretas
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Progress Values
 */
export const ProgressValues: Story = () => (
  <div className="grid grid-cols-4 gap-8 min-h-[400px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">0%</h3>
      <ProgressCircle value={0} label="INÍCIO" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">25%</h3>
      <ProgressCircle value={25} label="BAIXO" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">75%</h3>
      <ProgressCircle value={75} label="ALTO" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">100%</h3>
      <ProgressCircle value={100} label="COMPLETO" />
    </div>
  </div>
);

/**
 * Without Percentage
 */
export const WithoutPercentage: Story = () => (
  <div className="flex items-center justify-center gap-16 min-h-[300px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">Only Label</h3>
      <ProgressCircle value={65} label="CONCLUÍDO" showPercentage={false} />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-medium text-text-950">
        No Label, No Percentage
      </h3>
      <ProgressCircle value={80} showPercentage={false} />
    </div>
  </div>
);

/**
 * Custom Max Values
 */
export const CustomMaxValues: Story = () => (
  <div className="grid grid-cols-3 gap-8 min-h-[300px] bg-background p-8">
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">3 of 5</h3>
      <ProgressCircle value={3} max={5} label="QUESTÕES" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">8 of 10</h3>
      <ProgressCircle value={8} max={10} label="EXERCÍCIOS" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-md font-medium text-text-950">15 of 20</h3>
      <ProgressCircle value={15} max={20} label="AULAS" />
    </div>
  </div>
);

/**
 * Activity Progress (Blue) - Real Use Case
 */
export const ActivityProgress: Story = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-background-50 p-8">
    <div className="bg-background p-8 rounded-lg shadow-soft-shadow-2 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-medium text-text-950">
        Progresso da Atividade
      </h2>
      <ProgressCircle
        size="medium"
        variant="blue"
        value={67}
        label="CONCLUÍDO"
      />
      <p className="text-text-700 text-center max-w-xs">
        Você completou 67% das questões desta atividade. Continue progredindo!
      </p>
    </div>
  </div>
);

/**
 * Performance Metrics (Green) - Real Use Case
 */
export const PerformanceMetrics: Story = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-background-50 p-8">
    <div className="bg-background p-8 rounded-lg shadow-soft-shadow-2 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-medium text-text-950">Desempenho Geral</h2>
      <ProgressCircle
        size="medium"
        variant="green"
        value={84}
        label="MÉDIA GERAL"
      />
      <p className="text-text-700 text-center max-w-xs">
        Sua nota média é 84%. Excelente desempenho nas avaliações!
      </p>
    </div>
  </div>
);

/**
 * Dashboard Example
 */
export const DashboardExample: Story = () => (
  <div className="min-h-[600px] bg-background-50 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-text-950 mb-8">
        Dashboard do Aluno
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Activity Progress Cards */}
        <div className="bg-background p-6 rounded-lg shadow-soft-shadow-1 flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">Matemática</h3>
          <ProgressCircle
            size="small"
            variant="blue"
            value={75}
            label="PROGRESSO"
          />
          <p className="text-text-600 text-sm text-center">15 de 20 aulas</p>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-soft-shadow-1 flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">Português</h3>
          <ProgressCircle
            size="small"
            variant="blue"
            value={60}
            label="PROGRESSO"
          />
          <p className="text-text-600 text-sm text-center">12 de 20 aulas</p>
        </div>

        {/* Performance Cards */}
        <div className="bg-background p-6 rounded-lg shadow-soft-shadow-1 flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">Nota Matemática</h3>
          <ProgressCircle
            size="small"
            variant="green"
            value={85}
            label="NOTA"
          />
          <p className="text-text-600 text-sm text-center">Média: 8.5</p>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-soft-shadow-1 flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">Nota Português</h3>
          <ProgressCircle
            size="small"
            variant="green"
            value={92}
            label="NOTA"
          />
          <p className="text-text-600 text-sm text-center">Média: 9.2</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mt-8 bg-background p-8 rounded-lg shadow-soft-shadow-2">
        <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-950 mb-4">
              Progresso Geral do Curso
            </h2>
            <ProgressCircle
              size="medium"
              variant="blue"
              value={68}
              label="CONCLUÍDO"
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-950 mb-4">
              Desempenho Geral
            </h2>
            <ProgressCircle
              size="medium"
              variant="green"
              value={88}
              label="MÉDIA GERAL"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Dark Theme Preview
 */
export const DarkTheme: Story = () => (
  <div data-theme="dark" className="min-h-[400px] bg-background p-8">
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-2xl font-medium text-text-950">Dark Theme</h2>

      <div className="flex gap-16">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">Blue Progress</h3>
          <ProgressCircle variant="blue" value={65} label="PROGRESSO" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-text-950">
            Green Performance
          </h3>
          <ProgressCircle variant="green" value={85} label="PERFORMANCE" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Accessibility Example
 */
export const AccessibilityExample: Story = () => (
  <div className="min-h-[400px] bg-background p-8">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-950 mb-6">Acessibilidade</h2>

      <div className="space-y-6">
        <div className="p-4 border border-border-200 rounded-lg">
          <p className="text-text-700 mb-4">
            O componente ProgressCircle inclui elementos de acessibilidade:
          </p>
          <ul className="list-disc list-inside text-text-600 space-y-2 mb-4">
            <li>Elemento `progress` nativo para leitores de tela</li>
            <li>Atributos ARIA adequados (value, max, aria-label)</li>
            <li>SVG marcado com aria-hidden="true"</li>
            <li>Contraste adequado de cores</li>
          </ul>

          <div className="flex justify-center">
            <ProgressCircle
              value={75}
              label="Progresso da lição de matemática"
              variant="blue"
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
