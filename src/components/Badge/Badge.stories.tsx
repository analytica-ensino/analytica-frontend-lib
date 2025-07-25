import type { Story } from '@ladle/react';
import { Plus } from 'phosphor-react';
import Badge from './Badge';

const sizes = ['small', 'medium', 'large'] as const;
const variants = [
  'solid',
  'outlined',
  'exams',
  'examsOutlined',
  'resultStatus',
  'notification',
] as const;
const solidActions = ['error', 'warning', 'success', 'info', 'muted'] as const;
const outlinedActions = [
  'error',
  'warning',
  'success',
  'info',
  'muted',
] as const;
const examsActions = ['exam1', 'exam2', 'exam3', 'exam4'] as const;
const resultStatusActions = ['positive', 'negative'] as const;

/**
 * Mapping of variants to their default actions
 * Resolves SonarLint issue with nested ternary operations
 */
const VARIANT_ACTION_MAP = {
  solid: 'error',
  outlined: 'error',
  exams: 'exam1',
  examsOutlined: 'exam1',
  resultStatus: 'positive',
  notification: 'error',
} as const;

/**
 * Helper function to get the appropriate action for a variant
 */
const getActionForVariant = (variant: string) => {
  return (
    VARIANT_ACTION_MAP[variant as keyof typeof VARIANT_ACTION_MAP] ?? 'error'
  );
};

/**
 * Showcase principal: todas as combinações possíveis do Badge
 */
export const AllBadges: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Badge</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Badge</code>:
    </p>

    {/* Tamanhos + variantes + actions */}
    <h3 className="font-bold text-2xl text-text-900">
      Tamanhos, Variantes e Actions
    </h3>

    {/* Solid Variant */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h4 className="font-bold text-xl text-text-900">Solid</h4>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {solidActions.map((action) => (
              <Badge key={action} size={size} variant="solid" action={action}>
                {action}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Outline Variant */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h4 className="font-bold text-xl text-text-900">Outline</h4>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {outlinedActions.map((action) => (
              <Badge
                key={action}
                size={size}
                variant="outlined"
                action={action}
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Exams Variant */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h4 className="font-bold text-xl text-text-900">Exams</h4>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {examsActions.map((action) => (
              <Badge key={action} size={size} variant="exams" action={action}>
                {action}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Exams Outlined Variant */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h4 className="font-bold text-xl text-text-900">Exams Outlined</h4>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {examsActions.map((action) => (
              <Badge
                key={action}
                size={size}
                variant="examsOutlined"
                action={action}
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Result Status Variant */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h4 className="font-bold text-xl text-text-900">Result Status</h4>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {resultStatusActions.map((action) => (
              <Badge
                key={action}
                size={size}
                variant="resultStatus"
                action={action}
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Notification Variant */}
    <div>
      <h4 className="font-bold text-xl text-text-900">Notification</h4>
      <div className="flex flex-row gap-4 flex-wrap">
        <Badge variant="notification">Notifications</Badge>
        <Badge variant="notification" notificationActive={true}>
          Notifications
        </Badge>
      </div>
    </div>

    {/* Ícones à esquerda, direita e ambos */}
    <h3 className="font-bold text-2xl text-text-900">Com Ícones</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à esquerda</div>
        <div className="flex flex-row gap-4">
          {variants
            .filter((v) => v !== 'notification')
            .map((variant) => (
              <Badge
                key={variant}
                variant={variant}
                action={getActionForVariant(variant)}
                className="my-4"
                iconLeft={<Plus size={16} />}
              >
                Badge
              </Badge>
            ))}
        </div>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à direita</div>
        <div className="flex flex-row gap-4">
          {variants
            .filter((v) => v !== 'notification')
            .map((variant) => (
              <Badge
                key={variant}
                variant={variant}
                action={getActionForVariant(variant)}
                className="my-4"
                iconRight={<Plus size={16} />}
              >
                Badge
              </Badge>
            ))}
        </div>
      </div>
    </div>
  </div>
);

// Stories individuais para referência rápida
export const SolidBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {solidActions.map((action) => (
      <Badge key={action} variant="solid" action={action}>
        {action}
      </Badge>
    ))}
  </div>
);

export const OutlineBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {outlinedActions.map((action) => (
      <Badge key={action} variant="outlined" action={action}>
        {action}
      </Badge>
    ))}
  </div>
);

export const ExamsBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {examsActions.map((action) => (
      <Badge key={action} variant="exams" action={action}>
        {action}
      </Badge>
    ))}
  </div>
);

export const ExamsOutlinedBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {examsActions.map((action) => (
      <Badge key={action} variant="examsOutlined" action={action}>
        {action}
      </Badge>
    ))}
  </div>
);

export const ResultStatusBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {resultStatusActions.map((action) => (
      <Badge key={action} variant="resultStatus" action={action}>
        {action}
      </Badge>
    ))}
  </div>
);

export const NotificationBadge: Story = () => (
  <div className="flex flex-row gap-4">
    <Badge variant="notification">Notifications</Badge>
  </div>
);

export const IconLeftBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {variants
      .filter((v) => v !== 'notification')
      .map((variant) => (
        <Badge
          key={variant}
          variant={variant}
          action={getActionForVariant(variant)}
          iconLeft={<Plus size={16} />}
        >
          Ícone à esquerda
        </Badge>
      ))}
  </div>
);

export const IconRightBadge: Story = () => (
  <div className="flex flex-row gap-4">
    {variants
      .filter((v) => v !== 'notification')
      .map((variant) => (
        <Badge
          key={variant}
          variant={variant}
          action={getActionForVariant(variant)}
          iconRight={<Plus size={16} />}
        >
          Ícone à direita
        </Badge>
      ))}
  </div>
);
