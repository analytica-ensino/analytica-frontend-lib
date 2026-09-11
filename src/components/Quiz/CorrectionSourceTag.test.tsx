import { render, screen } from '@testing-library/react';
import CorrectionSourceTag from './CorrectionSourceTag';
import { AI_CORRECTION_STATUS, CORRECTION_SOURCE } from './useQuizStore';

describe('CorrectionSourceTag', () => {
  it.each([
    [CORRECTION_SOURCE.IA, 'Corrigido por IA'],
    [CORRECTION_SOURCE.IA_PROFESSOR, 'Corrigido por IA + Professor'],
    [CORRECTION_SOURCE.PROFESSOR, 'Corrigido por Professor'],
  ])('renders the badge for %s', (source, label) => {
    render(<CorrectionSourceTag correctionSource={source} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('announces the correction is under way while the AI has not finished', () => {
    render(
      <CorrectionSourceTag aiCorrectionStatus={AI_CORRECTION_STATUS.PENDING} />
    );

    expect(screen.getByText('Corrigindo com IA')).toBeInTheDocument();
  });

  it('prefers the settled source over the pending state', () => {
    // A row keeps `aiCorrectionStatus = DONE` after the verdict lands, but a
    // teacher may grade an answer whose AI correction is still running. What was
    // decided wins over what is still being attempted.
    render(
      <CorrectionSourceTag
        correctionSource={CORRECTION_SOURCE.PROFESSOR}
        aiCorrectionStatus={AI_CORRECTION_STATUS.PENDING}
      />
    );

    expect(screen.getByText('Corrigido por Professor')).toBeInTheDocument();
    expect(screen.queryByText('Corrigindo com IA')).not.toBeInTheDocument();
  });

  it.each([
    ['nothing was corrected and nothing is running', {}],
    [
      'the AI finished but wrote no source',
      {
        aiCorrectionStatus: AI_CORRECTION_STATUS.DONE,
      },
    ],
    [
      'the AI correction failed',
      {
        aiCorrectionStatus: AI_CORRECTION_STATUS.FAILED,
      },
    ],
  ])('renders nothing when %s', (_case, props) => {
    const { container } = render(<CorrectionSourceTag {...props} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('forwards the className so callers can place it', () => {
    const { container } = render(
      <CorrectionSourceTag
        correctionSource={CORRECTION_SOURCE.IA}
        className="mb-3"
      />
    );

    expect(container.firstChild).toHaveClass('mb-3');
  });
});
