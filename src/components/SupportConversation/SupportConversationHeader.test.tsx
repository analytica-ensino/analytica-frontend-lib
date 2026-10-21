import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportConversationHeader, {
  type SupportConversationHeaderProps,
} from './SupportConversationHeader';

const baseProps: SupportConversationHeaderProps = {
  ticketCode: '#4819',
  name: 'Helena Martins',
  status: { label: 'HUMANO', tone: 'warning' },
};

const renderHeader = (props: Partial<SupportConversationHeaderProps> = {}) =>
  render(<SupportConversationHeader {...baseProps} {...props} />);

describe('SupportConversationHeader', () => {
  it('shows the code, the name and the status badge', () => {
    renderHeader();

    expect(screen.getByText('#4819')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Helena Martins' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('support-conversation-status')).toHaveTextContent(
      'HUMANO'
    );
  });

  it('keeps the badge read-only without status options', () => {
    renderHeader({ onStatusChange: jest.fn() });

    expect(
      screen.queryByRole('button', { name: /Alterar status/ })
    ).not.toBeInTheDocument();
  });

  it('changes the status from the badge dropdown', () => {
    const onStatusChange = jest.fn();
    renderHeader({
      statusOptions: [
        { value: 'HUMANO', label: 'Humano' },
        { value: 'CONCLUIDO', label: 'Concluído' },
      ],
      onStatusChange,
    });

    fireEvent.click(screen.getByRole('button', { name: /Alterar status/ }));
    fireEvent.click(screen.getByText('Concluído'));

    expect(onStatusChange).toHaveBeenCalledWith('CONCLUIDO');
  });

  it('locks the status dropdown when read-only', () => {
    renderHeader({
      statusOptions: [{ value: 'HUMANO', label: 'Humano' }],
      onStatusChange: jest.fn(),
      readOnly: true,
    });

    expect(
      screen.queryByRole('button', { name: /Alterar status/ })
    ).not.toBeInTheDocument();
  });

  it('renders the "Atendido por" select only with options', () => {
    const { rerender } = renderHeader();
    expect(screen.queryByText('Atendido por')).not.toBeInTheDocument();

    rerender(
      <SupportConversationHeader
        {...baseProps}
        attendedBy="HUMANO"
        attendedByOptions={[
          { value: 'HUMANO', label: 'Humano' },
          { value: 'IA', label: 'IA' },
        ]}
        onAttendedByChange={jest.fn()}
      />
    );
    expect(screen.getByText('Atendido por')).toBeInTheDocument();
  });

  it('changes who handles the ticket, ignoring the current value', () => {
    const onAttendedByChange = jest.fn();
    renderHeader({
      attendedBy: 'HUMANO',
      attendedByOptions: [
        { value: 'HUMANO', label: 'Humano' },
        { value: 'IA', label: 'IA' },
      ],
      onAttendedByChange,
    });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(within(document.body).getByRole('option', { name: 'IA' }));
    expect(onAttendedByChange).toHaveBeenCalledWith('IA');

    onAttendedByChange.mockClear();
    fireEvent.click(trigger);
    fireEvent.click(
      within(document.body).getByRole('option', { name: 'Humano' })
    );
    expect(onAttendedByChange).not.toHaveBeenCalled();
  });

  it('disables the select without a change handler', () => {
    renderHeader({
      attendedBy: 'IA',
      attendedByOptions: [{ value: 'IA', label: 'IA' }],
    });

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows the channel with its default icon and the institution', () => {
    renderHeader({
      channel: { label: 'App' },
      institution: 'Rede Aprender Mais',
    });

    const channel = screen.getByTestId('support-conversation-channel');
    expect(channel).toHaveTextContent('App · Rede Aprender Mais');
    expect(channel.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the institution alone and accepts a custom channel icon', () => {
    const { rerender } = renderHeader({ institution: 'CE Santos Dumont' });
    expect(
      screen.getByTestId('support-conversation-channel')
    ).toHaveTextContent('CE Santos Dumont');

    rerender(
      <SupportConversationHeader
        {...baseProps}
        channel={{ label: 'Totem', icon: <span data-testid="totem-icon" /> }}
      />
    );
    expect(screen.getByTestId('totem-icon')).toBeInTheDocument();
  });

  it('hides the channel row item without channel and institution', () => {
    renderHeader();

    expect(
      screen.queryByTestId('support-conversation-channel')
    ).not.toBeInTheDocument();
  });

  it('toggles the details panel and announces its state', () => {
    const onToggleDetails = jest.fn();
    const { rerender } = renderHeader({ onToggleDetails });

    const button = screen.getByRole('button', { name: 'Abrir detalhes' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(onToggleDetails).toHaveBeenCalledTimes(1);

    rerender(
      <SupportConversationHeader
        {...baseProps}
        onToggleDetails={onToggleDetails}
        isDetailsOpen
      />
    );
    expect(
      screen.getByRole('button', { name: 'Fechar detalhes' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('hides the details button without the handler and renders actions', () => {
    renderHeader({ actions: <span data-testid="actions" /> });

    expect(
      screen.queryByRole('button', { name: /detalhes/ })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });

  it('defaults the badge tone to warning', () => {
    renderHeader({ status: { label: 'HUMANO' } });

    expect(
      screen.getByTestId('support-conversation-status')
    ).toBeInTheDocument();
  });

  it('compact mode keeps one row: badge next to the name, no selects or channel', () => {
    renderHeader({
      compact: true,
      statusOptions: [{ value: 'HUMANO', label: 'Humano' }],
      onStatusChange: jest.fn(),
      attendedBy: 'HUMANO',
      attendedByOptions: [{ value: 'HUMANO', label: 'Humano' }],
      onAttendedByChange: jest.fn(),
      channel: { label: 'Web' },
      institution: 'CE Santos Dumont',
      onToggleDetails: jest.fn(),
    });

    expect(screen.getByTestId('support-conversation-status')).toHaveTextContent(
      'HUMANO'
    );
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Atendido por')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('support-conversation-channel')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Abrir detalhes' })
    ).toBeInTheDocument();
  });
});
