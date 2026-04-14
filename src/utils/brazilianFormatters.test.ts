import {
  MASK_TYPE,
  applyInputMask,
  formatCep,
  formatCnpj,
  formatCpf,
  formatDocument,
  formatPhone,
  maskCepInput,
  maskCnpjInput,
  maskCpfInput,
  maskPhoneInput,
} from './brazilianFormatters';

describe('brazilianFormatters', () => {
  describe('formatCnpj', () => {
    it('formats a 14-digit CNPJ string', () => {
      expect(formatCnpj('12345678000199')).toBe('12.345.678/0001-99');
    });

    it('strips non-digits before formatting', () => {
      expect(formatCnpj('12.345.678/0001-99')).toBe('12.345.678/0001-99');
    });

    it('returns the original value when length is invalid', () => {
      expect(formatCnpj('12345')).toBe('12345');
    });
  });

  describe('formatCpf', () => {
    it('formats an 11-digit CPF string', () => {
      expect(formatCpf('12345678909')).toBe('123.456.789-09');
    });

    it('returns the original value when length is invalid', () => {
      expect(formatCpf('123')).toBe('123');
    });
  });

  describe('formatPhone', () => {
    it('formats an 11-digit mobile phone', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('formats a 10-digit landline phone', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    });

    it('returns the original value when length is invalid', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });

  describe('formatCep', () => {
    it('formats an 8-digit CEP', () => {
      expect(formatCep('01310100')).toBe('01310-100');
    });

    it('returns the original value when length is invalid', () => {
      expect(formatCep('1234')).toBe('1234');
    });
  });

  describe('maskCnpjInput', () => {
    it('applies progressive mask as user types', () => {
      expect(maskCnpjInput('1')).toBe('1');
      expect(maskCnpjInput('12')).toBe('12');
      expect(maskCnpjInput('123')).toBe('12.3');
      expect(maskCnpjInput('12345')).toBe('12.345');
      expect(maskCnpjInput('12345678')).toBe('12.345.678');
      expect(maskCnpjInput('123456780001')).toBe('12.345.678/0001');
      expect(maskCnpjInput('12345678000199')).toBe('12.345.678/0001-99');
    });

    it('caps at 14 digits', () => {
      expect(maskCnpjInput('123456780001999999')).toBe('12.345.678/0001-99');
    });
  });

  describe('maskCpfInput', () => {
    it('applies progressive mask as user types', () => {
      expect(maskCpfInput('123')).toBe('123');
      expect(maskCpfInput('1234')).toBe('123.4');
      expect(maskCpfInput('1234567')).toBe('123.456.7');
      expect(maskCpfInput('12345678909')).toBe('123.456.789-09');
    });

    it('caps at 11 digits', () => {
      expect(maskCpfInput('1234567890999')).toBe('123.456.789-09');
    });
  });

  describe('maskPhoneInput', () => {
    it('applies progressive mask as user types', () => {
      expect(maskPhoneInput('1')).toBe('(1');
      expect(maskPhoneInput('11')).toBe('(11');
      expect(maskPhoneInput('1133')).toBe('(11) 33');
      expect(maskPhoneInput('1133334444')).toBe('(11) 3333-4444');
      expect(maskPhoneInput('11987654321')).toBe('(11) 98765-4321');
    });

    it('caps at 11 digits', () => {
      expect(maskPhoneInput('1198765432199')).toBe('(11) 98765-4321');
    });
  });

  describe('maskCepInput', () => {
    it('applies progressive mask as user types', () => {
      expect(maskCepInput('013')).toBe('013');
      expect(maskCepInput('01310')).toBe('01310');
      expect(maskCepInput('013101')).toBe('01310-1');
      expect(maskCepInput('01310100')).toBe('01310-100');
    });

    it('caps at 8 digits', () => {
      expect(maskCepInput('0131010099')).toBe('01310-100');
    });
  });

  describe('applyInputMask', () => {
    it('dispatches to the correct masker by enum', () => {
      expect(applyInputMask('12345678000199', MASK_TYPE.CNPJ)).toBe(
        '12.345.678/0001-99'
      );
      expect(applyInputMask('12345678909', MASK_TYPE.CPF)).toBe(
        '123.456.789-09'
      );
      expect(applyInputMask('11987654321', MASK_TYPE.PHONE)).toBe(
        '(11) 98765-4321'
      );
      expect(applyInputMask('01310100', MASK_TYPE.CEP)).toBe('01310-100');
    });
  });

  describe('formatDocument', () => {
    it('dispatches to the correct formatter by enum', () => {
      expect(formatDocument('12345678000199', MASK_TYPE.CNPJ)).toBe(
        '12.345.678/0001-99'
      );
      expect(formatDocument('12345678909', MASK_TYPE.CPF)).toBe(
        '123.456.789-09'
      );
      expect(formatDocument('11987654321', MASK_TYPE.PHONE)).toBe(
        '(11) 98765-4321'
      );
      expect(formatDocument('01310100', MASK_TYPE.CEP)).toBe('01310-100');
    });
  });
});
