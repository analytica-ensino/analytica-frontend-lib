import type { Story } from '@ladle/react';
import Radio from './Radio';

const sizes = ['small', 'medium', 'large', 'extraLarge'] as const;
const states = [
  'default',
  'hovered',
  'focused',
  'invalid',
  'disabled',
] as const;

/**
 * Default Radio component showcase
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Basic Usage</h3>
      <div className="flex flex-col gap-4">
        <Radio name="basic" value="unchecked" label="Unchecked option" />
        <Radio
          name="basic"
          value="checked"
          label="Checked option"
          checked={true}
        />
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
      <h3 className="text-lg font-semibold mb-6 text-text-950">Radio Sizes</h3>

      {/* Small Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Small (16x16px)
        </h4>
        <div className="flex items-center gap-6">
          <Radio
            size="small"
            name="small-group"
            value="unchecked"
            label="Small unchecked"
          />
          <Radio
            size="small"
            name="small-group"
            value="checked"
            label="Small checked"
            checked={true}
          />
        </div>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (20x20px) - Default
        </h4>
        <div className="flex items-center gap-6">
          <Radio
            size="medium"
            name="medium-group"
            value="unchecked"
            label="Medium unchecked"
          />
          <Radio
            size="medium"
            name="medium-group"
            value="checked"
            label="Medium checked"
            checked={true}
          />
        </div>
      </div>

      {/* Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Large (24x24px)
        </h4>
        <div className="flex items-center gap-6">
          <Radio
            size="large"
            name="large-group"
            value="unchecked"
            label="Large unchecked"
          />
          <Radio
            size="large"
            name="large-group"
            value="checked"
            label="Large checked"
            checked={true}
          />
        </div>
      </div>

      {/* Extra Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Extra Large (28x28px)
        </h4>
        <div className="flex items-center gap-6">
          <Radio
            size="extraLarge"
            name="extralarge-group"
            value="unchecked"
            label="Extra large unchecked"
          />
          <Radio
            size="extraLarge"
            name="extralarge-group"
            value="checked"
            label="Extra large checked"
            checked={true}
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
            <Radio
              size="small"
              name="comparison"
              value="small"
              checked={true}
            />
            <span className="text-xs text-text-500">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Radio
              size="medium"
              name="comparison"
              value="medium"
              checked={true}
            />
            <span className="text-xs text-text-500">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Radio
              size="large"
              name="comparison"
              value="large"
              checked={true}
            />
            <span className="text-xs text-text-500">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Radio
              size="extraLarge"
              name="comparison"
              value="extraLarge"
              checked={true}
            />
            <span className="text-xs text-text-500">Extra Large</span>
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
      <h3 className="text-lg font-semibold mb-6 text-text-950">Radio States</h3>

      {/* Default State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Default</h4>
        <div className="flex items-center gap-6">
          <Radio
            state="default"
            name="default-group"
            value="unchecked"
            label="Default unchecked"
          />
          <Radio
            state="default"
            name="default-group"
            value="checked"
            label="Default checked"
            checked={true}
          />
        </div>
      </div>

      {/* Hovered State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Hovered</h4>
        <div className="flex items-center gap-6">
          <Radio
            state="hovered"
            name="hovered-group"
            value="unchecked"
            label="Hovered unchecked"
          />
          <Radio
            state="hovered"
            name="hovered-group"
            value="checked"
            label="Hovered checked"
            checked={true}
          />
        </div>
      </div>

      {/* Focused State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Focused</h4>
        <div className="flex items-center gap-6">
          <Radio
            state="focused"
            name="focused-group"
            value="unchecked"
            label="Focused unchecked"
          />
          <Radio
            state="focused"
            name="focused-group"
            value="checked"
            label="Focused checked"
            checked={true}
          />
        </div>
      </div>

      {/* Invalid State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Invalid</h4>
        <div className="flex items-center gap-6">
          <Radio
            state="invalid"
            name="invalid-group"
            value="unchecked"
            label="Invalid unchecked"
          />
          <Radio
            state="invalid"
            name="invalid-group"
            value="checked"
            label="Invalid checked"
            checked={true}
          />
        </div>
      </div>

      {/* Disabled State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Disabled</h4>
        <div className="flex items-center gap-6">
          <Radio
            disabled
            name="disabled-group"
            value="unchecked"
            label="Disabled unchecked"
          />
          <Radio
            disabled
            name="disabled-group"
            value="checked"
            label="Disabled checked"
            checked={true}
          />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-4 min-w-0">
            <h4 className="font-medium text-md text-text-950">
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </h4>
            {states.map((state) => (
              <div key={`${size}-${state}`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Radio
                  size={size}
                  state={state === 'disabled' ? 'default' : state}
                  disabled={state === 'disabled'}
                  name={`${size}-${state}-group`}
                  value="unchecked"
                  label={`${state}`}
                />
                <Radio
                  size={size}
                  state={state === 'disabled' ? 'default' : state}
                  disabled={state === 'disabled'}
                  name={`${size}-${state}-group`}
                  value="checked"
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
 * With messages showcase
 */
