import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

/** The module `src/components/EbookReader/webview/index.ts` imports. */
const VIRTUAL_MODULE = 'ebook-webview:html';
const NAMESPACE = 'ebook-webview';
const ENTRY = path.join(
  ROOT_DIR,
  'src/components/EbookReader/webview/main.tsx'
);

/**
 * What the page may load: its own inline script and styles (the book's
 * `<style>` included), and the book's images, fonts and narration from the
 * CDN. No requests from scripts: the app hands the book over through the
 * bridge.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src https: data:',
  'font-src https: data:',
  'media-src https:',
].join('; ');

/**
 * The WebView page around the bundled reader.
 * @param {string} script - The reader, as one IIFE
 * @param {string} styles - The reader's CSS
 */
const pageHtml = (script, styles) =>
  [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">',
    `<style>html,body,#root{height:100%;margin:0}body{overflow:hidden;background:#fff;-webkit-tap-highlight-color:transparent}${styles}</style>`,
    '</head>',
    '<body>',
    '<div id="root"></div>',
    // A `</script>` inside the bundle would end the tag early.
    `<script>${script.replaceAll('</script', String.raw`<\/script`)}</script>`,
    '</body>',
    '</html>',
  ].join('');

/**
 * Bundles the WebView reader (`webview/main.tsx`) with everything it imports,
 * React included (the page runs alone inside the app, with nothing to share),
 * into one HTML document.
 *
 * @param {import('esbuild')} esbuild - The esbuild API
 * @returns {Promise<{ html: string, inputs: string[] }>} The page, and the files it was built from
 */
export const buildEbookWebViewHtml = async (esbuild) => {
  const result = await esbuild.build({
    entryPoints: [ENTRY],
    absWorkingDir: ROOT_DIR,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    // The WebViews of the app's oldest supported phones.
    target: ['es2020', 'chrome80', 'safari14'],
    jsx: 'automatic',
    minify: true,
    write: false,
    outdir: 'ebook-webview',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
    metafile: true,
  });
  const output = (extension) =>
    result.outputFiles.find((file) => file.path.endsWith(extension))?.text ??
    '';
  return {
    html: pageHtml(output('.js'), output('.css')),
    inputs: Object.keys(result.metafile.inputs).map((input) =>
      path.join(ROOT_DIR, input)
    ),
  };
};

/**
 * Builds the ebook reader for a React Native WebView (AE-3323) into one HTML
 * document and hands it to the lib build as the default export of
 * `ebook-webview:html`.
 *
 * @returns An esbuild plugin for tsup's `esbuildPlugins`
 */
export const ebookWebViewHtmlPlugin = () => ({
  name: 'ebook-webview-html',
  setup(build) {
    build.onResolve({ filter: /^ebook-webview:html$/ }, () => ({
      path: VIRTUAL_MODULE,
      namespace: NAMESPACE,
    }));

    build.onLoad({ filter: /.*/, namespace: NAMESPACE }, async () => {
      const { html, inputs } = await buildEbookWebViewHtml(build.esbuild);
      return {
        contents: `export default ${JSON.stringify(html)};`,
        loader: 'js',
        // Rebuilt in watch mode when any file of the reader changes.
        watchFiles: inputs,
      };
    });
  },
});
