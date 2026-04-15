/**
 * Lista das 27 unidades federativas do Brasil (26 estados + DF) em ordem alfabetica.
 */
export const UF_LIST = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

/**
 * Tipo representando uma sigla de unidade federativa brasileira.
 */
export type UF = (typeof UF_LIST)[number];

/**
 * Lista das unidades federativas com sigla e nome completo, em ordem alfabetica.
 */
export const BR_STATES_FULL: { uf: UF; name: string }[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'TO', name: 'Tocantins' },
];
