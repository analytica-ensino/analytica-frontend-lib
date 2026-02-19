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
 * Sanitizes HTML content for safe display
 * Removes contenteditable attributes and other potentially dangerous attributes
 */
export const sanitizeHtmlForDisplay = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;

  // Create a temporary div to parse HTML
  if (typeof document === 'undefined') {
    // Server-side: just return as-is
    return htmlContent;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Remove contenteditable attributes
  const editableElements = tempDiv.querySelectorAll('[contenteditable]');
  editableElements.forEach((element) => {
    element.removeAttribute('contenteditable');
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
  content = content.replace(/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, '');

  // Remove HTML tags
  if (typeof document === 'undefined') {
    // Server-side: use regex
    return content.replace(/<[^>]*>/g, '').trim();
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  return (tempDiv.textContent || tempDiv.innerText || '').trim();
};
