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
      options: [
        { id: 'opt1', option: '200 rãs' },
        { id: 'opt2', option: '230 rãs' },
        { id: 'opt3', option: '463 rãs' },
        { id: 'opt4', option: '500 rãs' },
      ],
      correctOptionIds: ['opt3'],
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
      options: [],
      correctOptionIds: [],
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

