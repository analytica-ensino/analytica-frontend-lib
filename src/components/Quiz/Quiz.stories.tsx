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
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'q1-alternativa',
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'q2-multipla-escolha',
          statement:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
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
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'planetas',
                name: 'Planetas',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
        {
          id: 'q3-dissertativa',
          statement:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa sobre preservação ambiental',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'linguagens',
                name: 'Linguagens',
              },
              subject: {
                id: 'portugues',
                name: 'Português',
              },
              topic: {
                id: 'redacao',
                name: 'Redação',
              },
              subtopic: {
                id: 'dissertativa',
                name: 'Dissertativa',
              },
              content: {
                id: 'linguagens',
                name: 'Linguagens',
              },
            },
          ],
        },
        {
          id: 'q4-verdadeiro-falso',
          statement:
            'A Terra é o terceiro planeta do sistema solar em ordem de distância do Sol.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Verdadeiro. A Terra é o terceiro planeta do sistema solar, localizada entre Vênus (segundo) e Marte (quarto). A ordem dos planetas a partir do Sol é: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'planetas',
                name: 'Planetas',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
        {
          id: 'q5-ligar-pontos',
          statement: 'Ligue os conceitos às suas definições corretas.',
          questionType: QUESTION_TYPE.LIGAR_PONTOS,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de ligar pontos',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Velocidade é a distância percorrida por unidade de tempo (v = d/t). Aceleração é a variação da velocidade por unidade de tempo (a = Δv/t). Estas são grandezas fundamentais da cinemática que descrevem o movimento dos corpos.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
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
              areaKnowledge: {
                id: 'fisica',
                name: 'Física',
              },
              subject: {
                id: 'mecanica',
                name: 'Mecânica',
              },
              topic: {
                id: 'movimento',
                name: 'Movimento',
              },
              subtopic: {
                id: 'cinematica',
                name: 'Cinemática',
              },
              content: {
                id: 'fisica',
                name: 'Física',
              },
            },
          ],
        },
        {
          id: 'q6-preencher',
          statement:
            'Complete a frase: "A fórmula da velocidade média é v = ___ / ___", onde v é velocidade, ___ é distância e ___ é tempo.',
          questionType: QUESTION_TYPE.PREENCHER,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de preenchimento',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation: 'd,t',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'fisica',
                name: 'Física',
              },
              subject: {
                id: 'mecanica',
                name: 'Mecânica',
              },
              topic: {
                id: 'movimento',
                name: 'Movimento',
              },
              subtopic: {
                id: 'cinematica',
                name: 'Cinemática',
              },
              content: {
                id: 'fisica',
                name: 'Física',
              },
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);
    startQuiz();
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
    setQuestionsResult,
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
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        // // IMAGE - Incorrect
        {
          id: 'q1-image-incorreta',
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa simples',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'São Paulo' },
            { id: 'opt2', option: 'Rio de Janeiro' },
            { id: 'opt3', option: 'Brasília' },
            { id: 'opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        // ALTERNATIVE - Correct
        {
          id: 'q1-alt-correta',
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'alt-opt1', option: 'São Paulo' },
            { id: 'alt-opt2', option: 'Rio de Janeiro' },
            { id: 'alt-opt3', option: 'Brasília' },
            { id: 'alt-opt4', option: 'Salvador' },
          ],
          correctOptionIds: ['alt-opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        // // ALTERNATIVE - Incorrect
        {
          id: 'q2-alt-incorreta',
          statement: 'Qual é o maior planeta do sistema solar?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de alternativa - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Júpiter é o maior planeta do sistema solar. Sua massa é aproximadamente 318 vezes a massa da Terra, e seu diâmetro equatorial é cerca de 11 vezes maior que o da Terra. Saturno é o segundo maior, com um diâmetro equatorial de aproximadamente 9 vezes o da Terra. Urano e Netuno são menores, com diâmetros equatoriais de cerca de 4 vezes o da Terra.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          options: [
            { id: 'alt-opt1', option: 'Júpiter' },
            { id: 'alt-opt2', option: 'Saturno' },
            { id: 'alt-opt3', option: 'Urano' },
            { id: 'alt-opt4', option: 'Netuno' },
          ],
          correctOptionIds: ['alt-opt1'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'planetas',
                name: 'Planetas',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
        // MULTIPLE CHOICE - Correct
        {
          id: 'q3-multi-correta',
          statement:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Saturno, Júpiter, Urano e Netuno possuem sistemas de anéis. Saturno tem os anéis mais visíveis e espetaculares, compostos principalmente por gelo e rocha. Júpiter possui anéis tênues formados por poeira. Urano e Netuno também têm anéis, embora menos visíveis, formados por partículas escuras de carbono.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'multi-opt1', option: 'Saturno' },
            { id: 'multi-opt2', option: 'Júpiter' },
            { id: 'multi-opt3', option: 'Urano' },
            { id: 'multi-opt4', option: 'Netuno' },
            { id: 'multi-opt5', option: 'Marte' },
            { id: 'multi-opt6', option: 'Vênus' },
          ],
          correctOptionIds: [
            'multi-opt1',
            'multi-opt2',
            'multi-opt3',
            'multi-opt4',
          ],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'planetas',
                name: 'Planetas',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
        // // MULTIPLE CHOICE - Incorrect
        {
          id: 'q4-multi-incorreta',
          statement:
            'Quais das seguintes grandezas são vetoriais? (Selecione todas as opções corretas)',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão de múltipla escolha - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Velocidade, Aceleração e Força são grandezas vetoriais. Temperatura é uma grandeza escalar.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          options: [
            { id: 'multi-opt1', option: 'Velocidade' },
            { id: 'multi-opt2', option: 'Aceleração' },
            { id: 'multi-opt3', option: 'Força' },
            { id: 'multi-opt4', option: 'Temperatura' },
          ],
          correctOptionIds: ['multi-opt1', 'multi-opt2', 'multi-opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'fisica',
                name: 'Física',
              },
              subject: {
                id: 'mecanica',
                name: 'Mecânica',
              },
              topic: {
                id: 'grandezas',
                name: 'Grandezas',
              },
              subtopic: {
                id: 'vetores',
                name: 'Vetores',
              },
              content: {
                id: 'cinematica',
                name: 'Cinemática',
              },
            },
          ],
        },
        // DISSERTATIVE - Correct
        {
          id: 'q5-diss-correta',
          statement:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'linguagens',
                name: 'Linguagens',
              },
              subject: {
                id: 'portugues',
                name: 'Português',
              },
              topic: {
                id: 'redacao',
                name: 'Redação',
              },
              subtopic: {
                id: 'dissertativa',
                name: 'Dissertativa',
              },
              content: {
                id: 'linguagens',
                name: 'Linguagens',
              },
            },
          ],
        },
        // DISSERTATIVE - Incorrect
        {
          id: 'q6-diss-incorreta',
          statement:
            'Descreva as leis de Newton e suas aplicações na mecânica clássica.',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          description: 'Questão dissertativa - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'As três leis de Newton são fundamentais para a mecânica clássica: 1) Primeira Lei (Inércia): um corpo permanece em repouso ou em movimento retilíneo uniforme a menos que uma força resultante atue sobre ele; 2) Segunda Lei: a força resultante é igual ao produto da massa pela aceleração (F = ma); 3) Terceira Lei: para toda ação há uma reação igual e oposta. Estas leis são aplicadas em sistemas mecânicos, análise de movimento, equilíbrio de forças e dinâmica de partículas.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'fisica',
                name: 'Física',
              },
              subject: {
                id: 'mecanica',
                name: 'Mecânica',
              },
              topic: {
                id: 'dinamica',
                name: 'Dinâmica',
              },
              subtopic: {
                id: 'leis-newton',
                name: 'Leis de Newton',
              },
              content: {
                id: 'dinamica',
                name: 'Dinâmica',
              },
            },
          ],
        },
        // True or False - Correct
        {
          id: 'q7-vf-correta',
          statement:
            'A Terra é o terceiro planeta do sistema solar em ordem de distância do Sol.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso - resposta correta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Verdadeiro. A Terra é o terceiro planeta do sistema solar, localizada entre Vênus (segundo) e Marte (quarto). A ordem dos planetas a partir do Sol é: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'planetas',
                name: 'Planetas',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
        // True or False - Incorrect
        {
          id: 'q8-vf-incorreta',
          statement: 'O Sol é uma estrela anã branca.',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          description: 'Questão de verdadeiro ou falso - resposta incorreta',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'Falso. O Sol é uma estrela anã amarela (sequência principal). As anãs brancas são estrelas que já esgotaram seu combustível nuclear e são muito menores e mais densas.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Verdadeiro' },
            { id: 'opt2', option: 'Falso' },
          ],
          correctOptionIds: ['opt2'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'ciencias',
                name: 'Ciências',
              },
              subject: {
                id: 'astronomia',
                name: 'Astronomia',
              },
              topic: {
                id: 'sistema-solar',
                name: 'Sistema Solar',
              },
              subtopic: {
                id: 'sol',
                name: 'Sol',
              },
              content: {
                id: 'ciencias',
                name: 'Ciências',
              },
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);
    setCurrentQuestion(mockSimulated.questions[0]);
    startQuiz();

    // Configure QuestionResult data for components that need it
    setQuestionsResult({
      answers: [
        {
          id: 'answer1',
          questionId: 'q1-image',
          answer:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          selectedOptions: [{ optionId: 'img_opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Qual é a capital do Brasil?',
          questionType: QUESTION_TYPE.IMAGEM,
          correctOption: 'img_opt1',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'Brasília é a capital do Brasil desde 1960.',
          options: [],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer2',
          questionId: 'q1-image-incorreta',
          answer:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          selectedOptions: [{ optionId: 'img_opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Qual é a capital do Brasil? (Questão Incorreta)',
          questionType: QUESTION_TYPE.IMAGEM,
          correctOption: 'img_opt1',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'Brasília é a capital do Brasil desde 1960.',
          options: [],
          teacherFeedback:
            'Resposta incorreta. A capital do Brasil é Brasília.',
          attachment: null,
          score: 0,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer3',
          questionId: 'q1-alt-correta',
          answer:
            'Brasília é a capital do Brasil desde 1960, quando foi inaugurada para substituir o Rio de Janeiro como sede do governo federal. A cidade foi planejada pelo arquiteto Oscar Niemeyer e pelo urbanista Lúcio Costa, seguindo princípios modernistas de arquitetura e urbanismo.',
          selectedOptions: [{ optionId: 'alt-opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Alternativa Correta',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'alt-opt1',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'Brasília é a capital do Brasil.',
          options: [{ id: 'alt-opt3', option: 'Brasília', isCorrect: false }],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer4',
          questionId: 'q2-alt-incorreta',
          answer:
            'Júpiter é o maior planeta do sistema solar. Sua massa é aproximadamente 318 vezes a massa da Terra, e seu diâmetro equatorial é cerca de 11 vezes maior que o da Terra. Saturno é o segundo maior, com um diâmetro equatorial de aproximadamente 9 vezes o da Terra. Urano e Netuno são menores, com diâmetros equatoriais de cerca de 4 vezes o da Terra.',
          selectedOptions: [{ optionId: 'alt-opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Alternativa Incorreta',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'alt-opt2',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: 'A resposta correta é a primeira opção.',
          options: [
            { id: 'alt-opt2', option: 'Resposta incorreta', isCorrect: false },
          ],
          teacherFeedback: 'Resposta incorreta. Revise o conceito.',
          attachment: null,
          score: 0,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer5',
          questionId: 'q3-multi-correta',
          answer: null,
          selectedOptions: [{ optionId: 'multi-opt1' }, { optionId: 'multi-opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Múltipla Escolha Correta',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          correctOption: 'multi-opt1,multi-opt2,multi-opt3',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'Saturno, Júpiter, Urano e Netuno possuem anéis.',
          options: [
            { id: 'multi-opt1', option: 'Saturno', isCorrect: true },
            { id: 'multi-opt2', option: 'Júpiter', isCorrect: true },
            { id: 'multi-opt3', option: 'Urano', isCorrect: true },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 75, // Partial score for partial answer
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer6',
          questionId: 'q4-multi-incorreta',
          answer: null,
          selectedOptions: [{ optionId: 'multi-opt1' }, { optionId: 'multi-opt3' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Múltipla Escolha Incorreta',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          correctOption: 'multi-opt1,multi-opt2,multi-opt3',
          difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          solutionExplanation: 'Velocidade, Aceleração e Força são vetoriais.',
          options: [
            { id: 'multi-opt1', option: 'Velocidade', isCorrect: true },
            { id: 'multi-opt2', option: 'Aceleração', isCorrect: true },
            { id: 'multi-opt3', option: 'Força', isCorrect: true },
            { id: 'multi-opt4', option: 'Temperatura', isCorrect: false },
          ],
          teacherFeedback: 'Faltou incluir a Aceleração na resposta.',
          attachment: null,
          score: 25, // Partial score
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'teacher',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer7',
          questionId: 'q5-diss-correta',
          answer:
            'A preservação ambiental é fundamental para garantir um futuro sustentável para as próximas gerações. O equilíbrio ecológico, a biodiversidade e os recursos naturais são essenciais para a sobrevivência humana e devem ser protegidos através de políticas públicas eficazes, educação ambiental e mudanças nos padrões de consumo.',
          selectedOptions: [{ optionId: 'diss_opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão Dissertativa Correta sobre Meio Ambiente',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          correctOption: '',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'A preservação ambiental é fundamental para sustentabilidade.',
          options: [],
          teacherFeedback:
            'Excelente resposta! Abordou todos os pontos importantes sobre preservação ambiental.',
          attachment: null,
          score: 95,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'teacher',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer8',
          questionId: 'q6-diss-incorreta',
          answer: 'As leis de Newton são importantes para a física.',
          selectedOptions: [{ optionId: 'diss_opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão Dissertativa Incorreta sobre Física',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          correctOption: '',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'Esperava-se uma resposta mais detalhada sobre as leis de Newton.',
          options: [],
          teacherFeedback:
            'Resposta muito superficial. Explique melhor as três leis de Newton e suas aplicações.',
          attachment: null,
          score: 20,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'teacher',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
      ],
      statistics: {
        totalAnswered: 8,
        correctAnswers: 4,
        incorrectAnswers: 4,
        pendingAnswers: 0,
        score: 52, // Average of all scores (415 / 8 ≈ 51.875, rounded)
      },
    });
  }, [
    setBySimulated,
    startQuiz,
    setUserAnswers,
    setUserId,
    setCurrentQuestion,
    setQuestionsResult,
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
    setUserAnswers,
    setUserId,
    goToNextQuestion,
    goToPreviousQuestion,
    currentQuestionIndex,
    getTotalQuestions,
    setQuestionsResult,
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
          statement: 'Questão de Física 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre física - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A resposta correta é a primeira opção porque ela representa corretamente o conceito físico abordado na questão. Em física, é fundamental entender os princípios básicos que governam os fenômenos naturais.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt1'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'fisica',
                name: 'Física',
              },
              subject: {
                id: 'fisica',
                name: 'Física',
              },
              topic: {
                id: 'mecanica',
                name: 'Mecânica',
              },
              subtopic: {
                id: 'movimento',
                name: 'Movimento',
              },
              content: {
                id: 'cinematica',
                name: 'Cinemática',
              },
            },
          ],
        },
        {
          id: 'q2',
          statement: 'Questão de Matemática 1 - Múltipla Escolha',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre matemática - tipo múltipla escolha',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'As duas primeiras opções são corretas porque ambas representam soluções válidas para o problema matemático apresentado. Em matemática, é comum que uma equação tenha múltiplas soluções válidas.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt1', 'opt2'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'matematica',
                name: 'Matemática',
              },
              subject: {
                id: 'matematica',
                name: 'Matemática',
              },
              topic: {
                id: 'algebra',
                name: 'Álgebra',
              },
              subtopic: {
                id: 'equacoes',
                name: 'Equações',
              },
              content: {
                id: 'algebra',
                name: 'Álgebra',
              },
            },
          ],
        },
        {
          id: 'q3',
          statement: 'Questão de Química 1 - Dissertativa',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre química - tipo dissertativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A química é uma ciência fundamental que estuda a composição, estrutura e propriedades da matéria. Ela é essencial para entender diversos fenômenos naturais e tecnológicos, desde a fotossíntese até a produção de medicamentos. A química está presente em todos os aspectos da vida moderna, incluindo agricultura, medicina, indústria e meio ambiente.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'quimica',
                name: 'Química',
              },
              subject: {
                id: 'quimica',
                name: 'Química',
              },
              topic: {
                id: 'quimica-geral',
                name: 'Química Geral',
              },
              subtopic: {
                id: 'formulas',
                name: 'Fórmulas',
              },
              content: {
                id: 'quimica',
                name: 'Química',
              },
            },
          ],
        },
        {
          id: 'q4',
          statement: 'Questão de Biologia 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre biologia - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A terceira opção é a resposta correta porque representa o conceito biológico correto abordado na questão. Em biologia, é essencial compreender os processos celulares e suas funções no organismo.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta correta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt3'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'biologia',
                name: 'Biologia',
              },
              subject: {
                id: 'biologia',
                name: 'Biologia',
              },
              topic: {
                id: 'biologia-geral',
                name: 'Biologia Geral',
              },
              subtopic: {
                id: 'celulas',
                name: 'Células',
              },
              content: {
                id: 'biologia',
                name: 'Biologia',
              },
            },
          ],
        },
        {
          id: 'q5',
          statement: 'Questão de História 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: 'Questão sobre história - tipo alternativa',
          examBoard: 'ENEM',
          examYear: '2024',
          solutionExplanation:
            'A segunda opção é a resposta correta porque representa o fato histórico correto sobre o período colonial brasileiro. Em história, é fundamental conhecer os eventos e contextos que moldaram a formação do país.',
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          correctOptionIds: ['opt2'],
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'humanas',
                name: 'Humanas',
              },
              subject: {
                id: 'historia',
                name: 'História',
              },
              topic: {
                id: 'historia-geral',
                name: 'História Geral',
              },
              subtopic: {
                id: 'brasil-colonia',
                name: 'Brasil Colônia',
              },
              content: {
                id: 'historia',
                name: 'História',
              },
            },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulated);

    setQuestionsResult({
      answers: [
        {
          id: 'answer1',
          questionId: 'q1',
          answer: 'opt1',
          selectedOptions: [{ optionId: 'opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Física 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt1',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'A resposta correta é a primeira opção porque ela representa corretamente o conceito físico abordado na questão.',
          options: [
            { id: 'opt1', option: 'Resposta correta', isCorrect: true },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer2',
          questionId: 'q2',
          answer: 'opt1,opt2',
          selectedOptions: [{ optionId: 'opt1' }, { optionId: 'opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Matemática 1 - Múltipla Escolha',
          questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
          correctOption: 'opt1,opt2',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'As duas primeiras opções são corretas porque ambas representam soluções válidas para o problema matemático.',
          options: [
            { id: 'opt1', option: 'Resposta correta', isCorrect: true },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer3',
          questionId: 'q3',
          answer: 'A química é uma ciência fundamental...',
          selectedOptions: [{ optionId: 'dissertativa_opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Química 1 - Dissertativa',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          correctOption: '',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'A química é uma ciência fundamental que estuda a composição, estrutura e propriedades da matéria.',
          options: [],
          teacherFeedback:
            'Excelente resposta, demonstra conhecimento aprofundado.',
          attachment: null,
          score: 95,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'teacher',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer4',
          questionId: 'q4',
          answer: 'opt3',
          selectedOptions: [{ optionId: 'opt3' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de Biologia 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt3',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'A terceira opção é a resposta correta porque representa o conceito biológico correto.',
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta correta', isCorrect: true },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
        {
          id: 'answer5',
          questionId: 'q5',
          answer: 'opt2',
          selectedOptions: [{ optionId: 'opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'Questão de História 1 - Alternativa',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt2',
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation:
            'A segunda opção é a resposta correta porque representa o fato histórico correto.',
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
          knowledgeMatrix: [
            {
              areaKnowledge: {
                id: 'geografia',
                name: 'Geografia',
              },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
              },
              topic: {
                id: 'capitais',
                name: 'Capitais',
              },
              subtopic: {
                id: 'brasil',
                name: 'Brasil',
              },
              content: {
                id: 'geografia',
                name: 'Geografia',
              },
            },
          ],
        },
      ],
      statistics: {
        totalAnswered: 5,
        correctAnswers: 5,
        incorrectAnswers: 0,
        pendingAnswers: 0,
        score: 99, // Average of all scores
      },
    });

  }, [
    setBySimulated,
    setUserAnswers,
    setUserId,
    setQuestionsResult,
  ]);

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
