import { useState } from 'react';
import type { Story } from '@ladle/react';
import RecommendedLessonDetails from './RecommendedLessonDetails';
import type { RecommendedLessonDetailsProps } from './RecommendedLessonDetails';
import type { LessonDetailsData } from '../../types/recommendedLessons';
import { SubjectEnum } from '../../enums/SubjectEnum';
import { StudentPerformanceModal } from './components';
import type { StudentPerformanceData } from './types';

/**
 * Mock lesson details data aligned with API responses
 */
const mockLessonData: LessonDetailsData = {
  goal: {
    id: 'lesson-1',
    title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
    startDate: '2024-01-01',
    finalDate: '2024-01-31',
    progress: 90,
    lessonsGoals: [
      {
        goalId: 'lesson-1',
        supLessonsProgressId: 'progress-1',
        supLessonsProgress: {
          id: 'progress-1',
          userId: 'user-1',
          lessonId: 'lesson-content-1',
          progress: 100,
          lesson: {
            id: 'lesson-content-1',
            content: { id: 'content-1', name: 'Fotossíntese' },
            subtopic: { id: 'subtopic-1', name: 'Processo' },
            topic: { id: 'topic-1', name: 'Biologia Celular' },
            subject: {
              id: 'subject-1',
              name: 'Biologia',
              color: '#22c55e',
              icon: 'biology',
            },
          },
        },
      },
    ],
  },
  details: {
    students: [
      {
        userInstitutionId: 'student-1',
        userId: 'user-1',
        name: 'Ana Costa',
        progress: 0,
        completedAt: null,
        avgScore: null,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-2',
        userId: 'user-2',
        name: 'Carlos Pereira',
        progress: 90,
        completedAt: null,
        avgScore: 85,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-3',
        userId: 'user-3',
        name: 'Maria Silva',
        progress: 50,
        completedAt: null,
        avgScore: 70,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-4',
        userId: 'user-4',
        name: 'Lucas Oliveira',
        progress: 100,
        completedAt: '2024-01-15T00:00:00.000Z',
        avgScore: 95,
        daysToComplete: 15,
      },
      {
        userInstitutionId: 'student-5',
        userId: 'user-5',
        name: 'Juliana Santos',
        progress: 100,
        completedAt: '2024-01-20T00:00:00.000Z',
        avgScore: 88,
        daysToComplete: 20,
      },
    ],
    aggregated: {
      completionPercentage: 90,
      avgScore: 83,
    },
    contentPerformance: {
      best: { contentId: 'content-1', contentName: 'Fotossíntese', rate: 95 },
      worst: { contentId: 'content-2', contentName: 'Células', rate: 65 },
    },
  },
  breakdown: {
    classId: 'class-1',
    className: 'Turma A',
    schoolId: 'school-1',
    schoolName: 'Escola Estadual Professor João da Silva',
    studentCount: 30,
    completedCount: 27,
  },
};

/**
 * Mock data for Mathematics lesson
 */
const mockMathLessonData: LessonDetailsData = {
  goal: {
    id: 'lesson-2',
    title: 'Álgebra Linear: Matrizes e Determinantes',
    startDate: '2024-02-01',
    finalDate: '2024-02-28',
    progress: 60,
    lessonsGoals: [
      {
        goalId: 'lesson-2',
        supLessonsProgressId: 'progress-2',
        supLessonsProgress: {
          id: 'progress-2',
          userId: 'user-1',
          lessonId: 'lesson-content-2',
          progress: 60,
          lesson: {
            id: 'lesson-content-2',
            content: { id: 'content-2', name: 'Matrizes' },
            subtopic: { id: 'subtopic-2', name: 'Operações' },
            topic: { id: 'topic-2', name: 'Álgebra Linear' },
            subject: {
              id: 'subject-2',
              name: 'Matemática',
              color: '#3b82f6',
              icon: 'math',
            },
          },
        },
      },
    ],
  },
  details: {
    students: [
      {
        userInstitutionId: 'student-1',
        userId: 'user-1',
        name: 'Pedro Almeida',
        progress: 100,
        completedAt: '2024-02-10T00:00:00.000Z',
        avgScore: 92,
        daysToComplete: 10,
      },
      {
        userInstitutionId: 'student-2',
        userId: 'user-2',
        name: 'Fernanda Lima',
        progress: 75,
        completedAt: null,
        avgScore: 78,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-3',
        userId: 'user-3',
        name: 'Ricardo Santos',
        progress: 30,
        completedAt: null,
        avgScore: 65,
        daysToComplete: null,
      },
    ],
    aggregated: {
      completionPercentage: 60,
      avgScore: 78,
    },
    contentPerformance: {
      best: {
        contentId: 'content-1',
        contentName: 'Soma de Matrizes',
        rate: 88,
      },
      worst: { contentId: 'content-2', contentName: 'Determinantes', rate: 55 },
    },
  },
  breakdown: {
    classId: 'class-2',
    className: 'Turma B - 3º Ano',
    schoolId: 'school-2',
    schoolName: 'Colégio Municipal Centro',
    studentCount: 25,
    completedCount: 15,
  },
};

