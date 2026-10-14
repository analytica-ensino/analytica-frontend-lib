const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * Tempo decorrido desde a última mensagem, no formato curto do Figma do SAC.
 *
 * Os limiares são: menos de um minuto vira `agora`; abaixo de uma hora, minutos
 * (`6 min`); abaixo de um dia, horas (`2 h`); abaixo de uma semana, dias
 * (`3 d`); daí em diante a data curta (`12/09/2026`), porque "há 43 d" não
 * ajuda ninguém a localizar o atendimento.
 *
 * Recebe `now` por parâmetro para o teste fixar o relógio sem `fakeTimers`, e
 * cai no relógio real quando omitido.
 *
 * Data inválida devolve string vazia: o item prefere não mostrar nada a mostrar
 * `NaN min`.
 *
 * @example
 * ```ts
 * formatTicketTime(ticket.lastMessageAt); // "6 min"
 * ```
 */
export const formatTicketTime = (
  value: Date | string,
  now: Date = new Date()
): string => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const elapsed = now.getTime() - date.getTime();

  if (elapsed < MINUTE_MS) {
    return 'agora';
  }

  if (elapsed < HOUR_MS) {
    return `${Math.floor(elapsed / MINUTE_MS)} min`;
  }

  if (elapsed < DAY_MS) {
    return `${Math.floor(elapsed / HOUR_MS)} h`;
  }

  if (elapsed < WEEK_MS) {
    return `${Math.floor(elapsed / DAY_MS)} d`;
  }

  return date.toLocaleDateString('pt-BR');
};
