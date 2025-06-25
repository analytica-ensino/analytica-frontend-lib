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
    description: 'Nome, email e dados básicos',
    state: 'completed', // Etapa preenchida
  },
  {
    id: '2',
    label: 'Documentação',
    description: 'Upload de documentos necessários',
    state: 'completed', // Etapa preenchida
  },
  {
    id: '3',
    label: 'Endereço Residencial',
    description: 'Endereço de residência atual',
    state: 'current', // Etapa sendo preenchida
  },
  {
    id: '4',
    label: 'Dados Profissionais',
    description: 'Informações sobre trabalho atual',
    state: 'pending', // Próxima etapa a ser preenchida
  },
  {
    id: '5',
    label: 'Confirmação Final',
    description: 'Revisão e envio dos dados',
    state: 'pending', // Última etapa - começa como pending, depois vira completed
  },
];

const extendedSteps: StepData[] = [
  {
    id: '1',
    label: 'Dados Pessoais',
    description: 'Informações básicas do usuário',
    state: 'completed',
  },
  {
    id: '2',
    label: 'Documentos',
    description: 'Upload de documentos necessários',
    state: 'completed',
  },
  {
    id: '3',
    label: 'Endereço',
    description: 'Endereço residencial e comercial',
    state: 'current',
  },
  {
    id: '4',
    label: 'Verificação',
    description: 'Verificação dos dados inseridos',
    state: 'pending',
  },
  {
    id: '5',
    label: 'Finalização',
    description: 'Confirmação e envio do formulário',
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

  const handleStepClick = (id: string, index: number) => {
    // Permite navegar apenas para etapas concluídas ou a atual
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
      console.log('Navegou para etapa:', id, index);
    }
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
          showDescription
          showNavigation
          showProgress
          onNext={handleNext}
          onPrevious={currentStep > 0 ? handlePrevious : undefined}
          onFinish={handleFinish}
          onStepClick={handleStepClick}
          responsive
          progressText={`Etapa ${currentStep + 1} de ${basicSteps.length}`}
        />
      </div>

      {/* Simulação da última etapa - Formulário com CheckBox */}
      {currentStep === basicSteps.length - 1 && (
        <div className="p-6 bg-background-50 rounded-lg border border-border-200">
          <h4 className="font-semibold text-text-900 mb-4">
            Formulário da Última Etapa: {basicSteps[currentStep].label}
          </h4>
          <p className="text-text-600 mb-4">
            {basicSteps[currentStep].description}
          </p>

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

// Basic stepper story
export const Default: Story = () => (
  <div className="w-full max-w-[800px] p-5">
    <Stepper steps={basicSteps} size="medium" showDescription responsive />
  </div>
);

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

// States demonstration
export const States: Story = () => {
  const allCompletedSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'completed' },
    { id: '2', label: 'Etapa 2', state: 'completed' },
    { id: '3', label: 'Etapa 3', state: 'completed' },
  ];

  const allPendingSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'pending' },
    { id: '2', label: 'Etapa 2', state: 'pending' },
    { id: '3', label: 'Etapa 3', state: 'pending' },
  ];

  const mixedSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'completed' },
    { id: '2', label: 'Etapa 2', state: 'current' },
    { id: '3', label: 'Etapa 3', state: 'pending' },
  ];

  return (
    <div className="w-full max-w-[1000px] p-5">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">
            Todas Concluídas
          </h3>
          <Stepper steps={allCompletedSteps} showDescription={false} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">
            Todas Pendentes
          </h3>
          <Stepper steps={allPendingSteps} showDescription={false} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">
            Estados Mistos
          </h3>
          <Stepper steps={mixedSteps} showDescription={false} />
        </div>
      </div>
    </div>
  );
};

// With navigation
export const WithNavigation: Story = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < basicSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      console.log('onNext:', currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      console.log('onPrevious:', currentStep - 1);
    }
  };

  const handleFinish = () => {
    console.log('onFinish');
    alert('Formulário finalizado!');
  };

  return (
    <div className="w-full max-w-[1000px] p-5">
      <Stepper
        steps={basicSteps}
        currentStep={currentStep}
        showNavigation
        showProgress
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFinish={handleFinish}
        onStepClick={(id, index) => {
          if (index <= currentStep) {
            setCurrentStep(index);
            console.log('onStepClick:', id, index);
          }
        }}
      />
    </div>
  );
};

// Extended process
export const ExtendedProcess: Story = () => {
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <Stepper
        steps={extendedSteps}
        currentStep={currentStep}
        size="large"
        showNavigation
        showProgress
        onNext={() =>
          setCurrentStep(Math.min(currentStep + 1, extendedSteps.length - 1))
        }
        onPrevious={() => setCurrentStep(Math.max(currentStep - 1, 0))}
        onFinish={() => alert('Processo finalizado!')}
        onStepClick={(id, index) => {
          if (index <= currentStep) {
            setCurrentStep(index);
          }
        }}
      />
    </div>
  );
};

// Without descriptions
export const WithoutDescriptions: Story = () => (
  <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
    <Stepper
      steps={basicSteps}
      size="medium"
      showDescription={false}
      showProgress
      currentStep={1}
    />
  </div>
);

// Compact size
export const Compact: Story = () => (
  <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
    <Stepper
      steps={extendedSteps}
      size="small"
      showDescription={false}
      showProgress
      currentStep={2}
      responsive
    />
  </div>
);

// Interactive example
export const Interactive: Story = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < basicSteps.length - 1) {
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

  const handleStepClick = (id: string, index: number) => {
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
    }
  };

  const dynamicSteps: StepData[] = basicSteps.map((step, index) => ({
    ...step,
    state: completedSteps.includes(index)
      ? 'completed'
      : index === currentStep
        ? 'current'
        : 'pending',
  }));

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <div className="space-y-6">
        <div className="text-center p-4 bg-background-100 rounded-lg">
          <p className="text-text-700">
            Clique nas etapas concluídas para navegar ou use os botões abaixo
          </p>
        </div>

        <Stepper
          steps={dynamicSteps}
          size="large"
          showNavigation
          showProgress
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFinish={() => {
            setCompletedSteps([...completedSteps, currentStep]);
            alert('Processo concluído com sucesso!');
          }}
          onStepClick={handleStepClick}
        />
      </div>
    </div>
  );
};

// Mobile responsive
export const MobileResponsive: Story = () => (
  <div style={{ maxWidth: '400px', padding: '20px' }}>
    <Stepper
      steps={basicSteps}
      size="medium"
      showNavigation
      showProgress
      currentStep={1}
      responsive
    />
  </div>
);
