import { act, fireEvent, render, screen } from '@testing-library/react';
import { SupportChatContactForm } from './SupportChatContactForm';

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const submit = async (name: string) => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
};

describe('SupportChatContactForm', () => {
  it('asks the name, then the e-mail, and shows what was saved', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <SupportChatContactForm
        fields={['name', 'email']}
        onSubmit={onSubmit}
        accentColor="#123456"
      />
    );

    expect(screen.getByText('1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Avançar' })).toHaveStyle({
      backgroundColor: '#123456',
    });

    await submit('Avançar');
    expect(screen.getByRole('alert')).toHaveTextContent('Digite seu nome');
    expect(screen.getByLabelText('Seu nome')).toHaveAttribute(
      'aria-invalid',
      'true'
    );

    fill('Seu nome', '  Ana  ');
    await submit('Avançar');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('2 de 2')).toBeInTheDocument();

    fill('Seu e-mail', 'ana@x');
    await submit('Enviar');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido'
    );
    expect(onSubmit).not.toHaveBeenCalled();

    // The browser validation is off: an incomplete e-mail gets the form message
    fill('Seu e-mail', 'ana@');
    await submit('Enviar');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido'
    );
    expect(onSubmit).not.toHaveBeenCalled();

    fill('Seu e-mail', 'Ana@Escola.com');
    await submit('Enviar');
    expect(onSubmit).toHaveBeenCalledWith({
      requesterName: 'Ana',
      email: 'ana@escola.com',
    });

    const saved = screen.getByTestId('support-chat-contact-saved');
    expect(saved).toHaveTextContent('Seu nome: Ana');
    expect(saved).toHaveTextContent('Seu e-mail: ana@escola.com');
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('sends a single field without the step counter', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<SupportChatContactForm fields={['email']} onSubmit={onSubmit} />);

    expect(screen.queryByText(/de 1/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).not.toHaveAttribute(
      'style'
    );

    fill('Seu e-mail', 'ana@x.com');
    await submit('Enviar');
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@x.com' });
    expect(screen.getByTestId('support-chat-contact-saved')).toHaveTextContent(
      'Seu e-mail: ana@x.com'
    );
  });

  it('sends only the name when it is the only field', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<SupportChatContactForm fields={['name']} onSubmit={onSubmit} />);

    fill('Seu nome', 'Bia');
    await submit('Enviar');
    expect(onSubmit).toHaveBeenCalledWith({ requesterName: 'Bia' });
  });

  it('disables the form while saving and stays when saving fails', async () => {
    let resolve: (ok: boolean) => void = () => undefined;
    const onSubmit = jest.fn(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        })
    );
    render(<SupportChatContactForm fields={['email']} onSubmit={onSubmit} />);

    fill('Seu e-mail', 'ana@x.com');
    await submit('Enviar');
    expect(screen.getByLabelText('Seu e-mail')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();

    await act(async () => {
      resolve(false);
    });
    expect(screen.getByLabelText('Seu e-mail')).not.toBeDisabled();
    expect(screen.getByLabelText('Seu e-mail')).toHaveValue('ana@x.com');
    expect(
      screen.queryByTestId('support-chat-contact-saved')
    ).not.toBeInTheDocument();
  });
});
