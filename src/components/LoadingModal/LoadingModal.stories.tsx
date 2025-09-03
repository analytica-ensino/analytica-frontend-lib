import type { Story } from '@ladle/react';
import { useState } from 'react';
import LoadingModal from './loadingModal';
import Button from '../Button/Button';

/**
 * Showcase principal: todas as variações possíveis do LoadingModal
 */
export const AllLoadingModals: Story = () => {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const openModal = (key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">LoadingModal</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>LoadingModal</code>
      </p>

      {/* Modal padrão */}
      <h3 className="font-bold text-2xl text-text-900">Modal Padrão</h3>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => openModal('default')}>
          Abrir LoadingModal Padrão
        </Button>
        <LoadingModal
          open={openModals['default'] || false}
          title="Preparando seu simulado..."
          subtitle="Aguarde um instante enquanto geramos suas questões."
        />
      </div>

      {/* Modal com texto personalizado */}
      <h3 className="font-bold text-2xl text-text-900">
        Modal com Texto Personalizado
      </h3>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => openModal('custom')}>
          Abrir LoadingModal Personalizado
        </Button>
        <LoadingModal
          open={openModals['custom'] || false}
          title="Carregando dados..."
          subtitle="Aguarde enquanto processamos sua solicitação."
        />
      </div>

      {/* Modal com texto diferente */}
      <h3 className="font-bold text-2xl text-text-900">
        Modal com Texto Diferente
      </h3>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => openModal('different')}>
          Abrir LoadingModal com Texto Diferente
        </Button>
        <LoadingModal
          open={openModals['different'] || false}
          title="Processando arquivo..."
          subtitle="Isso pode levar alguns minutos dependendo do tamanho."
        />
      </div>
    </div>
  );
};

// Stories individuais para referência rápida
export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir LoadingModal Padrão</Button>
      <LoadingModal
        open={isOpen}
        title="Preparando seu simulado..."
        subtitle="Aguarde um instante enquanto geramos suas questões."
      />
    </>
  );
};

export const CustomText: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir LoadingModal Personalizado
      </Button>
      <LoadingModal
        open={isOpen}
        title="Carregando dados..."
        subtitle="Aguarde enquanto processamos sua solicitação."
      />
    </>
  );
};

export const DifferentText: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir LoadingModal com Texto Diferente
      </Button>
      <LoadingModal
        open={isOpen}
        title="Processando arquivo..."
        subtitle="Isso pode levar alguns minutos dependendo do tamanho."
      />
    </>
  );
};

export const Closed: Story = () => {
  return (
    <LoadingModal
      open={false}
      title="Este modal não será exibido"
      subtitle="Porque a prop 'open' está como false"
    />
  );
};
