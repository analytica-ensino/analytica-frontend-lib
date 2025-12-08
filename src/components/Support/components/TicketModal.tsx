import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import Badge from '../../Badge/Badge';
import Button from '../../Button/Button';
import Divider from '../../Divider/Divider';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import TextArea from '../../TextArea/TextArea';
import { SkeletonText } from '../../Skeleton/Skeleton';
import {
  SupportTicket,
  SupportStatus,
  SupportAnswerAPI,
  GetSupportAnswersResponse,
  SubmitSupportAnswerRequest,
  SubmitSupportAnswerResponse,
  getStatusBadgeAction,
  getStatusText,
  getCategoryText,
  SupportApiClient,
} from '../../../types/support';
import { getCategoryIcon } from '../utils/supportUtils';

dayjs.locale('pt-br');

// Skeleton component for answer loading
const AnswerSkeleton = () => (
  <div className="bg-background p-4 space-y-6 rounded-xl">
    {/* Date skeleton */}
    <div className="flex items-center space-x-6">
      <SkeletonText width="80px" height={16} />
      <SkeletonText width="200px" height={16} />
    </div>

    <Divider />

    {/* Answer content skeleton */}
    <div className="flex items-start space-x-6">
      <SkeletonText width="80px" height={16} />
      <div className="flex-1 space-y-2">
        <SkeletonText width="100%" height={16} />
        <SkeletonText width="80%" height={16} />
        <SkeletonText width="60%" height={16} />
      </div>
    </div>
  </div>
);

export interface TicketModalProps {
  ticket: SupportTicket;
  isOpen: boolean;
  onClose: () => void;
  onTicketClose?: (ticketId: string) => void;
  /** API client instance for making requests */
  apiClient: SupportApiClient;
  /** Current user ID */
  userId?: string;
}

