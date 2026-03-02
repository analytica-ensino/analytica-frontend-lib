import * as XLSX from 'xlsx';

/**
 * A single Excel cell value
 */
export type ExcelCell = string | number | null;

/**
 * Configuration for a single Excel sheet
 */
export interface SheetConfig {
  name: string;
  headers: string[];
  rows: ExcelCell[][];
}

/**
 * Generate and download an Excel file with multiple sheets.
 *
 * @param fileName - Name of the file without extension
 * @param sheets - Array of sheet configurations
 */
export function downloadExcel(fileName: string, sheets: SheetConfig[]): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const data: ExcelCell[][] = [sheet.headers, ...sheet.rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
