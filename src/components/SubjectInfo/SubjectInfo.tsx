import { BookOpenText } from '@/assets/icons/subjects/BookOpenText';
import { ChatEN } from '@/assets/icons/subjects/ChatEN';
import { ChatES } from '@/assets/icons/subjects/ChatES';
import { ChatPT } from '@/assets/icons/subjects/ChatPT';
import { HeadCircuit } from '@/assets/icons/subjects/HeadCircuit';
import { Microscope } from '@/assets/icons/subjects/Microscope';
import { SubjectEnum } from '@/enums/SubjectEnum';
import {
  ArticleNyTimes,
  Atom,
  BookBookmark,
  DribbbleLogo,
  Flask,
  GlobeHemisphereWest,
  MathOperations,
  Palette,
  Person,
  Scroll,
} from 'phosphor-react';
import { ReactElement } from 'react';
export interface IconProps {
  size?: number;
  color?: string;
}

export interface SubjectData {
  icon: ReactElement<IconProps>;
  colorClass: string;
  name: string;
}

export const SubjectInfo: Record<SubjectEnum, SubjectData> = {
  [SubjectEnum.FISICA]: {
    icon: <Atom size={17} />,
    colorClass: 'bg-subject-1',
    name: 'Física',
  },
  [SubjectEnum.HISTORIA]: {
    icon: <Scroll size={17} />,
    colorClass: 'bg-subject-2',
    name: 'História',
  },
  [SubjectEnum.LITERATURA]: {
    icon: <BookOpenText size={17} color="#000000" />,
    colorClass: 'bg-subject-3',
    name: 'Literatura',
  },
  [SubjectEnum.GEOGRAFIA]: {
    icon: <GlobeHemisphereWest size={17} />,
    colorClass: 'bg-subject-4',
    name: 'Geografia',
  },
  [SubjectEnum.BIOLOGIA]: {
    icon: <Microscope size={17} color="#000000" />,
    colorClass: 'bg-subject-5',
    name: 'Biologia',
  },
  [SubjectEnum.PORTUGUES]: {
    icon: <ChatPT size={17} color="#000000" />,
    colorClass: 'bg-subject-6',
    name: 'Português',
  },
  [SubjectEnum.QUIMICA]: {
    icon: <Flask size={17} />,
    colorClass: 'bg-subject-7',
    name: 'Química',
  },
  [SubjectEnum.ARTES]: {
    icon: <Palette size={17} />,
    colorClass: 'bg-subject-8',
    name: 'Artes',
  },
  [SubjectEnum.MATEMATICA]: {
    icon: <MathOperations size={17} />,
    colorClass: 'bg-subject-9',
    name: 'Matemática',
  },
  [SubjectEnum.FILOSOFIA]: {
    icon: <HeadCircuit size={17} color="#000000" />,
    colorClass: 'bg-subject-10',
    name: 'Filosofia',
  },
  [SubjectEnum.ESPANHOL]: {
    icon: <ChatES size={17} color="#000000" />,
    colorClass: 'bg-subject-11',
    name: 'Espanhol',
  },
  [SubjectEnum.REDACAO]: {
    icon: <ArticleNyTimes size={17} />,
    colorClass: 'bg-subject-12',
    name: 'Redação',
  },
  [SubjectEnum.SOCIOLOGIA]: {
    icon: <Person size={17} />,
    colorClass: 'bg-subject-13',
    name: 'Sociologia',
  },
  [SubjectEnum.INGLES]: {
    icon: <ChatEN size={17} color="#000000" />,
    colorClass: 'bg-subject-14',
    name: 'Inglês',
  },
  [SubjectEnum.EDUCACAO_FISICA]: {
    icon: <DribbbleLogo size={17} />,
    colorClass: 'bg-subject-15',
    name: 'Ed. Física',
  },
  [SubjectEnum.TRILHAS]: {
    icon: <BookBookmark size={17} />,
    colorClass: 'bg-subject-16',
    name: 'Trilhas',
  },
};

export const getSubjectData = (subject: SubjectEnum): SubjectData => {
  return SubjectInfo[subject];
};

export const getSubjectIcon = (subject: SubjectEnum): ReactElement => {
  return SubjectInfo[subject].icon;
};

export const getSubjectColorClass = (subject: SubjectEnum): string => {
  return SubjectInfo[subject].colorClass;
};

export const getSubjectName = (subject: SubjectEnum): string => {
  return SubjectInfo[subject].name;
};
