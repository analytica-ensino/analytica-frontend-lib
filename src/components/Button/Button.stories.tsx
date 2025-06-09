import type { Story } from '@ladle/react';
import { Button } from './Button';

/**
 * Default button story
 */
export const Default: Story = () => <Button>Default Button</Button>;

/**
 * Primary button variant
 */
export const Primary: Story = () => (
  <Button variant="primary">Primary Button</Button>
);

/**
 * Secondary button variant
 */
export const Secondary: Story = () => (
  <Button variant="secondary">Secondary Button</Button>
);

/**
 * Danger button variant
 */
export const Danger: Story = () => (
  <Button variant="danger">Danger Button</Button>
);

/**
 * Small size button
 */
export const Small: Story = () => <Button size="sm">Small Button</Button>;

/**
 * Medium size button (default)
 */
export const Medium: Story = () => <Button size="md">Medium Button</Button>;

/**
 * Large size button
 */
export const Large: Story = () => <Button size="lg">Large Button</Button>;

/**
 * Disabled button
 */
export const Disabled: Story = () => <Button disabled>Disabled Button</Button>;

/**
 * All variants showcase
 */
export const AllVariants: Story = () => (
  <div className="flex gap-4 flex-wrap">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="danger">Danger</Button>
  </div>
);

/**
 * All sizes showcase
 */
export const AllSizes: Story = () => (
  <div className="flex gap-4 items-center flex-wrap">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

/**
 * Interactive example with click handler
 */
export const Interactive: Story = () => (
  <Button onClick={() => alert('Button clicked!')}>Click me!</Button>
);
