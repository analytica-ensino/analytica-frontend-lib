import { ChatTextIcon } from '@phosphor-icons/react/dist/csr/ChatText';
import { PersonArmsSpreadIcon } from '@phosphor-icons/react/dist/csr/PersonArmsSpread';
import { MicroscopeIcon } from '@phosphor-icons/react/dist/csr/Microscope';
import { MathOperationsIcon } from '@phosphor-icons/react/dist/csr/MathOperations';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import {
  ABOVE_AVERAGE_MESSAGE,
  BELOW_AVERAGE_MESSAGE,
  areaVisual,
  formatElapsed,
  spokenElapsed,
  summaryMessage,
} from './utils';

describe('EnemClassroomResult utils', () => {
  it('picks the summary message the API decided, and none without an average', () => {
    expect(summaryMessage(true)).toBe(ABOVE_AVERAGE_MESSAGE);
    expect(summaryMessage(false)).toBe(BELOW_AVERAGE_MESSAGE);
    expect(summaryMessage(null)).toBeNull();
  });

  it('writes the time the way the ring shows it', () => {
    expect(formatElapsed(12600)).toBe('3h30');
    expect(formatElapsed(10800)).toBe('3h');
    expect(formatElapsed(3900)).toBe('1h05');
    expect(formatElapsed(2700)).toBe('45min');
    expect(formatElapsed(59)).toBe('0min');
  });

  it('says the time in words for screen readers', () => {
    expect(spokenElapsed(12600)).toBe('3 horas e 30 minutos');
    expect(spokenElapsed(3660)).toBe('1 hora e 1 minuto');
    expect(spokenElapsed(2700)).toBe('45 minutos');
  });

  it('draws each ENEM area with its icon, whatever the spelling', () => {
    expect(areaVisual('Linguagens, Códigos e suas Tecnologias').Icon).toBe(
      ChatTextIcon
    );
    expect(areaVisual('CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS').Icon).toBe(
      PersonArmsSpreadIcon
    );
    expect(areaVisual('Ciências da natureza').Icon).toBe(MicroscopeIcon);
    expect(areaVisual('MATEMÁTICA e suas Tecnologias').Icon).toBe(
      MathOperationsIcon
    );
  });

  it('gives the blue tone to the first two areas and the orange to the others', () => {
    expect(areaVisual('Linguagens').circleClassName).toContain('info');
    expect(areaVisual('Ciências Humanas').circleClassName).toContain('info');
    expect(areaVisual('Ciências da Natureza').circleClassName).toContain(
      'warning'
    );
    expect(areaVisual('Matemática').circleClassName).toContain('warning');
  });

  it('falls back to a neutral card for an area it does not know', () => {
    expect(areaVisual('Redação').Icon).toBe(BookOpenIcon);
  });
});
