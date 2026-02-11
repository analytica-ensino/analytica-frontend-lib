import type { Story } from '@ladle/react';
import { useState } from 'react';
import ImageDropzone from './ImageDropzone';

/**
 * Showcase principal: todas as variações do ImageDropzone
 */
export const AllImageDropzones: Story = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [, setFile2] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-8 max-w-md p-4">
      <h2 className="font-bold text-3xl text-text-900">ImageDropzone</h2>
      <p className="text-text-700">
        Componente para upload de imagens com área de drag-and-drop e preview.
      </p>

      {/* Estado padrão */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Estado Padrão</h3>
        <ImageDropzone
          label="Capa"
          selectedFile={file1}
          onFileSelect={setFile1}
          helperText="Formatos aceitos: JPG, PNG, GIF"
        />
      </div>

      {/* Com imagem existente */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">
          Com Imagem Existente
        </h3>
        <ImageDropzone
          label="Capa"
          imageUrl="https://picsum.photos/400/200"
          onFileSelect={setFile2}
        />
      </div>

      {/* Com erro */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Com Erro</h3>
        <ImageDropzone label="Capa" errorMessage="Imagem obrigatória" />
      </div>

      {/* Desabilitado */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Desabilitado</h3>
        <ImageDropzone
          label="Capa"
          helperText="Este campo está desabilitado"
          disabled
        />
      </div>

      {/* Obrigatório */}
      <div>
        <h3 className="font-bold text-xl text-text-900 mb-4">Obrigatório</h3>
        <ImageDropzone
          label="Capa"
          helperText="Este campo é obrigatório"
          required
        />
      </div>
    </div>
  );
};

export const Default: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-md p-4">
      <ImageDropzone
        label="Capa"
        selectedFile={file}
        onFileSelect={setFile}
        helperText="Formatos aceitos: JPG, PNG, GIF"
      />
    </div>
  );
};

export const WithExistingImage: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-md p-4">
      <ImageDropzone
        label="Capa"
        imageUrl={file ? undefined : 'https://picsum.photos/400/200'}
        selectedFile={file}
        onFileSelect={setFile}
        changeText="Clique para alterar a imagem"
      />
    </div>
  );
};

export const WithError: Story = () => (
  <div className="max-w-md p-4">
    <ImageDropzone label="Capa" errorMessage="Imagem obrigatória" />
  </div>
);

export const Disabled: Story = () => (
  <div className="max-w-md p-4">
    <ImageDropzone
      label="Capa"
      helperText="Este campo está desabilitado"
      disabled
    />
  </div>
);

export const Required: Story = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-md p-4">
      <ImageDropzone
        label="Capa"
        selectedFile={file}
        onFileSelect={setFile}
        helperText="Este campo é obrigatório"
        required
      />
    </div>
  );
};

export const WithFileSizeValidation: Story = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSizeError = (f: File, maxSize: number) => {
    setError(
      `O arquivo ${f.name} excede o tamanho máximo de ${maxSize / 1024}KB`
    );
  };

  return (
    <div className="max-w-md p-4">
      <ImageDropzone
        label="Capa"
        selectedFile={file}
        onFileSelect={(f) => {
          setError(null);
          setFile(f);
        }}
        maxSize={100 * 1024} // 100KB
        onSizeError={handleSizeError}
        errorMessage={error || undefined}
        helperText="Tamanho máximo: 100KB"
      />
    </div>
  );
};
