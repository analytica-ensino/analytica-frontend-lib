import type { Story } from '@ladle/react';

export const AllAlternativesShowcase: Story = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Alternatives Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de lista de alternativas para questões e formulários
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Modo Interativo
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Layout Padrão
            </h3>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Layout Compacto
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
