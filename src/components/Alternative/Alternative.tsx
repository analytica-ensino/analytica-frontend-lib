import { CheckCircle, XCircle } from "phosphor-react";
import Badge from "../Badge/Badge";
import { RadioGroup, RadioGroupItem } from "../Radio/Radio";
import { useId } from "react";

/**
 * Interface para definir uma alternativa
 */
export interface Alternative {
  value: string;
  label: string;
  status?: 'correct' | 'incorrect' | 'neutral';
  disabled?: boolean;
  description?: string;
}

/**
 * Props do componente AlternativesList
 */
export interface AlternativesListProps {
  /** Lista de alternativas */
  alternatives: Alternative[];
  /** Nome do grupo de radio */
  name?: string;
  /** Valor selecionado por padrão */
  defaultValue?: string;
  /** Valor controlado */
  value?: string;
  /** Callback quando uma alternativa é selecionada */
  onValueChange?: (value: string) => void;
  /** Se o componente está desabilitado */
  disabled?: boolean;
  /** Layout das alternativas */
  layout?: 'default' | 'compact' | 'detailed';
  /** Classes CSS adicionais */
  className?: string;
  /** Modo de exibição: interativo (com radios funcionais) ou readonly (apenas visual) */
  mode?: 'interactive' | 'readonly';
  /** Valor selecionado pelo usuário (apenas para modo readonly) */
  selectedValue?: string;
}

/**
 * Componente reutilizável para exibir lista de alternativas com RadioGroup
 * 
 * Suporta dois modos:
 * - `interactive`: Permite interação com radios (padrão)
 * - `readonly`: Apenas exibição visual dos estados
 * 
 * @example
 * ```tsx
 * // Modo interativo (padrão)
 * <AlternativesList
 *   mode="interactive"
 *   alternatives={[
 *     { value: "a", label: "Alternativa A", status: "correct" },
 *     { value: "b", label: "Alternativa B", status: "incorrect" },
 *     { value: "c", label: "Alternativa C" }
 *   ]}
 *   defaultValue="a"
 *   onValueChange={(value) => console.log(value)}
 * />
 * 
 * // Modo readonly - mostra seleção do usuário
 * <AlternativesList
 *   mode="readonly"
 *   selectedValue="b"  // O que o usuário selecionou
 *   alternatives={[
 *     { value: "a", label: "Resposta A", status: "correct" },  // Mostra como correta
 *     { value: "b", label: "Resposta B" },  // Mostra radio selecionado + badge incorreto
 *     { value: "c", label: "Resposta C" }
 *   ]}
 * />
 * ```
 */
