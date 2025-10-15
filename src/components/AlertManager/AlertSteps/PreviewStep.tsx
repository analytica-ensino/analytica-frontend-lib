import { Text, Divider, Badge } from '../../..';
import { useAlertFormStore, RecipientCategory } from '../useAlertForm';
import { LabelsConfig } from '../types';

interface PreviewStepProps {
  labels?: LabelsConfig;
}

export const PreviewStep = ({ labels }: PreviewStepProps) => {
  const title = useAlertFormStore((state) => state.title);
  const message = useAlertFormStore((state) => state.message);
  const image = useAlertFormStore((state) => state.image);
  const date = useAlertFormStore((state) => state.date);
  const time = useAlertFormStore((state) => state.time);
  const recipientCategories = useAlertFormStore(
    (state) => state.recipientCategories
  );

  const formatDate = (date: string, time: string) => {
    if (!date) return labels?.dateNotDefined || 'Não definida';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    return time ? `${formattedDate} às ${time}` : formattedDate;
  };

  // Renderiza os destinatários de forma dinâmica
  const renderRecipientCategory = (category: RecipientCategory) => {
    if (category.selectedIds.length === 0) return null;

    const selectedNames = category.selectedIds.map((id) => {
      const item = category.availableItems.find((item) => item.id === id);
      return item?.name || id;
    });

    const displayLimit = category.key === 'alunos' ? 10 : selectedNames.length;
    const hasMore = selectedNames.length > displayLimit;

    return (
      <div key={category.key}>
        <Text size="xs" className="text-text-600 mb-1">
          {category.label}: {category.allSelected ? 'Todos' : ''}
        </Text>
        {!category.allSelected && (
          <div className="flex flex-wrap gap-2">
            {selectedNames.slice(0, displayLimit).map((name, idx) => (
              <Badge key={idx} variant="solid" action="info">
                {name}
              </Badge>
            ))}
            {hasMore && (
              <Badge variant="solid" action="info">
                +{selectedNames.length - displayLimit} {category.key}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasRecipients = Object.values(recipientCategories).some(
    (cat) => cat.selectedIds.length > 0
  );

  return (
    <section className="flex flex-col gap-4">
      <Text size="sm" weight="medium">
        {labels?.previewTitle || 'Prévia do Aviso'}
      </Text>

      <div className="bg-background-50 rounded-lg p-4 border border-border-200">
        <div className="flex flex-col gap-3">
          <div>
            <Text size="xs" weight="medium" className="text-text-600 mb-1">
              {labels?.titleLabel || 'Título'}
            </Text>
            <Text size="sm" weight="semibold" className="text-text-950">
              {title || `[${labels?.titleNotDefined || 'Título não definido'}]`}
            </Text>
          </div>

          <Divider />

          <div>
            <Text size="xs" weight="medium" className="text-text-600 mb-1">
              {labels?.messageLabel || 'Mensagem'}
            </Text>
            <Text size="sm" className="text-text-800">
              {message ||
                `[${labels?.messageNotDefined || 'Mensagem não definida'}]`}
            </Text>
          </div>

          {image && (
            <>
              <Divider />
              <div>
                <Text size="xs" weight="medium" className="text-text-600 mb-1">
                  {labels?.imageLabel || 'Imagem Anexada'}
                </Text>
                <Text size="sm" className="text-text-800">
                  {image.name}
                </Text>
              </div>
            </>
          )}

          <Divider />

          <div>
            <Text size="xs" weight="medium" className="text-text-600 mb-1">
              {labels?.recipientsTitle || 'Destinatários'}
            </Text>
            {hasRecipients ? (
              <div className="flex flex-col gap-3 mt-2">
                {Object.values(recipientCategories).map((category) =>
                  renderRecipientCategory(category)
                )}
              </div>
            ) : (
              <Text size="sm" className="text-text-600 mt-2">
                {labels?.noRecipientsSelected ||
                  'Nenhum destinatário selecionado'}
              </Text>
            )}
          </div>

          <Divider />

          <div>
            <Text size="xs" weight="medium" className="text-text-600 mb-1">
              {labels?.dateLabel || 'Data de Envio'}
            </Text>
            <Text size="sm" className="text-text-800">
              {formatDate(date, time)}
            </Text>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <Text size="xs" className="text-orange-800">
          {labels?.previewWarning ||
            '⚠️ Revise todas as informações antes de enviar. O aviso será enviado imediatamente após a confirmação.'}
        </Text>
      </div>
    </section>
  );
};
