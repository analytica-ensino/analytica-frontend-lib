import type { Story } from '@ladle/react';
import { useState } from 'react';
import Stepper, { StepData } from './Stepper';
import CheckBox from '../CheckBox/CheckBox';

/**
 * # Stepper
 *
 * Um componente de stepper para formulários multi-etapa e processos com variantes de tamanho e gerenciamento de estado.
 * Suporta navegação, design responsivo e acessibilidade.
 *
 * ## Funcionalidades
 *
 * - **Variações de tamanho**: small, medium, large, extraLarge
 * - **Estados de etapa**: default, selected, done
 * - **Navegação**: Botões de voltar, avançar e concluir
 * - **Responsivo**: Layout vertical em mobile, horizontal em desktop
 * - **Acessível**: Suporte a leitores de tela e navegação por teclado
 * - **Indicador de progresso**: Mostra etapa atual (ex: "Etapa 2 de 4")
 * - **Clicável**: Permite navegar entre etapas concluídas
 *
 * ## Estados das Etapas
 *
 * - **pending**: Etapa não iniciada ou a ser preenchida (cinza)
 * - **current**: Etapa atual sendo preenchida (azul)
 * - **completed**: Etapa concluída/preenchida (azul com check)
 */

// Sample step data with more comprehensive flow
const basicSteps: StepData[] = [
  {
    id: '1',
    label: 'Informações Pessoais',
    state: 'completed',
  },
  {
    id: '2',
    label: 'Documentação',
    state: 'completed',
  },
  {
    id: '3',
    label: 'Endereço Residencial',
    state: 'current',
  },
  {
    id: '4',
    label: 'Dados Profissionais',
    state: 'pending',
  },
  {
    id: '5',
    label: 'Confirmação Final',
    state: 'pending',
  },
];

const extendedSteps: StepData[] = [
  {
    id: '1',
    label: 'Dados Pessoais',
    state: 'completed',
  },
  {
    id: '2',
    label: 'Documentos',
    state: 'completed',
  },
  {
    id: '3',
    label: 'Endereço',
    state: 'current',
  },
  {
    id: '4',
    label: 'Verificação',
    state: 'pending',
  },
  {
    id: '5',
    label: 'Finalização',
    state: 'pending',
  },
];

/**
 * Showcase principal: todas as variações possíveis do Stepper
 */
