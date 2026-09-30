import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import Button from '../Button/Button';
import DownloadModal from '../DownloadModal/DownloadModal';
import { downloadExcel, type SheetConfig } from '../../utils/exportExcel';
import {
  formatDateForFileName,
  formatTimestamp,
} from '../../utils/exportFormat';
import type { EnemMomentExamStatus, EnemMomentStudentsExport } from './types';
import { MISSING_VALUE } from './utils';

/** How a status reads in the download. */
export const ENEM_MOMENT_EXAM_STATUS_LABELS: Readonly<
  Record<EnemMomentExamStatus, string>
> = {
  DONE: 'Fez',
  PARTIAL: 'Parcial',
  NOT_DONE: 'Não fez',
};

/** What each status means, printed under the PDF's table. */
const STATUS_LEGEND = [
  'Fez: respondeu todas as questões',
  'Parcial: deixou questões em branco ou não entregou a prova',
  'Não fez: não abriu a prova',
].join(' · ');

const DOWNLOAD_ERROR = 'Não foi possível baixar a tabela. Tente novamente.';

/**
 * The columns of the download: the student, then one status per exam — as
 * many as the flag declares, named by their order, like the tabs.
 */
export function studentsExportHeaders(
  data: EnemMomentStudentsExport
): string[] {
  return [
    'Nome',
    'E-mail',
    'Turma',
    ...data.exams.map((_exam, index) => `Status Momento ${index + 1}`),
  ];
}

/**
 * One row per student, the statuses in the order of `exams`. An exam the
 * student carries no status for reads "Não fez": nothing of theirs was found.
 */
export function studentsExportRows(data: EnemMomentStudentsExport): string[][] {
  return data.students.map((student) => {
    const statusByExam = new Map(
      student.moments.map((moment) => [moment.examId, moment.status])
    );
    return [
      student.studentName,
      student.email,
      student.className ?? MISSING_VALUE,
      ...data.exams.map(
        (exam) =>
          ENEM_MOMENT_EXAM_STATUS_LABELS[
            statusByExam.get(exam.examId) ?? 'NOT_DONE'
          ]
      ),
    ];
  });
}

/** The download as a spreadsheet sheet. */
export function studentsExportSheet(
  data: EnemMomentStudentsExport
): SheetConfig {
  return {
    name: 'Estudantes',
    headers: studentsExportHeaders(data),
    rows: studentsExportRows(data),
  };
}

/** The file's name, stamped with the day it was downloaded. */
export const studentsExportFileName = (date: Date = new Date()) =>
  `relatorio-simulados-momento-enem-tabela-estudantes-${formatDateForFileName(date)}`;

const PAGE_STYLE = `
  @page { size: A4 portrait; margin: 12mm; }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

/** The list the PDF prints: the same columns as the spreadsheet. */
function StudentsExportPrintable({
  data,
  generatedAt,
}: Readonly<{ data: EnemMomentStudentsExport; generatedAt: Date }>) {
  const headers = studentsExportHeaders(data);
  const rows = studentsExportRows(data);

  return (
    <div className="p-2 text-text-950 font-sans">
      <h1 className="text-lg font-bold">Simulados Momento ENEM</h1>
      <p className="text-sm text-text-700">
        Desempenho por estudante · Gerado em {formatTimestamp(generatedAt)} ·{' '}
        {rows.length} estudantes
      </p>
      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border border-border-200 bg-background-50 px-2 py-1 text-left font-bold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={data.students[rowIndex].userInstitutionId}
              className="break-inside-avoid"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={headers[cellIndex]}
                  className="border border-border-200 px-2 py-1"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-text-700">{STATUS_LEGEND}</p>
    </div>
  );
}

/**
 * "Baixar tabela" of the students table: every student in the caller's
 * scope with their status in each exam, as a spreadsheet or a PDF —
 * whatever the table is showing, searching or filtering.
 *
 * The app fetches (`loadExport`); both formats ask for the list when the user
 * confirms, never before, and the modal holds its skeleton while it arrives.
 * The PDF is the browser's print of a list rendered off screen for it.
 */
export function StudentsTableDownload({
  loadExport,
}: Readonly<{
  /** `GET /enem-moment-report/students/export`, through the app's client. */
  loadExport: () => Promise<EnemMomentStudentsExport>;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<{
    data: EnemMomentStudentsExport;
    generatedAt: Date;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const printedRef = useRef<object | null>(null);

  const clearPrintData = useCallback(() => setPrintData(null), []);

  const print = useReactToPrint({
    contentRef,
    documentTitle: studentsExportFileName(),
    pageStyle: PAGE_STYLE,
    onAfterPrint: clearPrintData,
  });

  // The list is in the DOM only after the render that received it. Once per
  // list: `print` changes identity with its options, and the modal closing
  // re-renders this component while the list is still mounted.
  useEffect(() => {
    if (printData && printedRef.current !== printData) {
      printedRef.current = printData;
      print();
    }
  }, [printData, print]);

  const open = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const download = useCallback(
    async (deliver: (data: EnemMomentStudentsExport) => void) => {
      setIsDownloading(true);
      setError(null);
      try {
        deliver(await loadExport());
      } catch {
        setError(DOWNLOAD_ERROR);
      } finally {
        setIsDownloading(false);
      }
    },
    [loadExport]
  );

  const downloadExcelFile = useCallback(
    () =>
      download((data) =>
        downloadExcel(studentsExportFileName(), [studentsExportSheet(data)])
      ),
    [download]
  );

  const downloadPdf = useCallback(
    () => download((data) => setPrintData({ data, generatedAt: new Date() })),
    [download]
  );

  return (
    <>
      <div data-print-hide className="print:hidden">
        <Button
          variant="outline"
          action="primary"
          size="small"
          iconLeft={<DownloadSimpleIcon size={16} />}
          onClick={open}
          data-testid="enem-moment-students-download-btn"
        >
          Baixar tabela
        </Button>
      </div>

      <DownloadModal
        isOpen={isOpen}
        onClose={close}
        title="Como deseja baixar a tabela?"
        isDownloading={isDownloading}
        error={error}
        onDownloadPdf={downloadPdf}
        onDownloadExcel={downloadExcelFile}
        asyncPdf
      />

      {printData && (
        <div className="hidden">
          <div ref={contentRef} data-testid="enem-moment-students-printable">
            <StudentsExportPrintable
              data={printData.data}
              generatedAt={printData.generatedAt}
            />
          </div>
        </div>
      )}
    </>
  );
}
