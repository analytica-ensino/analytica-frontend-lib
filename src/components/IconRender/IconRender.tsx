import { cloneElement, ComponentType, JSX, ReactElement } from 'react';
import * as PhosphorIcons from 'phosphor-react';
import { ChatPT } from '../../assets/icons/subjects/ChatPT';
import { ChatEN } from '../../assets/icons/subjects/ChatEN';
import { ChatES } from '../../assets/icons/subjects/ChatES';

type PhosphorIconName = keyof typeof PhosphorIcons;
type PhosphorIconComponent = ComponentType<{
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}>;

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
  if (typeof iconName === 'string') {
    switch (iconName) {
      case 'Chat_PT':
        return <ChatPT size={size} color={color} />;
      case 'Chat_EN':
        return <ChatEN size={size} color={color} />;
      case 'Chat_ES':
        return <ChatES size={size} color={color} />;
      default: {
        const IconComponent = (PhosphorIcons[iconName as PhosphorIconName] ||
          PhosphorIcons.Question) as PhosphorIconComponent;

        return <IconComponent size={size} color={color} weight={weight} />;
      }
    }
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
