/**
 * Utilities for processing HTML content with LaTeX math expressions
 */

export interface MathPart {
  type: 'text' | 'math' | 'block-math';
  content: string;
  latex?: string;
}

/**
 * Cleans LaTeX string from invisible characters
 */
export const cleanLatex = (str: string): string => {
  // Remove zero-width characters, invisible characters, and other problematic Unicode
  return str.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
};

/**
 * Dangerous attributes that should be removed for XSS protection
 */
const DANGEROUS_ATTRIBUTES = [
  'contenteditable',
  'srcdoc',
  'formaction',
  'xlink:href',
];

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
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
    // Remove style tags
    sanitized = sanitized.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ''
    );
    // Remove on* event handlers (split into separate patterns to avoid ReDoS)
    sanitized = sanitized.replace(/ on[a-z]+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/ on[a-z]+='[^']*'/gi, '');
    sanitized = sanitized.replace(/ on[a-z]+=[^\s>"']+/gi, '');
    // Remove javascript: URIs
    sanitized = sanitized.replace(/ href="javascript:[^"]*"/gi, '');
    sanitized = sanitized.replace(/ href='javascript:[^']*'/gi, '');
    sanitized = sanitized.replace(/ src="javascript:[^"]*"/gi, '');
    sanitized = sanitized.replace(/ src='javascript:[^']*'/gi, '');
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
      if (DANGEROUS_ATTRIBUTES.includes(lowerAttrName)) {
        element.removeAttribute(attrName);
        return;
      }

      // Check href and src for dangerous URIs
      if (lowerAttrName === 'href' || lowerAttrName === 'src') {
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

  let processedContent = htmlContent;
  const parts: MathPart[] = [];

  // Step 1: Handle math-formula spans (from the editor)
  const mathFormulaPattern =
    /<span[^>]*class="math-formula"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/g;
  processedContent = processedContent.replace(
    mathFormulaPattern,
    (match, latex) => {
      const isDisplayMode = match.includes('data-display-mode="true"');
      const placeholder = `__MATH_${parts.length}__`;
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
  processedContent = processedContent.replace(
    wrappedMathPattern,
    (match, latex) => {
      const placeholder = `__MATH_${parts.length}__`;
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
  processedContent = processedContent.replace(
    doubleDollarPattern,
    (match, latex) => {
      const placeholder = `__MATH_${parts.length}__`;
      parts.push({
        type: 'block-math',
        content: match,
        latex: cleanLatex(latex),
      });
      return placeholder;
    }
  );

  // Step 4: Handle single $...$ expressions for inline math
  const singleDollarPattern = /(?<!\\)\$([\s\S]+?)\$/g;
  processedContent = processedContent.replace(
    singleDollarPattern,
    (match, latex) => {
      const placeholder = `__MATH_${parts.length}__`;
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
  processedContent = processedContent.replace(
    latexTagPattern,
    (match, latex) => {
      const placeholder = `__MATH_${parts.length}__`;
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
  processedContent = processedContent.replace(latexEnvPattern, (match) => {
    const placeholder = `__MATH_${parts.length}__`;
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
  const placeholderPattern = /__MATH_(\d+)__/g;
  let match;

  while ((match = placeholderPattern.exec(processedContent)) !== null) {
    // Add text before math
    if (match.index > currentIndex) {
      finalParts.push({
        type: 'text',
        content: processedContent.slice(currentIndex, match.index),
      });
    }

    // Add math expression
    const mathIndex = parseInt(match[1]);
    if (parts[mathIndex]) {
      finalParts.push(parts[mathIndex]);
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < processedContent.length) {
    finalParts.push({
      type: 'text',
      content: processedContent.slice(currentIndex),
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
  content = content.replace(
    /<span[^>]*class="math-formula"[^>]*>[\s\S]*?<\/span>/g,
    ''
  );

  // Remove math-expression spans (legacy)
  content = content.replace(
    /<span[^>]*class="math-expression"[^>]*>[\s\S]*?<\/span>/g,
    ''
  );

  // Remove $$...$$ block math
  content = content.replace(/\$\$[\s\S]+?\$\$/g, '');

  // Remove $...$ inline math
  content = content.replace(/\$[^$]+\$/g, '');

  // Remove <latex>...</latex> tags
  content = content.replace(
    /(?:<latex>|&lt;latex&gt;)[\s\S]*?(?:<\/latex>|&lt;\/latex&gt;)/g,
    ''
  );

  // Remove LaTeX environments like \begin{...}...\end{...}
  // Using non-greedy match without backreference to avoid ReDoS vulnerability
  content = content.replace(
    /\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\}/g,
    ''
  );

  // Remove HTML tags
  if (typeof document === 'undefined') {
    // Server-side: use regex (excluding both < and > prevents quadratic backtracking)
    return content.replace(/<[^<>]*>/g, '').trim();
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  return (tempDiv.textContent || tempDiv.innerText || '').trim();
};
