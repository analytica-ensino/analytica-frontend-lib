import type { Story } from '@ladle/react';
import { Text } from './Text';

/**
 * Default text story
 */
export const Default: Story = () => <Text>Default Text</Text>;

/**
 * Different text sizes
 */
export const AllSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="xs">Extra Small Text (xs)</Text>
    <Text size="sm">Small Text (sm)</Text>
    <Text size="base">Base Text (base)</Text>
    <Text size="lg">Large Text (lg)</Text>
    <Text size="xl">Extra Large Text (xl)</Text>
    <Text size="2xl">2XL Text (2xl)</Text>
    <Text size="3xl">3XL Text (3xl)</Text>
    <Text size="4xl">4XL Text (4xl)</Text>
    <Text size="5xl">5XL Text (5xl)</Text>
  </div>
);

/**
 * Different font weights
 */
export const AllWeights: Story = () => (
  <div className="flex flex-col gap-2">
    <Text weight="hairline">Hairline Weight (100)</Text>
    <Text weight="light">Light Weight (300)</Text>
    <Text weight="normal">Normal Weight (400)</Text>
    <Text weight="medium">Medium Weight (500)</Text>
    <Text weight="semibold">Semibold Weight (600)</Text>
    <Text weight="bold">Bold Weight (700)</Text>
    <Text weight="extrabold">Extrabold Weight (800)</Text>
    <Text weight="black">Black Weight (900)</Text>
  </div>
);

/**
 * Different colors
 */
export const Colors: Story = () => (
  <div className="flex flex-col gap-4">
    <div className="p-4 bg-background">
      <Text color="black">Black text on light background</Text>
    </div>
    <div className="p-4 bg-primary-900">
      <Text color="white">White text on dark background</Text>
    </div>
  </div>
);

/**
 * Different HTML tags
 */
export const DifferentTags: Story = () => (
  <div className="flex flex-col gap-4">
    <Text as="h1" size="4xl" weight="bold">
      H1 Heading
    </Text>
    <Text as="h2" size="3xl" weight="semibold">
      H2 Heading
    </Text>
    <Text as="h3" size="2xl" weight="medium">
      H3 Heading
    </Text>
    <Text as="p" size="base" weight="normal">
      Paragraph text
    </Text>
    <Text as="span" size="sm" weight="light">
      Span text
    </Text>
    <Text as="div" size="lg" weight="bold">
      Div text
    </Text>
  </div>
);

/**
 * Small size variations
 */
export const SmallSizes: Story = () => (
  <div className="flex flex-col gap-2">
    <Text size="xs">Extra Small (xs)</Text>
    <Text size="sm">Small (sm)</Text>
    <Text size="base">Base (base)</Text>
  </div>
);

/**
 * Large size variations
 */
export const LargeSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="lg">Large (lg)</Text>
    <Text size="xl">Extra Large (xl)</Text>
    <Text size="2xl">2XL (2xl)</Text>
  </div>
);

/**
 * Heading sizes
 */
export const HeadingSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="3xl">3XL (3xl)</Text>
    <Text size="4xl">4XL (4xl)</Text>
    <Text size="5xl">5XL (5xl)</Text>
  </div>
);

/**
 * Light weights showcase
 */
export const LightWeights: Story = () => (
  <div className="flex flex-col gap-2">
    <Text weight="hairline" size="lg">
      Hairline Weight
    </Text>
    <Text weight="light" size="lg">
      Light Weight
    </Text>
    <Text weight="normal" size="lg">
      Normal Weight
    </Text>
  </div>
);

/**
 * Bold weights showcase
 */
export const BoldWeights: Story = () => (
  <div className="flex flex-col gap-2">
    <Text weight="medium" size="lg">
      Medium Weight
    </Text>
    <Text weight="semibold" size="lg">
      Semibold Weight
    </Text>
    <Text weight="bold" size="lg">
      Bold Weight
    </Text>
    <Text weight="extrabold" size="lg">
      Extrabold Weight
    </Text>
    <Text weight="black" size="lg">
      Black Weight
    </Text>
  </div>
);

/**
 * Complex example combining multiple props
 */
export const Complex: Story = () => (
  <div className="flex flex-col gap-6 p-8">
    <Text as="h1" size="5xl" weight="black" color="black">
      Main Title
    </Text>
    <Text as="h2" size="3xl" weight="bold" color="black">
      Section Heading
    </Text>
    <Text as="p" size="base" weight="normal" color="black">
      This is a paragraph with normal weight and base size. It demonstrates how
      the Text component can be used for body text content.
    </Text>
    <Text as="span" size="sm" weight="light" color="black">
      Small caption text with light weight
    </Text>

    <div className="mt-8 p-4 bg-primary-900 rounded">
      <Text as="h3" size="2xl" weight="semibold" color="white">
        Dark Background Section
      </Text>
      <Text as="p" size="base" weight="normal" color="white">
        White text on dark background for better contrast and readability.
      </Text>
    </div>
  </div>
);

/**
 * Dark mode demonstration
 */
export const DarkMode: Story = () => (
  <div data-theme="dark" className="p-8 bg-background min-h-screen">
    <div className="flex flex-col gap-4">
      <Text as="h1" size="4xl" weight="bold" color="white">
        Dark Mode Title
      </Text>
      <Text as="p" size="lg" weight="normal" color="white">
        This text adapts to dark mode automatically
      </Text>
      <Text as="span" size="base" weight="medium" color="black">
        This text uses black color which becomes light in dark mode
      </Text>
    </div>
  </div>
);
