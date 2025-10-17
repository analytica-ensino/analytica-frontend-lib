import { useMemo, useEffect } from 'react';
import { Text } from '../../..';
import { useAlertFormStore } from '../useAlertForm';
import notification from '../../../assets/img/notification.png';

export const PreviewStep = () => {
  const title = useAlertFormStore((state) => state.title);
  const message = useAlertFormStore((state) => state.message);
  const image = useAlertFormStore((state) => state.image);

  // Criar URL blob apenas no cliente e apenas quando necessário
  const imageUrl = useMemo(() => {
    if (typeof globalThis.window === 'undefined') {
      return undefined;
    }

    if (image instanceof File) {
      return globalThis.window.URL.createObjectURL(image);
    }

    return undefined;
  }, [image]);

  // Limpar URL blob quando componente desmontar ou imagem mudar
  useEffect(() => {
    return () => {
      if (imageUrl && typeof window !== 'undefined') {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <section className="flex flex-col gap-4">
      <div className="bg-background-50 px-5 py-6 flex flex-col items-center gap-4 rounded-xl">
        <img src={imageUrl || notification} alt="Preview" className="" />
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
