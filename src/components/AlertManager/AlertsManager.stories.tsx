import type { Story } from '@ladle/react';
import { useState } from 'react';
import { AlertsManager } from './AlertsManager';
import { Button } from '../..';
import type { AlertsConfig, RecipientItem, CategoryConfig } from '.';
import notification from '../../assets/img/notification.png';

const mockEscolas: RecipientItem[] = [
  {
    id: 'escola-1',
    name: 'Escola Municipal João de Barro',
    abbreviation: 'EMJB',
  },
  {
    id: 'escola-2',
    name: 'Escola Estadual Monteiro Lobato',
    abbreviation: 'EEML',
  },
  {
    id: 'escola-3',
    name: 'Escola Pública José de Alencar',
    abbreviation: 'EPJA',
  },
];

const mockSeries: RecipientItem[] = [
  { id: 'serie-1-escola-1', name: '1º Ano', parentId: 'escola-1' },
  { id: 'serie-2-escola-1', name: '2º Ano', parentId: 'escola-1' },
  { id: 'serie-3-escola-1', name: '3º Ano', parentId: 'escola-1' },
  { id: 'serie-1-escola-2', name: '1º Ano', parentId: 'escola-2' },
  { id: 'serie-2-escola-2', name: '2º Ano', parentId: 'escola-2' },
  { id: 'serie-1-escola-3', name: '1º Ano', parentId: 'escola-3' },
  { id: 'serie-3-escola-3', name: '3º Ano', parentId: 'escola-3' },
];

const mockTurmas: RecipientItem[] = [
  {
    id: 'turma-a-serie-1-escola-1',
    name: 'Turma A',
    parentId: 'serie-1-escola-1',
  },
  {
    id: 'turma-b-serie-1-escola-1',
    name: 'Turma B',
    parentId: 'serie-1-escola-1',
  },
  {
    id: 'turma-a-serie-2-escola-1',
    name: 'Turma A',
    parentId: 'serie-2-escola-1',
  },
  {
    id: 'turma-a-serie-1-escola-2',
    name: 'Turma A',
    parentId: 'serie-1-escola-2',
  },
  {
    id: 'turma-c-serie-2-escola-2',
    name: 'Turma C',
    parentId: 'serie-2-escola-2',
  },
];

// Mock de alunos para carregar dinamicamente
const mockAlunos: RecipientItem[] = [
  {
    id: 'aluno-1',
    name: 'Ana Silva',
    parentId: 'turma-a-serie-1-escola-1',
  },
  {
    id: 'aluno-2',
    name: 'Bruno Santos',
    parentId: 'turma-a-serie-1-escola-1',
  },
  {
    id: 'aluno-3',
    name: 'Carlos Oliveira',
    parentId: 'turma-b-serie-1-escola-1',
  },
  {
    id: 'aluno-4',
    name: 'Diana Costa',
    parentId: 'turma-a-serie-1-escola-2',
  },
  {
    id: 'aluno-5',
    name: 'Eduardo Lima',
    parentId: 'turma-c-serie-2-escola-2',
  },
  {
    id: 'aluno-6',
    name: 'Fernanda Souza',
    parentId: 'turma-a-serie-1-escola-1',
  },
  {
    id: 'aluno-7',
    name: 'Gabriel Pereira',
    parentId: 'turma-b-serie-1-escola-1',
  },
  {
    id: 'aluno-8',
    name: 'Helena Martins',
    parentId: 'turma-a-serie-2-escola-1',
  },
];

