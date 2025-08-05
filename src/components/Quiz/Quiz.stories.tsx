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
  Question,
  useQuizStore,
} from './useQuizStore';
import { useEffect } from 'react';

export const AllQuizShowcase: Story = () => {
  const { setBySimulated, startQuiz, setUserId } = useQuizStore();

  useEffect(() => {
    // Dados de exemplo para demonstrar a funcionalidade
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText:
            'Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos.',
          description: 'Questão sobre movimento uniformemente variado',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
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
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: true },
            { id: 'opt2', option: '30 metros', isCorrect: false },
            { id: 'opt3', option: '40 metros', isCorrect: false },
            { id: 'opt4', option: '50 metros', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText:
            'Uma partícula se move com velocidade constante de 10 m/s. Qual a distância percorrida em 3 segundos?',
          description: 'Questão sobre movimento uniforme',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'mu',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: false },
            { id: 'opt2', option: '30 metros', isCorrect: true },
            { id: 'opt3', option: '35 metros', isCorrect: false },
            { id: 'opt4', option: '45 metros', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          questionText:
            'Um objeto é lançado verticalmente para cima com velocidade inicial de 20 m/s. Qual a altura máxima atingida? (Considere g = 10 m/s²)',
          description: 'Questão sobre lançamento vertical',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
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
              topicId: 'movimento',
              subtopicId: 'lançamento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '15 metros', isCorrect: false },
            { id: 'opt2', option: '18 metros', isCorrect: false },
            { id: 'opt3', option: '20 metros', isCorrect: true },
            { id: 'opt4', option: '22 metros', isCorrect: false },
          ],
        },
        {
          id: 'q4',
          questionText:
            'Qual é a velocidade média de um móvel que percorre 120 km em 2 horas?',
          description: 'Questão sobre velocidade média',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'velocidade',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '50 km/h', isCorrect: false },
            { id: 'opt2', option: '60 km/h', isCorrect: true },
            { id: 'opt3', option: '70 km/h', isCorrect: false },
            { id: 'opt4', option: '80 km/h', isCorrect: false },
          ],
        },
        {
          id: 'q5',
          questionText:
            'Um corpo em queda livre atinge o solo com velocidade de 30 m/s. Qual foi a altura de onde foi solto? (Considere g = 10 m/s²)',
          description: 'Questão sobre queda livre',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
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
              topicId: 'movimento',
              subtopicId: 'queda-livre',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '45 metros', isCorrect: true },
            { id: 'opt2', option: '50 metros', isCorrect: false },
            { id: 'opt3', option: '55 metros', isCorrect: false },
            { id: 'opt4', option: '60 metros', isCorrect: false },
          ],
        },
        {
          id: 'q6',
          questionText: 'Resolva a equação do segundo grau: x² - 5x + 6 = 0',
          description: 'Questão sobre equações do segundo grau',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'algebra',
              topicId: 'equacoes',
              subtopicId: 'segundo-grau',
              contentId: 'algebra',
            },
          ],
          options: [
            { id: 'opt1', option: 'x = 1 e x = 6', isCorrect: false },
            { id: 'opt2', option: 'x = 1 e x = 4', isCorrect: false },
            { id: 'opt3', option: 'x = 2 e x = 3', isCorrect: true },
            { id: 'opt4', option: 'x = -2 e x = -3', isCorrect: false },
          ],
        },
        {
          id: 'q7',
          questionText: 'Calcule a área de um círculo com raio de 5 cm',
          description: 'Questão sobre área do círculo',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'geometria',
              topicId: 'areas',
              subtopicId: 'circulo',
              contentId: 'geometria',
            },
          ],
          options: [
            { id: 'opt1', option: '15π cm²', isCorrect: false },
            { id: 'opt2', option: '25π cm²', isCorrect: true },
            { id: 'opt3', option: '30π cm²', isCorrect: false },
            { id: 'opt4', option: '35π cm²', isCorrect: false },
          ],
        },
        {
          id: 'q8',
          questionText: 'Qual é a fórmula molecular da água?',
          description: 'Questão sobre fórmula molecular',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'quimica',
              subjectId: 'quimica-geral',
              topicId: 'formulas',
              subtopicId: 'molecular',
              contentId: 'quimica',
            },
          ],
          options: [
            { id: 'opt1', option: 'H₂O', isCorrect: true },
            { id: 'opt2', option: 'CO₂', isCorrect: false },
            { id: 'opt3', option: 'O₂', isCorrect: false },
            { id: 'opt4', option: 'H₂', isCorrect: false },
          ],
        },
        {
          id: 'q9',
          questionText: 'Qual é o pH de uma solução neutra?',
          description: 'Questão sobre pH',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'quimica',
              subjectId: 'quimica-geral',
              topicId: 'ph',
              subtopicId: 'escala',
              contentId: 'quimica',
            },
          ],
          options: [
            { id: 'opt1', option: 'pH = 0', isCorrect: false },
            { id: 'opt2', option: 'pH = 7', isCorrect: true },
            { id: 'opt3', option: 'pH = 14', isCorrect: false },
            { id: 'opt4', option: 'pH = 10', isCorrect: false },
          ],
        },
        {
          id: 'q10',
          questionText: 'Qual é a soma dos ângulos internos de um triângulo?',
          description: 'Questão sobre ângulos internos',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'geometria',
              topicId: 'angulos',
              subtopicId: 'internos',
              contentId: 'geometria',
            },
          ],
          options: [
            { id: 'opt1', option: '90°', isCorrect: false },
            { id: 'opt2', option: '270°', isCorrect: false },
            { id: 'opt3', option: '180°', isCorrect: true },
            { id: 'opt4', option: '360°', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    startQuiz();
  }, [setBySimulated, startQuiz, setUserId]);

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de QUIZ com navegação integrada
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizTitle />
          <QuizHeader />
          <QuizContent className="pb-[150px]" />
          <QuizFooter
            className="bottom-15"
            onGoToSimulated={() => {
              console.log('Navegando para simulados...');
            }}
            onDetailResult={() => {
              console.log('Detalhando resultado...');
            }}
          />
        </Quiz>
      </div>
    </div>
  );
};

