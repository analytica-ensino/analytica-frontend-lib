import { lazy, Suspense, Component, ReactNode } from 'react';

// Lazy load the editor core to catch missing dependencies
const RichEditorCore = lazy(() =>
  import('./RichEditorCore').then((module) => ({
    default: module.RichEditor,
  }))
);

interface RichEditorProps {
  readonly content?: string;
  readonly onChange?: (data: { json: object; html: string }) => void;
  readonly placeholder?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

class RichEditorErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

const TIPTAP_DEPENDENCIES = [
  '@tiptap/react',
  '@tiptap/core',
  '@tiptap/starter-kit',
  '@tiptap/extension-underline',
  '@tiptap/extension-text-align',
  '@tiptap/extension-color',
  '@tiptap/extension-text-style',
  '@tiptap/extension-highlight',
  '@tiptap/extension-subscript',
  '@tiptap/extension-superscript',
  '@tiptap/extension-link',
  '@tiptap/extension-placeholder',
];

function MissingDependenciesError({ error }: { error: Error }) {
  const isTiptapError =
    error.message.includes('@tiptap') ||
    error.message.includes("Cannot find module '@tiptap");

  const installCommand = `yarn add ${TIPTAP_DEPENDENCIES.join(' ')}`;
  const npmCommand = `npm install ${TIPTAP_DEPENDENCIES.join(' ')}`;

  return (
    <div className="border border-red-200 rounded-xl overflow-hidden bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {isTiptapError
              ? 'Dependências do TipTap não encontradas'
              : 'Erro ao carregar o RichEditor'}
          </h3>
          <p className="text-red-700 text-sm mb-4">
            {isTiptapError
              ? 'O componente RichEditor requer as dependências do TipTap para funcionar. Instale-as executando um dos comandos abaixo:'
              : error.message}
          </p>
          {isTiptapError && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-red-600 font-medium mb-1">
                  Usando Yarn:
                </p>
                <code className="block bg-red-100 text-red-800 px-3 py-2 rounded text-xs font-mono overflow-x-auto">
                  {installCommand}
                </code>
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium mb-1">
                  Usando NPM:
                </p>
                <code className="block bg-red-100 text-red-800 px-3 py-2 rounded text-xs font-mono overflow-x-auto">
                  {npmCommand}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="border border-border-200 rounded-xl overflow-hidden bg-white animate-pulse">
      <div className="h-10 bg-background-100 border-b border-border-200" />
      <div className="h-32 bg-background-50" />
      <div className="h-8 bg-background-100 border-t border-border-200" />
    </div>
  );
}

export function RichEditor(props: RichEditorProps) {
  return (
    <RichEditorErrorBoundary
      fallback={(error) => <MissingDependenciesError error={error} />}
    >
      <Suspense fallback={<LoadingFallback />}>
        <RichEditorCore {...props} />
      </Suspense>
    </RichEditorErrorBoundary>
  );
}
