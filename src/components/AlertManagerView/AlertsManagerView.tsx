import { useMemo, useEffect } from 'react';
import {
  Modal,
  Text,
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from '../..';
import { CaretLeft, CaretRight, User } from 'phosphor-react';
import type { AlertData } from '../AlertManager/types';
import notification from '../../assets/img/notification.png';

// Interface para os dados de visualização do alerta
export interface AlertViewData extends AlertData {
  sentAt: string; // Data de envio formatada
  recipients: RecipientStatus[];
}

// Interface para o status de cada destinatário
export interface RecipientStatus {
  id: string;
  name: string;
  status: 'viewed' | 'pending';
}

interface AlertsManagerViewProps {
  alertData: AlertViewData;
  isOpen?: boolean;
  onClose?: () => void;
  // Controle de paginação
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const AlertsManagerView = ({
  alertData,
  isOpen = false,
  onClose,
  currentPage = 1,
  totalPages: externalTotalPages,
  onPageChange,
}: AlertsManagerViewProps) => {
  // Criar URL blob para a imagem
  const imageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (alertData.image instanceof File) {
      return window.URL.createObjectURL(alertData.image);
    }

    return undefined;
  }, [alertData.image]);

  // Limpar URL blob quando componente desmontar ou imagem mudar
  useEffect(() => {
    return () => {
      if (imageUrl && typeof window !== 'undefined') {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Calcular paginação (usar props externas se fornecidas, senão calcular)
  const totalPages =
    externalTotalPages ?? Math.ceil(alertData.recipients.length / 10);
  const paginatedRecipients = alertData.recipients;

  const handleClose = () => {
    onClose?.();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={alertData.title}
      size="md"
      contentClassName="p-0"
    >
      <div
        className="flex flex-col h-[calc(100vh-8rem)] max-h-[700px]"
        data-theme="enem-parana-light"
      >
        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Preview do alerta */}
          <div className="bg-background-50 px-5 py-6 flex flex-col items-center gap-4 rounded-xl mb-4">
            <img src={imageUrl || notification} alt="Preview" className="" />
            <div className="flex flex-col items-center text-center gap-3">
              <Text size="lg" weight="semibold">
                {alertData.title || 'Sem Título'}
              </Text>
              <Text size="sm" weight="normal" className="text-text-500">
                {alertData.message || 'Sem mensagem'}
              </Text>
            </div>
          </div>

          {/* Divider */}
          <Divider className="my-4" />

          {/* Data de envio */}
          <div className="flex justify-between items-center mb-4 px-2">
            <Text size="sm" weight="bold" className="text-text-700">
              Enviado em
            </Text>
            <Text size="sm" weight="medium" className="text-text-900">
              {formatDate(alertData.sentAt)}
            </Text>
          </div>

          <Divider className="my-4" />

          {/* Tabela de destinatários */}
          <div className="mb-4">
            <Table variant="borderless" className="table-fixed">
              <TableHeader>
                <TableRow variant="borderless">
                  <TableHead className="py-2 px-3.5 text-start">
                    Destinatário
                  </TableHead>
                  <TableHead className="py-2 px-3.5 w-[120px] text-start">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody variant="borderless">
                {paginatedRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="py-2 px-3.5 flex flex-row gap-2 text-start truncate">
                      <div className="rounded-full size-6 bg-primary-100 flex items-center justify-center">
                        <User className="text-primary-950" size={18} />
                      </div>
                      {recipient.name}
                    </TableCell>
                    <TableCell className="py-2 px-3.5 text-center">
                      <div className="flex justify-center items-center gap-1">
                        {recipient.status === 'viewed' ? (
                          <Badge variant="solid" action="success">
                            Visualizado
                          </Badge>
                        ) : (
                          <Badge variant="solid" action="error">
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 bg-background-50 border border-border-200 py-3.5 px-2 rounded-b-2xl">
              <Text size="sm" className="text-text-600">
                Página {currentPage} de {totalPages}
              </Text>
              <div className="flex gap-2">
                {onPageChange ? (
                  <>
                    <Button
                      variant="link"
                      size="extra-small"
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      iconLeft={<CaretLeft />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="link"
                      size="extra-small"
                      onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      iconRight={<CaretRight />}
                    >
                      Próximo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="link"
                      size="extra-small"
                      disabled={currentPage === 1}
                      iconLeft={<CaretLeft />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="link"
                      size="extra-small"
                      disabled={currentPage === totalPages}
                      iconRight={<CaretRight />}
                    >
                      Próximo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
