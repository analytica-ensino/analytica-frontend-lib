import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleContent from './ArticleContent';
import { sanitizeArticleHtml } from './sanitizeArticleHtml';

const PLAYER = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';

describe('sanitizeArticleHtml', () => {
  it('keeps formatting, images, tables and allowed players', () => {
    const html = sanitizeArticleHtml(
      '<h2>Título</h2><p><strong>a</strong> 🎉</p><ul><li>x</li></ul>' +
        '<img src="https://cdn.example/a.png" alt="A">' +
        '<table><tbody><tr><td>c</td></tr></tbody></table>' +
        `<div data-video-embed class="video-embed"><iframe src="${PLAYER}" allowfullscreen="true" frameborder="0"></iframe></div>`
    );
    expect(html).toContain('<h2>Título</h2>');
    expect(html).toContain('🎉');
    expect(html).toContain('<img src="https://cdn.example/a.png" alt="A">');
    expect(html).toContain('<td>c</td>');
    expect(html).toContain('data-video-embed=""');
    expect(html).toContain(`<iframe src="${PLAYER}"`);
    expect(html).toContain('allowfullscreen="true"');
  });

  it('removes scripts, handlers and foreign iframes', () => {
    const html = sanitizeArticleHtml(
      '<p onclick="x()">ok</p><script>alert(1)</script>' +
        '<iframe src="https://evil.com/x"></iframe><iframe></iframe>'
    );
    expect(html).toBe('<p>ok</p>');
  });

  it('opens external links in a new tab, leaves relative ones alone', () => {
    const html = sanitizeArticleHtml(
      '<a href="https://site.com">a</a><a href="/artigo/1">b</a><a>c</a>'
    );
    expect(html).toContain(
      '<a href="https://site.com" target="_blank" rel="noopener noreferrer">a</a>'
    );
    expect(html).toContain('<a href="/artigo/1">b</a>');
  });
});

describe('ArticleContent', () => {
  it('renders the sanitized body inside the article scope', () => {
    render(
      <ArticleContent
        data-testid="article"
        className="mt-4"
        html="<p>Olá</p><script>alert(1)</script>"
      />
    );
    const article = screen.getByTestId('article');
    expect(article).toHaveAttribute('data-analytica-article');
    expect(article).toHaveClass('text-text-950', 'mt-4');
    expect(article.innerHTML).toBe('<p>Olá</p>');
  });
});
