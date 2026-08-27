import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubjectBadgeList } from './SubjectBadgeList';
import { SubjectEnum } from '../../enums/SubjectEnum';

jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: (subject: string) => ({
    colorClass: 'bg-subject-1',
    icon: <span data-testid={`icon-${subject}`}>i</span>,
  }),
}));

const mapSubjectNameToEnum = (name: string) =>
  name === 'Biologia'
    ? SubjectEnum.BIOLOGIA
    : name === 'Física'
      ? SubjectEnum.FISICA
      : null;

describe('SubjectBadgeList', () => {
  describe('when there are no subjects', () => {
    it('should render nothing by default', () => {
      const { container } = render(<SubjectBadgeList subjects={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render a dash when showEmptyDash is set', () => {
      const { container } = render(
        <SubjectBadgeList subjects={[]} showEmptyDash />
      );
      expect(container.textContent).toBe('-');
    });
  });

  it('should render every subject when they fit', () => {
    render(
      <SubjectBadgeList
        subjects={['Biologia', 'Física']}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
      />
    );

    expect(screen.getByText('Biologia')).toBeInTheDocument();
    expect(screen.getByText('Física')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('should render the subject icon when the name maps to a known subject', () => {
    render(
      <SubjectBadgeList
        subjects={['Biologia']}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
      />
    );

    expect(
      screen.getByTestId(`icon-${SubjectEnum.BIOLOGIA}`)
    ).toBeInTheDocument();
  });

  it('should render an unmapped subject as plain text', () => {
    render(
      <SubjectBadgeList
        subjects={['Matéria Nova']}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
      />
    );

    expect(screen.getByText('Matéria Nova')).toBeInTheDocument();
  });

  describe('overflow', () => {
    it('should collapse the subjects beyond maxVisible into a +N badge', () => {
      render(
        <SubjectBadgeList
          subjects={['Biologia', 'Física', 'História']}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      );

      expect(screen.getByText('Biologia')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
      expect(screen.queryByText('História')).not.toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should honour a custom maxVisible', () => {
      render(
        <SubjectBadgeList
          subjects={['Biologia', 'Física', 'História']}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
          maxVisible={1}
        />
      );

      expect(screen.getByText('Biologia')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should name the hidden subjects on hover', async () => {
      const user = userEvent.setup();

      render(
        <SubjectBadgeList
          subjects={['Biologia', 'Física', 'História', 'Geografia']}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      );

      const overflowChip = screen.getByText('+2');
      await user.hover(overflowChip.parentElement as HTMLElement);

      expect(
        await screen.findByText('História, Geografia')
      ).toBeInTheDocument();
    });
  });
});
