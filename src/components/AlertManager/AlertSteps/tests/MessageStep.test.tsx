import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageStep } from '../MessageStep';
import { useAlertFormStore } from '../../useAlertForm';
import type { LabelsConfig } from '../../types';
import type { ChangeEvent } from 'react';

// Mock component types
interface MockInputProps {
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  variant?: string;
  required?: boolean;
  [key: string]: unknown;
}

interface MockTextAreaProps {
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  [key: string]: unknown;
}

interface MockImageUploadProps {
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onRemoveFile?: () => void;
}

// Mock components
jest.mock('../../../Input/Input', () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
    placeholder,
    required,
    ...props
  }: MockInputProps) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        data-testid={`input-${label}`}
        {...props}
      />
    </div>
  ),
}));

jest.mock('../../../TextArea/TextArea', () => ({
  __esModule: true,
  default: ({ label, value, onChange, placeholder }: MockTextAreaProps) => (
    <div>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid={`textarea-${label}`}
      />
    </div>
  ),
}));

jest.mock('../../../ImageUpload/ImageUpload', () => ({
  __esModule: true,
  default: ({
    selectedFile,
    onFileSelect,
    onRemoveFile,
  }: MockImageUploadProps) => (
    <div data-testid="image-upload">
      <button
        onClick={() => {
          const mockFile = new File(['content'], 'test.png', {
            type: 'image/png',
          });
          onFileSelect?.(mockFile);
        }}
        data-testid="select-file-button"
      >
        Select File
      </button>
      {selectedFile && (
        <div>
          <span data-testid="selected-file-name">{selectedFile.name}</span>
          <button onClick={onRemoveFile} data-testid="remove-file-button">
            Remove
          </button>
        </div>
      )}
    </div>
  ),
}));

