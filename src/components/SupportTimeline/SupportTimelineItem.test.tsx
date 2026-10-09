import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportTimelineItem from './SupportTimelineItem';
import {
  SUPPORT_TIMELINE_STATUS,
  type SupportTimelineStatus,
} from '../../types/supportTimeline';

describe('SupportTimelineItem', () => {
  it.each<[SupportTimelineStatus, string, string]>([
    [SUPPORT_TIMELINE_STATUS.OPEN, 'Aberto', 'bg-info-500'],
    [SUPPORT_TIMELINE_STATUS.HUMAN, 'Humano', 'bg-warning-500'],
    [
      SUPPORT_TIMELINE_STATUS.IN_PROGRESS,
      'Em progresso',
      'bg-indicator-positive',
    ],
    [SUPPORT_TIMELINE_STATUS.DONE, 'Concluído', 'bg-success-500'],
  ])(
    'renders %s with its default label and dot color',
    (status, label, dot) => {
      render(<SupportTimelineItem status={status} time="13:41" />);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId('support-timeline-dot')).toHaveClass(dot);
    }
  );

  it('renders the time in a time element', () => {
    render(
      <SupportTimelineItem status={SUPPORT_TIMELINE_STATUS.OPEN} time="13:41" />
    );

    const time = screen.getByText('13:41');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveClass('text-text-600');
  });

  it('uses a custom label when provided', () => {
    render(
      <SupportTimelineItem
        status={SUPPORT_TIMELINE_STATUS.HUMAN}
        time="13:41"
        label="Transferido para atendente"
      />
    );

    expect(screen.getByText('Transferido para atendente')).toBeInTheDocument();
    expect(screen.queryByText('Humano')).not.toBeInTheDocument();
  });

  it('merges a custom className on the root', () => {
    const { container } = render(
      <SupportTimelineItem
        status={SUPPORT_TIMELINE_STATUS.DONE}
        time="13:41"
        className="mt-4"
      />
    );

    expect(container.firstChild).toHaveClass('mt-4', 'flex');
  });

  it('hides the decorative dot from assistive technologies', () => {
    render(
      <SupportTimelineItem status={SUPPORT_TIMELINE_STATUS.OPEN} time="13:41" />
    );

    expect(screen.getByTestId('support-timeline-dot')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});
