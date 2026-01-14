import type { Story } from '@ladle/react';
import { useState } from 'react';
import { ToastNotification } from './ToastNotification';
import { useToastNotification } from './useToastNotification';
import Button from '../../Button/Button';

export const BasicUsage: Story = () => {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Basic Toast Notification</h2>
        <p className="text-sm text-gray-600">
          Click the button to show a toast notification
        </p>

        <Button
          onClick={() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        >
          Show Success Toast
        </Button>

        <ToastNotification
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          title="Operação realizada com sucesso!"
        />
      </div>
    </div>
  );
};

export const WithDescription: Story = () => {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Toast with Description</h2>

        <Button
          onClick={() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        >
          Show Toast with Description
        </Button>

        <ToastNotification
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          title="Dados salvos"
          description="Suas alterações foram salvas com sucesso."
        />
      </div>
    </div>
  );
};

export const DifferentActions: Story = () => {
  const [successToast, setSuccessToast] = useState(false);
  const [warningToast, setWarningToast] = useState(false);
  const [infoToast, setInfoToast] = useState(false);

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Different Toast Types</h2>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSuccessToast(true);
              setTimeout(() => setSuccessToast(false), 3000);
            }}
          >
            Success
          </Button>

          <Button
            onClick={() => {
              setWarningToast(true);
              setTimeout(() => setWarningToast(false), 3000);
            }}
            action="secondary"
          >
            Warning/Error
          </Button>

          <Button
            onClick={() => {
              setInfoToast(true);
              setTimeout(() => setInfoToast(false), 3000);
            }}
            variant="outline"
          >
            Info
          </Button>
        </div>

        <ToastNotification
          isOpen={successToast}
          onClose={() => setSuccessToast(false)}
          title="Sucesso!"
          description="Operação concluída com sucesso"
          action="success"
        />

        <ToastNotification
          isOpen={warningToast}
          onClose={() => setWarningToast(false)}
          title="Erro ao processar"
          description="Não foi possível completar a operação"
          action="warning"
        />

        <ToastNotification
          isOpen={infoToast}
          onClose={() => setInfoToast(false)}
          title="Informação"
          description="Esta é uma mensagem informativa"
          action="info"
        />
      </div>
    </div>
  );
};

export const WithHook: Story = () => {
  const { toastState, showSuccess, showError, showInfo, hideToast } =
    useToastNotification();

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Using useToastNotification Hook</h2>
        <p className="text-sm text-gray-600">
          This example demonstrates the custom hook for easier toast management
        </p>

        <div className="flex gap-2">
          <Button onClick={() => showSuccess('Atividade adicionada!')}>
            Show Success
          </Button>

          <Button
            onClick={() => showError('Erro ao salvar dados')}
            action="secondary"
          >
            Show Error
          </Button>

          <Button
            onClick={() =>
              showInfo('Você tem 3 notificações pendentes', undefined, 5000)
            }
            variant="outline"
          >
            Show Info (5s)
          </Button>
        </div>

        <ToastNotification
          isOpen={toastState.isOpen}
          onClose={hideToast}
          title={toastState.title}
          description={toastState.description}
          action={toastState.action}
        />
      </div>
    </div>
  );
};

export const RealWorldExample: Story = () => {
  const { toastState, showSuccess, showError, hideToast } =
    useToastNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showSuccess('Dados salvos com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      showError('Erro ao salvar dados', 'Tente novamente mais tarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call that fails
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network error')), 1500)
      );
      showSuccess('Dados removidos');
    } catch (err) {
      console.error('Erro ao remover dados:', err);
      showError('Erro ao remover dados', 'Verifique sua conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Real World Example</h2>
        <p className="text-sm text-gray-600">
          Simulating API calls with success and error handling
        </p>

        <div className="flex gap-2">
          <Button onClick={handleSaveData} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Dados'}
          </Button>

          <Button
            onClick={handleDeleteData}
            disabled={isLoading}
            action="secondary"
          >
            {isLoading ? 'Removendo...' : 'Remover Dados'}
          </Button>
        </div>

        <ToastNotification
          isOpen={toastState.isOpen}
          onClose={hideToast}
          title={toastState.title}
          description={toastState.description}
          action={toastState.action}
        />
      </div>
    </div>
  );
};
