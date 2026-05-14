import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  PageContainer,
  CardContainer,
  AnswerSheetCard,
  PrintStyles,
} from './GabaritoCard';

export interface AnswerSheetPreviewProps {
  studentName: string;
  qrCodeUrl: string;
  totalQuestions: number;
  examTitle?: string;
  schoolName?: string;
  className?: string;
  onComplete?: () => void;
}

/**
 * @deprecated Use AnswerSheetPreviewProps instead
 */
export type GabaritoPreviewProps = AnswerSheetPreviewProps;

export function AnswerSheetPreview({
  studentName,
  qrCodeUrl,
  totalQuestions,
  examTitle,
  schoolName,
  className,
  onComplete,
}: Readonly<AnswerSheetPreviewProps>) {
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
        <CardContainer ref={contentRef}>
          <AnswerSheetCard
            studentName={studentName}
            qrCodeDataUrl={qrCodeDataUrl}
            totalQuestions={totalQuestions}
            examTitle={examTitle}
            schoolName={schoolName}
            className={className}
          />
        </CardContainer>
      </PageContainer>
    </>
  );
}

/**
 * @deprecated Use AnswerSheetPreview instead
 */
export const GabaritoPreview = AnswerSheetPreview;

export default AnswerSheetPreview;
