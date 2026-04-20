/**
 * Test double for `remark-gfm`. The real plugin is ESM-only; our mocked
 * `react-markdown` ignores the plugins array, so the no-op default is
 * sufficient to satisfy the import.
 */
const remarkGfmMock = () => undefined;
export default remarkGfmMock;
