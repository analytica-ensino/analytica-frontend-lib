import { fireEvent, render, screen } from '@testing-library/react';
import {
  EbookReaderHeader,
  type EbookReaderHeaderProps,
} from './EbookReaderHeader';
import { EBOOK_MATERIAL_TYPE } from './types';

const renderHeader = (props: Partial<EbookReaderHeaderProps> = {}) => {
  const onToggleDetails = jest.fn();
  render(
    <EbookReaderHeader
      title="O Caso da Couve Mordida"
      material={EBOOK_MATERIAL_TYPE.STUDENT}
      detailsId="ficha"
      detailsOpen={false}
      onToggleDetails={onToggleDetails}
      {...props}
    />
  );
  return { onToggleDetails };
};

describe('EbookReaderHeader', () => {
  it('shows the title and the subtitle', () => {
    renderHeader({ subtitle: '4º ano · Educação 4.0 e 5.0' });

    expect(
      screen.getByRole('heading', { name: 'O Caso da Couve Mordida' })
    ).toBeInTheDocument();
    expect(screen.getByText('4º ano · Educação 4.0 e 5.0')).toBeInTheDocument();
  });

  it('goes back with the back button', () => {
    const onBack = jest.fn();
    renderHeader({ onBack });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(onBack).toHaveBeenCalled();
  });

  it('has no back button without a way back', () => {
    renderHeader();

    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
  });

  describe('material tabs', () => {
    it('are not shown to the student', () => {
      renderHeader();

      expect(screen.queryByRole('tab')).toBeNull();
    });

    it('mark the material on screen and switch to the other one', () => {
      const onMaterialChange = jest.fn();
      renderHeader({ onMaterialChange });

      expect(
        screen.getByRole('tab', { name: 'Livro do estudante' })
      ).toHaveAttribute('aria-selected', 'true');
      fireEvent.click(screen.getByRole('tab', { name: 'Guia do professor' }));

      expect(onMaterialChange).toHaveBeenCalledWith(
        EBOOK_MATERIAL_TYPE.TEACHER
      );
    });

    it('mark the guide when it is on screen', () => {
      renderHeader({
        material: EBOOK_MATERIAL_TYPE.TEACHER,
        onMaterialChange: jest.fn(),
      });

      expect(
        screen.getByRole('tab', { name: 'Guia do professor' })
      ).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('details toggle', () => {
    it('opens the closed panel', () => {
      const { onToggleDetails } = renderHeader();
      const toggle = screen.getByRole('button', {
        name: 'Abrir a ficha do material',
      });

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveAttribute('aria-controls', 'ficha');
      fireEvent.click(toggle);
      expect(onToggleDetails).toHaveBeenCalled();
    });

    it('closes the open panel', () => {
      renderHeader({ detailsOpen: true });

      expect(
        screen.getByRole('button', { name: 'Fechar a ficha do material' })
      ).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('renders the header actions after the title and before the tabs', () => {
    renderHeader({
      onMaterialChange: jest.fn(),
      headerActions: <button type="button">Editar</button>,
    });

    const action = screen.getByRole('button', { name: 'Editar' });
    const heading = screen.getByRole('heading', {
      name: 'O Caso da Couve Mordida',
    });
    const tabs = screen.getByRole('tablist');
    expect(
      heading.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      action.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('renders no actions wrapper without headerActions', () => {
    renderHeader();

    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
  });
});
