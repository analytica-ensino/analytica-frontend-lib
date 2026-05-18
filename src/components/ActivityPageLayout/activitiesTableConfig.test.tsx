import { render } from '@testing-library/react';
import {
  activitiesTableColumns,
  getActivityStatusBadgeAction,
} from './activitiesTableConfig';
import {
  ActivityDisplayStatus,
  ActivityBadgeActionType,
} from '../../types/activitiesHistory';
import type { ActivityTableItem } from '../../types/activitiesHistory';

describe('activitiesTableConfig', () => {
  describe('getActivityStatusBadgeAction', () => {
    it('should return SUCCESS for CONCLUIDA status', () => {
      const result = getActivityStatusBadgeAction(
        ActivityDisplayStatus.CONCLUIDA
      );
      expect(result).toBe(ActivityBadgeActionType.SUCCESS);
    });

    it('should return WARNING for ATIVA status', () => {
      const result = getActivityStatusBadgeAction(ActivityDisplayStatus.ATIVA);
      expect(result).toBe(ActivityBadgeActionType.WARNING);
    });

    it('should return ERROR for VENCIDA status', () => {
      const result = getActivityStatusBadgeAction(
        ActivityDisplayStatus.VENCIDA
      );
      expect(result).toBe(ActivityBadgeActionType.ERROR);
    });

    it('should return INFO for unknown status', () => {
      const result = getActivityStatusBadgeAction(
        'UNKNOWN' as ActivityDisplayStatus
      );
      expect(result).toBe(ActivityBadgeActionType.INFO);
    });
  });

  describe('activitiesTableColumns', () => {
    it('should have correct number of columns', () => {
      expect(activitiesTableColumns).toHaveLength(11);
    });

    it('should have startDate column with correct config', () => {
      const startDateColumn = activitiesTableColumns[0];
      expect(startDateColumn.key).toBe('startDate');
      expect(startDateColumn.label).toBe('Início');
      expect(startDateColumn.sortable).toBe(true);
    });

    it('should have deadline column with correct config', () => {
      const deadlineColumn = activitiesTableColumns[1];
      expect(deadlineColumn.key).toBe('deadline');
      expect(deadlineColumn.label).toBe('Prazo');
      expect(deadlineColumn.sortable).toBe(true);
    });

    it('should have creator column with correct config', () => {
      const creatorColumn = activitiesTableColumns[2];
      expect(creatorColumn.key).toBe('creator');
      expect(creatorColumn.label).toBe('Autor');
      expect(creatorColumn.sortable).toBe(false);
      expect(creatorColumn.className).toBe('max-w-[150px] truncate');
      expect(creatorColumn.render).toBeDefined();
    });

    it('should have title column with correct config', () => {
      const titleColumn = activitiesTableColumns[3];
      expect(titleColumn.key).toBe('title');
      expect(titleColumn.label).toBe('Título');
      expect(titleColumn.sortable).toBe(true);
      expect(titleColumn.className).toBe('max-w-[200px] truncate');
      expect(titleColumn.render).toBeDefined();
    });

    it('should have school column with correct config', () => {
      const schoolColumn = activitiesTableColumns[4];
      expect(schoolColumn.key).toBe('school');
      expect(schoolColumn.label).toBe('Escola');
      expect(schoolColumn.sortable).toBe(true);
      expect(schoolColumn.className).toBe('max-w-[150px] truncate');
      expect(schoolColumn.render).toBeDefined();
    });

    it('should have year column with correct config', () => {
      const yearColumn = activitiesTableColumns[5];
      expect(yearColumn.key).toBe('year');
      expect(yearColumn.label).toBe('Ano');
      expect(yearColumn.sortable).toBe(true);
    });

    it('should have subject column with correct config', () => {
      const subjectColumn = activitiesTableColumns[6];
      expect(subjectColumn.key).toBe('subject');
      expect(subjectColumn.label).toBe('Matéria');
      expect(subjectColumn.sortable).toBe(true);
      expect(subjectColumn.className).toBe('max-w-[140px]');
      expect(subjectColumn.render).toBeDefined();
    });

    it('should have class column with correct config', () => {
      const classColumn = activitiesTableColumns[7];
      expect(classColumn.key).toBe('class');
      expect(classColumn.label).toBe('Turma');
      expect(classColumn.sortable).toBe(true);
    });

    it('should have status column with correct config', () => {
      const statusColumn = activitiesTableColumns[8];
      expect(statusColumn.key).toBe('status');
      expect(statusColumn.label).toBe('Status');
      expect(statusColumn.sortable).toBe(true);
      expect(statusColumn.render).toBeDefined();
    });

    it('should have completionPercentage column with correct config', () => {
      const completionColumn = activitiesTableColumns[9];
      expect(completionColumn.key).toBe('completionPercentage');
      expect(completionColumn.label).toBe('Conclusão');
      expect(completionColumn.sortable).toBe(true);
      expect(completionColumn.render).toBeDefined();
    });

    it('should have navigation column with correct config', () => {
      const navigationColumn = activitiesTableColumns[10];
      expect(navigationColumn.key).toBe('navigation');
      expect(navigationColumn.label).toBe('');
      expect(navigationColumn.sortable).toBe(false);
      expect(navigationColumn.className).toBe('w-12');
      expect(navigationColumn.render).toBeDefined();
    });

    describe('status column render', () => {
      const statusColumn = activitiesTableColumns[8];

      it('should render Badge with correct props for CONCLUIDA status', () => {
        const { container } = render(
          <>{statusColumn.render?.(ActivityDisplayStatus.CONCLUIDA, {} as ActivityTableItem, 0)}</>
        );
        expect(container.textContent).toContain('CONCLUÍDA');
      });

      it('should render Badge with correct props for ATIVA status', () => {
        const { container } = render(
          <>{statusColumn.render?.(ActivityDisplayStatus.ATIVA, {} as ActivityTableItem, 0)}</>
        );
        expect(container.textContent).toContain('ATIVA');
      });

      it('should render Badge with correct props for VENCIDA status', () => {
        const { container } = render(
          <>{statusColumn.render?.(ActivityDisplayStatus.VENCIDA, {} as ActivityTableItem, 0)}</>
        );
        expect(container.textContent).toContain('VENCIDA');
      });

      it('should handle empty string status', () => {
        const { container } = render(
          <>{statusColumn.render?.('', {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });
    });

    describe('completionPercentage column render', () => {
      const completionColumn = activitiesTableColumns[9];

      it('should render ProgressBar with correct value', () => {
        const { container } = render(
          <>{completionColumn.render?.(75, {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });

      it('should handle zero value', () => {
        const { container } = render(
          <>{completionColumn.render?.(0, {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });

      it('should handle 100 value', () => {
        const { container } = render(
          <>{completionColumn.render?.(100, {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });
    });

    describe('navigation column render', () => {
      const navigationColumn = activitiesTableColumns[10];

      it('should render CaretRight icon', () => {
        const { container } = render(
          <>{navigationColumn.render?.('', {} as ActivityTableItem, 0)}</>
        );
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    describe('subject column render', () => {
      const subjectColumn = activitiesTableColumns[6];

      it('should render subject with string value', () => {
        const { container } = render(
          <>{subjectColumn.render?.('Matemática', {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });

      it('should handle non-string value', () => {
        const { container } = render(
          <>{subjectColumn.render?.(null, {} as ActivityTableItem, 0)}</>
        );
        expect(container).toBeInTheDocument();
      });
    });
  });
});
