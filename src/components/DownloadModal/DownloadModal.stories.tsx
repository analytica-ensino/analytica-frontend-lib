import type { Story } from '@ladle/react';
import { useState } from 'react';
import DownloadModal from './DownloadModal';
import Button from '../Button/Button';

/** Default state — click the button to open the modal */
export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir DownloadModal</Button>
      <DownloadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isDownloading={false}
        error={null}
        onDownloadPdf={() => {
          setIsOpen(false);
        }}
        onDownloadExcel={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
};

/** Modal open with an error message */
export const WithError: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DownloadModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      isDownloading={false}
      error="Falha ao gerar relatório. Tente novamente."
      onDownloadPdf={() => {
        setIsOpen(false);
      }}
      onDownloadExcel={() => {
        setIsOpen(false);
      }}
    />
  );
};

/** Loading state shown while generating the Excel file */
export const Loading: Story = () => (
  <DownloadModal
    isOpen={true}
    onClose={() => {}}
    isDownloading={true}
    error={null}
    onDownloadPdf={() => {}}
    onDownloadExcel={() => {}}
  />
);
