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
      category: 'Enem',
      questions: [
        {
          id: 'q1-alternativa',
          questionText: 'Qual é a capital do Brasil?',
          description: 'Questão de alternativa simples',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
          options: [
            { id: 'opt1', option: 'São Paulo', isCorrect: false },
            { id: 'opt2', option: 'Rio de Janeiro', isCorrect: false },
            { id: 'opt3', option: 'Brasília', isCorrect: true },
            { id: 'opt4', option: 'Salvador', isCorrect: false },
          ],
        },
        {
          id: 'q2-multipla-escolha',
          questionText:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          description: 'Questão de múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
          options: [
            { id: 'opt1', option: 'Saturno', isCorrect: true },
            { id: 'opt2', option: 'Júpiter', isCorrect: true },
            { id: 'opt3', option: 'Urano', isCorrect: true },
            { id: 'opt4', option: 'Netuno', isCorrect: true },
            { id: 'opt5', option: 'Marte', isCorrect: false },
            { id: 'opt6', option: 'Vênus', isCorrect: false },
          ],
        },
        {
          id: 'q3-dissertativa',
          questionText:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          description: 'Questão dissertativa sobre preservação ambiental',
          type: 'DISSERTATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'DIFICIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'linguagens',
              subjectId: 'portugues',
              topicId: 'redacao',
              subtopicId: 'dissertativa',
              contentId: 'linguagens',
            },
          ],
          options: [],
        },
        {
          id: 'q4-verdadeiro-falso',
          questionText:
            'A Terra é o terceiro planeta do sistema solar em ordem de distância do Sol.',
          description: 'Questão de verdadeiro ou falso',
          type: 'VERDADEIRO_FALSO' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
          options: [
            { id: 'opt1', option: 'Verdadeiro', isCorrect: true },
            { id: 'opt2', option: 'Falso', isCorrect: false },
          ],
        },
        {
          id: 'q5-ligar-pontos',
          questionText: 'Ligue os conceitos às suas definições corretas.',
          description: 'Questão de ligar pontos',
          type: 'LIGAR_PONTOS' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'cinematica',
              contentId: 'fisica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Velocidade', isCorrect: true },
            {
              id: 'opt2',
              option: 'Distância percorrida por unidade de tempo',
              isCorrect: true,
            },
            { id: 'opt3', option: 'Aceleração', isCorrect: true },
            {
              id: 'opt4',
              option: 'Variação da velocidade por unidade de tempo',
              isCorrect: true,
            },
          ],
        },
        {
          id: 'q6-preencher',
          questionText:
            'Complete a frase: "A fórmula da velocidade média é v = ___ / ___", onde v é velocidade, ___ é distância e ___ é tempo.',
          description: 'Questão de preenchimento',
          type: 'PREENCHER' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'cinematica',
              contentId: 'fisica',
            },
          ],
          options: [],
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
        answer: 'opt3',
        optionId: 'opt3',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2-multipla-escolha',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer: 'opt1,opt2,opt3,opt4',
        optionId: 'opt1,opt2,opt3,opt4',
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
        answer: 'opt1',
        optionId: 'opt1',
        questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q5-ligar-pontos',
        activityId: 'simulado-geral',
        userId: 'demo-user-id',
        answer: 'opt1,opt2,opt3,opt4',
        optionId: 'opt1,opt2,opt3,opt4',
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
  } = useQuizStore();

  useEffect(() => {
    const mockSimulated = {
      id: 'simulado-resultados',
      title: 'Simulado ENEM 2024 - Resultados',
      category: 'Enem',
      questions: [
        // ALTERNATIVE - Correct
        {
          id: 'q1-alt-correta',
          questionText: 'Qual é a capital do Brasil?',
          description: 'Questão de alternativa - resposta correta',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          correctAnswer: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
          options: [
            { id: 'opt1', option: 'São Paulo', isCorrect: false },
            { id: 'opt2', option: 'Rio de Janeiro', isCorrect: false },
            { id: 'opt3', option: 'Brasília', isCorrect: true },
            { id: 'opt4', option: 'Salvador', isCorrect: false },
          ],
        },
        // ALTERNATIVE - Incorrect
        {
          id: 'q2-alt-incorreta',
          questionText: 'Qual é o maior planeta do sistema solar?',
          description: 'Questão de alternativa - resposta incorreta',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
          options: [
            { id: 'opt1', option: 'Júpiter', isCorrect: true },
            { id: 'opt2', option: 'Saturno', isCorrect: false },
            { id: 'opt3', option: 'Urano', isCorrect: false },
            { id: 'opt4', option: 'Netuno', isCorrect: false },
          ],
        },
        // MULTIPLE CHOICE - Correct
        {
          id: 'q3-mult-correta',
          questionText:
            'Quais são os planetas do sistema solar que possuem anéis? (Selecione todas as opções corretas)',
          description: 'Questão de múltipla escolha - resposta correta',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1,opt2,opt3,opt4',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
          options: [
            { id: 'opt1', option: 'Saturno', isCorrect: true },
            { id: 'opt2', option: 'Júpiter', isCorrect: true },
            { id: 'opt3', option: 'Urano', isCorrect: true },
            { id: 'opt4', option: 'Netuno', isCorrect: true },
            { id: 'opt5', option: 'Marte', isCorrect: false },
            { id: 'opt6', option: 'Vênus', isCorrect: false },
          ],
        },
        // MULTIPLE CHOICE - Incorrect
        {
          id: 'q4-mult-incorreta',
          questionText:
            'Quais das seguintes grandezas são vetoriais? (Selecione todas as opções corretas)',
          description: 'Questão de múltipla escolha - resposta incorreta',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: '',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'grandezas',
              subtopicId: 'vetores',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Velocidade', isCorrect: true },
            { id: 'opt2', option: 'Aceleração', isCorrect: true },
            { id: 'opt3', option: 'Força', isCorrect: true },
            { id: 'opt4', option: 'Temperatura', isCorrect: false },
          ],
        },
        // DISSERTATIVE - Correct
        {
          id: 'q5-diss-correta',
          questionText:
            'Elabore uma redação dissertativa-argumentativa sobre o tema "A importância da preservação ambiental para o futuro das próximas gerações". Sua redação deve ter entre 20 e 25 linhas, apresentar argumentos bem fundamentados, respeitar a estrutura dissertativa e demonstrar domínio da norma culta da língua escrita.',
          description: 'Questão dissertativa - resposta correta',
          type: 'DISSERTATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'DIFICIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'linguagens',
              subjectId: 'portugues',
              topicId: 'redacao',
              subtopicId: 'dissertativa',
              contentId: 'linguagens',
            },
          ],
          options: [],
        },
        // DISSERTATIVE - Incorrect
        {
          id: 'q6-diss-incorreta',
          questionText:
            'Descreva as leis de Newton e suas aplicações na mecânica clássica.',
          description: 'Questão dissertativa - resposta incorreta',
          type: 'DISSERTATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'DIFICIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'dinamica',
              subtopicId: 'leis-newton',
              contentId: 'dinamica',
            },
          ],
          options: [],
        },
        // True or False - Correct
        {
          id: 'q1-alt-correta',
          questionText: 'Qual é a capital do Brasil?',
          description: 'Questão de alternativa - resposta correta',
          type: 'VERDADEIRO_FALSO' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          correctAnswer: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'geografia',
              subjectId: 'geografia-geral',
              topicId: 'capitais',
              subtopicId: 'brasil',
              contentId: 'geografia',
            },
          ],
          options: [
            { id: 'opt1', option: 'São Paulo', isCorrect: false },
            { id: 'opt2', option: 'Rio de Janeiro', isCorrect: false },
            { id: 'opt3', option: 'Brasília', isCorrect: true },
            { id: 'opt4', option: 'Salvador', isCorrect: false },
          ],
        },
        // ALTERNATIVE - Incorrect
        {
          id: 'q2-alt-incorreta',
          questionText: 'Qual é o maior planeta do sistema solar?',
          description: 'Questão de alternativa - resposta incorreta',
          type: 'VERDADEIRO_FALSO' as QUESTION_TYPE,
          status: 'REPROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'ciencias',
              subjectId: 'astronomia',
              topicId: 'sistema-solar',
              subtopicId: 'planetas',
              contentId: 'ciencias',
            },
          ],
          options: [
            { id: 'opt1', option: 'Júpiter', isCorrect: true },
            { id: 'opt2', option: 'Saturno', isCorrect: false },
            { id: 'opt3', option: 'Urano', isCorrect: false },
            { id: 'opt4', option: 'Netuno', isCorrect: false },
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
        questionId: 'q1-alt-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: 'opt3',
        optionId: 'opt3',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2-alt-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt1',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt2',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt3',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3-mult-correta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt4',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q4-mult-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt2',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      },
      {
        questionId: 'q4-mult-incorreta',
        activityId: 'simulado-resultados',
        userId: 'demo-user-id',
        answer: '',
        optionId: 'opt1',
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
        <p className="text-text-600 text-lg">
          Demonstração de resultados com questões corretas e incorretas
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizHeaderResult />
          <QuizTitle />
          <QuizHeader />
          <QuizContent paddingBottom="pb-[150px]" variant="result" />
          <QuizFooter className="bottom-15" />
        </Quiz>
      </div>
    </div>
  );
};

