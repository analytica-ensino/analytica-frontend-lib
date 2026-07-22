import type { Story } from '@ladle/react';
import { Avatar } from './Avatar';

const PHOTO = 'https://i.pravatar.cc/150?img=47';

/**
 * With a picture, without one, and with a URL that fails to load — the last
 * two both land on the generic placeholder.
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <h3 className="text-lg font-semibold text-text-950">Avatar</h3>
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar src={PHOTO} name="Daniela Amarante" />
        <span className="text-xs text-text-600">com foto</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Ana Clara" />
        <span className="text-xs text-text-600">sem foto</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar src="https://example.invalid/broken.png" name="Carlos" />
        <span className="text-xs text-text-600">foto quebrada</span>
      </div>
    </div>
  </div>
);

/**
 * Size is driven by a single `size` prop (pixels).
 */
export const Sizes: Story = () => (
  <div className="flex items-end gap-6 p-8">
    {[24, 32, 40, 56, 80].map((size) => (
      <div key={size} className="flex flex-col items-center gap-2">
        <Avatar src={PHOTO} name="Daniela" size={size} />
        <span className="text-xs text-text-600">{size}px</span>
      </div>
    ))}
  </div>
);

/**
 * In a student row, as used by the reading-fluency results.
 */
export const InAStudentRow: Story = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 max-w-md rounded-xl bg-background p-4">
      <Avatar src={PHOTO} name="Daniela Amarante" size={48} />
      <div className="flex flex-col">
        <span className="font-bold text-text-950">Daniela Amarante</span>
        <span className="text-sm text-text-600">
          2º ano fundamental • Turma A
        </span>
      </div>
    </div>
  </div>
);
