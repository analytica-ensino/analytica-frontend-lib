import { useState, useEffect, ChangeEvent } from 'react';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import Menu, { MenuContent, MenuItem } from '../../Menu/Menu';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import TextArea from '../../TextArea/TextArea';
import { Sparkle } from 'phosphor-react';
import { useMobile } from '../../../hooks/useMobile';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onInsert: (latex: string) => void;
  /**
   * Optional callback to generate LaTeX using AI
   * If provided, the AI generation feature will be enabled
   * @param description - Natural language description of the formula
   * @returns Promise resolving to the LaTeX string
   */
  readonly onGenerateWithAI?: (description: string) => Promise<string>;
}

type FormulaCategory = 'matematica' | 'fisica' | 'quimica' | 'simbolos';

interface FormulaItem {
  label: string;
  latex: string;
  preview: string;
}

const formulas: Record<FormulaCategory, FormulaItem[]> = {
  matematica: [
    {
      label: 'Teorema de Pitágoras',
      latex: 'a^2 + b^2 = c^2',
      preview: 'a² + b² = c²',
    },
    {
      label: 'Equação de 2º grau',
      latex: String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`,
      preview: 'x = (-b ± √(b² - 4ac)) / 2a',
    },
    {
      label: 'Área do círculo',
      latex: String.raw`A = \pi r^2`,
      preview: 'A = πr²',
    },
    {
      label: 'Área do triângulo',
      latex: String.raw`A = \frac{b \cdot h}{2}`,
      preview: 'A = (b · h) / 2',
    },
    {
      label: 'Volume do cilindro',
      latex: String.raw`V = \pi r^2 h`,
      preview: 'V = πr²h',
    },
    {
      label: 'Volume da esfera',
      latex: String.raw`V = \frac{4}{3} \pi r^3`,
      preview: 'V = (4/3)πr³',
    },
  ],
  fisica: [
    {
      label: 'Velocidade média',
      latex: String.raw`v = \frac{\Delta s}{\Delta t}`,
      preview: 'v = Δs / Δt',
    },
    {
      label: 'Aceleração',
      latex: String.raw`a = \frac{\Delta v}{\Delta t}`,
      preview: 'a = Δv / Δt',
    },
    {
      label: 'Força (2ª Lei de Newton)',
      latex: String.raw`F = m \cdot a`,
      preview: 'F = m · a',
    },
    {
      label: 'Energia cinética',
      latex: String.raw`E_c = \frac{1}{2} m v^2`,
      preview: 'Ec = ½mv²',
    },
    {
      label: 'Energia potencial',
      latex: String.raw`E_p = m \cdot g \cdot h`,
      preview: 'Ep = m · g · h',
    },
    {
      label: 'Lei da Gravitação',
      latex: String.raw`F = G \frac{m_1 m_2}{r^2}`,
      preview: 'F = G(m₁m₂)/r²',
    },
  ],
  quimica: [
    {
      label: 'Concentração molar',
      latex: String.raw`C = \frac{n}{V}`,
      preview: 'C = n / V',
    },
    {
      label: 'Densidade',
      latex: String.raw`\rho = \frac{m}{V}`,
      preview: 'ρ = m / V',
    },
    {
      label: 'pH',
      latex: String.raw`pH = -\log[H^+]`,
      preview: 'pH = -log[H⁺]',
    },
    { label: 'Lei dos gases ideais', latex: 'PV = nRT', preview: 'PV = nRT' },
    {
      label: 'Equação de Arrhenius',
      latex: String.raw`k = A e^{-\frac{E_a}{RT}}`,
      preview: 'k = Ae^(-Ea/RT)',
    },
    {
      label: 'Número de mols',
      latex: String.raw`n = \frac{m}{M}`,
      preview: 'n = m / M',
    },
  ],
  simbolos: [
    { label: 'Alfa', latex: String.raw`\alpha`, preview: 'α' },
    { label: 'Beta', latex: String.raw`\beta`, preview: 'β' },
    { label: 'Gama', latex: String.raw`\gamma`, preview: 'γ' },
    { label: 'Delta', latex: String.raw`\Delta`, preview: 'Δ' },
    { label: 'Pi', latex: String.raw`\pi`, preview: 'π' },
    { label: 'Sigma', latex: String.raw`\sigma`, preview: 'σ' },
    { label: 'Omega', latex: String.raw`\omega`, preview: 'ω' },
    { label: 'Infinito', latex: String.raw`\infty`, preview: '∞' },
    { label: 'Somatório', latex: String.raw`\sum`, preview: 'Σ' },
    { label: 'Integral', latex: String.raw`\int`, preview: '∫' },
    { label: 'Raiz quadrada', latex: String.raw`\sqrt{}`, preview: '√' },
    { label: 'Fração', latex: String.raw`\frac{}{}`, preview: 'a/b' },
  ],
};

const categoryLabels: Record<FormulaCategory, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  simbolos: 'Símbolos',
};

export function FormulaDialog({
  open,
  onClose,
  onInsert,
  onGenerateWithAI,
}: FormulaDialogProps) {
  const { isTablet } = useMobile();
  const [category, setCategory] = useState<FormulaCategory>('matematica');
  const [latex, setLatex] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (!latex.trim()) {
      setPreview('');
      setError('');
      return;
    }
    try {
      const rendered = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: false,
      });
      setPreview(rendered);
      setError('');
    } catch {
      setError('Fórmula inválida');
      setPreview('');
    }
  }, [latex]);

  const handleInsert = () => {
    if (!latex.trim() || error) return;
    onInsert(latex);
    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setLatex('');
    setError('');
    setPreview('');
    setAiDescription('');
    setAiError('');
    setCategory('matematica');
  };

  const handleGenerateWithAI = async () => {
    if (!onGenerateWithAI || !aiDescription.trim()) return;

    setIsGeneratingAI(true);
    setAiError('');

    try {
      const generatedLatex = await onGenerateWithAI(aiDescription.trim());
      setLatex(generatedLatex);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : 'Erro ao gerar fórmula com IA'
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const selectFormula = (formula: FormulaItem) => {
    setLatex(formula.latex);
  };

  const renderPreview = () => {
    if (error) {
      return <p className="text-sm text-error-600">{error}</p>;
    }
    if (preview) {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: preview }}
          className="text-lg"
        />
      );
    }
    return (
      <p className="text-sm text-text-300 text-center">
        Selecione uma fórmula ou símbolo, insira o código LaTeX, ou crie sua
        fórmula com a IA e ela aparecerá aqui.
      </p>
    );
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Inserir fórmula"
      size="xl"
      className={isTablet ? 'max-w-[90vw] max-h-[90vh] overflow-y-auto' : ''}
      footer={
        <>
          <Button
            variant="outline"
            size={isTablet ? 'extra-small' : 'medium'}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            size={isTablet ? 'extra-small' : 'medium'}
            onClick={handleInsert}
            disabled={!latex.trim() || !!error}
          >
            Inserir fórmula
          </Button>
        </>
      }
    >
      <div className={isTablet ? 'flex flex-col gap-6' : 'flex gap-6'}>
        {/* Left side - Predefined formulas */}
        <div className="flex-1">
          <Text size="sm" weight="bold" className="text-text-900 mb-4">
            Fórmulas e símbolos mais usados
          </Text>

          {/* Category menu */}
          <Menu
            defaultValue="matematica"
            value={category}
            onValueChange={(value: string) =>
              setCategory(value as FormulaCategory)
            }
            variant="menu2"
            className="mb-4"
          >
            <MenuContent variant="menu2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <MenuItem key={key} value={key} variant="menu2">
                  {label}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>

          {/* Formula cards grid */}
          <div
            className={`grid ${isTablet ? 'grid-cols-1' : 'grid-cols-2 max-h-[300px] overflow-y-auto pr-2'} gap-3`}
          >
            {formulas[category].map((formula) => (
              <Button
                key={formula.label}
                type="button"
                onClick={() => selectFormula(formula)}
                className={`bg-transparent flex flex-col items-start p-3 text-left border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors ${
                  latex === formula.latex
                    ? 'border-primary-500'
                    : 'border-border-200'
                }`}
              >
                <Text weight="medium" className="text-sm text-text-900 mb-1">
                  {formula.label}
                </Text>
                <Text size="xs" className="text-text-500 font-mono">
                  {formula.preview}
                </Text>
              </Button>
            ))}
          </div>
        </div>

        {/* Right side - Create formula */}
        <div className="flex-1">
          <Text size="sm" weight="bold" className="text-text-900 mb-4">
            Crie sua fórmula
          </Text>

          {/* Preview */}
          <div className="mb-4">
            <Text weight="medium" className="text-xs text-text-600 mb-2">
              Fórmula gerada
            </Text>
            <div className="min-h-[80px] border border-border-200 rounded-lg px-4 py-3 bg-background-50 flex items-center justify-center">
              {renderPreview()}
            </div>
          </div>

          {/* LaTeX input */}
          <div className="mb-4">
            <Text weight="medium" className="text-xs text-text-600 mb-2 block">
              Digite o código LaTeX
            </Text>
            <Input
              type="text"
              value={latex}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLatex(e.target.value)
              }
              placeholder={String.raw`Ex: \sqrt{x^2 + y^2} ou \frac{a}{b}`}
            />
            <Text className="text-xs text-text-400 mt-1">
              Use sintaxe LaTeX:{' '}
              {String.raw`\sqrt{}, \frac{}{}, ^{}, _{}, \pi, \alpha`}, etc.
            </Text>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border-200" />
            <span className="text-xs text-text-400">Ou</span>
            <div className="flex-1 h-px bg-border-200" />
          </div>

          {/* AI description */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <Sparkle size={14} className="text-primary-600" />
              <Text className="text-xs font-medium text-text-600">
                Descreva o que deseja criar com IA
              </Text>
            </div>
            <TextArea
              value={aiDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setAiDescription(e.target.value)
              }
              placeholder="Ex: área do círculo, bhaskara, velocidade média..."
              rows={2}
              disabled={isGeneratingAI}
            />
            <Text size="xs" className="text-text-400 mt-1">
              {onGenerateWithAI
                ? 'Descreva em linguagem natural e a IA gerará o LaTeX correspondente.'
                : 'Funcionalidade de IA não disponível.'}
            </Text>
            {aiError && (
              <Text size="xs" className="text-error-600 mt-1">
                {aiError}
              </Text>
            )}
            <Button
              variant="outline"
              size="small"
              disabled={
                !onGenerateWithAI || !aiDescription.trim() || isGeneratingAI
              }
              onClick={handleGenerateWithAI}
              className="mt-2 ml-auto flex items-center gap-1"
            >
              <Sparkle size={14} />
              {isGeneratingAI ? 'Gerando...' : 'Gerar fórmula'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
