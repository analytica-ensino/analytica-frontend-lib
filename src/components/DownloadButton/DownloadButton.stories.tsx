import type { Story } from '@ladle/react';
import { ReactNode } from 'react';
import DownloadButton from './DownloadButton';

export default {
  title: 'DownloadButton',
};

const SimpleWrapper = ({ children }: { children: ReactNode }) => (
  <div className="p-4 bg-gray-50 rounded-lg">{children}</div>
);

/**
 * Default DownloadButton with all content types
 */
export const Default: Story = () => (
  <SimpleWrapper>
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
  </SimpleWrapper>
);
