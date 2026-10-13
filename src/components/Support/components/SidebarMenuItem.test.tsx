import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { SidebarMenuItem } from './SidebarMenuItem';

const TestIcon = () => <SquaresFourIcon data-testid="test-icon" size={20} />;

describe('SidebarMenuItem', () => {
  it('renders a button with the label', () => {
    render(<SidebarMenuItem label="Dashboard" />);

    expect(
      screen.getByRole('button', { name: /Dashboard/ })
    ).toBeInTheDocument();
  });

  it('renders as type="button" so it never submits a surrounding form', () => {
    render(<SidebarMenuItem label="Dashboard" />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<SidebarMenuItem label="Dashboard" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = jest.fn();
    render(<SidebarMenuItem label="Dashboard" onClick={onClick} disabled />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SidebarMenuItem ref={ref} label="Dashboard" />);

    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('merges a custom className', () => {
    render(<SidebarMenuItem label="Dashboard" className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards extra button attributes', () => {
    render(<SidebarMenuItem label="Dashboard" data-testid="sidebar-item" />);

    expect(screen.getByTestId('sidebar-item')).toBeInTheDocument();
  });

  describe('variant main', () => {
    it('renders the icon', () => {
      render(<SidebarMenuItem label="Dashboard" icon={<TestIcon />} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('hides the icon from screen readers since the label already names the item', () => {
      render(<SidebarMenuItem label="Dashboard" icon={<TestIcon />} />);

      expect(screen.getByTestId('sidebar-menu-item-icon')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('renders no icon wrapper when no icon is given', () => {
      render(<SidebarMenuItem label="Dashboard" />);

      expect(
        screen.queryByTestId('sidebar-menu-item-icon')
      ).not.toBeInTheDocument();
    });

    it('is not indented', () => {
      render(<SidebarMenuItem label="Dashboard" />);

      expect(screen.getByRole('button')).not.toHaveClass('pl-11');
    });

    it('renders the count inside an orange pill', () => {
      render(<SidebarMenuItem label="Dashboard" count={4} />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveTextContent('4');
      expect(count).toHaveClass('bg-warning-100');
      expect(count).toHaveClass('text-warning-700');
      expect(count).toHaveClass('rounded-full');
    });
  });

  describe('variant sub', () => {
    it('is indented to align with the main label', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" />);

      expect(screen.getByRole('button')).toHaveClass('pl-11');
    });

    it('ignores the icon', () => {
      render(
        <SidebarMenuItem label="Dashboard" variant="sub" icon={<TestIcon />} />
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('renders the count as plain text inheriting the item color', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" count={4} />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveTextContent('4');
      expect(count).not.toHaveClass('bg-warning-100');
      expect(count).not.toHaveClass('rounded-full');
    });
  });

  describe('size', () => {
    it('defaults to md', () => {
      render(<SidebarMenuItem label="Dashboard" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-2.5');
      expect(button).toHaveClass('gap-3');
      expect(button).toHaveClass('text-sm');
    });

    it('applies the compact spacing on sm', () => {
      render(<SidebarMenuItem label="Dashboard" size="sm" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('gap-2');
      expect(button).toHaveClass('text-xs');
    });

    it('keeps the sub indent aligned with the main label on md', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" size="md" />);

      // px-3 (12) + ícone 20 + gap-3 (12) = 44px = pl-11
      expect(screen.getByRole('button')).toHaveClass('pl-11');
    });

    it('keeps the sub indent aligned with the main label on sm', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" size="sm" />);

      // px-2 (8) + ícone 16 + gap-2 (8) = 32px = pl-8
      const button = screen.getByRole('button');
      expect(button).toHaveClass('pl-8');
      expect(button).not.toHaveClass('pl-11');
    });

    it('sizes the icon box to 20px on md', () => {
      render(<SidebarMenuItem label="Dashboard" icon={<TestIcon />} />);

      expect(screen.getByTestId('sidebar-menu-item-icon')).toHaveClass(
        'size-5'
      );
    });

    it('sizes the icon box to 16px on sm', () => {
      render(
        <SidebarMenuItem label="Dashboard" size="sm" icon={<TestIcon />} />
      );

      const wrapper = screen.getByTestId('sidebar-menu-item-icon');
      expect(wrapper).toHaveClass('size-4');
      expect(wrapper).not.toHaveClass('size-5');
    });

    it('forces the child svg to follow the box so a mis-sized icon still fits', () => {
      render(
        <SidebarMenuItem label="Dashboard" size="sm" icon={<TestIcon />} />
      );

      expect(screen.getByTestId('sidebar-menu-item-icon')).toHaveClass(
        '[&>svg]:size-4'
      );
    });

    it('renders the label with the lib typography and the item size', () => {
      const { rerender } = render(<SidebarMenuItem label="Dashboard" />);

      expect(screen.getByText('Dashboard')).toHaveClass(
        'font-primary',
        'text-sm',
        'text-inherit'
      );

      rerender(<SidebarMenuItem label="Dashboard" size="sm" />);

      expect(screen.getByText('Dashboard')).toHaveClass('text-xs');
    });

    it('shrinks the count pill on sm', () => {
      render(<SidebarMenuItem label="Dashboard" size="sm" count={4} />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveClass('text-2xs');
      expect(count).toHaveClass('bg-warning-100');
    });

    it('lets the sub count inherit the item font size', () => {
      render(
        <SidebarMenuItem label="Dashboard" variant="sub" size="sm" count={4} />
      );

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).not.toHaveClass('text-sm');
      expect(count).not.toHaveClass('text-xs');
    });
  });

  describe('countTone', () => {
    it('defaults to the orange warning pill', () => {
      render(<SidebarMenuItem label="Dashboard" count={4} />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveClass('bg-warning-100');
      expect(count).toHaveClass('text-warning-700');
    });

    it('follows the theme palette when countTone is theme', () => {
      render(<SidebarMenuItem label="Dashboard" count={4} countTone="theme" />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveClass('bg-primary-100');
      expect(count).toHaveClass('text-primary-800');
      expect(count).not.toHaveClass('bg-warning-100');
    });

    it('uses the neutral palette when countTone is muted', () => {
      render(<SidebarMenuItem label="Dashboard" count={4} countTone="muted" />);

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).toHaveClass('bg-background-muted');
      expect(count).toHaveClass('text-background-800');
      expect(count).not.toHaveClass('bg-warning-100');
    });

    it('is ignored by a sub item, whose count is plain inherited text', () => {
      render(
        <SidebarMenuItem
          label="Dashboard"
          variant="sub"
          count={4}
          countTone="muted"
        />
      );

      const count = screen.getByTestId('sidebar-menu-item-count');
      expect(count).not.toHaveClass('bg-background-muted');
      expect(count).not.toHaveClass('bg-warning-100');
    });
  });

  describe('count', () => {
    it('renders nothing when count is undefined', () => {
      render(<SidebarMenuItem label="Dashboard" />);

      expect(
        screen.queryByTestId('sidebar-menu-item-count')
      ).not.toBeInTheDocument();
    });

    it('renders zero instead of hiding it', () => {
      render(<SidebarMenuItem label="Dashboard" count={0} />);

      expect(screen.getByTestId('sidebar-menu-item-count')).toHaveTextContent(
        '0'
      );
    });
  });

  describe('active state', () => {
    it('marks the active item with aria-current', () => {
      render(<SidebarMenuItem label="Dashboard" active />);

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-current',
        'page'
      );
    });

    it('leaves aria-current off when inactive', () => {
      render(<SidebarMenuItem label="Dashboard" />);

      expect(screen.getByRole('button')).not.toHaveAttribute('aria-current');
    });

    it('uses the theme palette by default', () => {
      render(<SidebarMenuItem label="Dashboard" active />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-50');
      expect(button).toHaveClass('text-primary-700');
    });

    it('uses the fixed blue palette when activeTone is info', () => {
      render(<SidebarMenuItem label="Dashboard" active activeTone="info" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-info-background');
      expect(button).toHaveClass('text-info-800');
      expect(button).not.toHaveClass('bg-primary-50');
    });

    it('ignores activeTone while inactive', () => {
      render(<SidebarMenuItem label="Dashboard" activeTone="info" />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-info-background');
      expect(button).toHaveClass('text-text-950');
    });

    it('uses the literal Figma blue when activeTone is blue', () => {
      render(<SidebarMenuItem label="Dashboard" active activeTone="blue" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#EBF2FE]');
      expect(button).toHaveClass('text-[#1A56DB]');
      expect(button).not.toHaveClass('bg-primary-50');
    });

    it('does not paint the blue tone while inactive', () => {
      render(<SidebarMenuItem label="Dashboard" activeTone="blue" />);

      expect(screen.getByRole('button')).not.toHaveClass('bg-[#EBF2FE]');
    });

    it('applies the muted color to an inactive sub item', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" />);

      expect(screen.getByRole('button')).toHaveClass('text-text-600');
    });

    it('applies the active color to a sub item', () => {
      render(<SidebarMenuItem label="Dashboard" variant="sub" active />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-50');
      expect(button).toHaveClass('text-primary-700');
    });
  });
});
