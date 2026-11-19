import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { STUDENT_COLUMNS, buildGroupColumns } from './readingColumns';
import {
  EBOOK_READING_GROUP,
  type EbookReadingGroupRow,
  type EbookReadingStudentRow,
} from './types';

const GROUP: EbookReadingGroupRow = {
  id: 'class-a',
  name: 'Turma A',
  schoolYearName: '4º ano',
  municipality: null,
  state: null,
  totalStudents: 40,
  readers: 30,
  readerRate: 75,
  accesses: 90,
  effectiveReadings: 1200,
  totalTimeSeconds: 4800,
  averageTimeSeconds: 160,
  averageProgress: 60.25,
};

const STUDENT: EbookReadingStudentRow = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  avatarUrl: null,
  schoolName: 'Escola Monteiro Lobato',
  schoolYearName: null,
  className: 'Turma A',
  ebooksOpened: 3,
  accesses: 9,
  effectiveReadings: 1,
  totalTimeSeconds: 3725,
  averageProgress: 20,
  lastReadAt: null,
};

/** Renders what a column draws for a row. */
const cell = <T extends Record<string, unknown>>(
  columns: {
    key: string;
    render?: (value: unknown, row: T, index: number) => ReactNode;
  }[],
  key: string,
  row: T
) => {
  const column = columns.find((entry) => entry.key === key);
  render(<>{column?.render?.(row[key], row, 0) ?? String(row[key])}</>);
};

describe('reading table columns', () => {
  it('adds the school year only to the classes', () => {
    const keys = (
      group: (typeof EBOOK_READING_GROUP)[keyof typeof EBOOK_READING_GROUP]
    ) => buildGroupColumns(group).map((column) => column.key);

    expect(keys(EBOOK_READING_GROUP.CLASS)).toContain('schoolYearName');
    expect(keys(EBOOK_READING_GROUP.SCHOOL)).not.toContain('schoolYearName');
    expect(buildGroupColumns(EBOOK_READING_GROUP.SCHOOL)[0].label).toBe(
      'Escola'
    );
  });

  it('adds the municipality only to the schools', () => {
    const keys = (
      group: (typeof EBOOK_READING_GROUP)[keyof typeof EBOOK_READING_GROUP]
    ) => buildGroupColumns(group).map((column) => column.key);

    expect(keys(EBOOK_READING_GROUP.SCHOOL)[1]).toBe('municipality');
    expect(keys(EBOOK_READING_GROUP.CLASS)).not.toContain('municipality');
    cell(buildGroupColumns(EBOOK_READING_GROUP.SCHOOL), 'municipality', {
      ...GROUP,
      municipality: 'Curitiba',
    });

    expect(screen.getByText('Curitiba')).toBeInTheDocument();
  });

  it('writes the counts, the time and the progress of a group', () => {
    const columns = buildGroupColumns(EBOOK_READING_GROUP.CLASS);
    cell(columns, 'effectiveReadings', GROUP);
    cell(columns, 'totalTimeSeconds', GROUP);
    cell(columns, 'averageProgress', GROUP);

    expect(screen.getByText('1.200')).toBeInTheDocument();
    expect(screen.getByText('1h 20min')).toBeInTheDocument();
    expect(screen.getByText('60,3%')).toBeInTheDocument();
  });

  it('colors a group by its share of readers, with the bar', () => {
    const columns = buildGroupColumns(EBOOK_READING_GROUP.SCHOOL);
    cell(columns, 'status', GROUP);
    cell(columns, 'readerRate', GROUP);

    expect(screen.getByTestId('reading-tier-highlight')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('says where each student is enrolled, a dash when unknown', () => {
    expect(STUDENT_COLUMNS.slice(0, 4).map((column) => column.label)).toEqual([
      'Nome',
      'Escola',
      'Ano',
      'Turma',
    ]);
    cell(STUDENT_COLUMNS, 'schoolYearName', STUDENT);
    cell(STUDENT_COLUMNS, 'className', STUDENT);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Turma A')).toBeInTheDocument();
  });

  it("writes a student's time as a clock and tiers them by progress", () => {
    cell(STUDENT_COLUMNS, 'totalTimeSeconds', STUDENT);
    cell(STUDENT_COLUMNS, 'lastReadAt', STUDENT);
    cell(STUDENT_COLUMNS, 'tier', STUDENT);

    expect(screen.getByText('01:02:05')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByTestId('reading-tier-attention')).toBeInTheDocument();
  });
});
