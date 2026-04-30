import { render } from '@testing-library/react';
import { createHistoryTableColumns } from './historyTableColumns';

describe('historyTableColumns', () => {
  describe('createHistoryTableColumns', () => {
    it('should have 11 columns defined', () => {
      const columns = createHistoryTableColumns(undefined);
      expect(columns).toHaveLength(11);
    });

    it('should define startDate column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[0];
      expect(column.key).toBe('startDate');
      expect(column.label).toBe('Início');
      expect(column.sortable).toBe(true);
    });

    it('should define deadline column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[1];
      expect(column.key).toBe('deadline');
      expect(column.label).toBe('Prazo');
      expect(column.sortable).toBe(true);
    });

    it('should define creator column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[2];
      expect(column.key).toBe('creator');
      expect(column.label).toBe('Autor');
      expect(column.sortable).toBe(false);
      expect(column.className).toBe('max-w-[150px] truncate');
    });

    it('should render creator column with name and tooltip', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[2];
      const { container } = render(
        <>{column.render?.('Prof. Maria', {} as never, 0)}</>
      );
      const el = container.firstElementChild;
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('title', 'Prof. Maria');
      expect(el?.textContent).toBe('Prof. Maria');
    });

    it('should render creator column with empty string for non-string value', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[2];
      const { container } = render(
        <>{column.render?.(null, {} as never, 0)}</>
      );
      const el = container.firstElementChild;
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('title', '');
    });

    it('should define title column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[3];
      expect(column.key).toBe('title');
      expect(column.label).toBe('Título');
      expect(column.sortable).toBe(true);
    });

    it('should define school column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[4];
      expect(column.key).toBe('school');
      expect(column.label).toBe('Escola');
      expect(column.sortable).toBe(true);
    });

    it('should define year column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[5];
      expect(column.key).toBe('year');
      expect(column.label).toBe('Ano');
      expect(column.sortable).toBe(true);
    });

    it('should define subject column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[6];
      expect(column.key).toBe('subject');
      expect(column.label).toBe('Matéria');
      expect(column.sortable).toBe(true);
    });

    it('should define class column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[7];
      expect(column.key).toBe('class');
      expect(column.label).toBe('Turma');
      expect(column.sortable).toBe(true);
    });

    it('should define status column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[8];
      expect(column.key).toBe('status');
      expect(column.label).toBe('Status');
      expect(column.sortable).toBe(true);
    });

    it('should define completionPercentage column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[9];
      expect(column.key).toBe('completionPercentage');
      expect(column.label).toBe('Conclusão');
      expect(column.sortable).toBe(true);
    });

    it('should define navigation column correctly', () => {
      const columns = createHistoryTableColumns(undefined);
      const column = columns[10];
      expect(column.key).toBe('navigation');
      expect(column.label).toBe('');
      expect(column.sortable).toBe(false);
    });
  });
});
