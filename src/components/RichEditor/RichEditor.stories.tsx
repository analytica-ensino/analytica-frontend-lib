import type { Story } from '@ladle/react';
import { useState } from 'react';
import { RichEditor } from './RichEditor';
import ArticleContent from '../ArticleContent/ArticleContent';

/**
 * Default editor (as used in questions): no video, no emoji
 */
export const Default: Story = () => (
  <div className="max-w-3xl p-6">
    <RichEditor placeholder="Digite o enunciado..." />
  </div>
);

/**
 * Help-center article editor: `enableVideoEmbed` + `enableEmoji`, with the
 * rendered result below
 */
export const WithVideoAndEmoji: Story = () => {
  const [html, setHtml] = useState('');
  return (
    <div className="flex max-w-3xl flex-col gap-6 p-6">
      <RichEditor
        enableVideoEmbed
        enableEmoji
        placeholder="Escreva o artigo..."
        onChange={(data) => setHtml(data.html)}
      />
      <ArticleContent html={html} />
    </div>
  );
};
