import { useMemo, useEffect } from 'react';
import { Text } from '../../..';
import { useAlertFormStore } from '../useAlertForm';

interface PreviewStepProps {
  /** URL da imagem após upload (prioritária - será exibida primeiro) */
  imageLink?: string | null;
  /** Imagem padrão a ser exibida quando não há imagem selecionada (deve ser URL string - o front deve converter File para URL se necessário) */
  defaultImage?: string | null;
}

export const PreviewStep = ({ imageLink, defaultImage }: PreviewStepProps) => {
  const title = useAlertFormStore((state) => state.title);
  const message = useAlertFormStore((state) => state.message);
  const image = useAlertFormStore((state) => state.image);

  // Criar URL blob apenas no cliente e apenas quando necessário, ou usar URL direta
  // Nota: blob URL é criado apenas para a imagem selecionada pelo usuário, não para defaultImage
  const imageUrl = useMemo(() => {
    if (globalThis.window === undefined) {
      return undefined;
    }

    if (image instanceof File) {
      return globalThis.window.URL.createObjectURL(image);
    }

    if (typeof image === 'string') {
      return image;
    }

    return undefined;
  }, [image]);

  // Limpar URL blob quando componente desmontar ou imagem mudar
  // Apenas limpar se for um blob URL (criado a partir de File), não URLs externas
  useEffect(() => {
    return () => {
      if (
        globalThis.window !== undefined &&
        imageUrl &&
        image instanceof File
      ) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, image]);

  // Prioridade: imageLink (URL após upload) > imageUrl (do store) > defaultImage
  // imageLink e defaultImage já devem ser URLs strings prontas - não criamos blob URL aqui
  const finalImageUrl = imageLink || imageUrl || defaultImage || undefined;

  return (
    <section className="flex flex-col gap-4">
      <div className="bg-background-50 px-5 py-6 flex flex-col items-center gap-4 rounded-xl">
        {/* Renderiza imagem apenas se houver URL válida */}
        {finalImageUrl && (
          <img src={finalImageUrl} alt={title || 'Imagem do alerta'} />
        )}
        <div className="flex flex-col items-center text-center gap-3">
          <Text size="lg" weight="semibold">
            {title || 'Nenhum Título de Alerta'}
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
