import type { Story } from '@ladle/react';
import { useState } from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

/**
 * Showcase principal: todas as combinações possíveis do Modal
 */
export const AllModals: Story = () => {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const openModal = (key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Modal</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>Modal</code>
      </p>

      {/* Tamanhos */}
      <h3 className="font-bold text-2xl text-text-900">Tamanhos</h3>
      <div className="flex flex-wrap gap-4">
        {sizes.map((size) => (
          <div key={size}>
            <Button onClick={() => openModal(size)}>
              Abrir Modal {size.toUpperCase()}
            </Button>
            <Modal
              isOpen={openModals[size] || false}
              onClose={() => closeModal(size)}
              title="Invite your team"
              size={size}
              footer={
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => closeModal(size)}>
                    Cancel
                  </Button>
                  <Button variant="solid" onClick={() => closeModal(size)}>
                    Explore
                  </Button>
                </div>
              }
            >
              Elevate user interactions with our versatile modals. Seamlessly
              integrate notifications, forms, and media displays. Make an impact
              effortlessly.
            </Modal>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stories individuais para referência rápida
export const ExtraSmall: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal XS</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite your team"
        size="xs"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setIsOpen(false)}>
              Explore
            </Button>
          </div>
        }
      >
        Elevate user interactions with our versatile modals.
      </Modal>
    </>
  );
};

export const Small: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal SM</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite your team"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setIsOpen(false)}>
              Explore
            </Button>
          </div>
        }
      >
        Elevate user interactions with our versatile modals.
      </Modal>
    </>
  );
};

export const Medium: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal MD</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite your team"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setIsOpen(false)}>
              Explore
            </Button>
          </div>
        }
      >
        Elevate user interactions with our versatile modals.
      </Modal>
    </>
  );
};

export const Large: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal LG</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite your team"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setIsOpen(false)}>
              Explore
            </Button>
          </div>
        }
      >
        Elevate user interactions with our versatile modals.
      </Modal>
    </>
  );
};

export const ExtraLarge: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal XL</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite your team"
        size="xl"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={() => setIsOpen(false)}>
              Explore
            </Button>
          </div>
        }
      >
        Elevate user interactions with our versatile modals.
      </Modal>
    </>
  );
};