// 3° Results page and separated components
export const ResultsPageAndSeparatedComponents: Story = () => {
  const { setBySimulated, startQuiz, setUserAnswers, finishQuiz, setUserId } =
    useQuizStore();

  useEffect(() => {
    const mockSimulated = {
      id: 'simulado-resultados-completos',
      title: 'Simulado Enem #42 - Resultados Completos',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1 - Alternativa',
          description: 'Questão sobre física - tipo alternativa',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'fisica',
              topicId: 'mecanica',
              subtopicId: 'movimento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta correta', isCorrect: true },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText: 'Questão de Matemática 1 - Múltipla Escolha',
          description: 'Questão sobre matemática - tipo múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1,opt2',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'matematica',
              topicId: 'algebra',
              subtopicId: 'equacoes',
              contentId: 'algebra',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta correta', isCorrect: true },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          questionText: 'Questão de Química 1 - Dissertativa',
          description: 'Questão sobre química - tipo dissertativa',
          type: 'DISSERTATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'quimica',
              subjectId: 'quimica',
              topicId: 'quimica-geral',
              subtopicId: 'formulas',
              contentId: 'quimica',
            },
          ],
          options: [],
        },
        {
          id: 'q4',
          questionText: 'Questão de Biologia 1 - Alternativa',
          description: 'Questão sobre biologia - tipo alternativa',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'biologia',
              subjectId: 'biologia',
              topicId: 'biologia-geral',
              subtopicId: 'celulas',
              contentId: 'biologia',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta correta', isCorrect: true },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q5',
          questionText: 'Questão de História 1 - Alternativa',
          description: 'Questão sobre história - tipo alternativa',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt2',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'humanas',
              subjectId: 'historia',
              topicId: 'historia-geral',
              subtopicId: 'brasil-colonia',
              contentId: 'historia',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
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
        answer: 'opt1',
        optionId: 'opt1',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q2',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer: 'opt1,opt2',
        optionId: 'opt1,opt2',
        questionType: QUESTION_TYPE.MULTIPLA_CHOICE,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q3',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer:
          'A química é uma ciência fundamental que estuda a composição, estrutura e propriedades da matéria. Ela é essencial para entender diversos fenômenos naturais e tecnológicos, desde a fotossíntese até a produção de medicamentos.',
        optionId: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
      },
      {
        questionId: 'q4',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer: 'opt3',
        optionId: 'opt3',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      },
      {
        questionId: 'q5',
        activityId: 'simulado-resultados-completos',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
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
      </div>
    </div>
  );
};
