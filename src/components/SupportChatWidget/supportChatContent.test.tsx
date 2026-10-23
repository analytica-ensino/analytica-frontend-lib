import { fireEvent, render, screen } from '@testing-library/react';
import {
  AttachmentList,
  MessageText,
  PendingAttachment,
  SUPPORT_CHAT_ACCEPT,
  pickAttachments,
} from './supportChatContent';
import { SUPPORT_CHAT_ATTACHMENT_RULES } from '../../types/supportChat';

const MB = 1024 * 1024;

const file = (name: string, type: string, size = 10) => {
  const created = new File(['x'], name, { type });
  Object.defineProperty(created, 'size', { value: size });
  return created;
};

describe('SUPPORT_CHAT_ACCEPT', () => {
  it('lists every accepted mime type', () => {
    expect(SUPPORT_CHAT_ACCEPT).toBe(
      Object.keys(SUPPORT_CHAT_ATTACHMENT_RULES).join(',')
    );
    expect(SUPPORT_CHAT_ACCEPT.split(',')).toEqual(
      expect.arrayContaining(['image/png', 'application/pdf', 'video/mp4'])
    );
  });
});

describe('pickAttachments', () => {
  it('accepts images, PDF and videos within the limits', () => {
    const picked = [
      file('a.png', 'image/png', 5 * MB),
      file('b.pdf', 'application/pdf', 10 * MB),
      file('c.mov', 'video/quicktime', 50 * MB),
    ];
    expect(pickAttachments([], picked)).toEqual({
      accepted: picked,
      problem: null,
    });
  });

  it('refuses other types', () => {
    const current = [file('a.png', 'image/png')];
    expect(pickAttachments(current, [file('a.txt', 'text/plain')])).toEqual({
      accepted: current,
      problem:
        'Envie imagens (JPG, PNG, GIF, WEBP), PDF ou vídeo (MP4, WEBM, MOV)',
    });
  });

  it.each([
    ['big.jpg', 'image/jpeg', 5 * MB + 1, '5 MB'],
    ['big.pdf', 'application/pdf', 10 * MB + 1, '10 MB'],
    ['big.webm', 'video/webm', 50 * MB + 1, '50 MB'],
  ])('refuses %s over its size', (name, type, size, limit) => {
    const { accepted, problem } = pickAttachments([], [file(name, type, size)]);
    expect(accepted).toEqual([]);
    expect(problem).toBe(`${name} passa de ${limit}`);
  });

  it('stops at 5 files and keeps the last problem', () => {
    const picked = Array.from({ length: 6 }, (_, i) =>
      file(`${i}.png`, 'image/png')
    );
    const { accepted, problem } = pickAttachments([], picked);
    expect(accepted).toHaveLength(5);
    expect(problem).toBe('Máximo de 5 arquivos por mensagem');
  });
});

describe('AttachmentList', () => {
  it('shows images, videos and other files', () => {
    render(
      <AttachmentList
        items={[
          {
            id: '1',
            url: 'https://cdn/a.png',
            fileName: 'a.png',
            mimeType: 'image/png',
            size: 1,
          },
          {
            id: '2',
            url: 'https://cdn/b.mp4',
            fileName: 'b.mp4',
            mimeType: 'video/mp4',
            size: 1,
          },
          {
            id: '3',
            url: 'https://cdn/c.pdf',
            fileName: 'c.pdf',
            mimeType: 'application/pdf',
            size: 1,
          },
          {
            id: '4',
            url: 'https://cdn/d.zip',
            fileName: 'd.zip',
            mimeType: 'application/zip',
            size: 1,
          },
          {
            id: '5',
            url: 'https://cdn/e',
            fileName: 'e',
            size: 1,
          } as never,
        ]}
      />
    );

    const image = screen.getByAltText('a.png');
    expect(image).toHaveAttribute('src', 'https://cdn/a.png');
    expect(image.closest('a')).toHaveAttribute('href', 'https://cdn/a.png');
    expect(image.closest('a')).toHaveAttribute('target', '_blank');

    const video = screen.getByLabelText('b.mp4');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('src', 'https://cdn/b.mp4');

    for (const name of ['c.pdf', 'd.zip', 'e']) {
      const link = screen.getByText(name).closest('a');
      expect(link).toHaveAttribute('href', `https://cdn/${name}`);
      expect(link?.querySelector('svg')).not.toBeNull();
    }
  });
});

describe('PendingAttachment', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });

  it('previews an image and frees the object URL on unmount', () => {
    const onRemove = jest.fn();
    const { unmount } = render(
      <PendingAttachment
        file={file('a.png', 'image/png')}
        onRemove={onRemove}
      />
    );
    expect(screen.getByAltText('a.png')).toHaveAttribute('src', 'blob:preview');
    fireEvent.click(screen.getByLabelText('Remover a.png'));
    expect(onRemove).toHaveBeenCalledTimes(1);

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it.each([
    ['b.pdf', 'application/pdf'],
    ['c.mp4', 'video/mp4'],
  ])('shows %s as a chip with its name', (name, type) => {
    const onRemove = jest.fn();
    render(<PendingAttachment file={file(name, type)} onRemove={onRemove} />);
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(`Remover ${name}`));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe('MessageText', () => {
  const ARTICLE_ID = '0b6f3c8e-1a2b-4c3d-8e9f-0123456789ab';

  it('renders plain text without links', () => {
    const { container } = render(<MessageText text="Só texto" />);
    expect(container).toHaveTextContent('Só texto');
    expect(container.querySelector('a')).toBeNull();
  });

  it('links addresses and leaves trailing punctuation out', () => {
    const { container } = render(
      <MessageText text="Veja https://a.com/x, e http://b.com." />
    );
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://a.com/x',
      'http://b.com',
    ]);
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(container).toHaveTextContent(
      'Veja https://a.com/x, e http://b.com.'
    );
  });

  it('opens a FAQ article link inside the chat', () => {
    const onOpenArticle = jest.fn();
    const url = `https://faq.escola.com/artigo/${ARTICLE_ID}`;
    render(
      <MessageText
        text={`${url} e https://outro.com`}
        onOpenArticle={onOpenArticle}
      />
    );

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link', { name: url }).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onOpenArticle).toHaveBeenCalledWith(ARTICLE_ID);

    const other = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen
      .getByRole('link', { name: 'https://outro.com' })
      .dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    expect(onOpenArticle).toHaveBeenCalledTimes(1);
  });

  it('keeps an article link as a plain link without onOpenArticle', () => {
    const url = `https://faq.escola.com/artigo/${ARTICLE_ID}`;
    render(<MessageText text={url} />);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link', { name: url }).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
