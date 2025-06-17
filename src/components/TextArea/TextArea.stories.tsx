import type { Story } from '@ladle/react';
import { TextArea } from './TextArea';

const sizes = ['small', 'medium', 'large', 'extraLarge'] as const;
const states = [
  'default',
  'hovered',
  'focused',
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
      <div className="flex flex-col gap-4 max-w-md">
        <TextArea placeholder="Enter your message..." />
        <TextArea
          placeholder="With default value"
          defaultValue="This is some default text content that demonstrates how the TextArea looks with content."
        />
        <TextArea placeholder="Disabled textarea" disabled />
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
          Small (14px font)
        </h4>
        <div className="max-w-md">
          <TextArea
            size="small"
            placeholder="Small textarea"
            defaultValue="This is a small textarea with 14px font size."
          />
        </div>
      </div>

      {/* Medium Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Medium (16px font) - Default
        </h4>
        <div className="max-w-md">
          <TextArea
            size="medium"
            placeholder="Medium textarea"
            defaultValue="This is a medium textarea with 16px font size."
          />
        </div>
      </div>

      {/* Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Large (18px font)
        </h4>
        <div className="max-w-md">
          <TextArea
            size="large"
            placeholder="Large textarea"
            defaultValue="This is a large textarea with 18px font size."
          />
        </div>
      </div>

      {/* Extra Large Size */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Extra Large (20px font)
        </h4>
        <div className="max-w-md">
          <TextArea
            size="extraLarge"
            placeholder="Extra large textarea"
            defaultValue="This is an extra large textarea with 20px font size."
          />
        </div>
      </div>

      {/* Size Comparison */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Size Comparison
        </h4>
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <div className="flex flex-col gap-2">
            <TextArea size="small" placeholder="Small" defaultValue="Small" />
            <span className="text-xs text-text-500">Small (14px)</span>
          </div>
          <div className="flex flex-col gap-2">
            <TextArea
              size="medium"
              placeholder="Medium"
              defaultValue="Medium"
            />
            <span className="text-xs text-text-500">Medium (16px)</span>
          </div>
          <div className="flex flex-col gap-2">
            <TextArea size="large" placeholder="Large" defaultValue="Large" />
            <span className="text-xs text-text-500">Large (18px)</span>
          </div>
          <div className="flex flex-col gap-2">
            <TextArea
              size="extraLarge"
              placeholder="Extra Large"
              defaultValue="Extra Large"
            />
            <span className="text-xs text-text-500">Extra Large (20px)</span>
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
        TextArea States
      </h3>

      {/* Default State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Default</h4>
        <div className="max-w-md">
          <TextArea state="default" placeholder="Default state textarea" />
        </div>
      </div>

      {/* Hovered State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Hovered</h4>
        <div className="max-w-md">
          <TextArea state="hovered" placeholder="Hovered state textarea" />
        </div>
      </div>

      {/* Focused State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Focused</h4>
        <div className="max-w-md">
          <TextArea state="focused" placeholder="Focused state textarea" />
        </div>
      </div>

      {/* Invalid State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Invalid</h4>
        <div className="max-w-md">
          <TextArea
            state="invalid"
            placeholder="Invalid state textarea"
            defaultValue="This content has validation errors."
          />
        </div>
      </div>

      {/* Disabled State */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">Disabled</h4>
        <div className="max-w-md">
          <TextArea
            disabled
            placeholder="Disabled textarea"
            defaultValue="This textarea is disabled and cannot be edited."
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
                  placeholder={`${size} ${state}`}
                  defaultValue={
                    state === 'focused' ? `${size} ${state} with content` : ''
                  }
                  rows={2}
                />
                <span className="text-xs text-text-500">
                  {size} - {state}
                </span>
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
        TextArea Themes
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
              <TextArea placeholder="Default" rows={2} />
              <TextArea
                placeholder="With content"
                defaultValue="Some content here"
                rows={2}
              />
              <TextArea placeholder="Invalid" state="invalid" rows={2} />
              <TextArea placeholder="Disabled" disabled rows={2} />
              <TextArea
                placeholder="Focused typing"
                state="focused"
                defaultValue="Typing..."
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-700">Sizes</h5>
              <TextArea
                size="small"
                placeholder="Small"
                defaultValue="Small textarea"
                rows={2}
              />
              <TextArea
                size="medium"
                placeholder="Medium"
                defaultValue="Medium textarea"
                rows={2}
              />
              <TextArea
                size="large"
                placeholder="Large"
                defaultValue="Large textarea"
                rows={2}
              />
              <TextArea
                size="extraLarge"
                placeholder="Extra Large"
                defaultValue="Extra Large textarea"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dark Theme */}
      <div className="mb-8">
        <h4 className="font-medium text-md mb-4 text-text-800">Dark Theme</h4>
        <div
          className="p-6 bg-background border border-border-200 rounded-lg"
          data-theme="dark"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-950">States</h5>
              <TextArea placeholder="Default" rows={2} />
              <TextArea
                placeholder="With content"
                defaultValue="Some content here"
                rows={2}
              />
              <TextArea placeholder="Invalid" state="invalid" rows={2} />
              <TextArea placeholder="Disabled" disabled rows={2} />
              <TextArea
                placeholder="Focused typing"
                state="focused"
                defaultValue="Typing..."
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-medium text-sm text-text-950">Sizes</h5>
              <TextArea
                size="small"
                placeholder="Small"
                defaultValue="Small textarea"
                rows={2}
              />
              <TextArea
                size="medium"
                placeholder="Medium"
                defaultValue="Medium textarea"
                rows={2}
              />
              <TextArea
                size="large"
                placeholder="Large"
                defaultValue="Large textarea"
                rows={2}
              />
              <TextArea
                size="extraLarge"
                placeholder="Extra Large"
                defaultValue="Extra Large textarea"
                rows={2}
              />
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
              <TextArea
                placeholder="Message 1"
                defaultValue="This is a message in light mode"
                rows={2}
              />
              <TextArea placeholder="Message 2" rows={2} />
              <TextArea
                placeholder="Invalid message"
                state="invalid"
                rows={2}
              />
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
              <TextArea
                placeholder="Message 1"
                defaultValue="This is a message in dark mode"
                rows={2}
              />
              <TextArea placeholder="Message 2" rows={2} />
              <TextArea
                placeholder="Invalid message"
                state="invalid"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Interactive Examples
 */
export const Interactive: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        Interactive TextArea Examples
      </h3>

      {/* With Labels and Messages */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          With Labels and Messages
        </h4>
        <div className="max-w-md flex flex-col gap-4">
          <TextArea
            label="Comments"
            placeholder="Enter your comments here..."
            helperMessage="Please provide detailed feedback"
            rows={3}
          />
          <TextArea
            label="Description"
            placeholder="Describe the issue..."
            errorMessage="This field is required"
            state="invalid"
            rows={3}
          />
          <TextArea
            label="Additional Notes"
            placeholder="Any additional information..."
            helperMessage="Optional field"
            disabled
            rows={3}
          />
        </div>
      </div>

      {/* Auto-resize Example */}
      <div className="mb-6">
        <h4 className="font-medium text-md mb-3 text-text-950">
          Different Row Heights
        </h4>
        <div className="max-w-md flex flex-col gap-4">
          <TextArea
            placeholder="Compact textarea (2 rows)"
            rows={2}
            defaultValue="This is a compact textarea with only 2 rows visible."
          />
          <TextArea
            placeholder="Standard textarea (4 rows)"
            rows={4}
            defaultValue="This is a standard textarea with 4 rows visible. You can type more content here to see how it behaves with more text."
          />
          <TextArea
            placeholder="Large textarea (6 rows)"
            rows={6}
            defaultValue="This is a large textarea with 6 rows visible. Perfect for longer content like descriptions, comments, or detailed feedback. The user has plenty of space to write their thoughts."
          />
        </div>
      </div>
    </div>
  </div>
);
