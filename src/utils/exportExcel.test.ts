import type { SheetConfig } from './exportExcel';

const mockXLSX = {
  utils: {
    book_new: jest.fn(() => ({ Sheets: {}, SheetNames: [] })),
    aoa_to_sheet: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
};

jest.mock('xlsx', () => ({
  default: mockXLSX,
  ...mockXLSX,
}));

import { downloadExcel } from './exportExcel';

describe('reportExcel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadExcel', () => {
    it('should create a workbook and write file with given sheets', () => {
      const sheets: SheetConfig[] = [
        {
          name: 'Sheet1',
          headers: ['A', 'B'],
          rows: [
            [1, 'x'],
            [2, 'y'],
          ],
        },
        {
          name: 'Sheet2',
          headers: ['C'],
          rows: [[3]],
        },
      ];

      downloadExcel('report', sheets);

      expect(mockXLSX.utils.book_new).toHaveBeenCalledTimes(1);
      expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(2);
      expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([
        ['A', 'B'],
        [1, 'x'],
        [2, 'y'],
      ]);
      expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([['C'], [3]]);
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      expect(mockXLSX.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({}),
        'report.xlsx'
      );
    });

    it('should handle empty sheets array', () => {
      downloadExcel('empty', []);

      expect(mockXLSX.utils.book_new).toHaveBeenCalledTimes(1);
      expect(mockXLSX.utils.aoa_to_sheet).not.toHaveBeenCalled();
      expect(mockXLSX.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({}),
        'empty.xlsx'
      );
    });
  });
});
