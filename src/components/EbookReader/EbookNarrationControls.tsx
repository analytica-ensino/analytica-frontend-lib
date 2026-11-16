import { EyeIcon } from '@phosphor-icons/react/dist/csr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/csr/EyeSlash';
import { SpeakerHighIcon } from '@phosphor-icons/react/dist/csr/SpeakerHigh';
import { StopIcon } from '@phosphor-icons/react/dist/csr/Stop';
import Button from '../Button/Button';

export interface EbookNarrationControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
  /** The audio description switch shows only when some clip describes an image */
  hasAudioDescription: boolean;
  withAudioDescription: boolean;
  onToggleAudioDescription: () => void;
}

/**
 * "Ouvir" / "Parar" for the recorded narration and, when the book has image
 * descriptions, the "AD" switch that reads or skips them.
 */
export const EbookNarrationControls = ({
  isPlaying,
  onToggle,
  hasAudioDescription,
  withAudioDescription,
  onToggleAudioDescription,
}: Readonly<EbookNarrationControlsProps>) => (
  <>
    <Button
      variant="outline"
      size="small"
      iconLeft={isPlaying ? <StopIcon /> : <SpeakerHighIcon />}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Parar' : 'Ouvir'}
      title={isPlaying ? 'Parar a narração' : 'Ouvir o livro narrado'}
      onClick={onToggle}
    >
      <span className="hidden sm:inline">{isPlaying ? 'Parar' : 'Ouvir'}</span>
    </Button>
    {hasAudioDescription && (
      <Button
        variant="outline"
        size="small"
        iconLeft={withAudioDescription ? <EyeIcon /> : <EyeSlashIcon />}
        aria-pressed={withAudioDescription}
        aria-label="Audiodescrição (AD)"
        title={
          withAudioDescription
            ? 'Audiodescrição ligada: a narração descreve as imagens'
            : 'Audiodescrição desligada: a narração pula a descrição das imagens'
        }
        onClick={onToggleAudioDescription}
      >
        AD
      </Button>
    )}
  </>
);
