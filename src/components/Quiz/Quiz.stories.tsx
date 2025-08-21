import type { Story } from '@ladle/react';
import {
  Quiz,
  QuizContent,
  QuizFooter,
  QuizHeader,
  QuizHeaderResult,
  QuizTitle,
  QuizListResult,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizResultPerformance,
  QuizListResultByMateria,
} from './Quiz';
import {
  QUESTION_DIFFICULTY,
  QUESTION_STATUS,
  QUESTION_TYPE,
  ANSWER_STATUS,
  useQuizStore,
} from './useQuizStore';
import { useEffect } from 'react';

// 1° General - To show quiz usage with 1 question for each variant
export const General: Story = () => {
  const { setBySimulated, startQuiz, setUserId, setUserAnswers } =
    useQuizStore();

  useEffect(() => {
    const mockSimulated = {
      id: 'simulado-geral',
      title: 'Simulado ENEM 2024 - Todas as Variantes',
      type: 'ENEM',
      subtype: 'Simulado',
      difficulty: 'MEDIO',
      notification: null,
      status: 'ATIVO',
      startDate: new Date('2024-01-01'),
      finalDate: new Date('2024-12-31'),
      canRetry: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      questions: [
        {
          id: 'q1-image',
          questionText: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
        },
        {
          id: 'q1-alternativa',
          questionText: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
        },
        {
          id: 'q2-multipla-escolha',
          questionText:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Saturno' },
            { id: 'opt2', option: 'Júpiter' },
            { id: 'opt3', option: 'Urano' },
            { id: 'opt4', option: 'Netuno' },
            { id: 'opt5', option: 'Marte' },
            { id: 'opt6', option: 'Vênus' },
          ],
          correctOptionIds: ['opt1', 'opt2', 'opt3', 'opt4'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
        },
        {
          id: 'q3-dissertativa',
          questionText:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa sobre preservação ambiental',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'linguagens',
              subjectId: 'portugues',
              topicId: 'redacao',
              subtopicId: 'dissertativa',
              contentId: 'linguagens',
            },
          ],
        },
        {
          id: 'q4-verdadeiro-falso',
          questionText:
            'A Terra é o terceiro planeta do sistema solar em ordem de distância do Sol.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Verdadeiro. A Terra é o terceiro planeta do sistema solar, localizada entre Vênus (segundo) e Marte (quarto). A ordem dos planetas a partir do Sol é: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
        },
        {
          id: 'q5-ligar-pontos',
          questionText: 'Ligue os conceitos às suas definições corretas.',
          questionType: QUESTION_TYPE.LIGAR_PONTOS,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de ligar pontos',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Velocidade é a distância percorrida por unidade de tempo (v = d/t). Aceleração é a variação da velocidade por unidade de tempo (a = Δv/t). Estas são grandezas fundamentais da cinemática que descrevem o movimento dos corpos.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Velocidade' },
            {
              id: 'opt2',
              option: 'Distância percorrida por unidade de tempo',
            },
            { id: 'opt3', option: 'Aceleração' },
            {
              id: 'opt4',
              option: 'Variação da velocidade por unidade de tempo',
            },
          ],
          correctOptionIds: ['opt1', 'opt2', 'opt3', 'opt4'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'cinematica',
              contentId: 'fisica',
            },
          ],
        },
        {
          id: 'q6-preencher',
          questionText:
            'Complete a frase: "A fórmula da velocidade média é v = ___ / ___", onde v é velocidade, ___ é distância e ___ é tempo.',
          questionType: QUESTION_TYPE.PREENCHER,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de preenchimento',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation: 'd,t',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'cinematica',
              contentId: 'fisica',
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);
    startQuiz();

    // Simulate some user answers for demonstration
    setUserAnswers([
      {
        questionId: 'q1-alternativa',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer:
          'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2-multipla-escolha',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer:
          'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-dissertativa',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer:
          'A preservação ambiental é fundamental para o futuro sustentável.',
        optionId: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
      },
      {
        questionId: 'q4-verdadeiro-falso',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer:
          'Verdadeiro. A Terra é o terceiro planeta do sistema solar, localizada entre Vênus (segundo) e Marte (quarto). A ordem dos planetas a partir do Sol é: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
        optionId: null,
        questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q5-ligar-pontos',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer:
          'Velocidade é a distância percorrida por unidade de tempo (v = d/t). Aceleração é a variação da velocidade por unidade de tempo (a = Δv/t). Estas são grandezas fundamentais da cinemática que descrevem o movimento dos corpos.',
        optionId: null,
        questionType: QUESTION_TYPE.LIGAR_PONTOS,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q6-preencher',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer: 'd,t',
        optionId: null,
        questionType: QUESTION_TYPE.PREENCHER,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
    ]);
  }, [setBySimulated, startQuiz, setUserId, setUserAnswers]);

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz - Todas as Variantes
        </h1>
        <p className="text-text-600 text-lg">
          Demonstração de todos os tipos de questões disponíveis
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizTitle />
          <QuizHeader />
          <QuizContent paddingBottom="pb-[150px]" />
          <QuizFooter
            className="bottom-15"
            onGoToSimulated={() => {
              console.log('Navigating to simulated...');
            }}
            onDetailResult={() => {
              console.log('Detailing result...');
            }}
          />
        </Quiz>
      </div>
    </div>
  );
};

