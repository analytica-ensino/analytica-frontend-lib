import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { VideoEmbedNode } from './VideoEmbedNode';
import { createRichEditorExtensions } from './extensions';

const PLAYER = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';

const createEditor = (content = '') =>
  new Editor({ extensions: [StarterKit, VideoEmbedNode], content });

describe('VideoEmbedNode', () => {
  it('saves the player inside a data-video-embed wrapper', () => {
    const editor = createEditor();
    expect(editor.commands.setVideoEmbed({ src: PLAYER })).toBe(true);
    const html = editor.getHTML();
    expect(html).toContain('<div data-video-embed="" class="video-embed">');
    expect(html).toContain(`src="${PLAYER}"`);
    expect(html).toContain('allowfullscreen="true"');
    editor.destroy();
  });

  it('refuses a source outside the allowed players', () => {
    const editor = createEditor();
    expect(
      editor.commands.setVideoEmbed({ src: 'https://evil.com/embed/x' })
    ).toBe(false);
    expect(editor.getHTML()).not.toContain('iframe');
    editor.destroy();
  });

  it('loads saved players, wrapped or bare, and drops foreign iframes', () => {
    const editor = createEditor(
      `<div data-video-embed><iframe src="${PLAYER}"></iframe></div>` +
        '<iframe src="https://player.vimeo.com/video/1"></iframe>' +
        '<iframe src="https://evil.com/x"></iframe>' +
        '<div data-video-embed></div>'
    );
    const html = editor.getHTML();
    expect(html.match(/<iframe/g)).toHaveLength(2);
    expect(html).toContain('https://player.vimeo.com/video/1');
    expect(html).not.toContain('evil.com');
    editor.destroy();
  });
});

describe('VideoEmbedNode width', () => {
  it('keeps the width saved on the iframe and writes it back', () => {
    const editor = createEditor(
      `<div data-video-embed><iframe src="${PLAYER}" width="480"></iframe></div>`
    );
    expect(editor.getJSON().content?.[0].attrs).toEqual({
      src: PLAYER,
      width: 480,
    });
    expect(editor.getHTML()).toContain('width="480"');
    editor.destroy();
  });

  it('drops widths that are not pixels and saves no width by default', () => {
    const editor = createEditor(
      `<div data-video-embed><iframe src="${PLAYER}" width="50%"></iframe></div>`
    );
    expect(editor.getJSON().content?.[0].attrs?.width).toBeNull();
    expect(editor.getHTML()).not.toContain('width=');
    editor.destroy();
  });
});

describe('VideoEmbedNode resize', () => {
  const mount = (content: string) => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const editor = new Editor({
      element,
      extensions: [StarterKit, VideoEmbedNode],
      content,
    });
    return { editor, element };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the player with corner handles and the stored width', () => {
    const { editor, element } = mount(
      `<div data-video-embed><iframe src="${PLAYER}" width="480"></iframe></div>`
    );
    const container = element.querySelector('[data-resize-container]');
    expect(container).not.toBeNull();
    expect(element.querySelectorAll('[data-resize-handle]')).toHaveLength(4);

    const wrapper = element.querySelector<HTMLElement>('.video-embed');
    expect(wrapper?.style.width).toBe('480px');
    expect(wrapper?.querySelector('iframe')?.getAttribute('src')).toBe(PLAYER);

    // a width change (undo, another editor) reaches the player
    editor.commands.setNodeSelection(0);
    editor.commands.updateAttributes('videoEmbed', { width: 320 });
    expect(
      element.querySelector<HTMLElement>('.video-embed')?.style.width
    ).toBe('320px');
    editor.commands.updateAttributes('videoEmbed', { width: null });
    expect(
      element.querySelector<HTMLElement>('.video-embed')?.style.width
    ).toBe('');
    editor.destroy();
  });

  it('saves the width chosen by dragging a corner', () => {
    // jsdom does no layout: measure the boxes from the width the node view
    // sets (640px when none), keeping the 16:9 ratio like the browser
    const widthOf = (el: HTMLElement) =>
      Number.parseFloat(el.style.width) || 640;
    const width = jest
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return widthOf(this);
      });
    const height = jest
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return (widthOf(this) * 9) / 16;
      });

    const { editor, element } = mount(
      `<div data-video-embed><iframe src="${PLAYER}"></iframe></div>`
    );
    const handle = element.querySelector<HTMLElement>(
      '[data-resize-handle="bottom-right"]'
    );

    handle?.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: 640, clientY: 360 })
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 400, clientY: 225 })
    );
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(editor.getJSON().content?.[0].attrs?.width).toBe(400);
    expect(editor.getHTML()).toContain('width="400"');

    width.mockRestore();
    height.mockRestore();
    editor.destroy();
  });
});

describe('createRichEditorExtensions', () => {
  const names = (options?: { videoEmbed?: boolean }) =>
    createRichEditorExtensions('x', options).map((ext) => ext.name);

  it('only registers the video node when asked', () => {
    expect(names()).not.toContain('videoEmbed');
    expect(names({ videoEmbed: true })).toContain('videoEmbed');
  });
});
