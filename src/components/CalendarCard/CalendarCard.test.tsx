import type { ComponentProps } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarCard from './CalendarCard';
import { DeviceType, useMobile } from '../../hooks/useMobile';

jest.mock('../../hooks/useMobile');
const mockUseMobile = useMobile as jest.MockedFunction<typeof useMobile>;

const makeUseMobileMock = (
  overrides?: Partial<ReturnType<typeof useMobile>>
) => ({
  isMobile: false,
  isTablet: false,
  isSmallMobile: false,
  isExtraSmallMobile: false,
  isUltraSmallMobile: false,
  isTinyMobile: false,
  getFormContainerClasses: jest.fn(() => 'w-full max-w-[992px] mx-auto px-0'),
  getHeaderClasses: jest.fn(
    () => 'flex flex-row justify-between items-center gap-6 mb-8'
  ),
  getMobileHeaderClasses: jest.fn(() => 'flex flex-col items-start gap-4 mb-6'),
  getDesktopHeaderClasses: jest.fn(
    () => 'flex flex-row justify-between items-center gap-6 mb-8'
  ),
  getVideoContainerClasses: jest.fn(() => 'aspect-video'),
  getDeviceType: jest.fn(() => 'desktop' as DeviceType),
  ...overrides,
});

const renderCalendarCard = (
  props: Partial<ComponentProps<typeof CalendarCard>> = {}
) =>
  render(
    <CalendarCard
      content={<div data-testid="calendar-content">calendar</div>}
      {...props}
    />
  );

describe('CalendarCard', () => {
  beforeEach(() => {
    mockUseMobile.mockReturnValue(makeUseMobileMock());
  });

  describe('on tablet/desktop (isMobile=false)', () => {
    it('renders the trigger button without opening any surface initially', () => {
      renderCalendarCard();
      // Trigger button exists
      const trigger = screen.getByRole('button', { name: /botão de ação/i });
      expect(trigger).toBeInTheDocument();
      // Content is not visible (dropdown closed by default)
      expect(screen.queryByTestId('calendar-content')).not.toBeInTheDocument();
    });

    it('opens the dropdown when the trigger is clicked (uncontrolled)', () => {
      renderCalendarCard();
      const trigger = screen.getAllByRole('button')[0];
      fireEvent.click(trigger);
      expect(screen.getByTestId('calendar-content')).toBeInTheDocument();
    });

    it('respects the controlled isOpen prop', () => {
      const { rerender } = render(
        <CalendarCard
          content={<div data-testid="calendar-content">calendar</div>}
          isOpen={false}
          onOpenChange={() => undefined}
        />
      );
      expect(screen.queryByTestId('calendar-content')).not.toBeInTheDocument();

      rerender(
        <CalendarCard
          content={<div data-testid="calendar-content">calendar</div>}
          isOpen={true}
          onOpenChange={() => undefined}
        />
      );
      expect(screen.getByTestId('calendar-content')).toBeInTheDocument();
    });

    it('calls onOpenChange when the user clicks the trigger', () => {
      const handleOpenChange = jest.fn();
      render(
        <CalendarCard
          content={<div data-testid="calendar-content">calendar</div>}
          isOpen={false}
          onOpenChange={handleOpenChange}
        />
      );
      const trigger = screen.getAllByRole('button')[0];
      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('on mobile (isMobile=true)', () => {
    beforeEach(() => {
      mockUseMobile.mockReturnValue(makeUseMobileMock({ isMobile: true }));
    });

    it('renders the trigger button and the modal is initially closed', () => {
      renderCalendarCard();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the modal when the trigger is clicked (uncontrolled)', () => {
      renderCalendarCard();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-content')).toBeInTheDocument();
    });

    it('renders the default modal title "Calendário"', () => {
      renderCalendarCard();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Calendário')).toBeInTheDocument();
    });

    it('honors the custom title prop', () => {
      renderCalendarCard({ title: 'Minha agenda' });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Minha agenda')).toBeInTheDocument();
    });

    it('closes the modal when the close button is pressed', () => {
      const handleOpenChange = jest.fn();
      renderCalendarCard({ onOpenChange: handleOpenChange });
      fireEvent.click(screen.getByRole('button'));
      // Modal close button has aria-label "Fechar modal"
      fireEvent.click(screen.getByLabelText('Fechar modal'));
      expect(handleOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('keeps the consumer in control when isOpen prop is provided', () => {
      const handleOpenChange = jest.fn();
      const { rerender } = render(
        <CalendarCard
          content={<div data-testid="calendar-content">calendar</div>}
          isOpen={true}
          onOpenChange={handleOpenChange}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <CalendarCard
          content={<div data-testid="calendar-content">calendar</div>}
          isOpen={false}
          onOpenChange={handleOpenChange}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