describe('MessageStep', () => {
  beforeEach(() => {
    // Reset store before each test
    useAlertFormStore.getState().resetForm();
  });

  describe('rendering', () => {
    it('should render with default labels', () => {
      render(<MessageStep />);

      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Mensagem')).toBeInTheDocument();
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('should render with custom labels', () => {
      const customLabels: LabelsConfig = {
        titleLabel: 'Alert Title',
        titlePlaceholder: 'Enter title here',
        messageLabel: 'Alert Message',
        messagePlaceholder: 'Enter message here',
      };

      render(<MessageStep labels={customLabels} />);

      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter title here')
      ).toBeInTheDocument();
      expect(screen.getByText('Alert Message')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter message here')
      ).toBeInTheDocument();
    });

    it('should render image upload by default', () => {
      render(<MessageStep />);

      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('should not render image upload when allowImageAttachment is false', () => {
      render(<MessageStep allowImageAttachment={false} />);

      expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
    });

    it('should render title input as required', () => {
      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      expect(titleInput).toHaveAttribute('required');
    });
  });

  describe('title input', () => {
    it('should update store when title changes', () => {
      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      fireEvent.change(titleInput, { target: { value: 'New Alert Title' } });

      expect(useAlertFormStore.getState().title).toBe('New Alert Title');
    });

    it('should display current title from store', () => {
      useAlertFormStore.getState().setTitle('Existing Title');

      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      expect(titleInput).toHaveValue('Existing Title');
    });

    it('should handle empty title', () => {
      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      fireEvent.change(titleInput, { target: { value: '' } });

      expect(useAlertFormStore.getState().title).toBe('');
    });
  });

  describe('message textarea', () => {
    it('should update store when message changes', () => {
      render(<MessageStep />);

      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, {
        target: { value: 'Alert message content' },
      });

      expect(useAlertFormStore.getState().message).toBe(
        'Alert message content'
      );
    });

    it('should display current message from store', () => {
      useAlertFormStore.getState().setMessage('Existing Message');

      render(<MessageStep />);

      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      expect(messageTextarea).toHaveValue('Existing Message');
    });

    it('should handle empty message', () => {
      render(<MessageStep />);

      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, { target: { value: '' } });

      expect(useAlertFormStore.getState().message).toBe('');
    });

    it('should handle long message text', () => {
      render(<MessageStep />);

      const longMessage = 'A'.repeat(1000);
      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, { target: { value: longMessage } });

      expect(useAlertFormStore.getState().message).toBe(longMessage);
    });
  });

  describe('image upload', () => {
    it('should update store when file is selected', () => {
      render(<MessageStep />);

      const selectButton = screen.getByTestId('select-file-button');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.image).toBeTruthy();
      expect(state.image instanceof File && state.image.name).toBe('test.png');
    });

    it('should remove file from store when remove button is clicked', () => {
      render(<MessageStep />);

      // Select a file first
      const selectButton = screen.getByTestId('select-file-button');
      fireEvent.click(selectButton);

      expect(useAlertFormStore.getState().image).toBeTruthy();

      // Remove file
      const removeButton = screen.getByTestId('remove-file-button');
      fireEvent.click(removeButton);

      expect(useAlertFormStore.getState().image).toBeNull();
    });

    it('should display selected file name', () => {
      render(<MessageStep />);

      const selectButton = screen.getByTestId('select-file-button');
      fireEvent.click(selectButton);

      expect(screen.getByTestId('selected-file-name')).toHaveTextContent(
        'test.png'
      );
    });
  });

  describe('allowImageAttachment prop', () => {
    it('should show image upload when allowImageAttachment is true', () => {
      render(<MessageStep allowImageAttachment={true} />);

      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('should hide image upload when allowImageAttachment is false', () => {
      render(<MessageStep allowImageAttachment={false} />);

      expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
    });

    it('should default to true when not specified', () => {
      render(<MessageStep />);

      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });
  });

  describe('integration with store', () => {
    it('should read initial values from store', () => {
      useAlertFormStore.getState().setTitle('Stored Title');
      useAlertFormStore.getState().setMessage('Stored Message');

      render(<MessageStep />);

      expect(screen.getByTestId('input-Título')).toHaveValue('Stored Title');
      expect(screen.getByTestId('textarea-Mensagem')).toHaveValue(
        'Stored Message'
      );
    });

    it('should update store in real-time as user types', () => {
      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      const messageTextarea = screen.getByTestId('textarea-Mensagem');

      fireEvent.change(titleInput, { target: { value: 'T' } });
      expect(useAlertFormStore.getState().title).toBe('T');

      fireEvent.change(titleInput, { target: { value: 'Ti' } });
      expect(useAlertFormStore.getState().title).toBe('Ti');

      fireEvent.change(messageTextarea, { target: { value: 'M' } });
      expect(useAlertFormStore.getState().message).toBe('M');

      fireEvent.change(messageTextarea, { target: { value: 'Me' } });
      expect(useAlertFormStore.getState().message).toBe('Me');
    });
  });

  describe('complete form workflow', () => {
    it('should handle complete message step workflow', () => {
      render(<MessageStep />);

      // Fill title
      const titleInput = screen.getByTestId('input-Título');
      fireEvent.change(titleInput, { target: { value: 'Important Alert' } });

      // Fill message
      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, {
        target: { value: 'This is an important message' },
      });

      // Upload image
      const selectButton = screen.getByTestId('select-file-button');
      fireEvent.click(selectButton);

      // Verify all data is in store
      const state = useAlertFormStore.getState();
      expect(state.title).toBe('Important Alert');
      expect(state.message).toBe('This is an important message');
      expect(state.image).toBeTruthy();
      expect(state.image instanceof File && state.image.name).toBe('test.png');
    });

    it('should handle form with image upload disabled', () => {
      render(<MessageStep allowImageAttachment={false} />);

      // Fill title
      const titleInput = screen.getByTestId('input-Título');
      fireEvent.change(titleInput, { target: { value: 'Alert' } });

      // Fill message
      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, { target: { value: 'Message' } });

      // Verify data
      const state = useAlertFormStore.getState();
      expect(state.title).toBe('Alert');
      expect(state.message).toBe('Message');
      expect(state.image).toBeNull();
    });
  });

  describe('form validation', () => {
    it('should have required attribute on title input', () => {
      render(<MessageStep />);

      const titleInput = screen.getByTestId('input-Título');
      expect(titleInput).toHaveAttribute('required');
    });

    it('should accept empty message', () => {
      render(<MessageStep />);

      const messageTextarea = screen.getByTestId('textarea-Mensagem');
      fireEvent.change(messageTextarea, { target: { value: '' } });

      expect(useAlertFormStore.getState().message).toBe('');
    });
  });

  describe('multiple file operations', () => {
    it('should handle selecting file, removing, and selecting again', () => {
      render(<MessageStep />);

      const selectButton = screen.getByTestId('select-file-button');

      // Select first file
      fireEvent.click(selectButton);
      const image1 = useAlertFormStore.getState().image;
      expect(image1 instanceof File && image1.name).toBe('test.png');

      // Remove
      const removeButton = screen.getByTestId('remove-file-button');
      fireEvent.click(removeButton);
      expect(useAlertFormStore.getState().image).toBeNull();

      // Select again
      fireEvent.click(selectButton);
      const image2 = useAlertFormStore.getState().image;
      expect(image2 instanceof File && image2.name).toBe('test.png');
    });

    it('should maintain title and message when uploading files', () => {
      render(<MessageStep />);

      // Fill form
      fireEvent.change(screen.getByTestId('input-Título'), {
        target: { value: 'Title' },
      });
      fireEvent.change(screen.getByTestId('textarea-Mensagem'), {
        target: { value: 'Message' },
      });

      // Upload file
      fireEvent.click(screen.getByTestId('select-file-button'));

      // Form data should be preserved
      expect(useAlertFormStore.getState().title).toBe('Title');
      expect(useAlertFormStore.getState().message).toBe('Message');
      expect(useAlertFormStore.getState().image).toBeTruthy();
    });
  });

  describe('custom labels combinations', () => {
    it('should handle partial custom labels', () => {
      const partialLabels: LabelsConfig = {
        titleLabel: 'Custom Title',
        // messageLabel not provided - should use default
      };

      render(<MessageStep labels={partialLabels} />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Mensagem')).toBeInTheDocument(); // Default
    });

    it('should handle all custom labels', () => {
      const allLabels: LabelsConfig = {
        titleLabel: 'Title Field',
        titlePlaceholder: 'Type title',
        messageLabel: 'Message Field',
        messagePlaceholder: 'Type message',
      };

      render(<MessageStep labels={allLabels} />);

      expect(screen.getByText('Title Field')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type title')).toBeInTheDocument();
      expect(screen.getByText('Message Field')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type message')).toBeInTheDocument();
    });
  });
});
