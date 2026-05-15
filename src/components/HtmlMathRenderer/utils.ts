/**
 * Utilities for processing HTML content with LaTeX math expressions
 */

export interface MathPart {
  type: 'text' | 'math' | 'block-math';
  content: string;
  latex?: string;
}

/**
 * Generates a random ID for placeholder uniqueness
 * Uses crypto.randomUUID() (Web Crypto API - available in all modern browsers)
 */
const generateSecureRandomId = (): string => {
  return crypto.randomUUID();
};

/**
 * Cleans LaTeX string from invisible characters and decodes HTML entities
 * that the editor saved in place of math operators.
 *
 * Why decode here: KaTeX is a LaTeX parser, not an HTML parser. If the
 * source has `&lt;`/`&gt;` (because the editor HTML-escaped them on save)
 * KaTeX throws "Expected 'EOF', got '&'". `&lt;`/`&gt;` map to the
 * equivalent `\lt`/`\gt` commands. `&amp;` decodes back to a bare `&` \u2014
 * NOT `\&` \u2014 because in LaTeX `&` is the alignment character (used by
 * `\begin{align}`, matrices, etc.); rewriting it to `\&` would break
 * alignment and stop already-escaped `\&` from round-tripping.
 */
export const cleanLatex = (str: string): string => {
  return str
    .replaceAll(/[\u200B-\u200D\uFEFF]/g, '')
    .replaceAll(/&amp;lt;|&lt;/gi, String.raw`\lt `)
    .replaceAll(/&amp;gt;|&gt;/gi, String.raw`\gt `)
    .replaceAll(/&amp;amp;|&amp;/gi, '&')
    .trim();
};

/**
 * Heuristic that flags a string as "likely real LaTeX math" vs prose.
 * Used to reject `$...$` blocks that wrap regular text \u2014 typically
 * happens when authors type `$` as a currency symbol and the renderer
 * pairs unrelated occurrences as math delimiters, sending Portuguese
 * prose to KaTeX (which then renders each letter as a math variable).
 *
 * Approach:
 * - Backslash commands / sub-super / grouping braces \u2192 definitely math.
 * - Otherwise, treat it as PROSE only when it contains 2+ real words
 *   (runs of 3+ letters). A sentence like "15,00 pelo custo fixo" has
 *   many such words; genuine math \u2014 `x = 1`, `a + b`, `1 < 2`, `f0`,
 *   even a lone `abc` \u2014 does not. This keeps normal spaced equations
 *   rendering while still rejecting currency-`$` prose.
 */
const looksLikeLatex = (str: string): boolean => {
  if (/[\\^_{}]/.test(str)) return true;
  const words = str.match(/[a-zA-Z]{3,}/g);
  if (words && words.length >= 2) return false;
  return true;
};

/**
 * Recovers usable LaTeX source from `<span class="katex-error">` wrappers
 * that previous editor cycles persisted into the database. The error's
 * `title` attribute carries the original LaTeX after "at position N: ".
 * Replaces each wrapper with `$LATEX$` so downstream patterns can render
 * it cleanly via KaTeX.
 *
 * No-op outside browser contexts (no `document`).
 */
