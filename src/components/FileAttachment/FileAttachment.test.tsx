import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileAttachment, {
  generateFileId,
  formatFileSize,
} from './FileAttachment';
import type { AttachedFile } from './FileAttachment';

describe('FileAttachment', () => {
  const createMockFile = (
    name: string,
    size: number,
    type = 'application/pdf'
  ): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const mockFiles: AttachedFile[] = [
    { file: createMockFile('documento.pdf', 1024 * 500), id: 'file-1' },
    { file: createMockFile('imagem.png', 1024 * 1024 * 2), id: 'file-2' },
  ];

  const defaultProps = {
    files: [],
    onFilesAdd: jest.fn(),
    onFileRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar o botão de anexar por padrão', () => {
      render(<FileAttachment {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /anexar/i })
      ).toBeInTheDocument();
    });

    it('deve renderizar com label customizado do botão', () => {
      render(
        <FileAttachment {...defaultProps} buttonLabel="Adicionar arquivo" />
      );

      expect(
        screen.getByRole('button', { name: /adicionar arquivo/i })
      ).toBeInTheDocument();
    });

    it('deve ocultar o botão quando hideButton é true', () => {
      render(<FileAttachment {...defaultProps} hideButton />);

      expect(
        screen.queryByRole('button', { name: /anexar/i })
      ).not.toBeInTheDocument();
    });

    it('deve ocultar o botão quando readOnly é true', () => {
      render(<FileAttachment {...defaultProps} readOnly />);

      expect(
        screen.queryByRole('button', { name: /anexar/i })
      ).not.toBeInTheDocument();
    });

    it('deve aplicar className adicional', () => {
      const { container } = render(
        <FileAttachment {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Exibição de arquivos', () => {
    it('deve exibir lista de arquivos anexados', () => {
      render(<FileAttachment {...defaultProps} files={mockFiles} />);

      expect(screen.getByText('documento.pdf')).toBeInTheDocument();
      expect(screen.getByText('imagem.png')).toBeInTheDocument();
    });

    it('deve exibir tamanho dos arquivos formatado', () => {
      render(<FileAttachment {...defaultProps} files={mockFiles} />);

      expect(screen.getByText('500.0 KB')).toBeInTheDocument();
      expect(screen.getByText('2.0 MB')).toBeInTheDocument();
    });

    it('deve exibir botão de remover para cada arquivo', () => {
      render(<FileAttachment {...defaultProps} files={mockFiles} />);

      const removeButtons = screen.getAllByRole('button', {
        name: /remover/i,
      });
      expect(removeButtons).toHaveLength(2);
    });

    it('não deve exibir botão de remover quando readOnly', () => {
      render(<FileAttachment {...defaultProps} files={mockFiles} readOnly />);

      expect(
        screen.queryByRole('button', { name: /remover/i })
      ).not.toBeInTheDocument();
    });

    it('não deve exibir lista quando não há arquivos', () => {
      render(<FileAttachment {...defaultProps} files={[]} />);

      expect(screen.queryByText('documento.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onFileRemove ao clicar no botão de remover', () => {
      const onFileRemove = jest.fn();
      render(
        <FileAttachment
          {...defaultProps}
          files={mockFiles}
          onFileRemove={onFileRemove}
        />
      );

      const removeButton = screen.getByRole('button', {
        name: /remover documento.pdf/i,
      });
      fireEvent.click(removeButton);

      expect(onFileRemove).toHaveBeenCalledWith('file-1');
    });

    it('deve chamar onFilesAdd ao selecionar arquivos', () => {
      const onFilesAdd = jest.fn();
      render(<FileAttachment {...defaultProps} onFilesAdd={onFilesAdd} />);

      const file = createMockFile('novo-arquivo.pdf', 1024);
      const input = screen.getByLabelText('Selecionar arquivos');

      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);

      expect(onFilesAdd).toHaveBeenCalledWith([file]);
    });

    it('deve abrir seletor de arquivos ao clicar no botão anexar', () => {
      render(<FileAttachment {...defaultProps} />);

      const input = screen.getByLabelText(
        'Selecionar arquivos'
      ) as HTMLInputElement;
      const clickSpy = jest.spyOn(input, 'click');

      const attachButton = screen.getByRole('button', { name: /anexar/i });
      fireEvent.click(attachButton);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('deve permitir múltiplos arquivos por padrão', () => {
      render(<FileAttachment {...defaultProps} />);

      const input = screen.getByLabelText('Selecionar arquivos');
      expect(input).toHaveAttribute('multiple');
    });

    it('deve permitir apenas um arquivo quando multiple é false', () => {
      render(<FileAttachment {...defaultProps} multiple={false} />);

      const input = screen.getByLabelText('Selecionar arquivos');
      expect(input).not.toHaveAttribute('multiple');
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar bytes corretamente', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('deve formatar kilobytes corretamente', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('deve formatar megabytes corretamente', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('deve formatar gigabytes corretamente', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB');
    });
  });

  describe('generateFileId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = generateFileId();
      const id2 = generateFileId();

      expect(id1).not.toBe(id2);
    });

    it('deve gerar IDs no formato esperado', () => {
      const id = generateFileId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('Casos de borda', () => {
    it('deve lidar com arquivo de tamanho 0', () => {
      const emptyFile: AttachedFile = {
        file: createMockFile('vazio.txt', 0),
        id: 'empty-file',
      };
      render(<FileAttachment {...defaultProps} files={[emptyFile]} />);

      expect(screen.getByText('vazio.txt')).toBeInTheDocument();
      expect(screen.getByText('0 B')).toBeInTheDocument();
    });

    it('deve lidar com nome de arquivo longo', () => {
      const longNameFile: AttachedFile = {
        file: createMockFile(
          'arquivo_com_nome_muito_longo_que_precisa_ser_truncado.pdf',
          1024
        ),
        id: 'long-name',
      };
      render(<FileAttachment {...defaultProps} files={[longNameFile]} />);

      expect(
        screen.getByText(
          'arquivo_com_nome_muito_longo_que_precisa_ser_truncado.pdf'
        )
      ).toBeInTheDocument();
    });

    it('deve resetar input após seleção de arquivo', () => {
      const onFilesAdd = jest.fn();
      render(<FileAttachment {...defaultProps} onFilesAdd={onFilesAdd} />);

      const file = createMockFile('arquivo.pdf', 1024);
      const input = screen.getByLabelText(
        'Selecionar arquivos'
      ) as HTMLInputElement;

      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(input.value).toBe('');
    });

    it('não deve chamar onFilesAdd quando nenhum arquivo é selecionado', () => {
      const onFilesAdd = jest.fn();
      render(<FileAttachment {...defaultProps} onFilesAdd={onFilesAdd} />);

      const input = screen.getByLabelText('Selecionar arquivos');

      Object.defineProperty(input, 'files', { value: [] });
      fireEvent.change(input);

      expect(onFilesAdd).not.toHaveBeenCalled();
    });
  });
});
