import { render, screen, fireEvent } from '@testing-library/react';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  it('should render with label', () => {
    render(<ColorPicker label="Cor" value="#FF0000" />);

    expect(screen.getByText('Cor')).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    render(
      <ColorPicker label="Cor" value="#FF0000" helperText="Selecione uma cor" />
    );

    expect(screen.getByText('Selecione uma cor')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(
      <ColorPicker label="Cor" value="#FF0000" errorMessage="Cor inválida" />
    );

    expect(screen.getByText('Cor inválida')).toBeInTheDocument();
  });

  it('should hide helper text when error message is present', () => {
    render(
      <ColorPicker
        label="Cor"
        value="#FF0000"
        helperText="Selecione uma cor"
        errorMessage="Cor inválida"
      />
    );

    expect(screen.queryByText('Selecione uma cor')).not.toBeInTheDocument();
    expect(screen.getByText('Cor inválida')).toBeInTheDocument();
  });

  it('should call onChange when text input changes', () => {
    const handleChange = jest.fn();
    render(<ColorPicker label="Cor" value="#FF0000" onChange={handleChange} />);

    const textInput = screen.getByRole('textbox');
    fireEvent.change(textInput, { target: { value: '#00FF00' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display required indicator when required', () => {
    render(<ColorPicker label="Cor" value="#FF0000" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ColorPicker label="Cor" value="#FF0000" disabled />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeDisabled();
  });

  it('should render with default placeholder', () => {
    render(<ColorPicker label="Cor" />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toHaveAttribute('placeholder', '#FFFFFF');
  });

  it('should render with custom placeholder', () => {
    render(<ColorPicker label="Cor" placeholder="#000000" />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toHaveAttribute('placeholder', '#000000');
  });

  it('should have aria-invalid when error message is present', () => {
    render(<ColorPicker label="Cor" value="#FF0000" errorMessage="Error" />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should render both color and text inputs', () => {
    render(<ColorPicker label="Cor" value="#FF0000" />);

    const textInput = screen.getByRole('textbox');
    expect(textInput).toBeInTheDocument();
    expect(textInput).toHaveValue('#FF0000');
  });
});
