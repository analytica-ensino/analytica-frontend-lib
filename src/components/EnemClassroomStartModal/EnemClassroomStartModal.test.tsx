import { render, screen, fireEvent } from '@testing-library/react';
import EnemClassroomStartModal from './EnemClassroomStartModal';
import type { EnemClassroomExam } from '../../types/enemClassroom';

jest.mock('../VideoPlayer/VideoPlayer', () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => (
    <div data-testid="video-player">Video: {src}</div>
  ),
}));

const exam: EnemClassroomExam = {
  id: 'exam-1',
  title: 'Simulado ENEM 2026',
  videoUrl: 'https://cdn.example.com/intro.mp4',
  durationMinutes: 300,
  languageChoice: true,
  surveyQuestions: [
    {
      id: 'q-university',
      position: 2,
      stepLabel: 'Universidade',
      prompt: 'E a universidade, já escolheu?',
      inputLabel: 'Se sim, escreva a sua universidade',
      inputPlaceholder: 'Escreva a universidade escolhida',
      skipLabel: 'Não, ainda estou pensando',
    },
    {
      id: 'q-course',
      position: 1,
      stepLabel: 'Curso',
      prompt: 'Você já tem o curso que quer fazer em mente?',
      inputLabel: 'Se sim, escreva o seu curso',
      inputPlaceholder: 'Escreva o curso',
      skipLabel: 'Não, ainda estou pensando',
    },
  ],
};

const setup = (
  overrides: Partial<Parameters<typeof EnemClassroomStartModal>[0]> = {}
) => {
  const onClose = jest.fn();
  const onStart = jest.fn();
  const utils = render(
    <EnemClassroomStartModal
      isOpen
      onClose={onClose}
      exam={exam}
      onStart={onStart}
      {...overrides}
    />
  );
  return { onClose, onStart, ...utils };
};

const goToLanguageStep = () =>
  fireEvent.click(screen.getByTestId('enem-classroom-intro-continue'));

const pickLanguage = (language: 'ingles' | 'espanhol') =>
  fireEvent.click(screen.getByTestId(`enem-classroom-language-${language}`));

const next = () => fireEvent.click(screen.getByTestId('enem-classroom-next'));

