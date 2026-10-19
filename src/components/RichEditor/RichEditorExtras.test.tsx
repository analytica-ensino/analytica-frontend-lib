import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useEditor } from '@tiptap/react';
import { RichEditor } from './RichEditorCore';

/**
 * Covers the opt-in toolbar extras (video and emoji). The main suite mocks a
 * chain without these commands, so they live in their own file.
 */

jest.mock('katex', () => ({ renderToString: jest.fn(() => '') }));

const commandSpy = jest.fn();

const chain = (): Record<string, jest.Mock> => {
  const self: Record<string, jest.Mock> = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      commandSpy(name, ...args);
      return self;
    };
  self.focus = jest.fn(() => self);
  self.insertContent = jest.fn(record('insertContent'));
  self.setVideoEmbed = jest.fn(record('setVideoEmbed'));
  self.run = jest.fn();
  return self;
};

const mockEditor = {
  isDestroyed: false,
  chain: jest.fn(chain),
  isActive: jest.fn(() => false),
  getHTML: jest.fn(() => ''),
  getJSON: jest.fn(() => ({})),
  commands: { setContent: jest.fn() },
};

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => mockEditor),
  useEditorState: jest.fn(
    ({
      editor,
      selector,
    }: {
      editor: unknown;
      selector: (snapshot: { editor: unknown }) => unknown;
    }) => selector({ editor })
  ),
  EditorContent: () => <div data-testid="editor-content" />,
}));

const extensionNames = () =>
  (
    jest.mocked(useEditor).mock.calls.at(-1)?.[0]?.extensions as {
      name: string;
    }[]
  ).map((ext) => ext.name);

describe('RichEditor extras', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditor.isDestroyed = false;
  });

  it('ignores an editor useEditor already destroyed', () => {
    mockEditor.isDestroyed = true;
    const { container, rerender } = render(<RichEditor content="" />);
    rerender(<RichEditor content="<p>carregado</p>" />);
    // Rendering nothing and skipping setContent is what keeps a destroyed
    // instance (command manager gone) from throwing on `commands`.
    expect(container).toBeEmptyDOMElement();
    expect(mockEditor.commands.setContent).not.toHaveBeenCalled();
  });

  it('hides video and emoji unless enabled', () => {
    render(<RichEditor />);
    expect(screen.queryByTitle('Inserir vídeo')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Inserir emoji')).not.toBeInTheDocument();
    expect(extensionNames()).not.toContain('videoEmbed');
  });

  it('embeds a video through the dialog', () => {
    render(<RichEditor enableVideoEmbed />);
    expect(extensionNames()).toContain('videoEmbed');

    fireEvent.click(screen.getByTitle('Inserir vídeo'));
    fireEvent.change(screen.getByLabelText('Link do vídeo'), {
      target: { value: 'https://vimeo.com/42' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir vídeo' }));

    expect(commandSpy).toHaveBeenCalledWith('setVideoEmbed', {
      src: 'https://player.vimeo.com/video/42',
    });
  });

  it('inserts an emoji from the picker and toggles it', () => {
    render(<RichEditor enableEmoji />);
    const toggle = screen.getByTitle('Inserir emoji');

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Inserir 🎉' }));
    expect(commandSpy).toHaveBeenCalledWith('insertContent', '🎉');
    expect(screen.queryByRole('dialog', { name: 'Emojis' })).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole('dialog', { name: 'Emojis' })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByRole('dialog', { name: 'Emojis' })).toBeNull();
  });
});
