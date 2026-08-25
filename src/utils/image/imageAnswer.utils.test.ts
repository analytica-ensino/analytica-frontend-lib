import {
  DEFAULT_IMAGE_TOLERANCE,
  parseImageCorrectPoint,
  parseImageStudentPoint,
} from './imageAnswer.utils';
import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';

type Answer = QuestionResult['answers'][number];

describe('imageAnswer.utils', () => {
  it('should default the tolerance to the value the backend grades with', () => {
    expect(DEFAULT_IMAGE_TOLERANCE).toBe(10);
  });

  describe('parseImageCorrectPoint', () => {
    it('should read the answer key from the first option', () => {
      const options = [
        { id: 'opt1', option: '{"x":50,"y":30}' },
      ] as Question['options'];

      expect(parseImageCorrectPoint(options)).toEqual({ x: 50, y: 30 });
    });

    it('should return null without a usable option', () => {
      expect(parseImageCorrectPoint(undefined)).toBeNull();
      expect(parseImageCorrectPoint([] as Question['options'])).toBeNull();
      expect(
        parseImageCorrectPoint([
          { id: 'opt1', option: '' },
        ] as Question['options'])
      ).toBeNull();
    });

    it('should return null when the option is not a coordinate', () => {
      expect(
        parseImageCorrectPoint([
          { id: 'opt1', option: 'Alternativa A' },
        ] as Question['options'])
      ).toBeNull();
      expect(
        parseImageCorrectPoint([
          { id: 'opt1', option: '{"x":"50","y":30}' },
        ] as Question['options'])
      ).toBeNull();
      expect(
        parseImageCorrectPoint([
          { id: 'opt1', option: 'null' },
        ] as Question['options'])
      ).toBeNull();
    });
  });

  describe('parseImageStudentPoint', () => {
    it('should prefer the structured imageAnswer', () => {
      const result = {
        imageAnswer: { coordinateX: 52, coordinateY: 28 },
        answer: '{"x":1,"y":1}',
      } as Answer;

      expect(parseImageStudentPoint(result)).toEqual({ x: 52, y: 28 });
    });

    it('should fall back to the raw answer in either shape', () => {
      expect(
        parseImageStudentPoint({ answer: '{"x":52,"y":28}' } as Answer)
      ).toEqual({ x: 52, y: 28 });
      expect(
        parseImageStudentPoint({
          answer: '{"coordinateX":52,"coordinateY":28}',
        } as Answer)
      ).toEqual({ x: 52, y: 28 });
    });

    it('should return null without a result or an answer', () => {
      expect(parseImageStudentPoint(undefined)).toBeNull();
      expect(parseImageStudentPoint(null)).toBeNull();
      expect(parseImageStudentPoint({ answer: null } as Answer)).toBeNull();
    });

    it('should return null on a malformed or incomplete answer', () => {
      expect(
        parseImageStudentPoint({ answer: 'not json' } as Answer)
      ).toBeNull();
      expect(
        parseImageStudentPoint({ answer: '{"invalid":"data"}' } as Answer)
      ).toBeNull();
      expect(
        parseImageStudentPoint({ answer: '{"x":52}' } as Answer)
      ).toBeNull();
    });

    it('should ignore an imageAnswer whose coordinates are not numbers', () => {
      const result = {
        imageAnswer: { coordinateX: '52', coordinateY: 28 },
        answer: null,
      } as unknown as Answer;

      expect(parseImageStudentPoint(result)).toBeNull();
    });

    it('should keep a zero coordinate', () => {
      expect(
        parseImageStudentPoint({
          imageAnswer: { coordinateX: 0, coordinateY: 0 },
        } as Answer)
      ).toEqual({ x: 0, y: 0 });
    });
  });
});
