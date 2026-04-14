/**
 * Tipos de mascara/formatador disponiveis para documentos e contatos brasileiros.
 */
export enum MASK_TYPE {
  /** CNPJ - 14 digitos no padrao XX.XXX.XXX/XXXX-XX */
  CNPJ = 'CNPJ',
  /** CPF - 11 digitos no padrao XXX.XXX.XXX-XX */
  CPF = 'CPF',
  /** Telefone brasileiro - 10 ou 11 digitos */
  PHONE = 'PHONE',
  /** CEP - 8 digitos no padrao XXXXX-XXX */
  CEP = 'CEP',
}

/**
 * Quantidade maxima de digitos aceita por cada tipo de mascara.
 */
const MASK_MAX_DIGITS: Record<MASK_TYPE, number> = {
  [MASK_TYPE.CNPJ]: 14,
  [MASK_TYPE.CPF]: 11,
  [MASK_TYPE.PHONE]: 11,
  [MASK_TYPE.CEP]: 8,
};

/**
 * Extrai todos os digitos do valor sem truncar.
 * Use nos formatters, que validam comprimento exato antes de aplicar o padrao.
 */
const extractDigits = (value: string): string => value.replaceAll(/\D/g, '');

/**
 * Extrai os digitos limitando ao maximo permitido pela mascara.
 * Use nas mascaras progressivas de input (o usuario nao deve conseguir
 * digitar alem do cap).
 */
const onlyDigits = (value: string, type: MASK_TYPE): string =>
  extractDigits(value).slice(0, MASK_MAX_DIGITS[type]);

// =====================================================================
// Formatadores: aplicam a mascara completa quando o valor tem todos os
// digitos. Use para EXIBIR valores ja armazenados (tabelas, detalhes).
// =====================================================================

/**
 * Formata um CNPJ completo (14 digitos) no padrao XX.XXX.XXX/XXXX-XX.
 * Caso a entrada nao tenha 14 digitos, retorna o valor original.
 */
export function formatCnpj(value: string): string {
  const digits = extractDigits(value);
  if (digits.length !== MASK_MAX_DIGITS[MASK_TYPE.CNPJ]) return value;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata um CPF completo (11 digitos) no padrao XXX.XXX.XXX-XX.
 * Caso a entrada nao tenha 11 digitos, retorna o valor original.
 */
export function formatCpf(value: string): string {
  const digits = extractDigits(value);
  if (digits.length !== MASK_MAX_DIGITS[MASK_TYPE.CPF]) return value;
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Formata um telefone brasileiro completo nos padroes:
 * - Celular (11 digitos): (XX) XXXXX-XXXX
 * - Fixo (10 digitos): (XX) XXXX-XXXX
 * Caso a entrada nao tenha 10 ou 11 digitos, retorna o valor original.
 */
export function formatPhone(value: string): string {
  const digits = extractDigits(value);
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return value;
}

/**
 * Formata um CEP completo (8 digitos) no padrao XXXXX-XXX.
 * Caso a entrada nao tenha 8 digitos, retorna o valor original.
 */
export function formatCep(value: string): string {
  const digits = extractDigits(value);
  if (digits.length !== MASK_MAX_DIGITS[MASK_TYPE.CEP]) return value;
  return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

// =====================================================================
// Mascaras progressivas: aplicam o formato parcialmente conforme o
// usuario digita. Use no onChange de inputs.
// =====================================================================

/**
 * Aplica mascara progressiva de CNPJ enquanto o usuario digita.
 */
export function maskCnpjInput(value: string): string {
  const digits = onlyDigits(value, MASK_TYPE.CNPJ);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

/**
 * Aplica mascara progressiva de CPF enquanto o usuario digita.
 */
export function maskCpfInput(value: string): string {
  const digits = onlyDigits(value, MASK_TYPE.CPF);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/**
 * Aplica mascara progressiva de telefone brasileiro enquanto o usuario digita.
 */
export function maskPhoneInput(value: string): string {
  const digits = onlyDigits(value, MASK_TYPE.PHONE);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
  if (digits.length <= 10)
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Aplica mascara progressiva de CEP enquanto o usuario digita.
 */
export function maskCepInput(value: string): string {
  const digits = onlyDigits(value, MASK_TYPE.CEP);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

// =====================================================================
// API generica via enum: util quando o tipo de mascara e dinamico
// (ex.: input que troca entre CNPJ/CPF baseado em radio).
// =====================================================================

const MASKERS: Record<MASK_TYPE, (value: string) => string> = {
  [MASK_TYPE.CNPJ]: maskCnpjInput,
  [MASK_TYPE.CPF]: maskCpfInput,
  [MASK_TYPE.PHONE]: maskPhoneInput,
  [MASK_TYPE.CEP]: maskCepInput,
};

const FORMATTERS: Record<MASK_TYPE, (value: string) => string> = {
  [MASK_TYPE.CNPJ]: formatCnpj,
  [MASK_TYPE.CPF]: formatCpf,
  [MASK_TYPE.PHONE]: formatPhone,
  [MASK_TYPE.CEP]: formatCep,
};

/**
 * Aplica a mascara progressiva do tipo informado (uso em onChange de inputs).
 */
export function applyInputMask(value: string, type: MASK_TYPE): string {
  return MASKERS[type](value);
}

/**
 * Aplica o formatador completo do tipo informado (uso em exibicao).
 */
export function formatDocument(value: string, type: MASK_TYPE): string {
  return FORMATTERS[type](value);
}