export const WithMessages: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">
        Radio with Messages
      </h3>
      <div className="flex flex-col gap-6">
        <Radio
          name="messages-group"
          value="helper"
          label="Option with helper text"
          helperText="This is some helpful information"
        />
        <Radio
          name="messages-group"
          value="error"
          label="Option with error"
          state="invalid"
          errorMessage="This field has an error"
        />
      </div>
    </div>
  </div>
);

/**
 * Form example with radio groups
 */
export const FormExample: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div className="max-w-md space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3 text-text-950">Account Type</h3>
        <div className="space-y-2">
          <Radio
            size="medium"
            name="account-type"
            value="personal"
            label="Personal Account"
            helperText="For individual use"
          />
          <Radio
            size="medium"
            name="account-type"
            value="business"
            label="Business Account"
            checked
            helperText="For organizations and companies"
          />
          <Radio
            size="medium"
            name="account-type"
            value="enterprise"
            label="Enterprise Account"
            helperText="For large organizations with custom needs"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3 text-text-950">
          Subscription Plan
        </h3>
        <div className="space-y-2">
          <Radio size="small" name="plan" value="free" label="Free Plan" />
          <Radio
            size="small"
            name="plan"
            value="pro"
            label="Pro Plan"
            state="invalid"
            errorMessage="This plan requires payment method"
          />
          <Radio
            size="small"
            name="plan"
            value="enterprise"
            label="Enterprise Plan"
            disabled
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Theme variations showcase
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
          <div className="flex flex-col gap-3">
            <Radio
              name="light-theme"
              value="option1"
              label="Light theme radio"
            />
            <Radio
              checked
              name="light-theme"
              value="option2"
              label="Light theme checked"
            />
            <Radio
              state="focused"
              name="light-theme"
              value="option3"
              label="Light theme focused"
            />
            <Radio
              state="invalid"
              name="light-theme"
              value="option4"
              label="Light theme invalid"
            />
            <Radio
              disabled
              name="light-theme"
              value="option5"
              label="Light theme disabled"
            />
          </div>
        </div>
      </div>

      {/* Dark Theme */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-950">Dark Theme</h4>
        <div
          data-theme="dark"
          className="p-4 bg-background border border-border-300 rounded-lg"
        >
          <div className="flex flex-col gap-3">
            <Radio name="dark-theme" value="option1" label="Dark theme radio" />
            <Radio
              checked
              name="dark-theme"
              value="option2"
              label="Dark theme checked"
            />
            <Radio
              state="focused"
              name="dark-theme"
              value="option3"
              label="Dark theme focused"
            />
            <Radio
              state="invalid"
              name="dark-theme"
              value="option4"
              label="Dark theme invalid"
            />
            <Radio
              disabled
              name="dark-theme"
              value="option5"
              label="Dark theme disabled"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