describe('EnemClassroomStartModal', () => {
  it('does not render when closed', () => {
    setup({ isOpen: false });

    expect(
      screen.queryByText('Simulação do ENEM em sala de aula!')
    ).not.toBeInTheDocument();
  });

  it('opens on the introduction with the video and the three warnings', () => {
    setup();

    expect(screen.getByTestId('video-player')).toHaveTextContent(
      'Video: https://cdn.example.com/intro.mp4'
    );
    expect(screen.getByText('Só vale em sala de aula')).toBeInTheDocument();
    expect(screen.getByText('O cronômetro liga na hora')).toBeInTheDocument();
    expect(screen.getByText('Não tem como desfazer')).toBeInTheDocument();
    // The introduction has its own button, not the Anterior/Próximo pair.
    expect(screen.queryByTestId('enem-classroom-next')).not.toBeInTheDocument();
  });

  it('shows the warnings without a player when the exam has no video', () => {
    setup({ exam: { ...exam, videoUrl: null } });

    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    expect(screen.getByText('Só vale em sala de aula')).toBeInTheDocument();
  });

  it('lists the survey questions in the stepper by position', () => {
    setup();

    const labels = screen
      .getAllByText(/Introdução|Língua estrangeira|Curso|Universidade/)
      .map((node) => node.textContent);
    expect(labels).toEqual([
      'Introdução',
      'Língua estrangeira',
      'Curso',
      'Universidade',
    ]);
  });

  it('only enables Próximo on the language step once a language is picked', () => {
    setup();
    goToLanguageStep();

    expect(
      screen.getByText('Qual língua estrangeira você vai usar na simulação?')
    ).toBeInTheDocument();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();

    pickLanguage('ingles');

    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();
  });

  it('asks the survey questions in order and requires text or skip', () => {
    setup();
    goToLanguageStep();
    pickLanguage('espanhol');
    next();

    // Position 1 comes first even though it is listed second in the payload.
    expect(
      screen.getByText('Você já tem o curso que quer fazer em mente?')
    ).toBeInTheDocument();
    // The field is there from the start; empty, it is not an answer.
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Escreva o curso'), {
      target: { value: '  Biologia ' },
    });
    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();
    next();

    expect(
      screen.getByText('E a universidade, já escolheu?')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();
  });

  it('lets the field and the skip box disable each other', () => {
    setup();
    goToLanguageStep();
    pickLanguage('espanhol');
    next();

    const field = screen.getByPlaceholderText('Escreva o curso');
    const skip = screen.getByTestId('enem-classroom-survey-skip');

    // Nothing answered: both live, and the step is held.
    expect(field).toBeEnabled();
    expect(skip).toBeEnabled();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();

    // Typing a course locks the skip box and releases the step.
    fireEvent.change(field, { target: { value: 'Biologia' } });
    expect(skip).toBeDisabled();
    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();

    // Clearing it hands the skip box back and holds the step again.
    fireEvent.change(field, { target: { value: '' } });
    expect(skip).toBeEnabled();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();

    // Ticking skip locks the field and releases the step.
    fireEvent.click(skip);
    expect(field).toBeDisabled();
    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();

    fireEvent.click(skip);
    expect(field).toBeEnabled();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();
  });

  // Both survey steps carry an illustration, keyed by position. That the two
  // images differ cannot be asserted here: moduleNameMapper stubs every image
  // import with the same string, so the srcs are identical under jest.
  it('illustrates every survey step', () => {
    setup();
    goToLanguageStep();
    pickLanguage('espanhol');
    next();

    expect(
      screen.getByTestId('enem-classroom-survey-illustration')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();

    expect(
      screen.getByTestId('enem-classroom-survey-illustration')
    ).toBeInTheDocument();
  });

  it('whitespace alone is not an answer', () => {
    setup();
    goToLanguageStep();
    pickLanguage('espanhol');
    next();

    fireEvent.change(screen.getByPlaceholderText('Escreva o curso'), {
      target: { value: '   ' },
    });

    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();
    expect(screen.getByTestId('enem-classroom-survey-skip')).toBeEnabled();
  });

  it('summarises the answers and starts with the trimmed payload', () => {
    const { onStart } = setup();
    goToLanguageStep();
    pickLanguage('espanhol');
    next();
    fireEvent.change(screen.getByPlaceholderText('Escreva o curso'), {
      target: { value: '  Biologia ' },
    });
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();

    expect(screen.getByText('Boa sorte!')).toBeInTheDocument();
    expect(screen.getByText('Espanhol')).toBeInTheDocument();
    expect(screen.getByText('Biologia')).toBeInTheDocument();
    expect(screen.getByText('Não, ainda estou pensando')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('enem-classroom-start'));

    expect(onStart).toHaveBeenCalledWith({
      language: 'ESPANHOL',
      surveyAnswers: [
        { questionId: 'q-course', answer: 'Biologia' },
        { questionId: 'q-university', answer: null },
      ],
    });
  });

  it('skips the language step on an exam without the choice and starts with no language', () => {
    const { onStart } = setup({ exam: { ...exam, languageChoice: false } });

    // The stepper lists only the introduction and the survey.
    expect(screen.queryByText('Língua estrangeira')).not.toBeInTheDocument();
    expect(screen.getByText('Curso')).toBeInTheDocument();

    goToLanguageStep();

    // Straight to the first survey question, with the navigation.
    expect(
      screen.queryByTestId('enem-classroom-language')
    ).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escreva o curso')).toBeInTheDocument();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();

    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();

    expect(screen.getByText('Boa sorte!')).toBeInTheDocument();
    expect(screen.queryByText('Idioma')).not.toBeInTheDocument();

    // Review lands on the first survey question, since there is no language step.
    fireEvent.click(screen.getByTestId('enem-classroom-review'));
    expect(screen.getByPlaceholderText('Escreva o curso')).toBeInTheDocument();
    next();
    next();

    fireEvent.click(screen.getByTestId('enem-classroom-start'));
    expect(onStart).toHaveBeenCalledWith({
      language: null,
      surveyAnswers: [
        { questionId: 'q-course', answer: null },
        { questionId: 'q-university', answer: null },
      ],
    });
  });

  it('goes back to the language step from the summary keeping the answers', () => {
    setup();
    goToLanguageStep();
    pickLanguage('ingles');
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();

    fireEvent.click(screen.getByTestId('enem-classroom-review'));

    expect(
      screen.getByText('Qual língua estrangeira você vai usar na simulação?')
    ).toBeInTheDocument();
    expect(screen.getByTestId('enem-classroom-language-ingles')).toBeChecked();
    expect(screen.getByTestId('enem-classroom-next')).toBeEnabled();
  });

  it('walks back one step with Anterior', () => {
    setup();
    goToLanguageStep();
    fireEvent.click(screen.getByTestId('enem-classroom-previous'));

    expect(screen.getByText('Só vale em sala de aula')).toBeInTheDocument();
  });

  it('disables the start buttons while starting', () => {
    setup({ isStarting: true });
    goToLanguageStep();
    pickLanguage('ingles');
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();
    fireEvent.click(screen.getByTestId('enem-classroom-survey-skip'));
    next();

    expect(screen.getByTestId('enem-classroom-start')).toBeDisabled();
    expect(screen.getByTestId('enem-classroom-review')).toBeDisabled();
  });

  it('resets to the introduction every time it reopens', () => {
    const { rerender } = setup();
    goToLanguageStep();
    pickLanguage('ingles');

    rerender(
      <EnemClassroomStartModal
        isOpen={false}
        onClose={jest.fn()}
        exam={exam}
        onStart={jest.fn()}
      />
    );
    rerender(
      <EnemClassroomStartModal
        isOpen
        onClose={jest.fn()}
        exam={exam}
        onStart={jest.fn()}
      />
    );

    expect(screen.getByText('Só vale em sala de aula')).toBeInTheDocument();
    goToLanguageStep();
    expect(screen.getByTestId('enem-classroom-next')).toBeDisabled();
  });
});
