import { BookOpenText } from '../../assets/icons/subjects/BookOpenText';
import { ChatEN } from '../../assets/icons/subjects/ChatEN';
import { ChatES } from '../../assets/icons/subjects/ChatES';
import { ChatPT } from '../../assets/icons/subjects/ChatPT';
import { HeadCircuit } from '../../assets/icons/subjects/HeadCircuit';
import { Microscope } from '../../assets/icons/subjects/Microscope';
import { SubjectEnum } from '../../enums/SubjectEnum';
import {
  ArticleNyTimes,
  Atom,
  Book,
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
    icon: <Atom size={17} color="currentColor" />,
    colorClass: 'bg-subject-1',
    name: SubjectEnum.FISICA,
  },
  [SubjectEnum.HISTORIA]: {
    icon: <Scroll size={17} color="currentColor" />,
    colorClass: 'bg-subject-2',
    name: SubjectEnum.HISTORIA,
  },
  [SubjectEnum.LITERATURA]: {
    icon: <BookOpenText size={17} color="currentColor" />,
    colorClass: 'bg-subject-3',
    name: SubjectEnum.LITERATURA,
  },
  [SubjectEnum.GEOGRAFIA]: {
    icon: <GlobeHemisphereWest size={17} color="currentColor" />,
    colorClass: 'bg-subject-4',
    name: SubjectEnum.GEOGRAFIA,
  },
  [SubjectEnum.BIOLOGIA]: {
    icon: <Microscope size={17} color="currentColor" />,
    colorClass: 'bg-subject-5',
    name: SubjectEnum.BIOLOGIA,
  },
  [SubjectEnum.PORTUGUES]: {
    icon: <ChatPT size={17} color="currentColor" />,
    colorClass: 'bg-subject-6',
    name: SubjectEnum.PORTUGUES,
  },
  [SubjectEnum.QUIMICA]: {
    icon: <Flask size={17} color="currentColor" />,
    colorClass: 'bg-subject-7',
    name: SubjectEnum.QUIMICA,
  },
  [SubjectEnum.ARTES]: {
    icon: <Palette size={17} color="currentColor" />,
    colorClass: 'bg-subject-8',
    name: SubjectEnum.ARTES,
  },
  [SubjectEnum.MATEMATICA]: {
    icon: <MathOperations size={17} color="currentColor" />,
    colorClass: 'bg-subject-9',
    name: SubjectEnum.MATEMATICA,
  },
  [SubjectEnum.FILOSOFIA]: {
    icon: <HeadCircuit size={17} color="currentColor" />,
    colorClass: 'bg-subject-10',
    name: SubjectEnum.FILOSOFIA,
  },
  [SubjectEnum.ESPANHOL]: {
    icon: <ChatES size={17} color="currentColor" />,
    colorClass: 'bg-subject-11',
    name: SubjectEnum.ESPANHOL,
  },
  [SubjectEnum.REDACAO]: {
    icon: <ArticleNyTimes size={17} color="currentColor" />,
    colorClass: 'bg-subject-12',
    name: SubjectEnum.REDACAO,
  },
  [SubjectEnum.SOCIOLOGIA]: {
    icon: <Person size={17} color="currentColor" />,
    colorClass: 'bg-subject-13',
    name: SubjectEnum.SOCIOLOGIA,
  },
  [SubjectEnum.INGLES]: {
    icon: <ChatEN size={17} color="currentColor" />,
    colorClass: 'bg-subject-14',
    name: SubjectEnum.INGLES,
  },
  [SubjectEnum.EDUCACAO_FISICA]: {
    icon: <DribbbleLogo size={17} color="currentColor" />,
    colorClass: 'bg-subject-15',
    name: SubjectEnum.EDUCACAO_FISICA,
  },
  [SubjectEnum.TRILHAS]: {
    icon: <BookBookmark size={17} color="currentColor" />,
    colorClass: 'bg-subject-16',
    name: SubjectEnum.TRILHAS,
  },
};

export const getSubjectInfo = (subject: SubjectEnum): SubjectData => {
  return (
    SubjectInfo[subject] || {
      icon: <Book size={17} color="currentColor" />,
      colorClass: 'bg-subject-16',
      name: subject,
    }
  );
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
