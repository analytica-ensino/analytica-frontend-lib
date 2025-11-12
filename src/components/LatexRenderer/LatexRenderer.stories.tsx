import type { Story } from '@ladle/react';
import LatexRenderer from './LatexRenderer';

/**
 * Default LaTeX renderer story
 */
export const Default: Story = () => (
  <LatexRenderer content="The famous equation is $E = mc^2$" />
);

/**
 * Inline math with dollar signs
 */
export const InlineMath: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Simple inline: $a + b = c$" />
    <LatexRenderer content="With fractions: $\frac{a}{b} + \frac{c}{d}$" />
    <LatexRenderer content="With square root: $\sqrt{x^2 + y^2}$" />
    <LatexRenderer content="Greek letters: $\alpha + \beta + \gamma$" />
    <LatexRenderer content="Subscripts and superscripts: $x_1^2 + x_2^2$" />
  </div>
);

/**
 * Block math with double dollar signs
 */
export const BlockMath: Story = () => (
  <div className="flex flex-col gap-6">
    <LatexRenderer content="Simple equation: $$E = mc^2$$" />
    <LatexRenderer content="Summation: $$\sum_{i=1}^{n} x_i$$" />
    <LatexRenderer content="Integral: $$\int_0^1 f(x)dx$$" />
    <LatexRenderer content="Fraction: $$\frac{a + b}{c + d}$$" />
    <LatexRenderer content="Limit: $$\lim_{x \to \infty} f(x)$$" />
  </div>
);

/**
 * LaTeX tag format
 */
export const LaTeXTagFormat: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Using tags: <latex>E = mc^2</latex>" />
    <LatexRenderer content="Multiple: <latex>a + b</latex> and <latex>x - y</latex>" />
    <LatexRenderer content="Complex: <latex>\frac{\pi}{2}</latex>" />
  </div>
);

/**
 * LaTeX environments
 */
export const LaTeXEnvironments: Story = () => (
  <div className="flex flex-col gap-6">
    <LatexRenderer content="\begin{equation}E = mc^2\end{equation}" />
    <LatexRenderer content="\begin{pmatrix} a & b \\ c & d \end{pmatrix}" />
    <LatexRenderer content="\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}" />
    <LatexRenderer content="\begin{align} x + y &= 5 \\ x - y &= 1 \end{align}" />
  </div>
);

/**
 * Mixed content with text and math
 */
export const MixedContent: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ where $a \neq 0$." />
    <LatexRenderer content="<p>Einstein's famous equation $$E = mc^2$$ relates energy and mass.</p>" />
    <LatexRenderer content="Pythagorean theorem: $a^2 + b^2 = c^2$ for right triangles. More details: $$c = \sqrt{a^2 + b^2}$$" />
  </div>
);

/**
 * Complex mathematical expressions
 */
export const ComplexMath: Story = () => (
  <div className="flex flex-col gap-6">
    <LatexRenderer content="Taylor series: $$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$$" />
    <LatexRenderer content="Matrix multiplication: $$\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}$$" />
    <LatexRenderer content="Binomial theorem: $$(x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^{n-k} y^k$$" />
    <LatexRenderer content="Fourier transform: $$\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} dx$$" />
  </div>
);

/**
 * Trigonometric functions
 */
export const TrigonometricFunctions: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Sine: $\sin(x)$" />
    <LatexRenderer content="Cosine: $\cos(x)$" />
    <LatexRenderer content="Tangent: $\tan(x) = \frac{\sin(x)}{\cos(x)}$" />
    <LatexRenderer content="Identity: $$\sin^2(x) + \cos^2(x) = 1$$" />
    <LatexRenderer content="Euler's formula: $$e^{ix} = \cos(x) + i\sin(x)$$" />
  </div>
);

/**
 * Calculus expressions
 */
export const Calculus: Story = () => (
  <div className="flex flex-col gap-6">
    <LatexRenderer content="Derivative: $$\frac{d}{dx}f(x)$$" />
    <LatexRenderer content="Partial derivative: $$\frac{\partial f}{\partial x}$$" />
    <LatexRenderer content="Definite integral: $$\int_a^b f(x)dx$$" />
    <LatexRenderer content="Double integral: $$\iint_D f(x,y)dxdy$$" />
    <LatexRenderer content="Limit definition: $$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$" />
  </div>
);

/**
 * Set theory and logic
 */
