/**
 * The page of the WebView reader, built from `main.tsx` at build time by
 * `scripts/ebook-webview/htmlPlugin.mjs` (a tsup esbuild plugin).
 */
declare module 'ebook-webview:html' {
  const html: string;
  export default html;
}
