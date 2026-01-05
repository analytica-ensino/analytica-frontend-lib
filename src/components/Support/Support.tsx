import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyIcon,
  InfoIcon,
  BugIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import dayjs from 'dayjs';
import Text from '../Text/Text';
import SelectionButton from '../SelectionButton/SelectionButton';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Button from '../Button/Button';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import Badge from '../Badge/Badge';
import { SkeletonText, SkeletonRounded } from '../Skeleton/Skeleton';
import Toast from '../Toast/Toast';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import { supportSchema, SupportFormData } from './schema';
import { TicketModal } from './components/TicketModal';
import {
  SupportTicket,
  SupportStatus,
  SupportCategory,
  TabType,
  ProblemType,
  getStatusBadgeAction,
  getStatusText,
  getCategoryText,
  CreateSupportTicketRequest,
  CreateSupportTicketResponse,
  SupportTicketAPI,
  GetSupportTicketsResponse,
  mapApiStatusToInternal,
  mapInternalStatusToApi,
  SupportApiClient,
} from '../../types/support';
import { getCategoryIcon } from './utils/supportUtils';
import SupportImage from '../../assets/img/suporthistory.png';

// Individual ticket component to reduce nesting
const TicketCard = ({
  ticket,
  onTicketClick,
}: {
  ticket: SupportTicket;
  onTicketClick: (ticket: SupportTicket) => void;
}) => (
  <button
    key={ticket.id}
    type="button"
    className="flex items-center justify-between p-4 bg-background rounded-xl cursor-pointer w-full text-left hover:bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    onClick={() => onTicketClick(ticket)}
  >
    <div className="flex flex-col">
      <Text size="xs" weight="bold" className="text-text-900">
        {ticket.title}
      </Text>
    </div>

    <div className="flex items-center gap-3">
      <Badge
        variant="solid"
        className="flex items-center gap-1"
        action={getStatusBadgeAction(ticket.status)}
      >
        {getStatusText(ticket.status)}
      </Badge>
      <Badge variant="solid" className="flex items-center gap-1" action="muted">
        {getCategoryIcon(ticket.category, 18)}
        {getCategoryText(ticket.category)}
      </Badge>
      <CaretRightIcon size={24} className="text-text-800" />
    </div>
  </button>
);

// Ticket group component to reduce nesting
const TicketGroup = ({
  date,
  tickets,
  onTicketClick,
}: {
  date: string;
  tickets: SupportTicket[];
  onTicketClick: (ticket: SupportTicket) => void;
}) => (
  <div key={date} className="space-y-4">
    <Text size="md" weight="bold" className="text-text-900">
      {dayjs(date).format('DD MMM YYYY')}
    </Text>
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onTicketClick={onTicketClick}
        />
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ imageSrc }: { imageSrc?: string }) => (
  <div className="flex flex-row justify-center items-center mt-48">
    {imageSrc && <img src={imageSrc} alt="Imagem de suporte" />}
    <Text size="3xl" weight="semibold">
      Nenhum pedido encontrado.
    </Text>
  </div>
);

