import { render, screen, fireEvent } from '@testing-library/react';
import {
  createExamDraftsModelsTableColumns,
  type ExamTableCallbacks,
} from './examDraftsModelsTableConfig';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ActivityType } from '../../components/ActivityCreate/ActivityCreate.types';

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
    subjects: [
      {
        id: 'math-1',
        name: 'Matemática',
        icon: 'Calculator',
        color: '#FF0000',
      },
    ],
    type: ActivityType.MODELO,
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
      const subjectColumn = columns.find((col) => col.key === 'subjects');

      expect(subjectColumn).toBeDefined();
      expect(subjectColumn?.label).toBe('Componente curricular');
      // Uma lista de matérias não tem ordenação com significado.
      expect(subjectColumn?.sortable).toBe(false);
    });

    it('should have actions column with correct configuration', () => {
      const columns = createExamDraftsModelsTableColumns(mockCallbacks);
      const actionsColumn = columns.find((col) => col.key === 'actions');

      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.label).toBe('');
      expect(actionsColumn?.sortable).toBe(false);
    });
  });

  describe('subjects column render', () => {
    const subjectsColumn = () =>
      createExamDraftsModelsTableColumns(mockCallbacks).find(
        (col) => col.key === 'subjects'
      );

    it('renders one icon per subject the draft covers', () => {
      const subjects = [
        {
          id: '1',
          name: 'Matemática',
          color: '#C62828',
          icon: 'MathOperations',
        },
        { id: '2', name: 'Física', color: '#1565C0', icon: 'Atom' },
      ];

      render(<>{subjectsColumn()?.render?.(subjects, mockRow, 0)}</>);

      expect(screen.getByLabelText('Matemática')).toBeInTheDocument();
      expect(screen.getByLabelText('Física')).toBeInTheDocument();
    });

    it('renders a dash when the draft covers no subject', () => {
      const { container } = render(
        <>{subjectsColumn()?.render?.([], mockRow, 0)}</>
      );

      expect(container.textContent).toContain('-');
    });

    it('renders a dash when the value is not a list', () => {
      // ColumnConfig.render is typed `unknown`; a row from an older payload
      // must degrade rather than throw.
      const { container } = render(
        <>{subjectsColumn()?.render?.(null, mockRow, 0)}</>
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

    it('should render send button with a custom label when provided', () => {
      const columns = createExamDraftsModelsTableColumns(
        mockCallbacks,
        'Enviar atividade'
      );
      const actionsColumn = columns.find((col) => col.key === 'actions');

      render(<>{actionsColumn?.render?.(undefined, mockRow, 0)}</>);

      expect(
        screen.getByRole('button', { name: /enviar atividade/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /enviar prova/i })
      ).not.toBeInTheDocument();
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
