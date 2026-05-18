/**
 * Standard pagination data structure
 * Used across history, drafts, and models pages
 */
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
