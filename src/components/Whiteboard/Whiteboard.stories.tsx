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

const sixImages: WhiteboardImage[] = [
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
 * Whiteboard with many images (6 images in 3 rows)
 */
export const ManyImages: Story = () => (
  <Whiteboard images={sixImages} showDownload={true} imagesPerRow={2} />
);