/**
 * Mock questions for lessons (Biology - Categorias Taxonômicas)
 */
const mockQuestions = {
  lesson1: [
    {
      id: 'q1',
      title: 'Questão 1',
      statement:
        'Qual é a sequência correta das categorias taxonômicas, da mais ampla para a mais específica?',
      isCorrect: false,
      alternatives: [
        {
          id: 'a1',
          text: 'Espécie, Gênero, Família, Ordem, Classe, Filo, Reino',
          isCorrect: false,
          isSelected: false,
        },
        {
          id: 'a2',
          text: 'Reino, Filo, Classe, Ordem, Família, Gênero, Espécie',
          isCorrect: true,
          isSelected: false,
        },
        {
          id: 'a3',
          text: 'Reino, Classe, Filo, Ordem, Família, Gênero, Espécie',
          isCorrect: false,
          isSelected: true,
        },
        {
          id: 'a4',
          text: 'Filo, Reino, Classe, Ordem, Família, Gênero, Espécie',
          isCorrect: false,
          isSelected: false,
        },
      ],
    },
    {
      id: 'q2',
      title: 'Questão 2',
      statement:
        'Quem é considerado o pai da taxonomia moderna e criou o sistema binomial de nomenclatura?',
      isCorrect: true,
      alternatives: [
        {
          id: 'b1',
          text: 'Charles Darwin',
          isCorrect: false,
          isSelected: false,
        },
        { id: 'b2', text: 'Carl Linnaeus', isCorrect: true, isSelected: true },
        {
          id: 'b3',
          text: 'Gregor Mendel',
          isCorrect: false,
          isSelected: false,
        },
        {
          id: 'b4',
          text: 'Louis Pasteur',
          isCorrect: false,
          isSelected: false,
        },
      ],
    },
    {
      id: 'q3',
      title: 'Questão 3',
      statement:
        'No sistema binomial de nomenclatura, como deve ser escrito o nome científico de uma espécie?',
      isCorrect: false,
      alternatives: [
        {
          id: 'c1',
          text: 'Ambas as palavras em maiúsculo',
          isCorrect: false,
          isSelected: true,
        },
        {
          id: 'c2',
          text: 'Gênero com inicial maiúscula e epíteto específico em minúsculo, ambos em itálico',
          isCorrect: true,
          isSelected: false,
        },
        {
          id: 'c3',
          text: 'Ambas as palavras em minúsculo',
          isCorrect: false,
          isSelected: false,
        },
        {
          id: 'c4',
          text: 'Apenas o gênero, sem o epíteto específico',
          isCorrect: false,
          isSelected: false,
        },
      ],
    },
    {
      id: 'q4',
      title: 'Questão 4',
      statement: 'Qual categoria taxonômica agrupa espécies semelhantes?',
      isCorrect: true,
      alternatives: [
        { id: 'd1', text: 'Gênero', isCorrect: true, isSelected: true },
        { id: 'd2', text: 'Família', isCorrect: false, isSelected: false },
        { id: 'd3', text: 'Ordem', isCorrect: false, isSelected: false },
        { id: 'd4', text: 'Reino', isCorrect: false, isSelected: false },
      ],
    },
  ],
  lesson2: [
    {
      id: 'q5',
      title: 'Questão 1',
      statement: 'Qual é a classificação dos mamíferos?',
      isCorrect: true,
      alternatives: [
        { id: 'e1', text: 'Vertebrados', isCorrect: true, isSelected: true },
        {
          id: 'e2',
          text: 'Invertebrados',
          isCorrect: false,
          isSelected: false,
        },
        { id: 'e3', text: 'Artrópodes', isCorrect: false, isSelected: false },
        { id: 'e4', text: 'Moluscos', isCorrect: false, isSelected: false },
      ],
    },
    {
      id: 'q6',
      title: 'Questão 2',
      statement: 'Qual característica define os anfíbios?',
      isCorrect: false,
      alternatives: [
        {
          id: 'f1',
          text: 'Vivem apenas na água',
          isCorrect: false,
          isSelected: true,
        },
        {
          id: 'f2',
          text: 'Vivem apenas na terra',
          isCorrect: false,
          isSelected: false,
        },
        {
          id: 'f3',
          text: 'Vivem parte da vida na água e parte na terra',
          isCorrect: true,
          isSelected: false,
        },
        {
          id: 'f4',
          text: 'São todos venenosos',
          isCorrect: false,
          isSelected: false,
        },
      ],
    },
  ],
};

