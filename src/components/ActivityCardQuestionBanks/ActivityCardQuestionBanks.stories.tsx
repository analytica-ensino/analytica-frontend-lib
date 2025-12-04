import type { Story } from '@ladle/react';
import { ActivityCardQuestionBanks } from './ActivityCardQuestionBanks';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { useTheme } from '@/index';

/**
 * Showcase principal: todos os tipos de questões
 */
export const AllQuestionTypes: Story = () => {
  const { isDark } = useTheme();

  const alternativeQuestion = {
    options: [
      { id: 'opt1', option: '200 rãs' },
      { id: 'opt2', option: '230 rãs' },
      { id: 'opt3', option: '463 rãs' },
      { id: 'opt4', option: '500 rãs' },
    ],
    correctOptionIds: ['opt3'],
  };

  const multipleChoiceQuestion = {
    options: [
      { id: 'opt1', option: 'Opção A' },
      { id: 'opt2', option: 'Opção B' },
      { id: 'opt3', option: 'Opção C' },
      { id: 'opt4', option: 'Opção D' },
    ],
    correctOptionIds: ['opt1', 'opt3'],
  };

  const multipleChoiceSingle = {
    options: [
      { id: 'opt1', option: 'Alternativa 1' },
      { id: 'opt2', option: 'Alternativa 2' },
      { id: 'opt3', option: 'Alternativa 3' },
      { id: 'opt4', option: 'Alternativa 4' },
    ],
    correctOptionIds: ['opt2'],
  };

  const trueOrFalseQuestion = {
    options: [
      { id: 'tf1', option: 'A fotossíntese ocorre apenas durante o dia' },
      {
        id: 'tf2',
        option: 'As plantas produzem oxigênio durante a fotossíntese',
      },
      { id: 'tf3', option: 'A clorofila é encontrada apenas nas folhas' },
      {
        id: 'tf4',
        option: 'A respiração celular é o processo inverso da fotossíntese',
      },
    ],
    correctOptionIds: ['tf2', 'tf4'], // Verdadeiro para tf2 e tf4
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Todos os Tipos de Questões
      </h2>
      <p className="text-text-700">
        Exibição de todos os tipos de questões disponíveis no componente
        ActivityCardQuestionBanks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 className="font-bold text-2xl text-text-900 mb-4">
            Tipo: Alternativa
          </h3>
          <ActivityCardQuestionBanks
            question={alternativeQuestion}
            questionType={QUESTION_TYPE.ALTERNATIVA}
            iconName="Atom"
            subjectColor="#10B981"
            isDark={isDark}
            onAddToActivity={() => console.log('Adicionar alternativa')}
          />
        </div>

        <div>
          <h3 className="font-bold text-2xl text-text-900 mb-4">
            Tipo: Múltipla Escolha (Múltiplas Respostas)
          </h3>
          <ActivityCardQuestionBanks
            question={multipleChoiceQuestion}
            questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
            iconName="CheckSquare"
            subjectColor="#14B8A6"
            isDark={isDark}
            onAddToActivity={() => console.log('Adicionar múltipla escolha')}
          />
        </div>

        <div>
          <h3 className="font-bold text-2xl text-text-900 mb-4">
            Tipo: Múltipla Escolha (Uma Resposta)
          </h3>
          <ActivityCardQuestionBanks
            question={multipleChoiceSingle}
            questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
            iconName="CheckSquare"
            subjectColor="#6366F1"
            isDark={isDark}
            onAddToActivity={() =>
              console.log('Adicionar múltipla escolha única')
            }
          />
        </div>

        <div>
          <h3 className="font-bold text-2xl text-text-900 mb-4">
            Tipo: Dissertativa
          </h3>
          <ActivityCardQuestionBanks
            questionType={QUESTION_TYPE.DISSERTATIVA}
            iconName="ArticleNyTimes"
            subjectColor="#F97316"
            isDark={isDark}
            onAddToActivity={() => console.log('Adicionar dissertativa')}
          />
        </div>

        <div>
          <h3 className="font-bold text-2xl text-text-900 mb-4">
            Tipo: Verdadeiro ou Falso
          </h3>
          <ActivityCardQuestionBanks
            question={trueOrFalseQuestion}
            questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
            iconName="CheckCircle"
            subjectColor="#8B5CF6"
            isDark={isDark}
            onAddToActivity={() => console.log('Adicionar verdadeiro ou falso')}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Default card without question data
 */
export const Default: Story = () => {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Activity Card Question Banks
      </h2>
      <p className="text-text-700">
        Card para exibição de questões do banco de questões para professores.
      </p>
      <ActivityCardQuestionBanks
        iconName="BookOpen"
        subjectColor="#3B82F6"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar à atividade clicado')}
      />
    </div>
  );
};

/**
 * Card with alternative question type
 */
export const WithAlternativeQuestion: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: '200 rãs' },
      { id: 'opt2', option: '230 rãs' },
      { id: 'opt3', option: '463 rãs' },
      { id: 'opt4', option: '500 rãs' },
    ],
    correctOptionIds: ['opt3'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Questão do Tipo Alternativa
      </h2>
      <p className="text-text-700">
        Exibição de questão do tipo alternativa com a resposta correta marcada e
        badge "Resposta correta". As demais alternativas aparecem desabilitadas.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        iconName="Atom"
        subjectColor="#10B981"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with alternative question - different correct answer
 */
export const AlternativeQuestionSecondOption: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'São Paulo' },
      { id: 'opt2', option: 'Brasília' },
      { id: 'opt3', option: 'Rio de Janeiro' },
      { id: 'opt4', option: 'Salvador' },
    ],
    correctOptionIds: ['opt2'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Alternativa Correta na Segunda Opção
      </h2>
      <p className="text-text-700">
        Exemplo com a resposta correta sendo a segunda alternativa.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        iconName="GlobeHemisphereWest"
        subjectColor="#8B5CF6"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with alternative question - last option correct
 */
export const AlternativeQuestionLastOption: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'Opção A' },
      { id: 'opt2', option: 'Opção B' },
      { id: 'opt3', option: 'Opção C' },
      { id: 'opt4', option: 'Opção D - Correta' },
    ],
    correctOptionIds: ['opt4'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Alternativa Correta na Última Opção
      </h2>
      <p className="text-text-700">
        Exemplo com a resposta correta sendo a última alternativa.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        iconName="Microscope"
        subjectColor="#F59E0B"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with alternative question but no correctOptionIds
 */
export const AlternativeQuestionNoCorrectAnswer: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'Alternativa 1' },
      { id: 'opt2', option: 'Alternativa 2' },
      { id: 'opt3', option: 'Alternativa 3' },
      { id: 'opt4', option: 'Alternativa 4' },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Questão sem Resposta Correta Definida
      </h2>
      <p className="text-text-700">
        Exemplo quando a questão não tem resposta correta definida. Nenhuma
        alternativa será marcada como correta.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        iconName="Flask"
        subjectColor="#EF4444"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with question but wrong questionType
 */