// 2° General for results - Will show 2 questions of each type (one incorrect and one correct)
export const GeneralForResults: Story = () => {
  const {
    setBySimulated,
    startQuiz,
    setUserAnswers,
    setUserId,
    setCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    currentQuestionIndex,
    getTotalQuestions,
  } = useQuizStore();

  useEffect(() => {
    const mockSimulated = {
      id: 'simulado-resultados',
      title: 'Simulado ENEM 2024 - Resultados',
      type: 'ENEM',
      subtype: 'Simulado',
      difficulty: 'MEDIO',
      notification: null,
      status: 'ATIVO',
      startDate: new Date('2024-01-01'),
      finalDate: new Date('2024-12-31'),
      canRetry: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      questions: [
        // IMAGE - Correct
        {
          id: 'q1-image',
          questionText: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
        },
        // IMAGE - Incorrect
        {
          id: 'q1-image-incorreta',
          questionText: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
        },
        // ALTERNATIVE - Correct
        {
          id: 'q1-alt-correta',
          questionText: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
        },
        // ALTERNATIVE - Incorrect
        {
          id: 'q2-alt-incorreta',
          questionText: 'Qual é o maior planeta do sistema solar?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Júpiter é o maior planeta do sistema solar. Sua massa é aproximadamente 318 vezes a massa da Terra, e seu diâmetro equatorial é cerca de 11 vezes maior que o da Terra. Saturno é o segundo maior, com um diâmetro equatorial de aproximadamente 9 vezes o da Terra. Urano e Netuno são menores, com diâmetros equatoriais de cerca de 4 vezes o da Terra.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Júpiter' },
            { id: 'opt2', option: 'Saturno' },
            { id: 'opt3', option: 'Urano' },
            { id: 'opt4', option: 'Netuno' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
        },
        // MULTIPLE CHOICE - Correct
        {
          id: 'q3-mult-correta',
          questionText:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Saturno' },
            { id: 'opt2', option: 'Júpiter' },
            { id: 'opt3', option: 'Urano' },
            { id: 'opt4', option: 'Netuno' },
            { id: 'opt5', option: 'Marte' },
            { id: 'opt6', option: 'Vênus' },
          ],
          correctOptionIds: ['opt1', 'opt2', 'opt3', 'opt4'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
        },
        // MULTIPLE CHOICE - Incorrect
        {
          id: 'q4-mult-incorreta',
          questionText:
            'Quais das seguintes grandezas são vetoriais? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Velocidade, Aceleração e Força são grandezas vetoriais. Temperatura é uma grandeza escalar.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Velocidade' },
            { id: 'opt2', option: 'Aceleração' },
            { id: 'opt3', option: 'Força' },
            { id: 'opt4', option: 'Temperatura' },
          ],
          correctOptionIds: ['opt1', 'opt2', 'opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'grandezas',
              subtopicId: 'vetores',
              contentId: 'cinematica',
            },
          ],
        },
        // DISSERTATIVE - Correct
        {
          id: 'q5-diss-correta',
          questionText:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'linguagens',
              subjectId: 'portugues',
              topicId: 'redacao',
              subtopicId: 'dissertativa',
              contentId: 'linguagens',
            },
          ],
        },
        // DISSERTATIVE - Incorrect
        {
          id: 'q6-diss-incorreta',
          questionText:
            'Descreva as leis de Newton e suas aplicações na mecânica clássica.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'As três leis de Newton são fundamentais para a mecânica clássica: 1) Primeira Lei (Inércia): um corpo permanece em repouso ou em movimento retilíneo uniforme a menos que uma força resultante atue sobre ele; 2) Segunda Lei: a força resultante é igual ao produto da massa pela aceleração (F = ma); 3) Terceira Lei: para toda ação há uma reação igual e oposta. Estas leis são aplicadas em sistemas mecânicos, análise de movimento, equilíbrio de forças e dinâmica de partículas.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'dinamica',
              subtopicId: 'leis-newton',
              contentId: 'dinamica',
            },
          ],
        },
        // True or False - Correct
        {
          id: 'q7-vf-correta',
          questionText:
            'A Terra é o terceiro planeta do sistema solar em ordem de distância do Sol.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Verdadeiro. A Terra é o terceiro planeta do sistema solar, localizada entre Vênus (segundo) e Marte (quarto). A ordem dos planetas a partir do Sol é: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
        },
        // True or False - Incorrect
        {
          id: 'q8-vf-incorreta',
          questionText: 'O Sol é uma estrela anã branca.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Falso. O Sol é uma estrela anã amarela (sequência principal). As anãs brancas são estrelas que já esgotaram seu combustível nuclear e são muito menores e mais densas.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'sol',
              contentId: 'ciencias',
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);
    setCurrentQuestion(mockSimulated.questions[0]);
    startQuiz();

    // Simulate user answers
    setUserAnswers([
      {
        questionId: 'q1-image',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
        optionId: null,
        questionType: QUESTION_TYPE.IMAGEM,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q1-image-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
        optionId: null,
        questionType: QUESTION_TYPE.IMAGEM,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q1-alt-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2-alt-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Júpiter é o maior planeta do sistema solar. Sua massa é aproximadamente 318 vezes a massa da Terra, e seu diâmetro equatorial é cerca de 11 vezes maior que o da Terra. Saturno é o segundo maior, com um diâmetro equatorial de aproximadamente 9 vezes o da Terra. Urano e Netuno são menores, com diâmetros equatoriais de cerca de 4 vezes o da Terra.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q4-mult-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Velocidade, Aceleração e Força são grandezas vetoriais. Temperatura é uma grandeza escalar.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q4-mult-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'Velocidade, Aceleração e Força são grandezas vetoriais. Temperatura é uma grandeza escalar.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q5-diss-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer:
          'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
        optionId: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q6-diss-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: 'As leis de Newton são importantes para a física.',
        optionId: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
    ]);
  }, [
    setBySimulated,
    startQuiz,
    setUserAnswers,
    setUserId,
    setCurrentQuestion,
  ]);

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz - Resultados
        </h1>
        <p className="text-2xl font-semibold text-text-700 mb-2">
          Demonstração de resultados com questões corretas e incorretas
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        {/* Manual navigation buttons for result variant */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => goToPreviousQuestion()}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg transition-colors font-medium shadow-lg ${
              currentQuestionIndex === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            ← Anterior
          </button>
          <button
            onClick={() => goToNextQuestion()}
            disabled={currentQuestionIndex === getTotalQuestions() - 1}
            className={`px-6 py-3 rounded-lg transition-colors font-medium shadow-lg ${
              currentQuestionIndex === getTotalQuestions() - 1
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Próximo →
          </button>
        </div>

        <Quiz variant="result">
          <QuizHeaderResult />
          <QuizTitle />
          <QuizHeader />
          <QuizContent paddingBottom="pb-[150px]" />
          <QuizFooter className="bottom-15" />
        </Quiz>
      </div>
    </div>
  );
};

// 3° Results page and separated components
export const ResultsPageAndSeparatedComponents: Story = () => {
  const {
    setBySimulated,
    startQuiz,
    setUserAnswers,
    finishQuiz,
    setUserId,
    goToNextQuestion,
    goToPreviousQuestion,
    currentQuestionIndex,
    getTotalQuestions,
  } = useQuizStore();

  useEffect(() => {
    const mockSimulated = {
      id: 'simulado-resultados-completos',
      title: 'Simulado Enem #42 - Resultados Completos',
      type: 'ENEM',
      subtype: 'Simulado',
      difficulty: 'MEDIO',
      notification: null,
      status: 'ATIVO',
      startDate: new Date('2024-01-01'),
      finalDate: new Date('2024-12-31'),
      canRetry: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      questions: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre física - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A resposta correta é a primeira opção porque ela representa corretamente o conceito físico abordado na questão. Em física, é fundamental entender os princípios básicos que governam os fenômenos naturais.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'fisica',
              topicId: 'mecanica',
              subtopicId: 'movimento',
              contentId: 'cinematica',
            },
          ],
        },
        {
          id: 'q2',
          questionText: 'Questão de Matemática 1 - Múltipla Escolha',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre matemática - tipo múltipla escolha',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'As duas primeiras opções são corretas porque ambas representam soluções válidas para o problema matemático apresentado. Em matemática, é comum que uma equação tenha múltiplas soluções válidas.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt1', 'opt2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'matematica',
              topicId: 'algebra',
              subtopicId: 'equacoes',
              contentId: 'algebra',
            },
          ],
        },
        {
          id: 'q3',
          questionText: 'Questão de Química 1 - Dissertativa',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre química - tipo dissertativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A química é uma ciência fundamental que estuda a composição, estrutura e propriedades da matéria. Ela é essencial para entender diversos fenômenos naturais e tecnológicos, desde a fotossíntese até a produção de medicamentos. A química está presente em todos os aspectos da vida moderna, incluindo agricultura, medicina, indústria e meio ambiente.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'quimica',
              subjectId: 'quimica',
              topicId: 'quimica-geral',
              subtopicId: 'formulas',
              contentId: 'quimica',
            },
          ],
        },
        {
          id: 'q4',
          questionText: 'Questão de Biologia 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre biologia - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A terceira opção é a resposta correta porque representa o conceito biológico correto abordado na questão. Em biologia, é essencial compreender os processos celulares e suas funções no organismo.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta correta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'biologia',
              subjectId: 'biologia',
              topicId: 'biologia-geral',
              subtopicId: 'celulas',
              contentId: 'biologia',
            },
          ],
        },
        {
          id: 'q5',
          questionText: 'Questão de História 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre história - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A segunda opção é a resposta correta porque representa o fato histórico correto sobre o período colonial brasileiro. Em história, é fundamental conhecer os eventos e contextos que moldaram a formação do país.',
          answer: null,
          answerStatus: QUESTION_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'humanas',
              subjectId: 'historia',
              topicId: 'historia-geral',
              subtopicId: 'brasil-colonia',
              contentId: 'historia',
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);
    startQuiz();

    setUserAnswers([
      {
        questionId: 'q1',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'A resposta correta é a primeira opção porque ela representa corretamente o conceito físico abordado na questão. Em física, é fundamental entender os princípios básicos que governam os fenômenos naturais.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'As duas primeiras opções são corretas porque ambas representam soluções válidas para o problema matemático apresentado. Em matemática, é comum que uma equação tenha múltiplas soluções válidas.',
        optionId: null,
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'A química é uma ciência fundamental que estuda a composição, estrutura e propriedades da matéria. Ela é essencial para entender diversos fenômenos naturais e tecnológicos, desde a fotossíntese até a produção de medicamentos. A química está presente em todos os aspectos da vida moderna, incluindo agricultura, medicina, indústria e meio ambiente.',
        optionId: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
      },
      {
        questionId: 'q4',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'A terceira opção é a resposta correta porque representa o conceito biológico correto abordado na questão. Em biologia, é essencial compreender os processos celulares e suas funções no organismo.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q5',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'A segunda opção é a resposta correta porque representa o fato histórico correto sobre o período colonial brasileiro. Em história, é fundamental conhecer os eventos e contextos que moldaram a formação do país.',
        optionId: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
    ]);

    finishQuiz();
  }, [setBySimulated, startQuiz, setUserAnswers, finishQuiz, setUserId]);

  const handleSubjectClick = (subject: string) => {
    console.log('Subject clicked:', subject);
  };

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Página de Resultados e Componentes Separados
        </h1>
        <p className="text-text-600 text-lg">
          Demonstração completa da página de resultados e componentes
          individuais
        </p>
      </div>

      <div className="space-y-8">
        {/* Complete results page */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Complete Results Page</h2>
          <div className="overflow-y-auto h-[600px]">
            <div className="w-full max-w-[1000px] flex flex-col mx-auto h-full relative">
              <QuizResultHeaderTitle />
              <div>
                <QuizResultTitle />
                <QuizResultPerformance />
                <QuizListResult onSubjectClick={handleSubjectClick} />
              </div>
            </div>
          </div>
        </div>

        {/* Individual components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header with title and badge */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Header with Title and Badge
            </h3>
            <QuizResultHeaderTitle />
          </div>

          {/* Simulated title */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Simulated Title</h3>
            <QuizResultTitle />
          </div>

          {/* Performance with ProgressCircle and ProgressBars */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <QuizResultPerformance />
          </div>

          {/* Subject list */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Subject List</h3>
            <QuizListResult
              onSubjectClick={(subject) =>
                console.log('Subject clicked:', subject)
              }
            />
          </div>
        </div>

        {/* Result by specific subject */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Result by Specific Subject
          </h3>
          <QuizListResultByMateria
            subject="fisica"
            onQuestionClick={(question) =>
              console.log('Question clicked:', question)
            }
          />
        </div>

        {/* Manual navigation buttons for result variant */}
        <div className="flex justify-center gap-4 mt-8 mb-4">
          <button
            onClick={() => goToPreviousQuestion()}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg transition-colors font-medium shadow-lg ${
              currentQuestionIndex === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            ← Anterior
          </button>
          <button
            onClick={() => goToNextQuestion()}
            disabled={currentQuestionIndex === getTotalQuestions() - 1}
            className={`px-6 py-3 rounded-lg transition-colors font-medium shadow-lg ${
              currentQuestionIndex === getTotalQuestions() - 1
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Próximo →
          </button>
        </div>

        {/* Quiz component */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Quiz Component</h2>
          <Quiz variant="result">
            <QuizHeaderResult />
            <QuizTitle />
            <QuizHeader />
            <QuizContent paddingBottom="pb-[150px]" />
            <QuizFooter className="bottom-15" />
          </Quiz>
        </div>
      </div>
    </div>
  );
};