// Skeleton component for ticket loading
const TicketSkeleton = () => (
  <div className="space-y-6">
    {[0, 1].map((groupIndex) => (
      <div key={groupIndex} className="space-y-4">
        {/* Date skeleton */}
        <SkeletonText width="150px" height={20} />

        {/* Tickets skeleton */}
        <div className="space-y-3">
          {[0, 1].map((ticketIndex) => (
            <SkeletonRounded
              key={ticketIndex}
              width="100%"
              height={72}
              className="p-4"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export interface SupportProps {
  /** API client instance for making requests */
  apiClient: SupportApiClient;
  /** Current user ID */
  userId?: string;
  /** Custom empty state image source (optional, uses default if not provided) */
  emptyStateImage?: string;
  /** Title displayed in the header */
  title?: string;
  /** Callback when a ticket is successfully created */
  onTicketCreated?: () => void;
  /** Callback when a ticket is successfully closed */
  onTicketClosed?: () => void;
}

const Support = ({
  apiClient,
  userId,
  emptyStateImage,
  title = 'Suporte',
  onTicketCreated,
  onTicketClosed,
}: SupportProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('criar-pedido');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType>(null);

  // Filtros do histórico
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Estado do modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para feedback
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showCloseSuccessToast, setShowCloseSuccessToast] = useState(false);
  const [showCloseErrorToast, setShowCloseErrorToast] = useState(false);

  // Estados para histórico
  const [allTickets, setAllTickets] = useState<SupportTicketAPI[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // useEffect para buscar tickets quando mudar aba ou filtros
  useEffect(() => {
    if (activeTab === 'historico') {
      fetchTickets(statusFilter);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [activeTab, statusFilter]);

  // Reset page when category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  // Funções auxiliares

  // Converter dados da API para formato do componente
  const convertApiTicketToComponent = (
    apiTicket: SupportTicketAPI
  ): SupportTicket => {
    return {
      id: apiTicket.id,
      title: apiTicket.subject,
      status: mapApiStatusToInternal(apiTicket.status),
      createdAt: apiTicket.createdAt,
      category: apiTicket.type as SupportCategory,
      description: apiTicket.description,
    };
  };

  // Filtrar tickets por categoria e ordenar do mais novo para o mais antigo
  const filteredTickets = allTickets
    .map(convertApiTicketToComponent)
    .filter((ticket) => {
      const categoryMatch =
        categoryFilter === 'todos' || ticket.category === categoryFilter;
      return categoryMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Calcular paginação no frontend
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  const groupedTickets = paginatedTickets.reduce(
    (groups, ticket) => {
      const date = dayjs(ticket.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(ticket);
      return groups;
    },
    {} as Record<string, SupportTicket[]>
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      problemType: undefined,
      title: '',
      description: '',
    },
  });

  // Fetch tickets from API - buscar todos de uma vez com limit=100
  const fetchTickets = async (status?: string) => {
    setLoadingTickets(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100', // Buscar o máximo permitido pela API
      });

      if (status && status !== 'todos') {
        // Convert internal status to API status
        const apiStatus = mapInternalStatusToApi(status as SupportStatus);
        params.append('status', apiStatus);
      }

      const response = await apiClient.get<GetSupportTicketsResponse>(
        `/support?${params.toString()}`
      );

      setAllTickets(response.data.data.support);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setAllTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Handle problem type selection
  const handleProblemSelection = (type: ProblemType) => {
    setSelectedProblem(type);
    if (type) {
      setValue('problemType', type, { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmit = async (data: SupportFormData) => {
    setSubmitError(null);

    try {
      const requestData: CreateSupportTicketRequest = {
        subject: data.title,
        description: data.description,
        type: data.problemType,
      };

      await apiClient.post<CreateSupportTicketResponse>(
        '/support',
        requestData
      );

      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

      // Reset form after successful submission
      setSelectedProblem(null);
      reset();

      // Switch to history tab and refresh tickets list
      setActiveTab('historico');
      fetchTickets(statusFilter);

      // Call callback if provided
      onTicketCreated?.();
    } catch (error) {
      console.error('Erro ao criar ticket de suporte:', error);
      setSubmitError('Erro ao criar ticket. Tente novamente.');
    }
  };

  // Handle ticket click
  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Handle ticket close
  const handleTicketClose = async (ticketId: string) => {
    try {
      await apiClient.patch(`/support/${ticketId}`, {
        status: mapInternalStatusToApi(SupportStatus.ENCERRADO),
      });

      // Show success toast
      setShowCloseSuccessToast(true);
      setTimeout(() => setShowCloseSuccessToast(false), 4000);

      // Refresh tickets list
      if (activeTab === 'historico') {
        fetchTickets(statusFilter);
      }

      // Call callback if provided
      onTicketClosed?.();
    } catch (error) {
      console.error('Erro ao encerrar ticket:', error);
      // Show error toast
      setShowCloseErrorToast(true);
      setTimeout(() => setShowCloseErrorToast(false), 4000);
    }
  };

  const problemTypes = [
    {
      id: SupportCategory.TECNICO,
      title: 'Técnico',
      icon: <BugIcon size={24} />,
    },
    {
      id: SupportCategory.ACESSO,
      title: 'Acesso',
      icon: <KeyIcon size={24} />,
    },
    {
      id: SupportCategory.OUTROS,
      title: 'Outros',
      icon: <InfoIcon size={24} />,
    },
  ];

  // Determine which image to use for empty state
  const emptyImage = emptyStateImage || SupportImage;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex w-full mb-4 flex-row items-center justify-between not-lg:gap-4 lg:gap-6">
            <h1 className="font-bold leading-[28px] tracking-[0.2px] text-text-950 text-xl mt-4 sm:text-2xl sm:flex-1 sm:self-end sm:mt-0">
              {title}
            </h1>
            <div className="sm:flex-shrink-0 sm:self-end">
              <Menu
                value={activeTab}
                defaultValue="criar-pedido"
                variant="menu2"
                onValueChange={(value) => setActiveTab(value as TabType)}
                className="bg-transparent shadow-none px-0"
              >
                <MenuContent variant="menu2">
                  <MenuItem
                    variant="menu2"
                    value="criar-pedido"
                    className="whitespace-nowrap px-17 not-sm:px-5"
                  >
                    Criar Pedido
                  </MenuItem>
                  <MenuItem
                    variant="menu2"
                    value="historico"
                    className="whitespace-nowrap px-17 not-sm:px-5"
                  >
                    Histórico
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>

          {/* Content for Criar Pedido tab */}
          {activeTab === 'criar-pedido' && (
            <div className="space-y-2">
              <Text as="h2" size="md" weight="bold" className="text-text-900">
                Selecione o tipo de problema
              </Text>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {problemTypes.map((type) => (
                  <SelectionButton
                    key={type.id}
                    icon={type.icon}
                    label={type.title}
                    selected={selectedProblem === type.id}
                    onClick={() => handleProblemSelection(type.id)}
                    className="w-full p-4"
                  />
                ))}
              </div>
              {errors.problemType && (
                <Text size="sm" className="text-red-500 mt-1">
                  {errors.problemType.message}
                </Text>
              )}
            </div>
          )}

          {selectedProblem && activeTab === 'criar-pedido' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Input
                  size="large"
                  variant="rounded"
                  label="Título"
                  placeholder="Digite o título"
                  {...register('title')}
                  errorMessage={errors.title?.message}
                />
              </div>
              <div className="space-y-1">
                <TextArea
                  size="large"
                  label="Descrição"
                  placeholder="Descreva o problema aqui"
                  {...register('description')}
                  errorMessage={errors.description?.message}
                />
              </div>
              <Button
                size="large"
                className="float-end mt-10"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
              </Button>

              {/* Error message */}
              {submitError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <Text size="sm" className="text-red-700">
                    {submitError}
                  </Text>
                </div>
              )}
            </form>
          )}

          {/* Content for Historico tab */}
          {activeTab === 'historico' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex gap-4">
                <div className="flex flex-col flex-1/2 space-y-1">
                  <Select
                    label="Status"
                    size="large"
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger variant="rounded" className="">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value={SupportStatus.ABERTO}>
                        Aberto
                      </SelectItem>
                      <SelectItem value={SupportStatus.RESPONDIDO}>
                        Respondido
                      </SelectItem>
                      <SelectItem value={SupportStatus.ENCERRADO}>
                        Encerrado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col flex-1/2 space-y-1">
                  <Select
                    label="Tipo"
                    size="large"
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger variant="rounded" className="">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value={SupportCategory.TECNICO}>
                        <BugIcon size={16} /> Técnico
                      </SelectItem>
                      <SelectItem value={SupportCategory.ACESSO}>
                        <KeyIcon size={16} /> Acesso
                      </SelectItem>
                      <SelectItem value={SupportCategory.OUTROS}>
                        <InfoIcon size={16} /> Outros
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de tickets */}
              {(() => {
                if (loadingTickets) {
                  return <TicketSkeleton />;
                }

                if (Object.keys(groupedTickets).length === 0) {
                  return <EmptyState imageSrc={emptyImage} />;
                }

                return (
                  <div className="space-y-6">
                    {Object.entries(groupedTickets)
                      .sort(
                        ([a], [b]) =>
                          new Date(b).getTime() - new Date(a).getTime()
                      )
                      .map(([date, tickets]) => (
                        <TicketGroup
                          key={date}
                          date={date}
                          tickets={tickets}
                          onTicketClick={handleTicketClick}
                        />
                      ))}
                  </div>
                );
              })()}

              {/* Paginação */}
              {!loadingTickets && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Text size="sm" className="text-text-600">
                    Página {currentPage} de {totalPages}
                  </Text>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal do ticket */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onTicketClose={handleTicketClose}
          apiClient={apiClient}
          userId={userId}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast
            title="Pedido enviado!"
            description="Agora você pode acompanhar o andamento do seu pedido."
            variant="solid"
            onClose={() => setShowSuccessToast(false)}
          />
        </div>
      )}

      {/* Close Success Toast */}
      {showCloseSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast
            title="Pedido encerrado!"
            description=""
            variant="solid"
            onClose={() => setShowCloseSuccessToast(false)}
          />
        </div>
      )}

      {/* Close Error Toast */}
      {showCloseErrorToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast
            title="Erro ao encerrar pedido"
            description="Não foi possível encerrar o pedido. Tente novamente."
            variant="solid"
            action="warning"
            onClose={() => setShowCloseErrorToast(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Support;
