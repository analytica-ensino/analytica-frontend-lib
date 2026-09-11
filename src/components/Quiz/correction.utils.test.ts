import { resolveCorrectionText } from './correction.utils';
import { CORRECTION_SOURCE } from './useQuizStore';

describe('resolveCorrectionText', () => {
  it('shows the AI text while the teacher has not reviewed it', () => {
    expect(
      resolveCorrectionText({
        teacherFeedback: null,
        aiFeedback: 'Faltou citar a clorofila.',
        correctionSource: CORRECTION_SOURCE.IA,
      })
    ).toBe('Faltou citar a clorofila.');
  });

  it('shows the teacher text once they have reviewed the AI correction', () => {
    expect(
      resolveCorrectionText({
        teacherFeedback: 'Na verdade está correto.',
        aiFeedback: 'Faltou citar a clorofila.',
        correctionSource: CORRECTION_SOURCE.IA_PROFESSOR,
      })
    ).toBe('Na verdade está correto.');
  });

  it('keeps a reviewed correction cleared when the teacher emptied it on purpose', () => {
    // O endpoint de correção aceita `teacherFeedback` vazio, então apagar e
    // salvar grava ''. Voltar para o texto da IA aqui desfaria a exclusão — e a
    // próxima gravação escreveria o texto da IA na coluna do professor.
    expect(
      resolveCorrectionText({
        teacherFeedback: '',
        aiFeedback: 'Faltou citar a clorofila.',
        correctionSource: CORRECTION_SOURCE.IA_PROFESSOR,
      })
    ).toBe('');
  });

  it('keeps the teacher text when no AI was involved', () => {
    expect(
      resolveCorrectionText({
        teacherFeedback: 'Atenção ao enunciado.',
        aiFeedback: null,
        correctionSource: CORRECTION_SOURCE.PROFESSOR,
      })
    ).toBe('Atenção ao enunciado.');
  });

  it('keeps a plain comment on an answer with no correction source', () => {
    // Questão objetiva, ou dissertativa que a IA nunca tocou: o professor
    // comentou sem corrigir, e `correctionSource` segue nulo.
    expect(
      resolveCorrectionText({
        teacherFeedback: 'Reveja o gráfico.',
        aiFeedback: null,
        correctionSource: null,
      })
    ).toBe('Reveja o gráfico.');
  });

  it('returns an empty string when there is nothing to show', () => {
    expect(resolveCorrectionText({})).toBe('');
    expect(
      resolveCorrectionText({ correctionSource: CORRECTION_SOURCE.IA })
    ).toBe('');
  });
});
