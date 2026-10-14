import { useCallback, useState, type KeyboardEvent } from 'react';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import { cn } from '../../utils/utils';

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 120;

/**
 * Props for the chatbot text input
 */
export interface ChatbotInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Auto-resizing textarea + send button. Enter sends, Shift+Enter creates a
 * new line, as is standard for chat UIs.
 *
 * Uses the library's `<TextArea>` component (design-system compliant)
 * with its built-in `autoResize` — no manual DOM height manipulation.
 */
export default function ChatbotInput({
  onSend,
  disabled = false,
  placeholder = 'Pergunte ao assistente...',
  className,
}: Readonly<ChatbotInputProps>) {
  const [value, setValue] = useState('');

  const isSendDisabled = disabled || value.trim().length === 0;

  const submit = useCallback(() => {
    // O botão de enviar não usa `disabled` nem `aria-disabled` (ver o
    // comentário no `<Button>` abaixo), então o clique continua chegando até
    // aqui mesmo com o botão desabilitado — esta guarda é o que impede o
    // envio. Vale também para o Enter no textarea.
    if (isSendDisabled) return;
    onSend(value.trim());
    setValue('');
  }, [isSendDisabled, onSend, value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Ignore Enter while an IME composition is in progress (e.g. typing
      // Japanese/Chinese), otherwise confirming the composition would
      // submit the message prematurely.
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-background-200 bg-background p-3',
        className
      )}
    >
      {/* `TextArea` wraps its <textarea> in a flex column, so `flex-1`
          needs to live on this outer wrapper — passing it via
          `className` would only affect the inner element. */}
      <div className="flex-1 min-w-0">
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoResize
          minHeight={MIN_HEIGHT}
          aria-label="Mensagem para o assistente"
          className="w-full"
          style={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}
        />
      </div>
      {/* Use the library's `<Button>` with `variant="raw"` (same pattern
          as `ChatbotFab`) so the send action goes through the shared
          component. `raw` keeps custom sizing/shape without inheriting
          the default solid/outline/link classes.

          Acessibilidade (AE-2667): o estado desabilitado vai SÓ no rótulo
          ("Enviar mensagem, desabilitado, botão"). O VoiceOver anuncia
          "escurecido" tanto para o `disabled` nativo quanto para
          `aria-disabled="true"`, então nenhum dos dois pode estar no botão.
          Ele segue focável; quem bloqueia o envio é a guarda do `submit`, e o
          visual vem das variantes `data-[disabled=true]:` (que o Tailwind
          emite depois das `hover:`, então continuam vencendo o hover).

          O ícone é decorativo e vai `aria-hidden`: o rótulo do botão já diz o
          que ele faz, e sem isso o Safari expõe o `<svg>` como um grupo no
          conteúdo do botão — era de onde vinha o "grupo" no fim da leitura. */}
      <Button
        variant="raw"
        type="button"
        onClick={submit}
        data-disabled={isSendDisabled}
        aria-label={
          isSendDisabled ? 'Enviar mensagem, desabilitado' : 'Enviar mensagem'
        }
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          'bg-primary-500 text-white transition-colors',
          'hover:bg-primary-600',
          'data-[disabled=true]:bg-background-200 data-[disabled=true]:text-text-500 data-[disabled=true]:cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300'
        )}
      >
        <PaperPlaneTiltIcon size={20} weight="fill" aria-hidden="true" />
      </Button>
    </div>
  );
}
