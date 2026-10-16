import { useState, type ChangeEvent } from 'react';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import { toVideoEmbedUrl } from '../../../utils/videoEmbed';

interface VideoDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Receives the player URL (already converted from the pasted link) */
  readonly onInsert: (src: string) => void;
}

const INVALID_URL = 'Use um link do YouTube ou do Vimeo.';

/**
 * Asks for a YouTube or Vimeo link and hands back its player URL.
 */
export function VideoDialog({ open, onClose, onInsert }: VideoDialogProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setUrl('');
    setError('');
    onClose();
  };

  const handleInsert = () => {
    const src = toVideoEmbedUrl(url);
    if (!src) {
      setError(INVALID_URL);
      return;
    }
    onInsert(src);
    handleClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Inserir vídeo"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            onClick={handleInsert}
            disabled={!url.trim()}
          >
            Inserir vídeo
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Text weight="medium" className="text-xs text-text-600 block">
          Link do vídeo
        </Text>
        <Input
          type="url"
          aria-label="Link do vídeo"
          value={url}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setUrl(event.target.value);
            setError('');
          }}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <Text size="xs" className="text-text-400">
          Aceita links do YouTube e do Vimeo.
        </Text>
        {error && (
          <Text size="xs" role="alert" className="text-error-600">
            {error}
          </Text>
        )}
      </div>
    </Modal>
  );
}
