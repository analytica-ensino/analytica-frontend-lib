import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useState } from 'react';
import MaskedInput from './MaskedInput';
import { MASK_TYPE } from '../../utils/brazilianFormatters';

describe('MaskedInput', () => {
  it('renders as an input with the provided placeholder', () => {
    render(
      <MaskedInput
        mask={MASK_TYPE.CNPJ}
        placeholder="00.000.000/0000-00"
        onChange={jest.fn()}
      />
    );
    expect(
      screen.getByPlaceholderText('00.000.000/0000-00')
    ).toBeInTheDocument();
  });

  it('masks the controlled value coming in (CNPJ)', () => {
    render(
      <MaskedInput
        mask={MASK_TYPE.CNPJ}
        value="12345678000199"
        onChange={jest.fn()}
      />
    );
    const input = screen.getByDisplayValue('12.345.678/0001-99');
    expect(input).toBeInTheDocument();
  });

  it('masks the value emitted by onChange (CPF)', () => {
    const Wrapper = () => {
      const [value, setValue] = useState('');
      return (
        <MaskedInput
          mask={MASK_TYPE.CPF}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12345678909' } });
    expect(input).toHaveValue('123.456.789-09');
  });

  it('masks progressively while typing (Phone)', () => {
    const Wrapper = () => {
      const [value, setValue] = useState('');
      return (
        <MaskedInput
          mask={MASK_TYPE.PHONE}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1' } });
    expect(input).toHaveValue('(1');
    fireEvent.change(input, { target: { value: '11987654321' } });
    expect(input).toHaveValue('(11) 98765-4321');
  });

  it('masks the value emitted by onChange (CEP)', () => {
    const Wrapper = () => {
      const [value, setValue] = useState('');
      return (
        <MaskedInput
          mask={MASK_TYPE.CEP}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };
    render(<Wrapper />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '01310100' } });
    expect(input).toHaveValue('01310-100');
  });

  it('is idempotent - already masked values stay the same', () => {
    render(
      <MaskedInput
        mask={MASK_TYPE.CNPJ}
        value="12.345.678/0001-99"
        onChange={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue('12.345.678/0001-99')).toBeInTheDocument();
  });

  it('forwards label and other Input props correctly', () => {
    render(
      <MaskedInput
        mask={MASK_TYPE.CPF}
        label="CPF"
        variant="rounded"
        value=""
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText('CPF')).toBeInTheDocument();
  });

  it('does not transform non-string values', () => {
    // Input accepts number values via InputHTMLAttributes; just ensure no throw
    render(
      <MaskedInput
        mask={MASK_TYPE.CEP}
        value={undefined}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
