import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { MathNode } from './components/MathNode';
import { processLatexInHtml } from './components/utils';
import 'katex/dist/katex.min.css';
import {
  TextBolder,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  Link as LinkIcon,
  ListBullets,
  ListNumbers,
  Quotes,
  Minus,
  Code,
  TextHOne,
  TextHTwo,
  TextHThree,
  MathOperations,
} from 'phosphor-react';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { FormulaDialog } from './components/FormulaDialog';
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

interface RichEditorProps {
  readonly content?: string;
  readonly onChange?: (data: { json: object; html: string }) => void;
  readonly placeholder?: string;
}

export function RichEditor({
  content,
  onChange,
  placeholder = 'Digite aqui...',
}: RichEditorProps) {
  const [formulaOpen, setFormulaOpen] = useState(false);
  const isExternalUpdateRef = useRef(false);
  const lastContentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      MathNode,
    ],
    content: processLatexInHtml(content || ''),
    onUpdate: ({ editor }) => {
      // Skip onChange callback during external content updates
      if (isExternalUpdateRef.current) {
        isExternalUpdateRef.current = false;
        return;
      }
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
      isExternalUpdateRef.current = true;
      const processedContent = processLatexInHtml(content || '');
      editor.commands.setContent(processedContent, false);
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
    <div className="border border-border-200 rounded-xl overflow-hidden bg-white">
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
          <TextHOne size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <TextHTwo size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <TextHThree size={16} weight="bold" />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <TextBolder size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <TextItalic size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <TextUnderline size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Tachado"
        >
          <TextStrikethrough size={16} />
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
          <Code size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <TextAlignLeft size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <TextAlignCenter size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <TextAlignRight size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <TextAlignJustify size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <ListBullets size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListNumbers size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quotes size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Linha horizontal"
        >
          <Minus size={16} />
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

        {/* Formula */}
        <Button
          type="button"
          onClick={() => setFormulaOpen(true)}
          title="Inserir fórmula LaTeX"
          size="extra-small"
          variant="link"
        >
          <MathOperations size={16} />
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
      />
    </div>
  );
}
