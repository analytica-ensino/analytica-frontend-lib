import type { Story } from '@ladle/react';
import { useState } from 'react';
import SendActivityModal from './SendActivityModal';
import { CategoryConfig } from './types';
import Button from '../Button/Button';

/**
 * Simple student list categories
 * Single school/year/class displays without accordions (compact mode).
 */
const simpleCategoriesData: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [{ id: 'escola-unica', name: 'Colégio São Paulo' }],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [
      {
        id: 'serie-unica',
        name: '9º Ano - Ensino Fundamental',
        schoolId: 'escola-unica',
      },
    ],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [
      { id: 'turma-unica', name: '9º Ano A - Manhã', yearId: 'serie-unica' },
    ],
    selectedIds: [],
  },
  {
    key: 'alunos',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      {
        id: 's1',
        name: 'Ana Carolina Silva',
        classId: 'turma-unica',
        studentId: 's1',
        userInstitutionId: 'ui1',
      },
      {
        id: 's2',
        name: 'Bruno Henrique Costa',
        classId: 'turma-unica',
        studentId: 's2',
        userInstitutionId: 'ui2',
      },
      {
        id: 's3',
        name: 'Carla Mendes Lima',
        classId: 'turma-unica',
        studentId: 's3',
        userInstitutionId: 'ui3',
      },
      {
        id: 's4',
        name: 'Daniel Ferreira Santos',
        classId: 'turma-unica',
        studentId: 's4',
        userInstitutionId: 'ui4',
      },
      {
        id: 's5',
        name: 'Elena Rodrigues Alves',
        classId: 'turma-unica',
        studentId: 's5',
        userInstitutionId: 'ui5',
      },
      {
        id: 's6',
        name: 'Fernando Gomes Pereira',
        classId: 'turma-unica',
        studentId: 's6',
        userInstitutionId: 'ui6',
      },
      {
        id: 's7',
        name: 'Gabriela Martins Castro',
        classId: 'turma-unica',
        studentId: 's7',
        userInstitutionId: 'ui7',
      },
      {
        id: 's8',
        name: 'Hugo Nascimento Dias',
        classId: 'turma-unica',
        studentId: 's8',
        userInstitutionId: 'ui8',
      },
    ],
    selectedIds: [],
  },
];

/**
 * Simple student list (teacher with single school/year/class)
 * When teacher has only one school, year and class,
 * displays simple list without accordions.
 */
export const SimpleStudentList: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] =
    useState<CategoryConfig[]>(simpleCategoriesData);

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
        categories={categories}
        onCategoriesChange={setCategories}
      />
    </div>
  );
};

/**
 * Complete hierarchy categories with multiple schools, years, classes and students
 * Represents the Figma structure with 4 flat accordions (non-nested)
 * Demonstrates filtering behavior: select school -> year -> class -> students
 */