/**
 * Mock student performance data for the modal
 */
const mockStudentPerformanceData: Record<string, StudentPerformanceData> = {
  'student-1': {
    studentName: 'Ana Costa',
    correctAnswers: 5,
    incorrectAnswers: 3,
    bestResult: 'Sistema Binomial',
    hardestTopic: 'Hierarquia Taxonômica',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Categorias Taxonômicas',
        progress: 50,
        questions: mockQuestions.lesson1.slice(0, 2),
      },
      {
        id: 'lesson-2',
        title: 'Reino Animal',
        progress: 30,
        questions: mockQuestions.lesson2,
      },
    ],
  },
  'student-2': {
    studentName: 'Carlos Pereira',
    correctAnswers: 7,
    incorrectAnswers: 2,
    bestResult: 'Vertebrados',
    hardestTopic: 'Nomenclatura Científica',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Categorias Taxonômicas',
        progress: 80,
        questions: mockQuestions.lesson1,
      },
      {
        id: 'lesson-2',
        title: 'Reino Animal',
        progress: 90,
        questions: mockQuestions.lesson2,
      },
      { id: 'lesson-3', title: 'Reino Vegetal', progress: 70, questions: [] },
    ],
  },
  'student-3': {
    studentName: 'Maria Silva',
    correctAnswers: 6,
    incorrectAnswers: 4,
    bestResult: 'Anfíbios',
    hardestTopic: 'Categorias Taxonômicas',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Categorias Taxonômicas',
        progress: 50,
        questions: mockQuestions.lesson1.slice(0, 2),
      },
      {
        id: 'lesson-2',
        title: 'Reino Animal',
        progress: 50,
        questions: mockQuestions.lesson2,
      },
    ],
  },
  'student-4': {
    studentName: 'Lucas Oliveira',
    correctAnswers: 8,
    incorrectAnswers: 7,
    bestResult: 'Mamíferos',
    hardestTopic: 'Sistema de Classificação',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Categorias Taxonômicas',
        progress: 50,
        questions: mockQuestions.lesson1,
      },
      {
        id: 'lesson-2',
        title: 'Reino Animal',
        progress: 50,
        questions: mockQuestions.lesson2,
      },
      { id: 'lesson-3', title: 'Reino Vegetal', progress: 50, questions: [] },
      { id: 'lesson-4', title: 'Reino Fungi', progress: 50, questions: [] },
    ],
  },
  'student-5': {
    studentName: 'Juliana Santos',
    correctAnswers: 9,
    incorrectAnswers: 1,
    bestResult: 'Reino Animal',
    hardestTopic: 'Filogenia',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Categorias Taxonômicas',
        progress: 100,
        questions: mockQuestions.lesson1,
      },
      {
        id: 'lesson-2',
        title: 'Reino Animal',
        progress: 90,
        questions: mockQuestions.lesson2,
      },
      { id: 'lesson-3', title: 'Reino Vegetal', progress: 85, questions: [] },
    ],
  },
};

/**
 * Map subject name to enum for icon display
 */
