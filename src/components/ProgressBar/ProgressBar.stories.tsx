import type { Story } from '@ladle/react';
import ProgressBar from './ProgressBar';

/**
 * Default ProgressBar component showcase
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Basic Usage</h3>
      <div className="flex flex-col gap-4 max-w-md">
        <ProgressBar value={25} />
        <ProgressBar value={50} label="Progress" />
        <ProgressBar value={75} showPercentage />
        <ProgressBar value={100} label="Complete" showPercentage />
      </div>
    </div>
  </div>
);

/**
 * Size variations
 */
export const Sizes: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        ProgressBar Sizes
      </h3>

      {/* Small Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Small (4px height)
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar size="small" value={30} />
          <ProgressBar size="small" value={60} label="Small with label" />
          <ProgressBar size="small" value={90} showPercentage />
          <ProgressBar
            size="small"
            value={45}
            label="Small complete"
            showPercentage
          />
        </div>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (8px height) - Default
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar size="medium" value={30} />
          <ProgressBar size="medium" value={60} label="Medium with label" />
          <ProgressBar size="medium" value={90} showPercentage />
          <ProgressBar
            size="medium"
            value={45}
            label="Medium complete"
            showPercentage
          />
        </div>
      </div>

      {/* Size Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Size Comparison
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-500">Small</span>
            <ProgressBar size="small" value={65} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-500">Medium</span>
            <ProgressBar size="medium" value={65} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Color variants
 */
export const Variants: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        ProgressBar Variants
      </h3>

      {/* Blue Variant */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Blue - Activity Progress
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar variant="blue" value={25} label="Lesson 1" />
          <ProgressBar
            variant="blue"
            value={50}
            label="Lesson 2"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={75}
            label="Lesson 3"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={100}
            label="Completed"
            showPercentage
          />
        </div>
      </div>

      {/* Green Variant */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Green - Performance Metrics
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar
            variant="green"
            value={30}
            label="Accuracy"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={65}
            label="Speed"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={85}
            label="Comprehension"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={95}
            label="Overall Score"
            showPercentage
          />
        </div>
      </div>

      {/* Variant Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Variant Comparison
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-500">
              Blue (Activity Progress)
            </span>
            <ProgressBar variant="blue" value={70} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-500">Green (Performance)</span>
            <ProgressBar variant="green" value={70} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Without labels - clean progress bars
 */
export const WithoutLabels: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        ProgressBar without Labels
      </h3>
      <div className="flex flex-col gap-6 max-w-md">
        {/* Different values without any labels */}
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            Blue Variant (Activity Progress)
          </h4>
          <ProgressBar variant="blue" value={25} />
          <ProgressBar variant="blue" value={50} />
          <ProgressBar variant="blue" value={75} />
          <ProgressBar variant="blue" value={100} />
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            Green Variant (Performance)
          </h4>
          <ProgressBar variant="green" value={30} />
          <ProgressBar variant="green" value={60} />
          <ProgressBar variant="green" value={85} />
          <ProgressBar variant="green" value={95} />
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">Small Size</h4>
          <ProgressBar size="small" variant="blue" value={40} />
          <ProgressBar size="small" variant="green" value={70} />
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            Medium Size (Default)
          </h4>
          <ProgressBar size="medium" variant="blue" value={45} />
          <ProgressBar size="medium" variant="green" value={80} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * With labels and percentages
 */
export const WithLabelsAndPercentages: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        ProgressBar with Labels and Percentages
      </h3>
      <div className="flex flex-col gap-6 max-w-md">
        <ProgressBar value={35} label="Mathematics Course" showPercentage />
        <ProgressBar
          variant="green"
          value={78}
          label="Performance Score"
          showPercentage
        />
        <ProgressBar
          size="small"
          value={92}
          label="Quiz Completion"
          showPercentage
        />
        <ProgressBar
          variant="green"
          size="small"
          value={86}
          label="Accuracy Rate"
          showPercentage
        />
      </div>
    </div>
  </div>
);

/**
 * Custom max values
 */
export const CustomMaxValues: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        Custom Max Values
      </h3>
      <div className="flex flex-col gap-6 max-w-md">
        <ProgressBar
          value={3}
          max={5}
          label="Lessons (3 of 5)"
          showPercentage
        />
        <ProgressBar
          variant="green"
          value={7}
          max={10}
          label="Exercises (7 of 10)"
          showPercentage
        />
        <ProgressBar
          value={12}
          max={20}
          label="Quizzes (12 of 20)"
          showPercentage
        />
        <ProgressBar
          variant="green"
          value={45}
          max={60}
          label="Study Minutes (45 of 60)"
          showPercentage
        />
      </div>
    </div>
  </div>
);

/**
 * Comprehensive showcase
 */
export const AllVariations: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        All ProgressBar Variations
      </h3>

      {/* Small Size Variations */}
      <div className="mb-8">
        <h4 className="font-medium text-lg mb-4 text-text-950">
          Small Size (4px) - Compact Progress Indicators
        </h4>

        <div className="grid grid-cols-2 gap-8">
          {/* Small Blue Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Activity Progress (Blue)
            </h5>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Basic Activity Tracker
                </span>
                <ProgressBar size="small" variant="blue" value={35} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Labeled Activity Progress
                </span>
                <ProgressBar
                  size="small"
                  variant="blue"
                  value={65}
                  label="Lesson Progress"
                />
              </div>
            </div>
          </div>

          {/* Small Green Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Performance Metrics (Green)
            </h5>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Basic Performance Meter
                </span>
                <ProgressBar size="small" variant="green" value={35} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Labeled Performance Score
                </span>
                <ProgressBar
                  size="small"
                  variant="green"
                  value={65}
                  label="Accuracy Score"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medium Size Variations */}
      <div className="mb-8">
        <h4 className="font-medium text-lg mb-4 text-text-950">
          Medium Size (8px) - Primary Progress Displays
        </h4>

        <div className="grid grid-cols-2 gap-8">
          {/* Medium Blue Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Activity Progress (Blue)
            </h5>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Standard Activity Bar
                </span>
                <ProgressBar size="medium" variant="blue" value={35} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Activity Progress Monitor
                </span>
                <ProgressBar
                  size="medium"
                  variant="blue"
                  value={85}
                  showPercentage
                  percentageClassName="text-2xs font-normal text-text-800"
                />
              </div>
            </div>
          </div>

          {/* Medium Green Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Performance Metrics (Green)
            </h5>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Standard Performance Bar
                </span>
                <ProgressBar size="medium" variant="green" value={35} />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Comprehensive Performance Report
                </span>
                <div className="flex flex-row items-center gap-2">
                  <ProgressBar
                    size="medium"
                    variant="green"
                    value={95}
                    className="flex-grow"
                  />
                  <span className="text-xs font-medium leading-none tracking-normal text-center flex-none text-text-950">
                    95% corretas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Layout Variations */}
      <div className="mb-8">
        <h4 className="font-medium text-lg mb-4 text-text-950">
          Stacked Layout (380px) - Fixed Width Progress Cards
        </h4>

        <div className="grid grid-cols-2 gap-8">
          {/* Stacked Green Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Performance Metrics Cards (Green)
            </h5>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Excellence Performance Report Card
                </span>
                <div className="flex flex-col items-start gap-2 w-[380px] h-[35px]">
                  {/* Header with label and custom hit count */}
                  <div className="flex flex-row justify-between items-center w-full h-[19px]">
                    {/* Label */}
                    <div className="text-base font-medium text-text-600 leading-[19px]">
                      Difíceis
                    </div>
                    {/* Custom Hit Count with green number */}
                    <div className="text-xs font-medium leading-[14px] text-right">
                      <span className="text-success-200">18</span>
                      <span className="text-text-600"> de 20</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-background-300 rounded-lg overflow-hidden relative">
                    <progress
                      value={18}
                      max={20}
                      aria-label="Difíceis"
                      className="absolute inset-0 w-full h-full opacity-0"
                    />
                    <div className="h-2 bg-success-200 rounded-lg transition-all duration-300 ease-out shadow-hard-shadow-3 w-[90%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Layout Variations */}
      <div className="mb-8">
        <h4 className="font-medium text-lg mb-4 text-text-950">
          Compact Layout (130px) - Small Progress Cards
        </h4>

        <div className="grid grid-cols-2 gap-8">
          {/* Compact Blue Variations */}
          <div className="flex flex-col gap-4">
            <h5 className="font-medium text-md text-text-700">
              Activity Progress Cards (Blue)
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-500">
                  Activity Question Card
                </span>
                <ProgressBar
                  layout="compact"
                  variant="blue"
                  value={70}
                  showPercentage
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Theme support showcase
 */
export const Themes: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Theme Support
      </h3>

      {/* Light Theme */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">Light Theme</h4>
        <div className="p-4 bg-background border border-border-300 rounded-lg">
          <div className="flex flex-col gap-3 max-w-md">
            <ProgressBar
              variant="blue"
              value={40}
              label="Activity Progress"
              showPercentage
            />
            <ProgressBar
              variant="green"
              value={75}
              label="Performance Score"
              showPercentage
            />
            <ProgressBar
              size="small"
              variant="blue"
              value={60}
              label="Small Progress"
            />
            <ProgressBar
              size="small"
              variant="green"
              value={90}
              showPercentage
            />
          </div>
        </div>
      </div>

      {/* Dark Theme */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">Dark Theme</h4>
        <div
          className="p-4 bg-background border border-border-300 rounded-lg"
          data-theme="dark"
        >
          <div className="flex flex-col gap-3 max-w-md">
            <ProgressBar
              variant="blue"
              value={40}
              label="Activity Progress"
              showPercentage
            />
            <ProgressBar
              variant="green"
              value={75}
              label="Performance Score"
              showPercentage
            />
            <ProgressBar
              size="small"
              variant="blue"
              value={60}
              label="Small Progress"
            />
            <ProgressBar
              size="small"
              variant="green"
              value={90}
              showPercentage
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Real-world examples
 */
export const RealWorldExamples: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Real-world Examples
      </h3>

      {/* Course Progress */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">
          Course Progress Dashboard
        </h4>
        <div className="max-w-lg space-y-4">
          <ProgressBar
            variant="blue"
            value={78}
            label="Mathematics Fundamentals"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={45}
            label="Physics Basics"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={92}
            label="Chemistry Introduction"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={34}
            label="Biology Essentials"
            showPercentage
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">
          Student Performance
        </h4>
        <div className="max-w-lg space-y-4">
          <ProgressBar
            variant="green"
            value={85}
            label="Overall Accuracy"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={72}
            label="Problem Solving Speed"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={94}
            label="Concept Understanding"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={67}
            label="Critical Thinking"
            showPercentage
          />
        </div>
      </div>

      {/* Mixed Usage */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">
          Mixed Progress & Performance
        </h4>
        <div className="max-w-lg space-y-4">
          <ProgressBar
            size="small"
            variant="blue"
            value={67}
            label="Module Completion"
            showPercentage
          />
          <ProgressBar
            size="small"
            variant="green"
            value={81}
            label="Module Performance"
            showPercentage
          />
          <ProgressBar
            variant="blue"
            value={34}
            label="Next Module Progress"
            showPercentage
          />
          <ProgressBar
            variant="green"
            value={0}
            label="Next Module Performance"
            showPercentage
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Medium size horizontal layout demonstration
 */
export const MediumHorizontalLayout: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        Medium Size - Horizontal Layout
      </h3>
      <div className="flex flex-col gap-6 max-w-md">
        {/* Medium with percentage - horizontal layout */}
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            With Percentage (Horizontal)
          </h4>
          <ProgressBar size="medium" variant="blue" value={35} showPercentage />
          <ProgressBar
            size="medium"
            variant="green"
            value={63}
            showPercentage
          />
          <ProgressBar size="medium" variant="blue" value={85} showPercentage />
          <ProgressBar
            size="medium"
            variant="green"
            value={92}
            showPercentage
          />
        </div>

        {/* Medium without percentage */}
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            Without Percentage
          </h4>
          <ProgressBar size="medium" variant="blue" value={40} />
          <ProgressBar size="medium" variant="green" value={75} />
        </div>

        {/* Medium with labels (no percentage) */}
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-md mb-2 text-text-950">
            With Labels Only
          </h4>
          <ProgressBar
            size="medium"
            variant="blue"
            value={45}
            label="Activity Progress"
          />
          <ProgressBar
            size="medium"
            variant="green"
            value={80}
            label="Performance Score"
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Stacked layout variant
 */
export const StackedLayout: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Stacked Layout - Fixed Width Progress Cards
      </h3>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Performance Progress Cards (Green)
          </h4>
          <div className="flex flex-col gap-4">
            <ProgressBar
              layout="stacked"
              variant="green"
              value={28}
              max={30}
              label="Fáceis"
              showHitCount
            />
            <ProgressBar
              layout="stacked"
              variant="green"
              value={15}
              max={25}
              label="Médias"
              showHitCount
            />
            <ProgressBar
              layout="stacked"
              variant="green"
              value={8}
              max={20}
              label="Difíceis"
              showHitCount
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Activity Progress Cards (Blue)
          </h4>
          <div className="flex flex-col gap-4">
            <ProgressBar
              layout="stacked"
              variant="blue"
              value={18}
              max={25}
              label="Matemática"
              showHitCount
            />
            <ProgressBar
              layout="stacked"
              variant="blue"
              value={12}
              max={20}
              label="Português"
              showHitCount
            />
            <ProgressBar
              layout="stacked"
              variant="blue"
              value={22}
              max={30}
              label="Ciências"
              showHitCount
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Stacked Layout Variations
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-500">
                Label only (no hit count)
              </span>
              <ProgressBar
                layout="stacked"
                variant="green"
                value={19}
                max={30}
                label="Moderadas"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-500">
                Hit count only (no label)
              </span>
              <ProgressBar
                layout="stacked"
                variant="blue"
                value={16}
                max={20}
                showHitCount
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-500">
                Complete card with label and hit count
              </span>
              <ProgressBar
                layout="stacked"
                variant="green"
                value={28}
                max={30}
                label="Excelente"
                showHitCount
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Compact layout variant
 */
export const CompactLayout: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Compact Layout - Small Progress Cards (131px)
      </h3>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Activity Progress Cards (Blue)
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <ProgressBar
              layout="compact"
              variant="blue"
              value={70}
              label="Questão 08"
            />
            <ProgressBar
              layout="compact"
              variant="blue"
              value={45}
              label="Questão 09"
            />
            <ProgressBar
              layout="compact"
              variant="blue"
              value={90}
              label="Questão 10"
            />
            <ProgressBar
              layout="compact"
              variant="blue"
              value={25}
              label="Questão 11"
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Performance Metrics Cards (Green)
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <ProgressBar
              layout="compact"
              variant="green"
              value={85}
              label="Módulo A"
            />
            <ProgressBar
              layout="compact"
              variant="green"
              value={60}
              label="Módulo B"
            />
            <ProgressBar
              layout="compact"
              variant="green"
              value={95}
              label="Módulo C"
            />
            <ProgressBar
              layout="compact"
              variant="green"
              value={40}
              label="Módulo D"
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-md mb-4 text-text-950">
            Different Progress Levels
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-500">Low Progress</span>
              <ProgressBar
                layout="compact"
                variant="blue"
                value={15}
                label="Exercício 1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-500">Medium Progress</span>
              <ProgressBar
                layout="compact"
                variant="green"
                value={55}
                label="Exercício 2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-500">High Progress</span>
              <ProgressBar
                layout="compact"
                variant="blue"
                value={95}
                label="Exercício 3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
