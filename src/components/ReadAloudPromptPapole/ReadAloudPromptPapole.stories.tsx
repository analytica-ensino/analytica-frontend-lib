import type { Story } from '@ladle/react';
import { ReadAloudPromptPapole } from './ReadAloudPromptPapole';

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
