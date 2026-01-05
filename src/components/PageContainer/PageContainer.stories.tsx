import type { Story } from '@ladle/react';
import { PageContainer } from './PageContainer';

/**
 * Showcase principal: todas as variações possíveis do PageContainer
 */
export const AllPageContainers: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">PageContainer</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>PageContainer</code>:
    </p>

    {/* PageContainer Padrão */}
    <h3 className="font-bold text-2xl text-text-900">Padrão</h3>
    <div className="w-full border border-border-200 rounded-lg">
      <PageContainer>
        <div className="bg-background-100 p-4 rounded-lg">
          <p className="text-text-700">
            Conteúdo centralizado com largura máxima de 1000px
          </p>
        </div>
      </PageContainer>
    </div>

    {/* PageContainer com múltiplos filhos */}
    <h3 className="font-bold text-2xl text-text-900">Com múltiplos filhos</h3>
    <div className="w-full border border-border-200 rounded-lg">
      <PageContainer>
        <div className="bg-background-100 p-4 rounded-lg mb-4">
          <p className="text-text-700">Primeiro bloco de conteúdo</p>
        </div>
        <div className="bg-background-100 p-4 rounded-lg mb-4">
          <p className="text-text-700">Segundo bloco de conteúdo</p>
        </div>
        <div className="bg-background-100 p-4 rounded-lg">
          <p className="text-text-700">Terceiro bloco de conteúdo</p>
        </div>
      </PageContainer>
    </div>

    {/* PageContainer com className customizada */}
    <h3 className="font-bold text-2xl text-text-900">Com className customizada</h3>
    <div className="w-full border border-border-200 rounded-lg">
      <PageContainer className="bg-primary-50">
        <div className="bg-background-100 p-4 rounded-lg">
          <p className="text-text-700">
            Container com background customizado (bg-primary-50)
          </p>
        </div>
      </PageContainer>
    </div>
  </div>
);

// Stories individuais para referência rápida
export const Default: Story = () => (
  <div className="w-full border border-border-200 rounded-lg">
    <PageContainer>
      <div className="bg-background-100 p-4 rounded-lg">
        <h1 className="text-text-900 font-bold text-xl mb-2">Título da Página</h1>
        <p className="text-text-700">
          Este é um exemplo de conteúdo dentro do PageContainer.
        </p>
      </div>
    </PageContainer>
  </div>
);

export const WithCustomClassName: Story = () => (
  <div className="w-full border border-border-200 rounded-lg">
    <PageContainer className="bg-primary-50">
      <div className="bg-background-100 p-4 rounded-lg">
        <p className="text-text-700">Container com estilo customizado</p>
      </div>
    </PageContainer>
  </div>
);

export const WithMultipleChildren: Story = () => (
  <div className="w-full border border-border-200 rounded-lg">
    <PageContainer>
      <header className="bg-background-100 p-4 rounded-lg mb-4">
        <h1 className="text-text-900 font-bold text-xl">Header</h1>
      </header>
      <main className="bg-background-100 p-4 rounded-lg mb-4">
        <p className="text-text-700">Conteúdo principal da página</p>
      </main>
      <footer className="bg-background-100 p-4 rounded-lg">
        <p className="text-text-500 text-sm">Footer</p>
      </footer>
    </PageContainer>
  </div>
);