const recoverFromKatexErrorSpans = (htmlContent: string): string => {
  if (
    typeof document === 'undefined' ||
    !/class="[^"]*katex-error/i.test(htmlContent)
  ) {
    return htmlContent;
  }

  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = htmlContent;

  const sanitizeRecoveredLatex = (raw: string): string =>
    raw
      // Strip combining marks KaTeX puts in error titles at the error pos
      .replaceAll(/[\u0300-\u036F]/g, '')
      // Drop truncated tag markers leftover from broken serialization.
      // Done while literal `<`/`>` are still present (before they get
      // mapped to LaTeX commands below).
      .replaceAll(/<\/?[a-zA-Z][a-zA-Z0-9]*\s*>?$/g, '')
      // Map comparison operators to equivalent LaTeX commands. We match
      // both the entity forms AND the literal `<`/`>` characters: the
      // `title` attribute is entity-decoded by the DOM when read, so we
      // often get literal `<`/`>`. Mapping them to `\lt`/`\gt` also avoids
      // re-encoding to `&lt;`/`&gt;` on DOM serialization (which would make
      // `looksLikeLatex` reject the recovered block as non-math).
      // `&amp;` decodes to a bare `&` (the LaTeX alignment character), not
      // `\&`, so `\begin{align}` environments survive recovery.
      .replaceAll(/&amp;lt;|&lt;|</gi, String.raw`\lt `)
      .replaceAll(/&amp;gt;|&gt;|>/gi, String.raw`\gt `)
      .replaceAll(/&amp;amp;|&amp;/gi, '&')
      .trim();

  Array.from(tempContainer.querySelectorAll('.katex-error')).forEach(
    (errorNode) => {
      if (!tempContainer.contains(errorNode)) return;

      const title = errorNode.getAttribute('title') || '';
      // Note: no `\s*` before the capture group — `\s*(.+)` would let
      // whitespace be split ambiguously between the two, causing
      // super-linear backtracking (ReDoS). The capture is trimmed by
      // sanitizeRecoveredLatex below instead.
      const positionMatch = /at position\s+\d+:(.+)$/.exec(title);
      let recovered = positionMatch ? positionMatch[1] : '';

      if (!recovered) {
        // Fallback: collect from inner <annotation> elements, skipping the
        // visual `katex-html` layer to avoid duplicating Unicode glyphs.
        const parts: string[] = [];
        const walk = (n: Node) => {
          if (n.nodeType === Node.TEXT_NODE) {
            parts.push(n.textContent || '');
            return;
          }
          if (n.nodeType !== Node.ELEMENT_NODE) return;
          const el = n as Element;
          if (el.tagName.toLowerCase() === 'annotation') {
            parts.push(el.textContent || '');
            return;
          }
          if (el.classList.contains('katex-html')) return;
          Array.from(el.childNodes).forEach(walk);
        };
        Array.from(errorNode.childNodes).forEach(walk);
        recovered = parts.join(' ');
      }

      recovered = sanitizeRecoveredLatex(recovered);
      if (recovered) {
        errorNode.replaceWith(document.createTextNode(`$${recovered}$`));
      } else {
        errorNode.remove();
      }
    }
  );

  return tempContainer.innerHTML;
};

/**
 * Decodes `\$` escape sequences to literal `$` characters. Applied only to
 * text fragments outside math blocks \u2014 the `(?<!\\)` lookbehind in the
 * `$...$` matcher already skipped these, but the `\` is still in the output
 * unless we decode it. Without this, currency strings like `R\$ 130,00`
 * render with a visible backslash.
 */
const decodeDollarEscapes = (text: string): string =>
  text.replaceAll(String.raw`\$`, '$');

/**
 * Dangerous attributes that should be removed for XSS protection
 */
const DANGEROUS_ATTRIBUTES = new Set([
  'contenteditable',
  'srcdoc',
  'formaction',
  'xlink:href',
]);

/**
 * Dangerous URI schemes that should be removed from href/src attributes
 */
const DANGEROUS_URI_PATTERN = /^\s*(javascript|vbscript|data):/i;

/**
 * Sanitizes HTML content for safe display
 * Removes event handlers, dangerous attributes, script/style tags, and javascript: URIs
 */
