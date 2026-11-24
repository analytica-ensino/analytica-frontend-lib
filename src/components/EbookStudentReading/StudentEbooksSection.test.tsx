import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentEbooksSection } from './StudentEbooksSection';
import type { StudentAttachedEbook } from '../../types/ebookAttachment';

const ebook = (
  id: string,
  overrides: Partial<StudentAttachedEbook> = {}
): StudentAttachedEbook => ({
  id,
  code: `EB0${id}`,
  title: `Livro ${id}`,
  subtitle: null,
  coverUrl: null,
  category: 'Educação Financeira',
  percent: 0,
  effectiveReadAt: null,
  ...overrides,
});

describe('StudentEbooksSection', () => {
  it('shows each book with how much the student has read', () => {
    render(
      <StudentEbooksSection
        ebooks={[ebook('1', { percent: 33.33 }), ebook('2')]}
        onOpen={jest.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Leitura do livro' })
    ).toBeInTheDocument();
    const [first, second] = screen.getAllByTestId('student-ebook-card');
    expect(
      within(first).getByText('EB01 • Educação Financeira')
    ).toBeInTheDocument();
    expect(within(first).getByText('Livro 1')).toBeInTheDocument();
    expect(within(first).getByText('33% lido')).toBeInTheDocument();
    expect(within(second).getByText('0% lido')).toBeInTheDocument();
  });

  it('opens the reading of the book chosen', () => {
    const onOpen = jest.fn();
    const book = ebook('2');
    render(
      <StudentEbooksSection ebooks={[ebook('1'), book]} onOpen={onOpen} />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver detalhes da leitura de Livro 2',
      })
    );

    expect(onOpen).toHaveBeenCalledWith(book);
  });

  it('has no button when the reading cannot be opened', () => {
    render(<StudentEbooksSection ebooks={[ebook('1')]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
