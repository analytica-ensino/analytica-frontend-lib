import { render, screen, fireEvent } from '@testing-library/react';
import { createGoalModelsTableColumns } from './modelsTableColumns';
import type { GoalModelTableItem } from '../../../types/recommendedLessons';
import { SubjectEnum } from '../../../enums/SubjectEnum';

describe('modelsTableColumns', () => {
  const mockModel: GoalModelTableItem = {
    id: 'model-123',
    title: 'Aula de Matemática - Funções',
    savedAt: '15/12/2024',
    subject: 'Matemática',
    subjectId: 'subject-123',
  };

  const mockMapSubjectNameToEnum = jest.fn((name: string) => {
    if (name === 'Matemática') return SubjectEnum.MATEMATICA;
    return null;
  });

  const mockOnSendLesson = jest.fn();
  const mockOnEditModel = jest.fn();
  const mockOnDeleteModel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('column configuration', () => {
    it('should create 4 columns', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      expect(columns).toHaveLength(4);
    });

    it('should have correct column keys', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      expect(columns[0].key).toBe('title');
      expect(columns[1].key).toBe('savedAt');
      expect(columns[2].key).toBe('subject');
      expect(columns[3].key).toBe('actions');
    });

    it('should have sortable columns except actions', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      expect(columns[0].sortable).toBe(true);
      expect(columns[1].sortable).toBe(true);
      expect(columns[2].sortable).toBe(true);
      expect(columns[3].sortable).toBe(false);
    });
  });

  describe('title column render', () => {
    it('should render title text', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const titleColumn = columns[0];
      const { container } = render(
        <>{titleColumn.render!('Test Title', mockModel, 0)}</>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('truncate');
    });

    it('should handle non-string title value', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const titleColumn = columns[0];
      const { container } = render(
        <>{titleColumn.render!(123, mockModel, 0)}</>
      );

      expect(container.firstChild).toHaveTextContent('');
    });
  });

  describe('subject column render', () => {
    it('should render subject with icon when mapSubjectNameToEnum returns valid enum', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!('Matemática', mockModel, 0)}</>);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('should render subject text only when mapSubjectNameToEnum returns null', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!('Unknown Subject', mockModel, 0)}</>);

      expect(screen.getByText('Unknown Subject')).toBeInTheDocument();
      expect(mockMapSubjectNameToEnum).toHaveBeenCalledWith('Unknown Subject');
    });

    it('should render dash when subject is empty', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!('', mockModel, 0)}</>);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should handle non-string subject value', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!(null, mockModel, 0)}</>);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render without mapSubjectNameToEnum function', () => {
      const columns = createGoalModelsTableColumns(
        undefined,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!('Matemática', mockModel, 0)}</>);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });

  describe('actions column render', () => {
    it('should render send lesson button when onSendLesson is provided', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Enviar aula')).toBeInTheDocument();
      expect(screen.getByText('Enviar aula')).toBeInTheDocument();
    });

    it('should not render send lesson button when onSendLesson is undefined', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        undefined,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.queryByLabelText('Enviar aula')).not.toBeInTheDocument();
    });

    it('should render edit button when onEditModel is provided', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Editar modelo')).toBeInTheDocument();
    });

    it('should not render edit button when onEditModel is undefined', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        undefined,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.queryByLabelText('Editar modelo')).not.toBeInTheDocument();
    });

    it('should always render delete button', () => {
      const columns = createGoalModelsTableColumns(
        undefined,
        undefined,
        undefined,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Deletar modelo')).toBeInTheDocument();
    });

    it('should call onSendLesson with row when send button is clicked', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const sendButton = screen.getByLabelText('Enviar aula');
      fireEvent.click(sendButton);

      expect(mockOnSendLesson).toHaveBeenCalledWith(mockModel);
      expect(mockOnSendLesson).toHaveBeenCalledTimes(1);
    });

    it('should call onEditModel with row when edit button is clicked', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const editButton = screen.getByLabelText('Editar modelo');
      fireEvent.click(editButton);

      expect(mockOnEditModel).toHaveBeenCalledWith(mockModel);
      expect(mockOnEditModel).toHaveBeenCalledTimes(1);
    });

    it('should call onDeleteModel with row when delete button is clicked', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const deleteButton = screen.getByLabelText('Deletar modelo');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteModel).toHaveBeenCalledWith(mockModel);
      expect(mockOnDeleteModel).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation when buttons are clicked', () => {
      const columns = createGoalModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendLesson,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const sendButton = screen.getByLabelText('Enviar aula');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      sendButton.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('columns without optional callbacks', () => {
    it('should work with all optional callbacks undefined', () => {
      const columns = createGoalModelsTableColumns(
        undefined,
        undefined,
        undefined,
        mockOnDeleteModel
      );

      expect(columns).toHaveLength(4);

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      // Only delete button should be visible
      expect(screen.getByLabelText('Deletar modelo')).toBeInTheDocument();
      expect(screen.queryByLabelText('Enviar aula')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Editar modelo')).not.toBeInTheDocument();
    });
  });
});
