import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import AnnouncementsGate from './AnnouncementsGate';
import {
  getSeenAnnouncementIds,
  markAnnouncementSeen,
  SEEN_ANNOUNCEMENTS_STORAGE_PREFIX,
} from '../../utils/announcements';
import type { Announcement } from '../../types/announcements';

const USER_ID = 'user-1';

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

/**
 * Minimal API client double returning the given announcements.
 */
const buildApiClient = (announcements: Announcement[]) => ({
  get: jest.fn().mockResolvedValue({
    data: { message: 'ok', data: { announcements } },
  }),
});

describe('AnnouncementsGate', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('fetches and shows the first announcement', async () => {
    const apiClient = buildApiClient([buildAnnouncement()]);

    render(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    expect(
      await screen.findByText('Manutenção programada')
    ).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('/announcements/active');
  });

  it('does not fetch while the user is unauthenticated', () => {
    const apiClient = buildApiClient([buildAnnouncement()]);

    render(<AnnouncementsGate apiClient={apiClient} userId={null} />);

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(screen.queryByText('Manutenção programada')).not.toBeInTheDocument();
  });

  it('renders nothing when the institution has no announcements', async () => {
    const apiClient = buildApiClient([]);

    const { container } = render(
      <AnnouncementsGate apiClient={apiClient} userId={USER_ID} />
    );

    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('skips an announcement this user already dismissed', async () => {
    markAnnouncementSeen(USER_ID, 'ann-1');
    const apiClient = buildApiClient([
      buildAnnouncement(),
      buildAnnouncement({ id: 'ann-2', title: 'Nova funcionalidade' }),
    ]);

    render(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    expect(await screen.findByText('Nova funcionalidade')).toBeInTheDocument();
    expect(screen.queryByText('Manutenção programada')).not.toBeInTheDocument();
  });

  it('still shows an announcement another user dismissed on the same browser', async () => {
    markAnnouncementSeen('outro-user', 'ann-1');
    const apiClient = buildApiClient([buildAnnouncement()]);

    render(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    expect(
      await screen.findByText('Manutenção programada')
    ).toBeInTheDocument();
  });

  it('queues several announcements and remembers each dismissal', async () => {
    const apiClient = buildApiClient([
      buildAnnouncement(),
      buildAnnouncement({ id: 'ann-2', title: 'Nova funcionalidade' }),
    ]);

    render(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    expect(
      await screen.findByText('Manutenção programada')
    ).toBeInTheDocument();
    expect(screen.getByText('Restam 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(await screen.findByText('Nova funcionalidade')).toBeInTheDocument();
    expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1']);

    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));

    await waitFor(() =>
      expect(screen.queryByText('Nova funcionalidade')).not.toBeInTheDocument()
    );
    expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1', 'ann-2']);
  });

  it('forgets ids the server no longer returns', async () => {
    localStorage.setItem(
      `${SEEN_ANNOUNCEMENTS_STORAGE_PREFIX}:${USER_ID}`,
      JSON.stringify(['ann-antiga', 'ann-1'])
    );
    const apiClient = buildApiClient([buildAnnouncement()]);

    render(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    await waitFor(() =>
      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1'])
    );
  });

  it('stays silent when the request fails', async () => {
    const apiClient = {
      get: jest.fn().mockRejectedValue(new Error('network')),
    };

    const { container } = render(
      <AnnouncementsGate apiClient={apiClient} userId={USER_ID} />
    );

    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('does not refetch when the parent re-renders', async () => {
    const apiClient = buildApiClient([buildAnnouncement()]);

    const { rerender } = render(
      <AnnouncementsGate apiClient={apiClient} userId={USER_ID} />
    );

    await screen.findByText('Manutenção programada');

    rerender(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);
    rerender(<AnnouncementsGate apiClient={apiClient} userId={USER_ID} />);

    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('ignores the previous user response when it resolves last', async () => {
    // Two logins racing in the same tab: A's request is still in flight when B
    // signs in, and A's response lands afterwards. Applying it would hand B the
    // announcements of A's institution and profile.
    const deferred: Array<{
      resolve: (announcements: Announcement[]) => void;
    }> = [];

    const apiClient = {
      get: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            deferred.push({
              resolve: (announcements) =>
                resolve({ data: { message: 'ok', data: { announcements } } }),
            });
          })
      ),
    };

    const { rerender } = render(
      <AnnouncementsGate apiClient={apiClient} userId={USER_ID} />
    );
    await waitFor(() => expect(deferred).toHaveLength(1));

    rerender(<AnnouncementsGate apiClient={apiClient} userId="user-2" />);
    await waitFor(() => expect(deferred).toHaveLength(2));

    // B answers first, then A's slower response arrives.
    await act(async () => {
      deferred[1].resolve([
        buildAnnouncement({ id: 'ann-do-b', title: 'Comunicado do B' }),
      ]);
    });
    await act(async () => {
      deferred[0].resolve([
        buildAnnouncement({ id: 'ann-do-a', title: 'Comunicado do A' }),
      ]);
    });

    expect(screen.getByText('Comunicado do B')).toBeInTheDocument();
    expect(screen.queryByText('Comunicado do A')).not.toBeInTheDocument();
    // A's ids must not be written under B either
    expect(getSeenAnnouncementIds('user-2')).toEqual([]);
  });

  it('refetches when a different user logs in', async () => {
    const apiClient = buildApiClient([buildAnnouncement()]);

    const { rerender } = render(
      <AnnouncementsGate apiClient={apiClient} userId={USER_ID} />
    );
    await screen.findByText('Manutenção programada');

    rerender(<AnnouncementsGate apiClient={apiClient} userId="user-2" />);

    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
  });
});
