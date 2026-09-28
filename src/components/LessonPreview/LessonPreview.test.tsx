import {
  render,
  screen,
  fireEvent,
  waitFor,
  createEvent,
  within,
} from '@testing-library/react';
import React from 'react';
import { LessonPreview } from './LessonPreview';
import type { Lesson } from '../../types/lessons';
import type { BaseApiClient } from '../../types/api';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';

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
    disabled,
    'aria-label': ariaLabel,
  }: {
    children?: React.ReactNode;
    variant?: string;
    action?: string;
    iconLeft?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    size?: string;
    className?: string;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button
      data-testid={`button-${ariaLabel || 'default'}`}
      onClick={onClick}
      disabled={disabled}
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
  EmptyState: ({
    title,
    description,
    image,
    size,
  }: {
    title: string;
    description: string;
    image?: React.ReactNode;
    size?: string;
  }) => (
    <div data-testid="empty-state" data-size={size}>
      {image && <div data-testid="empty-state-image">{image}</div>}
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

jest.mock('../LessonCardPreview/LessonCardPreview', () => ({
  LessonCardPreview: ({
    title,
    value,
    position,
    subject,
    trail,
    showDragHandle,
    onWatch,
    onRemove,
    onMoveUp,
    onMoveDown,
  }: {
    title?: string;
    value?: string;
    position?: number;
    subject?: { name: string };
    trail?: string[];
    showDragHandle?: boolean;
    onWatch?: () => void;
    onRemove?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
  }) => (
    <div
      data-testid="lesson-card-preview"
      data-value={value}
      data-position={position}
      data-subject={subject?.name ?? ''}
      data-trail={(trail ?? []).join('|')}
      data-drag-handle={showDragHandle ? 'true' : 'false'}
    >
      <div data-drag-preview="true">drag-preview</div>
      <span data-testid="text">{title}</span>
      {onWatch && (
        <button data-testid="button-Assistir aula" onClick={onWatch}>
          watch
        </button>
      )}
      {onRemove && (
        <button
          data-testid={`button-Remover aula ${position}`}
          data-no-drag="true"
          onClick={onRemove}
        >
          remove
        </button>
      )}
      <span
        data-testid={`move-state-${value}`}
        data-can-move-up={onMoveUp ? 'true' : 'false'}
        data-can-move-down={onMoveDown ? 'true' : 'false'}
      />
      {onMoveUp && (
        <button data-testid={`move-up-${value}`} onClick={onMoveUp}>
          up
        </button>
      )}
      {onMoveDown && (
        <button data-testid={`move-down-${value}`} onClick={onMoveDown}>
          down
        </button>
      )}
    </div>
  ),
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
              type: ActivityType.MODELO,
              title: 'Test Model',
              savedAt: '2024-01-01',
              subjects: [],
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

jest.mock('../../assets/icons/Activities', () => ({
  __esModule: true,
  default: () => <svg data-testid="activities-icon" />,
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
        el.textContent?.includes('Prévia da aula recomendada')
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
        type: ActivityType.MODELO,
        title: 'Test Model',
        savedAt: '2024-01-01',
        subjects: [],
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
      expect(onEditActivity).toHaveBeenCalledWith({
        id: 'model-1',
        type: ActivityType.MODELO,
        title: 'Test Model',
        savedAt: '2024-01-01',
        subjects: [],
        subjectId: null,
      });
    });

    it('should not call onEditActivity when no activity is selected', () => {
      const onEditActivity = jest.fn();
      render(
        <LessonPreview {...defaultProps} onEditActivity={onEditActivity} />
      );

      // No activity is selected, so there's no edit button to click
      expect(
        screen.queryByTestId('button-Editar atividade')
      ).not.toBeInTheDocument();
      expect(onEditActivity).not.toHaveBeenCalled();
    });

    it('should not call onEditActivity when callback is not provided', async () => {
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
        const editButton = screen.getByTestId('button-Editar atividade');
        // Click should not throw error even without onEditActivity callback
        fireEvent.click(editButton);
      });

      // Test passes if no error is thrown
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

    it('should render EmptyState with correct props when no lessons', () => {
      const onRemoveAll = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          lessons={[]}
          onRemoveAll={onRemoveAll}
        />
      );

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute('data-size', 'compact');

      // Should show image
      expect(screen.getByTestId('empty-state-image')).toBeInTheDocument();

      // Should show correct text
      expect(
        screen.getByText('Nenhuma aula adicionada ainda')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Utilize a coluna ao lado para adicionar aulas à aula recomendada.'
        )
      ).toBeInTheDocument();

      // "Remover tudo" button should NOT be present
      expect(screen.queryByText('Remover tudo')).not.toBeInTheDocument();
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

    it('should not disable choose model option when apiClient is provided', () => {
      render(<LessonPreview {...defaultProps} />);

      const addButton = screen.getByText('Adicionar atividade');
      fireEvent.click(addButton);

      const chooseModelButton = screen.getByTestId('choose-model-option');
      expect(chooseModelButton).not.toBeDisabled();
    });
  });

  describe('drag and drop', () => {
    /**
     * jsdom has no layout: the list starts at y=0 and each card is 100px tall
     * with a 10px gap (midpoints at 50, 160 and 270).
     */
    const stubListGeometry = () => {
      const setRect = (element: Element, top: number, height: number) => {
        element.getBoundingClientRect = () =>
          ({
            top,
            height,
            bottom: top + height,
            left: 0,
            right: 200,
            width: 200,
            x: 0,
            y: top,
            toJSON: () => ({}),
          }) as DOMRect;
      };

      setRect(screen.getByTestId('lessons-list'), 0, 320);
      setRect(screen.getByTestId('lesson-draggable-lesson-1'), 0, 100);
      setRect(screen.getByTestId('lesson-draggable-lesson-2'), 110, 100);
      setRect(screen.getByTestId('lesson-draggable-lesson-3'), 220, 100);
    };

    /** jsdom drops `clientY` from the init, so define it on the event. */
    const fireDragAt = (
      type: 'dragOver' | 'drop',
      element: Element,
      dataTransfer: DataTransfer,
      clientY: number
    ) => {
      const event = createEvent[type](element, { dataTransfer });
      Object.defineProperty(event, 'clientY', { value: clientY });
      fireEvent(element, event);
    };

    const createDataTransfer = () =>
      ({
        setData: jest.fn(),
        getData: jest.fn(() => ''),
        setDragImage: jest.fn(),
      }) as unknown as DataTransfer;

    const getOrder = () =>
      screen
        .getAllByTestId('lesson-card-preview')
        .map((el) => el.getAttribute('data-value'));

    it('renders every card with drag cue, subject and trail', () => {
      render(
        <LessonPreview
          {...defaultProps}
          lessons={[
            {
              id: 'lesson-1',
              title: 'Lesson 1',
              subject: {
                id: 's1',
                name: 'Biologia',
                color: '#00ff00',
                icon: 'Leaf',
              },
              topic: { id: 't1', name: 'Ecologia' },
            },
          ]}
        />
      );

      const card = screen.getByTestId('lesson-card-preview');
      expect(card).toHaveAttribute('data-subject', 'Biologia');
      expect(card).toHaveAttribute('data-trail', 'Biologia|Ecologia');
      expect(card).toHaveAttribute('data-drag-handle', 'true');
      expect(card).toHaveAttribute('data-position', '1');
    });

    it('uses the card drag preview as drag image', () => {
      const dataTransfer = createDataTransfer();
      render(<LessonPreview {...defaultProps} />);

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      fireEvent.dragStart(firstCard, { dataTransfer });

      expect(dataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'lesson-1'
      );
      expect(dataTransfer.setDragImage).toHaveBeenCalledWith(
        within(firstCard).getByText('drag-preview'),
        8,
        8
      );
    });

    it('shows the drop placeholder and reorders at the indicated slot', async () => {
      const onReorder = jest.fn();
      const onPositionsChange = jest.fn();
      const dataTransfer = createDataTransfer();
      render(
        <LessonPreview
          {...defaultProps}
          onReorder={onReorder}
          onPositionsChange={onPositionsChange}
        />
      );

      await waitFor(() => expect(onPositionsChange).toHaveBeenCalled());
      onPositionsChange.mockClear();

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      stubListGeometry();

      fireEvent.dragStart(firstCard, { dataTransfer });
      // Below Lesson 2's midpoint (160) -> lands between Lesson 2 and 3
      fireDragAt('dragOver', firstCard, dataTransfer, 200);

      const placeholder = screen.getByTestId('drop-placeholder');
      const cards = screen.getAllByTestId('lesson-card-preview');
      expect(
        placeholder.compareDocumentPosition(cards[1]) &
          Node.DOCUMENT_POSITION_PRECEDING
      ).toBeTruthy();
      expect(
        placeholder.compareDocumentPosition(cards[2]) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();

      fireDragAt('drop', firstCard, dataTransfer, 200);

      expect(getOrder()).toEqual(['lesson-2', 'lesson-1', 'lesson-3']);
      expect(onReorder).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'lesson-2', position: 1 }),
        expect.objectContaining({ id: 'lesson-1', position: 2 }),
        expect.objectContaining({ id: 'lesson-3', position: 3 }),
      ]);
      expect(onPositionsChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'lesson-2', position: 1 }),
        expect.objectContaining({ id: 'lesson-1', position: 2 }),
        expect.objectContaining({ id: 'lesson-3', position: 3 }),
      ]);
      expect(screen.queryByTestId('drop-placeholder')).not.toBeInTheDocument();
    });

    it('shows the placeholder at the end and drops the card last', () => {
      const onReorder = jest.fn();
      const dataTransfer = createDataTransfer();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      stubListGeometry();

      fireEvent.dragStart(firstCard, { dataTransfer });
      // Below the last midpoint (270) -> end of the list
      fireDragAt('dragOver', firstCard, dataTransfer, 300);

      const list = screen.getByTestId('lessons-list');
      expect(list.lastElementChild).toBe(
        screen.getByTestId('drop-placeholder')
      );

      fireDragAt('drop', firstCard, dataTransfer, 300);

      expect(getOrder()).toEqual(['lesson-2', 'lesson-3', 'lesson-1']);
      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('marks the dragged card and clears the state on drag end', () => {
      const dataTransfer = createDataTransfer();
      render(<LessonPreview {...defaultProps} />);

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      stubListGeometry();

      fireEvent.dragStart(firstCard, { dataTransfer });
      expect(firstCard.className).toContain('opacity-40');
      expect(firstCard.className).toContain('shadow-hard-shadow-2');

      fireDragAt('dragOver', firstCard, dataTransfer, 200);
      fireEvent.dragEnd(firstCard);

      expect(firstCard.className).not.toContain('opacity-40');
      expect(screen.queryByTestId('drop-placeholder')).not.toBeInTheDocument();
    });

    it('does not reorder when the indicator points at the original slot', () => {
      const onReorder = jest.fn();
      const dataTransfer = createDataTransfer();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      stubListGeometry();

      fireEvent.dragStart(firstCard, { dataTransfer });
      // Above Lesson 2's midpoint (160) -> still the first slot
      fireDragAt('dragOver', firstCard, dataTransfer, 140);
      fireDragAt('drop', firstCard, dataTransfer, 140);

      expect(getOrder()).toEqual(['lesson-1', 'lesson-2', 'lesson-3']);
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not start a drag from the remove button', () => {
      const dataTransfer = createDataTransfer();
      render(<LessonPreview {...defaultProps} onRemoveLesson={jest.fn()} />);

      const firstCard = screen.getByTestId('lesson-draggable-lesson-1');
      fireEvent.mouseDown(screen.getByTestId('button-Remover aula 1'));

      const event = createEvent.dragStart(firstCard, { dataTransfer });
      event.preventDefault = jest.fn();
      fireEvent(firstCard, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(dataTransfer.setData).not.toHaveBeenCalled();
    });
  });

  describe('keyboard reordering', () => {
    const getOrder = () =>
      screen
        .getAllByTestId('lesson-card-preview')
        .map((el) => el.getAttribute('data-value'));

    it('lets the card own the keyboard: the drag wrapper is not focusable', () => {
      render(<LessonPreview {...defaultProps} />);

      const wrapper = screen.getByTestId('lesson-draggable-lesson-1');
      expect(wrapper).not.toHaveAttribute('role');
      expect(wrapper).not.toHaveAttribute('tabindex');
    });

    it('moves a lesson up and down through the card callbacks', () => {
      const onReorder = jest.fn();
      render(<LessonPreview {...defaultProps} onReorder={onReorder} />);

      fireEvent.click(screen.getByTestId('move-up-lesson-2'));
      expect(getOrder()).toEqual(['lesson-2', 'lesson-1', 'lesson-3']);

      fireEvent.click(screen.getByTestId('move-down-lesson-2'));
      expect(getOrder()).toEqual(['lesson-1', 'lesson-2', 'lesson-3']);

      expect(onReorder).toHaveBeenCalledTimes(2);
      expect(onReorder).toHaveBeenLastCalledWith([
        expect.objectContaining({ id: 'lesson-1', position: 1 }),
        expect.objectContaining({ id: 'lesson-2', position: 2 }),
        expect.objectContaining({ id: 'lesson-3', position: 3 }),
      ]);
    });

    it('does not offer moving the first lesson up or the last one down', () => {
      render(<LessonPreview {...defaultProps} />);

      expect(screen.getByTestId('move-state-lesson-1')).toHaveAttribute(
        'data-can-move-up',
        'false'
      );
      expect(screen.getByTestId('move-state-lesson-1')).toHaveAttribute(
        'data-can-move-down',
        'true'
      );
      expect(screen.getByTestId('move-state-lesson-3')).toHaveAttribute(
        'data-can-move-down',
        'false'
      );
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
            { id: 'img-1', imageUrl: 'https://example.com/image1.jpg' },
            { id: 'img-2', imageUrl: 'https://example.com/image2.jpg' },
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
            { id: 'img-1', imageUrl: 'https://example.com/image1.jpg' },
            { id: 'img-2', imageUrl: 'https://example.com/image2.jpg' },
            { id: 'img-3', imageUrl: 'https://example.com/image3.jpg' },
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

  describe('card variant', () => {
    it('keeps the default layout when no variant is given', () => {
      render(<LessonPreview {...defaultProps} />);

      const container = screen.getByTestId('lesson-preview-container');
      expect(container).toHaveAttribute('data-variant', 'default');
      expect(container).toHaveClass('p-4', 'rounded-lg');
    });

    it('renders the card layout with a bigger title and a count chip', () => {
      render(<LessonPreview {...defaultProps} variant="card" />);

      const container = screen.getByTestId('lesson-preview-container');
      expect(container).toHaveAttribute('data-variant', 'card');
      expect(container).toHaveClass('px-7.5', 'py-6', 'rounded-xl');

      const texts = screen.getAllByTestId('text');
      expect(
        texts.find((el) => el.textContent === 'Prévia da aula recomendada')
      ).toHaveAttribute('data-size', 'xl');
      expect(
        texts.find((el) => el.textContent?.includes('aulas adicionadas'))
      ).toHaveClass('bg-background-50');
    });

    it('keeps "Remover tudo" visible but disabled while empty', () => {
      render(
        <LessonPreview
          {...defaultProps}
          lessons={[]}
          onRemoveAll={jest.fn()}
          variant="card"
        />
      );

      expect(screen.getByText('Remover tudo').closest('button')).toBeDisabled();
    });

    it('enables "Remover tudo" when there are lessons', () => {
      const onRemoveAll = jest.fn();
      render(
        <LessonPreview
          {...defaultProps}
          onRemoveAll={onRemoveAll}
          variant="card"
        />
      );

      const button = screen.getByText('Remover tudo').closest('button');
      expect(button).not.toBeDisabled();
      fireEvent.click(button!);
      expect(onRemoveAll).toHaveBeenCalledTimes(1);
    });

    it('wraps the empty state in the dashed box', () => {
      render(<LessonPreview {...defaultProps} lessons={[]} variant="card" />);

      expect(
        screen
          .getByText('Nenhuma aula adicionada ainda')
          .closest('.border-dashed')
      ).toBeInTheDocument();
    });

    it('does not use the dashed box in the default layout', () => {
      render(<LessonPreview {...defaultProps} lessons={[]} />);

      expect(
        screen
          .getByText('Nenhuma aula adicionada ainda')
          .closest('.border-dashed')
      ).toBeNull();
    });
  });
});
