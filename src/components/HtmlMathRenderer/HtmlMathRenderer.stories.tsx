import type { Story } from '@ladle/react';
import HtmlMathRenderer from './HtmlMathRenderer';

/**
 * Default HtmlMathRenderer story
 */
export const Default: Story = () => (
  <HtmlMathRenderer content="<p>The famous equation is $E = mc^2$</p>" />
);

/**
 * Plain HTML content without math
 */
export const PlainHTML: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer content="<p>This is a <strong>bold</strong> text with <em>italic</em> styling.</p>" />
    <HtmlMathRenderer content="<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>" />
    <HtmlMathRenderer content="<p>Paragraph with <a href='#'>link</a> inside.</p>" />
  </div>
);

/**
 * Inline math with dollar signs
 */
export const InlineMath: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer content="<p>Simple inline: $a + b = c$</p>" />
    <HtmlMathRenderer content="<p>With fractions: $\frac{a}{b} + \frac{c}{d}$</p>" />
    <HtmlMathRenderer content="<p>With square root: $\sqrt{x^2 + y^2}$</p>" />
    <HtmlMathRenderer content="<p>Greek letters: $\alpha + \beta + \gamma$</p>" />
    <HtmlMathRenderer content="<p>Subscripts and superscripts: $x_1^2 + x_2^2$</p>" />
  </div>
);

/**
 * Block math with double dollar signs
 */
export const BlockMath: Story = () => (
  <div className="flex flex-col gap-6">
    <HtmlMathRenderer content="<p>Simple equation:</p> $$E = mc^2$$" />
    <HtmlMathRenderer content="<p>Summation:</p> $$\sum_{i=1}^{n} x_i$$" />
    <HtmlMathRenderer content="<p>Integral:</p> $$\int_0^1 f(x)dx$$" />
    <HtmlMathRenderer content="<p>Fraction:</p> $$\frac{a + b}{c + d}$$" />
  </div>
);

/**
 * Matrix examples - common in math questions
 */
export const Matrices: Story = () => (
  <div className="flex flex-col gap-6">
    <HtmlMathRenderer content="<p>2x2 Matrix:</p> $$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$" />
    <HtmlMathRenderer content="<p>3x3 Matrix:</p> $$\begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \\ 7 & 8 & 9 \end{pmatrix}$$" />
    <HtmlMathRenderer content="<p>Bracket Matrix:</p> $$\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}$$" />
    <HtmlMathRenderer content="<p>Determinant:</p> $$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$$" />
  </div>
);

/**
 * LaTeX environments
 */
export const LaTeXEnvironments: Story = () => (
  <div className="flex flex-col gap-6">
    <HtmlMathRenderer content="\begin{equation}E = mc^2\end{equation}" />
    <HtmlMathRenderer content="\begin{align} x + y &= 5 \\ x - y &= 1 \end{align}" />
    <HtmlMathRenderer content="\begin{cases} x + y = 10 \\ x - y = 2 \end{cases}" />
  </div>
);

/**
 * Real question example - Physics (Movimento Uniforme)
 */
export const QuestionPhysics: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>Um carro se move em linha reta com velocidade constante de $v = 20 \\, m/s$. Calcule a distância percorrida após $t = 5 \\, s$.</p>
<p>Use a fórmula do movimento uniforme:</p>
$$S = S_0 + v \\cdot t$$
<p>Onde:</p>
<ul>
<li>$S$ é a posição final</li>
<li>$S_0$ é a posição inicial</li>
<li>$v$ é a velocidade</li>
<li>$t$ é o tempo</li>
</ul>`}
      className="text-text-950"
    />
  </div>
);

/**
 * Real question example - Mathematics (Quadratic equation)
 */
export const QuestionMath: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>Resolva a equação quadrática:</p>
$$x^2 - 5x + 6 = 0$$
<p>Utilizando a fórmula de Bhaskara:</p>
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
<p>Onde $a = 1$, $b = -5$ e $c = 6$.</p>`}
      className="text-text-950"
    />
  </div>
);

