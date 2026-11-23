import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LessonEbooksSection } from './LessonEbooksSection';
import type { AttachableEbook } from '../../types/ebookAttachment';

const book = (
  id: string,
  overrides: Partial<AttachableEbook> = {}
): AttachableEbook => ({
  id,
  code: 'EB01',
  title: `Livro ${id}`,
  subtitle: null,
  coverUrl: null,
  category: 'Educação Financeira',
  segment: 'Anos Iniciais',
  schoolYears: ['4º ano'],
  ...overrides,
});

const handlers = () => ({
  onAdd: jest.fn(),
  onRemove: jest.fn(),
  onRemoveAll: jest.fn(),
});

describe('LessonEbooksSection', () => {
  it('shows only the title and the add button with no book', () => {
    const props = handlers();
    render(<LessonEbooksSection ebooks={[]} {...props} />);

    expect(
      screen.getByRole('heading', { name: 'Livro da aula' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/adicionado/)).not.toBeInTheDocument();
    expect(screen.queryByText('Remover tudo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar livro' }));
    expect(props.onAdd).toHaveBeenCalledTimes(1);
  });

  it('lists the books with their code, theme, year and segment', () => {
    render(
      <LessonEbooksSection
        ebooks={[book('1', { title: 'Meu pé de laranja lima' })]}
        {...handlers()}
      />
    );

    expect(screen.getByText('1 livro adicionado')).toBeInTheDocument();
    const card = screen.getByTestId('lesson-ebook-card');
    expect(
      within(card).getByText('EB01 • Educação Financeira')
    ).toBeInTheDocument();
    expect(
      within(card).getByText('Meu pé de laranja lima')
    ).toBeInTheDocument();
    expect(
      within(card).getByText('4º ano • Anos Iniciais')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar livro' })
    ).toBeInTheDocument();
  });

  it('counts in the plural and leaves out a missing audience', () => {
    render(
      <LessonEbooksSection
        ebooks={[book('1'), book('2', { segment: null, schoolYears: [] })]}
        {...handlers()}
      />
    );

    expect(screen.getByText('2 livros adicionados')).toBeInTheDocument();
    expect(screen.getAllByText('4º ano • Anos Iniciais')).toHaveLength(1);
  });

  it('removes one book or all of them', () => {
    const props = handlers();
    render(<LessonEbooksSection ebooks={[book('1'), book('2')]} {...props} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover o livro Livro 2' })
    );
    expect(props.onRemove).toHaveBeenCalledWith('2');

    fireEvent.click(screen.getByRole('button', { name: 'Remover tudo' }));
    expect(props.onRemoveAll).toHaveBeenCalledTimes(1);
  });
});