export const TicketModal = ({
  ticket,
  isOpen,
  onClose,
  onTicketClose,
  apiClient,
  userId,
}: TicketModalProps) => {
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [answers, setAnswers] = useState<SupportAnswerAPI[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  const handleCloseTicket = () => {
    onTicketClose?.(ticket.id);
    setShowCloseConfirmation(false);
    onClose();
  };

  // Fetch support answers
  const fetchAnswers = useCallback(async () => {
    if (!ticket.id || ticket.status !== SupportStatus.RESPONDIDO) return;

    setIsLoadingAnswers(true);
    try {
      const response = await apiClient.get<GetSupportAnswersResponse>(
        `/support/answer/${ticket.id}`
      );
      setAnswers(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      setAnswers([]);
    } finally {
      setIsLoadingAnswers(false);
    }
  }, [ticket.id, ticket.status, apiClient]);

  // Submit user answer
  const handleSubmitAnswer = async () => {
    if (!responseText.trim() || !userId || !ticket.id) {
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const requestData: SubmitSupportAnswerRequest = {
        userId: userId,
        supportId: ticket.id,
        answer: responseText.trim(),
      };

      await apiClient.post<SubmitSupportAnswerResponse>(
        '/support/answer',
        requestData
      );

      // Clear response text
      setResponseText('');

      // Refresh answers list
      await fetchAnswers();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const canCloseTicket = ticket.status !== SupportStatus.ENCERRADO;

  // Limpar o texto e carregar respostas quando o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setResponseText('');
      (async () => {
        await fetchAnswers();
      })().catch((error) => {
        console.error('Erro ao carregar respostas:', error);
      });
    } else {
      setAnswers([]);
    }
  }, [isOpen, fetchAnswers]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Pedido: ${ticket.title}`}
        size="lg"
        hideCloseButton={false}
        closeOnEscape={true}
        data-testid="ticket-modal"
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Header com botão Encerrar Pedido */}
          <div className="flex justify-between items-center mb-3">
            <Text size="md" weight="bold" className="text-text-950">
              Detalhes
            </Text>
            {canCloseTicket && (
              <Button
                variant="outline"
                size="small"
                action="negative"
                onClick={() => setShowCloseConfirmation(true)}
              >
                Encerrar Pedido
              </Button>
            )}
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="bg-background p-4 space-y-6 rounded-xl">
              {/* ID */}
              <div className="flex items-center space-x-6">
                <Text
                  size="md"
                  weight="semibold"
                  className="text-text-700 w-20"
                >
                  ID
                </Text>
                <Text size="md" weight="normal" className="text-text-600">
                  {ticket.id}
                </Text>
              </div>

              {/* Aberto em */}
              <div className="flex items-center space-x-6">
                <Text
                  size="md"
                  weight="semibold"
                  className="text-text-700 w-20"
                >
                  Aberto em
                </Text>
                <Text size="md" weight="normal" className="text-text-600">
                  {dayjs(ticket.createdAt).format('DD MMMM YYYY, [às] HH[h]')}
                </Text>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-6">
                <Text
                  size="md"
                  weight="semibold"
                  className="text-text-700 w-20"
                >
                  Status
                </Text>
                <Badge
                  variant="solid"
                  size="small"
                  action={getStatusBadgeAction(ticket.status)}
                  className="w-fit"
                >
                  {getStatusText(ticket.status)}
                </Badge>
              </div>

              {/* Tipo */}
              <div className="flex items-center space-x-6">
                <Text
                  size="md"
                  weight="semibold"
                  className="text-text-700 w-20"
                >
                  Tipo
                </Text>
                <Badge
                  variant="solid"
                  size="small"
                  action="muted"
                  className="w-fit"
                >
                  {getCategoryIcon(ticket.category)}
                  {getCategoryText(ticket.category)}
                </Badge>
              </div>

              <Divider />

              {/* Descrição */}
              <div className="flex items-start space-x-6">
                <Text
                  size="md"
                  weight="semibold"
                  className="text-text-700 w-20"
                >
                  Descrição
                </Text>
                {ticket.description && (
                  <Text size="md" weight="normal" className="text-text-600">
                    {ticket.description}
                  </Text>
                )}
              </div>
            </div>

            {/* Seção de resposta (quando há respostas do suporte ou carregando) */}
            {ticket.status === SupportStatus.RESPONDIDO && isLoadingAnswers && (
              <>
                <Text size="md" weight="bold" className="text-text-950 my-6">
                  Resposta de Suporte Técnico
                </Text>
                <AnswerSkeleton />
              </>
            )}

            {/* Seção de resposta (quando há respostas do suporte) */}
            {!isLoadingAnswers &&
              answers.some((answer) => answer.userId !== userId) && (
                <>
                  <Text size="md" weight="bold" className="text-text-950 my-6">
                    Resposta de Suporte Técnico
                  </Text>

                  {answers
                    .filter((answer) => answer.userId !== userId)
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 1)
                    .map((answer) => (
                      <div
                        key={answer.id}
                        className="bg-background p-4 space-y-6 rounded-xl"
                      >
                        {/* Recebido em */}
                        <div className="flex items-center space-x-6">
                          <Text
                            size="md"
                            weight="semibold"
                            className="text-text-700 w-20"
                          >
                            Recebido
                          </Text>
                          <Text
                            size="md"
                            weight="normal"
                            className="text-text-600"
                          >
                            {dayjs(answer.createdAt).format(
                              'DD MMMM YYYY, [às] HH[h]'
                            )}
                          </Text>
                        </div>

                        <Divider />

                        {/* Resposta */}
                        <div className="flex items-start space-x-6">
                          <Text
                            size="md"
                            weight="semibold"
                            className="text-text-700 w-20"
                          >
                            Resposta
                          </Text>
                          <Text
                            size="md"
                            weight="normal"
                            className="text-text-600"
                          >
                            {answer.answer}
                          </Text>
                        </div>
                      </div>
                    ))}
                </>
              )}

            {/* Seção de resposta do usuário */}
            {!isLoadingAnswers &&
              answers.some((answer) => answer.userId === userId) && (
                <>
                  <Text size="md" weight="bold" className="text-text-950 my-6">
                    Resposta enviada
                  </Text>

                  {answers
                    .filter((answer) => answer.userId === userId)
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 1)
                    .map((answer) => (
                      <div
                        key={answer.id}
                        className="bg-background p-4 space-y-6 rounded-xl"
                      >
                        {/* Enviada em */}
                        <div className="flex items-center space-x-6">
                          <Text
                            size="md"
                            weight="semibold"
                            className="text-text-700 w-20"
                          >
                            Enviada
                          </Text>
                          <Text
                            size="md"
                            weight="normal"
                            className="text-text-600"
                          >
                            {dayjs(answer.createdAt).format(
                              'DD MMMM YYYY, [às] HH[h]'
                            )}
                          </Text>
                        </div>

                        <Divider />

                        {/* Resposta */}
                        <div className="flex items-start space-x-6">
                          <Text
                            size="md"
                            weight="semibold"
                            className="text-text-700 w-20"
                          >
                            Resposta
                          </Text>
                          <Text
                            size="md"
                            weight="normal"
                            className="text-text-600"
                          >
                            {answer.answer}
                          </Text>
                        </div>
                      </div>
                    ))}
                </>
              )}

            {/* Seção Responder */}
            {!isLoadingAnswers &&
              answers.some((answer) => answer.userId !== userId) && (
                <>
                  <Text size="lg" weight="bold" className="text-text-950 my-6">
                    Responder
                  </Text>

                  <div className="space-y-4">
                    <TextArea
                      placeholder="Detalhe o problema aqui."
                      rows={4}
                      className="w-full"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />

                    {responseText.trim().length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          variant="solid"
                          size="medium"
                          onClick={handleSubmitAnswer}
                          disabled={isSubmittingAnswer}
                        >
                          {isSubmittingAnswer ? 'Enviando...' : 'Enviar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de encerramento */}
      <Modal
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        title="Encerrar pedido?"
        size="md"
        hideCloseButton={false}
        closeOnEscape={true}
        data-testid="close-ticket-modal"
      >
        <div className="space-y-6">
          <Text size="sm" weight="normal" className="text-text-700">
            Ao encerrar este pedido, ele será fechado e não poderá mais ser
            atualizado.
          </Text>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="medium"
              onClick={() => setShowCloseConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              size="medium"
              action="negative"
              onClick={handleCloseTicket}
            >
              Encerrar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
