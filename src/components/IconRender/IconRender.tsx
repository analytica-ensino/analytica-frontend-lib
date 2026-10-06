import { cloneElement, ComponentType, JSX, ReactElement } from 'react';
import { QuestionIcon } from '@phosphor-icons/react/dist/csr/Question';
import { ArticleNyTimesIcon } from '@phosphor-icons/react/dist/csr/ArticleNyTimes';
import { AtomIcon } from '@phosphor-icons/react/dist/csr/Atom';
import { BasketballIcon } from '@phosphor-icons/react/dist/csr/Basketball';
import { BookIcon } from '@phosphor-icons/react/dist/csr/Book';
import { BookBookmarkIcon } from '@phosphor-icons/react/dist/csr/BookBookmark';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import { CalculatorIcon } from '@phosphor-icons/react/dist/csr/Calculator';
import { CastleTurretIcon } from '@phosphor-icons/react/dist/csr/CastleTurret';
import { ChartLineIcon } from '@phosphor-icons/react/dist/csr/ChartLine';
import { ChatTextIcon } from '@phosphor-icons/react/dist/csr/ChatText';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { CheckSquareIcon } from '@phosphor-icons/react/dist/csr/CheckSquare';
import { CircleHalfIcon } from '@phosphor-icons/react/dist/csr/CircleHalf';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { CylinderIcon } from '@phosphor-icons/react/dist/csr/Cylinder';
import { DribbbleLogoIcon } from '@phosphor-icons/react/dist/csr/DribbbleLogo';
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask';
import { GlobeIcon } from '@phosphor-icons/react/dist/csr/Globe';
import { GlobeHemisphereWestIcon } from '@phosphor-icons/react/dist/csr/GlobeHemisphereWest';
import { GraduationCapIcon } from '@phosphor-icons/react/dist/csr/GraduationCap';
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart';
import { LeafIcon } from '@phosphor-icons/react/dist/csr/Leaf';
import { LightbulbIcon } from '@phosphor-icons/react/dist/csr/Lightbulb';
import { LightningIcon } from '@phosphor-icons/react/dist/csr/Lightning';
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin';
import { MathOperationsIcon } from '@phosphor-icons/react/dist/csr/MathOperations';
import { MusicNoteIcon } from '@phosphor-icons/react/dist/csr/MusicNote';
import { NotebookIcon } from '@phosphor-icons/react/dist/csr/Notebook';
import { PaletteIcon } from '@phosphor-icons/react/dist/csr/Palette';
import { PencilLineIcon } from '@phosphor-icons/react/dist/csr/PencilLine';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { PersonIcon } from '@phosphor-icons/react/dist/csr/Person';
import { ScrollIcon } from '@phosphor-icons/react/dist/csr/Scroll';
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star';
import { TestTubeIcon } from '@phosphor-icons/react/dist/csr/TestTube';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { ChatPT } from '../../assets/icons/subjects/ChatPT';
import { ChatEN } from '../../assets/icons/subjects/ChatEN';
import { ChatES } from '../../assets/icons/subjects/ChatES';
import { BookOpenText } from '../../assets/icons/subjects/BookOpenText';
import { Microscope } from '../../assets/icons/subjects/Microscope';
import { HeadCircuit } from '../../assets/icons/subjects/HeadCircuit';

type PhosphorIconComponent = ComponentType<{
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  role?: string;
}>;
type CustomIconComponent = (props: {
  size: number;
  color: string;
}) => ReactElement;

/**
 * Statically-imported Phosphor icons that the apps render by name.
 *
 * IMPORTANT: this is an explicit allowlist on purpose. The previous
 * implementation did `import * as PhosphorIcons` + dynamic key access, which
 * forced bundlers to ship ALL ~1500 Phosphor icons (~6MB) into every app.
 * Importing each icon from its own `dist/csr/<Name>` entry lets the bundler
 * tree-shake to only what is used. The icon names come from `subject.icon`
 * (backend) and are constrained by the backoffice IconSelector
 * (SUBJECT_ICONS). To support a new icon: add a granular import above and an
 * entry in PHOSPHOR_ICONS below. Unknown names fall back to QuestionIcon.
 */