export const sanitizeHtmlForDisplay = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;

  // Create a temporary div to parse HTML
  if (typeof document === 'undefined') {
    // Server-side: use regex-based sanitization as fallback
    let sanitized = htmlContent;
    // Remove script tags
    sanitized = sanitized.replaceAll(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    // Remove style tags
    sanitized = sanitized.replaceAll(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ''
    );
    // Remove on* event handlers (split into separate patterns to avoid ReDoS)
    sanitized = sanitized.replaceAll(/ on[a-z]+="[^"]*"/gi, '');
    sanitized = sanitized.replaceAll(/ on[a-z]+='[^']*'/gi, '');
    sanitized = sanitized.replaceAll(/ on[a-z]+=[^\s>"']+/gi, '');
    // Remove dangerous URI schemes (javascript, vbscript, data) - matching client-side DANGEROUS_URI_PATTERN
    sanitized = sanitized.replaceAll(
      / href="(?:javascript|vbscript|data):[^"]*"/gi,
      ''
    );
    sanitized = sanitized.replaceAll(
      / href='(?:javascript|vbscript|data):[^']*'/gi,
      ''
    );
    sanitized = sanitized.replaceAll(
      / src="(?:javascript|vbscript|data):[^"]*"/gi,
      ''
    );
    sanitized = sanitized.replaceAll(
      / src='(?:javascript|vbscript|data):[^']*'/gi,
      ''
    );
    sanitized = sanitized.replaceAll(
      / action="(?:javascript|vbscript|data):[^"]*"/gi,
      ''
    );
    sanitized = sanitized.replaceAll(
      / action='(?:javascript|vbscript|data):[^']*'/gi,
      ''
    );
    return sanitized;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Remove script and style tags entirely
  const dangerousTags = tempDiv.querySelectorAll(
    'script, style, iframe, object, embed'
  );
  dangerousTags.forEach((element) => element.remove());

  // Process all elements
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((element) => {
    // Get all attribute names
    const attributeNames = element.getAttributeNames();

    attributeNames.forEach((attrName) => {
      const lowerAttrName = attrName.toLowerCase();

      // Remove all on* event handler attributes (onclick, onerror, onload, etc.)
      if (lowerAttrName.startsWith('on')) {
        element.removeAttribute(attrName);
        return;
      }

      // Remove dangerous attributes
      if (DANGEROUS_ATTRIBUTES.has(lowerAttrName)) {
        element.removeAttribute(attrName);
        return;
      }

      // Check href, src, and action for dangerous URIs
      if (
        lowerAttrName === 'href' ||
        lowerAttrName === 'src' ||
        lowerAttrName === 'action'
      ) {
        const value = element.getAttribute(attrName);
        if (value && DANGEROUS_URI_PATTERN.test(value)) {
          element.removeAttribute(attrName);
        }
      }
    });
  });

  return tempDiv.innerHTML;
};

/**
 * Processes HTML content and extracts math expressions
 * Returns an array of parts (text and math) for rendering
 */
