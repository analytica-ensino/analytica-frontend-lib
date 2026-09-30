import * as entry from './index';
import { StudentModal } from './StudentModal';
import { StudentAnswers } from './StudentAnswers';

describe('enem-moment-student-modal entry', () => {
  it('exposes the modal, its answers and the helpers behind its tiles', () => {
    expect(entry.StudentModal).toBe(StudentModal);
    expect(entry.StudentAnswers).toBe(StudentAnswers);
    expect(typeof entry.buildStudentTiles).toBe('function');
    expect(typeof entry.tookMoment).toBe('function');
  });
});
