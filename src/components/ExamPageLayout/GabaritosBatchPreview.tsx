import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import { PageContainer, CartaoContainer, GabaritoCard } from './GabaritoCard';

export interface GabaritoData {
  nomeAluno: string;
  qrCodeUrl: string;
  totalQuestoes: number;
  tituloProva?: string;
  escolaNome?: string;
  turmaNome?: string;
}

export interface GabaritosBatchPreviewProps {
  gabaritos: GabaritoData[];
  onComplete?: () => void;
}

export function GabaritosBatchPreview({
  gabaritos,
  onComplete,
}: GabaritosBatchPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<string[]>([]);
  const printedRef = useRef(false);

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls = await Promise.all(
        gabaritos.map((gabarito) =>
          QRCode.toDataURL(gabarito.qrCodeUrl, { width: 160 })
        )
      );
      setQrCodeDataUrls(urls);
    };

    generateQRCodes();
  }, [gabaritos]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `gabaritos_${(gabaritos[0]?.tituloProva || 'prova').replace(/[^a-zA-Z0-9]/g, '_')}`,
    onAfterPrint: () => {
      if (onComplete) {
        onComplete();
      }
    },
  });

  useEffect(() => {
    if (!printedRef.current && qrCodeDataUrls.length === gabaritos.length) {
      printedRef.current = true;
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qrCodeDataUrls, gabaritos.length, handlePrint]);

  return (
    <PageContainer>
      <div ref={contentRef}>
        {gabaritos.map((gabarito, index) => (
          <CartaoContainer key={index}>
            <GabaritoCard
              nomeAluno={gabarito.nomeAluno}
              qrCodeDataUrl={qrCodeDataUrls[index] || ''}
              totalQuestoes={gabarito.totalQuestoes}
              tituloProva={gabarito.tituloProva}
              escolaNome={gabarito.escolaNome}
              turmaNome={gabarito.turmaNome}
            />
          </CartaoContainer>
        ))}
      </div>
    </PageContainer>
  );
}

export default GabaritosBatchPreview;
