import { fetchAllPages, type PageRequest } from '../../utils/fetchAllPages';
import type { BaseApiClient } from '../../types/api';
import type {
  EssayCompetenceDetailsApiResponse,
  EssayCompetenceDetailsParams,
  EssayCompetenceStudentItem,
} from './types';

/**
 * A requisição de detalhes da competência de redação, em um lugar só.
 *
 * Existe porque DOIS consumidores precisam montar exatamente a mesma chamada: o
 * `useEssayCompetenceDetails`, que carrega a página que a tela mostra, e o
 * `fetchAllCompetenceStudents`, que varre a tabela inteira para o XLSX. Se cada
 * um montasse a sua, um filtro acrescentado à tela sairia da planilha sem
 * ninguém perceber — e a planilha diria respeito a outro recorte que não o
 * exibido. É a mesma separação que o `SimulatedContentDetailsModal` já fez em
 * `contentDetailsRequest.ts`.
 *
 * O corpo saiu do hook sem mudança de comportamento: os valores por omissão são
 * os que o hook já aplicava, e seus testes que fixam a URL e o corpo continuam
 * valendo como estavam.
 */

/**
 * Caminho do endpoint.
 *
 * Sem query params, ao contrário do irmão de simulado: aqui não há filtro de
 * atividade, e todo o recorte vai no corpo do POST.
 */
export const COMPETENCE_DETAILS_ENDPOINT =
  '/performance/simulated/essays/competence-details';

/** Corpo do POST de detalhes da competência. */
export interface CompetenceDetailsRequestBody {
  competenceNumber: number;
  period: string;
  schoolIds: string[];
  schoolYearIds: string[];
  classIds: string[];
  page: number;
  limit: number;
  orderBy: string;
  order: 'asc' | 'desc';
}

/**
 * Ordenação por omissão, que é a que a tela recebe.
 *
 * Nem o modal nem a `EssayCompetenciesTable` passam `orderBy`/`order`, então os
 * dois caem aqui. São os mesmos valores que o `essayCompetenceDetailsBodySchema`
 * do backend aplica quando o campo não vem, e mandá-los explicitamente é o que
 * garante que a varredura do XLSX saia na MESMA ordem da tabela.
 */
const DEFAULT_ORDER_BY = 'averageScore';
const DEFAULT_ORDER = 'desc' as const;

/**
 * Corpo do POST, com a paginação vinda de fora.
 *
 * `pagination` é parâmetro separado — e não `params.page`/`params.limit` — para
 * que a varredura do XLSX possa reaproveitar o MESMO recorte de filtros pedindo
 * outra página. Os campos `page`/`limit` de `EssayCompetenceDetailsParams` são o
 * que o chamador da tela quer ver; a varredura os ignora de propósito.
 *
 * As três listas de filtro viram `[]` quando ausentes porque era assim que o
 * hook já as mandava.
 */
export function buildCompetenceDetailsBody(
  params: EssayCompetenceDetailsParams,
  pagination: PageRequest
): CompetenceDetailsRequestBody {
  return {
    competenceNumber: params.competenceNumber,
    period: params.period,
    schoolIds: params.schoolIds ?? [],
    schoolYearIds: params.schoolYearIds ?? [],
    classIds: params.classIds ?? [],
    page: pagination.page,
    limit: pagination.limit,
    orderBy: params.orderBy ?? DEFAULT_ORDER_BY,
    order: params.order ?? DEFAULT_ORDER,
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
 * `data`/`page`/`limit`/`total` (`essayCompetenceStudentsPaginatedSchema`, no
 * backend), e `fetchAllPages` exige do chamador exatamente essa conta quando o
 * endpoint não reporta o número de páginas. O divisor é o `limit` que ESTA
 * função pediu, não o que a resposta devolve: é o valor que sabidamente é
 * positivo, e uma resposta com `limit: 0` daria `Infinity` páginas.
 *
 * O tamanho de página é o padrão de `fetchAllPages`, 100, que é o teto do
 * `essayCompetenceDetailsBodySchema`
 * (`limit: z.number().int().positive().max(100)`) — pedir mais faz a rota
 * rejeitar a chamada, não devolver uma página maior.
 *
 * @throws Whatever uma página rejeitar — `fetchAllPages` derruba a varredura
 *   inteira, e o chamador transforma isso em erro visível no seletor de formato.
 */
export async function fetchAllCompetenceStudents(
  api: BaseApiClient,
  params: EssayCompetenceDetailsParams
): Promise<EssayCompetenceStudentItem[]> {
  return fetchAllPages<EssayCompetenceStudentItem>(async (pagination) => {
    const response = await api.post<EssayCompetenceDetailsApiResponse>(
      COMPETENCE_DETAILS_ENDPOINT,
      buildCompetenceDetailsBody(params, pagination)
    );

    const { students } = response.data.data;

    return {
      items: students.data,
      totalPages: Math.ceil(students.total / pagination.limit),
    };
  });
}
