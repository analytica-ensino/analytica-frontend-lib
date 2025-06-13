import type { Story } from '@ladle/react';
import { SelectionButton } from './SelectionButton';

// Ícones SVG para demonstração
const TagIcon = (
  <svg width="24" height="24" fill="none" viewBox="0 0 16 16">
    <path
      d="M2 4.5A2.5 2.5 0 0 1 4.5 2h3.086a2 2 0 0 1 1.414.586l5.414 5.414a2 2 0 0 1 0 2.828l-3.086 3.086a2 2 0 0 1-2.828 0L3.086 8.5A2 2 0 0 1 2 7.086V4.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5.5" cy="5.5" r=".5" fill="currentColor" />
  </svg>
);

const BookmarkIcon = (
  <svg width="24" height="24" fill="none" viewBox="0 0 16 16">
    <path
      d="M4 2h8a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Showcase principal: demonstração do SelectionButton
 */
export const AllSelectionButtons: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">SelectionButton</h2>
    <p className="text-text-700">
      Botão com ícone e texto. Ideal para ações e navegação.
    </p>

    {/* Estados básicos */}
    <h3 className="font-bold text-2xl text-text-900">Estados Básicos</h3>
    <div className="flex flex-row gap-4 items-center">
      <SelectionButton icon={BookmarkIcon} label="Default" />
    </div>

    {/* Diferentes comprimentos de texto */}
    <h3 className="font-bold text-2xl text-text-900">
      Diferentes Tamanhos de Texto
    </h3>
    <div className="flex flex-row gap-3 flex-wrap items-center">
      <SelectionButton icon={TagIcon} label="JS" />
      <SelectionButton icon={TagIcon} label="React" />
      <SelectionButton icon={TagIcon} label="TypeScript" />
      <SelectionButton icon={TagIcon} label="Desenvolvimento Frontend" />
      <SelectionButton icon={TagIcon} label="Arquitetura de Software" />
    </div>

    {/* Diferentes tamnhos de botão */}
    <h3 className="font-bold text-2xl text-text-900">
      Diferentes Tamanhos de Botão
    </h3>
    <div className="flex flex-row gap-3 flex-wrap items-center">
      <SelectionButton icon={TagIcon} label="TypeScript" />
      <SelectionButton className="w-2xs" icon={TagIcon} label="React" />
    </div>
  </div>
);
