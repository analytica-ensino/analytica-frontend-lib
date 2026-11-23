import { useId } from 'react';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import Search from '../Search/Search';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import Text from '../Text/Text';
import type { EbookLibraryFacets } from '../../types/ebookAttachment';
import {
  ALL_EBOOKS_FILTER,
  type UseEbookLibraryFiltersReturn,
} from './useEbookLibraryFilters';

export interface EbookLibraryFiltersProps {
  /** The fields, from `useEbookLibraryFilters` */
  state: UseEbookLibraryFiltersReturn;
  /** The options of each filter, from the library's last answer */
  facets: EbookLibraryFacets | null;
}

/**
 * "Filtrar acervo" of a staff library screen: theme ("Tema"), segment
 * ("Público") and the search by title, author, theme, year or BNCC code.
 */
export const EbookLibraryFilters = ({
  state,
  facets,
}: Readonly<EbookLibraryFiltersProps>) => {
  const titleId = useId();
  const themes = facets?.themes ?? [];
  const segments = facets?.segments ?? [];

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-xl border border-border-100 bg-background p-4"
    >
      <div className="flex items-center gap-2 text-text-950">
        <SlidersHorizontalIcon size={20} aria-hidden="true" />
        <Text as="h2" id={titleId} size="md" weight="bold">
          Filtrar acervo
        </Text>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-col md:flex-1">
          <Select
            value={state.theme}
            onValueChange={state.setTheme}
            label="Tema"
          >
            <SelectTrigger aria-label="Tema">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_EBOOKS_FILTER}>Todos</SelectItem>
              {themes.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.name ?? option.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col md:flex-1">
          <Select
            value={state.segment}
            onValueChange={state.setSegment}
            label="Público"
          >
            <SelectTrigger aria-label="Público">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_EBOOKS_FILTER}>Todos</SelectItem>
              {segments.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Search
        options={[]}
        showDropdown={false}
        value={state.searchInput}
        onChange={(event) => state.setSearchInput(event.target.value)}
        placeholder="Buscar por título, autor, tema, ano ou código BNCC…"
        aria-label="Buscar livros"
        containerClassName="!w-full !max-w-none"
        data-testid="ebook-library-search"
      />
    </section>
  );
};
