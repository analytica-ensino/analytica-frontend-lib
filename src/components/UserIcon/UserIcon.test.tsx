import { render } from '@testing-library/react';
import { UserIcon } from './UserIcon';

describe('UserIcon', () => {
  it('renders with default size', () => {
    const { container } = render(<UserIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders with custom size', () => {
    const { container } = render(<UserIcon size={32} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('forwards a custom className to the SVG root', () => {
    const { container } = render(<UserIcon className="custom-class" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('renders the rect with the theme background fill class', () => {
    const { container } = render(<UserIcon />);

    const rect = container.querySelector('svg rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveClass('fill-primary-100');
    expect(rect).toHaveAttribute('rx', '12');
  });

  it('renders the path with the theme foreground fill class', () => {
    const { container } = render(<UserIcon />);

    const path = container.querySelector('svg path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass('fill-primary-800');
  });

  it('marks the SVG as decorative for assistive tech', () => {
    const { container } = render(<UserIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
