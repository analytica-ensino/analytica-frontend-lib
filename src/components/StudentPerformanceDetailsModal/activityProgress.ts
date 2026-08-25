import type { ActivityProgress } from './types';

/**
 * Regras de leitura de uma atividade, compartilhadas pela TELA e pela
 * EXPORTAÇÃO.
 *
 * Moram aqui, e não dentro do componente, porque a planilha tem que dizer o
 * mesmo que o card: se as duas tivessem cópias da mesma condição, um ajuste na
 * tela sairia calado do arquivo exportado. Puras, sem React.
 */

/**
 * Uma atividade tem resultado a mostrar?
 *
 * `totalCount > 0` entra junto com a flag porque uma atividade com zero questões
 * dividiria por zero na barra de progresso, e "0 de 0 corretas" não informa
 * nada — a tela mostra a mensagem de "sem dados" nos dois casos.
 */
export const hasActivityData = (activity: ActivityProgress): boolean =>
  !activity.hasNoData && activity.totalCount > 0;

/**
 * Preenche `{correct}` e `{total}` no texto de progresso configurado.
 */
export const formatProgressText = (
  template: string,
  correct: number,
  total: number
): string =>
  template
    .replace('{correct}', String(correct))
    .replace('{total}', String(total));
