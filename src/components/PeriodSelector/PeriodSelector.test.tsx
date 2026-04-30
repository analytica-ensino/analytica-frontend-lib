import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PeriodSelector } from './PeriodSelector';
import { PERIOD_OPTIONS } from './types';

jest.mock('../Menu/Menu', () => ({
  Menu: ({
    children,
    defaultValue,
    value,
    variant,
    className,
    onValueChange,
  }: {
    children: React.ReactNode;
    defaultValue: string;
    value?: string;
    variant?: string;
    className?: string;
    onValueChange?: (value: string) => void;
  }) => {
    const content = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(
        child as React.ReactElement<{ children?: React.ReactNode }>,
        {
          children: React.Children.map(
            (child.props as { children?: React.ReactNode }).children,
            (item) => {
              if (!React.isValidElement(item)) return item;
              const itemValue = (
                item.props as { value?: string; onClick?: () => void }
              ).value;
              return React.cloneElement(
                item as React.ReactElement<{ onClick?: () => void }>,
                {
                  onClick: () => {
                    if (itemValue) {
                      onValueChange?.(itemValue);
                    }
                  },
                }
              );
            }
          ),
        }
      );
    });

    return (
      <div
        data-testid="menu"
        data-default-value={defaultValue}
        data-value={value ?? ''}
        data-variant={variant ?? ''}
        data-class-name={className ?? ''}
        data-has-on-change={Boolean(onValueChange)}
      >
        {content}
      </div>
    );
  },
  MenuContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <ul data-testid="menu-content" data-class-name={className ?? ''}>
      {children}
    </ul>
  ),
  MenuItem: ({
    children,
    value,
    onClick,
  }: {
    children: React.ReactNode;
    value: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid={`menu-item-${value}`}
      onClick={() => onClick?.()}
    >
      {children}
    </button>
  ),
}));

describe('PeriodSelector', () => {
  it('renders all default period options', () => {
    render(<PeriodSelector value="1_MONTH" onChange={jest.fn()} />);

    PERIOD_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('passes default props to Menu', () => {
    render(<PeriodSelector value="1_MONTH" onChange={jest.fn()} />);

    const menu = screen.getByTestId('menu');
    expect(menu).toHaveAttribute('data-default-value', '1_MONTH');
    expect(menu).toHaveAttribute('data-value', '1_MONTH');
    expect(menu).toHaveAttribute('data-variant', 'breadcrumb');
  });

  it('applies className to Menu container', () => {
    render(
      <PeriodSelector
        value="1_MONTH"
        onChange={jest.fn()}
        className="custom-selector"
      />
    );

    expect(screen.getByTestId('menu')).toHaveAttribute(
      'data-class-name',
      expect.stringContaining('custom-selector')
    );
  });

  it('renders custom options when provided', () => {
    const customOptions = [
      { value: '15_DAYS', label: '15 dias' },
      { value: '30_DAYS', label: '30 dias' },
    ];

    render(
      <PeriodSelector
        value="15_DAYS"
        onChange={jest.fn()}
        options={customOptions}
      />
    );

    expect(screen.getByText('15 dias')).toBeInTheDocument();
    expect(screen.getByText('30 dias')).toBeInTheDocument();
    expect(screen.queryByText('1 mês')).not.toBeInTheDocument();
  });

  it('filters excluded values from options', () => {
    render(
      <PeriodSelector
        value="1_MONTH"
        onChange={jest.fn()}
        excludeValues={['3_MONTHS', '1_YEAR']}
      />
    );

    expect(screen.queryByText('3 meses')).not.toBeInTheDocument();
    expect(screen.queryByText('1 ano')).not.toBeInTheDocument();
    expect(screen.getByText('1 mês')).toBeInTheDocument();
  });

  it('calls onChange when a period option is clicked', () => {
    const onChange = jest.fn();
    render(<PeriodSelector value="1_MONTH" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('menu-item-7_DAYS'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('7_DAYS');
  });

  it('uses custom defaultValue when provided', () => {
    render(
      <PeriodSelector
        value="3_MONTHS"
        defaultValue="7_DAYS"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByTestId('menu')).toHaveAttribute(
      'data-default-value',
      '7_DAYS'
    );
  });
});
