import type { Story } from '@ladle/react';
import ArticleContent from './ArticleContent';

const SAMPLE = `
<h2>Esqueci minha senha: como redefinir 🔑</h2>
<p>Se você esqueceu a senha, é possível criar uma nova em <strong>poucos passos</strong>, sem falar com a escola.</p>
<ol>
  <li>Na tela de login, clique em <em>“Esqueci minha senha”</em>.</li>
  <li>Informe o e-mail cadastrado e clique em “Enviar”.</li>
  <li>Abra o e-mail (confira o spam) e clique no link.</li>
</ol>
<blockquote><p>💡 O link expira em 30 minutos. Se expirar, é só pedir um novo.</p></blockquote>
<div data-video-embed class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" allowfullscreen="true" frameborder="0"></iframe></div>
<h3>Requisitos da senha</h3>
<table><tbody>
  <tr><th>Regra</th><th>Exemplo</th></tr>
  <tr><td>Mínimo de 8 caracteres</td><td><code>abc12345</code></td></tr>
</tbody></table>
<p>Ainda com dúvidas? <a href="https://example.com">Fale com o suporte</a>.</p>
`;

/**
 * Article body with headings, list, callout, video and table
 */
export const Default: Story = () => (
  <div className="max-w-3xl bg-background p-6">
    <ArticleContent html={SAMPLE} />
  </div>
);

/**
 * Scripts and iframes from other hosts are removed
 */
export const UnsafeInput: Story = () => (
  <div className="max-w-3xl bg-background p-6">
    <ArticleContent html='<p>Texto seguro.</p><script>alert(1)</script><iframe src="https://evil.com"></iframe>' />
  </div>
);
