import type { Story } from '@ladle/react';
import { useState } from 'react';
import EnemClassroomStartModal from './EnemClassroomStartModal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type {
  EnemClassroomExam,
  EnemClassroomStartPayload,
} from '../../types/enemClassroom';

const exam: EnemClassroomExam = {
  id: 'exam-1',
  title: 'Simulação do ENEM 2026',
  videoUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  durationMinutes: 300,
  surveyQuestions: [
    {
      id: 'q-course',
      position: 1,
      stepLabel: 'Curso',
      prompt: 'Você já tem o curso que quer fazer em mente?',
      inputLabel: 'Se sim, escreva o seu curso',
      inputPlaceholder: 'Escreva o curso',
      skipLabel: 'Não, ainda estou pensando',
    },
    {
      id: 'q-university',
      position: 2,
      stepLabel: 'Universidade',
      prompt: 'E a universidade, já escolheu?',
      inputLabel: 'Se sim, escreva a sua universidade',
      inputPlaceholder: 'Escreva a universidade escolhida',
      skipLabel: 'Não, ainda estou pensando',
    },
  ],
};

/**
 * The whole start flow: introduction, language, the two survey questions
 * from the design and the summary. Starting just prints the payload.
 */
export const Basic: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<EnemClassroomStartPayload | null>(
    null
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>
        Simulação do ENEM em sala de aula!
      </Button>

      {payload && (
        <pre className="p-4 bg-background-50 rounded-lg text-xs">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}

      <EnemClassroomStartModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        exam={exam}
        onStart={(data) => {
          setPayload(data);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

/**
 * Exam without an introduction video: the first step shows only the warnings.
 */
export const WithoutVideo: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Text size="sm" color="text-text-700">
        Sem vídeo cadastrado no backoffice.
      </Text>
      <Button onClick={() => setIsOpen(true)}>Abrir</Button>

      <EnemClassroomStartModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        exam={{ ...exam, videoUrl: null }}
        onStart={() => setIsOpen(false)}
        isStarting={false}
      />
    </div>
  );
};
