import { Story } from '@ladle/react';
import Text from '../Text/Text';
import { cloneElement, ReactElement } from 'react';
import { SubjectInfo, IconProps } from './SubjectInfo';
import { SubjectEnum } from '@/enums/SubjectEnum';

// Componente reutilizável para cada matéria
const SubjectCard = ({
  subjectClass,
  icon,
  label,
  isDark = false,
  size = 'small',
}: {
  subjectClass: string;
  icon: ReactElement<IconProps>;
  label: string;
  isDark?: boolean;
  size?: 'small' | 'large';
}) => {
  const cardSize = size === 'small' ? 'w-[21px] h-[21px]' : 'w-[80px] h-[80px]';
  const iconSize = size === 'small' ? 17 : 24;
  const textSize = size === 'small' ? 'xs' : 'sm';

  return (
    <div className="flex flex-col gap-1 text-center">
      <div
        className={`${cardSize} ${subjectClass} flex items-center justify-center rounded-md`}
        data-theme={isDark ? 'dark' : 'light'}
      >
        {cloneElement(icon, { size: iconSize })}
      </div>
      <Text weight="bold" size={textSize}>
        {label}
      </Text>
    </div>
  );
};

export const AllSubjects: Story = () => {
  const subjects = [
    {
      class: SubjectInfo[SubjectEnum.FISICA].colorClass,
      icon: SubjectInfo[SubjectEnum.FISICA].icon,
      label: SubjectInfo[SubjectEnum.FISICA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.HISTORIA].colorClass,
      icon: SubjectInfo[SubjectEnum.HISTORIA].icon,
      label: SubjectInfo[SubjectEnum.HISTORIA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.LITERATURA].colorClass,
      icon: SubjectInfo[SubjectEnum.LITERATURA].icon,
      label: SubjectInfo[SubjectEnum.LITERATURA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.GEOGRAFIA].colorClass,
      icon: SubjectInfo[SubjectEnum.GEOGRAFIA].icon,
      label: SubjectInfo[SubjectEnum.GEOGRAFIA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.BIOLOGIA].colorClass,
      icon: SubjectInfo[SubjectEnum.BIOLOGIA].icon,
      label: SubjectInfo[SubjectEnum.BIOLOGIA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.PORTUGUES].colorClass,
      icon: SubjectInfo[SubjectEnum.PORTUGUES].icon,
      label: SubjectInfo[SubjectEnum.PORTUGUES].name,
    },
    {
      class: SubjectInfo[SubjectEnum.QUIMICA].colorClass,
      icon: SubjectInfo[SubjectEnum.QUIMICA].icon,
      label: SubjectInfo[SubjectEnum.QUIMICA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.ARTES].colorClass,
      icon: SubjectInfo[SubjectEnum.ARTES].icon,
      label: SubjectInfo[SubjectEnum.ARTES].name,
    },
    {
      class: SubjectInfo[SubjectEnum.MATEMATICA].colorClass,
      icon: SubjectInfo[SubjectEnum.MATEMATICA].icon,
      label: SubjectInfo[SubjectEnum.MATEMATICA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.FILOSOFIA].colorClass,
      icon: SubjectInfo[SubjectEnum.FILOSOFIA].icon,
      label: SubjectInfo[SubjectEnum.FILOSOFIA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.ESPANHOL].colorClass,
      icon: SubjectInfo[SubjectEnum.ESPANHOL].icon,
      label: SubjectInfo[SubjectEnum.ESPANHOL].name,
    },
    {
      class: SubjectInfo[SubjectEnum.REDACAO].colorClass,
      icon: SubjectInfo[SubjectEnum.REDACAO].icon,
      label: SubjectInfo[SubjectEnum.REDACAO].name,
    },
    {
      class: SubjectInfo[SubjectEnum.SOCIOLOGIA].colorClass,
      icon: SubjectInfo[SubjectEnum.SOCIOLOGIA].icon,
      label: SubjectInfo[SubjectEnum.SOCIOLOGIA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.INGLES].colorClass,
      icon: SubjectInfo[SubjectEnum.INGLES].icon,
      label: SubjectInfo[SubjectEnum.INGLES].name,
    },
    {
      class: SubjectInfo[SubjectEnum.EDUCACAO_FISICA].colorClass,
      icon: SubjectInfo[SubjectEnum.EDUCACAO_FISICA].icon,
      label: SubjectInfo[SubjectEnum.EDUCACAO_FISICA].name,
    },
    {
      class: SubjectInfo[SubjectEnum.TRILHAS].colorClass,
      icon: SubjectInfo[SubjectEnum.TRILHAS].icon,
      label: SubjectInfo[SubjectEnum.TRILHAS].name,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Light Mode - Small (21px) */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-3xl text-text-900">
          Subjects - Light Mode (21px)
        </h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>Subject</code> em modo claro -
          tamanho pequeno
        </p>

        <div className="bg-background p-4 rounded-md">
          <div className="flex flex-row flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={`light-small-${index}`}
                subjectClass={subject.class}
                icon={subject.icon}
                label={subject.label}
                isDark={false}
                size="small"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Light Mode - Large (80px) */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-3xl text-text-900">
          Subjects - Light Mode (80px)
        </h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>Subject</code> em modo claro -
          tamanho grande
        </p>

        <div className="bg-background p-4 rounded-md">
          <div className="flex flex-row flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={`light-large-${index}`}
                subjectClass={subject.class}
                icon={subject.icon}
                label={subject.label}
                isDark={false}
                size="large"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dark Mode - Small (21px) */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-3xl text-text-900">
          Subjects - Dark Mode (21px)
        </h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>Subject</code> em modo escuro
          - tamanho pequeno
        </p>

        <div className="bg-background p-4 rounded-md" data-theme="dark">
          <div className="flex flex-row flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={`dark-small-${index}`}
                subjectClass={subject.class}
                icon={subject.icon}
                label={subject.label}
                isDark={true}
                size="small"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dark Mode - Large (80px) */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-3xl text-text-900">
          Subjects - Dark Mode (80px)
        </h2>
        <p className="text-text-700">
          Variações possíveis do componente <code>Subject</code> em modo escuro
          - tamanho grande
        </p>

        <div className="bg-background p-4 rounded-md" data-theme="dark">
          <div className="flex flex-row flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={`dark-large-${index}`}
                subjectClass={subject.class}
                icon={subject.icon}
                label={subject.label}
                isDark={true}
                size="large"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
