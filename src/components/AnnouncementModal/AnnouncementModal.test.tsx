import { render, screen, fireEvent } from '@testing-library/react';
import AnnouncementModal from './AnnouncementModal';
import type { Announcement } from '../../types/announcements';

/**
 * Build an announcement, overriding only what the case is about.
 */
const buildAnnouncement = (
  overrides: Partial<Announcement> = {}
): Announcement => ({
  id: 'ann-1',
  title: 'Manutenção programada',
  message: 'A plataforma ficará indisponível sábado.',
  videoUrl: null,
  linkUrl: null,
  linkLabel: null,
  createdAt: '2026-08-31T12:00:00.000Z',
  ...overrides,
});

describe('AnnouncementModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen={false}
        onClose={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the title and the message', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Manutenção programada')).toBeInTheDocument();
    expect(
      screen.getByText('A plataforma ficará indisponível sábado.')
    ).toBeInTheDocument();
  });

  it('embeds a YouTube video through the nocookie domain', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          message: null,
          videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    const iframe = screen.getByTitle('Vídeo: Manutenção programada');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1'
    );
  });

  it('shows video and message together', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByTitle('Vídeo: Manutenção programada')
    ).toBeInTheDocument();
    expect(
      screen.getByText('A plataforma ficará indisponível sábado.')
    ).toBeInTheDocument();
  });

  it('falls back to a plain link when the video URL cannot be embedded', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          videoUrl: 'https://vimeo.com/76979871',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(screen.queryByTitle(/^Vídeo:/)).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Assistir ao vídeo' });
    expect(link).toHaveAttribute('href', 'https://vimeo.com/76979871');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('turns a URL inside the message into a link opening in a new tab', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          message: 'Detalhes em https://analyticaensino.com.br hoje',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    const link = screen.getByRole('link', {
      name: 'https://analyticaensino.com.br',
    });
    expect(link).toHaveAttribute('href', 'https://analyticaensino.com.br');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/Detalhes em/)).toBeInTheDocument();
  });

  it('renders the call-to-action with its label', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          linkUrl: 'https://analyticaensino.com.br/promo',
          linkLabel: 'Ver promoção',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    const cta = screen.getByRole('link', { name: 'Ver promoção' });
    expect(cta).toHaveAttribute('href', 'https://analyticaensino.com.br/promo');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('falls back to a default call-to-action label', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement({
          linkUrl: 'https://analyticaensino.com.br/promo',
        })}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Saiba mais' })
    ).toBeInTheDocument();
  });

  it('says "Entendi" when this is the last announcement', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen
        onClose={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Entendi' })).toBeInTheDocument();
    expect(screen.queryByText(/Restam/)).not.toBeInTheDocument();
  });

  it('says "Próxima" and counts the queue when more are pending', () => {
    render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen
        onClose={jest.fn()}
        remainingCount={2}
      />
    );

    expect(screen.getByRole('button', { name: 'Próxima' })).toBeInTheDocument();
    expect(screen.getByText('Restam 2')).toBeInTheDocument();
  });

  it('dismisses through the action button', () => {
    const onClose = jest.fn();
    render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismisses through the close icon', () => {
    const onClose = jest.fn();
    render(
      <AnnouncementModal
        announcement={buildAnnouncement()}
        isOpen
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByLabelText('Fechar modal'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
