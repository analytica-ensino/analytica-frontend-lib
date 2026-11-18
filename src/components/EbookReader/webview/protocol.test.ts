import { EBOOK_WEBVIEW_COMMAND, parseEbookWebViewCommand } from './protocol';

const CONTENT = {
  html: '<main></main>',
  css: '',
  assetBaseUrl: 'https://cdn.test/',
};

describe('parseEbookWebViewCommand', () => {
  it.each([
    [{ type: EBOOK_WEBVIEW_COMMAND.NEXT }],
    [{ type: EBOOK_WEBVIEW_COMMAND.GO_TO, target: 'p04' }],
    [
      {
        type: EBOOK_WEBVIEW_COMMAND.OPEN,
        content: CONTENT,
        initialSection: 'p3',
      },
    ],
  ])('takes the command %j', (command) => {
    expect(parseEbookWebViewCommand(command)).toEqual(command);
  });

  it('takes a command sent as JSON text', () => {
    expect(parseEbookWebViewCommand('{"type":"toggleNarration"}')).toEqual({
      type: EBOOK_WEBVIEW_COMMAND.TOGGLE_NARRATION,
    });
  });

  it.each([
    ['not JSON', '{type:'],
    ['not an object', 42],
    ['null', null],
    ['an unknown type', { type: 'delete' }],
    ['a type that is not text', { type: 1 }],
    ['an open without the book', { type: EBOOK_WEBVIEW_COMMAND.OPEN }],
    ['a go-to without a target', { type: EBOOK_WEBVIEW_COMMAND.GO_TO }],
  ])('drops %s', (_case, raw) => {
    expect(parseEbookWebViewCommand(raw)).toBeNull();
  });
});