/**
 * Real question example - Chemistry
 */
export const QuestionChemistry: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>A reação de combustão do metano é representada por:</p>
$$CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$$
<p>Calcule a quantidade de $CO_2$ produzida quando $16g$ de metano são queimados completamente.</p>
<p><strong>Dados:</strong></p>
<ul>
<li>Massa molar do $CH_4$: $16 \\, g/mol$</li>
<li>Massa molar do $CO_2$: $44 \\, g/mol$</li>
</ul>`}
      className="text-text-950"
    />
  </div>
);

/**
 * Complex real-world example from backend
 * This matches the format commonly received from the API
 */
export const RealBackendContent: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>Considere a matriz $A$ definida como:</p>
$$A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$$
<p>E a matriz $B$ definida como:</p>
$$B = \\begin{pmatrix} 1 & 0 \\\\ 2 & 1 \\end{pmatrix}$$
<p>Calcule o produto $A \\cdot B$ e determine o <strong>determinante</strong> da matriz resultante.</p>
<p><em>Dica: O determinante de uma matriz $2 \\times 2$ é dado por:</em></p>
$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$`}
      className="text-text-950"
    />
  </div>
);

/**
 * Editor format (spans with data attributes)
 */
export const EditorFormat: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer content='<p>Formula: <span class="math-formula" data-latex="E = mc^2">E = mc²</span></p>' />
    <HtmlMathRenderer content='<p>Fraction: <span class="math-formula" data-latex="\frac{a}{b}">a/b</span></p>' />
    <HtmlMathRenderer content='<p>Block formula:</p><span class="math-formula" data-latex="\sum_{i=1}^{n} x_i" data-display-mode="true">Σx</span>' />
  </div>
);

/**
 * LaTeX tag format
 */
export const LaTeXTagFormat: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer content="<p>Using tags: <latex>E = mc^2</latex></p>" />
    <HtmlMathRenderer content="<p>Multiple: <latex>a + b</latex> and <latex>x - y</latex></p>" />
    <HtmlMathRenderer content="<p>Complex: <latex>\frac{\pi}{2}</latex></p>" />
  </div>
);

/**
 * Mixed HTML and math content
 */
export const MixedContent: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer
      content={`<p>O teorema de Pitágoras afirma que em um triângulo retângulo:</p>
<blockquote>A soma dos quadrados dos catetos é igual ao quadrado da hipotenusa.</blockquote>
$$a^2 + b^2 = c^2$$
<p>Onde $c$ representa a <strong>hipotenusa</strong> e $a$, $b$ são os <em>catetos</em>.</p>`}
    />
  </div>
);

/**
 * Question with image placeholder and math
 */
export const QuestionWithImageDescription: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>Observe a figura abaixo que representa um triângulo ABC:</p>
<p><em>[Imagem do triângulo ABC com lados a, b, c]</em></p>
<p>Sabendo que o ângulo $\\hat{A} = 60°$ e os lados $b = 5$ cm e $c = 7$ cm, calcule o lado $a$ usando a <strong>Lei dos Cossenos</strong>:</p>
$$a^2 = b^2 + c^2 - 2bc \\cdot \\cos(A)$$`}
      className="text-text-950"
    />
  </div>
);

/**
 * Statistics question
 */
export const QuestionStatistics: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>A tabela abaixo mostra as notas de 10 alunos em uma prova:</p>
<table border="1" style="margin: 10px 0;">
<tr><th>Aluno</th><th>Nota</th></tr>
<tr><td>1</td><td>7.5</td></tr>
<tr><td>2</td><td>8.0</td></tr>
<tr><td>3</td><td>6.5</td></tr>
<tr><td>...</td><td>...</td></tr>
</table>
<p>Calcule:</p>
<ol>
<li>A <strong>média aritmética</strong>: $\\bar{x} = \\frac{\\sum x_i}{n}$</li>
<li>O <strong>desvio padrão</strong>: $\\sigma = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n}}$</li>
</ol>`}
      className="text-text-950"
    />
  </div>
);