const PHOSPHOR_ICONS: Record<string, PhosphorIconComponent> = {
  ArticleNyTimes: ArticleNyTimesIcon,
  Atom: AtomIcon,
  Basketball: BasketballIcon,
  Book: BookIcon,
  BookBookmark: BookBookmarkIcon,
  BookOpen: BookOpenIcon,
  Calculator: CalculatorIcon,
  CastleTurret: CastleTurretIcon,
  ChartLine: ChartLineIcon,
  ChatText: ChatTextIcon,
  CheckCircle: CheckCircleIcon,
  CheckSquare: CheckSquareIcon,
  CircleHalf: CircleHalfIcon,
  Clock: ClockIcon,
  Cylinder: CylinderIcon,
  DribbbleLogo: DribbbleLogoIcon,
  Flask: FlaskIcon,
  Globe: GlobeIcon,
  GlobeHemisphereWest: GlobeHemisphereWestIcon,
  GraduationCap: GraduationCapIcon,
  Heart: HeartIcon,
  Leaf: LeafIcon,
  Lightbulb: LightbulbIcon,
  Lightning: LightningIcon,
  MapPin: MapPinIcon,
  MathOperations: MathOperationsIcon,
  MusicNote: MusicNoteIcon,
  Notebook: NotebookIcon,
  Palette: PaletteIcon,
  PencilLine: PencilLineIcon,
  PencilSimple: PencilSimpleIcon,
  Person: PersonIcon,
  Scroll: ScrollIcon,
  Star: StarIcon,
  TestTube: TestTubeIcon,
  Trash: TrashIcon,
};

// Custom icons act as a fallback when Phosphor doesn't expose the name —
// Chat_* have no Phosphor equivalent, and the others stay as a safety net.
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
  /**
   * Hides the icon from assistive technologies. Use it when the icon is
   * purely decorative (e.g. next to a text that already conveys the meaning).
   */
  'aria-hidden'?: boolean | 'true' | 'false';
  /**
   * Accessible name for a meaningful standalone icon. When provided the icon
   * is exposed as `role="img"` (ignored when `aria-hidden` is truthy).
   */
  'aria-label'?: string;
}

/**
 * Accessibility attributes forwarded to the rendered svg element.
 */
type IconA11yProps = {
  'aria-hidden'?: true;
  'aria-label'?: string;
  role?: 'img';
};

/**
 * Builds the accessibility attributes for the rendered icon.
 *
 * @param ariaHidden - Whether the icon must be hidden from assistive technologies
 * @param ariaLabel - Accessible name for a meaningful icon
 * @returns The attributes to spread into the svg element
 */
const buildIconA11yProps = (
  ariaHidden: IconRenderProps['aria-hidden'],
  ariaLabel?: string
): IconA11yProps => {
  // Ícone decorativo: some da árvore de acessibilidade para não ser lido
  // como "imagem" sem nome ao lado de um texto que já dá o significado.
  if (ariaHidden === true || ariaHidden === 'true') {
    return { 'aria-hidden': true };
  }
  // Ícone com significado próprio: precisa de role="img" para que o
  // aria-label seja anunciado de forma consistente pelos leitores de tela.
  if (ariaLabel) {
    return { role: 'img', 'aria-label': ariaLabel };
  }
  return {};
};

/**
 * Dynamic icon component that renders icons based on name.
 * Supports Phosphor icons (from a tree-shakeable allowlist) and custom Chat
 * icons (ChatPT, ChatEN, ChatES). Unknown names render the Question fallback.
 *
 * @param iconName - The name of the icon to render
 * @param color - The color of the icon
 * @param size - The size of the icon in pixels
 * @param weight - The weight/style of the icon (for Phosphor icons)
 * @param aria-hidden - Hides the icon from assistive technologies
 * @param aria-label - Accessible name for a meaningful standalone icon
 * @returns JSX element with the corresponding icon
 */
export const IconRender = ({
  iconName,
  color = '#000000',
  size = 24,
  weight = 'regular',
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
}: IconRenderProps): JSX.Element => {
  const a11yProps = buildIconA11yProps(ariaHidden, ariaLabel);

  // Guard against undefined/null iconName
  if (!iconName) {
    return (
      <QuestionIcon size={size} color={color} weight={weight} {...a11yProps} />
    );
  }

  if (typeof iconName === 'string') {
    const PhosphorIcon = PHOSPHOR_ICONS[iconName];
    if (PhosphorIcon) {
      return (
        <PhosphorIcon
          size={size}
          color={color}
          weight={weight}
          {...a11yProps}
        />
      );
    }

    const CustomIcon = CUSTOM_ICONS[iconName];
    if (CustomIcon) {
      // Os ícones customizados só aceitam size/color; o svg retornado é
      // clonado para receber os atributos de acessibilidade.
      return cloneElement(CustomIcon({ size, color }), a11yProps);
    }

    return (
      <QuestionIcon size={size} color={color} weight={weight} {...a11yProps} />
    );
  } else {
    // Clone the ReactElement with icon props, casting to avoid TypeScript errors
    return cloneElement(iconName, {
      size,
      color: 'currentColor',
      ...a11yProps,
    } as Partial<{
      size: number;
      color: string;
    }>);
  }
};

export default IconRender;
