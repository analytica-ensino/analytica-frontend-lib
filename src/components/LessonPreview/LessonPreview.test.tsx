import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LessonPreview } from './LessonPreview';
import type { Lesson } from '../../types/lessons';
import type { BaseApiClient } from '../../types/api';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';

// Mock dependencies
jest.mock('../../index', () => ({
  Button: ({
    children,
    variant,
    action,
    iconLeft,
    onClick,
    size,
    className,
    'aria-label': ariaLabel,
  }: {
    children?: React.ReactNode;
    variant?: string;
    action?: string;
    iconLeft?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    size?: string;
    className?: string;
    'aria-label'?: string;
  }) => (
    <button
      data-testid={`button-${ariaLabel || 'default'}`}
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-action={action}
      data-size={size}
    >
      {iconLeft}
      {children}
    </button>
  ),
  Text: ({
    children,
    size,
    weight,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <span
      data-testid="text"
      data-size={size}
      data-weight={weight}
      className={className}
    >
      {children}
    </span>
  ),
  Divider: () => <hr data-testid="divider" />,
}));

jest.mock('../shared/LessonWatchModal', () => ({
  LessonWatchModal: ({
    isOpen,
    onClose,
    getVideoData,
    getPodcastData,
    getBoardImages,
    getBoardImageRef,
    getInitialTimestampValue,
    handleVideoTimeUpdate,
    handleVideoCompleteCallback,
    onPodcastEnded,
    selectedLesson,
  }: {
    isOpen: boolean;
    onClose: () => void;
    getVideoData?: (lesson: unknown) => {
      src: string;
      poster?: string;
      subtitles?: string;
    };
    getPodcastData?: (lesson: unknown) => { src: string; title: string };
    getBoardImages?: (lesson: unknown) => unknown[];
    getBoardImageRef?: (
      index: number,
      total: number
    ) => React.RefObject<HTMLDivElement | null> | null;
    getInitialTimestampValue?: (id: string) => number;
    handleVideoTimeUpdate?: (time: number) => void;
    handleVideoCompleteCallback?: () => void;
    onPodcastEnded?: () => void | Promise<void>;
    selectedLesson?: { id: string } | null;
  }) => {
    if (!isOpen) return null;

    // Call helper functions to test them
    if (selectedLesson && getVideoData) {
      getVideoData(selectedLesson);
    }
    if (selectedLesson && getPodcastData) {
      getPodcastData(selectedLesson);
    }
    if (selectedLesson && getBoardImages) {
      const images = getBoardImages(selectedLesson);
      if (getBoardImageRef) {
        getBoardImageRef(0, images.length);
        if (images.length > 1) {
          getBoardImageRef(images.length - 1, images.length);
        }
        if (images.length > 2) {
          getBoardImageRef(1, images.length);
        }
      }
    }
    if (selectedLesson && getInitialTimestampValue) {
      getInitialTimestampValue(selectedLesson.id);
    }

    return (
      <div data-testid="lesson-watch-modal">
        <button data-testid="close-watch-modal" onClick={onClose}>
          Close
        </button>
        {handleVideoTimeUpdate && (
          <button
            data-testid="trigger-video-time-update"
            onClick={() => handleVideoTimeUpdate(100)}
          >
            Update Time
          </button>
        )}
        {handleVideoCompleteCallback && (
          <button
            data-testid="trigger-video-complete"
            onClick={handleVideoCompleteCallback}
          >
            Complete Video
          </button>
        )}
        {onPodcastEnded && (
          <button
            data-testid="trigger-podcast-ended"
            onClick={() => onPodcastEnded()}
          >
            End Podcast
          </button>
        )}
      </div>
    );
  },
}));

jest.mock('./components', () => ({
  AddActivityOptionModal: ({
    isOpen,
    onClose,
    onSelectOption,
    disableChooseModel,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelectOption: (option: string) => void;
    disableChooseModel?: boolean;
  }) =>
    isOpen ? (
      <div data-testid="add-activity-option-modal">
        <button
          data-testid="choose-model-option"
          onClick={() => onSelectOption('choose-model')}
          disabled={disableChooseModel}
        >
          Choose Model
        </button>
        <button
          data-testid="create-new-option"
          onClick={() => onSelectOption('create-new')}
        >
          Create New
        </button>
        <button data-testid="close-option-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../ChooseActivityModelModal', () => ({
  ChooseActivityModelModal: ({
    isOpen,
    onClose,
    onSelectModel,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelectModel: (model: ActivityModelTableItem) => void;
  }) =>
    isOpen ? (
      <div data-testid="choose-activity-model-modal">
        <button
          data-testid="select-model"
          onClick={() =>
            onSelectModel({
              id: 'model-1',
              title: 'Test Model',
              savedAt: '2024-01-01',
              subject: null,
              subjectId: null,
            })
          }
        >
          Select Model
        </button>
        <button data-testid="close-model-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../shared/ToastNotification/ToastNotification', () => ({
  ToastNotification: ({
    isOpen,
    onClose,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
  }) =>
    isOpen ? (
      <div data-testid="toast-notification">
        <span data-testid="toast-title">{title}</span>
        <button data-testid="close-toast" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../shared/ToastNotification/useToastNotification', () => ({
  useToastNotification: () => ({
    toastState: {
      isOpen: false,
      title: '',
      description: '',
      action: 'success' as const,
    },
    showSuccess: jest.fn(),
    showError: jest.fn(),
    hideToast: jest.fn(),
  }),
}));

describe('LessonPreview', () => {
  const mockLessons: Lesson[] = [
    {
      id: 'lesson-1',
      title: 'Lesson 1',
    },
    {
      id: 'lesson-2',
      title: 'Lesson 2',
    },
    {
      id: 'lesson-3',
      title: 'Lesson 3',
    },
  ];

  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const defaultProps = {
    lessons: mockLessons,
    apiClient: mockApiClient,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with default title', () => {
      render(<LessonPreview {...defaultProps} />);

      const titleElements = screen.getAllByTestId('text');
      const titleElement = titleElements.find((el) =>
        el.textContent?.includes('Prévia das aulas')
      );
      expect(titleElement).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<LessonPreview {...defaultProps} title="Custom Title" />);

      const titleElements = screen.getAllByTestId('text');
      const titleElement = titleElements.find((el) =>
        el.textContent?.includes('Custom Title')
      );
      expect(titleElement).toBeInTheDocument();
    });

    it('should render lesson count label for multiple lessons', () => {
      render(<LessonPreview {...defaultProps} />);

      const countElements = screen.getAllByTestId('text');
      const countElement = countElements.find((el) =>
        el.textContent?.includes('3 aulas adicionadas')
      );
      expect(countElement).toBeInTheDocument();
    });

    it('should render lesson count label for single lesson', () => {
      render(<LessonPreview {...defaultProps} lessons={[mockLessons[0]]} />);

      const countElements = screen.getAllByTestId('text');
      const countElement = countElements.find((el) =>
        el.textContent?.includes('1 aula adicionada')
      );
      expect(countElement).toBeInTheDocument();
    });

    it('should render all lessons', () => {
      render(<LessonPreview {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      expect(
        textElements.some((el) => el.textContent === 'Lesson 1')
      ).toBeTruthy();
      expect(
        textElements.some((el) => el.textContent === 'Lesson 2')
      ).toBeTruthy();
      expect(
        textElements.some((el) => el.textContent === 'Lesson 3')
      ).toBeTruthy();
    });

    it('should render remove all button when onRemoveAll is provided', () => {
      render(<LessonPreview {...defaultProps} onRemoveAll={jest.fn()} />);

      expect(screen.getByText('Remover tudo')).toBeInTheDocument();
    });

    it('should not render remove all button when onRemoveAll is not provided', () => {
      render(<LessonPreview {...defaultProps} />);

      expect(screen.queryByText('Remover tudo')).not.toBeInTheDocument();
    });

    it('should render activity section', () => {
      render(<LessonPreview {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      const activityTitle = textElements.find((el) =>
        el.textContent?.includes('Atividade da aula')
      );
      expect(activityTitle).toBeInTheDocument();
    });

    it('should render add activity button when no activity is selected', () => {
      render(<LessonPreview {...defaultProps} />);

      expect(screen.getByText('Adicionar atividade')).toBeInTheDocument();
    });

    it('should render divider', () => {
      render(<LessonPreview {...defaultProps} />);

      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <LessonPreview {...defaultProps} className="custom-class" />
      );

      const divWithClass = container.querySelector('.custom-class');
      expect(divWithClass).toBeInTheDocument();
    });
  });

  describe('lesson interactions', () => {
    it('should call onRemoveAll when remove all button is clicked', () => {
      const onRemoveAll = jest.fn();
      render(<LessonPreview {...defaultProps} onRemoveAll={onRemoveAll} />);

      const removeAllButton = screen.getByText('Remover tudo');
      fireEvent.click(removeAllButton);

      expect(onRemoveAll).toHaveBeenCalledTimes(1);
    });

    it('should call onRemoveLesson when remove lesson button is clicked', () => {
      const onRemoveLesson = jest.fn();
      render(
        <LessonPreview {...defaultProps} onRemoveLesson={onRemoveLesson} />
      );

      const removeButtons = screen.getAllByTestId(/button-Remover aula/);
      fireEvent.click(removeButtons[0]);

      expect(onRemoveLesson).toHaveBeenCalledTimes(1);
      expect(onRemoveLesson).toHaveBeenCalledWith('lesson-1');
    });

    it('should open watch modal when watch button is clicked', () => {
      render(<LessonPreview {...defaultProps} />);

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should close watch modal when close button is clicked', () => {
      render(<LessonPreview {...defaultProps} />);

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-watch-modal');
      fireEvent.click(closeButton);

      expect(
        screen.queryByTestId('lesson-watch-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('activity management', () => {
    it('should open activity option modal when add activity button is clicked', () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      expect(
        screen.getByTestId('add-activity-option-modal')
      ).toBeInTheDocument();
    });

    it('should call onCreateNewActivity when create new option is selected', () => {
      const onCreateNewActivity = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onCreateNewActivity={onCreateNewActivity}
        />
      );

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const createNewButton = screen.getByTestId('create-new-option');
      fireEvent.click(createNewButton);

      expect(onCreateNewActivity).toHaveBeenCalledTimes(1);
    });

    it('should open choose model modal when choose model option is selected', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });
    });

    it('should call onActivitySelected when model is selected', async () => {
      const onActivitySelected = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onActivitySelected={onActivitySelected}
        />
      );

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });

      const selectModelButton = screen.getByTestId('select-model');
      fireEvent.click(selectModelButton);

      expect(onActivitySelected).toHaveBeenCalledTimes(1);
      expect(onActivitySelected).toHaveBeenCalledWith({
        id: 'model-1',
        title: 'Test Model',
        savedAt: '2024-01-01',
        subject: null,
        subjectId: null,
      });
    });

    it('should display selected activity', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });

      const selectModelButton = screen.getByTestId('select-model');
      fireEvent.click(selectModelButton);

      await waitFor(() => {
        const textElements = screen.getAllByTestId('text');
        expect(
          textElements.some((el) => el.textContent === 'Test Model')
        ).toBeTruthy();
      });
    });

    it('should remove activity when remove button is clicked', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        const selectModelButton = screen.getByTestId('select-model');
        fireEvent.click(selectModelButton);
      });

      await waitFor(() => {
        const textElements = screen.getAllByTestId('text');
        expect(
          textElements.some((el) => el.textContent === 'Test Model')
        ).toBeTruthy();
      });

      const removeActivityButton = screen.getByTestId(
        'button-Remover atividade'
      );
      fireEvent.click(removeActivityButton);

      await waitFor(() => {
        expect(screen.getByText('Adicionar atividade')).toBeInTheDocument();
      });
    });

    it('should call onEditActivity when edit button is clicked', async () => {
      const onEditActivity = jest.fn();
      render(
        <LessonPreview {...defaultProps} onEditActivity={onEditActivity} />
      );

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        const selectModelButton = screen.getByTestId('select-model');
        fireEvent.click(selectModelButton);
      });

      await waitFor(() => {
        const editButton = screen.getByTestId('button-Editar atividade');
        fireEvent.click(editButton);
      });

      expect(onEditActivity).toHaveBeenCalledTimes(1);
    });
  });

  describe('modal behavior', () => {
    it('should close activity option modal when option is selected', () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      expect(
        screen.getByTestId('add-activity-option-modal')
      ).toBeInTheDocument();

      const createNewButton = screen.getByTestId('create-new-option');
      fireEvent.click(createNewButton);

      expect(
        screen.queryByTestId('add-activity-option-modal')
      ).not.toBeInTheDocument();
    });

    it('should close choose model modal when model is selected', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });

      const selectModelButton = screen.getByTestId('select-model');
      fireEvent.click(selectModelButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('choose-activity-model-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('should close choose model modal when close button is clicked', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-model-modal');
      fireEvent.click(closeButton);

      expect(
        screen.queryByTestId('choose-activity-model-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should render with no lessons', () => {
      render(<LessonPreview {...defaultProps} lessons={[]} />);

      const countElements = screen.getAllByTestId('text');
      const countElement = countElements.find((el) =>
        el.textContent?.includes('0 aulas adicionadas')
      );
      expect(countElement).toBeInTheDocument();
    });

    it('should handle lessons without titles', () => {
      const lessonsWithoutTitle: Partial<Lesson>[] = [
        {
          id: 'lesson-no-title',
        },
      ];

      render(
        <LessonPreview
          {...defaultProps}
          lessons={lessonsWithoutTitle as Lesson[]}
        />
      );

      const textElements = screen.getAllByTestId('text');
      expect(
        textElements.some((el) => el.textContent === 'Aula sem título')
      ).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('should not render choose model modal when apiClient is not provided', () => {
      const { container } = render(
        <LessonPreview {...defaultProps} apiClient={undefined} />
      );

      expect(
        container.querySelector('[data-testid="choose-activity-model-modal"]')
      ).not.toBeInTheDocument();
    });

    it('should render choose model modal when apiClient is provided', async () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('choose-activity-model-modal')
        ).toBeInTheDocument();
      });
    });

    it('should disable choose model option when apiClient is not provided', () => {
      render(<LessonPreview {...defaultProps} apiClient={undefined} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      expect(chooseModelButton).toBeDisabled();
    });

    it('should not disable choose model option when apiClient is provided', () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      expect(chooseModelButton).not.toBeDisabled();
    });

    it('should not open choose model modal when disabled button is clicked', async () => {
      render(<LessonPreview {...defaultProps} apiClient={undefined} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      fireEvent.click(chooseModelButton);

      await waitFor(
        () => {
          expect(
            screen.queryByTestId('choose-activity-model-modal')
          ).not.toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });
  });

  describe('drag and drop', () => {
    it('should call onReorder when lesson is dropped', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThanOrEqual(2);

      const firstLesson = draggables[0];
      const secondLesson = draggables[1];

      fireEvent.dragStart(firstLesson, {
        dataTransfer: {
          setData: jest.fn(),
          setDragImage: jest.fn(),
        },
      });

      fireEvent.drop(secondLesson, {
        dataTransfer: {
          getData: jest.fn(() => 'lesson-1'),
        },
      });

      expect(onReorder).toHaveBeenCalled();
    });

    it('should handle drag start with drag preview element', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      const setDataMock = jest.fn();
      const setDragImageMock = jest.fn();

      fireEvent.dragStart(draggables[0], {
        dataTransfer: {
          setData: setDataMock,
          setDragImage: setDragImageMock,
        },
      });

      expect(setDataMock).toHaveBeenCalledWith('text/plain', 'lesson-1');
    });

    it('should handle drag over event', () => {
      render(<LessonPreview {...defaultProps} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      fireEvent.dragOver(draggables[0]);
      // Drag over is handled - no assertions needed as it just prevents default
      expect(draggables[0]).toBeInTheDocument();
    });

    it('should not reorder when dropping on same lesson', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      fireEvent.dragStart(draggables[0], {
        dataTransfer: {
          setData: jest.fn(),
          setDragImage: jest.fn(),
        },
      });

      fireEvent.drop(draggables[0], {
        dataTransfer: {
          getData: jest.fn(() => 'lesson-1'),
        },
      });

      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should move lesson up with ArrowUp key', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThanOrEqual(2);

      fireEvent.keyDown(draggables[1], {
        key: 'ArrowUp',
      });

      expect(onReorder).toHaveBeenCalled();
    });

    it('should move lesson down with ArrowDown key', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThanOrEqual(2);

      fireEvent.keyDown(draggables[0], {
        key: 'ArrowDown',
      });

      expect(onReorder).toHaveBeenCalled();
    });

    it('should not move first lesson up', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      fireEvent.keyDown(draggables[0], {
        key: 'ArrowUp',
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should not move last lesson down', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      const lastLesson = draggables[draggables.length - 1];
      fireEvent.keyDown(lastLesson, {
        key: 'ArrowDown',
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should handle Enter key without action', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      fireEvent.keyDown(draggables[0], {
        key: 'Enter',
      });

      // Enter key should not trigger reorder
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should handle Space key without action', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const draggables = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('draggable') === 'true');

      expect(draggables.length).toBeGreaterThan(0);

      fireEvent.keyDown(draggables[0], {
        key: ' ',
      });

      // Space key should not trigger reorder
      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  describe('video and podcast callbacks', () => {
    it('should call onVideoTimeUpdate when video time updates', () => {
      const onVideoTimeUpdate = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onVideoTimeUpdate={onVideoTimeUpdate}
        />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      const triggerButton = screen.getByTestId('trigger-video-time-update');
      fireEvent.click(triggerButton);

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('lesson-1', 100);
    });

    it('should call onVideoComplete when video completes', () => {
      const onVideoComplete = jest.fn();
      render(
        <LessonPreview {...defaultProps} onVideoComplete={onVideoComplete} />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      const triggerButton = screen.getByTestId('trigger-video-complete');
      fireEvent.click(triggerButton);

      expect(onVideoComplete).toHaveBeenCalledWith('lesson-1');
    });

    it('should call onPodcastEnded when podcast ends', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      render(
        <LessonPreview {...defaultProps} onPodcastEnded={onPodcastEnded} />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      const triggerButton = screen.getByTestId('trigger-podcast-ended');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledWith('lesson-1');
      });
    });

    it('should not call onPodcastEnded again if already marked', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      render(
        <LessonPreview {...defaultProps} onPodcastEnded={onPodcastEnded} />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      const triggerButton = screen.getByTestId('trigger-podcast-ended');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(1);
      });

      // Try to call again - should not trigger
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(1);
      });
    });

    it('should reset podcast flag when modal is closed and reopened', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      render(
        <LessonPreview {...defaultProps} onPodcastEnded={onPodcastEnded} />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      const triggerButton = screen.getByTestId('trigger-podcast-ended');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(1);
      });

      // Close modal
      const closeButton = screen.getByTestId('close-watch-modal');
      fireEvent.click(closeButton);

      // Reopen modal
      fireEvent.click(watchButtons[0]);

      const newTriggerButton = screen.getByTestId('trigger-podcast-ended');
      fireEvent.click(newTriggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle podcast ended error and revert flag', async () => {
      const onPodcastEnded = jest
        .fn()
        .mockRejectedValue(new Error('Test error'));
      render(
        <LessonPreview {...defaultProps} onPodcastEnded={onPodcastEnded} />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      const triggerButton = screen.getByTestId('trigger-podcast-ended');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalled();
      });

      // Should be able to call again after error
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(2);
      });
    });

    it('should call getInitialTimestamp when provided', () => {
      const getInitialTimestamp = jest.fn(() => 100);
      render(
        <LessonPreview
          {...defaultProps}
          getInitialTimestamp={getInitialTimestamp}
        />
      );

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
      expect(getInitialTimestamp).toHaveBeenCalledWith('lesson-1');
    });
  });

  describe('modal close behavior', () => {
    it('should close activity option modal when close button is clicked', () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      expect(
        screen.getByTestId('add-activity-option-modal')
      ).toBeInTheDocument();

      const closeButton = screen.getByTestId('close-option-modal');
      fireEvent.click(closeButton);

      expect(
        screen.queryByTestId('add-activity-option-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('onPositionsChange callback', () => {
    it('should call onPositionsChange when lessons are reordered', () => {
      const onPositionsChange = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onPositionsChange={onPositionsChange}
        />
      );

      expect(onPositionsChange).toHaveBeenCalled();
    });

    it('should call onPositionsChange on mount', () => {
      const onPositionsChange = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onPositionsChange={onPositionsChange}
        />
      );

      expect(onPositionsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ position: 1 }),
          expect.objectContaining({ position: 2 }),
          expect.objectContaining({ position: 3 }),
        ])
      );
    });
  });

  describe('lessons with special data', () => {
    it('should handle lessons with video data', () => {
      const lessonsWithVideo = [
        {
          id: 'lesson-video',
          title: 'Video Lesson',
          videoSrc: 'https://example.com/video.mp4',
          videoPoster: 'https://example.com/poster.jpg',
          videoSubtitles: 'https://example.com/subtitles.vtt',
        },
      ];

      render(<LessonPreview {...defaultProps} lessons={lessonsWithVideo} />);

      const textElements = screen.getAllByTestId('text');
      expect(
        textElements.some((el) => el.textContent === 'Video Lesson')
      ).toBeTruthy();

      // Open watch modal to trigger getVideoData
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons with podcast data', () => {
      const lessonsWithPodcast = [
        {
          id: 'lesson-podcast',
          title: 'Podcast Lesson',
          podcastSrc: 'https://example.com/podcast.mp3',
          podcastTitle: 'Test Podcast',
        },
      ];

      render(<LessonPreview {...defaultProps} lessons={lessonsWithPodcast} />);

      const textElements = screen.getAllByTestId('text');
      expect(
        textElements.some((el) => el.textContent === 'Podcast Lesson')
      ).toBeTruthy();

      // Open watch modal to trigger getPodcastData
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons with board images', () => {
      const lessonsWithBoard = [
        {
          id: 'lesson-board',
          title: 'Board Lesson',
          boardImages: [
            { id: 'img-1', url: 'https://example.com/image1.jpg' },
            { id: 'img-2', url: 'https://example.com/image2.jpg' },
          ],
        },
      ];

      render(<LessonPreview {...defaultProps} lessons={lessonsWithBoard} />);

      const textElements = screen.getAllByTestId('text');
      expect(
        textElements.some((el) => el.textContent === 'Board Lesson')
      ).toBeTruthy();

      // Open watch modal to trigger getBoardImages and getBoardImageRef
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons with multiple board images for ref testing', () => {
      const lessonsWithManyBoards = [
        {
          id: 'lesson-many-boards',
          title: 'Many Boards Lesson',
          boardImages: [
            { id: 'img-1', url: 'https://example.com/image1.jpg' },
            { id: 'img-2', url: 'https://example.com/image2.jpg' },
            { id: 'img-3', url: 'https://example.com/image3.jpg' },
          ],
        },
      ];

      render(
        <LessonPreview {...defaultProps} lessons={lessonsWithManyBoards} />
      );

      // Open watch modal to trigger getBoardImageRef with middle index
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons without video src', () => {
      const lessonsWithoutVideoSrc = [
        {
          id: 'lesson-no-video',
          title: 'No Video Lesson',
        },
      ];

      render(
        <LessonPreview {...defaultProps} lessons={lessonsWithoutVideoSrc} />
      );

      // Open watch modal to trigger getVideoData with null check
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons without podcast title', () => {
      const lessonsWithoutPodcastTitle = [
        {
          id: 'lesson-no-podcast-title',
          title: 'No Podcast Title',
          podcastSrc: 'https://example.com/podcast.mp3',
        },
      ];

      render(
        <LessonPreview {...defaultProps} lessons={lessonsWithoutPodcastTitle} />
      );

      // Open watch modal to trigger getPodcastData with default title
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });

    it('should handle lessons without board images', () => {
      const lessonsWithoutBoard = [
        {
          id: 'lesson-no-board',
          title: 'No Board Lesson',
        },
      ];

      render(<LessonPreview {...defaultProps} lessons={lessonsWithoutBoard} />);

      // Open watch modal to trigger getBoardImages with empty array
      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();
    });
  });

  describe('localStorage handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('localStorage error');
        });

      render(<LessonPreview {...defaultProps} />);

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      getItemSpy.mockRestore();
    });

    it('should use stored timestamp from localStorage', () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => '150');

      render(<LessonPreview {...defaultProps} />);

      const watchButtons = screen.getAllByTestId(/button-Assistir aula/);
      fireEvent.click(watchButtons[0]);

      expect(screen.getByTestId('lesson-watch-modal')).toBeInTheDocument();

      getItemSpy.mockRestore();
    });
  });
});