export const AllSteppers: Story = () => {
  const [currentStep, setCurrentStep] = useState(2); // Inicia na 3ª etapa (index 2)
  const [completedSteps, setCompletedSteps] = useState<number[]>([0, 1]); // Primeiras duas etapas já concluídas
  const [isLastStepCompleted, setIsLastStepCompleted] = useState(false); // Controla se a última etapa foi preenchida

  const handleNext = () => {
    if (currentStep < basicSteps.length - 1) {
      // Marca a etapa atual como concluída
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Marca a última etapa como concluída
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    alert('Formulário finalizado com sucesso!');
    console.log('Processo concluído');
  };

  // Gera os steps dinamicamente baseado no estado atual
  const dynamicSteps: StepData[] = basicSteps.map((step, index) => {
    const isLastStep = index === basicSteps.length - 1;

    if (completedSteps.includes(index)) {
      return { ...step, state: 'completed' };
    }

    if (index === currentStep) {
      // Se está na última etapa e o CheckBox foi marcado, marca como completed
      if (isLastStep && isLastStepCompleted) {
        return { ...step, state: 'completed' };
      }
      return { ...step, state: 'current' };
    }

    return { ...step, state: 'pending' };
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] p-5">
      <h2 className="font-bold text-3xl text-text-900">Stepper</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>Stepper</code> com navegação
        interativa:
      </p>

      {/* Status atual */}
      <div className="p-4 bg-background-100 rounded-lg">
        <h4 className="font-semibold text-text-900 mb-2">
          Status do Formulário:
        </h4>
        <p className="text-text-700">
          Etapa atual: <strong>{currentStep + 1}</strong> de{' '}
          <strong>{basicSteps.length}</strong>
        </p>
        <p className="text-text-700">
          Etapas concluídas: <strong>{completedSteps.length}</strong>
        </p>
        <p className="text-text-600 text-sm mt-2">
          Use os botões abaixo para navegar ou clique nas etapas concluídas
        </p>
      </div>

      {/* Stepper interativo */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Stepper Interativo:
        </h3>
        <Stepper
          steps={dynamicSteps}
          size="medium"
          showProgress
          responsive
          progressText={`Etapa ${currentStep + 1} de ${basicSteps.length}`}
        />

        {/* Navigation buttons implemented in stories */}
        <div className="flex gap-4 justify-between mt-4">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 rounded-lg border border-primary-800 text-primary-800 hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
            >
              Voltar
            </button>
          )}

          <div className="flex-grow" />

          {currentStep === basicSteps.length - 1 ? (
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-lg bg-success-500 text-white hover:bg-success-600 transition-colors duration-200 cursor-pointer"
            >
              Concluir
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-primary-800 text-white hover:bg-primary-900 transition-colors duration-200 cursor-pointer"
            >
              Avançar
            </button>
          )}
        </div>
      </div>

      {/* Simulação da última etapa - Formulário com CheckBox */}
      {currentStep === basicSteps.length - 1 && (
        <div className="p-6 bg-background-50 rounded-lg border border-border-200">
          <h4 className="font-semibold text-text-900 mb-4">
            Formulário da Última Etapa: {basicSteps[currentStep].label}
          </h4>

          <CheckBox
            label="Li e aceito os termos e condições"
            checked={isLastStepCompleted}
            onChange={(e) => setIsLastStepCompleted(e.target.checked)}
            size="medium"
          />

          <p className="text-text-500 text-sm mt-3">
            ✨ Marque o checkbox acima para ver a etapa mudar para "completed"
            com a cor azul claro (#48A0E8) na barra de progresso!
          </p>
        </div>
      )}

      {/* Botões de teste adicionais */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => {
            setCurrentStep(0);
            setCompletedSteps([]);
            setIsLastStepCompleted(false);
          }}
          className="px-4 py-2 bg-background-300 text-text-900 rounded-lg hover:bg-background-400 transition-colors"
        >
          Resetar Formulário
        </button>

        <button
          onClick={() => {
            setCurrentStep(basicSteps.length - 1);
            setCompletedSteps(
              Array.from({ length: basicSteps.length - 1 }, (_, i) => i)
            );
          }}
          className="px-4 py-2 bg-primary-800 text-text rounded-lg hover:bg-primary-900 transition-colors"
        >
          Ir para Última Etapa
        </button>

        <button
          onClick={() => {
            setCurrentStep(basicSteps.length - 1);
            setCompletedSteps(
              Array.from({ length: basicSteps.length }, (_, i) => i)
            );
          }}
          className="px-4 py-2 bg-success-500 text-text rounded-lg hover:bg-success-600 transition-colors"
        >
          Concluir Todas
        </button>
      </div>
    </div>
  );
};

// Size variants
export const Sizes: Story = () => (
  <div className="w-full max-w-[1000px] p-5">
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-900">Small</h3>
        <Stepper steps={basicSteps} size="small" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-900">Medium</h3>
        <Stepper steps={basicSteps} size="medium" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-900">Large</h3>
        <Stepper steps={basicSteps} size="large" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-text-900">
          Extra Large
        </h3>
        <Stepper steps={basicSteps} size="extraLarge" />
      </div>
    </div>
  </div>
);

// Extended process
export const ExtendedProcess: Story = () => {
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <Stepper
        steps={extendedSteps}
        currentStep={currentStep}
        size="large"
        showProgress
      />

      {/* Navigation buttons for extended process */}
      <div className="flex gap-4 justify-between mt-4">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
            className="px-4 py-2 rounded-lg border border-primary-800 text-primary-800 hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
          >
            Voltar
          </button>
        )}

        <div className="flex-grow" />

        {currentStep === extendedSteps.length - 1 ? (
          <button
            onClick={() => alert('Processo finalizado!')}
            className="px-4 py-2 rounded-lg bg-success-500 text-white hover:bg-success-600 transition-colors duration-200 cursor-pointer"
          >
            Finalizar
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentStep(
                Math.min(currentStep + 1, extendedSteps.length - 1)
              )
            }
            className="px-4 py-2 rounded-lg bg-primary-800 text-white hover:bg-primary-900 transition-colors duration-200 cursor-pointer"
          >
            Avançar
          </button>
        )}
      </div>
    </div>
  );
};

// Compact size
export const Compact: Story = () => (
  <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
    <Stepper
      steps={extendedSteps}
      size="small"
      showProgress
      currentStep={2}
      responsive
    />
  </div>
);
