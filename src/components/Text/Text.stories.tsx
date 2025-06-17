import type { Story } from '@ladle/react';
import { Text } from './Text';

/**
 * Default text story
 */
export const Default: Story = () => <Text>Default Text</Text>;

/**
 * All text sizes showcase
 */
export const AllSizes: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="2xs">Extra Extra Small Text (2xs) - 10px</Text>
    <Text size="xs">Extra Small Text (xs) - 12px</Text>
    <Text size="sm">Small Text (sm) - 14px</Text>
    <Text size="md">Medium Text (md) - 16px</Text>
    <Text size="lg">Large Text (lg) - 18px</Text>
    <Text size="xl">Extra Large Text (xl) - 20px</Text>
    <Text size="2xl">2XL Text (2xl) - 24px</Text>
    <Text size="3xl">3XL Text (3xl) - 30px</Text>
    <Text size="4xl">4XL Text (4xl) - 36px</Text>
    <Text size="5xl">5XL Text (5xl) - 48px</Text>
    <Text size="6xl">6XL Text (6xl) - 60px</Text>
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
      <Text>Text adapts to theme </Text>
    </div>
  </div>
);

/**
 * Different HTML tags
 */
export const DifferentTags: Story = () => (
  <div className="flex flex-col gap-4">
    <Text as="h1" size="6xl" weight="bold">
      H1 Heading - 6XL
    </Text>
    <Text as="h2" size="5xl" weight="bold">
      H2 Heading - 5XL
    </Text>
    <Text as="h3" size="4xl" weight="semibold">
      H3 Heading - 4XL
    </Text>
    <Text as="h4" size="3xl" weight="medium">
      H4 Heading - 3XL
    </Text>
    <Text as="h5" size="2xl" weight="medium">
      H5 Heading - 2XL
    </Text>
    <Text as="h6" size="xl" weight="medium">
      H6 Heading - XL
    </Text>
    <Text as="p" size="md" weight="normal">
      Paragraph text - Medium
    </Text>
    <Text as="span" size="sm" weight="light">
      Span text - Small
    </Text>
    <Text as="div" size="lg" weight="bold">
      Div text - Large
    </Text>
  </div>
);

/**
 * Extra small sizes
 */
export const ExtraSmallSizes: Story = () => (
  <div className="flex flex-col gap-2">
    <Text size="2xs">Extra Extra Small (2xs) - 10px</Text>
    <Text size="xs">Extra Small (xs) - 12px</Text>
    <Text size="sm">Small (sm) - 14px</Text>
  </div>
);

/**
 * Medium sizes
 */
export const MediumSizes: Story = () => (
  <div className="flex flex-col gap-2">
    <Text size="md">Medium (md) - 16px</Text>
    <Text size="lg">Large (lg) - 18px</Text>
    <Text size="xl">Extra Large (xl) - 20px</Text>
  </div>
);

/**
 * Large display sizes
 */
export const LargeDisplaySizes: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="2xl">2XL (2xl) - 24px</Text>
    <Text size="3xl">3XL (3xl) - 30px</Text>
    <Text size="4xl">4XL (4xl) - 36px</Text>
  </div>
);

/**
 * Extra large heading sizes
 */
export const ExtraLargeHeadingSizes: Story = () => (
  <div className="flex flex-col gap-6">
    <Text size="5xl">5XL (5xl) - 48px</Text>
    <Text size="6xl">6XL (6xl) - 60px</Text>
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
 * Typography hierarchy example
 */
export const TypographyHierarchy: Story = () => (
  <div className="flex flex-col gap-6 p-8">
    <Text as="h1" size="6xl" weight="black">
      Main Title - 6XL Black
    </Text>
    <Text as="h2" size="5xl" weight="bold">
      Section Title - 5XL Bold
    </Text>
    <Text as="h3" size="4xl" weight="semibold">
      Subsection - 4XL Semibold
    </Text>
    <Text as="h4" size="3xl" weight="medium">
      Heading - 3XL Medium
    </Text>
    <Text as="p" size="lg" weight="normal">
      Large paragraph text with normal weight. This demonstrates how the Text
      component can be used for prominent body content.
    </Text>
    <Text as="p" size="md" weight="normal">
      Regular paragraph text with medium size and normal weight. This is the
      standard body text size for most content.
    </Text>
    <Text as="span" size="sm" weight="light">
      Small caption text with light weight for secondary information.
    </Text>
    <Text as="span" size="xs" weight="light">
      Extra small text for fine print or metadata.
    </Text>
    <Text as="span" size="2xs" weight="light">
      Tiny text for micro-copy or minimal details.
    </Text>
  </div>
);
