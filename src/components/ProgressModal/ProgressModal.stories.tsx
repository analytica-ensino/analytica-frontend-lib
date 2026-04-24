import type { Story } from '@ladle/react';
import { useEffect, useState } from 'react';
import ProgressModal from './ProgressModal';
import Button from '../Button/Button';

const PLACEHOLDER_IMAGE =
  'https://placehold.co/240x240/BBDCF7/2271C4?text=Loading';

export const AllProgressModals: Story = () => {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 className="font-bold text-3xl text-text-900">ProgressModal</h2>
      <p className="text-text-700">
        Modal de progresso com imagem + texto + ProgressBar. Use{' '}
        <code>progress</code> opcional pra mostrar % determinado, ou omita pra
        modo indeterminado (pulse).
      </p>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setOpenKey('indeterminate')}>
          Indeterminado (sem progress)
        </Button>
        <Button onClick={() => setOpenKey('determinate')}>
          Determinado (70%)
        </Button>
        <Button onClick={() => setOpenKey('no-image')}>Sem imagem</Button>
        <Button onClick={() => setOpenKey('rich-message')}>
          Message ReactNode
        </Button>
      </div>

      <ProgressModal
        isOpen={openKey === 'indeterminate'}
        onClose={() => setOpenKey(null)}
        image={PLACEHOLDER_IMAGE}
        message="Transcrevendo sua redação..."
      />

      <ProgressModal
        isOpen={openKey === 'determinate'}
        onClose={() => setOpenKey(null)}
        image={PLACEHOLDER_IMAGE}
        message="Analisando sua redação..."
        progress={70}
      />

      <ProgressModal
        isOpen={openKey === 'no-image'}
        onClose={() => setOpenKey(null)}
        message="Processando sem imagem"
        progress={50}
      />

      <ProgressModal
        isOpen={openKey === 'rich-message'}
        onClose={() => setOpenKey(null)}
        image={PLACEHOLDER_IMAGE}
        message={
          <span>
            <strong>Atenção:</strong> isto pode levar alguns segundos
          </span>
        }
      />
    </div>
  );
};

export const Indeterminate: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir modal indeterminado</Button>
      <ProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        image={PLACEHOLDER_IMAGE}
        message="Transcrevendo sua redação..."
      />
    </>
  );
};

export const Determinate: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir modal com progresso animado
      </Button>
      <ProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        image={PLACEHOLDER_IMAGE}
        message="Analisando sua redação..."
        progress={progress}
      />
    </>
  );
};
