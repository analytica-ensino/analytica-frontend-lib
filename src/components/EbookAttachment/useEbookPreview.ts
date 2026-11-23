import { useEffect, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type { EbookPreviewData } from '../../types/ebookAttachment';
import type { EbookContent, EbookNarration } from '../EbookReader/EbookReader';

export interface UseEbookPreviewReturn {
  preview: EbookPreviewData | null;
  content: EbookContent | null;
  error: boolean;
}

/**
 * The text of one processed file, or empty when the version has none.
 *
 * @param url - The file's address
 * @returns Its text
 */
const fetchText = async (url: string | null): Promise<string> => {
  if (!url) return '';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar ${url}`);
  return response.text();
};

/**
 * The processed files of the version the reader shows.
 *
 * @param preview - The book in preview
 * @returns What the reader draws
 */
const loadContent = async (
  preview: EbookPreviewData
): Promise<EbookContent> => {
  const { version } = preview;
  const [html, css, narration] = await Promise.all([
    fetchText(version.htmlUrl),
    fetchText(version.cssUrl),
    fetchText(version.narrationUrl),
  ]);
  return {
    html,
    css,
    narration: narration ? (JSON.parse(narration) as EbookNarration) : null,
    assetBaseUrl: version.assetBaseUrl ?? '',
  };
};

/**
 * A book in preview (`GET /ebooks/:id/preview`, which records nothing) and
 * its processed files, for the EBOOK 07 reader. A change of book drops what
 * the previous one was still loading.
 *
 * @param apiClient - The host's API client
 * @param ebookId - The book, or null when none is open
 * @returns The book, its content once downloaded, and whether it failed
 */
export const useEbookPreview = (
  apiClient: BaseApiClient,
  ebookId: string | null
): UseEbookPreviewReturn => {
  const [preview, setPreview] = useState<EbookPreviewData | null>(null);
  const [content, setContent] = useState<EbookContent | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPreview(null);
    setContent(null);
    setError(false);
    if (!ebookId) return;

    let active = true;
    (async () => {
      try {
        const response = await apiClient.get<{ data: EbookPreviewData }>(
          `/ebooks/${ebookId}/preview`
        );
        const data = response.data.data;
        const loaded = await loadContent(data);
        if (!active) return;
        setPreview(data);
        setContent(loaded);
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiClient, ebookId]);

  return { preview, content, error };
};
