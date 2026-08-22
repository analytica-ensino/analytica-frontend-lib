import type { ContentProgressItem } from './types';

/**
 * Regras de leitura do acordeão, compartilhadas pela TELA e pela EXPORTAÇÃO.
 *
 * Moram aqui, e não dentro do componente, porque a planilha tem que dizer o
 * mesmo que a linha do acordeão: se as duas tivessem cópias da mesma condição,
 * um ajuste na tela sairia calado do arquivo exportado. Puras, sem React.
 */

/**
 * Uma aula tem progresso a mostrar?
 *
 * Regra do nível mais fundo do acordeão, e ela é DIFERENTE da dos dois níveis
 * acima: tópico e subtópico decidem por `status === 'no_data'`, enquanto
 * `ContentProgressItem` não tem `status` nenhum — só `progress` e `isCompleted`
 * — e a tela deduz o "sem dados" de progresso zero em aula não concluída.
 *
 * `isCompleted` entra na conta porque uma aula concluída com progresso 0 existe
 * no tipo, e para ela a tela mostra "0%", não a mensagem de sem-dados.
 */
export const hasContentData = (item: ContentProgressItem): boolean =>
  item.progress !== 0 || item.isCompleted;

/**
 * Arredondamento do percentual, como todos os níveis do acordeão o desenham.
 *
 * A tela escreve `Math.round(progress)` seguido de "%", em três lugares; a
 * planilha grava o mesmo número em célula numérica, sem o sinal. Uma função só
 * para que os dois lados nunca arredondem diferente.
 */
export const roundProgress = (progress: number): number => Math.round(progress);
