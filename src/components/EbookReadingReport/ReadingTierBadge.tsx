import Badge from '../Badge/Badge';
import { READING_TIER_LABEL } from './readingReport';
import { READING_TIER, type ReadingTier } from './types';

/**
 * Colors of each tier: the access map's tokens, with their light-theme value
 * for the themes that do not define them, and a text color that reads on it.
 */
const TIER_COLORS: Record<
  ReadingTier,
  { token: string; fallback: string; text: string }
> = {
  [READING_TIER.HIGHLIGHT]: {
    token: '--color-map-highlight',
    fallback: '#66b584',
    text: '#171717',
  },
  [READING_TIER.ABOVE_AVERAGE]: {
    token: '--color-map-above-avg',
    fallback: '#f8cc2e',
    text: '#171717',
  },
  [READING_TIER.BELOW_AVERAGE]: {
    token: '--color-map-below-avg',
    fallback: '#fb954b',
    text: '#171717',
  },
  [READING_TIER.ATTENTION]: {
    token: '--color-map-attention',
    fallback: '#b91c1c',
    text: '#ffffff',
  },
  [READING_TIER.NONE]: {
    token: '--color-map-no-access',
    fallback: '#2f2f2f',
    text: '#ffffff',
  },
};

/**
 * The tier of a school, class or student ("Destaque", "Ponto de atenção"…),
 * in the colors of the access map's legend.
 * @param {object} props - The props
 * @param {ReadingTier} props.tier - The tier
 * @returns {JSX.Element} The badge
 */
export const ReadingTierBadge = ({ tier }: Readonly<{ tier: ReadingTier }>) => {
  const { token, fallback, text } = TIER_COLORS[tier];
  return (
    <Badge
      variant="solid"
      action="neutral"
      size="small"
      className="uppercase"
      style={{ backgroundColor: `var(${token}, ${fallback})`, color: text }}
      data-testid={`reading-tier-${tier}`}
    >
      {READING_TIER_LABEL[tier]}
    </Badge>
  );
};
