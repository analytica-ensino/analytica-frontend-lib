import { act, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useReactToPrint } from 'react-to-print';
import { downloadExcel } from '../../utils/exportExcel';
import {
  ENEM_MOMENT_EXAM_STATUS_LABELS,
  StudentsTableDownload,
  studentsExportFileName,
  studentsExportHeaders,
  studentsExportRows,
  studentsExportSheet,
} from './StudentsDownload';
import type { EnemMomentStudentsExport } from './types';

const mockPrint = jest.fn();
jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn(() => mockPrint),
}));
jest.mock('../../utils/exportExcel', () => ({ downloadExcel: jest.fn() }));

const data: EnemMomentStudentsExport = {
  exams: [
    { examId: 'exam-1', title: 'Simulado 1' },
    { examId: 'exam-2', title: 'Simulado 2' },
  ],
  students: [
    {
      userInstitutionId: 'student-1',
      studentName: 'Ana Beatriz',
      email: 'ana@escola.pr.gov.br',
      className: 'A',
      moments: [
        { examId: 'exam-1', status: 'DONE' },
        { examId: 'exam-2', status: 'PARTIAL' },
      ],
    },
    {
      userInstitutionId: 'student-2',
      studentName: 'Bruno Lima',
      email: 'bruno@escola.pr.gov.br',
      className: null,
      moments: [
        { examId: 'exam-1', status: 'NOT_DONE' },
        { examId: 'exam-2', status: 'NOT_DONE' },
      ],
    },
  ],
};

const FILE_NAME =
  /^relatorio-simulados-momento-enem-tabela-estudantes-\d{2}-\d{2}-\d{4}$/;

const lastPrintOptions = () =>
  (useReactToPrint as jest.Mock).mock.lastCall?.[0];

describe('studentsExport helpers', () => {
  it('names one status column per exam of the flag, by its order', () => {
    expect(studentsExportHeaders(data)).toEqual([
      'Nome',
      'E-mail',
      'Turma',
      'Status Momento 1',
      'Status Momento 2',
    ]);
    expect(
      studentsExportHeaders({
        ...data,
        exams: [...data.exams, { examId: 'exam-3', title: 'Simulado 3' }],
      })
    ).toHaveLength(6);
  });

  it('writes each student with the label of every status', () => {
    expect(studentsExportRows(data)).toEqual([
      ['Ana Beatriz', 'ana@escola.pr.gov.br', 'A', 'Fez', 'Parcial'],
      ['Bruno Lima', 'bruno@escola.pr.gov.br', '—', 'Não fez', 'Não fez'],
    ]);
  });

  it('reads an exam the student carries no status for as not done', () => {
    const [student] = data.students;
    const rows = studentsExportRows({
      ...data,
      students: [{ ...student, moments: [student.moments[0]] }],
    });

    expect(rows[0].slice(3)).toEqual(['Fez', 'Não fez']);
  });

  it('follows the exams order, not the order the moments came in', () => {
    const [student] = data.students;
    const rows = studentsExportRows({
      ...data,
      students: [{ ...student, moments: [...student.moments].reverse() }],
    });

    expect(rows[0].slice(3)).toEqual(['Fez', 'Parcial']);
  });

  it('labels the three statuses as the tech spec reads them', () => {
    expect(ENEM_MOMENT_EXAM_STATUS_LABELS).toEqual({
      DONE: 'Fez',
      PARTIAL: 'Parcial',
      NOT_DONE: 'Não fez',
    });
  });

  it('puts the list in one sheet', () => {
    expect(studentsExportSheet(data)).toEqual({
      name: 'Estudantes',
      headers: studentsExportHeaders(data),
      rows: studentsExportRows(data),
    });
  });

  it('stamps the file with the day of the download', () => {
    expect(studentsExportFileName(new Date(2026, 8, 30))).toBe(
      'relatorio-simulados-momento-enem-tabela-estudantes-30-09-2026'
    );
  });
});

