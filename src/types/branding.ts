/**
 * Interface representing institution branding data.
 */
export interface BrandingData {
  /**
   * The institution ID this branding belongs to.
   * Used to prevent cross-institution branding contamination.
   */
  institutionId: string;
  /**
   * Theme name for white-label theming
   */
  theme: string | null;
  /**
   * URL for the favicon
   */
  favicon: string | null;
  /**
   * URL for the apple touch icon
   */
  icon: string | null;
  /**
   * URL for the main logo
   */
  mainLogo: string | null;
  /**
   * URL for the internal logo
   */
  internalLogo: string | null;
  /**
   * URL for the login page image
   */
  loginImage: string | null;
}