// Configuração completa do AlertsManager
const fullConfig: AlertsConfig = {
  categories: [
    {
      key: 'escola',
      label: 'Escola',
      itens: mockEscolas,
    },
    {
      key: 'serie',
      label: 'Série',
      dependsOn: ['escola'],
      itens: mockSeries,
    },
    {
      key: 'turma',
      label: 'Turma',
      dependsOn: ['serie'],
      itens: mockTurmas,
    },
    {
      key: 'aluno',
      label: 'Aluno',
      dependsOn: ['escola', 'serie', 'turma'],
      itens: mockAlunos,
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
        { key: 'turma', internalField: 'turmaId' },
      ],
    },
  ],
  labels: {
    pageTitle: 'Avisos',
    modalTitle: 'Enviar aviso',
    sendButton: 'Enviar aviso',
    cancelButton: 'Cancelar',
    nextButton: 'Próximo',
    previousButton: 'Anterior',
    finishButton: 'Enviar Aviso',
    titleLabel: 'Título',
    titlePlaceholder: 'Digite o título do aviso',
    messageLabel: 'Mensagem',
    messagePlaceholder: 'Digite a mensagem do aviso',
    recipientsDescription: 'Para quem você vai enviar o aviso?',
    dateLabel: 'Data de envio',
    timeLabel: 'Hora de envio',
    sendTodayLabel: 'Enviar Hoje?',
    sendCopyToEmailLabel: 'Enviar cópia para e-mail',
    previewTitle: 'Prévia do Aviso',
    previewWarning:
      '⚠️ Revise todas as informações antes de enviar. O aviso será enviado imediatamente após a confirmação.',
  },
  behavior: {
    showAlertsTable: true,
    allowImageAttachment: true,
    allowScheduling: true,
    allowEmailCopy: true,
    onSendAlert: async (alertData) => {
      console.log('Enviando aviso:', alertData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Aviso enviado com sucesso!');
    },
  },
};

/**
 * Showcase principal: AlertsManager completo com todas as funcionalidades
 */
export const FullAlertsManager: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Alerts Manager</h2>
      <p className="text-text-700">
        Sistema completo de gerenciamento de avisos com hierarquia de
        destinatários (Escola → Série → Turma → Alunos)
      </p>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal de Avisos</Button>
      <AlertsManager
        config={fullConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage={notification}
      />
    </div>
  );
};

/**
 * Configuração simples com apenas uma categoria
 */
