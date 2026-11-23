import { useState } from 'react';
import type { Story } from '@ladle/react';
import { LessonEbooksSection } from './LessonEbooksSection';
import type { AttachableEbook } from '../../types/ebookAttachment';

const books: AttachableEbook[] = [
  {
    id: 'eb-1',
    code: 'EB01',
    title: 'Meu pé de laranja lima',
    subtitle: null,
    coverUrl: null,
    category: 'Educação Financeira',
    segment: 'Anos Iniciais',
    schoolYears: ['4º ano'],
  },
  {
    id: 'eb-2',
    code: 'EB40',
    title: 'O Caso da Couve Mordida',
    subtitle: null,
    coverUrl: null,
    category: 'Educação 4.0 e 5.0',
    segment: 'Anos Iniciais',
    schoolYears: ['5º ano'],
  },
];

/**
 * "Livro da aula" no fim da prévia da atividade ou da aula recomendada:
 * vazio, só o botão; com livros, a contagem, "Remover tudo" e um card por
 * livro.
 */
export const LivroDaAula: Story = () => {
  const [ebooks, setEbooks] = useState<AttachableEbook[]>(books);

  return (
    <div className="max-w-md bg-background p-4">
      <LessonEbooksSection
        ebooks={ebooks}
        onAdd={() => setEbooks(books)}
        onRemove={(id) =>
          setEbooks((current) => current.filter((ebook) => ebook.id !== id))
        }
        onRemoveAll={() => setEbooks([])}
      />
    </div>
  );
};

export const SemLivros: Story = () => (
  <div className="max-w-md bg-background p-4">
    <LessonEbooksSection
      ebooks={[]}
      onAdd={() => undefined}
      onRemove={() => undefined}
      onRemoveAll={() => undefined}
    />
  </div>
);
