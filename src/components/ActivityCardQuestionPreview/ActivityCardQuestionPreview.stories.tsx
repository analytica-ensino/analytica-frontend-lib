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

/**
 * Question with inline LaTeX math expressions
 */
export const WithInlineMath: Story = () => {
  const { isDark } = useTheme();

  const mathStatement =
    '<p>Um carro se move em linha reta com velocidade constante de $v = 20 \\, m/s$. Calcule a distância percorrida após $t = 5 \\, s$.</p>';

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Preview com LaTeX inline
      </h2>

      <ActivityCardQuestionPreview
        subjectName="Física - Movimento Uniforme"
        subjectColor="#EF4444"
        iconName="Atom"
        isDark={isDark}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        enunciado={mathStatement}
        position={1}
        value="fisica-mu"
      />
    </div>
  );
};

/**
 * Question with block math (equations)
 */
export const WithBlockMath: Story = () => {
  const { isDark } = useTheme();

  const blockMathStatement = `<p>Resolva a equação quadrática:</p>
$$x^2 - 5x + 6 = 0$$
<p>Utilizando a fórmula de Bhaskara:</p>
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`;

  const alternatives: Alternative[] = [
    { value: 'a', label: '$x = 2$ e $x = 3$', status: 'correct' },
    { value: 'b', label: '$x = -2$ e $x = -3$' },
    { value: 'c', label: '$x = 1$ e $x = 6$' },
    { value: 'd', label: '$x = -1$ e $x = -6$' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Preview com equações em bloco
      </h2>

      <ActivityCardQuestionPreview
        subjectName="Matemática - Equações"
        subjectColor="#3B82F6"
        iconName="Calculator"
        isDark={isDark}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        enunciado={blockMathStatement}
        position={2}
        question={{
          options: alternatives.map((a) => ({ id: a.value, option: a.label })),
          correctOptionIds: ['a'],
        }}
        value="mat-bhaskara"
      />
    </div>
  );
};

/**
 * Question with matrix (common in linear algebra)
 */
export const WithMatrix: Story = () => {
  const { isDark } = useTheme();

  const matrixStatement = `<p>Considere a matriz $A$ definida como:</p>
$$A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$$
<p>E a matriz $B$ definida como:</p>
$$B = \\begin{pmatrix} 1 & 0 \\\\ 2 & 1 \\end{pmatrix}$$
<p>Calcule o produto $A \\cdot B$ e determine o <strong>determinante</strong> da matriz resultante.</p>`;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">Preview com matrizes</h2>

      <ActivityCardQuestionPreview
        subjectName="Matemática - Álgebra Linear"
        subjectColor="#8B5CF6"
        iconName="Grid"
        isDark={isDark}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        enunciado={matrixStatement}
        position={3}
        value="mat-matriz"
      />
    </div>
  );
};

/**
 * Question with HTML formatting and math
 */
export const WithHTMLAndMath: Story = () => {
  const { isDark } = useTheme();

  const htmlMathStatement = `<p>A reação de combustão do metano é representada por:</p>
$$CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$$
<p>Calcule a quantidade de $CO_2$ produzida quando $16g$ de metano são queimados completamente.</p>
<p><strong>Dados:</strong></p>
<ul>
<li>Massa molar do $CH_4$: $16 \\, g/mol$</li>
<li>Massa molar do $CO_2$: $44 \\, g/mol$</li>
</ul>`;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Preview com HTML e LaTeX combinados
      </h2>

      <ActivityCardQuestionPreview
        subjectName="Química - Estequiometria"
        subjectColor="#10B981"
        iconName="Flask"
        isDark={isDark}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        enunciado={htmlMathStatement}
        position={4}
        value="quim-estequiometria"
      />
    </div>
  );
};

/**
 * ENEM-style question with complex content
 */
