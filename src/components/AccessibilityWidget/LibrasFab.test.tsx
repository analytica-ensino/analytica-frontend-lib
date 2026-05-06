import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import LibrasFab from './LibrasFab';

describe('LibrasFab', () => {
  it('renders with the libras label and accessible role', () => {
    render(<LibrasFab onClick={() => undefined} />);
    const btn = screen.getByRole('button', {
      name: /tradução em libras/i,
    });
    expect(btn).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<LibrasFab onClick={onClick} />);
    await userEvent.click(screen.getByTestId('libras-fab'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['right', /right-0/, /rounded-l-lg/],
    ['left', /left-0/, /rounded-r-lg/],
  ] as const)(
    'applies position classes for %s',
    (position, edgeClass, roundedClass) => {
      render(<LibrasFab onClick={() => undefined} position={position} />);
      const btn = screen.getByTestId('libras-fab');
      expect(btn.className).toMatch(edgeClass);
      expect(btn.className).toMatch(roundedClass);
    }
  );
});
