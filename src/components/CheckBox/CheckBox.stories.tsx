import type { Story } from '@ladle/react';
import { CheckBox } from './CheckBox';

const sizes = ['small', 'medium', 'large'] as const;
const states = [
  'default',
  'hovered',
  'focused',
  'invalid',
  'disabled',
] as const;

/**
 * Default CheckBox component showcase
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Basic Usage</h3>
      <div className="flex flex-col gap-4">
        <CheckBox label="Unchecked option" />
        <CheckBox label="Checked option" checked={true} />
        <CheckBox label="Indeterminate option" indeterminate={true} />
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
        CheckBox Sizes
      </h3>

      {/* Small Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Small (16x16px)
        </h4>
        <div className="flex items-center gap-6">
          <CheckBox size="small" label="Small unchecked" />
          <CheckBox size="small" label="Small checked" checked={true} />
          <CheckBox
            size="small"
            label="Small indeterminate"
            indeterminate={true}
          />
        </div>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (20x20px) - Default
        </h4>
        <div className="flex items-center gap-6">
          <CheckBox size="medium" label="Medium unchecked" />
          <CheckBox size="medium" label="Medium checked" checked={true} />
          <CheckBox
            size="medium"
            label="Medium indeterminate"
            indeterminate={true}
          />
        </div>
      </div>

      {/* Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Large (24x24px)
        </h4>
        <div className="flex items-center gap-6">
          <CheckBox size="large" label="Large unchecked" />
          <CheckBox size="large" label="Large checked" checked={true} />
          <CheckBox
            size="large"
            label="Large indeterminate"
            indeterminate={true}
          />
        </div>
      </div>

      {/* Size Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Size Comparison
        </h4>
        <div className="flex items-end gap-8">
          <div className="flex flex-col items-center gap-2">
            <CheckBox size="small" checked={true} />
            <span className="text-xs text-text-500">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CheckBox size="medium" checked={true} />
            <span className="text-xs text-text-500">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CheckBox size="large" checked={true} />
            <span className="text-xs text-text-500">Large</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * State variations
 */
export const States: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        CheckBox States
      </h3>

      {/* Default State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Default</h4>
        <div className="flex items-center gap-6">
          <CheckBox state="default" label="Default unchecked" />
          <CheckBox state="default" label="Default checked" checked={true} />
        </div>
      </div>

      {/* Hovered State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Hovered</h4>
        <div className="flex items-center gap-6">
          <CheckBox state="hovered" label="Hovered unchecked" />
          <CheckBox state="hovered" label="Hovered checked" checked={true} />
        </div>
      </div>

      {/* Focused State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Focused</h4>
        <div className="flex items-center gap-6">
          <CheckBox state="focused" label="Focused unchecked" />
          <CheckBox state="focused" label="Focused checked" checked={true} />
        </div>
      </div>

      {/* Invalid State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Invalid</h4>
        <div className="flex items-center gap-6">
          <CheckBox state="invalid" label="Invalid unchecked" />
          <CheckBox state="invalid" label="Invalid checked" checked={true} />
        </div>
      </div>

      {/* Disabled State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Disabled</h4>
        <div className="flex items-center gap-6">
          <CheckBox disabled label="Disabled unchecked" />
          <CheckBox disabled label="Disabled checked" checked={true} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * All combinations showcase
 */
export const AllCombinations: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        All Size and State Combinations
      </h3>
      <div className="grid grid-cols-2 gap-8">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-4">
            <h4 className="font-medium text-md text-text-950">
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </h4>
            {states.map((state) => (
              <div key={`${size}-${state}`} className="flex items-center gap-4">
                <CheckBox
                  size={size}
                  state={state === 'disabled' ? 'default' : state}
                  disabled={state === 'disabled'}
                  label={`${state}`}
                />
                <CheckBox
                  size={size}
                  state={state === 'disabled' ? 'default' : state}
                  disabled={state === 'disabled'}
                  label={`${state} checked`}
                  checked={true}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Theme variations - Light and Dark mode support
 */
export const Themes: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        CheckBox Themes
      </h3>

      {/* Light Theme */}
      <div className="mb-8" data-theme="light">
        <h4 className="font-medium text-md mb-4 text-text-800">
          Light Theme (Default)
        </h4>
        <div className="p-6 bg-background border border-border-200 rounded-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-700">States</h5>
              <CheckBox label="Default" />
              <CheckBox label="Checked" checked={true} />
              <CheckBox label="Invalid" state="invalid" />
              <CheckBox label="Disabled" disabled />
              <CheckBox label="Indeterminate" indeterminate={true} />
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-700">Sizes</h5>
              <CheckBox size="small" label="Small" checked={true} />
              <CheckBox size="medium" label="Medium" checked={true} />
              <CheckBox size="large" label="Large" checked={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Dark Theme */}
      <div className="mb-8" data-theme="dark">
        <h4 className="font-medium text-md mb-4 text-text-950">Dark Theme</h4>
        <div className="p-6 bg-background border border-border-200 rounded-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-950">States</h5>
              <CheckBox label="Default" />
              <CheckBox label="Checked" checked={true} />
              <CheckBox label="Invalid" state="invalid" />
              <CheckBox label="Disabled" disabled />
              <CheckBox label="Indeterminate" indeterminate={true} />
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-950">Sizes</h5>
              <CheckBox size="small" label="Small" checked={true} />
              <CheckBox size="medium" label="Medium" checked={true} />
              <CheckBox size="large" label="Large" checked={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Side by Side Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-4 text-text-800">
          Side by Side Comparison
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div
            data-theme="light"
            className="p-4 bg-background border border-border-200 rounded-lg"
          >
            <h5 className="font-medium text-sm mb-3 text-text-700">
              Light Mode
            </h5>
            <div className="flex flex-col gap-3">
              <CheckBox label="Option 1" checked={true} />
              <CheckBox label="Option 2" />
              <CheckBox label="Option 3" state="invalid" />
            </div>
          </div>
          <div
            data-theme="dark"
            className="p-4 bg-background border border-border-200 rounded-lg"
          >
            <h5 className="font-medium text-sm mb-3 text-text-700">
              Dark Mode
            </h5>
            <div className="flex flex-col gap-3">
              <CheckBox label="Option 1" checked={true} />
              <CheckBox label="Option 2" />
              <CheckBox label="Option 3" state="invalid" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