export const SetTheory: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Set notation: $A = \{1, 2, 3, 4, 5\}$" />
    <LatexRenderer content="Union: $A \cup B$" />
    <LatexRenderer content="Intersection: $A \cap B$" />
    <LatexRenderer content="Subset: $A \subseteq B$" />
    <LatexRenderer content="For all: $\forall x \in A$" />
    <LatexRenderer content="There exists: $\exists x \in A$" />
  </div>
);

/**
 * Editor format (spans with data attributes)
 */
export const EditorFormat: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content='<span class="math-formula" data-latex="E = mc^2">E = mc^2</span>' />
    <LatexRenderer content='<span class="math-formula" data-latex="\frac{a}{b}" data-display-mode="false">\frac{a}{b}</span>' />
    <LatexRenderer content='<span class="math-formula" data-latex="\sum_{i=1}^{n} x_i" data-display-mode="true">\sum_{i=1}^{n} x_i</span>' />
  </div>
);

/**
 * HTML mixed with LaTeX
 */
export const HTMLContent: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="<p>The equation $E = mc^2$ is famous.</p>" />
    <LatexRenderer content="<div><h3>Title</h3><p>Formula: $a + b = c$</p></div>" />
    <LatexRenderer content="<ul><li>First: $x^2$</li><li>Second: $y^2$</li></ul>" />
    <LatexRenderer content="<strong>Bold text</strong> with formula: $\pi \approx 3.14159$" />
  </div>
);

/**
 * Custom styling
 */
export const CustomStyling: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Default styling: $E = mc^2$" />
    <LatexRenderer
      content="With custom class: $E = mc^2$"
      className="text-blue-600 font-bold"
    />
    <LatexRenderer
      content="With custom style: $E = mc^2$"
      style={{
        backgroundColor: '#f0f0f0',
        padding: '16px',
        borderRadius: '8px',
      }}
    />
  </div>
);

/**
 * Custom error handling
 */
export const CustomErrorHandling: Story = () => (
  <div className="flex flex-col gap-4">
    <LatexRenderer content="Valid: $E = mc^2$" />
    <LatexRenderer
      content="Invalid: $\invalidcommand$"
      onError={(latex) => (
        <span style={{ color: 'orange', fontWeight: 'bold' }}>
          Custom error for: {latex}
        </span>
      )}
    />
  </div>
);

/**
 * Real world example - Physics
 */
export const PhysicsExample: Story = () => (
  <LatexRenderer
    content={`
      <h2>Newton's Second Law</h2>
      <p>The relationship between force, mass, and acceleration is given by:</p>
      $$F = ma$$
      <p>Where:</p>
      <ul>
        <li>$F$ is the force in Newtons</li>
        <li>$m$ is the mass in kilograms</li>
        <li>$a$ is the acceleration in m/s²</li>
      </ul>
    `}
  />
);

/**
 * Real world example - Statistics
 */
export const StatisticsExample: Story = () => (
  <LatexRenderer
    content={`
      <h2>Normal Distribution</h2>
      <p>The probability density function of the normal distribution is:</p>
      $$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}$$
      <p>Where $\\mu$ is the mean and $\\sigma$ is the standard deviation.</p>
    `}
  />
);

/**
 * Real world example - Chemistry
 */
export const ChemistryExample: Story = () => (
  <LatexRenderer
    content={`
      <h2>Ideal Gas Law</h2>
      <p>The ideal gas law relates pressure, volume, and temperature:</p>
      $$PV = nRT$$
      <p>Where:</p>
      <ul>
        <li>$P$ is the pressure</li>
        <li>$V$ is the volume</li>
        <li>$n$ is the number of moles</li>
        <li>$R$ is the gas constant</li>
        <li>$T$ is the temperature in Kelvin</li>
      </ul>
    `}
  />
);

/**
 * All formats combined
 */
export const AllFormats: Story = () => (
  <div className="flex flex-col gap-6">
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">Inline with $</h3>
      <LatexRenderer content="Formula: $E = mc^2$" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">Block with $$</h3>
      <LatexRenderer content="$$\sum_{i=1}^{n} x_i$$" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">LaTeX tags</h3>
      <LatexRenderer content="<latex>E = mc^2</latex>" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">Environment</h3>
      <LatexRenderer content="\begin{pmatrix} a & b \\ c & d \end{pmatrix}" />
    </div>

    <div className="p-4 bg-gray-50 rounded">
      <h3 className="text-lg font-bold mb-2">Editor format</h3>
      <LatexRenderer content='<span class="math-formula" data-latex="E = mc^2">E = mc^2</span>' />
    </div>
  </div>
);