const mapSubjectNameToEnum = (subjectName: string): SubjectEnum | null => {
  const mapping: Record<string, SubjectEnum> = {
    Matemática: SubjectEnum.MATEMATICA,
    Física: SubjectEnum.FISICA,
    Química: SubjectEnum.QUIMICA,
    Português: SubjectEnum.PORTUGUES,
    Biologia: SubjectEnum.BIOLOGIA,
    História: SubjectEnum.HISTORIA,
    Geografia: SubjectEnum.GEOGRAFIA,
  };
  return mapping[subjectName] || null;
};

/**
 * Default props for stories
 */
const defaultProps: RecommendedLessonDetailsProps = {
  data: mockLessonData,
  onViewLesson: () => console.log('View lesson clicked'),
  onViewStudentPerformance: (id) =>
    console.log('View student performance:', id),
  onBreadcrumbClick: (path) => console.log('Breadcrumb clicked:', path),
  mapSubjectNameToEnum,
};

/**
 * Default story - shows the component with sample data
 */
export const Default: Story = () => (
  <RecommendedLessonDetails {...defaultProps} />
);
Default.meta = {
  name: 'Default',
};

/**
 * Loading state - shows the component in loading state
 */
export const Loading: Story = () => (
  <RecommendedLessonDetails data={null} loading={true} />
);
Loading.meta = {
  name: 'Loading State',
};

/**
 * Error state - shows the component when API fails
 */
export const ErrorState: Story = () => (
  <RecommendedLessonDetails
    data={null}
    error="Erro ao carregar detalhes da aula. Por favor, tente novamente."
  />
);
ErrorState.meta = {
  name: 'Error State',
};

/**
 * Empty state - shows the component when data is null
 */
export const Empty: Story = () => <RecommendedLessonDetails data={null} />;
Empty.meta = {
  name: 'Empty State',
};

/**
 * Mathematics lesson - shows a different subject
 */
export const MathematicsLesson: Story = () => (
  <RecommendedLessonDetails {...defaultProps} data={mockMathLessonData} />
);
MathematicsLesson.meta = {
  name: 'Mathematics Lesson',
};

/**
 * Without breakdown - shows the component without school/class info
 */
export const WithoutBreakdown: Story = () => {
  const dataWithoutBreakdown: LessonDetailsData = {
    goal: mockLessonData.goal,
    details: mockLessonData.details,
    // No breakdown
  };

  return (
    <RecommendedLessonDetails {...defaultProps} data={dataWithoutBreakdown} />
  );
};
WithoutBreakdown.meta = {
  name: 'Without Breakdown Info',
};

/**
 * Without subject icons - shows the component without subject enum mapping
 */
export const WithoutSubjectIcons: Story = () => (
  <RecommendedLessonDetails
    {...defaultProps}
    mapSubjectNameToEnum={undefined}
  />
);
WithoutSubjectIcons.meta = {
  name: 'Without Subject Icons',
};

/**
 * All students completed - shows 100% completion
 */
export const AllCompleted: Story = () => {
  const allCompletedData: LessonDetailsData = {
    ...mockLessonData,
    details: {
      ...mockLessonData.details,
      students: mockLessonData.details.students.map((s) => ({
        ...s,
        progress: 100,
        completedAt: '2024-01-20T00:00:00.000Z',
        avgScore: 85 + Math.floor(Math.random() * 15),
        daysToComplete: 10 + Math.floor(Math.random() * 10),
      })),
      aggregated: {
        completionPercentage: 100,
        avgScore: 92,
      },
    },
  };

  return <RecommendedLessonDetails {...defaultProps} data={allCompletedData} />;
};
AllCompleted.meta = {
  name: 'All Students Completed',
};

/**
 * No students started - shows 0% completion
 */
export const NoStudentsStarted: Story = () => {
  const noStartedData: LessonDetailsData = {
    ...mockLessonData,
    details: {
      ...mockLessonData.details,
      students: mockLessonData.details.students.map((s) => ({
        ...s,
        progress: 0,
        completedAt: null,
        avgScore: null,
        daysToComplete: null,
      })),
      aggregated: {
        completionPercentage: 0,
        avgScore: null,
      },
    },
  };

  return <RecommendedLessonDetails {...defaultProps} data={noStartedData} />;
};
NoStudentsStarted.meta = {
  name: 'No Students Started',
};

