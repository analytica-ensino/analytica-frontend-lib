import type { Story } from '@ladle/react';
import { IconRender } from './IconRender';

export const Default: Story = () => (
  <IconRender iconName="Heart" size={24} color="#000000" weight="regular" />
);

export const ChatIcons: Story = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <IconRender iconName="Chat_PT" size={32} />
    <IconRender iconName="Chat_EN" size={32} />
    <IconRender iconName="Chat_ES" size={32} />
  </div>
);

export const PhosphorIcons: Story = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <IconRender iconName="Heart" size={32} color="#ff0000" />
    <IconRender iconName="Star" size={32} color="#ffd700" weight="fill" />
    <IconRender iconName="BookOpen" size={32} color="#0066cc" weight="bold" />
    <IconRender iconName="Flask" size={32} color="#00cc66" />
  </div>
);

export const DifferentSizes: Story = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <IconRender iconName="Heart" size={16} />
    <IconRender iconName="Heart" size={24} />
    <IconRender iconName="Heart" size={32} />
    <IconRender iconName="Heart" size={48} />
  </div>
);

export const DifferentWeights: Story = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <IconRender iconName="Heart" size={32} weight="thin" />
    <IconRender iconName="Heart" size={32} weight="light" />
    <IconRender iconName="Heart" size={32} weight="regular" />
    <IconRender iconName="Heart" size={32} weight="bold" />
    <IconRender iconName="Heart" size={32} weight="fill" />
  </div>
);

export const UnknownIcon: Story = () => (
  <IconRender iconName="UnknownIcon" size={32} color="#999999" />
);