export const WrongQuestionType: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'Opção 1' },
      { id: 'opt2', option: 'Opção 2' },
    ],
    correctOptionIds: ['opt1'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Tipo de Questão Diferente
      </h2>
      <p className="text-text-700">
        Quando o tipo de questão não é ALTERNATIVA, as alternativas não são
        exibidas.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        iconName="Palette"
        subjectColor="#EC4899"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with long question text
 */
export const LongQuestionText: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      {
        id: 'opt1',
        option:
          'Esta é uma alternativa muito longa que serve para testar como o componente se comporta com textos extensos que podem quebrar o layout',
      },
      {
        id: 'opt2',
        option:
          'Outra alternativa também com texto longo para demonstrar o comportamento do componente em diferentes cenários de conteúdo',
      },
      { id: 'opt3', option: 'Alternativa curta' },
      {
        id: 'opt4',
        option:
          'Mais uma alternativa com texto extenso para garantir que o layout funciona corretamente em todos os casos',
      },
    ],
    correctOptionIds: ['opt2'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Questão com Textos Longos
      </h2>
      <p className="text-text-700">
        Exemplo com alternativas contendo textos muito longos para testar a
        responsividade e quebra de linha.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        iconName="MathOperations"
        subjectColor="#06B6D4"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with multiple choice question type
 */
export const WithMultipleChoiceQuestion: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'Opção A' },
      { id: 'opt2', option: 'Opção B' },
      { id: 'opt3', option: 'Opção C' },
      { id: 'opt4', option: 'Opção D' },
    ],
    correctOptionIds: ['opt1', 'opt3'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Questão do Tipo Múltipla Escolha
      </h2>
      <p className="text-text-700">
        Exibição de questão do tipo múltipla escolha com as respostas corretas
        marcadas e badge "Resposta correta". As demais opções aparecem
        desabilitadas.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        iconName="CheckSquare"
        subjectColor="#14B8A6"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};

/**
 * Card with multiple choice - single correct answer
 */
export const MultipleChoiceSingleCorrect: Story = () => {
  const { isDark } = useTheme();
  const question = {
    options: [
      { id: 'opt1', option: 'Alternativa 1' },
      { id: 'opt2', option: 'Alternativa 2' },
      { id: 'opt3', option: 'Alternativa 3' },
      { id: 'opt4', option: 'Alternativa 4' },
    ],
    correctOptionIds: ['opt2'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Múltipla Escolha com Uma Resposta Correta
      </h2>
      <p className="text-text-700">
        Exemplo de múltipla escolha com apenas uma resposta correta.
      </p>
      <ActivityCardQuestionBanks
        question={question}
        questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        iconName="CheckSquare"
        subjectColor="#6366F1"
        isDark={isDark}
        onAddToActivity={() => console.log('Adicionar questão à atividade')}
      />
    </div>
  );
};
