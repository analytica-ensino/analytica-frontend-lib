/**
 * Join an array of selected ids into the backend's comma-separated convention
 * (e.g. `schoolIds=a,b,c`). Returns undefined for empty / non-array input so the
 * query param is omitted entirely.
 *
 * Arrays must never be handed to axios directly: it serializes them as
 * `classIds[]=a&classIds[]=b`, and the backend's query parser keeps the
 * brackets in the key, so the filter is dropped and the endpoint silently
 * answers as if no filter had been sent.
 *
 * @param value - The selected ids, usually straight from a filter state
 * @returns The comma-separated ids, or undefined when there is nothing to send
 *
 * @example
 * ```ts
 * toCsv(['a', 'b']); // → 'a,b'
 * toCsv([]);         // → undefined
 * ```
 */
export const toCsv = (value: unknown): string | undefined => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join(',');
  }
  return undefined;
};
