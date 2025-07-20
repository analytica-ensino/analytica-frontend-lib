import type { Story } from '@ladle/react';
import { AlertDialog } from './AlertDialog';
import Button from '../Button/Button';
import Text from '../Text/Text';

/**
 * Showcase principal: todas as variações do AlertDialog
 */
export const AllAlertDialog: Story = () => (
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
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative" size="small">
              Extra Small
            </Button>
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
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative" size="small">
              Small
            </Button>
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
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative" size="small">
              Medium
            </Button>
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
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative" size="small">
              Large
            </Button>
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
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative" size="small">
              Extra Large
            </Button>
          }
          title="Dialog Extra Large"
          description="Este é um dialog com tamanho extra large (912px)."
          size="extra-large"
          cancelButtonLabel="Cancelar"
          submitButtonLabel="Confirmar"
        />
      </div>
    </div>

    {/* Exemplo básico */}
    <h3 className="font-bold text-2xl text-text-900">Exemplo Básico</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={
          <Button variant="solid" action="negative">
            Excluir Item
          </Button>
        }
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Excluir"
      />
    </div>

    {/* Sem botão de fechar */}
    <h3 className="font-bold text-2xl text-text-900">Sem Botão de Fechar</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={
          <Button variant="solid" action="primary">
            Ação Importante
          </Button>
        }
        title="Ação Importante"
        hideCloseButton={true}
        description="Esta é uma ação importante que requer sua atenção. Você deve tomar uma decisão."
        cancelButtonLabel="Não"
        submitButtonLabel="Sim"
      />
    </div>

    {/* Não fecha no backdrop */}
    <h3 className="font-bold text-2xl text-text-900">Não Fecha no Backdrop</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={
          <Button variant="solid" action="negative">
            Ação Crítica
          </Button>
        }
        title="Ação Crítica"
        closeOnBackdropClick={false}
        description="Esta é uma ação crítica que não pode ser cancelada clicando fora do dialog. Você deve escolher uma opção."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>

    {/* Não fecha no Escape */}
    <h3 className="font-bold text-2xl text-text-900">Não Fecha no Escape</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={
          <Button variant="solid" action="negative">
            Ação Crítica
          </Button>
        }
        title="Ação Crítica"
        closeOnEscape={false}
        description="Esta é uma ação crítica que não pode ser cancelada pressionando Escape. Você deve escolher uma opção."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
      />
    </div>

    {/* Conteúdo personalizado */}
    <h3 className="font-bold text-2xl text-text-900">Conteúdo Personalizado</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={
          <Button variant="outline" action="primary">
            Ver Detalhes
          </Button>
        }
        title="Informações do Usuário"
        description="Informações do usuário"
        cancelButtonLabel="Fechar"
        submitButtonLabel="Fechar"
      >
        <div className="space-y-4">
          <div>
            <Text className="font-semibold">Nome:</Text>
            <Text>João Silva</Text>
          </div>
          <div>
            <Text className="font-semibold">Email:</Text>
            <Text>joao.silva@exemplo.com</Text>
          </div>
          <div>
            <Text className="font-semibold">Status:</Text>
            <Text className="text-success-500">Ativo</Text>
          </div>
        </div>
      </AlertDialog>
    </div>

    {/* Diferentes tipos de botões */}
    <h3 className="font-bold text-2xl text-text-900">
      Diferentes Tipos de Botões
    </h3>
    <div className="flex flex-col gap-4">
      <div>
        <Text className="font-semibold mb-2">Ação Negativa</Text>
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative">
              Excluir
            </Button>
          }
          title="Confirmar Exclusão"
          description="Tem certeza que deseja excluir este item?"
          cancelButtonLabel="Cancelar"
          submitButtonLabel="Excluir"
        />
      </div>

      <div>
        <Text className="font-semibold mb-2">Ação Positiva</Text>
        <AlertDialog
          trigger={
            <Button variant="solid" action="positive">
              Salvar
            </Button>
          }
          title="Confirmar Salvamento"
          description="Deseja salvar as alterações?"
          cancelButtonLabel="Cancelar"
          submitButtonLabel="Salvar"
        />
      </div>

      <div>
        <Text className="font-semibold mb-2">Ação de Aviso</Text>
        <AlertDialog
          trigger={
            <Button variant="solid" action="negative">
              Aviso
            </Button>
          }
          title="Aviso Importante"
          description="Esta ação pode ter consequências importantes."
          cancelButtonLabel="Cancelar"
          submitButtonLabel="Continuar"
        />
      </div>

      <div>
        <Text className="font-semibold mb-2">Ação Informativa</Text>
        <AlertDialog
          trigger={
            <Button variant="solid" action="primary">
              Informação
            </Button>
          }
          title="Informação"
          description="Esta é uma informação importante para você."
          cancelButtonLabel="Fechar"
          submitButtonLabel="Entendi"
        />
      </div>
    </div>

    {/* Modo controlado */}
    <h3 className="font-bold text-2xl text-text-900">Modo Controlado</h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={<Button variant="outline">Dialog Controlado</Button>}
        title="Dialog Controlado"
        description="Este dialog é controlado externamente."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
        isOpen={false}
        onOpen={() => console.log('Dialog aberto')}
        onClose={() => console.log('Dialog fechado')}
      />
    </div>

    {/* Com valores customizados */}
    <h3 className="font-bold text-2xl text-text-900">
      Com Valores Customizados
    </h3>
    <div className="flex flex-col gap-4">
      <AlertDialog
        trigger={<Button variant="outline">Com Valores</Button>}
        title="Dialog com Valores"
        description="Este dialog passa valores customizados para as funções."
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Confirmar"
        submitValue="valor-submit"
        cancelValue="valor-cancel"
        onSubmit={(value) => console.log('Submit com valor:', value)}
        onCancel={(value) => console.log('Cancel com valor:', value)}
      />
    </div>
  </div>
);

