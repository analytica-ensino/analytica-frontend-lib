import { renderFromMap } from './questionRenderer';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

describe('renderFromMap', () => {
  it('returns null when questionType is undefined', () => {
    const result = renderFromMap(
      {
        [QUESTION_TYPE.ALTERNATIVA]: () => 'alt',
        [QUESTION_TYPE.MULTIPLA_ESCOLHA]: () => 'multi',
        [QUESTION_TYPE.DISSERTATIVA]: () => 'disc',
        [QUESTION_TYPE.VERDADEIRO_FALSO]: () => 'vf',
        [QUESTION_TYPE.LIGAR_PONTOS]: () => 'ligar',
        [QUESTION_TYPE.PREENCHER]: () => 'fill',
        [QUESTION_TYPE.IMAGEM]: () => 'img',
      },
      undefined
    );

    expect(result).toBeNull();
  });

  it('invokes renderer for provided type', () => {
    const renderer = jest.fn(() => 'rendered');

    const result = renderFromMap(
      {
        [QUESTION_TYPE.ALTERNATIVA]: renderer,
        [QUESTION_TYPE.MULTIPLA_ESCOLHA]: () => 'multi',
        [QUESTION_TYPE.DISSERTATIVA]: () => 'disc',
        [QUESTION_TYPE.VERDADEIRO_FALSO]: () => 'vf',
        [QUESTION_TYPE.LIGAR_PONTOS]: () => 'ligar',
        [QUESTION_TYPE.PREENCHER]: () => 'fill',
        [QUESTION_TYPE.IMAGEM]: () => 'img',
      },
      QUESTION_TYPE.ALTERNATIVA
    );

    expect(renderer).toHaveBeenCalled();
    expect(result).toBe('rendered');
  });
});
