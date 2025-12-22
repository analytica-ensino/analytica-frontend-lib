import { render, screen, fireEvent } from '@testing-library/react';
import { createModelsTableColumns } from './modelsTableColumns';
import type { ActivityModelTableItem } from '../../../types/activitiesHistory';
import { SubjectEnum } from '../../../enums/SubjectEnum';

describe('modelsTableColumns', () => {
  const mockModel: ActivityModelTableItem = {
    id: 'model-123',
    title: 'Prova de Matemática - Funções',
    savedAt: '15/12/2024',
    subject: 'Matemática',
    subjectId: 'subject-123',
  };

  const mockMapSubjectNameToEnum = jest.fn((name: string) => {
    if (name === 'Matemática') return SubjectEnum.MATEMATICA;
    return null;
  });

  const mockOnSendActivity = jest.fn();
  const mockOnEditModel = jest.fn();
  const mockOnDeleteModel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('column configuration', () => {
    it('should create 4 columns', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      expect(columns).toHaveLength(4);
    });

    it('should have correct column keys', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      expect(columns[0].key).toBe('title');
      expect(columns[1].key).toBe('savedAt');
      expect(columns[2].key).toBe('subject');
      expect(columns[3].key).toBe('actions');
    });

    it('should have sortable columns except actions', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
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
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
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
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
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
    it('should render subject cell', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!('Matemática', mockModel, 0)}</>);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('should handle non-string subject value', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const subjectColumn = columns[2];
      render(<>{subjectColumn.render!(null, mockModel, 0)}</>);

      // Should render empty string without error
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });
  });

  describe('actions column render', () => {
    it('should render send activity button when onSendActivity is provided', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Enviar atividade')).toBeInTheDocument();
      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });

    it('should not render send activity button when onSendActivity is undefined', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        undefined,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(
        screen.queryByLabelText('Enviar atividade')
      ).not.toBeInTheDocument();
    });

    it('should render edit button when onEditModel is provided', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Editar modelo')).toBeInTheDocument();
    });

    it('should not render edit button when onEditModel is undefined', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        undefined,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.queryByLabelText('Editar modelo')).not.toBeInTheDocument();
    });

    it('should always render delete button', () => {
      const columns = createModelsTableColumns(
        undefined,
        undefined,
        undefined,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      expect(screen.getByLabelText('Deletar modelo')).toBeInTheDocument();
    });

    it('should call onSendActivity with row when send button is clicked', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const sendButton = screen.getByLabelText('Enviar atividade');
      fireEvent.click(sendButton);

      expect(mockOnSendActivity).toHaveBeenCalledWith(mockModel);
      expect(mockOnSendActivity).toHaveBeenCalledTimes(1);
    });

    it('should call onEditModel with row when edit button is clicked', () => {
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
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
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
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
      const columns = createModelsTableColumns(
        mockMapSubjectNameToEnum,
        mockOnSendActivity,
        mockOnEditModel,
        mockOnDeleteModel
      );

      const actionsColumn = columns[3];
      render(<>{actionsColumn.render!(undefined, mockModel, 0)}</>);

      const sendButton = screen.getByLabelText('Enviar atividade');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      sendButton.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('columns without optional callbacks', () => {
    it('should work with all optional callbacks undefined', () => {
      const columns = createModelsTableColumns(
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
      expect(
        screen.queryByLabelText('Enviar atividade')
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Editar modelo')).not.toBeInTheDocument();
    });
  });
});
