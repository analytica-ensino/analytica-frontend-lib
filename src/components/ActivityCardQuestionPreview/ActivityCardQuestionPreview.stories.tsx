import type { Story } from '@ladle/react';
import { ActivityCardQuestionPreview } from './ActivityCardQuestionPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { useTheme } from '@/index';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';

export const Default: Story = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Activity Card Question Preview
      </h2>
      <ActivityCardQuestionPreview
        subjectName="Ecologia e a Interação entre Espécies"
        subjectColor="#10B981"
        iconName="Book"
        isDark={isDark}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        enunciado="Considere uma floresta tropical onde diversas espécies de plantas e animais interagem. Explique como as relações de mutualismo e competição influenciam a estabilidade desse ecossistema ao longo do tempo."
        position={1}
      />
    </div>
  );
};

export const WithLongStatement: Story = () => {
  const { isDark } = useTheme();

  const longStatement =
    'A fotossíntese é um processo bioquímico fundamental para a vida na Terra, pois permite que organismos autotróficos convertam energia luminosa em energia química. Descreva as etapas da fase clara e da fase escura, detalhando os principais compostos envolvidos e como eles contribuem para a produção de glicose.';

  const alternatives: Alternative[] = [
    { value: 'a', label: 'Apenas na fase clara', status: 'correct' },
    { value: 'b', label: 'Apenas na fase escura' },
    { value: 'c', label: 'Nas duas fases' },
    { value: 'd', label: 'Em nenhuma das fases' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Preview com enunciado longo
      </h2>

      <ActivityCardQuestionPreview
        subjectName="Biologia - Fotossíntese"
        subjectColor="#6366F1"
        iconName="Leaf"
        isDark={isDark}
        questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        enunciado={longStatement}
        value="bio-fotossintese"
      >
        <div className="mt-4">
          <AlternativesList
            alternatives={alternatives}
            selectedValue="a"
            mode="readonly"
            name="preview-alternatives"
          />
        </div>
      </ActivityCardQuestionPreview>
    </div>
  );
};
