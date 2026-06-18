import { BookOpenText } from '../../assets/icons/subjects/BookOpenText';
import { ChatEN } from '../../assets/icons/subjects/ChatEN';
import { ChatES } from '../../assets/icons/subjects/ChatES';
import { ChatPT } from '../../assets/icons/subjects/ChatPT';
import { HeadCircuit } from '../../assets/icons/subjects/HeadCircuit';
import { Microscope } from '../../assets/icons/subjects/Microscope';
import { SubjectEnum } from '../../enums/SubjectEnum';
import { ArticleNyTimesIcon } from '@phosphor-icons/react/dist/csr/ArticleNyTimes';
import { AtomIcon } from '@phosphor-icons/react/dist/csr/Atom';
import { BookIcon } from '@phosphor-icons/react/dist/csr/Book';
import { BookBookmarkIcon } from '@phosphor-icons/react/dist/csr/BookBookmark';
import { DribbbleLogoIcon } from '@phosphor-icons/react/dist/csr/DribbbleLogo';
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask';
import { GlobeHemisphereWestIcon } from '@phosphor-icons/react/dist/csr/GlobeHemisphereWest';
import { MathOperationsIcon } from '@phosphor-icons/react/dist/csr/MathOperations';
import { PaletteIcon } from '@phosphor-icons/react/dist/csr/Palette';
import { PersonIcon } from '@phosphor-icons/react/dist/csr/Person';
import { ScrollIcon } from '@phosphor-icons/react/dist/csr/Scroll';
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
    icon: <AtomIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-1',
    name: SubjectEnum.FISICA,
  },
  [SubjectEnum.HISTORIA]: {
    icon: <ScrollIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-2',
    name: SubjectEnum.HISTORIA,
  },
  [SubjectEnum.LITERATURA]: {
    icon: <BookOpenText size={17} color="currentColor" />,
    colorClass: 'bg-subject-3',
    name: SubjectEnum.LITERATURA,
  },
  [SubjectEnum.GEOGRAFIA]: {
    icon: <GlobeHemisphereWestIcon size={17} color="currentColor" />,
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
    icon: <FlaskIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-7',
    name: SubjectEnum.QUIMICA,
  },
  [SubjectEnum.ARTES]: {
    icon: <PaletteIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-8',
    name: SubjectEnum.ARTES,
  },
  [SubjectEnum.MATEMATICA]: {
    icon: <MathOperationsIcon size={17} color="currentColor" />,
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
    icon: <ArticleNyTimesIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-12',
    name: SubjectEnum.REDACAO,
  },
  [SubjectEnum.SOCIOLOGIA]: {
    icon: <PersonIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-13',
    name: SubjectEnum.SOCIOLOGIA,
  },
  [SubjectEnum.INGLES]: {
    icon: <ChatEN size={17} color="currentColor" />,
    colorClass: 'bg-subject-14',
    name: SubjectEnum.INGLES,
  },
  [SubjectEnum.EDUCACAO_FISICA]: {
    icon: <DribbbleLogoIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-15',
    name: SubjectEnum.EDUCACAO_FISICA,
  },
  [SubjectEnum.TRILHAS]: {
    icon: <BookBookmarkIcon size={17} color="currentColor" />,
    colorClass: 'bg-subject-16',
    name: SubjectEnum.TRILHAS,
  },
};

export const getSubjectInfo = (subject: SubjectEnum): SubjectData => {
  return (
    SubjectInfo[subject] || {
      icon: <BookIcon size={17} color="currentColor" />,
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
