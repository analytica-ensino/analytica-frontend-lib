import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricBox } from './MetricBox';

describe('MetricBox', () => {
  it('renders the label text', () => {
    render(<MetricBox label="Atividades realizadas" value={10} />);
    expect(screen.getByText('Atividades realizadas')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<MetricBox label="Total" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<MetricBox label="Tempo online" value="2h30min" />);
    expect(screen.getByText('2h30min')).toBeInTheDocument();
  });

  it('renders zero value', () => {
    render(<MetricBox label="Total" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies extra className to the container', () => {
    const { container } = render(
      <MetricBox label="Label" value={1} className="flex-1" />
    );
    expect(container.firstChild).toHaveClass('flex-1');
  });

  it('retains base classes alongside extra className', () => {
    const { container } = render(
      <MetricBox label="Label" value={1} className="flex-1" />
    );
    expect(container.firstChild).toHaveClass('rounded-xl');
    expect(container.firstChild).toHaveClass('border');
  });

  it('renders without className prop', () => {
    expect(() => render(<MetricBox label="Label" value={5} />)).not.toThrow();
  });
});
