import { EditorContent, useEditor } from '@tiptap/react';
import { createRichEditorExtensions } from './components/extensions';
import {
  normalizeLineBreaksInHtml,
  processLatexInHtml,
} from './components/utils';
import 'katex/dist/katex.min.css';
import { TextBolderIcon } from '@phosphor-icons/react/dist/csr/TextB';
import { TextItalicIcon } from '@phosphor-icons/react/dist/csr/TextItalic';
import { TextUnderlineIcon } from '@phosphor-icons/react/dist/csr/TextUnderline';
import { TextStrikethroughIcon } from '@phosphor-icons/react/dist/csr/TextStrikethrough';
import { TextAlignLeftIcon } from '@phosphor-icons/react/dist/csr/TextAlignLeft';
import { TextAlignCenterIcon } from '@phosphor-icons/react/dist/csr/TextAlignCenter';
import { TextAlignRightIcon } from '@phosphor-icons/react/dist/csr/TextAlignRight';
import { TextAlignJustifyIcon } from '@phosphor-icons/react/dist/csr/TextAlignJustify';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/csr/ListBullets';
import { ListNumbersIcon } from '@phosphor-icons/react/dist/csr/ListNumbers';
import { QuotesIcon } from '@phosphor-icons/react/dist/csr/Quotes';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import { CodeIcon } from '@phosphor-icons/react/dist/csr/Code';
import { TextHOneIcon } from '@phosphor-icons/react/dist/csr/TextHOne';
import { TextHTwoIcon } from '@phosphor-icons/react/dist/csr/TextHTwo';
import { TextHThreeIcon } from '@phosphor-icons/react/dist/csr/TextHThree';
import { MathOperationsIcon } from '@phosphor-icons/react/dist/csr/MathOperations';
import { ImageIcon } from '@phosphor-icons/react/dist/csr/Image';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { FormulaDialog } from './components/FormulaDialog';
import { ImageDialog } from './components/ImageDialog';
import Button from '../Button/Button';
import Text from '../Text/Text';

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}

const ToolbarBtn = ({ onClick, active, title, children }: ToolbarBtnProps) => (
  <Button
    type="button"
    onClick={onClick}
    title={title}
    size="small"
    className={`bg-transparent border-transparent h-7 w-7 p-0 flex items-center justify-center rounded hover:bg-background-100 ${
      active ? 'bg-background-200 text-primary-700' : 'text-text-700'
    }`}
  >
    {children}
  </Button>
);

const Divider = () => <div className="w-px h-5 bg-border-200 mx-0.5" />;

/**
 * Prepares stored content for the TipTap parser. Line breaks are restored first
 * so that LaTeX spans are injected into already-structured markup.
 */
const prepareContent = (content?: string) =>
  processLatexInHtml(normalizeLineBreaksInHtml(content || ''));

interface RichEditorProps {
  readonly content?: string;
  readonly onChange?: (data: { json: object; html: string }) => void;
  readonly placeholder?: string;
  /**
   * Optional callback to generate LaTeX using AI
   * If provided, the AI generation feature will be enabled in the formula dialog
   * @param description - Natural language description of the formula
   * @returns Promise resolving to the LaTeX string
   */
  readonly onGenerateLatexWithAI?: (description: string) => Promise<string>;
  /**
   * Optional callback to upload an image file and get back its public URL.
   * If provided, the image insertion button is enabled in the toolbar.
   * @param file - The image file selected by the user
   * @returns Promise resolving to the public URL of the uploaded image
   */
  readonly onUploadImage?: (file: File) => Promise<string>;
}

export function RichEditor({
  content,
  onChange,
  placeholder = 'Digite aqui...',
  onGenerateLatexWithAI,
  onUploadImage,
}: RichEditorProps) {
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const lastContentRef = useRef(content);

  const editor = useEditor({
    extensions: createRichEditorExtensions(placeholder),
    content: prepareContent(content),
    // External updates do not reach this callback: the sync effect below calls
    // setContent with `emitUpdate: false`.
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastContentRef.current = html;
      onChange?.({
        json: editor.getJSON(),
        html,
      });
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] outline-none prose prose-sm max-w-none px-4 py-3 focus:outline-none',
      },
    },
  });

  // Update editor content when prop changes externally (e.g., from loadQuestion)
  useEffect(() => {
    if (editor && content !== undefined && content !== lastContentRef.current) {
      editor.commands.setContent(prepareContent(content), {
        emitUpdate: false,
      });
      lastContentRef.current = content;
    }
  }, [content, editor]);

  const insertFormula = (latex: string) => {
    if (!latex || !editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'mathInline',
        attrs: { latex },
      })
      .run();
    setFormulaOpen(false);
  };

  const insertImage = (src: string, alt: string) => {
    if (!src || !editor) return;
    editor.chain().focus().setImage({ src, alt }).run();
    setImageOpen(false);
  };

  const setLink = () => {
    const url = globalThis.window.prompt('URL do link:');
    if (url === null || !editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-border-200 rounded-xl overflow-hidden bg-background-0">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border-200 bg-background-50 px-2 py-1.5 flex-wrap">
        {/* Headings */}
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <TextHOneIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <TextHTwoIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <TextHThreeIcon size={16} weight="bold" />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <TextBolderIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <TextItalicIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <TextUnderlineIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Tachado"
        >
          <TextStrikethroughIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive('subscript')}
          title="Subscrito"
        >
          <span className="text-xs font-medium">
            X<sub className="text-[8px]">2</sub>
          </span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive('superscript')}
          title="Sobrescrito"
        >
          <span className="text-xs font-medium">
            X<sup className="text-[8px]">2</sup>
          </span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Código inline"
        >
          <CodeIcon size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <TextAlignLeftIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <TextAlignCenterIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <TextAlignRightIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <TextAlignJustifyIcon size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <ListBulletsIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListNumbersIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citação"
        >
          <QuotesIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Linha horizontal"
        >
          <MinusIcon size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn
          onClick={setLink}
          active={editor.isActive('link')}
          title="Inserir link"
        >
          <LinkIcon size={16} />
        </ToolbarBtn>

        {/* Image */}
        <ToolbarBtn
          onClick={() => setImageOpen(true)}
          active={editor.isActive('image')}
          title="Inserir imagem"
        >
          <ImageIcon size={16} />
        </ToolbarBtn>

        {/* Formula */}
        <Button
          type="button"
          onClick={() => setFormulaOpen(true)}
          title="Inserir fórmula LaTeX"
          size="extra-small"
          variant="link"
        >
          <MathOperationsIcon size={16} />
          LaTeX
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Dica */}
      <div className="border-t border-border-200 px-4 py-2 bg-background-50">
        <Text size="xs" color="text-text-400">
          Dica: use{' '}
          <code className="bg-background-200 px-1 rounded">$fórmula$</code> para
          inserir LaTeX inline diretamente.
        </Text>
      </div>

      <FormulaDialog
        open={formulaOpen}
        onClose={() => setFormulaOpen(false)}
        onInsert={insertFormula}
        onGenerateWithAI={onGenerateLatexWithAI}
      />

      <ImageDialog
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        onInsert={insertImage}
        onUploadImage={onUploadImage}
      />
    </div>
  );
}
