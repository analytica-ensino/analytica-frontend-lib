import { Text } from '../../..';
import { useAlertFormStore } from '../useAlertForm';
import notification from '../../../assets/img/notification.png';
export const PreviewStep = () => {
  const title = useAlertFormStore((state) => state.title);
  const message = useAlertFormStore((state) => state.message);
  const image = useAlertFormStore((state) => state.image);

  // Se 'image' for um File ou Blob, gerar URL blob; se for string (URL), usa direto
  let imageUrl: string | undefined = undefined;
  if (image instanceof Blob) {
    imageUrl = URL.createObjectURL(image);
  } else if (typeof image === 'string') {
    imageUrl = image;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="bg-background-50 px-5 py-6 flex flex-col items-center gap-4 rounded-xl">
        <img src={imageUrl || notification} alt="Preview" className="" />
        <div className="flex flex-col items-center text-center gap-3">
          <Text size="lg" weight="semibold">
            {title || 'Nenhum Titulo de Alerta'}
          </Text>
          <Text size="sm" weight="normal" className="text-text-500">
            {message ||
              'Aqui aparecerá a mensagem do alerta definido pelo usuário'}
          </Text>
        </div>
      </div>
    </section>
  );
};
