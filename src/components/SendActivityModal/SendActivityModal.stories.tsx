import type { Story } from '@ladle/react';
import { useState } from 'react';
import SendActivityModal from './SendActivityModal';
import { RecipientHierarchy, SendActivityFormData } from './types';
import Button from '../Button/Button';

/**
 * Mock recipients hierarchy for stories
 */
const mockRecipients: RecipientHierarchy = {
  schools: [
    {
      id: 'school-1',
      name: 'Colégio Estadual São Paulo',
      schoolYears: [
        {
          id: 'year-1',
          name: '1º Ano - Ensino Médio',
          classes: [
            {
              id: 'class-1a',
              name: 'Turma A - Manhã',
              shift: 'Manhã',
              students: [
                {
                  studentId: 's1',
                  userInstitutionId: 'ui1',
                  name: 'Ana Silva Santos',
                },
                {
                  studentId: 's2',
                  userInstitutionId: 'ui2',
                  name: 'Bruno Costa Oliveira',
                },
                {
                  studentId: 's3',
                  userInstitutionId: 'ui3',
                  name: 'Carla Mendes Lima',
                },
              ],
            },
            {
              id: 'class-1b',
              name: 'Turma B - Tarde',
              shift: 'Tarde',
              students: [
                {
                  studentId: 's4',
                  userInstitutionId: 'ui4',
                  name: 'Daniel Ferreira Souza',
                },
                {
                  studentId: 's5',
                  userInstitutionId: 'ui5',
                  name: 'Elena Rodrigues Alves',
                },
              ],
            },
          ],
        },
        {
          id: 'year-2',
          name: '2º Ano - Ensino Médio',
          classes: [
            {
              id: 'class-2a',
              name: 'Turma A - Manhã',
              shift: 'Manhã',
              students: [
                {
                  studentId: 's6',
                  userInstitutionId: 'ui6',
                  name: 'Fernando Gomes Pereira',
                },
                {
                  studentId: 's7',
                  userInstitutionId: 'ui7',
                  name: 'Gabriela Martins Castro',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'school-2',
      name: 'Escola Municipal Dom Pedro II',
      schoolYears: [
        {
          id: 'year-3',
          name: '9º Ano - Ensino Fundamental',
          classes: [
            {
              id: 'class-9a',
              name: 'Turma Única',
              students: [
                {
                  studentId: 's8',
                  userInstitutionId: 'ui8',
                  name: 'Helena Nascimento Dias',
                },
                {
                  studentId: 's9',
                  userInstitutionId: 'ui9',
                  name: 'Igor Carvalho Rocha',
                },
                {
                  studentId: 's10',
                  userInstitutionId: 'ui10',
                  name: 'Julia Andrade Nunes',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Showcase principal: SendActivityModal
 */
export const AllSendActivityModals: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] =
    useState<SendActivityFormData | null>(null);

  const handleSubmit = async (data: SendActivityFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setLastSubmittedData(data);
    setIsOpen(false);
    console.log('Submitted data:', data);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">SendActivityModal</h2>
      <p className="text-text-700">
        Modal multi-step para envio de atividades para alunos.
      </p>

      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-xl text-text-900">Características</h3>
        <ul className="list-disc list-inside text-text-700 space-y-1">
          <li>3 etapas: Atividade, Destinatário e Prazo</li>
          <li>Validação por etapa</li>
          <li>
            Seleção hierárquica de alunos (Escola → Série → Turma → Aluno)
          </li>
          <li>DatePickers para datas de início e fim</li>
          <li>Opção de permitir refazer</li>
        </ul>
      </div>

      <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>

      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        recipients={mockRecipients}
        isLoading={isLoading}
      />

      {lastSubmittedData && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
          <h4 className="font-bold text-success-700 mb-2">
            Atividade enviada com sucesso!
          </h4>
          <pre className="text-xs text-text-600 overflow-auto">
            {JSON.stringify(lastSubmittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Modal padrão
 */
export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: SendActivityFormData) => {
    console.log('Form submitted:', data);
    setIsOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Modal Padrão</h2>
      <p className="text-text-700">Exemplo básico do SendActivityModal</p>
      <Button onClick={() => setIsOpen(true)}>Enviar Atividade</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        recipients={mockRecipients}
      />
    </div>
  );
};

/**
 * Modal com estado de loading
 */
export const Loading: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Estado de Loading</h2>
      <p className="text-text-700">Modal com estado de loading ativo</p>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal (Loading)</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async () => {
          // Never resolves to show loading state
          await new Promise(() => {});
        }}
        recipients={mockRecipients}
        isLoading={true}
      />
    </div>
  );
};

/**
 * Modal com poucos alunos
 */
export const FewStudents: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const fewRecipients: RecipientHierarchy = {
    schools: [
      {
        id: 'school-1',
        name: 'Escola Exemplo',
        schoolYears: [
          {
            id: 'year-1',
            name: '1º Ano',
            classes: [
              {
                id: 'class-1',
                name: 'Turma A',
                students: [
                  {
                    studentId: 's1',
                    userInstitutionId: 'ui1',
                    name: 'Aluno Teste 1',
                  },
                  {
                    studentId: 's2',
                    userInstitutionId: 'ui2',
                    name: 'Aluno Teste 2',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Poucos Alunos</h2>
      <p className="text-text-700">Modal com lista reduzida de alunos</p>
      <Button onClick={() => setIsOpen(true)}>Modal com Poucos Alunos</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (data) => {
          console.log('Submitted:', data);
          setIsOpen(false);
        }}
        recipients={fewRecipients}
      />
    </div>
  );
};

/**
 * Múltiplas escolas
 */
export const MultipleSchools: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">Múltiplas Escolas</h2>
      <p className="text-text-700">Modal com hierarquia de múltiplas escolas</p>
      <Button onClick={() => setIsOpen(true)}>Múltiplas Escolas</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (data) => {
          console.log('Submitted:', data);
          setIsOpen(false);
        }}
        recipients={mockRecipients}
      />
    </div>
  );
};
