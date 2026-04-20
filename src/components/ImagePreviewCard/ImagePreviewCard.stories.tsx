import type { Story } from '@ladle/react';
import { useState } from 'react';
import ImagePreviewCard from './ImagePreviewCard';

const SAMPLE_IMAGE =
  'https://placehold.co/600x800/E7BFF1/8A24A3?text=Redação+manuscrita';

export const AllImagePreviewCards: Story = () => {
  const [hasImage, setHasImage] = useState(true);

  if (!hasImage) {
    return (
      <button
        type="button"
        onClick={() => setHasImage(true)}
        className="px-4 py-2 bg-primary-700 text-white rounded"
      >
        Restaurar imagem
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">ImagePreviewCard</h2>
      <p className="text-text-700">
        Preview de imagem com chip de filename e ações opcionais de remover e
        atualizar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="font-bold text-xl text-text-900 mb-2">Completo</h3>
          <ImagePreviewCard
            imageUrl={SAMPLE_IMAGE}
            fileName="redacao-manuscrita.jpg"
            onRemove={() => setHasImage(false)}
            onUpdate={() => alert('Atualizar (mock)')}
          />
        </div>

        <div>
          <h3 className="font-bold text-xl text-text-900 mb-2">
            Só visualização (sem ações)
          </h3>
          <ImagePreviewCard imageUrl={SAMPLE_IMAGE} fileName="documento.png" />
        </div>

        <div>
          <h3 className="font-bold text-xl text-text-900 mb-2">
            Só remover (sem atualizar)
          </h3>
          <ImagePreviewCard
            imageUrl={SAMPLE_IMAGE}
            fileName="anexo.jpg"
            onRemove={() => setHasImage(false)}
          />
        </div>

        <div>
          <h3 className="font-bold text-xl text-text-900 mb-2">
            Label e labels customizados
          </h3>
          <ImagePreviewCard
            imageUrl={SAMPLE_IMAGE}
            fileName="foto.heic"
            label="Anexo"
            updateButtonLabel="Substituir imagem"
            removeAriaLabel="Descartar"
            onRemove={() => setHasImage(false)}
            onUpdate={() => alert('Substituir (mock)')}
          />
        </div>
      </div>
    </div>
  );
};

export const Default: Story = () => (
  <div className="max-w-md">
    <ImagePreviewCard
      imageUrl={SAMPLE_IMAGE}
      fileName="redacao-manuscrita.jpg"
      onRemove={() => alert('Removido (mock)')}
      onUpdate={() => alert('Atualizar (mock)')}
    />
  </div>
);

export const ReadOnly: Story = () => (
  <div className="max-w-md">
    <ImagePreviewCard imageUrl={SAMPLE_IMAGE} fileName="documento.png" />
  </div>
);
