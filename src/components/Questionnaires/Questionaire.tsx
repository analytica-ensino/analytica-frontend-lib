import { CaretLeft, CaretRight, Clock, SquaresFour } from 'phosphor-react';
import Badge from '../Badge/Badge';
import {
  AlternativesList,
  HeaderAlternative,
} from '../Alternative/Alternative';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';

const Questionaire = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6">
      {children}
    </div>
  );
};

const QuestionaireTitle = () => {
  return (
    <div className="flex flex-row justify-center items-center relative p-2">
      <span className="flex flex-col gap-2">
        <p className="text-text-950 font-bold text-md">Enem</p>
        <p className="text-text-600 text-xs">
          {/* {currentQuestionIndex + 1} de {allQuestions.length} */}1 de 10
        </p>
      </span>

      <span className="absolute right-2">
        <Badge variant="outlined" action="info" iconLeft={<Clock />}>
          {/* {formatTime(timeElapsed)} */}
          00:00
        </Badge>
      </span>
    </div>
  );
};

const QuestionaireHeader = () => {
  return (
    <HeaderAlternative
      title="Questão 01"
      subTitle="Função horária"
      content="Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos."
    />
  );
};

const QuestionaireContent = ({
  children,
  type = 'Alternativas',
}: {
  children: React.ReactNode;
  type?: 'Alternativas' | 'Dissertativa';
}) => {
  return (
    <>
      <div className="px-4 pb-2 pt-6">
        <p className="font-bold text-lg text-text-950">{type}</p>
      </div>

      <div className="rounded-t-xl bg-background px-4 pt-4 pb-[80px] h-full flex flex-col gap-4 mb-auto">
        {children}
      </div>
    </>
  );
};

const QuestionaireAlternative = () => {
  return (
    <AlternativesList
      // key={`question-${currentQuestion.id}`}
      name={`question-1`}
      layout="default"
      alternatives={[
        { label: '25 metros', value: '25' },
        { label: '30 metros', value: '30' },
        { label: '40 metros', value: '40' },
        { label: '50 metros', value: '50' },
      ]}
      value={undefined}
      onValueChange={() => {}}
    />
  );
};

const QuestionaireFooter = () => {
  return (
    <footer className="w-full px-2 bg-background lg:max-w-[1000px] not-lg:max-w-[calc(100vw-32px)] border-t border-border-50 fixed bottom-0 min-h-[80px] flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-1">
        <IconButton
          icon={<SquaresFour size={24} className="text-text-950" />}
          size="md"
          // onClick={() => setModalOpen(true)}
        />
        <Button
          size="medium"
          variant="link"
          action="primary"
          iconLeft={<CaretLeft size={18} />}
          onClick={() => {
            // goToPreviousQuestion();
          }}
        >
          Voltar
        </Button>

        {/* {currentQuestionIndex == 0 ? (
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            skipQuestion();
          }}
        >
          Pular
        </Button>
      ) : (
        <Button
          size="medium"
          variant="link"
          action="primary"
          iconLeft={<CaretLeftIcon size={18} />}
          onClick={() => {
            goToPreviousQuestion();
          }}
        >
          Voltar
        </Button>
      )} */}
      </div>

      {/* {currentQuestionIndex != 0 && (
      <Button
        size="small"
        variant="outline"
        action="primary"
        onClick={() => {
          skipQuestion();
        }}
      >
        Pular
      </Button>
    )} */}

      <Button
        size="small"
        variant="outline"
        action="primary"
        onClick={() => {
          // skipQuestion();
        }}
      >
        Pular
      </Button>

      <Button
        size="medium"
        variant="link"
        action="primary"
        iconRight={<CaretRight size={18} />}
        // disabled={!currentSelectedAnswer}
        onClick={() => {
          // goToNextQuestion();
        }}
      >
        Avançar
      </Button>

      {/* {currentQuestionIndex == allQuestions.length - 1 ? (
      <Button
        size="medium"
        variant="solid"
        action="primary"
        disabled={!currentSelectedAnswer}
        onClick={() => {
          if (unansweredQuestions.length > 0) {
            setAlertDialogOpen(true);
          } else {
            setModalResultOpen(true);
          }
        }}
      >
        Finalizar
      </Button>
    ) : (
      <Button
        size="medium"
        variant="link"
        action="primary"
        iconRight={<CaretRightIcon size={18} />}
        disabled={!currentSelectedAnswer}
        onClick={() => {
          goToNextQuestion();
        }}
      >
        Avançar
      </Button>
    )} */}
    </footer>
  );
};

export {
  QuestionaireTitle,
  Questionaire,
  QuestionaireHeader,
  QuestionaireContent,
  QuestionaireAlternative,
  QuestionaireFooter
};
