import type { Story } from '@ladle/react';
import { Questionaire, QuestionaireAlternative, QuestionaireContent, QuestionaireFooter, QuestionaireHeader, QuestionaireTitle } from './Questionaire';

export const AllQuestionairesShowcase: Story = () => {
  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Questionaires Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de lista de alternativas para questões e formulários
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full">
        <Questionaire>
          <QuestionaireTitle />
          <QuestionaireHeader />
          <QuestionaireContent>
            <QuestionaireAlternative />
          </QuestionaireContent>
          <QuestionaireFooter />
        </Questionaire>
      </div>

    </div>
  );
};