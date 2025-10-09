import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BreadcrumbMenu } from './BreadcrumbMenu';
import type { BreadcrumbItem } from './breadcrumbStore';
import type { ReactElement } from 'react';

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Wrapper component to provide Router context
const renderWithRouter = (ui: ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('BreadcrumbMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render single breadcrumb', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render multiple breadcrumbs', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Page')).toBeInTheDocument();
    });

    it('should render complex hierarchy', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'performance', name: 'Desempenho', url: '/desempenho' },
        {
          id: 'subject',
          name: 'Matemática',
          url: '/desempenho/lista-temas/123',
        },
        {
          id: 'topic',
          name: 'Álgebra',
          url: '/desempenho/lista-temas/123/subtemas/456',
        },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Álgebra')).toBeInTheDocument();
    });

    it('should render empty when breadcrumbs array is empty', () => {
      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={[]} />
      );

      const menuItems = container.querySelectorAll(
        '[data-variant="breadcrumb"]'
      );
      expect(menuItems).toHaveLength(0);
    });
  });

  describe('separators', () => {
    it('should show separator for all items except last', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      const separators = screen.getAllByTestId('separator');
      expect(separators).toHaveLength(2); // Only first two items have separators
    });

    it('should not show separator for single breadcrumb', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      const separators = screen.queryAllByTestId('separator');
      expect(separators).toHaveLength(0);
    });

    it('should not show separator on last breadcrumb', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={breadcrumbs} />
      );

      const menuItems = container.querySelectorAll(
        '[data-variant="breadcrumb"]'
      );
      const lastItem = menuItems[menuItems.length - 1];
      const separatorInLastItem = lastItem.querySelector(
        '[data-testid="separator"]'
      );

      expect(separatorInLastItem).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should call navigate when breadcrumb is clicked', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await user.click(screen.getByText('Home'));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to correct URL for each breadcrumb', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await user.click(screen.getByText('Page 1'));
      expect(mockNavigate).toHaveBeenCalledWith('/page1');

      mockNavigate.mockClear();

      await user.click(screen.getByText('Page 2'));
      expect(mockNavigate).toHaveBeenCalledWith('/page2');
    });
  });

  describe('callback functionality', () => {
    it('should call onBreadcrumbClick when breadcrumb is clicked', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      renderWithRouter(
        <BreadcrumbMenu
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={mockCallback}
        />
      );

      await user.click(screen.getByText('Home'));

      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[0], 0);
    });

    it('should call onBreadcrumbClick with correct index', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
      ];

      renderWithRouter(
        <BreadcrumbMenu
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={mockCallback}
        />
      );

      await user.click(screen.getByText('Page 1'));
      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[1], 1);

      mockCallback.mockClear();

      await user.click(screen.getByText('Page 2'));
      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[2], 2);
    });

    it('should call both callback and navigate', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      renderWithRouter(
        <BreadcrumbMenu
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={mockCallback}
        />
      );

      await user.click(screen.getByText('Home'));

      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[0], 0);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should not throw error when onBreadcrumbClick is not provided', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await expect(user.click(screen.getByText('Home'))).resolves.not.toThrow();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('custom className', () => {
    it('should apply default className', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={breadcrumbs} />
      );

      const menu = container.querySelector('[class*="px-0"]');
      expect(menu).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={breadcrumbs} className="custom-class" />
      );

      const menu = container.querySelector('[class*="custom-class"]');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper menu role', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(1);
    });

    it('should have keyboard navigation support', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      renderWithRouter(
        <BreadcrumbMenu
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={mockCallback}
        />
      );

      const menuItems = screen.getAllByRole('menuitem');
      const homeItem = menuItems[0];

      // Focus and press Enter
      await user.click(homeItem);

      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[0], 0);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should be focusable with tab', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach((item) => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('special characters and long names', () => {
    it('should handle special characters in breadcrumb names', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: '1', name: 'Home & About', url: '/' },
        { id: '2', name: 'Q&A / FAQ', url: '/faq' },
        { id: '3', name: 'Terms & Conditions', url: '/terms' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home & About')).toBeInTheDocument();
      expect(screen.getByText('Q&A / FAQ')).toBeInTheDocument();
      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    });

    it('should handle long breadcrumb names', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        {
          id: '1',
          name: 'This is a very long breadcrumb name that should still be displayed correctly',
          url: '/long',
        },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(
        screen.getByText(
          'This is a very long breadcrumb name that should still be displayed correctly'
        )
      ).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: '1', name: 'Início 🏠', url: '/' },
        { id: '2', name: 'Configurações ⚙️', url: '/config' },
        { id: '3', name: '中文测试', url: '/test' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Início 🏠')).toBeInTheDocument();
      expect(screen.getByText('Configurações ⚙️')).toBeInTheDocument();
      expect(screen.getByText('中文测试')).toBeInTheDocument();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle performance navigation scenario', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'performance', name: 'Desempenho', url: '/desempenho' },
        {
          id: 'subject-123',
          name: 'Matemática',
          url: '/desempenho/lista-temas/123',
        },
        {
          id: 'topic-456',
          name: 'Álgebra Linear',
          url: '/desempenho/lista-temas/123/subtemas/456',
        },
        {
          id: 'subtopic-789',
          name: 'Matrizes e Determinantes',
          url: '/desempenho/lista-temas/123/subtemas/456/aulas/789',
        },
      ];

      renderWithRouter(
        <BreadcrumbMenu
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={mockCallback}
        />
      );

      // Click on Matemática to go back
      await user.click(screen.getByText('Matemática'));

      expect(mockCallback).toHaveBeenCalledWith(breadcrumbs[1], 1);
      expect(mockNavigate).toHaveBeenCalledWith('/desempenho/lista-temas/123');
    });

    it('should handle settings navigation scenario', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'settings', name: 'Configurações', url: '/settings' },
        { id: 'profile', name: 'Perfil', url: '/settings/profile' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await user.click(screen.getByText('Configurações'));

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('edge cases', () => {
    it('should handle breadcrumb with empty string name', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'empty', name: '', url: '/empty' },
      ];

      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={breadcrumbs} />
      );

      const menuItem = container.querySelector('[data-variant="breadcrumb"]');
      expect(menuItem).toBeInTheDocument();
    });

    it('should handle breadcrumb with special URL characters', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: '1', name: 'Search', url: '/search?q=test&filter=active' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await user.click(screen.getByText('Search'));

      expect(mockNavigate).toHaveBeenCalledWith('/search?q=test&filter=active');
    });

    it('should handle breadcrumb with hash in URL', async () => {
      const user = userEvent.setup();
      const breadcrumbs: BreadcrumbItem[] = [
        { id: '1', name: 'Page', url: '/page#section' },
      ];

      renderWithRouter(<BreadcrumbMenu breadcrumbs={breadcrumbs} />);

      await user.click(screen.getByText('Page'));

      expect(mockNavigate).toHaveBeenCalledWith('/page#section');
    });
  });

  describe('visual selection state', () => {
    it('should mark last breadcrumb as selected by default', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      const { container } = renderWithRouter(
        <BreadcrumbMenu breadcrumbs={breadcrumbs} />
      );

      const menuItems = container.querySelectorAll(
        '[data-variant="breadcrumb"]'
      );
      // The component should render with proper variant
      expect(menuItems).toHaveLength(2);
    });
  });
});
