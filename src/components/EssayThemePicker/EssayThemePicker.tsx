import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TextAlignLeftIcon } from '@phosphor-icons/react/dist/csr/TextAlignLeft';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/csr/ClipboardText';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Input from '../Input/Input';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import type { EssayTheme } from '../../types/essayThemes';
import { createUseEssayThemes } from '../../hooks/useEssayThemes';

/**
 * Props for the EssayThemePicker component
 */
export interface EssayThemePickerProps {
  /** API client used to read the theme bank */
  apiClient: BaseApiClient;
  /** Theme currently attached to the activity, if any */
  selectedTheme: EssayTheme | null;
  /** Called when the teacher attaches a theme */
  onSelectTheme: (theme: EssayTheme) => void;
  /** Called when the teacher detaches the current theme */
  onRemoveTheme: () => void;
  /** Called by the "Baixar pdf" action of the preview panel */
  onDownloadPdf?: () => void;
}

/** How many themes are read per page. */
const THEMES_PAGE_SIZE = 20;

/** Debounce applied to the search box, to avoid a request per keystroke. */
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Card of a single theme, used both in the bank and in the preview panel.
 *
 * @param theme - Theme to render
 * @param action - Optional footer action (e.g. the "add" button)
 * @returns Theme card element
 */
const ThemeCard = ({
  theme,
  action,
}: {
  theme: EssayTheme;
  action?: ReactNode;
}) => (
  <div className="border border-border-100 rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3">
      {/* The badge only shows once the backend carries the theme origin. */}
      {theme.origin ? (
        <Badge variant="solid" action="muted" size="small">
          {theme.origin}
        </Badge>
      ) : (
        <span />
      )}
      {/* Decorative: marks the card as an essay theme. */}
      <ClipboardTextIcon
        size={20}
        className="text-primary-700 shrink-0"
        aria-hidden
      />
    </div>

    <Text className="text-sm font-bold text-text-950">{theme.title}</Text>

    {action}
  </div>
);

/**
 * "Redação" tab of the activity builder: the teacher browses the essay theme
 * bank on the left and sees the theme attached to the activity on the right.
 *
 * An in-person exam carries at most one theme (`activities.essay_theme_id`), so
 * picking a new one replaces the previous.
 *
 * @returns The essay tab content
 */
export const EssayThemePicker = ({
  apiClient,
  selectedTheme,
  onSelectTheme,
  onRemoveTheme,
  onDownloadPdf,
}: EssayThemePickerProps) => {
  const useEssayThemes = useMemo(
    () => createUseEssayThemes(apiClient),
    [apiClient]
  );
  const { themes, loading, error, pagination, fetchThemes } = useEssayThemes();

  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchThemes({ page: 1, limit: THEMES_PAGE_SIZE, search });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [fetchThemes, search]);

  const handleSelect = useCallback(
    (theme: EssayTheme) => () => onSelectTheme(theme),
    [onSelectTheme]
  );

  /** The attached theme is shown on the right, not offered again on the left. */
  const availableThemes = useMemo(
    () => themes.filter((theme) => theme.id !== selectedTheme?.id),
    [themes, selectedTheme?.id]
  );

  return (
    <div
      data-testid="essay-theme-picker"
      className="flex flex-col lg:flex-row w-full flex-1 overflow-hidden gap-5 min-h-0"
    >
      {/* Theme bank */}
      <div className="flex-1 min-w-0 bg-background rounded-xl p-6 flex flex-col gap-4 min-h-0">
        <div className="flex items-center gap-2">
          <TextAlignLeftIcon size={20} className="text-text-950" aria-hidden />
          <Text className="text-lg font-bold text-text-950">
            Banco de temas
          </Text>
        </div>

        <Badge
          variant="solid"
          action="muted"
          size="small"
          className="self-start"
        >
          {pagination.total} {pagination.total === 1 ? 'tema' : 'temas'} total
        </Badge>

        <Input
          placeholder="Buscar"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          iconRight={<MagnifyingGlassIcon size={20} />}
        />

        <div className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
          {loading && (
            <>
              <SkeletonRounded className="h-32 w-full" />
              <SkeletonRounded className="h-32 w-full" />
            </>
          )}

          {!loading && error && (
            <Text className="text-sm text-error-700">{error}</Text>
          )}

          {!loading && !error && availableThemes.length === 0 && (
            <Text className="text-sm text-text-600">
              Nenhum tema encontrado.
            </Text>
          )}

          {!loading &&
            !error &&
            availableThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                action={
                  <Button
                    variant="outline"
                    size="small"
                    className="w-full border-dashed"
                    iconLeft={<PlusIcon size={16} />}
                    onClick={handleSelect(theme)}
                  >
                    Adicionar à atividade
                  </Button>
                }
              />
            ))}
        </div>
      </div>

      {/* Activity preview */}
      <div
        className={cn(
          'bg-background rounded-xl p-6 flex flex-col gap-4 min-h-0',
          'w-full lg:w-[420px] lg:flex-shrink-0'
        )}
      >
        <div className="flex items-center gap-2">
          <FileIcon size={20} className="text-text-950" aria-hidden />
          <Text className="text-lg font-bold text-text-950">
            Prévia da atividade
          </Text>
        </div>

        <Button
          variant="outline"
          size="small"
          className="self-start"
          iconLeft={<DownloadSimpleIcon size={16} />}
          onClick={onDownloadPdf}
          disabled={!onDownloadPdf || !selectedTheme}
        >
          Baixar pdf
        </Button>

        <div className="flex items-center justify-between gap-2">
          <Text className="text-lg font-bold text-text-950">Tema</Text>
          {selectedTheme && (
            <IconButton
              icon={<TrashIcon size={20} />}
              size="sm"
              title="Remover tema"
              aria-label="Remover tema"
              className="hover:text-error-500"
              onClick={onRemoveTheme}
            />
          )}
        </div>

        {selectedTheme ? (
          <ThemeCard theme={selectedTheme} />
        ) : (
          <Text className="text-sm text-text-600">
            Nenhum tema adicionado. Escolha um tema no banco ao lado.
          </Text>
        )}
      </div>
    </div>
  );
};

export default EssayThemePicker;
