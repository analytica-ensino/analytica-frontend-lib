import type { Story } from '@ladle/react';
import { ReactNode } from 'react';
import DownloadButton from './DownloadButton';

export default {
  title: 'DownloadButton',
};

const WrapperDecorator = ({ children }: { children: ReactNode }) => (
  <div className="bg-subject-1 p-8 rounded-xl">
    <div className="flex items-end justify-between min-h-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-text-900 leading-5 tracking-wide">
          Movimento uniforme
        </h2>
        <p className="text-sm text-text-600 leading-5">Função horária</p>
      </div>
      {children}
    </div>
  </div>
);

/**
 * Default DownloadButton with all content types
 */
export const Default: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
        urlInitialFrame: 'https://example.com/initial-frame.jpg',
        urlFinalFrame: 'https://example.com/final-frame.jpg',
        urlPodcast: 'https://example.com/podcast.mp3',
        urlVideo: 'https://example.com/video.mp4',
      }}
      lessonTitle="Introdução aos Números Reais"
      onDownloadStart={(contentType: string) => {
        console.log(`Download started: ${contentType}`);
      }}
      onDownloadComplete={(contentType: string) => {
        console.log(`Download completed: ${contentType}`);
      }}
      onDownloadError={(contentType: string, error: Error) => {
        console.error(`Download error for ${contentType}:`, error);
      }}
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with only document
 */
export const DocumentOnly: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
      }}
      lessonTitle="Documento da Aula"
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with only images
 */
export const ImagesOnly: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlInitialFrame: 'https://example.com/initial-frame.jpg',
        urlFinalFrame: 'https://example.com/final-frame.jpg',
      }}
      lessonTitle="Quadros da Aula"
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with only media files
 */
export const MediaOnly: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlPodcast: 'https://example.com/podcast.mp3',
        urlVideo: 'https://example.com/video.mp4',
      }}
      lessonTitle="Conteúdo Multimídia"
    />
  </WrapperDecorator>
);

/**
 * Disabled DownloadButton
 */
export const Disabled: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
        urlVideo: 'https://example.com/video.mp4',
      }}
      lessonTitle="Aula Indisponível"
      disabled={true}
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with no content (should not render)
 */
export const NoContent: Story = () => (
  <div className="bg-subject-1 p-8 rounded-xl">
    <div className="flex items-end justify-between min-h-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-text-900 leading-5 tracking-wide">
          Aula sem conteúdo para download
        </h2>
        <p className="text-sm text-text-600 leading-5">
          O botão não deve aparecer quando não há conteúdo
        </p>
      </div>
      <DownloadButton content={{}} lessonTitle="Aula Sem Conteúdo" />
    </div>
  </div>
);

/**
 * DownloadButton with long lesson title
 */
export const LongTitle: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
        urlVideo: 'https://example.com/video.mp4',
      }}
      lessonTitle="Este é um título muito longo para a aula que deve ser truncado adequadamente no filename"
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with special characters in title
 */
export const SpecialCharacters: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
      }}
      lessonTitle="Aula com Caracteres Especiais: @#$%^&*()"
    />
  </WrapperDecorator>
);

/**
 * DownloadButton without lesson title (uses default)
 */
export const NoLessonTitle: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
        urlPodcast: 'https://example.com/podcast.mp3',
      }}
    />
  </WrapperDecorator>
);

/**
 * DownloadButton with custom className
 */
export const CustomStyling: Story = () => (
  <WrapperDecorator>
    <DownloadButton
      content={{
        urlDoc: 'https://example.com/document.pdf',
      }}
      lessonTitle="Aula Customizada"
      className="ring-2 ring-primary-500 rounded-md"
    />
  </WrapperDecorator>
);
