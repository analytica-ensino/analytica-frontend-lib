import { render } from '@testing-library/react';
import { renderTextCell } from './renderTextCell';

describe('renderTextCell', () => {
  it('should render a string value', () => {
    const { container } = render(<>{renderTextCell('Hello World')}</>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('Hello World');
  });

  it('should render empty string for null value', () => {
    const { container } = render(<>{renderTextCell(null)}</>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });

  it('should render empty string for undefined value', () => {
    const { container } = render(<>{renderTextCell(undefined)}</>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });

  it('should render empty string for numeric value', () => {
    const { container } = render(<>{renderTextCell(42)}</>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });

  it('should render empty string for empty string value', () => {
    const { container } = render(<>{renderTextCell('')}</>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });
});
