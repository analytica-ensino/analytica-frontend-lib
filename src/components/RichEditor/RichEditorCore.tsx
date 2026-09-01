import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
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
import { TableIcon } from '@phosphor-icons/react/dist/csr/Table';
import { RowsPlusTopIcon } from '@phosphor-icons/react/dist/csr/RowsPlusTop';
import { RowsPlusBottomIcon } from '@phosphor-icons/react/dist/csr/RowsPlusBottom';
import { ColumnsPlusLeftIcon } from '@phosphor-icons/react/dist/csr/ColumnsPlusLeft';
import { ColumnsPlusRightIcon } from '@phosphor-icons/react/dist/csr/ColumnsPlusRight';
import { RowsIcon } from '@phosphor-icons/react/dist/csr/Rows';
import { ColumnsIcon } from '@phosphor-icons/react/dist/csr/Columns';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
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

interface TableActionBtnProps {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: ReactNode;
}

/**
 * Ação da barra de tabela. Leva rótulo escrito, e não só ícone: "linha acima"
 * e "coluna à esquerda" são indistinguíveis em 16px para quem não usa o editor
 * todo dia, e esta barra só aparece de vez em quando — há espaço de sobra.
 */
const TableActionBtn = ({
  onClick,
  label,
  danger,
  children,
}: TableActionBtnProps) => (
  <Button
    type="button"
    onClick={onClick}
    title={label}
    size="small"
    className={`bg-transparent border-transparent h-7 px-2 flex items-center gap-1 rounded text-xs whitespace-nowrap hover:bg-background-100 ${
      danger ? 'text-error-600' : 'text-text-700'
    }`}
  >
    {children}
    {label}
  </Button>
);

