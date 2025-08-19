import type { Story } from '@ladle/react';
import Whiteboard, { WhiteboardImage } from './Whiteboard';

const mockImages: WhiteboardImage[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/board1/450/180',
    title: 'Quadro de aula - Matemática',
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/board2/450/180',
    title: 'Quadro de aula - Física',
  },
];

const multipleImages: WhiteboardImage[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/board1/450/180',
    title: 'Quadro 1',
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/board2/450/180',
    title: 'Quadro 2',
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/seed/board3/450/180',
    title: 'Quadro 3',
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/seed/board4/450/180',
    title: 'Quadro 4',
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/seed/board5/450/180',
    title: 'Quadro 5',
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/seed/board6/450/180',
    title: 'Quadro 6',
  },
];

/**
 * Default whiteboard with two images
 */
export const Default: Story = () => (
  <Whiteboard images={mockImages} showDownload={true} imagesPerRow={2} />
);

/**
 * Whiteboard without download buttons
 */
export const WithoutDownload: Story = () => (
  <Whiteboard images={mockImages} showDownload={false} imagesPerRow={2} />
);

/**
 * Whiteboard with single image
 */
export const SingleImage: Story = () => (
  <Whiteboard images={[mockImages[0]]} showDownload={true} imagesPerRow={2} />
);

/**
 * Whiteboard with multiple images (3 columns)
 */
export const ThreeColumns: Story = () => (
  <Whiteboard
    images={multipleImages.slice(0, 3)}
    showDownload={true}
    imagesPerRow={3}
  />
);

/**
 * Whiteboard with multiple images (4 columns)
 */
export const FourColumns: Story = () => (
  <Whiteboard
    images={multipleImages.slice(0, 4)}
    showDownload={true}
    imagesPerRow={4}
  />
);

/**
 * Whiteboard with many images
 */
export const ManyImages: Story = () => (
  <Whiteboard images={multipleImages} showDownload={true} imagesPerRow={3} />
);

/**
 * Empty state - no images
 */
export const EmptyState: Story = () => (
  <Whiteboard images={[]} showDownload={true} imagesPerRow={2} />
);

/**
 * Images without titles
 */
export const WithoutTitles: Story = () => (
  <Whiteboard
    images={[
      {
        id: '1',
        imageUrl: 'https://picsum.photos/seed/notitle1/450/180',
      },
      {
        id: '2',
        imageUrl: 'https://picsum.photos/seed/notitle2/450/180',
      },
    ]}
    showDownload={true}
    imagesPerRow={2}
  />
);

/**
 * With custom className styling
 */
export const CustomStyling: Story = () => (
  <Whiteboard
    images={mockImages}
    showDownload={true}
    imagesPerRow={2}
    className="shadow-lg p-6"
  />
);

/**
 * Interactive example with download callback
 */
export const WithDownloadCallback: Story = () => (
  <Whiteboard
    images={mockImages}
    showDownload={true}
    imagesPerRow={2}
    onDownload={(image: WhiteboardImage) => {
      alert(`Download iniciado para: ${image.title || image.id}`);
    }}
  />
);
