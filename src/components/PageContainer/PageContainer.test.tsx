import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageContainer, { PageContainerProps } from './PageContainer';

describe('PageContainer', () => {
  it('renders children correctly', () => {
    render(
      <PageContainer>
        <span data-testid="child">Test Content</span>
      </PageContainer>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default classes to outer container', () => {
    render(
      <PageContainer>
        <span>Content</span>
      </PageContainer>
    );
    const outerDiv = screen.getByText('Content').parentElement?.parentElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('flex-col');
    expect(outerDiv).toHaveClass('w-full');
    expect(outerDiv).toHaveClass('h-full');
    expect(outerDiv).toHaveClass('relative');
    expect(outerDiv).toHaveClass('justify-center');
    expect(outerDiv).toHaveClass('items-center');
    expect(outerDiv).toHaveClass('mb-5');
  });

  it('applies default classes to inner container', () => {
    render(
      <PageContainer>
        <span>Content</span>
      </PageContainer>
    );
    const innerDiv = screen.getByText('Content').parentElement;
    expect(innerDiv).toHaveClass('flex');
    expect(innerDiv).toHaveClass('flex-col');
    expect(innerDiv).toHaveClass('w-full');
    expect(innerDiv).toHaveClass('h-full');
    expect(innerDiv).toHaveClass('max-w-[1000px]');
    expect(innerDiv).toHaveClass('z-10');
    expect(innerDiv).toHaveClass('lg:px-0');
    expect(innerDiv).toHaveClass('px-4');
  });

  it('applies custom className to outer container', () => {
    render(
      <PageContainer className="custom-class">
        <span>Content</span>
      </PageContainer>
    );
    const outerDiv = screen.getByText('Content').parentElement?.parentElement;
    expect(outerDiv).toHaveClass('custom-class');
  });

  it('merges custom className with default classes', () => {
    render(
      <PageContainer className="bg-red-500">
        <span>Content</span>
      </PageContainer>
    );
    const outerDiv = screen.getByText('Content').parentElement?.parentElement;
    expect(outerDiv).toHaveClass('flex');
    expect(outerDiv).toHaveClass('bg-red-500');
  });

  it('renders without className prop', () => {
    render(
      <PageContainer>
        <span>Content</span>
      </PageContainer>
    );
    const outerDiv = screen.getByText('Content').parentElement?.parentElement;
    expect(outerDiv).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <PageContainer>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
        <span data-testid="child-3">Third</span>
      </PageContainer>
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('renders complex nested children', () => {
    render(
      <PageContainer>
        <div data-testid="parent">
          <span data-testid="nested-child">Nested Content</span>
        </div>
      </PageContainer>
    );
    expect(screen.getByTestId('parent')).toBeInTheDocument();
    expect(screen.getByTestId('nested-child')).toBeInTheDocument();
  });

  it('exports PageContainerProps interface', () => {
    const props: PageContainerProps = {
      children: <span>Test</span>,
      className: 'test-class',
    };
    expect(props.children).toBeDefined();
    expect(props.className).toBe('test-class');
  });

  it('renders with undefined className', () => {
    const props: PageContainerProps = {
      children: <span>Content</span>,
      className: undefined,
    };
    render(<PageContainer {...props} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