/**
 * Null content performance - shows dashes for null topics
 */
export const NullContentPerformance: Story = () => {
  const nullPerformanceData: LessonDetailsData = {
    ...mockLessonData,
    details: {
      ...mockLessonData.details,
      contentPerformance: {
        best: null,
        worst: null,
      },
    },
  };

  return (
    <RecommendedLessonDetails {...defaultProps} data={nullPerformanceData} />
  );
};
NullContentPerformance.meta = {
  name: 'Null Content Performance',
};

/**
 * Custom labels - shows the component with custom labels
 */
export const CustomLabels: Story = () => (
  <RecommendedLessonDetails
    {...defaultProps}
    labels={{
      viewLesson: 'Visualizar aula completa',
      viewPerformance: 'Ver detalhes',
      resultsTitle: 'Resumo dos resultados',
      completedLabel: 'Finalizado',
      bestResultLabel: 'Melhor desempenho',
      hardestTopicLabel: 'Tema mais difícil',
      studentColumn: 'Nome do aluno',
      statusColumn: 'Situação',
      completionColumn: 'Progresso',
      durationColumn: 'Tempo',
    }}
  />
);
CustomLabels.meta = {
  name: 'Custom Labels',
};

/**
 * Custom breadcrumbs - shows the component with custom breadcrumbs
 */
export const CustomBreadcrumbs: Story = () => (
  <RecommendedLessonDetails
    {...defaultProps}
    breadcrumbs={[
      { label: 'Início', path: '/' },
      { label: 'Aulas', path: '/aulas' },
      { label: 'Biologia', path: '/aulas/biologia' },
      { label: 'Fotossíntese' },
    ]}
  />
);
CustomBreadcrumbs.meta = {
  name: 'Custom Breadcrumbs',
};

/**
 * Many students - shows the component with many students
 */
export const ManyStudents: Story = () => {
  const generateStudents = (count: number) => {
    const firstNames = [
      'Ana',
      'Carlos',
      'Maria',
      'Lucas',
      'Juliana',
      'Pedro',
      'Fernanda',
      'Ricardo',
      'Beatriz',
      'Gabriel',
    ];
    const lastNames = [
      'Silva',
      'Santos',
      'Oliveira',
      'Costa',
      'Pereira',
      'Almeida',
      'Lima',
      'Ferreira',
      'Rodrigues',
      'Souza',
    ];

    return Array.from({ length: count }, (_, i) => {
      const progress = Math.floor(Math.random() * 101);
      const isCompleted = progress === 100;

      return {
        userInstitutionId: `student-${i + 1}`,
        userId: `user-${i + 1}`,
        name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        progress,
        completedAt: isCompleted ? '2024-01-15T00:00:00.000Z' : null,
        avgScore: progress > 0 ? 60 + Math.floor(Math.random() * 40) : null,
        daysToComplete: isCompleted ? 5 + Math.floor(Math.random() * 20) : null,
      };
    });
  };

  const students = generateStudents(20);
  const completedCount = students.filter((s) => s.progress === 100).length;

  const manyStudentsData: LessonDetailsData = {
    ...mockLessonData,
    details: {
      students,
      aggregated: {
        completionPercentage: Math.round(
          (completedCount / students.length) * 100
        ),
        avgScore: 78,
      },
      contentPerformance: mockLessonData.details.contentPerformance,
    },
    breakdown: {
      classId: 'class-1',
      className: 'Turma A - 3º Ano',
      schoolId: 'school-1',
      schoolName: 'Escola Estadual Professor João da Silva',
      studentCount: students.length,
      completedCount,
    },
  };

  return <RecommendedLessonDetails {...defaultProps} data={manyStudentsData} />;
};
ManyStudents.meta = {
  name: 'Many Students',
};

/**
 * Without view lesson button - shows the component without the view lesson action
 */
export const WithoutViewLesson: Story = () => (
  <RecommendedLessonDetails {...defaultProps} onViewLesson={undefined} />
);
WithoutViewLesson.meta = {
  name: 'Without View Lesson Button',
};

/**
 * Without student performance action - shows disabled buttons for all students
 */
