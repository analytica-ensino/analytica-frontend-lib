import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import { ANSWER_STATUS, type QuestionResult } from '../Quiz/useQuizStore';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/csr/MinusCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';

type Answer = QuestionResult['answers'][number];

export interface AnswerKeyModalProps {
  /** Respostas do aluno, na ordem da prova. */
  answers: Answer[];
  onClose: () => void;
}

/** Letras das alternativas, na ordem em que as opções foram cadastradas. */
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Como cada estado da correção se apresenta na linha.
 *
 * O `Record` sobre o enum é proposital: um estado novo em `ANSWER_STATUS` vira
 * erro de compilação aqui, em vez de cair silenciosamente num "incorreta".
 *
 * Em branco tem tratamento próprio, e não vermelho, porque numa prova de papel
 * ele é o sintoma de uma bolha que a leitura óptica não reconheceu — é
 * justamente o que o aluno abre este modal para descobrir.
 */
const STATUS_PRESENTATION: Record<
  ANSWER_STATUS,
  {
    label: string;
    Icon: typeof CheckCircleIcon;
    iconClass: string;
    /** Cor da bolha marcada; vazia quando o estado não julga a resposta. */
    bubbleClass: string;
  }
> = {
  [ANSWER_STATUS.RESPOSTA_CORRETA]: {
    label: 'correta',
    Icon: CheckCircleIcon,
    iconClass: 'text-success-600',
    bubbleClass: 'bg-success-200 border-success-300 text-text-900',
  },
  [ANSWER_STATUS.RESPOSTA_INCORRETA]: {
    label: 'incorreta',
    Icon: XCircleIcon,
    iconClass: 'text-error-600',
    bubbleClass: 'bg-error-200 border-error-300 text-text-900',
  },
  [ANSWER_STATUS.NAO_RESPONDIDO]: {
    label: 'em branco',
    Icon: MinusCircleIcon,
    iconClass: 'text-text-400',
    bubbleClass: 'bg-background-100 border-border-300 text-text-900',
  },
  [ANSWER_STATUS.PENDENTE_AVALIACAO]: {
    label: 'aguardando correção',
    Icon: ClockIcon,
    iconClass: 'text-info-600',
    bubbleClass: 'bg-info-background border-info-300 text-text-900',
  },
};

/**
 * Posição da alternativa que o aluno marcou.
 *
 * A letra não é gravada: ela é a posição da opção na questão — a mesma regra
 * que a leitura óptica usa para transformar a bolha preenchida em resposta.
 *
 * @param answer - Resposta do aluno a uma questão
 * @returns O índice marcado, ou -1 quando ficou em branco
 */
const selectedIndex = (answer: Answer): number => {
  const selected = answer.selectedOptions?.[0]?.optionId;
  if (!selected || !answer.options) return -1;
  return answer.options.findIndex((option) => option.id === selected);
};

/**
 * Uma linha do gabarito: o número da questão, as cinco bolhas e o veredito.
 *
 * @param answer - Resposta do aluno
 * @param sequence - Número da questão na prova
 * @returns JSX da linha
 */
const AnswerRow = ({
  answer,
  sequence,
}: {
  answer: Answer;
  sequence: number;
}) => {
  const marked = selectedIndex(answer);
  const presentation =
    STATUS_PRESENTATION[answer.answerStatus] ??
    STATUS_PRESENTATION[ANSWER_STATUS.NAO_RESPONDIDO];
  const { Icon } = presentation;

  return (
    <li className="flex items-center gap-3 border border-border-100 rounded-lg px-3 py-2">
      <span className="w-6 h-6 shrink-0 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center">
        {sequence}
      </span>

      <span className="flex items-center gap-1 flex-1">
        {LETTERS.map((letter, index) => {
          const isMarked = index === marked;
          const tone = isMarked
            ? presentation.bubbleClass
            : 'border-border-200 text-text-600';
          return (
            <span
              key={letter}
              aria-hidden={!isMarked}
              className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center ${tone}`}
            >
              {letter}
            </span>
          );
        })}
      </span>

      <Icon
        size={18}
        className={`${presentation.iconClass} shrink-0`}
        aria-label={`Questão ${sequence}: ${presentation.label}`}
      />
    </li>
  );
};

/**
 * O gabarito como o aluno o preencheu no papel.
 *
 * Mostra a bolha que a leitura óptica reconheceu em cada questão — é assim que
 * ele confere se o que foi lido bate com o que ele marcou, coisa que numa
 * prova impressa não dá para ver de outro jeito.
 *
 * @param answers - Respostas do aluno, na ordem da prova
 * @param onClose - Fecha o modal
 * @returns JSX do modal do gabarito
 */
const AnswerKeyModal = ({ answers, onClose }: AnswerKeyModalProps) => (
  <Modal isOpen onClose={onClose} title="Gabarito" size="xl">
    <div className="flex flex-col gap-3">
      <Text size="sm" weight="bold" color="text-text-950">
        Respostas
      </Text>
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {answers.map((answer, index) => (
          <AnswerRow
            key={answer.questionId}
            answer={answer}
            sequence={index + 1}
          />
        ))}
      </ul>
    </div>
  </Modal>
);

export default AnswerKeyModal;
