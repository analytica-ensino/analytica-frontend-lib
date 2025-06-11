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
    <Text size="xs">Extra Small Text (xs)</Text>
    <Text size="sm">Small Text (sm)</Text>
    <Text size="base">Base Text (base)</Text>
    <Text size="lg">Large Text (lg)</Text>
    <Text size="xl">Extra Large Text (xl)</Text>
    <Text size="2xl">2X Large Text (2xl)</Text>
    <Text size="3xl">3X Large Text (3xl)</Text>
    <Text size="4xl">4X Large Text (4xl)</Text>
    <Text size="5xl">5X Large Text (5xl)</Text>
  </div>
);

/**
 * All font weights showcase
 */
export const AllWeights: Story = () => (
  <div className="flex flex-col gap-4">
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
 * Text colors showcase
 */
export const Colors: Story = () => (
  <div className="flex flex-col gap-4 p-4" style={{ background: '#gray' }}>
    <Text color="black">Black Text</Text>
    <div className="bg-black p-2 rounded">
      <Text color="white">White Text</Text>
    </div>
  </div>
);

/**
 * Different HTML elements
 */
export const DifferentElements: Story = () => (
  <div className="flex flex-col gap-4">
    <Text as="h1" size="4xl" weight="bold">
      Heading 1
    </Text>
    <Text as="h2" size="3xl" weight="semibold">
      Heading 2
    </Text>
    <Text as="h3" size="2xl" weight="medium">
      Heading 3
    </Text>
    <Text as="h4" size="xl" weight="medium">
      Heading 4
    </Text>
    <Text as="p" size="base" weight="normal">
      This is a paragraph text
    </Text>
    <Text as="span" size="sm" weight="light">
      This is a span text
    </Text>
    <Text as="div" size="lg" weight="bold">
      This is a div text
    </Text>
  </div>
);

/**
 * Size variations with consistent weight
 */
export const SizeVariationsBold: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="xs" weight="bold">
      Bold Extra Small
    </Text>
    <Text size="sm" weight="bold">
      Bold Small
    </Text>
    <Text size="base" weight="bold">
      Bold Base
    </Text>
    <Text size="lg" weight="bold">
      Bold Large
    </Text>
    <Text size="xl" weight="bold">
      Bold Extra Large
    </Text>
    <Text size="2xl" weight="bold">
      Bold 2X Large
    </Text>
    <Text size="3xl" weight="bold">
      Bold 3X Large
    </Text>
  </div>
);

/**
 * Weight variations with consistent size
 */
export const WeightVariationsLarge: Story = () => (
  <div className="flex flex-col gap-4">
    <Text size="lg" weight="hairline">
      Large Hairline
    </Text>
    <Text size="lg" weight="light">
      Large Light
    </Text>
    <Text size="lg" weight="normal">
      Large Normal
    </Text>
    <Text size="lg" weight="medium">
      Large Medium
    </Text>
    <Text size="lg" weight="semibold">
      Large Semibold
    </Text>
    <Text size="lg" weight="bold">
      Large Bold
    </Text>
    <Text size="lg" weight="extrabold">
      Large Extrabold
    </Text>
    <Text size="lg" weight="black">
      Large Black
    </Text>
  </div>
);

/**
 * Custom className example
 */
export const CustomClassName: Story = () => (
  <Text className="underline decoration-2" size="lg" weight="medium">
    Text with custom underline styling
  </Text>
);

/**
 * Typography hierarchy example
 */
export const TypographyHierarchy: Story = () => (
  <div className="flex flex-col gap-6 max-w-2xl">
    <Text as="h1" size="5xl" weight="black">
      Main Title
    </Text>
    <Text as="h2" size="3xl" weight="bold">
      Section Heading
    </Text>
    <Text as="h3" size="xl" weight="semibold">
      Subsection Heading
    </Text>
    <Text as="p" size="base" weight="normal">
      This is a paragraph of body text that demonstrates the normal weight and
      base size. It provides good readability for longer content sections.
    </Text>
    <Text as="p" size="sm" weight="light">
      This is smaller text that might be used for captions, footnotes, or
      secondary information. It uses a lighter weight for reduced emphasis.
    </Text>
  </div>
);
