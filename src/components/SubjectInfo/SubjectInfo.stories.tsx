import { Story } from '@ladle/react';
import Text from '../Text/Text';
import { cloneElement, ReactElement } from 'react';
import { getSubjectInfo, IconProps } from './SubjectInfo';
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
        className={`${cardSize} ${subjectClass} flex items-center justify-center rounded-md text-text-950`}
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
      class: getSubjectInfo(SubjectEnum.FISICA).colorClass,
      icon: getSubjectInfo(SubjectEnum.FISICA).icon,
      label: getSubjectInfo(SubjectEnum.FISICA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.HISTORIA).colorClass,
      icon: getSubjectInfo(SubjectEnum.HISTORIA).icon,
      label: getSubjectInfo(SubjectEnum.HISTORIA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.LITERATURA).colorClass,
      icon: getSubjectInfo(SubjectEnum.LITERATURA).icon,
      label: getSubjectInfo(SubjectEnum.LITERATURA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.GEOGRAFIA).colorClass,
      icon: getSubjectInfo(SubjectEnum.GEOGRAFIA).icon,
      label: getSubjectInfo(SubjectEnum.GEOGRAFIA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.BIOLOGIA).colorClass,
      icon: getSubjectInfo(SubjectEnum.BIOLOGIA).icon,
      label: getSubjectInfo(SubjectEnum.BIOLOGIA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.PORTUGUES).colorClass,
      icon: getSubjectInfo(SubjectEnum.PORTUGUES).icon,
      label: getSubjectInfo(SubjectEnum.PORTUGUES).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.QUIMICA).colorClass,
      icon: getSubjectInfo(SubjectEnum.QUIMICA).icon,
      label: getSubjectInfo(SubjectEnum.QUIMICA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.ARTES).colorClass,
      icon: getSubjectInfo(SubjectEnum.ARTES).icon,
      label: getSubjectInfo(SubjectEnum.ARTES).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.MATEMATICA).colorClass,
      icon: getSubjectInfo(SubjectEnum.MATEMATICA).icon,
      label: getSubjectInfo(SubjectEnum.MATEMATICA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.FILOSOFIA).colorClass,
      icon: getSubjectInfo(SubjectEnum.FILOSOFIA).icon,
      label: getSubjectInfo(SubjectEnum.FILOSOFIA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.ESPANHOL).colorClass,
      icon: getSubjectInfo(SubjectEnum.ESPANHOL).icon,
      label: getSubjectInfo(SubjectEnum.ESPANHOL).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.REDACAO).colorClass,
      icon: getSubjectInfo(SubjectEnum.REDACAO).icon,
      label: getSubjectInfo(SubjectEnum.REDACAO).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.SOCIOLOGIA).colorClass,
      icon: getSubjectInfo(SubjectEnum.SOCIOLOGIA).icon,
      label: getSubjectInfo(SubjectEnum.SOCIOLOGIA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.INGLES).colorClass,
      icon: getSubjectInfo(SubjectEnum.INGLES).icon,
      label: getSubjectInfo(SubjectEnum.INGLES).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.EDUCACAO_FISICA).colorClass,
      icon: getSubjectInfo(SubjectEnum.EDUCACAO_FISICA).icon,
      label: getSubjectInfo(SubjectEnum.EDUCACAO_FISICA).name,
    },
    {
      class: getSubjectInfo(SubjectEnum.TRILHAS).colorClass,
      icon: getSubjectInfo(SubjectEnum.TRILHAS).icon,
      label: getSubjectInfo(SubjectEnum.TRILHAS).name,
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
