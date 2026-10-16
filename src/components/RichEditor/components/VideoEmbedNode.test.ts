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

describe('createRichEditorExtensions', () => {
  const names = (options?: { videoEmbed?: boolean }) =>
    createRichEditorExtensions('x', options).map((ext) => ext.name);

  it('only registers the video node when asked', () => {
    expect(names()).not.toContain('videoEmbed');
    expect(names({ videoEmbed: true })).toContain('videoEmbed');
  });
});
