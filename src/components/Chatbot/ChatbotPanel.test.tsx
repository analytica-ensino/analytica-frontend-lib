import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChatbotPanel from './ChatbotPanel';

function baseProps() {
  return {
    isOpen: true,
    onClose: jest.fn(),
    onStartNew: jest.fn(),
    historySlot: <div data-testid="slot-history">history</div>,
    messagesSlot: <div data-testid="slot-messages">messages</div>,
    inputSlot: <div data-testid="slot-input">input</div>,
  };
}

describe('ChatbotPanel', () => {
  it('renders nothing when closed', () => {
    render(<ChatbotPanel {...baseProps()} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with header, messages and input when open', () => {
    render(<ChatbotPanel {...baseProps()} />);
    expect(
      screen.getByRole('dialog', { name: /assistente de estudos/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('slot-messages')).toBeInTheDocument();
    expect(screen.getByTestId('slot-input')).toBeInTheDocument();
  });

  it('history slot is hidden by default and toggles on click', async () => {
    render(<ChatbotPanel {...baseProps()} />);
    expect(screen.queryByTestId('slot-history')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /mostrar histórico/i })
    );
    expect(screen.getByTestId('slot-history')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /ocultar histórico/i })
    );
    expect(screen.queryByTestId('slot-history')).not.toBeInTheDocument();
  });

  it('calls onClose and onStartNew when the buttons are clicked', async () => {
    const props = baseProps();
    render(<ChatbotPanel {...props} />);

    await userEvent.click(
      screen.getByRole('button', { name: /fechar assistente/i })
    );
    expect(props.onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole('button', { name: /nova conversa/i })
    );
    expect(props.onStartNew).toHaveBeenCalledTimes(1);
  });

  it('collapses the body when minimized and restores it when expanded', async () => {
    render(<ChatbotPanel {...baseProps()} />);

    expect(screen.getByTestId('slot-messages')).toBeInTheDocument();
    expect(screen.getByTestId('slot-input')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /minimizar assistente/i })
    );
    expect(screen.queryByTestId('slot-messages')).not.toBeInTheDocument();
    expect(screen.queryByTestId('slot-input')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /expandir assistente/i })
    );
    expect(screen.getByTestId('slot-messages')).toBeInTheDocument();
    expect(screen.getByTestId('slot-input')).toBeInTheDocument();
  });

  it('renders an error banner when errorMessage is set', () => {
    render(<ChatbotPanel {...baseProps()} errorMessage="deu ruim" />);
    expect(screen.getByText('deu ruim')).toBeInTheDocument();
  });

  it('invokes onClose when Escape is pressed while the panel is open', () => {
    const props = baseProps();
    render(<ChatbotPanel {...props} />);

    // Dispatch Escape at the document level — the listener is attached on
    // globalThis inside the panel's mount effect.
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    globalThis.dispatchEvent(event);

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores non-Escape key presses', () => {
    const props = baseProps();
    render(<ChatbotPanel {...props} />);

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(props.onClose).not.toHaveBeenCalled();
  });
});