export const SimpleCategory: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const simpleConfig: AlertsConfig = {
    categories: [
      {
        key: 'usuarios',
        label: 'Usuários',
        itens: [
          { id: '1', name: 'João Silva' },
          { id: '2', name: 'Maria Santos' },
          { id: '3', name: 'Pedro Oliveira' },
          { id: '4', name: 'Ana Costa' },
        ],
      },
    ],
    behavior: {
      showAlertsTable: false,
      allowImageAttachment: false,
      allowScheduling: false,
      allowEmailCopy: false,
      onSendAlert: async (alertData) => {
        console.log('Enviando aviso:', alertData);
        alert('Aviso enviado!');
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Configuração Simples</h2>
      <p className="text-text-700">
        AlertsManager com apenas uma categoria e funcionalidades básicas
      </p>
      <Button onClick={() => setIsOpen(true)}>Enviar Aviso Simples</Button>
      <AlertsManager
        config={simpleConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage={notification}
      />
    </div>
  );
};

/**
 * Configuração com duas categorias hierárquicas
 */
export const TwoLevelHierarchy: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const twoLevelConfig: AlertsConfig = {
    categories: [
      {
        key: 'departamento',
        label: 'Departamento',
        itens: [
          { id: 'dep-1', name: 'Tecnologia' },
          { id: 'dep-2', name: 'Marketing' },
          { id: 'dep-3', name: 'Vendas' },
        ],
      },
      {
        key: 'funcionarios',
        label: 'Funcionários',
        dependsOn: ['departamento'],
        itens: [
          { id: 'func-1', name: 'Carlos Developer', parentId: 'dep-1' },
          { id: 'func-2', name: 'Ana Designer', parentId: 'dep-2' },
          { id: 'func-3', name: 'Bruno Vendedor', parentId: 'dep-3' },
          { id: 'func-4', name: 'Diana Tech Lead', parentId: 'dep-1' },
          { id: 'func-5', name: 'Eduardo Marketing', parentId: 'dep-2' },
        ],
      },
    ],
    labels: {
      pageTitle: 'Avisos Corporativos',
      modalTitle: 'Enviar comunicado',
      sendButton: 'Enviar comunicado',
    },
    behavior: {
      showAlertsTable: true,
      allowImageAttachment: true,
      allowScheduling: true,
      allowEmailCopy: true,
      onSendAlert: async (alertData) => {
        console.log('Comunicado:', alertData);
        alert('Comunicado enviado!');
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">
        Hierarquia de 2 Níveis
      </h2>
      <p className="text-text-700">
        AlertsManager com Departamento → Funcionários
      </p>
      <Button onClick={() => setIsOpen(true)}>
        Enviar Comunicado Corporativo
      </Button>
      <AlertsManager
        config={twoLevelConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage={notification}
      />
    </div>
  );
};

/**
 * Configuração sem tabela de avisos
 */
export const WithoutAlertsTable: Story = () => {
  const noTableConfig: AlertsConfig = {
    categories: [
      {
        key: 'grupos',
        label: 'Grupos',
        itens: [
          { id: 'g1', name: 'Grupo A' },
          { id: 'g2', name: 'Grupo B' },
          { id: 'g3', name: 'Grupo C' },
        ],
      },
    ],
    behavior: {
      showAlertsTable: false,
      onSendAlert: async (alertData) => {
        console.log('Aviso:', alertData);
        alert('Aviso enviado!');
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Sem Tabela de Avisos</h2>
      <p className="text-text-700">
        AlertsManager focado apenas no envio, sem histórico
      </p>
      <AlertsManager config={noTableConfig} defaultImage={notification} />
    </div>
  );
};

/**
 * Configuração com labels customizadas em inglês
 */
export const CustomLabelsEnglish: Story = () => {
  const englishConfig: AlertsConfig = {
    categories: [
      {
        key: 'users',
        label: 'Users',
        itens: [
          { id: 'u1', name: 'John Doe' },
          { id: 'u2', name: 'Jane Smith' },
          { id: 'u3', name: 'Bob Johnson' },
        ],
      },
    ],
    labels: {
      pageTitle: 'Notifications',
      modalTitle: 'Send Notification',
      sendButton: 'Send',
      cancelButton: 'Cancel',
      nextButton: 'Next',
      previousButton: 'Previous',
      finishButton: 'Send Notification',
      titleLabel: 'Title',
      titlePlaceholder: 'Enter notification title',
      messageLabel: 'Message',
      messagePlaceholder: 'Enter notification message',
      recipientsDescription: 'Who will receive this notification?',
      dateLabel: 'Send Date',
      timeLabel: 'Send Time',
      sendTodayLabel: 'Send Today?',
      previewTitle: 'Notification Preview',
      previewWarning:
        '⚠️ Review all information before sending. The notification will be sent immediately after confirmation.',
    },
    behavior: {
      showAlertsTable: true,
      allowImageAttachment: true,
      allowScheduling: true,
      onSendAlert: async (alertData) => {
        console.log('Sending notification:', alertData);
        alert('Notification sent successfully!');
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">
        Custom Labels (English)
      </h2>
      <p className="text-text-700">
        AlertsManager with customized labels in English
      </p>
      <AlertsManager config={englishConfig} defaultImage={notification} />
    </div>
  );
};

/**
 * Configuração mínima obrigatória
 */
export const MinimalConfig: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const minimalConfig: AlertsConfig = {
    categories: [
      {
        key: 'recipients',
        label: 'Recipients',
        itens: [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ],
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">
        Minimal Configuration
      </h2>
      <p className="text-text-700">
        AlertsManager with minimal required configuration
      </p>
      <Button onClick={() => setIsOpen(true)}>Open Minimal Modal</Button>
      <AlertsManager
        config={minimalConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage={notification}
      />
    </div>
  );
};

// Exemplo usando o novo formato dinâmico do CheckboxGroup
const dynamicCheckboxCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [
      {
        id: 'escola-1',
        name: 'Escola Municipal Central',
        cidade: 'São Paulo',
        tipo: 'Pública',
      },
      {
        id: 'escola-2',
        name: 'Colégio Particular Elite',
        cidade: 'São Paulo',
        tipo: 'Privada',
      },
    ],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: [
      { id: 'serie-1', name: '1ª Série', escolaId: 'escola-1' },
      { id: 'serie-2', name: '2ª Série', escolaId: 'escola-1' },
      { id: 'serie-3', name: '7º Ano', escolaId: 'escola-2' },
      { id: 'serie-4', name: '8º Ano', escolaId: 'escola-2' },
    ],
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['escola', 'serie'],
    itens: [
      {
        id: 'turma-1',
        name: 'A',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        turno: 'Manhã',
      },
      {
        id: 'turma-2',
        name: 'B',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        turno: 'Tarde',
      },
      {
        id: 'turma-3',
        name: 'A',
        serieId: 'serie-3',
        escolaId: 'escola-2',
        turno: 'Noite',
      },
    ],
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
    ],
    selectedIds: [],
  },
  {
    key: 'aluno',
    label: 'Aluno',
    dependsOn: ['escola', 'serie', 'turma'],
    itens: [
      // Alunos da Turma A - 1ª Série - Escola Municipal Central
      {
        id: 'aluno-1',
        name: 'Alice Silva',
        turmaId: 'turma-1',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        genero: 'F',
      },
      {
        id: 'aluno-2',
        name: 'Bruno Santos',
        turmaId: 'turma-1',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        genero: 'M',
      },
      {
        id: 'aluno-3',
        name: 'Carlos Oliveira',
        turmaId: 'turma-1',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        genero: 'M',
      },
      // Alunos da Turma B - 1ª Série - Escola Municipal Central
      {
        id: 'aluno-4',
        name: 'Diana Costa',
        turmaId: 'turma-2',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        genero: 'F',
      },
      {
        id: 'aluno-5',
        name: 'Eduardo Lima',
        turmaId: 'turma-2',
        serieId: 'serie-1',
        escolaId: 'escola-1',
        genero: 'M',
      },
      // Alunos da Turma A - 7º Ano - Colégio Particular Elite
      {
        id: 'aluno-6',
        name: 'Fernanda Souza',
        turmaId: 'turma-3',
        serieId: 'serie-3',
        escolaId: 'escola-2',
        genero: 'F',
      },
      {
        id: 'aluno-7',
        name: 'Gabriel Martins',
        turmaId: 'turma-3',
        serieId: 'serie-3',
        escolaId: 'escola-2',
        genero: 'M',
      },
      {
        id: 'aluno-8',
        name: 'Helena Ferreira',
        turmaId: 'turma-3',
        serieId: 'serie-3',
        escolaId: 'escola-2',
        genero: 'F',
      },
    ],
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
      { key: 'turma', internalField: 'turmaId' },
    ],
    selectedIds: [],
  },
];

const dynamicConfig: AlertsConfig = {
  categories: dynamicCheckboxCategories,
  labels: {
    recipientsDescription:
      'Selecione os destinatários usando o novo formato dinâmico',
  },
  behavior: {
    showAlertsTable: true,
    allowImageAttachment: true,
    allowScheduling: true,
    allowEmailCopy: true,
  },
};

export const DynamicCheckboxGroup: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">
        Dynamic CheckboxGroup Format
      </h2>
      <p className="text-text-700">
        AlertsManager using the new dynamic CheckboxGroup format with
        hierarchical dependencies
      </p>
      <Button onClick={() => setIsOpen(true)}>Open Dynamic Modal</Button>
      <AlertsManager
        config={dynamicConfig}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultImage={notification}
      />
    </div>
  );
};
