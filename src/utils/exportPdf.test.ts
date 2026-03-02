import { printReportAsPdf } from './exportPdf';

describe('reportPdf', () => {
  describe('printReportAsPdf', () => {
    it('should call globalThis.print()', () => {
      const printSpy = jest
        .spyOn(globalThis, 'print')
        .mockImplementation(() => {});

      printReportAsPdf();

      expect(printSpy).toHaveBeenCalledTimes(1);
      printSpy.mockRestore();
    });

    it('should be a callable function', () => {
      expect(typeof printReportAsPdf).toBe('function');
    });
  });
});