export const WithoutStudentPerformance: Story = () => (
  <RecommendedLessonDetails
    {...defaultProps}
    onViewStudentPerformance={undefined}
  />
);
WithoutStudentPerformance.meta = {
  name: 'Without Student Performance Action',
};

/**
 * Physics lesson - shows another subject
 */
export const PhysicsLesson: Story = () => {
  const physicsData: LessonDetailsData = {
    goal: {
      id: 'lesson-3',
      title: 'Mecânica Clássica: Leis de Newton',
      startDate: '2024-03-01',
      finalDate: '2024-03-31',
      progress: 75,
      lessonsGoals: [
        {
          goalId: 'lesson-3',
          supLessonsProgressId: 'progress-3',
          supLessonsProgress: {
            id: 'progress-3',
            userId: 'user-1',
            lessonId: 'lesson-content-3',
            progress: 75,
            lesson: {
              id: 'lesson-content-3',
              content: { id: 'content-3', name: 'Leis de Newton' },
              subtopic: { id: 'subtopic-3', name: 'Dinâmica' },
              topic: { id: 'topic-3', name: 'Mecânica' },
              subject: {
                id: 'subject-3',
                name: 'Física',
                color: '#f59e0b',
                icon: 'physics',
              },
            },
          },
        },
      ],
    },
    details: {
      students: [
        {
          userInstitutionId: 'student-1',
          userId: 'user-1',
          name: 'Bruno Martins',
          progress: 100,
          completedAt: '2024-03-15T00:00:00.000Z',
          avgScore: 90,
          daysToComplete: 14,
        },
        {
          userInstitutionId: 'student-2',
          userId: 'user-2',
          name: 'Carolina Dias',
          progress: 80,
          completedAt: null,
          avgScore: 82,
          daysToComplete: null,
        },
        {
          userInstitutionId: 'student-3',
          userId: 'user-3',
          name: 'Daniel Ribeiro',
          progress: 45,
          completedAt: null,
          avgScore: 70,
          daysToComplete: null,
        },
      ],
      aggregated: {
        completionPercentage: 75,
        avgScore: 81,
      },
      contentPerformance: {
        best: { contentId: 'content-1', contentName: 'Primeira Lei', rate: 92 },
        worst: {
          contentId: 'content-2',
          contentName: 'Terceira Lei',
          rate: 68,
        },
      },
    },
    breakdown: {
      classId: 'class-3',
      className: 'Turma C - 2º Ano',
      schoolId: 'school-1',
      schoolName: 'Instituto Educacional Norte',
      studentCount: 28,
      completedCount: 21,
    },
  };

  return <RecommendedLessonDetails {...defaultProps} data={physicsData} />;
};
PhysicsLesson.meta = {
  name: 'Physics Lesson',
};

/**
 * Interactive with Performance Modal - shows the component with working performance modal
 */
export const WithPerformanceModal: Story = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentPerformanceData | null>(null);

  const handleViewPerformance = (studentId: string) => {
    const studentData = mockStudentPerformanceData[studentId];
    if (studentData) {
      setSelectedStudent(studentData);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <RecommendedLessonDetails
        data={mockLessonData}
        onViewLesson={() => console.log('View lesson clicked')}
        onViewStudentPerformance={handleViewPerformance}
        onBreadcrumbClick={(path) => console.log('Breadcrumb clicked:', path)}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
      />
      <StudentPerformanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedStudent}
      />
    </>
  );
};
WithPerformanceModal.meta = {
  name: 'With Performance Modal',
};

/**
 * Performance Modal Only - shows just the modal component
 */
export const PerformanceModalOnly: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-700 text-white rounded-lg"
      >
        Abrir Modal
      </button>
      <StudentPerformanceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockStudentPerformanceData['student-4']}
      />
    </div>
  );
};
PerformanceModalOnly.meta = {
  name: 'Performance Modal Only',
};

/**
 * Performance Modal Loading - shows modal in loading state
 */
export const PerformanceModalLoading: Story = () => {
  return (
    <StudentPerformanceModal
      isOpen={true}
      onClose={() => {}}
      data={null}
      loading={true}
    />
  );
};
PerformanceModalLoading.meta = {
  name: 'Performance Modal Loading',
};
