import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoDialog } from './VideoDialog';

const renderDialog = () => {
  const onInsert = jest.fn();
  const onClose = jest.fn();
  render(<VideoDialog open onClose={onClose} onInsert={onInsert} />);
  return { onInsert, onClose };
};

describe('VideoDialog', () => {
  it('converts the link and inserts the player URL', () => {
    const { onInsert, onClose } = renderDialog();
    const confirm = screen.getByRole('button', { name: 'Inserir vídeo' });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Link do vídeo'), {
      target: { value: 'https://youtu.be/dQw4w9WgXcQ' },
    });
    fireEvent.click(confirm);

    expect(onInsert).toHaveBeenCalledWith(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('shows an error for an unsupported link and clears it on typing', () => {
    const { onInsert } = renderDialog();
    const input = screen.getByLabelText('Link do vídeo');
    fireEvent.change(input, { target: { value: 'https://example.com/v' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inserir vídeo' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use um link do YouTube ou do Vimeo.'
    );
    expect(onInsert).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'https://vimeo.com/1' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cancels', () => {
    const { onClose, onInsert } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
    expect(onInsert).not.toHaveBeenCalled();
  });
});
