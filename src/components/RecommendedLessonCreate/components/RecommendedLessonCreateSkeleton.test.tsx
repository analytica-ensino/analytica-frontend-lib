import { render, screen } from '@testing-library/react';
import React from 'react';
import { RecommendedLessonCreateSkeleton } from './RecommendedLessonCreateSkeleton';

// Mock the skeleton components
jest.mock('../../..', () => ({
  SkeletonText: ({
    width,
    height,
    lines,
    spacing,
  }: {
    width?: number | string;
    height?: number | string;
    lines?: number;
    spacing?: string;
  }) => (
    <div
      data-testid="skeleton-text"
      data-width={width}
      data-height={height}
      data-lines={lines}
      data-spacing={spacing}
    />
  ),
  Skeleton: ({
    variant,
    width,
    height,
  }: {
    variant?: string;
    width?: number | string;
    height?: number | string;
  }) => (
    <div
      data-testid="skeleton"
      data-variant={variant}
      data-width={width}
      data-height={height}
    />
  ),
  SkeletonCard: ({ lines }: { lines?: number }) => (
    <div data-testid="skeleton-card" data-lines={lines} />
  ),
}));

describe('RecommendedLessonCreateSkeleton', () => {
  it('should render the skeleton component', () => {
    render(<RecommendedLessonCreateSkeleton />);

    const container = screen.getByTestId('create-recommended-class-page');
    expect(container).toBeInTheDocument();
  });

  it('should have the correct container classes', () => {
    render(<RecommendedLessonCreateSkeleton />);

    const container = screen.getByTestId('create-recommended-class-page');
    expect(container).toHaveClass('flex', 'flex-col', 'w-full', 'h-screen');
  });

  describe('header section', () => {
    it('should render header skeleton elements', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletonTexts = screen.getAllByTestId('skeleton-text');
      const skeletons = screen.getAllByTestId('skeleton');

      // Header should have SkeletonText elements
      expect(skeletonTexts.length).toBeGreaterThan(0);
      // Header should have Skeleton elements (icon, buttons)
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render icon skeleton in header', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const iconSkeleton = skeletons.find(
        (el) =>
          el.getAttribute('data-variant') === 'rectangular' &&
          el.getAttribute('data-width') === '32' &&
          el.getAttribute('data-height') === '32'
      );

      expect(iconSkeleton).toBeInTheDocument();
    });

    it('should render button skeletons in header', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const buttonSkeletons = skeletons.filter(
        (el) =>
          el.getAttribute('data-variant') === 'rounded' &&
          el.getAttribute('data-width') === '120' &&
          el.getAttribute('data-height') === '32'
      );

      expect(buttonSkeletons.length).toBe(2);
    });
  });

  describe('filters column', () => {
    it('should render filter skeleton elements', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const roundedSkeletons = skeletons.filter(
        (el) => el.getAttribute('data-variant') === 'rounded'
      );

      // Should have multiple rounded skeletons for filter items
      expect(roundedSkeletons.length).toBeGreaterThan(0);
    });

    it('should render subject filter skeletons', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const subjectSkeletons = skeletons.filter(
        (el) =>
          el.getAttribute('data-variant') === 'rounded' &&
          el.getAttribute('data-width') === '100%' &&
          el.getAttribute('data-height') === '60'
      );

      // Should render 2 subject filter skeletons
      expect(subjectSkeletons.length).toBe(2);
    });

    it('should render topic filter skeletons', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const topicSkeletons = skeletons.filter(
        (el) =>
          el.getAttribute('data-variant') === 'rounded' &&
          el.getAttribute('data-width') === '100%' &&
          el.getAttribute('data-height') === '40'
      );

      // Should render 3 topic filter skeletons + 1 apply button
      expect(topicSkeletons.length).toBe(4);
    });
  });

  describe('lesson list column', () => {
    it('should render lesson list skeleton cards', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');

      // Should render 5 skeleton cards for the lesson list
      expect(skeletonCards.length).toBe(5);
    });

    it('should render skeleton cards with 2 lines', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      skeletonCards.forEach((card) => {
        expect(card.getAttribute('data-lines')).toBe('2');
      });
    });

    it('should render lesson list header skeleton', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const listHeaderIcon = skeletons.find(
        (el) =>
          el.getAttribute('data-variant') === 'rectangular' &&
          el.getAttribute('data-width') === '24' &&
          el.getAttribute('data-height') === '24'
      );

      expect(listHeaderIcon).toBeInTheDocument();
    });
  });

  describe('lesson preview column', () => {
    it('should render preview skeleton elements', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletonTexts = screen.getAllByTestId('skeleton-text');

      // Should have skeleton texts for preview header
      expect(skeletonTexts.length).toBeGreaterThan(0);
    });

    it('should render preview item skeletons', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const previewItemSkeletons = skeletons.filter(
        (el) =>
          el.getAttribute('data-variant') === 'rounded' &&
          el.getAttribute('data-width') === '80' &&
          el.getAttribute('data-height') === '24'
      );

      // Should render 6 preview item tag skeletons (3 items × 2 tags each)
      expect(previewItemSkeletons.length).toBe(6);
    });

    it('should render preview action button skeleton', () => {
      render(<RecommendedLessonCreateSkeleton />);

      const skeletons = screen.getAllByTestId('skeleton');
      const actionButtonSkeleton = skeletons.find(
        (el) =>
          el.getAttribute('data-variant') === 'rounded' &&
          el.getAttribute('data-width') === '100%' &&
          el.getAttribute('data-height') === '36'
      );

      expect(actionButtonSkeleton).toBeInTheDocument();
    });

    it('should render preview items with border', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      const previewItems = container.querySelectorAll(
        '.border.border-border-200.rounded-lg'
      );

      // Should render 3 preview items with border
      expect(previewItems.length).toBe(3);
    });
  });

  describe('layout structure', () => {
    it('should render three column layout', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      // Main content area with 3 columns
      const mainContent = container.querySelector(
        '.flex.flex-row.w-full.flex-1'
      );
      expect(mainContent).toBeInTheDocument();
    });

    it('should have first column with fixed width', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      const firstColumn = container.querySelector(
        '.w-\\[400px\\].flex-shrink-0'
      );
      expect(firstColumn).toBeInTheDocument();
    });

    it('should have flexible middle column', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      const middleColumn = container.querySelector('.flex-1.min-w-0');
      expect(middleColumn).toBeInTheDocument();
    });

    it('should have third column with fixed width', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      const thirdColumns = container.querySelectorAll(
        '.w-\\[400px\\].flex-shrink-0'
      );
      // First column and third column both have w-[400px]
      expect(thirdColumns.length).toBe(2);
    });
  });

  describe('accessibility', () => {
    it('should render with proper semantic structure', () => {
      const { container } = render(<RecommendedLessonCreateSkeleton />);

      // Check main container exists
      const mainContainer = container.querySelector(
        '[data-testid="create-recommended-class-page"]'
      );
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