/**
 * Custom styling
 */
export const CustomStyling: Story = () => (
  <div className="flex flex-col gap-4">
    <HtmlMathRenderer content="<p>Default styling: $E = mc^2$</p>" />
    <HtmlMathRenderer
      content="<p>With custom class: $E = mc^2$</p>"
      className="text-blue-600 font-bold"
    />
    <HtmlMathRenderer
      content="<p>With custom style: $E = mc^2$</p>"
      style={{
        backgroundColor: '#f0f0f0',
        padding: '16px',
        borderRadius: '8px',
      }}
    />
  </div>
);

/**
 * Empty and null content handling
 */
export const EdgeCases: Story = () => (
  <div className="flex flex-col gap-4">
    <div className="p-2 border rounded">
      <p className="text-sm text-gray-500 mb-2">Empty string:</p>
      <HtmlMathRenderer content="" />
    </div>
    <div className="p-2 border rounded">
      <p className="text-sm text-gray-500 mb-2">Plain text only:</p>
      <HtmlMathRenderer content="Just plain text without any math or HTML" />
    </div>
    <div className="p-2 border rounded">
      <p className="text-sm text-gray-500 mb-2">Only math:</p>
      <HtmlMathRenderer content="$x^2 + y^2 = z^2$" />
    </div>
  </div>
);

/**
 * ENEM-style question example
 */
export const ENEMQuestion: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200 max-w-3xl">
    <HtmlMathRenderer
      content={`<p><strong>(ENEM 2023)</strong> Um fabricante de caixas d'água precisa construir um reservatório cilíndrico com capacidade para $1000$ litros de água. O custo do material para a base e a tampa é de R$ 50,00 por metro quadrado, e o custo do material para a lateral é de R$ 30,00 por metro quadrado.</p>

<p>Considerando que o volume de um cilindro é dado por $V = \\pi r^2 h$, onde $r$ é o raio da base e $h$ é a altura, e que $1$ litro equivale a $0,001 \\, m^3$, determine as dimensões do cilindro que minimizam o custo total do material.</p>

<p><strong>Dados:</strong></p>
<ul>
<li>Área da base/tampa: $A_{base} = \\pi r^2$</li>
<li>Área lateral: $A_{lat} = 2\\pi rh$</li>
<li>$\\pi \\approx 3,14$</li>
</ul>`}
      className="text-text-950"
    />
  </div>
);

/**
 * Trigonometry question
 */
export const TrigonometryQuestion: Story = () => (
  <div className="p-4 bg-background rounded-lg border border-border-200">
    <HtmlMathRenderer
      content={`<p>Determine o valor de $x$ na equação trigonométrica:</p>
$$\\sin(2x) + \\cos(x) = 0$$
<p>Para $0 \\leq x < 2\\pi$.</p>
<p><em>Lembre-se da identidade:</em> $\\sin(2x) = 2\\sin(x)\\cos(x)$</p>`}
      className="text-text-950"
    />
  </div>
);

/**
 * All supported formats demonstration
 */
export const AllFormats: Story = () => (
  <div className="flex flex-col gap-6">
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">1. Inline with $</h3>
      <HtmlMathRenderer content="<p>Formula: $E = mc^2$</p>" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">2. Block with $$</h3>
      <HtmlMathRenderer content="$$\sum_{i=1}^{n} x_i$$" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">3. LaTeX tags</h3>
      <HtmlMathRenderer content="<p>Result: <latex>E = mc^2</latex></p>" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">4. LaTeX environment</h3>
      <HtmlMathRenderer content="\begin{pmatrix} a & b \\ c & d \end{pmatrix}" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">
        5. Editor format (math-formula span)
      </h3>
      <HtmlMathRenderer content='<span class="math-formula" data-latex="E = mc^2">E = mc²</span>' />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">6. Pure HTML</h3>
      <HtmlMathRenderer content="<p><strong>Bold</strong> and <em>italic</em> text</p>" />
    </div>
  </div>
);