const completeCategoriesData: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [
      { id: 'escola-1', name: 'Colégio São Paulo' },
      { id: 'escola-2', name: 'Escola Municipal Dom Pedro II' },
    ],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [
      {
        id: 'serie-9-fund',
        name: '9º Ano - Ensino Fundamental',
        schoolId: 'escola-1',
      },
      {
        id: 'serie-8-fund',
        name: '8º Ano - Ensino Fundamental',
        schoolId: 'escola-1',
      },
      {
        id: 'serie-1-medio',
        name: '1º Ano - Ensino Médio',
        schoolId: 'escola-2',
      },
      {
        id: 'serie-2-medio',
        name: '2º Ano - Ensino Médio',
        schoolId: 'escola-2',
      },
    ],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [
      { id: 'turma-9a', name: '9º Ano A - Manhã', yearId: 'serie-9-fund' },
      { id: 'turma-9b', name: '9º Ano B - Tarde', yearId: 'serie-9-fund' },
      { id: 'turma-8a', name: '8º Ano A - Manhã', yearId: 'serie-8-fund' },
      { id: 'turma-1a', name: 'Turma A - Manhã', yearId: 'serie-1-medio' },
      { id: 'turma-1b', name: 'Turma B - Tarde', yearId: 'serie-1-medio' },
      { id: 'turma-2a', name: 'Turma Única', yearId: 'serie-2-medio' },
    ],
    selectedIds: [],
  },
  {
    key: 'alunos',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      // 9º Ano A
      {
        id: 's1',
        name: 'Ana Carolina Silva',
        classId: 'turma-9a',
        studentId: 's1',
        userInstitutionId: 'ui1',
      },
      {
        id: 's2',
        name: 'Bruno Henrique Costa',
        classId: 'turma-9a',
        studentId: 's2',
        userInstitutionId: 'ui2',
      },
      {
        id: 's3',
        name: 'Carla Mendes Lima',
        classId: 'turma-9a',
        studentId: 's3',
        userInstitutionId: 'ui3',
      },
      {
        id: 's4',
        name: 'Daniel Ferreira Santos',
        classId: 'turma-9a',
        studentId: 's4',
        userInstitutionId: 'ui4',
      },
      {
        id: 's5',
        name: 'Elena Rodrigues Alves',
        classId: 'turma-9a',
        studentId: 's5',
        userInstitutionId: 'ui5',
      },
      // 9º Ano B
      {
        id: 's6',
        name: 'Fernando Gomes Pereira',
        classId: 'turma-9b',
        studentId: 's6',
        userInstitutionId: 'ui6',
      },
      {
        id: 's7',
        name: 'Gabriela Martins Castro',
        classId: 'turma-9b',
        studentId: 's7',
        userInstitutionId: 'ui7',
      },
      {
        id: 's8',
        name: 'Hugo Nascimento Dias',
        classId: 'turma-9b',
        studentId: 's8',
        userInstitutionId: 'ui8',
      },
      // 8º Ano A
      {
        id: 's9',
        name: 'Igor Carvalho Rocha',
        classId: 'turma-8a',
        studentId: 's9',
        userInstitutionId: 'ui9',
      },
      {
        id: 's10',
        name: 'Julia Andrade Nunes',
        classId: 'turma-8a',
        studentId: 's10',
        userInstitutionId: 'ui10',
      },
      // Turma 1A (1º Médio)
      {
        id: 's11',
        name: 'Karina Souza Oliveira',
        classId: 'turma-1a',
        studentId: 's11',
        userInstitutionId: 'ui11',
      },
      {
        id: 's12',
        name: 'Leonardo Ribeiro Teixeira',
        classId: 'turma-1a',
        studentId: 's12',
        userInstitutionId: 'ui12',
      },
      {
        id: 's13',
        name: 'Mariana Pinto Barbosa',
        classId: 'turma-1a',
        studentId: 's13',
        userInstitutionId: 'ui13',
      },
      // Turma 1B (1º Médio)
      {
        id: 's14',
        name: 'Nicolas Freitas Moreira',
        classId: 'turma-1b',
        studentId: 's14',
        userInstitutionId: 'ui14',
      },
      {
        id: 's15',
        name: 'Olivia Campos Araújo',
        classId: 'turma-1b',
        studentId: 's15',
        userInstitutionId: 'ui15',
      },
      // Turma Única (2º Médio)
      {
        id: 's16',
        name: 'Paulo Vieira Cardoso',
        classId: 'turma-2a',
        studentId: 's16',
        userInstitutionId: 'ui16',
      },
      {
        id: 's17',
        name: 'Rafaela Lima Correia',
        classId: 'turma-2a',
        studentId: 's17',
        userInstitutionId: 'ui17',
      },
    ],
    selectedIds: [],
  },
];

/**
 * Complete hierarchy with school, years, classes and students
 * Represents the Figma structure with 4 flat accordions (non-nested)
 * Demonstrates filtering behavior: select school -> year -> class -> students
 */
