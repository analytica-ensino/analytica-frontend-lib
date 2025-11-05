import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from './Skeleton';

describe('Skeleton', () => {
  const baseProps = {
    'data-testid': 'skeleton',
  };

  it('should render with default props', () => {
    render(<Skeleton {...baseProps} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain('h-4');
    expect(skeleton.className).toContain('bg-background-200');
    expect(skeleton.className).toContain('rounded');
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Skeleton {...baseProps} />);

    // Teste variant text (padrão)
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).toContain('h-4');
    expect(skeleton.className).toContain('rounded');

    // Teste variant circular
    rerender(<Skeleton {...baseProps} variant="circular" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).toContain('rounded-full');

    // Teste variant rectangular
    rerender(<Skeleton {...baseProps} variant="rectangular" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).toContain('bg-background-200');
    expect(skeleton.className).not.toContain('rounded');

    // Teste variant rounded
    rerender(<Skeleton {...baseProps} variant="rounded" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).toContain('rounded-lg');
  });

  it('should apply animation classes correctly', () => {
    const { rerender } = render(<Skeleton {...baseProps} />);

    // Teste animation pulse (padrão)
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).toContain('animate-pulse');

    // Teste animation none
    rerender(<Skeleton {...baseProps} animation="none" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton.className).not.toContain('animate-pulse');
  });

  it('should apply custom width and height', () => {
    render(<Skeleton {...baseProps} width={200} height={100} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('should apply string width and height', () => {
    render(<Skeleton {...baseProps} width="50%" height="2rem" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '50%', height: '2rem' });
  });

  it('should render multiple text lines', () => {
    render(<Skeleton {...baseProps} variant="text" lines={3} />);
    const container = screen.getByTestId('skeleton');
    const lines = container.querySelectorAll('div > div');
    expect(lines).toHaveLength(3);
  });

  it('should apply spacing classes for multiple lines', () => {
    const { rerender } = render(
      <Skeleton {...baseProps} lines={2} spacing="small" />
    );
    let container = screen.getByTestId('skeleton');
    expect(container.className).toContain('space-y-1');

    rerender(<Skeleton {...baseProps} lines={2} spacing="medium" />);
    container = screen.getByTestId('skeleton');
    expect(container.className).toContain('space-y-2');

    rerender(<Skeleton {...baseProps} lines={2} spacing="large" />);
    container = screen.getByTestId('skeleton');
    expect(container.className).toContain('space-y-3');
  });

  it('should make last line shorter for text variant', () => {
    render(<Skeleton {...baseProps} variant="text" lines={3} />);
    const container = screen.getByTestId('skeleton');
    const lines = container.querySelectorAll('div > div');
    const lastLine = lines[lines.length - 1];
    expect(lastLine).toHaveStyle({ width: '60%' });
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<Skeleton {...baseProps} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should forward extra HTML attributes', () => {
    render(
      <Skeleton {...baseProps} aria-label="Loading content" role="status" />
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('should render children', () => {
    render(
      <Skeleton {...baseProps}>
        <div data-testid="child">Child content</div>
      </Skeleton>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});

describe('SkeletonText', () => {
  it('should render with text variant', () => {
    render(<SkeletonText data-testid="skeleton-text" />);
    const skeleton = screen.getByTestId('skeleton-text');
    expect(skeleton.className).toContain('h-4');
    expect(skeleton.className).toContain('rounded');
  });
});

describe('SkeletonCircle', () => {
  it('should render with circular variant', () => {
    render(<SkeletonCircle data-testid="skeleton-circle" />);
    const skeleton = screen.getByTestId('skeleton-circle');
    expect(skeleton.className).toContain('rounded-full');
  });
});

describe('SkeletonRectangle', () => {
  it('should render with rectangular variant', () => {
    render(<SkeletonRectangle data-testid="skeleton-rectangle" />);
    const skeleton = screen.getByTestId('skeleton-rectangle');
    expect(skeleton.className).toContain('bg-background-200');
    expect(skeleton.className).not.toContain('rounded');
  });
});

describe('SkeletonRounded', () => {
  it('should render with rounded variant', () => {
    render(<SkeletonRounded data-testid="skeleton-rounded" />);
    const skeleton = screen.getByTestId('skeleton-rounded');
    expect(skeleton.className).toContain('rounded-lg');
  });
});

describe('SkeletonCard', () => {
  const baseProps = {
    'data-testid': 'skeleton-card',
  };

  it('should render with default props', () => {
    render(<SkeletonCard {...baseProps} />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('w-full');
    expect(card.className).toContain('p-4');
    expect(card.className).toContain('bg-background');
    expect(card.className).toContain('border');
    expect(card.className).toContain('rounded-lg');
  });

  it('should show avatar by default', () => {
    render(<SkeletonCard {...baseProps} />);
    const card = screen.getByTestId('skeleton-card');
    const avatar = card.querySelector('[class*="rounded-full"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should hide avatar when showAvatar is false', () => {
    render(<SkeletonCard {...baseProps} showAvatar={false} />);
    const card = screen.getByTestId('skeleton-card');
    const avatar = card.querySelector('[class*="rounded-full"]');
    expect(avatar).not.toBeInTheDocument();
  });

  it('should show title by default', () => {
    render(<SkeletonCard {...baseProps} />);
    const card = screen.getByTestId('skeleton-card');
    const title = card.querySelector('[style*="width: 60%"]');
    expect(title).toBeInTheDocument();
  });

  it('should show description by default', () => {
    render(<SkeletonCard {...baseProps} />);
    const card = screen.getByTestId('skeleton-card');
    const description = card.querySelector('[class*="space-y-1"]');
    expect(description).toBeInTheDocument();
  });

  it('should hide description when showDescription is false', () => {
    render(<SkeletonCard {...baseProps} showDescription={false} />);
    const card = screen.getByTestId('skeleton-card');
    const description = card.querySelector('[class*="space-y-1"]');
    expect(description).not.toBeInTheDocument();
  });

  it('should show actions by default', () => {
    render(<SkeletonCard {...baseProps} />);
    const card = screen.getByTestId('skeleton-card');
    const actions = card.querySelector('[class*="justify-end"]');
    expect(actions).toBeInTheDocument();
  });

  it('should hide actions when showActions is false', () => {
    render(<SkeletonCard {...baseProps} showActions={false} />);
    const card = screen.getByTestId('skeleton-card');
    const actions = card.querySelector('[class*="justify-end"]');
    expect(actions).not.toBeInTheDocument();
  });

  it('should render specified number of description lines', () => {
    render(<SkeletonCard {...baseProps} lines={4} />);
    const card = screen.getByTestId('skeleton-card');
    const descriptionLines = card.querySelectorAll('[class*="space-y-1"] div');
    expect(descriptionLines).toHaveLength(4);
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<SkeletonCard {...baseProps} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('SkeletonList', () => {
  const baseProps = {
    'data-testid': 'skeleton-list',
  };

  it('should render with default props', () => {
    render(<SkeletonList {...baseProps} />);
    const list = screen.getByTestId('skeleton-list');
    expect(list).toBeInTheDocument();
    expect(list.className).toContain('space-y-3');
  });

  it('should render default number of items', () => {
    render(<SkeletonList {...baseProps} />);
    const list = screen.getByTestId('skeleton-list');
    const items = list.querySelectorAll('[class*="flex items-start"]');
    expect(items).toHaveLength(3);
  });

  it('should render specified number of items', () => {
    render(<SkeletonList {...baseProps} items={5} />);
    const list = screen.getByTestId('skeleton-list');
    const items = list.querySelectorAll('[class*="flex items-start"]');
    expect(items).toHaveLength(5);
  });

  it('should show avatar by default', () => {
    render(<SkeletonList {...baseProps} />);
    const list = screen.getByTestId('skeleton-list');
    const avatars = list.querySelectorAll('[class*="rounded-full"]');
    expect(avatars).toHaveLength(3);
  });

  it('should hide avatar when showAvatar is false', () => {
    render(<SkeletonList {...baseProps} showAvatar={false} />);
    const list = screen.getByTestId('skeleton-list');
    const avatars = list.querySelectorAll('[class*="rounded-full"]');
    expect(avatars).toHaveLength(0);
  });

  it('should show title by default', () => {
    render(<SkeletonList {...baseProps} />);
    const list = screen.getByTestId('skeleton-list');
    const titles = list.querySelectorAll('[style*="width: 40%"]');
    expect(titles).toHaveLength(3);
  });

  it('should hide description when showDescription is false', () => {
    render(<SkeletonList {...baseProps} showDescription={false} />);
    const list = screen.getByTestId('skeleton-list');
    const descriptions = list.querySelectorAll('[class*="space-y-1"]');
    expect(descriptions).toHaveLength(0);
  });

  it('should render specified number of description lines', () => {
    render(<SkeletonList {...baseProps} lines={3} />);
    const list = screen.getByTestId('skeleton-list');
    const descriptionLines = list.querySelectorAll('[class*="space-y-1"] div');
    expect(descriptionLines).toHaveLength(9); // 3 items × 3 lines each
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<SkeletonList {...baseProps} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('SkeletonTable', () => {
  const baseProps = {
    'data-testid': 'skeleton-table',
  };

  it('should render with default props', () => {
    render(<SkeletonTable {...baseProps} />);
    const table = screen.getByTestId('skeleton-table');
    expect(table).toBeInTheDocument();
    expect(table.className).toContain('w-full');
  });

  it('should hide header when showHeader is false', () => {
    render(<SkeletonTable {...baseProps} showHeader={false} />);
    const table = screen.getByTestId('skeleton-table');
    const header = table.querySelector('[class*="mb-3"]');
    expect(header).not.toBeInTheDocument();
  });

  it('should apply correct width to data cells', () => {
    render(<SkeletonTable {...baseProps} columns={2} />);
    const table = screen.getByTestId('skeleton-table');
    const dataCells = table.querySelectorAll('[style*="width: 50%"]'); // 100% / 2 columns
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<SkeletonTable {...baseProps} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