/** Tabela padrão de quem está montando um enunciado: cabeçalho + 2 linhas. */
const NEW_TABLE = { rows: 3, cols: 3, withHeaderRow: true };

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
   * If provided, the file upload tab is enabled in the image dialog; otherwise
   * images can still be inserted by URL.
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

  /**
   * Estado reativo da toolbar.
   *
   * No Tiptap 3 o `useEditor` deixou de re-renderizar a cada transação, então
   * ler `editor.isActive(...)` direto no corpo do componente devolve o valor
   * congelado do último render: os botões não acendiam ao mover o cursor e a
   * barra de tabela nunca apareceria ao entrar numa célula. `useEditorState`
   * assina as transações e só re-renderiza quando um destes flags muda — bem
   * mais barato que re-renderizar a toolbar inteira a cada tecla digitada.
   */
  const toolbar = useEditorState({
    editor,
    selector: ({ editor }) => ({
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      heading3: editor.isActive('heading', { level: 3 }),
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      subscript: editor.isActive('subscript'),
      superscript: editor.isActive('superscript'),
      code: editor.isActive('code'),
      alignLeft: editor.isActive({ textAlign: 'left' }),
      alignCenter: editor.isActive({ textAlign: 'center' }),
      alignRight: editor.isActive({ textAlign: 'right' }),
      alignJustify: editor.isActive({ textAlign: 'justify' }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      link: editor.isActive('link'),
      image: editor.isActive('image'),
      table: editor.isActive('table'),
    }),
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

  const insertFormula = (latex: string, display: boolean) => {
    if (!latex || !editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'mathInline',
        attrs: { latex, display },
      })
      .run();
    setFormulaOpen(false);
  };

  const insertImage = (src: string, alt: string, width?: number) => {
    if (!src || !editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src, alt, ...(width ? { width } : {}) })
      .run();
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

  // `toolbar` só é nulo junto com o editor, mas o TypeScript não sabe disso.
  if (!editor || !toolbar) return null;

  // `data-analytica-rich-editor` scopes the image resize handle styles shipped
  // in the library's global stylesheet, so they cannot leak into another Tiptap
  // instance living in the consumer app.
  return (
    <div
      data-analytica-rich-editor
      className="border border-border-200 rounded-xl overflow-hidden bg-background-0"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border-200 bg-background-50 px-2 py-1.5 flex-wrap">
        {/* Headings */}
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={toolbar.heading1}
          title="Título 1"
        >
          <TextHOneIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={toolbar.heading2}
          title="Título 2"
        >
          <TextHTwoIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={toolbar.heading3}
          title="Título 3"
        >
          <TextHThreeIcon size={16} weight="bold" />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={toolbar.bold}
          title="Negrito (Ctrl+B)"
        >
          <TextBolderIcon size={16} weight="bold" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={toolbar.italic}
          title="Itálico (Ctrl+I)"
        >
          <TextItalicIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={toolbar.underline}
          title="Sublinhado (Ctrl+U)"
        >
          <TextUnderlineIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={toolbar.strike}
          title="Tachado"
        >
          <TextStrikethroughIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={toolbar.subscript}
          title="Subscrito"
        >
          <span className="text-xs font-medium">
            X<sub className="text-[8px]">2</sub>
          </span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={toolbar.superscript}
          title="Sobrescrito"
        >
          <span className="text-xs font-medium">
            X<sup className="text-[8px]">2</sup>
          </span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={toolbar.code}
          title="Código inline"
        >
          <CodeIcon size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={toolbar.alignLeft}
          title="Alinhar à esquerda"
        >
          <TextAlignLeftIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={toolbar.alignCenter}
          title="Centralizar"
        >
          <TextAlignCenterIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={toolbar.alignRight}
          title="Alinhar à direita"
        >
          <TextAlignRightIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={toolbar.alignJustify}
          title="Justificar"
        >
          <TextAlignJustifyIcon size={16} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={toolbar.bulletList}
          title="Lista com marcadores"
        >
          <ListBulletsIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={toolbar.orderedList}
          title="Lista numerada"
        >
          <ListNumbersIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={toolbar.blockquote}
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
          active={toolbar.link}
          title="Inserir link"
        >
          <LinkIcon size={16} />
        </ToolbarBtn>

        {/* Image */}
        <ToolbarBtn
          onClick={() => setImageOpen(true)}
          active={toolbar.image}
          title="Inserir imagem"
        >
          <ImageIcon size={16} />
        </ToolbarBtn>

        {/* Table */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().insertTable(NEW_TABLE).run()}
          active={toolbar.table}
          title="Inserir tabela"
        >
          <TableIcon size={16} />
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

      {/*
        Ações de linha/coluna só existem quando o cursor está dentro de uma
        tabela, então ficam numa barra própria em vez de ocuparem a toolbar
        principal — que já quebra em duas linhas no tablet.
      */}
      {toolbar.table && (
        <div
          data-testid="table-toolbar"
          className="flex items-center gap-0.5 border-b border-border-200 bg-background-50 px-2 py-1.5 flex-wrap"
        >
          <TableActionBtn
            onClick={() => editor.chain().focus().addRowBefore().run()}
            label="Linha acima"
          >
            <RowsPlusTopIcon size={16} />
          </TableActionBtn>
          <TableActionBtn
            onClick={() => editor.chain().focus().addRowAfter().run()}
            label="Linha abaixo"
          >
            <RowsPlusBottomIcon size={16} />
          </TableActionBtn>
          <TableActionBtn
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            label="Coluna à esquerda"
          >
            <ColumnsPlusLeftIcon size={16} />
          </TableActionBtn>
          <TableActionBtn
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            label="Coluna à direita"
          >
            <ColumnsPlusRightIcon size={16} />
          </TableActionBtn>

          <Divider />

          <TableActionBtn
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            label="Cabeçalho"
          >
            <TableIcon size={16} />
          </TableActionBtn>

          <Divider />

          <TableActionBtn
            onClick={() => editor.chain().focus().deleteRow().run()}
            label="Excluir linha"
            danger
          >
            <RowsIcon size={16} />
          </TableActionBtn>
          <TableActionBtn
            onClick={() => editor.chain().focus().deleteColumn().run()}
            label="Excluir coluna"
            danger
          >
            <ColumnsIcon size={16} />
          </TableActionBtn>
          <TableActionBtn
            onClick={() => editor.chain().focus().deleteTable().run()}
            label="Excluir tabela"
            danger
          >
            <TrashIcon size={16} />
          </TableActionBtn>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Dica */}
      <div className="border-t border-border-200 px-4 py-2 bg-background-50">
        <Text size="xs" color="text-text-400">
          Dica: use{' '}
          <code className="bg-background-200 px-1 rounded">$fórmula$</code> para
          LaTeX inline e{' '}
          <code className="bg-background-200 px-1 rounded">$$fórmula$$</code>{' '}
          para fórmula em bloco. A conversão acontece assim que você fecha os
          cifrões.
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
