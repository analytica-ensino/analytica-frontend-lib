import { render, screen } from '@testing-library/react';
import NoSearchResult from './NoSearchResult';

describe('NoSearchResult', () => {
  const mockImage = 'data:image/png;base64,test';

  it('should render with default props', () => {
    render(<NoSearchResult image={mockImage} />);

    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Não encontramos nenhum resultado com esse nome. Tente revisar a busca ou usar outra palavra-chave.'
      )
    ).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    const customTitle = 'Título customizado';
    render(<NoSearchResult image={mockImage} title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('should render with custom description', () => {
    const customDescription = 'Descrição customizada';
    render(
      <NoSearchResult image={mockImage} description={customDescription} />
    );

    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    const customTitle = 'Título customizado';
    const customDescription = 'Descrição customizada';
    render(
      <NoSearchResult
        image={mockImage}
        title={customTitle}
        description={customDescription}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render image with correct src', () => {
    render(<NoSearchResult image={mockImage} />);

    const img = screen.getByAltText('No search results');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockImage);
  });

  it('should have correct layout classes', () => {
    const { container } = render(<NoSearchResult image={mockImage} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'flex',
      'flex-row',
      'justify-center',
      'items-center'
    );
  });

  it('should render title as h2', () => {
    render(<NoSearchResult image={mockImage} />);

    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveTextContent('Nenhum resultado encontrado');
  });
});
