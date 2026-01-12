import { render, screen } from '@testing-library/react';
import { renderSubjectCell } from './renderSubjectCell';
import { SubjectEnum } from '../enums/SubjectEnum';

// Mock SubjectInfo
jest.mock('../components/SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: () => ({
    colorClass: 'bg-blue-100',
    icon: <span data-testid="subject-icon">M</span>,
  }),
}));

describe('renderSubjectCell', () => {
  describe('when subjectName is empty', () => {
    it('should return null when showEmptyDash is false', () => {
      const result = renderSubjectCell('', undefined, false);
      expect(result).toBeNull();
    });

    it('should return dash when showEmptyDash is true', () => {
      const { container } = render(
        <>{renderSubjectCell('', undefined, true)}</>
      );
      expect(container.textContent).toBe('-');
    });
  });

  describe('when mapSubjectNameToEnum is not provided', () => {
    it('should render subject name as plain text', () => {
      render(<>{renderSubjectCell('Matemática', undefined, false)}</>);
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });

  describe('when mapSubjectNameToEnum returns null', () => {
    it('should render subject name as plain text', () => {
      const mockMap = jest.fn().mockReturnValue(null);
      render(<>{renderSubjectCell('Matemática', mockMap, false)}</>);
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(mockMap).toHaveBeenCalledWith('Matemática');
    });
  });

  describe('when mapSubjectNameToEnum returns a valid enum', () => {
    it('should render subject with icon', () => {
      const mockMap = jest.fn().mockReturnValue(SubjectEnum.MATEMATICA);
      render(<>{renderSubjectCell('Matemática', mockMap, false)}</>);
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByTestId('subject-icon')).toBeInTheDocument();
    });
  });
});
