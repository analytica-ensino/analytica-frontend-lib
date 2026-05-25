import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppLayout, AppLayoutMenuItem } from './AppLayout';

const baseItems: AppLayoutMenuItem[] = [
  {
    value: 'home',
    label: 'Painel',
    icon: <span data-testid="icon-home">H</span>,
  },
  {
    value: 'simulated',
    label: 'Simulados',
    icon: <span data-testid="icon-sim">S</span>,
  },
  {
    value: 'hidden',
    label: 'Não aparece',
    icon: <span data-testid="icon-hidden">X</span>,
    visible: false,
  },
];

describe('AppLayout', () => {
  it('renders the header, all visible items and children', () => {
    render(
      <AppLayout
        header={<div data-testid="header-slot">HEADER</div>}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
      >
        <div data-testid="page-body">PAGE</div>
      </AppLayout>
    );

    expect(screen.getByTestId('header-slot')).toBeInTheDocument();
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByText('Simulados')).toBeInTheDocument();
    expect(screen.getByTestId('page-body')).toBeInTheDocument();
  });

  it('filters out items with visible=false', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    expect(screen.queryByText('Não aparece')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-hidden')).not.toBeInTheDocument();
  });

  it('calls onMenuItemClick with the value when an item is clicked', () => {
    const onMenuItemClick = jest.fn();
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={onMenuItemClick}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    fireEvent.click(screen.getByText('Simulados'));
    expect(onMenuItemClick).toHaveBeenCalledWith('simulated');
  });

  it('applies the default max-w-[1000px] when menuMaxWidth is not provided', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    const wrapper = screen.getByTestId('menu-overflow-wrapper');
    expect(wrapper.className).toContain('max-w-[1000px]');
  });

  it('applies the override when menuMaxWidth is provided', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
        menuMaxWidth="max-w-[1150px]"
      >
        <div>PAGE</div>
      </AppLayout>
    );

    const wrapper = screen.getByTestId('menu-overflow-wrapper');
    expect(wrapper.className).toContain('max-w-[1150px]');
    expect(wrapper.className).not.toContain('max-w-[1000px]');
  });

  it('renders the bottomSlot when provided', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
        bottomSlot={<div data-testid="bottom-slot">BOTTOM</div>}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    expect(screen.getByTestId('bottom-slot')).toBeInTheDocument();
  });

  it('does not render the bottomSlot when omitted', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    expect(screen.queryByTestId('bottom-slot')).not.toBeInTheDocument();
  });

  it('applies overflow-x-hidden on the root for ≤320px protection', () => {
    render(
      <AppLayout
        header={null}
        menuItems={baseItems}
        activeMenuValue="home"
        onMenuItemClick={jest.fn()}
      >
        <div>PAGE</div>
      </AppLayout>
    );

    const root = document.querySelector('[data-component="AppLayout"]');
    expect(root).not.toBeNull();
    expect(root?.className).toContain('overflow-x-hidden');
  });
});
