import { printAsPdf } from './exportPdf';

describe('reportPdf', () => {
  describe('printAsPdf', () => {
    it('should call globalThis.print()', () => {
      const printSpy = jest
        .spyOn(globalThis, 'print')
        .mockImplementation(() => {});

      printAsPdf();

      expect(printSpy).toHaveBeenCalledTimes(1);
      printSpy.mockRestore();
    });

    it('should be a callable function', () => {
      expect(typeof printAsPdf).toBe('function');
    });
  });
});
