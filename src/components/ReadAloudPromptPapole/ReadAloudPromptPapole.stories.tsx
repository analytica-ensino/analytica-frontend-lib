import type { Story } from '@ladle/react';
import { ReadAloudPromptPapole } from './ReadAloudPromptPapole';

// Imagem "do cliente" (data URI, sem depender de rede) pra demonstrar o override
// via `imageSrc` quando o gif empacotado da lib não resolve no bundle.
const clientImage =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='203' height='254'><rect width='203' height='254' rx='20' fill='#7C5CFF'/><text x='101' y='120' font-family='sans-serif' font-size='26' font-weight='bold' fill='#ffffff' text-anchor='middle'>IMAGEM</text><text x='101' y='152' font-family='sans-serif' font-size='26' font-weight='bold' fill='#ffffff' text-anchor='middle'>CLIENTE</text></svg>"
  );

export const ReadAloudPrompt: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[420px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <ReadAloudPromptPapole text="O mar é azul. A onda vai e vem." />
  </div>
);

export const ReadAloudPromptLongo: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[420px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <ReadAloudPromptPapole text="O gato subiu no telhado. A lua brilhava no céu e o vento soprava devagar." />
  </div>
);

/**
 * Override da imagem via `imageSrc`: quando o gif Papolê empacotado na lib não
 * resolve no bundle do consumidor, ele passa a própria URL (aqui um data URI de
 * exemplo no lugar do `Motion mouth and eyes.gif`).
 */
export const ReadAloudPromptComImagemDoCliente: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[420px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <ReadAloudPromptPapole
      text="O mar é azul. A onda vai e vem."
      imageSrc={clientImage}
    />
  </div>
);
