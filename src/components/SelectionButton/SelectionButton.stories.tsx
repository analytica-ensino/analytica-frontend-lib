import type { Story } from '@ladle/react';
import { useState } from 'react';
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

/**
 * Showcase principal: demonstração do SelectionButton com seleção única
 */
export const AllSelectionButtons: Story = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('react');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">SelectionButton</h2>
      <p className="text-text-700">
        Botão com ícone e texto com estado de seleção única. Ideal para menus,
        categorias, tipos de problemas onde apenas uma opção pode estar ativa
        por vez.
      </p>

      {/* Estados básicos */}
      <h3 className="font-bold text-2xl text-text-900">Estados Básicos:</h3>
      <div className="flex flex-row gap-4 items-center">
        <SelectionButton icon={TagIcon} label="Default" />
        <SelectionButton icon={TagIcon} label="Selected" selected={true} />
      </div>

      {/* Exemplos de seleção única */}
      <h3 className="font-bold text-2xl text-text-900">Exemplos:</h3>

      <div className="flex flex-col gap-6">
        <div>
          <div className="font-medium text-text-900 mb-3">
            Filtros de Categoria
          </div>
          <div className="flex flex-row gap-3 flex-wrap">
            <SelectionButton
              icon={TagIcon}
              label="Todos"
              selected={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            <SelectionButton
              icon={TagIcon}
              label="Favoritos"
              selected={selectedCategory === 'favorites'}
              onClick={() => setSelectedCategory('favorites')}
            />
            <SelectionButton
              icon={TagIcon}
              label="Recentes"
              selected={selectedCategory === 'recent'}
              onClick={() => setSelectedCategory('recent')}
            />
          </div>
          <div className="text-sm text-text-600 mt-2">
            Categoria: <strong>{selectedCategory}</strong>
          </div>
        </div>

        <div>
          <div className="font-medium text-text-900 mb-3">
            Linguagem Principal
          </div>
          <div className="flex flex-row gap-3 flex-wrap">
            <SelectionButton
              icon={TagIcon}
              label="React"
              selected={selectedTag === 'react'}
              onClick={() => setSelectedTag('react')}
            />
            <SelectionButton
              icon={TagIcon}
              label="TypeScript"
              selected={selectedTag === 'typescript'}
              onClick={() => setSelectedTag('typescript')}
            />
            <SelectionButton
              icon={TagIcon}
              label="JavaScript"
              selected={selectedTag === 'javascript'}
              onClick={() => setSelectedTag('javascript')}
            />
            <SelectionButton
              icon={TagIcon}
              label="CSS"
              selected={selectedTag === 'css'}
              onClick={() => setSelectedTag('css')}
            />
          </div>
          <div className="text-sm text-text-600 mt-2">
            Linguagem: <strong>{selectedTag}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Estados básicos isolados
 */
export const BasicStates: Story = () => (
  <div className="flex flex-row gap-4">
    <SelectionButton icon={TagIcon} label="Default" />
    <SelectionButton icon={TagIcon} label="Selected" selected={true} />
  </div>
);

/**
 * Exemplo de menu de categorias
 */
export const CategoryMenu: Story = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="flex flex-col gap-3">
      <div className="font-medium text-text-900">Filtrar por categoria</div>
      <div className="flex flex-row gap-3 flex-wrap">
        <SelectionButton
          icon={TagIcon}
          label="Todos"
          selected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        />
        <SelectionButton
          icon={TagIcon}
          label="Favoritos"
          selected={selectedCategory === 'favorites'}
          onClick={() => setSelectedCategory('favorites')}
        />
        <SelectionButton
          icon={TagIcon}
          label="Recentes"
          selected={selectedCategory === 'recent'}
          onClick={() => setSelectedCategory('recent')}
        />
        <SelectionButton
          icon={TagIcon}
          label="Arquivados"
          selected={selectedCategory === 'archived'}
          onClick={() => setSelectedCategory('archived')}
        />
      </div>
      <div className="text-sm text-text-600">
        Mostrando: <strong>{selectedCategory}</strong>
      </div>
    </div>
  );
};