export const processHtmlWithMath = (htmlContent: string): MathPart[] => {
  if (!htmlContent) return [];

  // Pre-pass: recover original LaTeX from any `katex-error` wrappers that
  // older editor saves left in the content. This turns persisted error HTML
  // into clean `$LATEX$` strings so the steps below can render them.
  let processedContent = recoverFromKatexErrorSpans(htmlContent);
  const parts: MathPart[] = [];

  // Generate unique sentinel per call to avoid collision with content
  const sentinel = `__MATH_${generateSecureRandomId()}_`;

  // Step 1: Handle math-formula spans (from the editor)
  const mathFormulaPattern =
    /<span[^>]*class="math-formula"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/g;
  processedContent = processedContent.replaceAll(
    mathFormulaPattern,
    (match, latex) => {
      const isDisplayMode = match.includes('data-display-mode="true"');
      const placeholder = `${sentinel}${parts.length}__`;
      parts.push({
        type: isDisplayMode ? 'block-math' : 'math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 2: Handle wrapped math expressions (from math modal - legacy)
  const wrappedMathPattern =
    /<span[^>]*class="math-expression"[^>]*data-math="([^"]*)"[^>]*>.*?<\/span>/g;
  processedContent = processedContent.replaceAll(
    wrappedMathPattern,
    (match, latex) => {
      const placeholder = `${sentinel}${parts.length}__`;
      parts.push({
        type: 'math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 3: Handle raw $$...$$ expressions (display mode) - BEFORE single $
  const doubleDollarPattern = /(?<!\\)\$\$([\s\S]+?)\$\$/g;
  processedContent = processedContent.replaceAll(
    doubleDollarPattern,
    (match, latex) => {
      const placeholder = `${sentinel}${parts.length}__`;
      parts.push({
        type: 'block-math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 4: Handle single $...$ expressions for inline math.
  // Skip matches whose content doesn't look like LaTeX — those are usually
  // currency `$` symbols pairing up across prose (e.g. `R$ 15,00 ... R$ 42,00`)
  // and sending Portuguese text to KaTeX produces gibberish output.
  const singleDollarPattern = /(?<!\\)\$([\s\S]+?)\$/g;
  processedContent = processedContent.replaceAll(
    singleDollarPattern,
    (match, latex) => {
      if (!looksLikeLatex(latex)) return match;
      const placeholder = `${sentinel}${parts.length}__`;
      parts.push({
        type: 'math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 5: Handle <latex>...</latex> tags for inline math
  const latexTagPattern =
    /(?:<latex>|&lt;latex&gt;)([\s\S]*?)(?:<\/latex>|&lt;\/latex&gt;)/g;
  processedContent = processedContent.replaceAll(
    latexTagPattern,
    (match, latex) => {
      const placeholder = `${sentinel}${parts.length}__`;
      parts.push({
        type: 'math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 6: Handle standalone LaTeX environments (align, equation, pmatrix, etc.)
  const latexEnvPattern = /\\begin\{([^}]+)\}([\s\S]*?)\\end\{\1\}/g;
  processedContent = processedContent.replaceAll(latexEnvPattern, (match) => {
    const placeholder = `${sentinel}${parts.length}__`;
    parts.push({
      type: 'block-math',
      content: match,
      latex: cleanLatex(match),
    });
    return placeholder;
  });

  // Step 7: Split remaining content by placeholders
  const finalParts: MathPart[] = [];
  let currentIndex = 0;
  // Escape sentinel for regex (though it should be safe alphanumeric)
  const escapedSentinel = sentinel.replaceAll(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`
  );
  const placeholderPattern = new RegExp(
    String.raw`${escapedSentinel}(\d+)__`,
    'g'
  );
  let match;

  while ((match = placeholderPattern.exec(processedContent)) !== null) {
    // Add text before math
    if (match.index > currentIndex) {
      finalParts.push({
        type: 'text',
        content: decodeDollarEscapes(
          processedContent.slice(currentIndex, match.index)
        ),
      });
    }

    // Add math expression
    const mathIndex = Number.parseInt(match[1], 10);
    if (parts[mathIndex]) {
      finalParts.push(parts[mathIndex]);
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < processedContent.length) {
    finalParts.push({
      type: 'text',
      content: decodeDollarEscapes(processedContent.slice(currentIndex)),
    });
  }

  return finalParts;
};

/**
 * Checks if content contains any math expressions
 */
export const containsMath = (content: string): boolean => {
  if (!content) return false;

  // Check for various math patterns
  const patterns = [
    /\$\$[\s\S]+?\$\$/, // Display mode $$...$$
    /(?<!\\)\$[\s\S]+?\$/, // Inline mode $...$
    /<span[^>]*class="math-formula"/, // Editor spans
    /<span[^>]*class="math-expression"/, // Legacy spans
    /<latex>|&lt;latex&gt;/, // LaTeX tags
    /\\begin\{[^}]+\}/, // LaTeX environments
  ];

  return patterns.some((pattern) => pattern.test(content));
};

/**
 * Extracts plain text from HTML content (removes all tags and LaTeX notation)
 */
export const stripHtml = (htmlContent: string): string => {
  if (!htmlContent) return '';

  let content = htmlContent;

  // Remove math-formula spans (keep nothing as the LaTeX is in data attribute)
  content = content.replaceAll(
    /<span[^>]*class="math-formula"[^>]*>[\s\S]*?<\/span>/g,
    ''
  );

  // Remove math-expression spans (legacy)
  content = content.replaceAll(
    /<span[^>]*class="math-expression"[^>]*>[\s\S]*?<\/span>/g,
    ''
  );

  // Remove $$...$$ block math
  content = content.replaceAll(/\$\$[\s\S]+?\$\$/g, '');

  // Remove $...$ inline math
  content = content.replaceAll(/\$[^$]+\$/g, '');

  // Remove <latex>...</latex> tags
  content = content.replaceAll(
    /(?:<latex>|&lt;latex&gt;)[\s\S]*?(?:<\/latex>|&lt;\/latex&gt;)/g,
    ''
  );

  // Remove LaTeX environments like \begin{...}...\end{...}
  // Using non-greedy match without backreference to avoid ReDoS vulnerability
  content = content.replaceAll(
    /\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\}/g,
    ''
  );

  // Remove HTML tags
  if (typeof document === 'undefined') {
    // Server-side: use regex (excluding both < and > prevents quadratic backtracking)
    return content.replaceAll(/<[^<>]*>/g, '').trim();
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  return (tempDiv.textContent || tempDiv.innerText || '').trim();
};
