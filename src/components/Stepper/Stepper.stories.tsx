import type { Story } from '@ladle/react';
import { useState } from 'react';
import Stepper, { StepData } from './Stepper';

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
 * - **default**: Etapa não iniciada (cinza)
 * - **selected**: Etapa atual (azul)
 * - **done**: Etapa concluída (verde com check)
 */

// Sample step data
const basicSteps: StepData[] = [
  {
    id: '1',
    label: 'Informações pessoais',
    description: 'Nome, email e dados básicos',
    state: 'done',
  },
  {
    id: '2',
    label: 'Endereço',
    description: 'Endereço de entrega e cobrança',
    state: 'selected',
  },
  {
    id: '3',
    label: 'Pagamento',
    description: 'Método de pagamento e finalização',
    state: 'default',
  },
];

const extendedSteps: StepData[] = [
  {
    id: '1',
    label: 'Dados Pessoais',
    description: 'Informações básicas do usuário',
    state: 'done',
  },
  {
    id: '2',
    label: 'Documentos',
    description: 'Upload de documentos necessários',
    state: 'done',
  },
  {
    id: '3',
    label: 'Endereço',
    description: 'Endereço residencial e comercial',
    state: 'selected',
  },
  {
    id: '4',
    label: 'Verificação',
    description: 'Verificação dos dados inseridos',
    state: 'default',
  },
  {
    id: '5',
    label: 'Finalização',
    description: 'Confirmação e envio do formulário',
    state: 'default',
  },
];

/**
 * Showcase principal: todas as variações possíveis do Stepper
 */
export const AllSteppers: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: '1000px', padding: '20px' }}>
    <h2 className="font-bold text-3xl text-text-900">Stepper</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Stepper</code>:
    </p>

    {/* Basic stepper */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Básico:</h3>
      <Stepper
        steps={basicSteps}
        size="medium"
        showDescription
        responsive
      />
    </div>
  </div>
);

// Basic stepper story
export const Default: Story = () => (
  <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
    <Stepper
      steps={basicSteps}
      size="medium"
      showDescription
      responsive
    />
  </div>
);

// Size variants
export const Sizes: Story = () => (
  <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
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
        <h3 className="text-lg font-semibold mb-4 text-text-900">Extra Large</h3>
        <Stepper steps={basicSteps} size="extraLarge" />
      </div>
    </div>
  </div>
);

// States demonstration
export const States: Story = () => {
  const allDoneSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'done' },
    { id: '2', label: 'Etapa 2', state: 'done' },
    { id: '3', label: 'Etapa 3', state: 'done' },
  ];

  const allDefaultSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'default' },
    { id: '2', label: 'Etapa 2', state: 'default' },
    { id: '3', label: 'Etapa 3', state: 'default' },
  ];

  const mixedSteps: StepData[] = [
    { id: '1', label: 'Etapa 1', state: 'done' },
    { id: '2', label: 'Etapa 2', state: 'selected' },
    { id: '3', label: 'Etapa 3', state: 'default' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">Todas Concluídas</h3>
          <Stepper steps={allDoneSteps} showDescription={false} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">Todas Pendentes</h3>
          <Stepper steps={allDefaultSteps} showDescription={false} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-900">Estados Mistos</h3>
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
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
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
        onNext={() => setCurrentStep(Math.min(currentStep + 1, extendedSteps.length - 1))}
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
      ? 'done'
      : index === currentStep
      ? 'selected'
      : 'default',
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
