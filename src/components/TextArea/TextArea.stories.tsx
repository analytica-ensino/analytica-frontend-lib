import type { Story } from '@ladle/react';
import { TextArea } from './TextArea';

const sizes = ['small', 'medium', 'large', 'extraLarge'] as const;
const states = [
  'default',
  'hovered',
  'focusedAndTyping',
  'invalid',
  'disabled',
] as const;

/**
 * Default TextArea component showcase
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Basic Usage</h3>
      <div className="flex flex-col gap-4">
        <TextArea label="Empty textarea" placeholder="Enter your text here..." />
        <TextArea
          label="With content"
          value="This textarea has some content already filled in."
          placeholder="Enter your text here..."
        />
        <TextArea
          label="With helper text"
          placeholder="Enter your text here..."
          helperText="This is some helpful information."
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
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        TextArea Sizes
      </h3>

      {/* Small Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Small (14px)
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea size="small" label="Small textarea" placeholder="Small size..." />
        </div>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (16px) - Default
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea size="medium" label="Medium textarea" placeholder="Medium size..." />
        </div>
      </div>

      {/* Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Large (18px)
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea size="large" label="Large textarea" placeholder="Large size..." />
        </div>
      </div>

      {/* Extra Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Extra Large (20px)
        </h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea size="extraLarge" label="Extra large textarea" placeholder="Extra large size..." />
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
        TextArea States
      </h3>

      {/* Default State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Default</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea state="default" label="Default state" placeholder="Default state..." />
        </div>
      </div>

      {/* Hovered State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Hovered</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea state="hovered" label="Hovered state" placeholder="Hovered state..." />
        </div>
      </div>

      {/* Focused and Typing State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Focused & Typing</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            state="focusedAndTyping"
            label="Focused & typing state"
            value="User is typing content..."
            placeholder="Focused and typing..."
          />
        </div>
      </div>

      {/* Invalid State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Invalid</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            state="invalid"
            label="Invalid state"
            placeholder="Invalid state..."
            errorMessage="This field is required"
          />
        </div>
      </div>

      {/* Disabled State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Disabled</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            disabled
            label="Disabled state"
            value="This content cannot be edited"
            placeholder="Disabled state..."
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Error and Helper Messages
 */
export const Messages: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Messages & Feedback
      </h3>

      {/* With Error */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">With Error Message</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            label="Comment"
            state="invalid"
            placeholder="Please provide your feedback..."
            errorMessage="This field is required and must be at least 10 characters long."
            value="Too short"
          />
        </div>
      </div>

      {/* With Helper Text */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">With Helper Text</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            label="Bio"
            placeholder="Tell us about yourself..."
            helperText="Maximum 500 characters. This will be displayed on your public profile."
          />
        </div>
      </div>

      {/* Required Field */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Required Field</h4>
        <div className="flex flex-col gap-4 max-w-md">
          <TextArea
            label="Required Field *"
            placeholder="This field is required..."
            required
            helperText="Please fill in this required field."
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
      <div className="grid grid-cols-2 gap-8">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-4">
            <h4 className="font-medium text-md text-text-950">
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </h4>
            {states.map((state) => (
              <div key={`${size}-${state}`} className="flex flex-col gap-2">
                <TextArea
                  size={size}
                  state={state === 'disabled' ? 'default' : state}
                  disabled={state === 'disabled'}
                  label={`${state}`}
                  placeholder={`${state} placeholder...`}
                  value={state === 'focusedAndTyping' ? 'Sample content...' : undefined}
                  errorMessage={state === 'invalid' ? 'Error message' : undefined}
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
 * Form example
 */
export const FormExample: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Contact Form Example</h3>
      <div className="w-full max-w-md space-y-4">
        <TextArea
          label="Subject"
          size="small"
          placeholder="Brief subject line..."
          required
        />
        <TextArea
          label="Message"
          size="medium"
          placeholder="Your detailed message..."
          helperText="Please provide as much detail as possible."
          required
        />
        <TextArea
          label="Additional Notes (Optional)"
          size="medium"
          placeholder="Any additional information..."
          helperText="Optional field for extra context."
        />
      </div>
    </div>
  </div>
);

/**
 * Dark theme showcase
 */
export const DarkTheme: Story = () => (
  <div className="w-full p-6 bg-background-950 rounded-lg" data-theme="dark">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-50">
        Dark Theme Showcase
      </h3>
      <div className="space-y-6 max-w-md">
        <TextArea
          label="Dark Theme Default"
          placeholder="Type in dark theme..."
          helperText="This demonstrates dark theme support."
        />
        <TextArea
          label="Dark Theme with Error"
          state="invalid"
          placeholder="Error state in dark theme..."
          errorMessage="Error message in dark theme."
        />
        <TextArea
          label="Dark Theme Disabled"
          disabled
          placeholder="Disabled in dark theme..."
          value="Disabled content"
        />
      </div>
    </div>
  </div>
);
