import type { ComponentType } from 'react';
import { ChatTextIcon } from '@phosphor-icons/react/dist/csr/ChatText';
import { PersonArmsSpreadIcon } from '@phosphor-icons/react/dist/csr/PersonArmsSpread';
import { MicroscopeIcon } from '@phosphor-icons/react/dist/csr/Microscope';
import { MathOperationsIcon } from '@phosphor-icons/react/dist/csr/MathOperations';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';

/** The two lines of "Resumo geral"; the API decides which (`aboveAverage`). */
export const ABOVE_AVERAGE_MESSAGE =
  'Seu desempenho neste simulado superou a média e mostra que sua base de conhecimento está cada vez mais sólida.';
export const BELOW_AVERAGE_MESSAGE =
  'Seu desempenho neste simulado ficou abaixo da média, mas isso faz parte do processo de aprendizado. Use esse resultado para identificar os pontos que precisam de mais atenção e continue se preparando.';

/** The summary's message, or none while there is no average to compare to. */
export const summaryMessage = (aboveAverage: boolean | null): string | null => {
  if (aboveAverage === null) return null;
  return aboveAverage ? ABOVE_AVERAGE_MESSAGE : BELOW_AVERAGE_MESSAGE;
};

/** Time on the exam as the ring writes it: "3h30", "3h", "45min". */
export const formatElapsed = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
};

/**
 * The same time in words, for screen readers: "3h30" would be read as letters
 * and digits, not as a duration.
 */
export const spokenElapsed = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hoursText = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const minutesText = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  return hours === 0 ? minutesText : `${hoursText} e ${minutesText}`;
};

/** How an area card is drawn: its icon and the tone of the circle behind it. */
export interface EnemClassroomAreaVisual {
  Icon: ComponentType<{ size?: number }>;
  circleClassName: string;
}

const BLUE = 'bg-info-background text-info-700';
const ORANGE = 'bg-warning-background text-warning-700';

/**
 * The four ENEM areas by a stem of their name — the API sends the area's name
 * and no icon or colour, and institutions spell the names freely ("Ciências da
 * Natureza e suas Tecnologias", "Ciências da natureza"), so the match is on a
 * stem rather than on the whole string.
 */
const AREA_VISUALS: ReadonlyArray<{
  stem: string;
  visual: EnemClassroomAreaVisual;
}> = [
  { stem: 'linguagens', visual: { Icon: ChatTextIcon, circleClassName: BLUE } },
  {
    stem: 'humanas',
    visual: { Icon: PersonArmsSpreadIcon, circleClassName: BLUE },
  },
  {
    stem: 'natureza',
    visual: { Icon: MicroscopeIcon, circleClassName: ORANGE },
  },
  {
    stem: 'matematica',
    visual: { Icon: MathOperationsIcon, circleClassName: ORANGE },
  },
];

const FALLBACK_AREA_VISUAL: EnemClassroomAreaVisual = {
  Icon: BookOpenIcon,
  circleClassName: 'bg-background-100 text-text-700',
};

/** Lowercase and without accents: "Matemática" and "MATEMATICA" are alike. */
const normalise = (name: string) =>
  name.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase();

/** The icon and tone of an area, by its name; a neutral one for any other. */
export const areaVisual = (areaName: string): EnemClassroomAreaVisual => {
  const name = normalise(areaName);
  return (
    AREA_VISUALS.find(({ stem }) => name.includes(stem))?.visual ??
    FALLBACK_AREA_VISUAL
  );
};

/**
 * A subject's icon and colour, as the app's subjects endpoint gives them —
 * the result names its components but carries neither.
 */
export interface EnemClassroomSubjectStyle {
  id: string;
  icon: string | null;
  color: string | null;
}

/** For a subject the app could not style (e.g. outside the student's trail). */
export const FALLBACK_SUBJECT_ICON = 'BookOpen';
export const FALLBACK_SUBJECT_COLOR = '#B7DFFF';
