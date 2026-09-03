/**
 * Clipboard handling for images pasted straight into the RichEditor.
 *
 * A screenshot on the clipboard arrives as a `File` on the paste event, but the
 * editor schema rejects base64 sources, so the file has to be uploaded before
 * it can be inserted. These helpers isolate the clipboard reading from the
 * upload flow in `RichEditorCore`, which keeps them testable without a real
 * ProseMirror view.
 */

import { MAX_IMAGE_SIZE } from './imageSize';

/** Base name given to a clipboard image that arrives without a filename. */
const PASTED_IMAGE_BASENAME = 'imagem-colada';

/**
 * Extension per MIME type accepted by the storage backend. Keyed by the types a
 * browser actually puts on the clipboard when copying an image.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
};

/** Extension used when the clipboard reports an image type we do not map. */
const FALLBACK_EXTENSION = 'png';

/**
 * Reads the image files carried by a paste event.
 * Anything that is not an image is left alone so the default paste behaviour
 * still handles it.
 * @param clipboardData - The `clipboardData` of the paste event
 * @returns The image files found, in clipboard order
 */
export const extractPastedImageFiles = (
  clipboardData: DataTransfer | null | undefined
): File[] => {
  if (!clipboardData?.files) return [];

  return Array.from(clipboardData.files).filter((file) =>
    file.type.startsWith('image/')
  );
};

/**
 * Guarantees the file has a name before it reaches the upload.
 * Some browsers hand over a nameless blob for a screenshot, and the pre-signed
 * URL request sends `file.name` to the backend — an empty name would be
 * rejected there.
 * @param file - The image file taken from the clipboard
 * @returns The original file when it is already named, a renamed copy otherwise
 */
export const namePastedImage = (file: File): File => {
  if (file.name) return file;

  const extension = EXTENSION_BY_MIME[file.type] ?? FALLBACK_EXTENSION;
  return new File([file], `${PASTED_IMAGE_BASENAME}.${extension}`, {
    type: file.type,
  });
};

const isOversized = (file: File) => file.size > MAX_IMAGE_SIZE;

/**
 * Whether the clipboard markup should win over the image file it came with.
 *
 * Copying a range from Excel or Google Sheets puts both an HTML table and a
 * picture of it on the clipboard; taking the picture would silently turn a
 * pasteable table into a figure. Markup that carries its own `<img>` is the
 * opposite case — copying a picture from Word sends `<img src="file:///...">`,
 * which would paste as a broken image, so there the file is the good source.
 * @param clipboardData - The `clipboardData` of the paste event
 * @returns True when the default paste handling should keep the markup
 */
const prefersMarkup = (clipboardData: DataTransfer) => {
  const html = clipboardData.getData('text/html');
  return html !== '' && !/<img\b/i.test(html);
};

interface PastedImageHandlerOptions {
  /** Whether the consumer opted into pasting images. */
  readonly enabled: boolean;
  /** Upload callback. Without one there is nowhere to put the file. */
  readonly upload?: (file: File) => Promise<string>;
  /** Receives the named images to upload, once the clipboard is accepted. */
  readonly onImages: (
    files: File[],
    upload: (file: File) => Promise<string>
  ) => void;
  /** Called instead of `onImages` when any image is over the size limit. */
  readonly onOversized: () => void;
}

/**
 * Builds the handler Tiptap calls on every paste.
 *
 * Returning false leaves the paste to the default handling, so text, HTML and
 * anything else keep behaving exactly as before — only a clipboard carrying
 * image files is taken over.
 * @param options - Upload wiring and the callbacks used to report the outcome
 * @returns A handler that reports whether it consumed the paste
 */
export const createPastedImageHandler =
  ({ enabled, upload, onImages, onOversized }: PastedImageHandlerOptions) =>
  (event: ClipboardEvent): boolean => {
    if (!enabled || !upload) return false;

    const clipboard = event.clipboardData;
    if (!clipboard) return false;

    const files = extractPastedImageFiles(clipboard);
    if (files.length === 0 || prefersMarkup(clipboard)) return false;

    // From here on the paste belongs to us: the default handler would drop the
    // file anyway, since the editor schema rejects base64 image sources.
    event.preventDefault();

    if (files.some(isOversized)) {
      onOversized();
      return true;
    }

    onImages(files.map(namePastedImage), upload);
    return true;
  };