export const QuizAlternativeVariants: Story = () => {
  const {
    setBySimulated,
    startQuiz,
    setUserAnswers,
    setUserId,
    setCurrentQuestion,
  } = useQuizStore();

  useEffect(() => {
    // Dados de exemplo para demonstrar a funcionalidade
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText:
            'Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos.',
          description: 'Questão sobre movimento uniformemente variado',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: true },
            { id: 'opt2', option: '30 metros', isCorrect: false },
            { id: 'opt3', option: '40 metros', isCorrect: false },
            { id: 'opt4', option: '50 metros', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText:
            'Uma partícula se move com velocidade constante de 10 m/s. Qual a distância percorrida em 3 segundos?',
          description: 'Questão sobre movimento uniforme',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'mu',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: false },
            { id: 'opt2', option: '30 metros', isCorrect: true },
            { id: 'opt3', option: '35 metros', isCorrect: false },
            { id: 'opt4', option: '45 metros', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    setCurrentQuestion(mockSimulado.questions[0]);
    startQuiz();

    setUserAnswers([
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz Alternative Variants
        </h1>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizHeaderResult />
          <QuizTitle />
          <QuizHeader />
          <QuizContent className="pb-[150px]" variant="result" />
          <QuizFooter className="bottom-15" />
        </Quiz>
      </div>
    </div>
  );
};

export const QuizMultipleChoiceVariants: Story = () => {
  const {
    setBySimulated,
    startQuiz,
    setUserAnswers,
    setUserId,
    setCurrentQuestion,
  } = useQuizStore();

  useEffect(() => {
    // Dados de exemplo para demonstrar a funcionalidade de múltipla escolha
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024 - Múltipla Escolha',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText:
            'Quais das seguintes opções são características de um movimento uniformemente variado? (Selecione todas as opções corretas)',
          description:
            'Questão sobre movimento uniformemente variado - múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
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
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Aceleração constante', isCorrect: true },
            { id: 'opt2', option: 'Velocidade variável', isCorrect: true },
            { id: 'opt3', option: 'Trajetória retilínea', isCorrect: true },
            { id: 'opt4', option: 'Velocidade constante', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText:
            'Quais das seguintes grandezas são vetoriais? (Selecione todas as opções corretas)',
          description: 'Questão sobre grandezas vetoriais - múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
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
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    setCurrentQuestion(mockSimulado.questions[0]);
    startQuiz();

    // Simular respostas do usuário para mostrar o resultado
    setUserAnswers([
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt1',
      },
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt2',
      },
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt4', // Resposta incorreta
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt1',
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt2',
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: null,
        optionId: 'opt3',
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz Multiple Choice Variants
        </h1>
        <p className="text-text-600 text-lg">
          Variantes de resultado para questões de múltipla escolha
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizHeaderResult />
          <QuizTitle />
          <QuizHeader />
          <QuizContent className="pb-[150px]" variant="result" />
          <QuizFooter className="bottom-15" />
        </Quiz>
      </div>
    </div>
  );
};

export const QuizListResultShowcase: Story = () => {
  const { setBySimulated, startQuiz, setUserAnswers, setUserId } =
    useQuizStore();

  useEffect(() => {
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1',
          description: 'Questão sobre física',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
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
          questionText: 'Questão de Física 2',
          description: 'Questão sobre física',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
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
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          questionText: 'Questão de Matemática 1',
          description: 'Questão sobre matemática',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
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
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q4',
          questionText: 'Questão de Química 1',
          description: 'Questão sobre química',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
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
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta correta', isCorrect: true },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    startQuiz();

    setUserAnswers([
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q3',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q4',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
      },
    ]);
  }, [setBySimulated, startQuiz, setUserAnswers, setUserId]);

  const handleSubjectClick = (subject: string) => {
    console.log('Matéria clicada:', subject);
  };

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz List Result
        </h1>
        <p className="text-text-600 text-lg">
          Lista de matérias com estatísticas de acertos e erros
        </p>
      </div>

      <div className="h-full">
        <QuizListResult onSubjectClick={handleSubjectClick} />
      </div>
    </div>
  );
};

/**
 * Story para testar todos os componentes de resultado juntos
 */
export const QuizResultPageShowcase: Story = () => {
  const { setBySimulated, startQuiz, setUserAnswers, finishQuiz, setUserId } =
    useQuizStore();

  useEffect(() => {
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado Enem #42',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1',
          description: 'Questão sobre física',
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
          questionText: 'Questão de Física 2',
          description: 'Questão sobre física',
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
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta correta', isCorrect: true },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          questionText: 'Questão de Matemática 1',
          description: 'Questão sobre matemática',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1',
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
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q4',
          questionText: 'Questão de Química 1',
          description: 'Questão sobre química',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt2',
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
          options: [
            { id: 'opt1', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta correta', isCorrect: true },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
        {
          id: 'q5',
          questionText: 'Questão de Física 3',
          description: 'Questão sobre física',
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
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    startQuiz();

    setUserAnswers([
      {
        questionId: 'q1',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q2',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q3',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
      {
        questionId: 'q4',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt2',
        optionId: 'opt2',
      },
      {
        questionId: 'q5',
        activityId: 'simulado-1',
        userId: 'demo-user-id',
        answer: 'opt1',
        optionId: 'opt1',
      },
    ]);

    finishQuiz();
  }, [setBySimulated, startQuiz, setUserAnswers, finishQuiz, setUserId]);

  const handleSubjectClick = (subject: string) => {
    console.log('Matéria clicada:', subject);
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6">
        {/* Header com título e badge */}
        <QuizResultHeaderTitle />

        <div>
          {/* Título do simulado */}
          <QuizResultTitle />

          {/* Seção de performance com ProgressCircle e ProgressBars */}
          <QuizResultPerformance />

          {/* Seção de matérias */}
          <QuizListResult onSubjectClick={handleSubjectClick} />
        </div>
      </div>
    </div>
  );
};

/**
 * Story para testar componentes individuais de resultado
 */
export const QuizResultComponentsShowcase: Story = () => {
  const { setBySimulated, startQuiz, selectAnswer, finishQuiz, setUserId } =
    useQuizStore();

  useEffect(() => {
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado Enem #42',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1',
          description: 'Questão sobre física',
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
          questionText: 'Questão de Matemática 1',
          description: 'Questão sobre matemática',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt2',
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
            { id: 'opt2', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt3', option: 'Resposta incorreta', isCorrect: false },
            { id: 'opt4', option: 'Resposta incorreta', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    startQuiz();

    selectAnswer('q1', 'opt1');
    selectAnswer('q2', 'opt2');

    finishQuiz();
  }, [setBySimulated, startQuiz, selectAnswer, finishQuiz, setUserId]);

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz Result Components
        </h1>
        <p className="text-text-600 text-lg">
          Componentes individuais de resultado de simulado
        </p>
      </div>

      <div className="space-y-8">
        {/* Header com título e badge */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">
            Header com Título e Badge
          </h2>
          <QuizResultHeaderTitle />
        </div>

        {/* Título do simulado */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Título do Simulado</h2>
          <QuizResultTitle />
        </div>

        {/* Performance com ProgressCircle e ProgressBars */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Performance</h2>
          <QuizResultPerformance />
        </div>

        {/* Lista de matérias */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Lista de Matérias</h2>
          <QuizListResult
            onSubjectClick={(subject) =>
              console.log('Matéria clicada:', subject)
            }
          />
        </div>
      </div>
    </div>
  );
};

export const QuizListResultByMateriaShowcase: Story = () => {
  const { setBySimulated, startQuiz, selectAnswer, finishQuiz, setUserId } =
    useQuizStore();

  useEffect(() => {
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText:
            'Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos.',
          description: 'Questão sobre movimento uniformemente variado',
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
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: true },
            { id: 'opt2', option: '30 metros', isCorrect: false },
            { id: 'opt3', option: '40 metros', isCorrect: false },
            { id: 'opt4', option: '50 metros', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText:
            'Uma partícula se move com velocidade constante de 10 m/s. Qual a distância percorrida em 3 segundos?',
          description: 'Questão sobre movimento uniforme',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'mu',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '25 metros', isCorrect: false },
            { id: 'opt2', option: '30 metros', isCorrect: true },
            { id: 'opt3', option: '35 metros', isCorrect: false },
            { id: 'opt4', option: '45 metros', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          questionText:
            'Um objeto é lançado verticalmente para cima com velocidade inicial de 20 m/s. Qual a altura máxima atingida? (Considere g = 10 m/s²)',
          description: 'Questão sobre lançamento vertical',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'DIFICIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'lancamento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: '15 metros', isCorrect: false },
            { id: 'opt2', option: '18 metros', isCorrect: false },
            { id: 'opt3', option: '20 metros', isCorrect: true },
            { id: 'opt4', option: '25 metros', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    startQuiz();

    selectAnswer('q1', 'opt1');
    selectAnswer('q2', 'opt3');
    selectAnswer('q3', 'opt3');

    finishQuiz();
  }, [setBySimulated, startQuiz, selectAnswer, finishQuiz, setUserId]);

  const handleQuestionClick = (question: Question) => {
    console.log('Questão clicada:', question);
  };

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz List Result By Materia
        </h1>
        <p className="text-text-600 text-lg">
          Componente para mostrar resultado de questões por matéria
        </p>
      </div>

      <div className="space-y-8">
        {/* Resultado por matéria */}
        <div className="border rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Resultado por Matéria</h2>
          <QuizListResultByMateria
            subject="mecanica"
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>
    </div>
  );
};

export const QuizMultipleChoiceShowcase: Story = () => {
  const { setBySimulated, startQuiz, setUserId, setCurrentQuestion } =
    useQuizStore();

  useEffect(() => {
    // Dados de exemplo para demonstrar a funcionalidade de múltipla escolha
    const mockSimulado = {
      id: 'simulado-1',
      title: 'Simulado ENEM 2024 - Múltipla Escolha',
      category: 'Enem',
      questions: [
        {
          id: 'q1',
          questionText:
            'Quais das seguintes opções são características de um movimento uniformemente variado? (Selecione todas as opções corretas)',
          description:
            'Questão sobre movimento uniformemente variado - múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
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
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Aceleração constante', isCorrect: true },
            { id: 'opt2', option: 'Velocidade variável', isCorrect: true },
            { id: 'opt3', option: 'Trajetória retilínea', isCorrect: true },
            { id: 'opt4', option: 'Velocidade constante', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText:
            'Quais das seguintes grandezas são vetoriais? (Selecione todas as opções corretas)',
          description: 'Questão sobre grandezas vetoriais - múltipla escolha',
          type: 'ALTERNATIVA' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'FACIL' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
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
        {
          id: 'q3',
          questionText:
            'Quais das seguintes equações são do segundo grau? (Selecione todas as opções corretas)',
          description:
            'Questão sobre equações do segundo grau - múltipla escolha',
          type: 'MULTIPLA_CHOICE' as QUESTION_TYPE,
          status: 'APROVADO' as QUESTION_STATUS,
          difficulty: 'MEDIO' as QUESTION_DIFFICULTY,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          institutionIds: ['inst1', 'inst2'],
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'algebra',
              topicId: 'equacoes',
              subtopicId: 'segundo-grau',
              contentId: 'algebra',
            },
          ],
          options: [
            { id: 'opt1', option: 'x² - 5x + 6 = 0', isCorrect: true },
            { id: 'opt2', option: '2x² + 3x - 1 = 0', isCorrect: true },
            { id: 'opt3', option: 'x + 2 = 0', isCorrect: false },
            { id: 'opt4', option: 'x³ - 2x = 0', isCorrect: false },
          ],
        },
      ],
    };

    setUserId('demo-user-id');
    setBySimulated(mockSimulado);
    setCurrentQuestion(mockSimulado.questions[0]);
    startQuiz();
  }, [setBySimulated, startQuiz, setUserId, setCurrentQuestion]);

  return (
    <div className="space-y-12 h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Quiz Multiple Choice
        </h1>
        <p className="text-text-600 text-lg">
          Componente para questões de múltipla escolha
        </p>
      </div>

      <div className="flex flex-col gap-2 h-full pb-15">
        <Quiz>
          <QuizTitle />
          <QuizHeader />
          <QuizContent className="pb-[150px]" />
          <QuizFooter
            className="bottom-15"
            onGoToSimulated={() => {
              console.log('Navegando para simulados...');
            }}
            onDetailResult={() => {
              console.log('Detalhando resultado...');
            }}
          />
        </Quiz>
      </div>
    </div>
  );
};
