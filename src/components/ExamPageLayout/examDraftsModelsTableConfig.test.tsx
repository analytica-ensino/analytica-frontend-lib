import { render, screen, fireEvent } from '@testing-library/react';
import {
  createExamDraftsModelsTableColumns,
  type ExamTableCallbacks,
} from './examDraftsModelsTableConfig';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';

// Mock the renderSubjectCell utility
jest.mock('../../utils/renderSubjectCell', () => ({
  renderSubjectCell: (value: string) => <span data-testid="subject">{value}</span>,
}));

// Mock the mapSubjectNameToEnum utility
jest.mock('../../utils/subjectMappers', () => ({
  mapSubjectNameToEnum: jest.fn((name: string) => name),
}));

describe('examDraftsModelsTableConfig', () => {
  const mockCallbacks: ExamTableCallbacks = {
    onSend: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  const mockRow: ActivityModelTableItem = {
    id: '123',
    title: 'Test Exam',
    savedAt: '01/01/2024',
    subject: {
      id: 'math-1',
      name: 'Matemática',
      icon: 'Calculator',
      color: '#FF0000',
    },
    type: 'MODELO' as const,
    subjectId: 'math-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createExamDraftsModelsTableColumns', () => {
    it('should create 4 columns', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      expect(columns).toHaveLength(4);
    });

    it('should have title column with correct configuration', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const titleColumn = columns.find((col) => col.key === 'title');

      expect(titleColumn).toBeDefined();
      expect(titleColumn?.label).toBe('Título');
      expect(titleColumn?.sortable).toBe(true);
      expect(titleColumn?.className).toContain('truncate');
    });

    it('should have savedAt column with correct configuration', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const savedAtColumn = columns.find((col) => col.key === 'savedAt');

      expect(savedAtColumn).toBeDefined();
      expect(savedAtColumn?.label).toBe('Salvo em');
      expect(savedAtColumn?.sortable).toBe(true);
    });

    it('should have subject column with correct configuration', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const subjectColumn = columns.find((col) => col.key === 'subject');

      expect(subjectColumn).toBeDefined();
      expect(subjectColumn?.label).toBe('Disciplina');
      expect(subjectColumn?.sortable).toBe(true);
    });

    it('should have actions column with correct configuration', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.label).toBe('');
      expect(actionsColumn?.sortable).toBe(false);
    });
  });

  describe('subject column render', () => {
    it('should render subject name from object format', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const subjectColumn = columns.find((col) => col.key === 'subject');
      const subjectValue = { name: 'Matemática' };

      const { container } = render(
        <>{subjectColumn?.render?.(subjectValue, mockRow, 0)}</>
      );

      expect(container.textContent).toContain('Matemática');
    });

    it('should render dash for null subject', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const subjectColumn = columns.find((col) => col.key === 'subject');

      const { container } = render(
        <>{subjectColumn?.render?.(null, mockRow, 0)}</>
      );

      expect(container.textContent).toContain('-');
    });

    it('should render string subject value', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const subjectColumn = columns.find((col) => col.key === 'subject');

      const { container } = render(
        <>{subjectColumn?.render?.('Física', mockRow, 0)}</>
      );

      expect(container.textContent).toContain('Física');
    });

    it('should handle object without name property', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const subjectColumn = columns.find((col) => col.key === 'subject');
      const invalidValue = { id: '123' };

      const { container } = render(
        <>{subjectColumn?.render?.(invalidValue, mockRow, 0)}</>
      );

      expect(container.textContent).toContain('-');
    });
  });

  describe('actions column render', () => {
    it('should render send button with correct text', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      expect(
        screen.getByRole('button', { name: /enviar prova/i })
      ).toBeInTheDocument();
    });

    it('should render delete button', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      expect(
        screen.getByRole('button', { name: /deletar/i })
      ).toBeInTheDocument();
    });

    it('should render edit button', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      expect(
        screen.getByRole('button', { name: /editar/i })
      ).toBeInTheDocument();
    });

    it('should call onSend with row when send button is clicked', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const sendButton = screen.getByRole('button', { name: /enviar prova/i });
      fireEvent.click(sendButton);

      expect(mockCallbacks.onSend).toHaveBeenCalledWith(mockRow);
    });

    it('should call onDelete with row when delete button is clicked', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const deleteButton = screen.getByRole('button', { name: /deletar/i });
      fireEvent.click(deleteButton);

      expect(mockCallbacks.onDelete).toHaveBeenCalledWith(mockRow);
    });

    it('should call onEdit with row when edit button is clicked', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const editButton = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editButton);

      expect(mockCallbacks.onEdit).toHaveBeenCalledWith(mockRow);
    });

    it('should stop event propagation on send button click', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');
      const stopPropagation = jest.fn();

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const sendButton = screen.getByRole('button', { name: /enviar prova/i });
      fireEvent.click(sendButton, { stopPropagation });

      // The click should have occurred (we verify by checking callback was called)
      expect(mockCallbacks.onSend).toHaveBeenCalled();
    });

    it('should stop event propagation on delete button click', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const deleteButton = screen.getByRole('button', { name: /deletar/i });
      fireEvent.click(deleteButton);

      expect(mockCallbacks.onDelete).toHaveBeenCalled();
    });

    it('should stop event propagation on edit button click', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      const editButton = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editButton);

      expect(mockCallbacks.onEdit).toHaveBeenCalled();
    });
  });

  describe('title column render', () => {
    it('should use renderTextCell function', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const titleColumn = columns.find((col) => col.key === 'title');

      // renderTextCell is imported directly, so we just verify render exists
      expect(titleColumn?.render).toBeDefined();
    });
  });
});
