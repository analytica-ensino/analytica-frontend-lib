import { render, screen } from '@testing-library/react';
import { presencialActivitiesTableColumns } from './presencialActivitiesTableConfig';
import { ActivityDisplayStatus } from '../../types/activitiesHistory';
import type { ActivityTableItem } from '../../types/activitiesHistory';

describe('presencialActivitiesTableConfig', () => {
  const row = {} as ActivityTableItem;

  describe('presencialActivitiesTableColumns', () => {
    it('should expose only title, status and createdAt', () => {
      expect(
        presencialActivitiesTableColumns.map((column) => column.key)
      ).toEqual(['title', 'status', 'createdAt']);
    });

    it('should not carry the academic breakdown columns', () => {
      const keys = presencialActivitiesTableColumns.map((column) => column.key);

      expect(keys).not.toContain('school');
      expect(keys).not.toContain('year');
      expect(keys).not.toContain('subject');
      expect(keys).not.toContain('class');
      expect(keys).not.toContain('completionPercentage');
    });

    it('should label the createdAt column as "Criada em"', () => {
      const createdAtColumn = presencialActivitiesTableColumns[2];

      expect(createdAtColumn.label).toBe('Criada em');
      expect(createdAtColumn.sortable).toBe(true);
    });

    it('should render the status as a badge', () => {
      const statusColumn = presencialActivitiesTableColumns[1];

      render(
        <>{statusColumn.render?.(ActivityDisplayStatus.VENCIDA, row, 0)}</>
      );

      expect(
        screen.getByText(ActivityDisplayStatus.VENCIDA)
      ).toBeInTheDocument();
    });

    it('should keep an unknown status neutral instead of styling it as active', () => {
      const statusColumn = presencialActivitiesTableColumns[1];

      const { container } = render(
        <>{statusColumn.render?.('SOMETHING_ELSE', row, 0)}</>
      );

      expect(container).toHaveTextContent('SOMETHING_ELSE');
      // Neutral (info) styling, not the warning used by ATIVA.
      expect(container.querySelector('div')?.className).not.toContain(
        'warning'
      );
    });

    it('should render an empty string when the status is not a string', () => {
      const statusColumn = presencialActivitiesTableColumns[1];

      const { container } = render(<>{statusColumn.render?.(null, row, 0)}</>);

      expect(container).toHaveTextContent('');
    });

    it('should render the title through the text cell renderer', () => {
      const titleColumn = presencialActivitiesTableColumns[0];

      render(<>{titleColumn.render?.('Prova de História', row, 0)}</>);

      expect(screen.getByText('Prova de História')).toBeInTheDocument();
    });
  });
});
