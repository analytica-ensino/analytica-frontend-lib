import { fetchAllPages, type PageRequest } from '../../utils/fetchAllPages';
import type { BaseApiClient } from '../../types/api';
import type {
  ActivityFilters,
  ContentDetailsApiResponse,
  ContentDetailsParams,
  ContentStudentItem,
} from './types';

/**
 * A requisição de detalhes da competência, em um lugar só.
 *
 * Existe porque DOIS consumidores precisam montar exatamente a mesma chamada: o
 * `useSimulatedContentDetails`, que carrega a página que a tela mostra, e o
 * `fetchAllContentStudents`, que varre a tabela inteira para o XLSX. Se cada um
 * montasse a sua, um filtro acrescentado à tela sairia da planilha sem ninguém
 * perceber — e a planilha diria respeito a outro recorte que não o exibido.
 *
 * O endpoint e o corpo saíram do hook sem mudança de comportamento: os testes de
 * `useSimulatedContentDetails` que fixam a URL e o corpo continuam valendo como
 * estavam.
 */

/** Caminho do endpoint, antes dos filtros de atividade. */
const CONTENT_DETAILS_ENDPOINT =
  '/performance/simulated/activities/content-details';

/**
 * Endpoint com os filtros de atividade como query params.
 *
 * Os três filtros são listas e viram um par `chave=valor` por item (`append`,
 * não `set`), que é como a rota os lê. Sem nenhum filtro a URL sai sem o "?",
 * em vez de terminar em um "?" vazio.
 */
export function buildContentDetailsEndpoint(
  activityFilters: ActivityFilters
): string {
  const params = new URLSearchParams();

  activityFilters.types?.forEach((t) => params.append('types', t));
  activityFilters.subtypes?.forEach((s) => params.append('subtypes', s));
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  const queryString = params.toString();

  if (!queryString) {
    return CONTENT_DETAILS_ENDPOINT;
  }

  return `${CONTENT_DETAILS_ENDPOINT}?${queryString}`;
}

/** Corpo do POST de detalhes da competência. */
export interface ContentDetailsRequestBody {
  contentId: string;
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Corpo do POST, com a paginação vinda de fora.
 *
 * `pagination` é parâmetro separado — e não `params.page`/`params.limit` — para
 * que a varredura do XLSX possa reaproveitar o MESMO recorte de filtros pedindo
 * outra página. Os campos `page`/`limit` de `ContentDetailsParams` são o que o
 * chamador da tela quer ver; a varredura os ignora de propósito.
 */
export function buildContentDetailsBody(
  params: ContentDetailsParams,
  pagination: PageRequest
): ContentDetailsRequestBody {
  return {
    contentId: params.contentId,
    period: params.period,
    schoolIds: params.schoolIds,
    schoolYearIds: params.schoolYearIds,
    classIds: params.classIds,
    studentsIds: params.studentsIds,
    page: pagination.page,
    limit: pagination.limit,
    orderBy: params.orderBy,
    order: params.order,
  };
}

/**
 * Todos os estudantes da competência, varridos página a página.
 *
 * Para o XLSX, que leva a tabela inteira enquanto a tela mostra dez linhas por
 * vez. Uma requisição a mais do que a tela fez, e é o ponto: sem ela a planilha
 * sairia com a página visível e nada diria que o resto ficou de fora.
 *
 * `totalPages` é calculado aqui porque o payload não o traz — a resposta é
 * `data`/`page`/`limit`/`total` (`contentStudentsPaginatedSchema`, no backend), e
 * `fetchAllPages` exige do chamador exatamente essa conta quando o endpoint não
 * reporta o número de páginas. O divisor é o `limit` que ESTA função pediu, não
 * o que a resposta devolve: é o valor que sabidamente é positivo, e uma resposta
 * com `limit: 0` daria `Infinity` páginas.
 *
 * O tamanho de página é o padrão de `fetchAllPages`, 100, que é o teto do
 * `contentDetailsBodySchema` (`limit: z.number().int().positive().max(100)`) —
 * pedir mais faz a rota rejeitar a chamada, não devolver uma página maior.
 *
 * Sem ordenação explícita, como a tela também não manda: os dois caem no
 * `orderBy: 'name'`/`order: 'asc'` que o schema aplica por padrão, então a
 * planilha sai na mesma ordem que a tabela.
 *
 * @throws Whatever uma página rejeitar — `fetchAllPages` derruba a varredura
 *   inteira, e o chamador transforma isso em erro visível no seletor de formato.
 */
export async function fetchAllContentStudents(
  api: BaseApiClient,
  params: ContentDetailsParams
): Promise<ContentStudentItem[]> {
  const endpoint = buildContentDetailsEndpoint(params.activityFilters);

  return fetchAllPages<ContentStudentItem>(async (pagination) => {
    const response = await api.post<ContentDetailsApiResponse>(
      endpoint,
      buildContentDetailsBody(params, pagination)
    );

    const { students } = response.data.data;

    return {
      items: students.data,
      totalPages: Math.ceil(students.total / pagination.limit),
    };
  });
}