describe('StudentsTableDownload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const openModal = async (loadExport = jest.fn().mockResolvedValue(data)) => {
    const user = userEvent.setup();
    render(<StudentsTableDownload loadExport={loadExport} />);
    await user.click(screen.getByRole('button', { name: /Baixar tabela/ }));
    return { user, loadExport };
  };

  it('asks for the format under the table title, before fetching anything', async () => {
    const { loadExport } = await openModal();

    expect(
      screen.getByText('Como deseja baixar a tabela?')
    ).toBeInTheDocument();
    expect(screen.getByTestId('download-excel-option')).toBeInTheDocument();
    expect(screen.getByTestId('download-pdf-option')).toBeInTheDocument();
    expect(loadExport).not.toHaveBeenCalled();
  });

  it('downloads the whole list as a spreadsheet and closes', async () => {
    const { user, loadExport } = await openModal();

    await user.click(screen.getByTestId('download-excel-option'));
    await user.click(screen.getByTestId('download-confirm-btn'));

    await waitFor(() =>
      expect(
        screen.queryByText('Como deseja baixar a tabela?')
      ).not.toBeInTheDocument()
    );
    expect(loadExport).toHaveBeenCalledTimes(1);
    expect(downloadExcel).toHaveBeenCalledTimes(1);
    const [fileName, sheets] = (downloadExcel as jest.Mock).mock.calls[0];
    expect(fileName).toMatch(FILE_NAME);
    expect(sheets).toEqual([studentsExportSheet(data)]);
    expect(mockPrint).not.toHaveBeenCalled();
  });

  it('prints the whole list once, then drops it', async () => {
    const { user } = await openModal();

    await user.click(screen.getByTestId('download-pdf-option'));
    await user.click(screen.getByTestId('download-confirm-btn'));

    const printable = await screen.findByTestId(
      'enem-moment-students-printable'
    );
    expect(
      within(printable).getByRole('columnheader', { name: 'Status Momento 2' })
    ).toBeInTheDocument();
    expect(
      within(printable)
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.textContent)
    ).toEqual([
      'Ana Beatrizana@escola.pr.gov.brAFezParcial',
      'Bruno Limabruno@escola.pr.gov.br—Não fezNão fez',
    ]);
    await waitFor(() =>
      expect(
        screen.queryByText('Como deseja baixar a tabela?')
      ).not.toBeInTheDocument()
    );
    expect(mockPrint).toHaveBeenCalledTimes(1);
    expect(lastPrintOptions().documentTitle).toMatch(FILE_NAME);
    expect(downloadExcel).not.toHaveBeenCalled();

    act(() => lastPrintOptions().onAfterPrint());

    expect(
      screen.queryByTestId('enem-moment-students-printable')
    ).not.toBeInTheDocument();
  });

  it('keeps the modal open with the error when the list does not come', async () => {
    const { user } = await openModal(
      jest.fn().mockRejectedValue(new Error('boom'))
    );

    await user.click(screen.getByTestId('download-excel-option'));
    await user.click(screen.getByTestId('download-confirm-btn'));

    expect(
      await screen.findByText(
        'Não foi possível baixar a tabela. Tente novamente.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Como deseja baixar a tabela?')
    ).toBeInTheDocument();
    expect(downloadExcel).not.toHaveBeenCalled();
    expect(mockPrint).not.toHaveBeenCalled();
  });

  it('opens clean after a failed attempt', async () => {
    const { user } = await openModal(
      jest.fn().mockRejectedValue(new Error('boom'))
    );

    await user.click(screen.getByTestId('download-pdf-option'));
    await user.click(screen.getByTestId('download-confirm-btn'));
    await screen.findByText(
      'Não foi possível baixar a tabela. Tente novamente.'
    );
    await user.click(screen.getByTestId('download-cancel-btn'));
    await user.click(screen.getByRole('button', { name: /Baixar tabela/ }));

    expect(
      screen.queryByText('Não foi possível baixar a tabela. Tente novamente.')
    ).not.toBeInTheDocument();
  });
});
