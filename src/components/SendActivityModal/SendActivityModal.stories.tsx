import type { Story } from '@ladle/react';
import { useState } from 'react';
import SendActivityModal from './SendActivityModal';
import { RecipientHierarchy } from './types';
import Button from '../Button/Button';

/**
 * Simple student list (teacher with single school/year/class)
 * When teacher has only one school, year and class,
 * displays simple list without accordions.
 */
export const SimpleStudentList: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const singlePathRecipients: RecipientHierarchy = {
    schools: [
      {
        id: 'escola-unica',
        name: 'Colégio São Paulo',
        schoolYears: [
          {
            id: 'serie-unica',
            name: '9º Ano - Ensino Fundamental',
            classes: [
              {
                id: 'turma-unica',
                name: '9º Ano A - Manhã',
                shift: 'Manhã',
                students: [
                  {
                    studentId: 's1',
                    userInstitutionId: 'ui1',
                    name: 'Ana Carolina Silva',
                  },
                  {
                    studentId: 's2',
                    userInstitutionId: 'ui2',
                    name: 'Bruno Henrique Costa',
                  },
                  {
                    studentId: 's3',
                    userInstitutionId: 'ui3',
                    name: 'Carla Mendes Lima',
                  },
                  {
                    studentId: 's4',
                    userInstitutionId: 'ui4',
                    name: 'Daniel Ferreira Santos',
                  },
                  {
                    studentId: 's5',
                    userInstitutionId: 'ui5',
                    name: 'Elena Rodrigues Alves',
                  },
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
                  {
                    studentId: 's8',
                    userInstitutionId: 'ui8',
                    name: 'Hugo Nascimento Dias',
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
      <h2 className="font-bold text-2xl text-text-900">
        Lista Simples de Alunos
      </h2>
      <p className="text-text-700">
        Quando o professor tem apenas uma escola, série e turma, exibe lista
        simples sem accordions.
      </p>
      <Button onClick={() => setIsOpen(true)}>Enviar Atividade</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (data) => {
          console.log('Submitted:', data);
          setIsOpen(false);
        }}
        recipients={singlePathRecipients}
      />
    </div>
  );
};

/**
 * Complete hierarchy with school, years, classes and students
 * Represents the Figma structure with 4 flat accordions (non-nested)
 * Demonstrates filtering behavior: select school -> year -> class -> students
 */
export const CompleteHierarchy: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  const completeRecipients: RecipientHierarchy = {
    schools: [
      {
        id: 'escola-1',
        name: 'Colégio São Paulo',
        schoolYears: [
          {
            id: 'serie-9-fund',
            name: '9º Ano - Ensino Fundamental',
            classes: [
              {
                id: 'turma-9a',
                name: '9º Ano A - Manhã',
                shift: 'Manhã',
                students: [
                  {
                    studentId: 's1',
                    userInstitutionId: 'ui1',
                    name: 'Ana Carolina Silva',
                  },
                  {
                    studentId: 's2',
                    userInstitutionId: 'ui2',
                    name: 'Bruno Henrique Costa',
                  },
                  {
                    studentId: 's3',
                    userInstitutionId: 'ui3',
                    name: 'Carla Mendes Lima',
                  },
                  {
                    studentId: 's4',
                    userInstitutionId: 'ui4',
                    name: 'Daniel Ferreira Santos',
                  },
                  {
                    studentId: 's5',
                    userInstitutionId: 'ui5',
                    name: 'Elena Rodrigues Alves',
                  },
                ],
              },
              {
                id: 'turma-9b',
                name: '9º Ano B - Tarde',
                shift: 'Tarde',
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
                  {
                    studentId: 's8',
                    userInstitutionId: 'ui8',
                    name: 'Hugo Nascimento Dias',
                  },
                ],
              },
            ],
          },
          {
            id: 'serie-8-fund',
            name: '8º Ano - Ensino Fundamental',
            classes: [
              {
                id: 'turma-8a',
                name: '8º Ano A - Manhã',
                shift: 'Manhã',
                students: [
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
      {
        id: 'escola-2',
        name: 'Escola Municipal Dom Pedro II',
        schoolYears: [
          {
            id: 'serie-1-medio',
            name: '1º Ano - Ensino Médio',
            classes: [
              {
                id: 'turma-1a',
                name: 'Turma A - Manhã',
                shift: 'Manhã',
                students: [
                  {
                    studentId: 's11',
                    userInstitutionId: 'ui11',
                    name: 'Karina Souza Oliveira',
                  },
                  {
                    studentId: 's12',
                    userInstitutionId: 'ui12',
                    name: 'Leonardo Ribeiro Teixeira',
                  },
                  {
                    studentId: 's13',
                    userInstitutionId: 'ui13',
                    name: 'Mariana Pinto Barbosa',
                  },
                ],
              },
              {
                id: 'turma-1b',
                name: 'Turma B - Tarde',
                shift: 'Tarde',
                students: [
                  {
                    studentId: 's14',
                    userInstitutionId: 'ui14',
                    name: 'Nicolas Freitas Moreira',
                  },
                  {
                    studentId: 's15',
                    userInstitutionId: 'ui15',
                    name: 'Olivia Campos Araújo',
                  },
                ],
              },
            ],
          },
          {
            id: 'serie-2-medio',
            name: '2º Ano - Ensino Médio',
            classes: [
              {
                id: 'turma-2a',
                name: 'Turma Única',
                students: [
                  {
                    studentId: 's16',
                    userInstitutionId: 'ui16',
                    name: 'Paulo Vieira Cardoso',
                  },
                  {
                    studentId: 's17',
                    userInstitutionId: 'ui17',
                    name: 'Rafaela Lima Correia',
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
      <h2 className="font-bold text-2xl text-text-900">Hierarquia Completa</h2>
      <p className="text-text-700">
        Modal com 4 accordions flat: Escola → Série → Turma → Alunos
      </p>
      <p className="text-sm text-text-500">
        Selecione uma escola para liberar as séries, uma série para liberar as
        turmas, e uma turma para liberar os alunos.
      </p>
      <Button onClick={() => setIsOpen(true)}>
        Enviar para Turma Completa
      </Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (data) => {
          console.log('Submitted:', data);
          setIsOpen(false);
        }}
        recipients={completeRecipients}
      />
    </div>
  );
};
