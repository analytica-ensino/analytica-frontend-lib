import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  PageContainer,
  CartaoContainer,
  GabaritoCard,
  PrintStyles,
} from './GabaritoCard';

export interface GabaritoPreviewProps {
  nomeAluno: string;
  qrCodeUrl: string;
  totalQuestoes: number;
  tituloProva?: string;
  escolaNome?: string;
  turmaNome?: string;
  onComplete?: () => void;
}

export function GabaritoPreview({
  nomeAluno,
  qrCodeUrl,
  totalQuestoes,
  tituloProva,
  escolaNome,
  turmaNome,
  onComplete,
}: GabaritoPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const printedRef = useRef(false);

  useEffect(() => {
    QRCode.toDataURL(qrCodeUrl, { width: 160 })
      .then(setQrCodeDataUrl)
      .catch(console.error);
  }, [qrCodeUrl]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: ' ',
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0mm !important;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          width: 210mm !important;
          margin: 0mm !important;
          padding: 0mm !important;
        }
      }
    `,
    onAfterPrint: () => {
      if (onComplete) {
        onComplete();
      }
    },
  });

  useEffect(() => {
    if (!printedRef.current && qrCodeDataUrl) {
      printedRef.current = true;
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qrCodeDataUrl, handlePrint]);

  return (
    <>
      <PrintStyles />
      <PageContainer>
        <CartaoContainer ref={contentRef}>
          <GabaritoCard
            nomeAluno={nomeAluno}
            qrCodeDataUrl={qrCodeDataUrl}
            totalQuestoes={totalQuestoes}
            tituloProva={tituloProva}
            escolaNome={escolaNome}
            turmaNome={turmaNome}
          />
        </CartaoContainer>
      </PageContainer>
    </>
  );
}

export default GabaritoPreview;
