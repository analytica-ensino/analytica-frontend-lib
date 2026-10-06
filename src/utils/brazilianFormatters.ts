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
 * Comprimento maximo aceito por cada tipo de mascara.
 */
const MASK_MAX_LENGTH: Record<MASK_TYPE, number> = {
  [MASK_TYPE.CNPJ]: 14,
  [MASK_TYPE.CPF]: 11,
  [MASK_TYPE.PHONE]: 11,
  [MASK_TYPE.CEP]: 8,
};

/**
 * Caracteres a descartar em cada tipo de mascara.
 *
 * O CNPJ aceita letras desde a IN RFB 2.229/2024; CPF, telefone e CEP seguem
 * exclusivamente numericos.
 */
const MASK_REJECTED_CHARS: Record<MASK_TYPE, RegExp> = {
  [MASK_TYPE.CNPJ]: /[^0-9A-Z]/g,
  [MASK_TYPE.CPF]: /\D/g,
  [MASK_TYPE.PHONE]: /\D/g,
  [MASK_TYPE.CEP]: /\D/g,
};

/** Posicoes alfanumericas do CNPJ; as duas restantes sao o digito verificador. */
const CNPJ_BASE_LENGTH = 12;

/**
 * Extrai os caracteres validos do valor sem truncar.
 * Use nos formatters, que validam comprimento exato antes de aplicar o padrao.
 */
const extractChars = (value: string, type: MASK_TYPE): string => {
  const chars = value.toUpperCase().replaceAll(MASK_REJECTED_CHARS[type], '');
  if (type !== MASK_TYPE.CNPJ) return chars;
  // Os dois digitos verificadores do CNPJ sao sempre numericos: letra digitada
  // nessas posicoes e descartada, nunca mascarada.
  return (
    chars.slice(0, CNPJ_BASE_LENGTH) +
    chars.slice(CNPJ_BASE_LENGTH).replaceAll(/\D/g, '')
  );
};

/**
 * Extrai os caracteres limitando ao maximo permitido pela mascara.
 * Use nas mascaras progressivas de input (o usuario nao deve conseguir
 * digitar alem do cap).
 */
const onlyChars = (value: string, type: MASK_TYPE): string =>
  extractChars(value, type).slice(0, MASK_MAX_LENGTH[type]);

// =====================================================================
// Formatadores: aplicam a mascara completa quando o valor tem todos os
// digitos. Use para EXIBIR valores ja armazenados (tabelas, detalhes).
// =====================================================================

/**
 * Formata um CNPJ completo (14 caracteres) no padrao XX.XXX.XXX/XXXX-XX.
 *
 * Aceita o formato alfanumerico da IN RFB 2.229/2024: as 12 primeiras
 * posicoes podem ser letras ou digitos, as duas ultimas sao sempre digitos.
 * Caso a entrada nao tenha 14 caracteres validos, retorna o valor original.
 */
export function formatCnpj(value: string): string {
  const chars = extractChars(value, MASK_TYPE.CNPJ);
  if (chars.length !== MASK_MAX_LENGTH[MASK_TYPE.CNPJ]) return value;
  return chars.replace(
    /^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata um CPF completo (11 digitos) no padrao XXX.XXX.XXX-XX.
 * Caso a entrada nao tenha 11 digitos, retorna o valor original.
 */
export function formatCpf(value: string): string {
  const digits = extractChars(value, MASK_TYPE.CPF);
  if (digits.length !== MASK_MAX_LENGTH[MASK_TYPE.CPF]) return value;
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Formata um telefone brasileiro completo nos padroes:
 * - Celular (11 digitos): (XX) XXXXX-XXXX
 * - Fixo (10 digitos): (XX) XXXX-XXXX
 * Caso a entrada nao tenha 10 ou 11 digitos, retorna o valor original.
 */
export function formatPhone(value: string): string {
  const digits = extractChars(value, MASK_TYPE.PHONE);
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
  const digits = extractChars(value, MASK_TYPE.CEP);
  if (digits.length !== MASK_MAX_LENGTH[MASK_TYPE.CEP]) return value;
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
  const chars = onlyChars(value, MASK_TYPE.CNPJ);
  return chars
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
    .replace(
      /^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})([0-9A-Z])/,
      '$1.$2.$3/$4'
    )
    .replace(
      /^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})\/([0-9A-Z]{4})(\d)/,
      '$1.$2.$3/$4-$5'
    );
}

/**
 * Aplica mascara progressiva de CPF enquanto o usuario digita.
 */
export function maskCpfInput(value: string): string {
  const digits = onlyChars(value, MASK_TYPE.CPF);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

/**
 * Aplica mascara progressiva de telefone brasileiro enquanto o usuario digita.
 */
export function maskPhoneInput(value: string): string {
  const digits = onlyChars(value, MASK_TYPE.PHONE);
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
  const digits = onlyChars(value, MASK_TYPE.CEP);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

// =====================================================================
// Validacao de CNPJ (modulo 11). Suporta o formato alfanumerico da
// IN RFB 2.229/2024 e, por consequencia aritmetica, o numerico anterior.
// =====================================================================

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Valor numerico de um caractere do CNPJ: code point menos 48.
 * Produz '0'-'9' => 0-9 e 'A'-'Z' => 17-42. Para entrada numerica o
 * resultado e identico a conversao direta, o que preserva a validacao
 * dos CNPJs ja cadastrados.
 *
 * A asserção é necessária e não cria ramo morto: `codePointAt` devolve
 * `number | undefined` porque a string poderia ser vazia, e `extractChars`
 * ja garante que todo caractere aqui esta em [0-9A-Z].
 */
const cnpjCharValue = (char: string): number => char.codePointAt(0)! - 48;

const cnpjCheckDigit = (chars: string, weights: number[]): number => {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += cnpjCharValue(chars[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Valida um CNPJ pelo algoritmo oficial de digitos verificadores.
 *
 * Aceita o valor com ou sem pontuacao e em qualquer caixa. Rejeita
 * `00000000000000`, o unico caso de sequencia repetida que passa no
 * modulo 11 — e, como o digito verificador e sempre numerico, nenhuma
 * string com letra pode ter 14 caracteres identicos.
 *
 * @example
 * ```ts
 * isValidCnpj('12.ABC.345/01DE-35'); // true
 * isValidCnpj('11222333000181');     // true
 * isValidCnpj('12ABC34501DE34');     // false (digito verificador errado)
 * ```
 */
export function isValidCnpj(value: string): boolean {
  const chars = extractChars(value, MASK_TYPE.CNPJ);
  if (chars.length !== MASK_MAX_LENGTH[MASK_TYPE.CNPJ]) return false;
  if (/^(\d)\1{13}$/.test(chars)) return false;

  const first = cnpjCheckDigit(
    chars.slice(0, CNPJ_BASE_LENGTH),
    CNPJ_FIRST_WEIGHTS
  );
  if (first !== Number(chars[CNPJ_BASE_LENGTH])) return false;

  const second = cnpjCheckDigit(chars.slice(0, 13), CNPJ_SECOND_WEIGHTS);
  return second === Number(chars[13]);
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
