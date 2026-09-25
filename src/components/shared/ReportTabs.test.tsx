import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportTabs } from './ReportTabs';

const tabs = [
  { value: 'geral', label: 'Geral' },
  { value: 'm1', label: 'Momento 1' },
  { value: 'm2', label: 'Momento 2' },
];

const tabOf = (label: string) => screen.getByText(label).closest('li')!;

describe('ReportTabs', () => {
  it('draws one tab per item and reports the one picked', () => {
    const onValueChange = jest.fn();
    render(
      <ReportTabs tabs={tabs} value="geral" onValueChange={onValueChange} />
    );

    fireEvent.click(screen.getByText('Momento 2'));

    expect(screen.getByText('Momento 1')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith('m2');
  });

  it('draws the icon of a tab that has one', () => {
    render(
      <ReportTabs
        tabs={[{ ...tabs[0], icon: <svg data-testid="icon" /> }, tabs[1]]}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('prints every tab by default', () => {
    render(<ReportTabs tabs={tabs} value="m1" />);

    expect(tabOf('Geral')).not.toHaveAttribute('data-print-hide');
  });

  it('can print the active tab alone', () => {
    render(<ReportTabs tabs={tabs} value="m1" printActiveOnly />);

    expect(tabOf('Momento 1')).not.toHaveAttribute('data-print-hide');
    expect(tabOf('Geral')).toHaveAttribute('data-print-hide');
    expect(tabOf('Momento 2')).toHaveAttribute('data-print-hide');
  });

  it('follows the tab picked when uncontrolled', () => {
    render(<ReportTabs tabs={tabs} printActiveOnly />);
    expect(tabOf('Geral')).not.toHaveAttribute('data-print-hide');

    fireEvent.click(screen.getByText('Momento 1'));

    expect(tabOf('Momento 1')).not.toHaveAttribute('data-print-hide');
    expect(tabOf('Geral')).toHaveAttribute('data-print-hide');
  });
});
