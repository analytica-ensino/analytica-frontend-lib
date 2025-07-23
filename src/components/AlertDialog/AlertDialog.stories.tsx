import type { Story } from '@ladle/react';
import { useState } from 'react';
import { AlertDialog } from './AlertDialog';
import Button from '../Button/Button';
import Text from '../Text/Text';

/**
 * Showcase principal: todas as variações do AlertDialog
 */
export const AllAlertDialog: Story = () => {
  const [openStates, setOpenStates] = useState({
    extraSmall: false,
    small: false,
    medium: false,
    large: false,
    extraLarge: false,
  });

  const handleOpen = (key: keyof typeof openStates) => {
    setOpenStates((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">AlertDialog</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>AlertDialog</code>
      </p>

      {/* Tamanhos */}
      <h3 className="font-bold text-2xl text-text-900">Tamanhos</h3>
      <div className="flex flex-col gap-4">
        <div>
          <Text className="font-semibold mb-2">Extra Small (324px)</Text>
          <Button
            variant="solid"
            action="negative"
            size="small"
            onClick={() => handleOpen('extraSmall')}
          >
            Extra Small
          </Button>
          <AlertDialog
            isOpen={openStates.extraSmall}
            onChangeOpen={(open) =>
              setOpenStates((prev) => ({ ...prev, extraSmall: open }))
            }
            title="Dialog Extra Small"
            description="Este é um dialog com tamanho extra small (324px)."
            size="extra-small"
            cancelButtonLabel="Cancelar"
            submitButtonLabel="Confirmar"
          />
        </div>

        <div>
          <Text className="font-semibold mb-2">Small (378px)</Text>
          <Button
            variant="solid"
            action="negative"
            size="small"
            onClick={() => handleOpen('small')}
          >
            Small
          </Button>
          <AlertDialog
            isOpen={openStates.small}
            onChangeOpen={(open) =>
              setOpenStates((prev) => ({ ...prev, small: open }))
            }
            title="Dialog Small"
            description="Este é um dialog com tamanho small (378px)."
            size="small"
            cancelButtonLabel="Cancelar"
            submitButtonLabel="Confirmar"
          />
        </div>

        <div>
          <Text className="font-semibold mb-2">Medium (459px) - Padrão</Text>
          <Button
            variant="solid"
            action="negative"
            size="small"
            onClick={() => handleOpen('medium')}
          >
            Medium
          </Button>
          <AlertDialog
            isOpen={openStates.medium}
            onChangeOpen={(open) =>
              setOpenStates((prev) => ({ ...prev, medium: open }))
            }
            title="Dialog Medium"
            description="Este é um dialog com tamanho medium (459px) - tamanho padrão."
            size="medium"
            cancelButtonLabel="Cancelar"
            submitButtonLabel="Confirmar"
          />
        </div>

        <div>
          <Text className="font-semibold mb-2">Large (578px)</Text>
          <Button
            variant="solid"
            action="negative"
            size="small"
            onClick={() => handleOpen('large')}
          >
            Large
          </Button>
          <AlertDialog
            isOpen={openStates.large}
            onChangeOpen={(open) =>
              setOpenStates((prev) => ({ ...prev, large: open }))
            }
            title="Dialog Large"
            description="Este é um dialog com tamanho large (578px)."
            size="large"
            cancelButtonLabel="Cancelar"
            submitButtonLabel="Confirmar"
          />
        </div>

        <div>
          <Text className="font-semibold mb-2">Extra Large (912px)</Text>
          <Button
            variant="solid"
            action="negative"
            size="small"
            onClick={() => handleOpen('extraLarge')}
          >
            Extra Large
          </Button>
          <AlertDialog
            isOpen={openStates.extraLarge}
            onChangeOpen={(open) =>
              setOpenStates((prev) => ({ ...prev, extraLarge: open }))
            }
            title="Dialog Extra Large"
            description="Este é um dialog com tamanho extra large (912px)."
            size="extra-large"
            cancelButtonLabel="Cancelar"
            submitButtonLabel="Confirmar"
          />
        </div>
      </div>
    </div>
  );
};

export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Abrir Dialog
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Confirmação"
        description="Tem certeza que deseja prosseguir com esta ação?"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const ExtraSmall: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Extra Small
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Extra Small"
        description="Este é um dialog com tamanho extra small (324px)."
        size="extra-small"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const Small: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Small
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Small"
        description="Este é um dialog com tamanho small (378px)."
        size="small"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const Medium: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Medium
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Medium"
        description="Este é um dialog com tamanho medium (459px) - tamanho padrão."
        size="medium"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const Large: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Large
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Large"
        description="Este é um dialog com tamanho large (578px)."
        size="large"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const ExtraLarge: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Extra Large
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Extra Large"
        description="Este é um dialog com tamanho extra large (912px)."
        size="extra-large"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const NoBackdropClose: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Sem Fechar no Backdrop
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Sem Backdrop"
        description="Este dialog não fecha ao clicar no backdrop."
        closeOnBackdropClick={false}
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const NoEscapeClose: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Sem Fechar no Escape
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Dialog Sem Escape"
        description="Este dialog não fecha ao pressionar Escape."
        closeOnEscape={false}
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const CustomContent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Conteúdo Personalizado
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Conteúdo Personalizado"
        description="Este dialog tem conteúdo personalizado e callbacks customizados."
        cancelButtonLabel="Não"
        submitButtonLabel="Sim"
        onSubmit={() => {
          console.log('Ação confirmada!');
          setIsOpen(false);
        }}
        onCancel={() => {
          console.log('Ação cancelada!');
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export const NegativeAction: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Ação Negativa
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Ação Destrutiva"
        description="Esta ação não pode ser desfeita. Tem certeza?"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Deletar"
      />
    </div>
  );
};

export const PositiveAction: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="positive"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Ação Positiva
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Ação Positiva"
        description="Confirma que deseja salvar as alterações?"
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Salvar"
      />
    </div>
  );
};

export const ControlledMode: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Modo Controlado
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={(open) => {
          console.log(open ? 'Dialog aberto' : 'Dialog fechado');
          setIsOpen(open);
        }}
        title="Modo Controlado"
        description="Este dialog está em modo controlado com callback de mudança de estado."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>
  );
};

export const WithCustomValues: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="solid"
        action="negative"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        Com Valores Customizados
      </Button>
      <AlertDialog
        isOpen={isOpen}
        onChangeOpen={setIsOpen}
        title="Valores Customizados"
        description="Este dialog passa valores customizados para os callbacks."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
        submitValue="valor-submit"
        cancelValue="valor-cancel"
        onSubmit={(value) => {
          console.log('Submit com valor:', value);
          setIsOpen(false);
        }}
        onCancel={(value) => {
          console.log('Cancel com valor:', value);
          setIsOpen(false);
        }}
      />
    </div>
  );
};
