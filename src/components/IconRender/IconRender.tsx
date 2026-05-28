import { cloneElement, ComponentType, JSX, ReactElement } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { ChatPT } from '../../assets/icons/subjects/ChatPT';
import { ChatEN } from '../../assets/icons/subjects/ChatEN';
import { ChatES } from '../../assets/icons/subjects/ChatES';
import { BookOpenText } from '../../assets/icons/subjects/BookOpenText';
import { Microscope } from '../../assets/icons/subjects/Microscope';
import { HeadCircuit } from '../../assets/icons/subjects/HeadCircuit';

type PhosphorIconName = keyof typeof PhosphorIcons;
type PhosphorIconComponent = ComponentType<{
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}>;
type CustomIconComponent = ComponentType<{
  size: number;
  color: string;
}>;

// Custom icons act as a fallback when Phosphor doesn't expose the name —
// Chat_* have no Phosphor equivalent, and the others stay as a safety net
// in case future Phosphor versions rename or remove them.
const CUSTOM_ICONS: Record<string, CustomIconComponent> = {
  Chat_PT: ChatPT,
  Chat_EN: ChatEN,
  Chat_ES: ChatES,
  BookOpenText,
  Microscope,
  HeadCircuit,
};

export interface IconRenderProps {
  /**
   * The name of the icon to render
   */
  iconName: string | ReactElement;
  /**
   * The color of the icon
   * @default '#000000'
   */
  color?: string;
  /**
   * The size of the icon in pixels
   * @default 24
   */
  size?: number;
  /**
   * The weight/style of the icon (for Phosphor icons)
   * @default 'regular'
   */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

/**
 * Dynamic icon component that renders icons based on name
 * Supports Phosphor icons and custom Chat icons (ChatPT, ChatEN, ChatES)
 *
 * @param iconName - The name of the icon to render
 * @param color - The color of the icon
 * @param size - The size of the icon in pixels
 * @param weight - The weight/style of the icon (for Phosphor icons)
 * @returns JSX element with the corresponding icon
 */
export const IconRender = ({
  iconName,
  color = '#000000',
  size = 24,
  weight = 'regular',
}: IconRenderProps): JSX.Element => {
  // Guard against undefined/null iconName
  if (!iconName) {
    const FallbackIcon = PhosphorIcons.QuestionIcon as PhosphorIconComponent;
    return <FallbackIcon size={size} color={color} weight={weight} />;
  }

  if (typeof iconName === 'string') {
    // @phosphor-icons/react v2 exports canonical names with an `Icon` suffix
    // (the bare name is deprecated). Backend keeps sending the bare name.
    const PhosphorIcon = PhosphorIcons[
      `${iconName}Icon` as PhosphorIconName
    ] as PhosphorIconComponent | undefined;
    if (PhosphorIcon) {
      return <PhosphorIcon size={size} color={color} weight={weight} />;
    }

    const CustomIcon = CUSTOM_ICONS[iconName];
    if (CustomIcon) {
      return <CustomIcon size={size} color={color} />;
    }

    const Fallback = PhosphorIcons.QuestionIcon as PhosphorIconComponent;
    return <Fallback size={size} color={color} weight={weight} />;
  } else {
    // Clone the ReactElement with icon props, casting to avoid TypeScript errors
    return cloneElement(iconName, {
      size,
      color: 'currentColor',
    } as Partial<{
      size: number;
      color: string;
    }>);
  }
};

export default IconRender;
