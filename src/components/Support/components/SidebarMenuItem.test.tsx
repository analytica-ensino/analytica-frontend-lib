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
