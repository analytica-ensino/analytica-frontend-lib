import type { Story } from '@ladle/react';
import NoSearchResult, { NoSearchResultProps } from './NoSearchResult';

// Placeholder image data URI (magnifying glass with X icon)
const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Ccircle cx="80" cy="80" r="50" fill="none" stroke="%230066CC" stroke-width="8"/%3E%3Cline x1="120" y1="120" x2="180" y2="180" stroke="%230066CC" stroke-width="8" stroke-linecap="round"/%3E%3Cline x1="65" y1="65" x2="95" y2="95" stroke="%23CC0000" stroke-width="6" stroke-linecap="round"/%3E%3Cline x1="95" y1="65" x2="65" y2="95" stroke="%23CC0000" stroke-width="6" stroke-linecap="round"/%3E%3C/svg%3E';

/**
 * Default story with all default values
 */
export const Default: Story<NoSearchResultProps> = () => (
  <NoSearchResult image={placeholderImage} />
);

/**
 * Story with custom title
 */
export const CustomTitle: Story<NoSearchResultProps> = () => (
  <NoSearchResult image={placeholderImage} title="Ops! Nada por aqui" />
);

/**
 * Story with custom description
 */
export const CustomDescription: Story<NoSearchResultProps> = () => (
  <NoSearchResult
    image={placeholderImage}
    description="Tente usar filtros diferentes ou palavras-chave alternativas."
  />
);

/**
 * Story with both title and description customized
 */
export const FullCustom: Story<NoSearchResultProps> = () => (
  <NoSearchResult
    image={placeholderImage}
    title="Nenhum aluno encontrado"
    description="Não encontramos alunos com esse nome. Tente buscar por matrícula ou e-mail."
  />
);

/**
 * Story with long title to test wrapping
 */
export const LongTitle: Story<NoSearchResultProps> = () => (
  <NoSearchResult
    image={placeholderImage}
    title="Nenhum resultado foi encontrado para a sua pesquisa com os filtros aplicados"
  />
);

/**
 * Story with long description to test text overflow
 */
export const LongDescription: Story<NoSearchResultProps> = () => (
  <NoSearchResult
    image={placeholderImage}
    description="Não encontramos nenhum resultado que corresponda aos seus critérios de busca. Por favor, tente revisar os filtros aplicados, usar palavras-chave diferentes ou verificar a ortografia dos termos de pesquisa. Você também pode tentar ampliar os critérios de busca para obter mais resultados."
  />
);

/**
 * Story with minimal content
 */
export const ShortContent: Story<NoSearchResultProps> = () => (
  <NoSearchResult
    image={placeholderImage}
    title="Sem resultados"
    description="Tente novamente."
  />
);

/**
 * Story with empty strings (should show defaults)
 */
export const WithEmptyStrings: Story<NoSearchResultProps> = () => (
  <NoSearchResult image={placeholderImage} title="" description="" />
);
