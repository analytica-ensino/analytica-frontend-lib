import type { Story } from '@ladle/react';
import { useState, Dispatch, SetStateAction } from 'react';
import ImageUpload from './ImageUpload';
import { Upload, FileImage } from 'phosphor-react';

/**
 * Showcase principal: todas as variações do ImageUpload
 */
export const AllVariations: Story = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);

  const simulateUpload = (
    setProgress: Dispatch<SetStateAction<number>>,
    onComplete?: () => void
  ) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Image Upload</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>ImageUpload</code>
      </p>

      {/* Default variant */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Default Variant
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-700 mb-2">Without file</p>
            <ImageUpload
              selectedFile={file1}
              onFileSelect={(file) => {
                setFile1(file);
                simulateUpload(setProgress1);
              }}
              onRemoveFile={() => setFile1(null)}
            />
          </div>

          <div>
            <p className="text-sm text-text-700 mb-2">With progress bar</p>
            <ImageUpload
              selectedFile={file1}
              uploadProgress={progress1}
              onFileSelect={(file) => {
                setFile1(file);
                simulateUpload(setProgress1);
              }}
              onRemoveFile={() => {
                setFile1(null);
                setProgress1(0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Compact variant */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Compact Variant
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-700 mb-2">Compact without file</p>
            <ImageUpload
              variant="compact"
              selectedFile={file2}
              onFileSelect={(file) => {
                setFile2(file);
                simulateUpload(setProgress2);
              }}
              onRemoveFile={() => setFile2(null)}
            />
          </div>

          <div>
            <p className="text-sm text-text-700 mb-2">Compact with file</p>
            <ImageUpload
              variant="compact"
              selectedFile={file2}
              uploadProgress={progress2}
              onFileSelect={(file) => {
                setFile2(file);
                simulateUpload(setProgress2);
              }}
              onRemoveFile={() => {
                setFile2(null);
                setProgress2(0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom labels and icons */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Custom Labels and Icons
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-700 mb-2">Custom button text</p>
            <ImageUpload
              buttonText="Upload Image"
              selectedFile={file3}
              onFileSelect={setFile3}
              onRemoveFile={() => setFile3(null)}
            />
          </div>

          <div>
            <p className="text-sm text-text-700 mb-2">Custom icon</p>
            <ImageUpload
              buttonText="Choose File"
              buttonIcon={<Upload className="h-4 w-4 mr-2" />}
              selectedFile={null}
              onFileSelect={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Without progress bar */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Without Progress Bar
        </h3>
        <ImageUpload
          showProgress={false}
          uploadProgress={50}
          selectedFile={
            new File(['content'], 'example.png', { type: 'image/png' })
          }
          onRemoveFile={() => {}}
        />
      </div>

      {/* Disabled state */}
      <div>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Disabled State
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-700 mb-2">Disabled without file</p>
            <ImageUpload disabled />
          </div>
          <div>
            <p className="text-sm text-text-700 mb-2">Disabled with file</p>
            <ImageUpload
              disabled
              selectedFile={
                new File(['content'], 'locked.png', { type: 'image/png' })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple example with state management
 */
export const SimpleExample: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProgress(0);

    // Simulate upload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">Simple Upload Example</h3>
      <ImageUpload
        selectedFile={file}
        uploadProgress={progress}
        onFileSelect={handleFileSelect}
        onRemoveFile={handleRemoveFile}
      />
      {file && (
        <p className="mt-4 text-sm text-text-700">
          Upload progress: {progress}%
        </p>
      )}
    </div>
  );
};

/**
 * Compact variant example
 */
export const CompactVariant: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">Compact Variant</h3>
      <ImageUpload
        variant="compact"
        selectedFile={file}
        onFileSelect={setFile}
        onRemoveFile={() => setFile(null)}
      />
    </div>
  );
};

/**
 * Custom button text and icon
 */
export const CustomButton: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">Custom Button</h3>
      <ImageUpload
        buttonText="Escolher Arquivo"
        buttonIcon={<FileImage className="h-4 w-4 mr-2" />}
        selectedFile={file}
        onFileSelect={setFile}
        onRemoveFile={() => setFile(null)}
      />
    </div>
  );
};

/**
 * With file size validation
 */
export const WithSizeValidation: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
  };

  const handleSizeError = (selectedFile: File, maxSize: number) => {
    setError(
      `File ${selectedFile.name} exceeds maximum size of ${maxSize / 1024}KB`
    );
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">With Size Validation (Max 1MB)</h3>
      <ImageUpload
        selectedFile={file}
        onFileSelect={handleFileSelect}
        onRemoveFile={() => {
          setFile(null);
          setError('');
        }}
        maxSize={1024 * 1024} // 1MB
        onSizeError={handleSizeError}
      />
      {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
    </div>
  );
};

/**
 * With file type validation
 */
export const WithTypeValidation: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
  };

  const handleTypeError = (selectedFile: File) => {
    setError(
      `File ${selectedFile.name} is not a valid image type (PNG or JPEG)`
    );
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">
        With Type Validation (PNG/JPEG only)
      </h3>
      <ImageUpload
        selectedFile={file}
        onFileSelect={handleFileSelect}
        onRemoveFile={() => {
          setFile(null);
          setError('');
        }}
        accept="image/png, image/jpeg"
        onTypeError={handleTypeError}
      />
      {error && <p className="mt-2 text-sm text-error-500">{error}</p>}
    </div>
  );
};

/**
 * Without progress bar
 */
export const WithoutProgress: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl mb-4">Without Progress Bar</h3>
      <ImageUpload
        showProgress={false}
        selectedFile={file}
        onFileSelect={setFile}
        onRemoveFile={() => setFile(null)}
      />
    </div>
  );
};

/**
 * Disabled state
 */
export const DisabledState: Story = () => (
  <div className="p-4">
    <h3 className="font-bold text-xl mb-4">Disabled State</h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-text-700 mb-2">Without file</p>
        <ImageUpload disabled />
      </div>
      <div>
        <p className="text-sm text-text-700 mb-2">With file</p>
        <ImageUpload
          disabled
          selectedFile={
            new File(['content'], 'example.png', { type: 'image/png' })
          }
        />
      </div>
    </div>
  </div>
);
