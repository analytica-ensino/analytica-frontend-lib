import { useState } from 'react';
import type { Story } from '@ladle/react';
import FileAttachment, {
  generateFileId,
  type AttachedFile,
} from './FileAttachment';

/**
 * Helper to create mock files for stories
 * @param name - File name
 * @param size - File size in bytes
 * @param type - MIME type
 * @returns Mock File object
 */
const createMockFile = (
  name: string,
  size: number,
  type: string = 'application/pdf'
): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

/**
 * Interactive FileAttachment with state management
 */
const InteractiveFileAttachment = ({
  initialFiles = [],
  ...props
}: {
  initialFiles?: AttachedFile[];
  readOnly?: boolean;
  buttonLabel?: string;
  multiple?: boolean;
  hideButton?: boolean;
}) => {
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles);

  const handleFilesAdd = (newFiles: File[]) => {
    const attachedFiles = newFiles.map((file) => ({
      file,
      id: generateFileId(),
    }));
    setFiles((prev) => [...prev, ...attachedFiles]);
  };

  const handleFileRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FileAttachment
      files={files}
      onFilesAdd={handleFilesAdd}
      onFileRemove={handleFileRemove}
      {...props}
    />
  );
};

/**
 * Showcase principal: todas as variações do FileAttachment
 */
export const AllVariations: Story = () => (
  <div className="flex flex-col gap-8 p-4">
    <h2 className="font-bold text-3xl text-text-900">FileAttachment</h2>
    <p className="text-text-700">
      Componente reutilizável para anexar arquivos.
    </p>

    {/* Estado vazio */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Estado Vazio</h3>
      <p className="text-sm text-text-500">
        Sem arquivos anexados, exibe apenas o botão.
      </p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment />
      </div>
    </div>

    {/* Com arquivos */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Com Arquivos Anexados</h3>
      <p className="text-sm text-text-500">
        Exibe lista de arquivos com nome, tamanho e botão para remover.
      </p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment
          initialFiles={[
            { file: createMockFile('documento.pdf', 1024 * 500), id: '1' },
            { file: createMockFile('planilha.xlsx', 1024 * 1024 * 2), id: '2' },
            { file: createMockFile('imagem.png', 1024 * 800), id: '3' },
          ]}
        />
      </div>
    </div>

    {/* Modo somente leitura */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Modo Somente Leitura</h3>
      <p className="text-sm text-text-500">Arquivos não podem ser removidos.</p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment
          initialFiles={[
            { file: createMockFile('relatorio.pdf', 1024 * 1024), id: '1' },
            { file: createMockFile('dados.csv', 1024 * 256), id: '2' },
          ]}
          readOnly
        />
      </div>
    </div>

    {/* Botão oculto */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Botão Oculto</h3>
      <p className="text-sm text-text-500">
        Útil para exibir arquivos sem permitir adicionar mais.
      </p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment
          initialFiles={[
            {
              file: createMockFile('arquivo-final.pdf', 1024 * 1024 * 5),
              id: '1',
            },
          ]}
          hideButton
        />
      </div>
    </div>

    {/* Label customizado */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Label Customizado</h3>
      <p className="text-sm text-text-500">Botão com texto personalizado.</p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment buttonLabel="Adicionar arquivo" />
      </div>
    </div>

    {/* Arquivo único */}
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">Arquivo Único</h3>
      <p className="text-sm text-text-500">
        Permite selecionar apenas um arquivo por vez.
      </p>
      <div className="border border-border-100 rounded-lg p-4 max-w-md">
        <InteractiveFileAttachment multiple={false} />
      </div>
    </div>
  </div>
);

/**
 * Estado vazio - apenas botão de anexar
 */
export const Empty: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment />
  </div>
);

/**
 * Com arquivos anexados
 */
export const WithFiles: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      initialFiles={[
        { file: createMockFile('documento.pdf', 1024 * 500), id: '1' },
        { file: createMockFile('planilha.xlsx', 1024 * 1024 * 2), id: '2' },
      ]}
    />
  </div>
);

/**
 * Modo somente leitura
 */
export const ReadOnly: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      initialFiles={[
        { file: createMockFile('relatorio.pdf', 1024 * 1024), id: '1' },
        { file: createMockFile('dados.csv', 1024 * 256), id: '2' },
      ]}
      readOnly
    />
  </div>
);

/**
 * Sem botão de anexar
 */
export const HiddenButton: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      initialFiles={[
        { file: createMockFile('arquivo.pdf', 1024 * 1024 * 3), id: '1' },
      ]}
      hideButton
    />
  </div>
);

/**
 * Com label customizado
 */
export const CustomLabel: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment buttonLabel="Adicionar documento" />
  </div>
);

/**
 * Arquivo único (sem múltipla seleção)
 */
export const SingleFile: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      multiple={false}
      buttonLabel="Selecionar arquivo"
    />
  </div>
);

/**
 * Muitos arquivos
 */
export const ManyFiles: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      initialFiles={[
        { file: createMockFile('documento1.pdf', 1024 * 100), id: '1' },
        { file: createMockFile('documento2.pdf', 1024 * 200), id: '2' },
        { file: createMockFile('imagem.jpg', 1024 * 1024), id: '3' },
        { file: createMockFile('video.mp4', 1024 * 1024 * 50), id: '4' },
        { file: createMockFile('planilha.xlsx', 1024 * 500), id: '5' },
        {
          file: createMockFile('apresentacao.pptx', 1024 * 1024 * 10),
          id: '6',
        },
      ]}
    />
  </div>
);

/**
 * Diferentes tamanhos de arquivo
 */
export const FileSizes: Story = () => (
  <div className="p-4 max-w-md">
    <InteractiveFileAttachment
      initialFiles={[
        { file: createMockFile('pequeno.txt', 500), id: '1' },
        { file: createMockFile('medio.pdf', 1024 * 500), id: '2' },
        { file: createMockFile('grande.zip', 1024 * 1024 * 25), id: '3' },
        {
          file: createMockFile('muito-grande.iso', 1024 * 1024 * 1024),
          id: '4',
        },
      ]}
      readOnly
    />
  </div>
);
