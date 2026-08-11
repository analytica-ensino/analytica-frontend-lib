/**
 * Essay Themes Types
 * Contract of `GET /essays/themes`, the theme bank a teacher picks from when
 * assembling an in-person exam booklet.
 */

/**
 * A supporting text shipped with the theme, shown to the student.
 */
export interface EssayThemeSupportingText {
  content: string;
  source?: string;
}

/**
 * Essay theme as returned by the API.
 */
export interface EssayTheme {
  id: string;
  title: string;
  description: string | null;
  supportingTexts: EssayThemeSupportingText[];
  isActive: boolean;
  createdAt: string;
  /**
   * Where the theme comes from, e.g. "Enem 2024" — rendered as the badge on the
   * theme card.
   *
   * PENDENTE: `essay_themes` has no origin/year column yet, so this is absent
   * until the backend adds it. The badge is simply not rendered meanwhile;
   * deriving it from `createdAt` would misdate every theme.
   */
  origin?: string | null;
}

/**
 * Pagination block of the themes listing.
 */
export interface EssayThemesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response of `GET /essays/themes`.
 */
export interface EssayThemesApiResponse {
  message: string;
  data: {
    themes: EssayTheme[];
    pagination: EssayThemesPagination;
  };
}

/**
 * Query parameters accepted by `GET /essays/themes`.
 */
export interface EssayThemeFilters {
  page?: number;
  limit?: number;
  search?: string;
}
