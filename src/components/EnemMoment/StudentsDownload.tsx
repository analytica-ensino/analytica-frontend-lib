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
import type {
  EnemMomentExamStatus,
  EnemMomentStudentRow,
  EnemMomentStudentsExport,
} from './types';
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

const NOTHING_LISTED = 'Nenhum estudante corresponde aos filtros da tabela.';

const NOBODY = 'Não há estudantes para baixar.';

/** A student the table lists — all the PDF needs to pick them out. */
type ListedStudent = Pick<EnemMomentStudentRow, 'userInstitutionId'>;

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

/**
 * The whole list cut down to the students the table lists, in the table's
 * order. A listed student missing from the list is left out: there is no
 * e-mail or status to print for them.
 */
export function narrowStudentsExport(
  data: EnemMomentStudentsExport,
  listed: readonly ListedStudent[]
): EnemMomentStudentsExport {
  const byId = new Map(
    data.students.map((student) => [student.userInstitutionId, student])
  );
  return {
    exams: data.exams,
    students: listed.flatMap((row) => byId.get(row.userInstitutionId) ?? []),
  };
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
  filtered,
  generatedAt,
}: Readonly<{
  data: EnemMomentStudentsExport;
  /** Whether the list is the table's, under its filters. */
  filtered: boolean;
  generatedAt: Date;
}>) {
  const headers = studentsExportHeaders(data);
  const rows = studentsExportRows(data);

  return (
    <div className="p-2 text-text-950 font-sans">
      <h1 className="text-lg font-bold">Simulados Momento ENEM</h1>
      <p className="text-sm text-text-700">
        Desempenho por estudante
        {filtered && ' · Conforme os filtros da tabela'} · Gerado em{' '}
        {formatTimestamp(generatedAt)} · {rows.length} estudantes
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
 * "Baixar tabela" of the students table: the students with their status in
 * each exam, as a spreadsheet or a PDF.
 *
 * The spreadsheet carries every student in the caller's scope, whatever the
 * table is showing — it can be filtered in the spreadsheet itself. The PDF,
 * given `loadPdfStudents`, carries only the students the table lists under
 * its filters, in its order; without it, the whole list too.
 *
 * The app fetches; both formats ask when the user confirms, never before, and
 * the modal holds its skeleton while the lists arrive. The PDF is the
 * browser's print of a list rendered off screen for it.
 */
export function StudentsTableDownload({
  loadExport,
  loadPdfStudents,
}: Readonly<{
  /** `GET /enem-moment-report/students/export`, through the app's client. */
  loadExport: () => Promise<EnemMomentStudentsExport>;
  /** Every student the table lists under its filters, all pages, in order. */
  loadPdfStudents?: () => Promise<ListedStudent[]>;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<{
    data: EnemMomentStudentsExport;
    filtered: boolean;
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

  const run = useCallback(async (task: () => Promise<void>) => {
    setIsDownloading(true);
    setError(null);
    try {
      await task();
    } catch {
      setError(DOWNLOAD_ERROR);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const downloadExcelFile = useCallback(
    () =>
      run(async () => {
        const data = await loadExport();
        downloadExcel(studentsExportFileName(), [studentsExportSheet(data)]);
      }),
    [run, loadExport]
  );

  const downloadPdf = useCallback(
    () =>
      run(async () => {
        const [data, listed] = await Promise.all([
          loadExport(),
          loadPdfStudents?.() ?? null,
        ]);
        const printed = listed ? narrowStudentsExport(data, listed) : data;
        // Nothing to print: say so in the modal rather than open an empty page.
        if (printed.students.length === 0) {
          setError(listed ? NOTHING_LISTED : NOBODY);
          return;
        }
        setPrintData({
          data: printed,
          filtered: listed !== null,
          generatedAt: new Date(),
        });
      }),
    [run, loadExport, loadPdfStudents]
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
              filtered={printData.filtered}
              generatedAt={printData.generatedAt}
            />
          </div>
        </div>
      )}
    </>
  );
}