export const CompleteHierarchy: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>(
    completeCategoriesData
  );

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
        categories={categories}
        onCategoriesChange={setCategories}
      />
    </div>
  );
};

/**
 * Categories with many students (30+) to test scroll behavior
 * Single school/year/class with extensive student list
 */
const manyStudentsCategoriesData: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [{ id: 'escola-unica', name: 'Colégio São Paulo' }],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [
      {
        id: 'serie-unica',
        name: '9º Ano - Ensino Fundamental',
        schoolId: 'escola-unica',
      },
    ],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [
      { id: 'turma-unica', name: '9º Ano A - Manhã', yearId: 'serie-unica' },
    ],
    selectedIds: [],
  },
  {
    key: 'alunos',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      {
        id: 's1',
        name: 'Ana Carolina Silva',
        classId: 'turma-unica',
        studentId: 's1',
        userInstitutionId: 'ui1',
      },
      {
        id: 's2',
        name: 'Bruno Henrique Costa',
        classId: 'turma-unica',
        studentId: 's2',
        userInstitutionId: 'ui2',
      },
      {
        id: 's3',
        name: 'Carla Mendes Lima',
        classId: 'turma-unica',
        studentId: 's3',
        userInstitutionId: 'ui3',
      },
      {
        id: 's4',
        name: 'Daniel Ferreira Santos',
        classId: 'turma-unica',
        studentId: 's4',
        userInstitutionId: 'ui4',
      },
      {
        id: 's5',
        name: 'Elena Rodrigues Alves',
        classId: 'turma-unica',
        studentId: 's5',
        userInstitutionId: 'ui5',
      },
      {
        id: 's6',
        name: 'Fernando Gomes Pereira',
        classId: 'turma-unica',
        studentId: 's6',
        userInstitutionId: 'ui6',
      },
      {
        id: 's7',
        name: 'Gabriela Martins Castro',
        classId: 'turma-unica',
        studentId: 's7',
        userInstitutionId: 'ui7',
      },
      {
        id: 's8',
        name: 'Hugo Nascimento Dias',
        classId: 'turma-unica',
        studentId: 's8',
        userInstitutionId: 'ui8',
      },
      {
        id: 's9',
        name: 'Igor Carvalho Rocha',
        classId: 'turma-unica',
        studentId: 's9',
        userInstitutionId: 'ui9',
      },
      {
        id: 's10',
        name: 'Julia Andrade Nunes',
        classId: 'turma-unica',
        studentId: 's10',
        userInstitutionId: 'ui10',
      },
      {
        id: 's11',
        name: 'Karina Souza Oliveira',
        classId: 'turma-unica',
        studentId: 's11',
        userInstitutionId: 'ui11',
      },
      {
        id: 's12',
        name: 'Leonardo Ribeiro Teixeira',
        classId: 'turma-unica',
        studentId: 's12',
        userInstitutionId: 'ui12',
      },
      {
        id: 's13',
        name: 'Mariana Pinto Barbosa',
        classId: 'turma-unica',
        studentId: 's13',
        userInstitutionId: 'ui13',
      },
      {
        id: 's14',
        name: 'Nicolas Freitas Moreira',
        classId: 'turma-unica',
        studentId: 's14',
        userInstitutionId: 'ui14',
      },
      {
        id: 's15',
        name: 'Olivia Campos Araújo',
        classId: 'turma-unica',
        studentId: 's15',
        userInstitutionId: 'ui15',
      },
      {
        id: 's16',
        name: 'Paulo Vieira Cardoso',
        classId: 'turma-unica',
        studentId: 's16',
        userInstitutionId: 'ui16',
      },
      {
        id: 's17',
        name: 'Rafaela Lima Correia',
        classId: 'turma-unica',
        studentId: 's17',
        userInstitutionId: 'ui17',
      },
      {
        id: 's18',
        name: 'Samuel Costa Monteiro',
        classId: 'turma-unica',
        studentId: 's18',
        userInstitutionId: 'ui18',
      },
      {
        id: 's19',
        name: 'Tatiana Almeida Reis',
        classId: 'turma-unica',
        studentId: 's19',
        userInstitutionId: 'ui19',
      },
      {
        id: 's20',
        name: 'Ulisses Batista Fernandes',
        classId: 'turma-unica',
        studentId: 's20',
        userInstitutionId: 'ui20',
      },
      {
        id: 's21',
        name: 'Vanessa Moura Santos',
        classId: 'turma-unica',
        studentId: 's21',
        userInstitutionId: 'ui21',
      },
      {
        id: 's22',
        name: 'William Duarte Machado',
        classId: 'turma-unica',
        studentId: 's22',
        userInstitutionId: 'ui22',
      },
      {
        id: 's23',
        name: 'Ximena Borges Cavalcanti',
        classId: 'turma-unica',
        studentId: 's23',
        userInstitutionId: 'ui23',
      },
      {
        id: 's24',
        name: 'Yago Fonseca Amaral',
        classId: 'turma-unica',
        studentId: 's24',
        userInstitutionId: 'ui24',
      },
      {
        id: 's25',
        name: 'Zélia Rodrigues Braga',
        classId: 'turma-unica',
        studentId: 's25',
        userInstitutionId: 'ui25',
      },
      {
        id: 's26',
        name: 'André Lopes Cunha',
        classId: 'turma-unica',
        studentId: 's26',
        userInstitutionId: 'ui26',
      },
      {
        id: 's27',
        name: 'Bianca Teles Guimarães',
        classId: 'turma-unica',
        studentId: 's27',
        userInstitutionId: 'ui27',
      },
      {
        id: 's28',
        name: 'Caio Menezes Dantas',
        classId: 'turma-unica',
        studentId: 's28',
        userInstitutionId: 'ui28',
      },
      {
        id: 's29',
        name: 'Diana Vasconcelos Lira',
        classId: 'turma-unica',
        studentId: 's29',
        userInstitutionId: 'ui29',
      },
      {
        id: 's30',
        name: 'Eduardo Pacheco Rangel',
        classId: 'turma-unica',
        studentId: 's30',
        userInstitutionId: 'ui30',
      },
      {
        id: 's31',
        name: 'Flávia Queiroz Medeiros',
        classId: 'turma-unica',
        studentId: 's31',
        userInstitutionId: 'ui31',
      },
      {
        id: 's32',
        name: 'Guilherme Tavares Neto',
        classId: 'turma-unica',
        studentId: 's32',
        userInstitutionId: 'ui32',
      },
      {
        id: 's33',
        name: 'Helena Barros Sampaio',
        classId: 'turma-unica',
        studentId: 's33',
        userInstitutionId: 'ui33',
      },
      {
        id: 's34',
        name: 'Ivan Coutinho Silveira',
        classId: 'turma-unica',
        studentId: 's34',
        userInstitutionId: 'ui34',
      },
      {
        id: 's35',
        name: 'Joana Macedo Xavier',
        classId: 'turma-unica',
        studentId: 's35',
        userInstitutionId: 'ui35',
      },
    ],
    selectedIds: [],
  },
];

/**
 * Story with many students to test scroll behavior
 * Demonstrates that all students are accessible via scroll,
 * and not hidden behind the modal footer.
 */
export const ManyStudents: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>(
    manyStudentsCategoriesData
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-2xl text-text-900">
        Lista com Muitos Alunos
      </h2>
      <p className="text-text-700">
        Turma com 35 alunos para testar o comportamento de scroll.
      </p>
      <p className="text-sm text-text-500">
        Todos os alunos devem ser acessíveis via scroll, sem ficarem escondidos
        atrás do footer do modal.
      </p>
      <Button onClick={() => setIsOpen(true)}>Enviar Atividade</Button>
      <SendActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (data) => {
          console.log('Submitted:', data);
          setIsOpen(false);
        }}
        categories={categories}
        onCategoriesChange={setCategories}
      />
    </div>
  );
};
