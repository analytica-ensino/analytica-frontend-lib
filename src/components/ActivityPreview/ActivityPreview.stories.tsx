import type { Story } from '@ladle/react';
import { ActivityPreview } from './ActivityPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { useTheme } from '@/index';

export const Default: Story = () => {
  const { isDark } = useTheme();

  const questions = [
    {
      id: 'q1',
      subjectName: 'Ecologia e a Interação entre Espécies',
      subjectColor: '#84cc16',
      iconName: 'BookOpen',
      isDark,
      questionType: QUESTION_TYPE.ALTERNATIVA,
      enunciado:
        'Um grupo de cientistas está estudando o comportamento de uma população de rãs em um lago. Após várias observações, eles notaram que a quantidade de rãs aumenta em média 15% a cada mês. Qual será a população de rãs após 6 meses, se inicialmente havia 200 rãs no lago?',
      question: {
        options: [
          { id: 'opt1', option: '200 rãs' },
          { id: 'opt2', option: '230 rãs' },
          { id: 'opt3', option: '463 rãs' },
          { id: 'opt4', option: '500 rãs' },
        ],
        correctOptionIds: ['opt3'],
      },
    },
    {
      id: 'q2',
      subjectName: 'Biologia - Genética',
      subjectColor: '#6366f1',
      iconName: 'Dna',
      isDark,
      questionType: QUESTION_TYPE.DISSERTATIVA,
      enunciado:
        'Explique o princípio da segregação de Mendel e como ele se aplica à formação de gametas.',
      question: {
        options: [],
        correctOptionIds: [],
      },
    },
  ];

  return (
    <div className="p-6">
      <ActivityPreview
        questions={questions}
        onDownloadPdf={() => console.log('Baixar pdf')}
        onRemoveAll={() => console.log('Remover tudo')}
      />
    </div>
  );
};

export const AllQuestionTypes: Story = () => {
  const { isDark } = useTheme();

  const questions = [
    {
      id: 'alt',
      subjectName: 'Biologia - Ecologia',
      subjectColor: '#16a34a',
      iconName: 'Leaf',
      isDark,
      questionType: QUESTION_TYPE.ALTERNATIVA,
      enunciado: 'Qual é a principal fonte de energia para a fotossíntese?',
      question: {
        options: [
          { id: 'a', option: 'Glicose' },
          { id: 'b', option: 'Luz solar' },
          { id: 'c', option: 'Oxigênio' },
          { id: 'd', option: 'Água' },
        ],
        correctOptionIds: ['b'],
      },
    },
    {
      id: 'multi',
      subjectName: 'História - Idade Média',
      subjectColor: '#6366f1',
      iconName: 'CastleTurret',
      isDark,
      questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
      enunciado: 'Selecione características do feudalismo:',
      question: {
        options: [
          { id: 'a', option: 'Economia agrária' },
          { id: 'b', option: 'Centralização política' },
          { id: 'c', option: 'Relações de suserania e vassalagem' },
          { id: 'd', option: 'Moeda forte e comércio intenso' },
        ],
        correctOptionIds: ['a', 'c'],
      },
    },
    {
      id: 'disc',
      subjectName: 'Redação',
      subjectColor: '#f97316',
      iconName: 'Article',
      isDark,
      questionType: QUESTION_TYPE.DISSERTATIVA,
      enunciado:
        'Explique a importância da coesão e coerência em um texto dissertativo-argumentativo.',
      question: {
        options: [],
        correctOptionIds: [],
      },
    },
    {
      id: 'vf',
      subjectName: 'Ciências',
      subjectColor: '#06b6d4',
      iconName: 'CheckCircle',
      isDark,
      questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
      enunciado: 'Assinale V ou F para as afirmações sobre estados da matéria:',
      question: {
        options: [
          { id: 'a', option: 'Sólidos têm forma e volume definidos.' },
          { id: 'b', option: 'Líquidos têm forma fixa.' },
          { id: 'c', option: 'Gases não têm volume definido.' },
        ],
        correctOptionIds: ['a', 'c'],
      },
    },
    {
      id: 'ligar',
      subjectName: 'Geografia',
      subjectColor: '#8b5cf6',
      iconName: 'GlobeHemisphereWest',
      isDark,
      questionType: QUESTION_TYPE.LIGAR_PONTOS,
      enunciado: 'Associe países às suas capitais.',
      question: {
        options: [],
        correctOptionIds: [],
      },
    },
    {
      id: 'fill',
      subjectName: 'Matemática',
      subjectColor: '#14b8a6',
      iconName: 'MathOperations',
      isDark,
      questionType: QUESTION_TYPE.PREENCHER,
      enunciado: 'Complete: A soma dos ângulos internos de um triângulo é ____.',
      question: {
        options: [],
        correctOptionIds: [],
      },
    },
    {
      id: 'img',
      subjectName: 'Artes',
      subjectColor: '#f43f5e',
      iconName: 'ImageSquare',
      isDark,
      questionType: QUESTION_TYPE.IMAGEM,
      enunciado: 'Identifique o movimento artístico representado na imagem.',
      question: {
        options: [],
        correctOptionIds: [],
      },
    },
  ];

  return (
    <div className="p-6">
      <ActivityPreview
        questions={questions}
        onDownloadPdf={() => console.log('Baixar pdf')}
        onRemoveAll={() => console.log('Remover tudo')}
      />
    </div>
  );
};

