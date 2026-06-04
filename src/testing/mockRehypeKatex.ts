/**
 * Test double for `rehype-katex`. The real plugin is ESM-only; our mocked
 * `react-markdown` ignores the plugins array, so the no-op default is
 * sufficient to satisfy the import.
 */
const rehypeKatexMock = () => undefined;
export default rehypeKatexMock;