export const AlternativesList: React.FC<AlternativesListProps> = ({
  alternatives,
  name,
  defaultValue,
  value,
  onValueChange,
  disabled = false,
  layout = 'default',
  className = '',
  mode = 'interactive',
  selectedValue,
}) => {
  // Gerar um ID único para garantir que cada instância tenha seu próprio grupo
  const uniqueId = useId();
  const groupName = name || `alternatives-${uniqueId}`;
  
  // No modo readonly, não precisamos de interação
  const isReadonly = mode === 'readonly';
     const getStatusStyles = (status?: Alternative['status'], isReadonly: boolean = false) => {
     const hoverClass = isReadonly ? '' : 'hover:bg-background-50';
     
     switch (status) {
       case 'correct':
         return 'bg-success-background border-success-300';
       case 'incorrect':
         return 'bg-error-background border-error-300';
       default:
         return `bg-background border-border-100 ${hoverClass}`;
     }
   };

  const getStatusBadge = (status?: Alternative['status']) => {
    switch (status) {
      case 'correct':
        return (
          <Badge variant='solid' action='success' iconLeft={<CheckCircle />}>
            Resposta correta
          </Badge>
        );
      case 'incorrect':
        return (
          <Badge variant='solid' action='error' iconLeft={<XCircle />}>
            Resposta incorreta
          </Badge>
        );
      default:
        return null;
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'compact':
        return 'gap-2';
      case 'detailed':
        return 'gap-4';
      default:
        return 'gap-3.5';
    }
  };

  // Componente para renderizar alternativa no modo readonly
  const renderReadonlyAlternative = (alternative: Alternative, index: number) => {
    const alternativeId = alternative.value || `alt-${index}`;
    const isUserSelected = selectedValue === alternative.value;
    const isCorrectAnswer = alternative.status === 'correct';
    
    // Determinar o status da alternativa para visualização
    let displayStatus: Alternative['status'] = undefined;
    if (isUserSelected && !isCorrectAnswer) {
      // Usuário selecionou alternativa incorreta
      displayStatus = 'incorrect';
    } else if (isCorrectAnswer) {
      // Alternativa correta (independente se foi selecionada ou não)
      displayStatus = 'correct';
    }
    
         const statusStyles = getStatusStyles(displayStatus, true);
     const statusBadge = getStatusBadge(displayStatus);

    // Radio visual - apenas mostra selecionado se o usuário escolheu esta alternativa
    const renderRadio = () => {
      const radioClasses = `w-6 h-6 rounded-full border-2 cursor-default transition-all duration-200 flex items-center justify-center ${
        isUserSelected 
          ? 'border-primary-950 bg-background' 
          : 'border-border-400 bg-background'
      }`;
      
      const dotClasses = 'w-3 h-3 rounded-full bg-primary-950 transition-all duration-200';

      return (
        <div className={radioClasses}>
          {isUserSelected && (
            <div className={dotClasses} />
          )}
        </div>
      );
    };

    if (layout === 'detailed') {
      return (
        <div
          key={alternativeId}
          className={`border-2 rounded-lg p-4 w-full ${statusStyles} ${
            alternative.disabled ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                {renderRadio()}
              </div>
              <div className="flex-1">
                <p className="block font-medium text-text-950">
                  {alternative.label}
                </p>
                {alternative.description && (
                  <p className="text-sm text-text-600 mt-1">
                    {alternative.description}
                  </p>
                )}
              </div>
            </div>
            {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
          </div>
        </div>
      );
    }

    return (
      <div
        key={alternativeId}
        className={`flex flex-row justify-between gap-2 items-center p-2 rounded-lg w-full ${statusStyles} ${
          alternative.disabled ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {renderRadio()}
          <span className="flex-1">
            {alternative.label}
          </span>
        </div>
        {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
      </div>
    );
  };

  // Se for modo readonly, renderizar sem RadioGroup
  if (isReadonly) {
    return (
      <div className={`flex flex-col ${getLayoutClasses()} w-full ${className}`}>
        {alternatives.map((alternative, index) => 
          renderReadonlyAlternative(alternative, index)
        )}
      </div>
    );
  }

  return (
    <RadioGroup
      name={groupName}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={`flex flex-col ${getLayoutClasses()} ${className}`}
    >
      {alternatives.map((alternative, index) => {
        const alternativeId = alternative.value || `alt-${index}`;
                 const statusStyles = getStatusStyles(alternative.status, false);
         const statusBadge = getStatusBadge(alternative.status);

        if (layout === 'detailed') {
          return (
            <div
              key={alternativeId}
              className={`border-2 rounded-lg p-4 transition-all ${statusStyles} ${
                alternative.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <RadioGroupItem
                    value={alternative.value}
                    id={alternativeId}
                    disabled={alternative.disabled}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={alternativeId}
                      className={`block font-medium text-text-950 ${
                        alternative.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {alternative.label}
                    </label>
                    {alternative.description && (
                      <p className="text-sm text-text-600 mt-1">
                        {alternative.description}
                      </p>
                    )}
                  </div>
                </div>
                {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
              </div>
            </div>
          );
        }

        return (
          <div
            key={alternativeId}
            className={`flex flex-row justify-between gap-2 items-center p-2 rounded-lg transition-all ${statusStyles} ${
              alternative.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center gap-2 flex-1">
              <RadioGroupItem
                value={alternative.value}
                id={alternativeId}
                disabled={alternative.disabled}
              />
              <label
                htmlFor={alternativeId}
                className={`flex-1 ${
                  alternative.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {alternative.label}
              </label>
            </div>
            {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
          </div>
        );
      })}
    </RadioGroup>
  );
};