export const ENEMStyleQuestion: Story = () => {
  const { isDark } = useTheme();

  const enemStatement = `<p><strong>(ENEM 2023)</strong> Um fabricante de caixas d'água precisa construir um reservatório cilíndrico com capacidade para $1000$ litros de água. O custo do material para a base e a tampa é de R$ 50,00 por metro quadrado, e o custo do material para a lateral é de R$ 30,00 por metro quadrado.</p>
<p>Considerando que o volume de um cilindro é dado por $V = \\pi r^2 h$, onde $r$ é o raio da base e $h$ é a altura, e que $1$ litro equivale a $0,001 \\, m^3$, determine as dimensões do cilindro que minimizam o custo total do material.</p>
<p><strong>Dados:</strong></p>
<ul>
<li>Área da base/tampa: $A_{base} = \\pi r^2$</li>
<li>Área lateral: $A_{lat} = 2\\pi rh$</li>
<li>$\\pi \\approx 3,14$</li>
</ul>`;

  const alternatives: Alternative[] = [
    {
      value: 'a',
      label: '$r \\approx 0,54m$ e $h \\approx 1,08m$',
      status: 'correct',
    },
    { value: 'b', label: '$r \\approx 0,40m$ e $h \\approx 2,00m$' },
    { value: 'c', label: '$r \\approx 0,60m$ e $h \\approx 0,88m$' },
    { value: 'd', label: '$r \\approx 0,50m$ e $h \\approx 1,27m$' },
    { value: 'e', label: '$r \\approx 0,70m$ e $h \\approx 0,65m$' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">Questão estilo ENEM</h2>

      <ActivityCardQuestionPreview
        subjectName="Matemática - Geometria"
        subjectColor="#F59E0B"
        iconName="Cylinder"
        isDark={isDark}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        enunciado={enemStatement}
        position={5}
        question={{
          options: alternatives.map((a) => ({ id: a.value, option: a.label })),
          correctOptionIds: ['a'],
        }}
        value="enem-geometria"
      />
    </div>
  );
};

/**
 * Trigonometry question
 */
export const TrigonometryQuestion: Story = () => {
  const { isDark } = useTheme();

  const trigStatement = `<p>Determine o valor de $x$ na equação trigonométrica:</p>
$$\\sin(2x) + \\cos(x) = 0$$
<p>Para $0 \\leq x < 2\\pi$.</p>
<p><em>Lembre-se da identidade:</em> $\\sin(2x) = 2\\sin(x)\\cos(x)$</p>`;

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Questão de Trigonometria
      </h2>

      <ActivityCardQuestionPreview
        subjectName="Matemática - Trigonometria"
        subjectColor="#EC4899"
        iconName="CircleHalf"
        isDark={isDark}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        enunciado={trigStatement}
        position={6}
        value="mat-trig"
      />
    </div>
  );
};

/**
 * Multiple questions with different math content
 */
export const MultipleQuestionsWithMath: Story = () => {
  const { isDark } = useTheme();

  const questions = [
    {
      subject: 'Física',
      color: '#EF4444',
      icon: 'Atom',
      enunciado:
        '<p>Calcule a energia cinética de um objeto com massa $m = 5kg$ e velocidade $v = 10m/s$.</p><p>Use a fórmula: $E_c = \\frac{1}{2}mv^2$</p>',
      position: 1,
    },
    {
      subject: 'Matemática',
      color: '#3B82F6',
      icon: 'Calculator',
      enunciado: '<p>Calcule a integral definida:</p>$$\\int_0^1 x^2 dx$$',
      position: 2,
    },
    {
      subject: 'Química',
      color: '#10B981',
      icon: 'Flask',
      enunciado:
        '<p>Balanceie a equação química:</p>$$Fe + O_2 \\rightarrow Fe_2O_3$$',
      position: 3,
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-text-900">
        Múltiplas questões com conteúdo matemático
      </h2>

      {questions.map((q, index) => (
        <ActivityCardQuestionPreview
          key={index}
          subjectName={q.subject}
          subjectColor={q.color}
          iconName={q.icon}
          isDark={isDark}
          questionType={QUESTION_TYPE.DISSERTATIVA}
          enunciado={q.enunciado}
          position={q.position}
          value={`question-${index}`}
        />
      ))}
    </div>
  );
};
