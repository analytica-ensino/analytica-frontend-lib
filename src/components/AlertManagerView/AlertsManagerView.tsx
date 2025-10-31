import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Divider from '../Divider/Divider';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../Table/Table';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import { CaretLeft, CaretRight, User } from 'phosphor-react';
import type { AlertData } from '../AlertManager/types';

// Interface para os dados de visualização do alerta
export interface AlertViewData extends Omit<AlertData, 'image'> {
  image?: string; // No view, a imagem sempre é uma URL (string)
  sentAt: string | Date; // Data de envio formatada
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
  /** URL da imagem após upload (prioritária - será exibida primeiro) */
  imageLink?: string | null;
  /** Imagem padrão a ser exibida quando não há imagem no alertData (URL string) */
  defaultImage?: string | null;
  // Controle de paginação
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export const AlertsManagerView = ({
  alertData,
  isOpen = false,
  onClose,
  imageLink,
  defaultImage,
  currentPage = 1,
  totalPages: externalTotalPages,
  onPageChange,
  itemsPerPage = 10,
}: AlertsManagerViewProps) => {
  // Calcular paginação (usar props externas se fornecidas, senão calcular)
  const totalPages =
    externalTotalPages ?? Math.ceil(alertData.recipients.length / itemsPerPage);

  // Clamp currentPage to valid range
  const effectiveCurrentPage = Math.min(totalPages, Math.max(1, currentPage));

  // Slice recipients based on effective page
  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipients = alertData.recipients.slice(startIndex, endIndex);

  const handleClose = () => {
    onClose?.();
  };

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return String(dateInput);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={alertData.title}
      size="md"
      contentClassName="p-0"
    >
      <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[700px]">
        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Preview do alerta */}
          <div className="bg-background-50 px-5 py-6 flex flex-col items-center gap-4 rounded-xl mb-4">
            {/* Prioridade: imageLink > alertData.image > defaultImage */}
            {(imageLink || alertData.image || defaultImage) && (
              <img
                src={imageLink || alertData.image || defaultImage || undefined}
                alt={alertData.title || 'Imagem do alerta'}
              />
            )}
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
                Página {effectiveCurrentPage} de {totalPages}
              </Text>
              <div className="flex gap-2">
                {onPageChange ? (
                  <>
                    <Button
                      variant="link"
                      size="extra-small"
                      onClick={() =>
                        onPageChange(Math.max(1, effectiveCurrentPage - 1))
                      }
                      disabled={effectiveCurrentPage === 1}
                      iconLeft={<CaretLeft />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="link"
                      size="extra-small"
                      onClick={() =>
                        onPageChange(
                          Math.min(totalPages, effectiveCurrentPage + 1)
                        )
                      }
                      disabled={effectiveCurrentPage === totalPages}
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
                      disabled={effectiveCurrentPage === 1}
                      iconLeft={<CaretLeft />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="link"
                      size="extra-small"
                      disabled={effectiveCurrentPage === totalPages}
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
