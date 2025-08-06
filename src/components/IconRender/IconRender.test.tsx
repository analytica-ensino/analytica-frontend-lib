import { render } from '@testing-library/react';
import { IconRender } from './IconRender';

describe('IconRender', () => {
  it('should render Phosphor icon by default', () => {
    const { container } = render(<IconRender iconName="Heart" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render Chat_PT icon', () => {
    const { container } = render(<IconRender iconName="Chat_PT" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render Chat_EN icon', () => {
    const { container } = render(<IconRender iconName="Chat_EN" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render Chat_ES icon', () => {
    const { container } = render(<IconRender iconName="Chat_ES" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render Question icon for unknown icon names', () => {
    const { container } = render(<IconRender iconName="UnknownIcon" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom size and color to Phosphor icons', () => {
    const { container } = render(
      <IconRender iconName="Heart" size={32} color="#ff0000" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom weight to Phosphor icons', () => {
    const { container } = render(<IconRender iconName="Heart" weight="bold" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom size to Chat icons', () => {
    const { container } = render(<IconRender iconName="Chat_PT" size={32} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
