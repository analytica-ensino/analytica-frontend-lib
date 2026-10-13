import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportConcludeModal, {
  type SupportConcludeModalProps,
} from './SupportConcludeModal';
import {
  SUPPORT_CONCLUSION_OUTCOME,
  SUPPORT_PROBLEM_TYPE,
} from '../../types/supportConclusion';

const makeApiClient = () => ({
  patch: jest.fn().mockResolvedValue({ data: { id: 'ticket-1' } }),
});

const renderModal = (overrides: Partial<SupportConcludeModalProps> = {}) => {
  const props: SupportConcludeModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    ticketId: 'ticket-1',
    ticketLabel: '4808',
    apiClient: makeApiClient(),
    ...overrides,
  };
  const utils = render(<SupportConcludeModal {...props} />);
  return { ...utils, props };
};

const getCategorySelect = () => screen.getAllByRole('combobox')[0];
const getSubReasonSelect = () => screen.getAllByRole('combobox')[1];
const getConcludeButton = () =>
  screen.getByRole('button', { name: 'Concluir atendimento' });

const chooseOption = (combobox: HTMLElement, label: string) => {
  fireEvent.click(combobox);
  fireEvent.click(screen.getByRole('option', { name: label }));
};

describe('SupportConcludeModal', () => {
  it('renders the title, subtitle and default outcome', () => {
    renderModal();

    expect(screen.getByText('Concluir atendimento #4808')).toBeInTheDocument();
    expect(
      screen.getByText('Esses dados são obrigatórios e alimentam o dashboard.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Sim, resolvido' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(getSubReasonSelect()).toBeDisabled();
    expect(getConcludeButton()).toBeDisabled();
  });

  it('uses a generic title without ticket label', () => {
    renderModal({ ticketLabel: undefined });

    expect(
      screen.getByRole('heading', { name: 'Concluir atendimento' })
    ).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByText('Concluir atendimento #4808')
    ).not.toBeInTheDocument();
  });

  it('enables the sub-reason select after choosing a category', () => {
    renderModal();

    chooseOption(getCategorySelect(), 'Acesso e login');

    expect(getSubReasonSelect()).toBeEnabled();
    expect(getConcludeButton()).toBeDisabled();

    chooseOption(getSubReasonSelect(), 'Esqueci a senha');

    expect(getConcludeButton()).toBeEnabled();
  });

  it('resets the sub-reason when the category changes', () => {
    renderModal();

    chooseOption(getCategorySelect(), 'Acesso e login');
    chooseOption(getSubReasonSelect(), 'Esqueci a senha');
    chooseOption(getCategorySelect(), 'Conteúdo');

    expect(getConcludeButton()).toBeDisabled();
  });

  it('asks for a description when the reason is "Outros"', () => {
    renderModal();

    chooseOption(getCategorySelect(), 'Outros');

    expect(getSubReasonSelect()).toBeDisabled();
    expect(getConcludeButton()).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Descreva o motivo/), {
      target: { value: 'Pedido de certificado' },
    });

    expect(getConcludeButton()).toBeEnabled();
  });

  it('offers the technical ticket only for platform errors', () => {
    renderModal();

    expect(
      screen.queryByLabelText('Abrir ticket técnico')
    ).not.toBeInTheDocument();

    chooseOption(getCategorySelect(), 'Erro da plataforma');
    const techTicket = screen.getByLabelText('Abrir ticket técnico');
    fireEvent.click(techTicket);

    expect(techTicket).toBeChecked();
  });

  it('concludes the ticket and returns every collected value', async () => {
    const onConcluded = jest.fn();
    const { props } = renderModal({ onConcluded });

    chooseOption(getCategorySelect(), 'Erro da plataforma');
    chooseOption(getSubReasonSelect(), 'Bug');
    fireEvent.click(
      screen.getByRole('radio', { name: 'Não resolvido (encaminhado)' })
    );
    fireEvent.change(screen.getByLabelText('Observação interna'), {
      target: { value: 'Problema persistiu no Android 14' },
    });
    fireEvent.click(screen.getByLabelText('Abrir ticket técnico'));
    fireEvent.click(screen.getByLabelText('Esta dúvida deveria virar FAQ'));
    fireEvent.click(getConcludeButton());

    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
    expect(props.apiClient.patch).toHaveBeenCalledWith(
      '/support/admin/ticket-1',
      {
        status: 'FECHADO',
        problemType: SUPPORT_PROBLEM_TYPE.PLATFORM_ERROR,
        notes: 'Problema persistiu no Android 14',
      }
    );
    expect(onConcluded).toHaveBeenCalledWith(
      {
        reason: 'platform-error',
        subReason: 'bug',
        description: '',
        outcome: SUPPORT_CONCLUSION_OUTCOME.NOT_RESOLVED_FORWARDED,
        internalNote: 'Problema persistiu no Android 14',
        suggestFaq: true,
        openTechTicket: true,
      },
      { id: 'ticket-1' }
    );
  });

  it('closes without onConcluded callback', async () => {
    const { props } = renderModal();

    chooseOption(getCategorySelect(), 'Outros');
    fireEvent.change(screen.getByLabelText(/Descreva o motivo/), {
      target: { value: 'Pedido de certificado' },
    });
    fireEvent.click(getConcludeButton());

    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
  });

  it('disables the buttons while submitting', async () => {
    let resolveRequest: (value: { data: unknown }) => void = () => undefined;
    const apiClient = {
      patch: jest.fn().mockImplementation(
        () =>
          new Promise<{ data: unknown }>((resolve) => {
            resolveRequest = resolve;
          })
      ),
    };
    renderModal({ apiClient });

    chooseOption(getCategorySelect(), 'Outros');
    fireEvent.change(screen.getByLabelText(/Descreva o motivo/), {
      target: { value: 'Pedido' },
    });
    fireEvent.click(getConcludeButton());

    expect(getConcludeButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    resolveRequest({ data: {} });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    );
  });

  it('shows the API error and keeps the modal open', async () => {
    const apiClient = {
      patch: jest.fn().mockRejectedValue({
        response: {
          data: {
            message:
              'Não é possível resolver o ticket sem identificar o tipo de problema',
          },
        },
      }),
    };
    const { props } = renderModal({ apiClient });

    chooseOption(getCategorySelect(), 'Outros');
    fireEvent.change(screen.getByLabelText(/Descreva o motivo/), {
      target: { value: 'Pedido' },
    });
    fireEvent.click(getConcludeButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não é possível resolver o ticket sem identificar o tipo de problema'
    );
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('cancels without calling the API', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.apiClient.patch).not.toHaveBeenCalled();
  });

  it('does not submit an invalid form', () => {
    const { props } = renderModal();

    fireEvent.click(getConcludeButton());

    expect(props.apiClient.patch).not.toHaveBeenCalled();
  });

  it('resets the form when reopened', () => {
    const { props, rerender } = renderModal();

    chooseOption(getCategorySelect(), 'Outros');
    fireEvent.click(
      screen.getByRole('radio', { name: 'Sem resposta do usuário' })
    );

    rerender(<SupportConcludeModal {...props} isOpen={false} />);
    rerender(<SupportConcludeModal {...props} isOpen />);

    expect(
      screen.getByRole('radio', { name: 'Sim, resolvido' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.queryByLabelText(/Descreva o motivo/)
    ).not.toBeInTheDocument();
  });
});
