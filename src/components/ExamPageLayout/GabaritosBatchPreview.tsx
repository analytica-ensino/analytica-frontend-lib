import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  PageContainer,
  CardContainer,
  AnswerSheetCard,
  PrintStyles,
} from './GabaritoCard';

export interface AnswerSheetData {
  studentName: string;
  qrCodeUrl: string;
  totalQuestions: number;
  examTitle?: string;
  schoolName?: string;
  className?: string;
}

/**
 * @deprecated Use AnswerSheetData instead
 */
export type GabaritoData = AnswerSheetData;

export interface AnswerSheetsBatchPreviewProps {
  answerSheets: AnswerSheetData[];
  onComplete?: () => void;
}

/**
 * @deprecated Use AnswerSheetsBatchPreviewProps instead
 */
export interface GabaritosBatchPreviewProps {
  gabaritos: AnswerSheetData[];
  onComplete?: () => void;
}

export function AnswerSheetsBatchPreview({
  answerSheets,
  onComplete,
}: Readonly<AnswerSheetsBatchPreviewProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<string[]>([]);
  const printedRef = useRef(false);

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls = await Promise.all(
        answerSheets.map((sheet) =>
          QRCode.toDataURL(sheet.qrCodeUrl, { width: 160 })
        )
      );
      setQrCodeDataUrls(urls);
    };

    generateQRCodes();
  }, [answerSheets]);

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
    if (!printedRef.current && qrCodeDataUrls.length === answerSheets.length) {
      printedRef.current = true;
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qrCodeDataUrls, answerSheets.length, handlePrint]);

  return (
    <>
      <PrintStyles />
      <PageContainer>
        <div ref={contentRef}>
          {answerSheets.map((sheet, index) => (
            <CardContainer key={sheet.studentName + index}>
              <AnswerSheetCard
                studentName={sheet.studentName}
                qrCodeDataUrl={qrCodeDataUrls[index] || ''}
                totalQuestions={sheet.totalQuestions}
                examTitle={sheet.examTitle}
                schoolName={sheet.schoolName}
                className={sheet.className}
              />
            </CardContainer>
          ))}
        </div>
      </PageContainer>
    </>
  );
}

/**
 * @deprecated Use AnswerSheetsBatchPreview instead
 */
export function GabaritosBatchPreview({
  gabaritos,
  onComplete,
}: Readonly<GabaritosBatchPreviewProps>) {
  // Convert old prop names to new ones
  const answerSheets: AnswerSheetData[] = gabaritos.map((g) => ({
    studentName: g.studentName,
    qrCodeUrl: g.qrCodeUrl,
    totalQuestions: g.totalQuestions,
    examTitle: g.examTitle,
    schoolName: g.schoolName,
    className: g.className,
  }));

  return (
    <AnswerSheetsBatchPreview
      answerSheets={answerSheets}
      onComplete={onComplete}
    />
  );
}

export default AnswerSheetsBatchPreview;
