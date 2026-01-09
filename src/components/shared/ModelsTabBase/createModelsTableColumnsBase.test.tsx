import { render, screen, fireEvent } from '@testing-library/react';
import {
  createModelsTableColumnsBase,
  type BaseModelItem,
  type ModelsColumnsConfig,
} from './createModelsTableColumnsBase';
import { SubjectEnum } from '../../../enums/SubjectEnum';

// Mock renderSubjectCell
jest.mock('../../../utils/renderSubjectCell', () => ({
  renderSubjectCell: jest.fn(
    (subjectName: string, _map: unknown, showEmptyDash: boolean) => {
      if (!subjectName && showEmptyDash) return <span>-</span>;
      return <span>{subjectName || '-'}</span>;
    }
  ),
}));

/**
 * Test model item
 */
interface TestModelItem extends BaseModelItem {
  subjectId?: string | null;
}

const mockModel: TestModelItem = {
  id: '1',
  title: 'Test Model',
  subject: 'Mathematics',
  savedAt: '01/01/2024',
  subjectId: 'subject-1',
};

const defaultConfig: ModelsColumnsConfig = {
  sendButtonLabel: 'Send',
  sendButtonAriaLabel: 'Send item',
  deleteButtonAriaLabel: 'Delete item',
  editButtonAriaLabel: 'Edit item',
};

describe('createModelsTableColumnsBase', () => {
  describe('column structure', () => {
    it('should create 4 columns', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      expect(columns).toHaveLength(4);
    });

    it('should have correct column keys', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const keys = columns.map((col) => col.key);
      expect(keys).toEqual(['title', 'savedAt', 'subject', 'actions']);
    });

    it('should have correct sortable settings', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      expect(columns[0].sortable).toBe(true); // title
      expect(columns[1].sortable).toBe(true); // savedAt
      expect(columns[2].sortable).toBe(true); // subject
      expect(columns[3].sortable).toBe(false); // actions
    });
  });

  describe('title column', () => {
    it('should render title text', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const titleColumn = columns[0];
      render(<>{titleColumn.render?.(mockModel.title, mockModel, 0)}</>);
      expect(screen.getByText('Test Model')).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const titleColumn = columns[0];
      const { container } = render(
        <>{titleColumn.render?.('', mockModel, 0)}</>
      );
      // Text component renders a p element with empty content
      const element = container.querySelector('p');
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toBe('');
    });

    it('should handle non-string title value', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const titleColumn = columns[0];
      const { container } = render(
        <>{titleColumn.render?.(123 as unknown as string, mockModel, 0)}</>
      );
      // Text component renders a p element with empty content for non-string values
      const element = container.querySelector('p');
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toBe('');
    });
  });

  describe('subject column', () => {
    it('should render subject name', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const subjectColumn = columns[2];
      render(<>{subjectColumn.render?.(mockModel.subject, mockModel, 0)}</>);
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    it('should call mapSubjectNameToEnum when provided', () => {
      const mapFn = jest.fn().mockReturnValue(SubjectEnum.MATEMATICA);
      const columns = createModelsTableColumnsBase<TestModelItem>(
        mapFn,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const subjectColumn = columns[2];
      render(<>{subjectColumn.render?.(mockModel.subject, mockModel, 0)}</>);
      expect(mapFn).not.toHaveBeenCalled(); // renderSubjectCell handles this
    });
  });

  describe('actions column', () => {
    it('should render send button when onSend is provided', () => {
      const onSend = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        onSend,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      expect(
        screen.getByRole('button', { name: 'Send item' })
      ).toBeInTheDocument();
      expect(screen.getByText('Send')).toBeInTheDocument();
    });

    it('should not render send button when onSend is not provided', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      expect(screen.queryByText('Send')).not.toBeInTheDocument();
    });

    it('should render edit button when onEdit is provided', () => {
      const onEdit = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        onEdit,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      expect(
        screen.getByRole('button', { name: 'Edit item' })
      ).toBeInTheDocument();
    });

    it('should not render edit button when onEdit is not provided', () => {
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      expect(
        screen.queryByRole('button', { name: 'Edit item' })
      ).not.toBeInTheDocument();
    });

    it('should always render delete button', () => {
      const onDelete = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        onDelete,
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      expect(
        screen.getByRole('button', { name: 'Delete item' })
      ).toBeInTheDocument();
    });

    it('should call onSend when send button is clicked', () => {
      const onSend = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        onSend,
        undefined,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      fireEvent.click(screen.getByRole('button', { name: 'Send item' }));
      expect(onSend).toHaveBeenCalledWith(mockModel);
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        onEdit,
        jest.fn(),
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      fireEvent.click(screen.getByRole('button', { name: 'Edit item' }));
      expect(onEdit).toHaveBeenCalledWith(mockModel);
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        undefined,
        undefined,
        onDelete,
        defaultConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);
      fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
      expect(onDelete).toHaveBeenCalledWith(mockModel);
    });

    it('should stop event propagation on button clicks', () => {
      const onSend = jest.fn();
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        onSend,
        onEdit,
        onDelete,
        defaultConfig
      );
      const actionsColumn = columns[3];

      const parentClickHandler = jest.fn();
      render(
        <div onClick={parentClickHandler}>
          {actionsColumn.render?.(undefined, mockModel, 0)}
        </div>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Send item' }));
      expect(parentClickHandler).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Edit item' }));
      expect(parentClickHandler).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('custom config', () => {
    it('should use custom labels from config', () => {
      const customConfig: ModelsColumnsConfig = {
        sendButtonLabel: 'Enviar aula',
        sendButtonAriaLabel: 'Enviar aula para turma',
        deleteButtonAriaLabel: 'Deletar modelo',
        editButtonAriaLabel: 'Editar modelo',
      };
      const columns = createModelsTableColumnsBase<TestModelItem>(
        undefined,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        customConfig
      );
      const actionsColumn = columns[3];
      render(<>{actionsColumn.render?.(undefined, mockModel, 0)}</>);

      expect(screen.getByText('Enviar aula')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Enviar aula para turma' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deletar modelo' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Editar modelo' })
      ).toBeInTheDocument();
    });
  });
});
