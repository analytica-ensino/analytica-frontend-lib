import { buildLessonTrail } from './lessonTrail';

describe('buildLessonTrail', () => {
  it('returns every level in hierarchy order', () => {
    expect(
      buildLessonTrail({
        areaKnowledge: { id: 'a', name: 'Ciências da Natureza' },
        subject: { id: 's', name: 'Biologia', color: '#fff', icon: 'Leaf' },
        topic: { id: 't', name: 'Ecologia' },
        subtopic: { id: 'st', name: 'Ecossistemas' },
        content: { id: 'c', name: 'Preservação' },
      })
    ).toEqual([
      'Ciências da Natureza',
      'Biologia',
      'Ecologia',
      'Ecossistemas',
      'Preservação',
    ]);
  });

  it('skips missing and blank levels', () => {
    expect(
      buildLessonTrail({
        subject: { id: 's', name: 'Biologia', color: '#fff', icon: 'Leaf' },
        topic: { id: 't', name: '   ' },
      })
    ).toEqual(['Biologia']);
  });

  it('returns an empty list when the lesson has no hierarchy', () => {
    expect(buildLessonTrail({})).toEqual([]);
  });
});
