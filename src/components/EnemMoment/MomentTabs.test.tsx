import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MomentTabs } from './MomentTabs';

const geral = { value: 'geral', label: 'Geral' };
const tabs = [
  geral,
  { value: 'day-1', label: 'Momento 1' },
  { value: 'day-2', label: 'Momento 2' },
];

const tabOf = (label: string) => screen.getByText(label).closest('li')!;

describe('MomentTabs', () => {
  it('draws "Geral" and one tab per moment', () => {
    render(
      <MomentTabs tabs={tabs} activeTab="geral" onTabChange={jest.fn()} />
    );

    expect(screen.getByText('Geral')).toBeInTheDocument();
    expect(screen.getByText('Momento 1')).toBeInTheDocument();
    expect(screen.getByText('Momento 2')).toBeInTheDocument();
  });

  it('reports the tab picked', () => {
    const onTabChange = jest.fn();
    render(
      <MomentTabs tabs={tabs} activeTab="geral" onTabChange={onTabChange} />
    );

    fireEvent.click(screen.getByText('Momento 2'));

    expect(onTabChange).toHaveBeenCalledWith('day-2');
  });

  it('prints only the active tab: the others are navigation', () => {
    render(
      <MomentTabs tabs={tabs} activeTab="day-1" onTabChange={jest.fn()} />
    );

    expect(tabOf('Momento 1')).not.toHaveAttribute('data-print-hide');
    expect(tabOf('Geral')).toHaveAttribute('data-print-hide');
    expect(tabOf('Momento 2')).toHaveAttribute('data-print-hide');
  });

  it('is not drawn with "Geral" plus a single exam: both would show the same', () => {
    const { container } = render(
      <MomentTabs
        tabs={[geral, { value: 'day-1', label: 'Momento 1' }]}
        activeTab="geral"
        onTabChange={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('is not drawn with "Geral" alone', () => {
    const { container } = render(
      <MomentTabs tabs={[geral]} activeTab="geral" onTabChange={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