// Stories individuais para referência rápida

export const Default: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative">
        Excluir Item
      </Button>
    }
    title="Confirmar Exclusão"
    description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Excluir"
  />
);

export const ExtraSmall: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative" size="small">
        Extra Small
      </Button>
    }
    title="Dialog Extra Small"
    description="Este é um dialog com tamanho extra small (324px)."
    size="extra-small"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const Small: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative" size="small">
        Small
      </Button>
    }
    title="Dialog Small"
    description="Este é um dialog com tamanho small (378px)."
    size="small"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const Medium: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative" size="small">
        Medium
      </Button>
    }
    title="Dialog Medium"
    description="Este é um dialog com tamanho medium (459px) - tamanho padrão."
    size="medium"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const Large: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative" size="small">
        Large
      </Button>
    }
    title="Dialog Large"
    description="Este é um dialog com tamanho large (578px)."
    size="large"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const ExtraLarge: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative" size="small">
        Extra Large
      </Button>
    }
    title="Dialog Extra Large"
    description="Este é um dialog com tamanho extra large (912px)."
    size="extra-large"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const WithoutCloseButton: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="primary">
        Ação Importante
      </Button>
    }
    title="Ação Importante"
    hideCloseButton={true}
    description="Esta é uma ação importante que requer sua atenção. Você deve tomar uma decisão."
    cancelButtonLabel="Não"
    submitButtonLabel="Sim"
  />
);

export const NoBackdropClose: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative">
        Ação Crítica
      </Button>
    }
    title="Ação Crítica"
    closeOnBackdropClick={false}
    description="Esta é uma ação crítica que não pode ser cancelada clicando fora do dialog. Você deve escolher uma opção."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const NoEscapeClose: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative">
        Ação Crítica
      </Button>
    }
    title="Ação Crítica"
    closeOnEscape={false}
    description="Esta é uma ação crítica que não pode ser cancelada pressionando Escape. Você deve escolher uma opção."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
  />
);

export const CustomContent: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="outline" action="primary">
        Ver Detalhes
      </Button>
    }
    title="Informações do Usuário"
    description="Informações do usuário"
    cancelButtonLabel="Fechar"
    submitButtonLabel="Fechar"
  >
    <div className="space-y-4">
      <div>
        <Text className="font-semibold">Nome:</Text>
        <Text>João Silva</Text>
      </div>
      <div>
        <Text className="font-semibold">Email:</Text>
        <Text>joao.silva@exemplo.com</Text>
      </div>
      <div>
        <Text className="font-semibold">Status:</Text>
        <Text className="text-success-500">Ativo</Text>
      </div>
    </div>
  </AlertDialog>
);

export const NegativeAction: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative">
        Excluir
      </Button>
    }
    title="Confirmar Exclusão"
    description="Tem certeza que deseja excluir este item?"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Excluir"
  />
);

export const PositiveAction: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="positive">
        Salvar
      </Button>
    }
    title="Confirmar Salvamento"
    description="Deseja salvar as alterações?"
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Salvar"
  />
);

export const WarningAction: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="negative">
        Aviso
      </Button>
    }
    title="Aviso Importante"
    description="Esta ação pode ter consequências importantes."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Continuar"
  />
);

export const InfoAction: Story = () => (
  <AlertDialog
    trigger={
      <Button variant="solid" action="primary">
        Informação
      </Button>
    }
    title="Informação"
    description="Esta é uma informação importante para você."
    cancelButtonLabel="Fechar"
    submitButtonLabel="Entendi"
  />
);

export const ControlledMode: Story = () => (
  <AlertDialog
    trigger={<Button variant="outline">Dialog Controlado</Button>}
    title="Dialog Controlado"
    description="Este dialog é controlado externamente."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
    isOpen={false}
    onOpen={() => console.log('Dialog aberto')}
    onClose={() => console.log('Dialog fechado')}
  />
);

export const WithCustomValues: Story = () => (
  <AlertDialog
    trigger={<Button variant="outline">Com Valores</Button>}
    title="Dialog com Valores"
    description="Este dialog passa valores customizados para as funções."
    cancelButtonLabel="Cancelar"
    submitButtonLabel="Confirmar"
    submitValue="valor-submit"
    cancelValue="valor-cancel"
    onSubmit={(value) => console.log('Submit com valor:', value)}
    onCancel={(value) => console.log('Cancel com valor:', value)}
  />
);
