import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import { SIMULATED_PERFORMANCE_TAG_CONFIG } from '../SimulatedStudentDetailsModal/types';
import type { EssayStudentDetailsData } from './types';

/**
 * Montagem das abas do XLSX do `EssayStudentDetailsModal`. Funções puras: nada
 * de React, nada de requisição, nada de escrita em disco — quem grava o arquivo
 * é `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente, conferidos linha
 * a linha em `EssayStudentDetailsModal.tsx`:
 *
 * | Bloco na tela                                    | Onde foi parar              |
 * | ------------------------------------------------ | --------------------------- |
 * | card do estudante: nome                          | resumo                      |
 * | card do estudante: "escola - turma"              | resumo, duas linhas         |
 * | card do estudante: "{n} redações"                | resumo                      |
 * | card do estudante: média sobre 1000              | resumo                      |
 * | card do estudante: percentual                    | resumo                      |
 * | card do estudante: badge de desempenho           | resumo                      |
 * | título "Competências" da seção                   | nome da 2ª aba              |
 * | lista de competências                            | "Desempenho por competência"|
 *
 * NÍVEL ÚNICO, SEM PAGINAÇÃO: diferente dos modais de simulado, este não
 * navega. O `useEssayStudentDetails` faz UMA requisição
 * (`POST /performance/simulated/essays/student-details`) e devolve um objeto só,
 * com as competências inteiras dentro — a resposta não tem `page`/`limit`/
 * `total` e a tela não desenha controle de paginação; a lista rola dentro de um
 * `max-h-[400px] overflow-y-auto`. Por isso não há `fetchAllPages` aqui: não há
 * segunda página para buscar, e PDF e XLSX carregam exatamente o mesmo conjunto.
 *
 * TEXTO LONGO: este modal NÃO mostra o texto da redação nem comentário de
 * corretor — nem a tela os desenha nem `EssayStudentDetailsData` os carrega
 * (`types.ts`: o item de competência tem `number`, `name`, `averageScore`,
 * `averagePercentage` e `essaysCount`, todos numéricos menos o nome). A única
 * string longa é o NOME da competência, uma frase do ENEM na casa das dezenas de
 * caracteres, e ela vai inteira: o `truncate` da tela é corte visual por CSS —
 * o texto completo já está no DOM e sai no PDF impresso —, então truncar aqui
 * inventaria uma perda que o usuário não tem. Longe do teto de 32.767
 * caracteres por célula do Excel.
 *
 * O QUE FICA DE FORA, e por quê. Mapear pelo tipo, e não pelo que a tela
 * desenha, poria na planilha número que o professor nunca viu:
 *
 * - `EssayStudentInfo.id` — nunca renderizado;
 * - `EssayStudentInfo.schoolYear` — o card escreve `{school} - {class}` e pula o
 *   ano escolar (`EssayStudentDetailsModal.tsx:148`);
 * - `EssayCompetencyPerformance.essaysCount` — a contagem POR COMPETÊNCIA não
 *   aparece em lugar nenhum: o `CompetencyItem` desenha número, nome, barra e
 *   nota. A contagem que a tela mostra é a do estudante,
 *   `EssayStudentDetailsData.essaysCount`, e essa está no resumo.
 *
 * SEM ARQUIVO DE REGRA COMPARTILHADA, ao contrário de dois modais irmãos
 * (`activityProgress.ts`, `lessonProgress.ts`): este modal não tem condição
 * própria por linha que pudesse divergir entre tela e planilha. As duas únicas
 * decisões da tela são arredondamento — tratado em `roundToScreen` abaixo — e a
 * flexão de plural de "redação"/"redações", que a planilha não repete por
 * escrever a contagem como número.
 *
 * NOMES DE ABA FIXOS, e não o `labels.competencies` que a tela aceita: o rótulo
 * da seção é customizável pelo consumidor e não tem teto de tamanho nem
 * validação de caractere. Um rótulo com mais de 31 caracteres, ou com `: \ / ? *
 * [ ]`, faria o Excel recusar a PLANILHA INTEIRA. Hoje ninguém passa `labels`:
 * dentro da lib o único a renderizar este modal é o `SimulatedPerformanceView`,
 * e ele o faz sem a prop; nos apps, nenhum importa o modal direto — chegam nele
 * pela view. O componente é exportado no `src/index.ts`, então um consumidor
 * externo PODE passar `labels` e ver a aba divergir do título da seção; é o
 * preço aceito para que um rótulo arbitrário não possa quebrar o arquivo.
 */

/**
 * Nome da aba de indicadores: 19 caracteres.
 *
 * Sem o nome do estudante, que é o que o título do modal exibe: ele é variável e
 * sem teto de tamanho, o que daria um nome de aba instável. Dentro do limite de
 * 31 do Excel e sem nenhum dos caracteres que o formato proíbe (`: \ / ? * [ ]`).
 * É o mesmo nome que o `SimulatedStudentDetailsModal` usa — os dois modais
 * desenham o mesmo card de cabeçalho.
 */
export const SUMMARY_SHEET_NAME = 'Resumo do estudante';

/**
 * Nome da aba da lista: 26 caracteres.
 *
 * "competência" é a palavra da tela: o título da seção é "Competências" e a
 * lista vazia diz "Nenhuma competência encontrada".
 */
export const COMPETENCIES_SHEET_NAME = 'Desempenho por competência';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];

/**
 * Rótulos das linhas do resumo.
 *
 * Textos que a planilha acrescenta: no card da tela nada disso tem rótulo, e uma
 * tabela de chave/valor precisa de chave. Escola e turma saem em duas linhas,
 * embora o card as junte em `{school} - {class}`, porque duas linhas filtram do
 * outro lado e o traço não carrega informação.
 *
 * As duas linhas de nota trazem a escala no rótulo porque o card traz: ele
 * escreve "720" com um "/ 1000" ao lado e, logo abaixo, "72%". Sem a escala as
 * duas linhas seriam dois números soltos sem como distinguir um do outro.
 */
const STUDENT_ROW_LABEL = 'Estudante';
const SCHOOL_ROW_LABEL = 'Escola';
const CLASS_ROW_LABEL = 'Turma';
const ESSAYS_ROW_LABEL = 'Redações';
const AVERAGE_ROW_LABEL = 'Média (0-1000)';
const PERCENTAGE_ROW_LABEL = 'Aproveitamento (%)';
const PERFORMANCE_ROW_LABEL = 'Desempenho';

/**
 * Colunas da lista, na ordem em que o `CompetencyItem` as desenha: o número no
 * círculo, o nome, a barra de percentual e a nota que fecha a linha.
 *
 * A nota leva a escala pelo mesmo motivo do resumo: na tela ela vem com um
 * "/ 200" ao lado, e sem isso um "121" na planilha não diz sobre quanto é.
 */
const COMPETENCIES_HEADERS = [
  'Nº',
  'Competência',
  'Aproveitamento (%)',
  'Nota (0-200)',
];

/**
 * Arredondamento como a tela o faz, em célula NUMÉRICA — `72` e não `"72%"`.
 *
 * O "%" e o "/ 200" são formatação de exibição, e um número é o que permite
 * ordenar e somar do outro lado; é a mesma diferença deliberada que os modais
 * irmãos já adotam. `Math.round` é o que os três lugares da tela aplicam: a
 * média do card e cada nota de competência passam por `Math.round` direto
 * (`EssayStudentDetailsModal.tsx:158` e `:236`), o percentual do card por
 * `formatPercentageRounded` (`utils/utils.ts:32-34`) e o percentual de cada
 * linha pela `ProgressBar`, que escreve `Math.round(percentage)`
 * (`ProgressBar.tsx:576`).
 *
 * O que NÃO é copiado da `ProgressBar` são as defesas de entrada — ela também
 * troca `NaN` por 0 e limita o valor a 0..100 antes de arredondar
 * (`ProgressBar.tsx:164-170`) —, porque os percentuais chegam já calculados pelo
 * backend; um valor fora da faixa sairia diferente aqui e na tela, e é o número
 * cru que a planilha deve mostrar. É a mesma escolha dos modais irmãos.
 */
const roundToScreen = (value: number): number => Math.round(value);

/**
 * Aba de indicadores: uma linha por informação visível do cabeçalho, na ordem da
 * tela.
 *
 * @param data - O que o modal tem carregado; `null` nos estados de carregando,
 *   erro e sem-dado, em que a tela não desenha o card e a aba sai só com
 *   cabeçalho.
 */
export function buildSummarySheet(
  data: EssayStudentDetailsData | null
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const { student } = data;
  const rows: ExcelCell[][] = [
    [STUDENT_ROW_LABEL, student.name],
    [SCHOOL_ROW_LABEL, student.school],
    [CLASS_ROW_LABEL, student.class],
    [ESSAYS_ROW_LABEL, data.essaysCount],
    [AVERAGE_ROW_LABEL, roundToScreen(data.overallAverage)],
    [PERCENTAGE_ROW_LABEL, roundToScreen(data.overallPercentage)],
    [
      PERFORMANCE_ROW_LABEL,
      SIMULATED_PERFORMANCE_TAG_CONFIG[data.performance].label,
    ],
  ];

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba da lista de competências, uma linha por item, na ordem em que a tela as
 * enfileira.
 *
 * A aba existe mesmo com a lista vazia, embora a tela troque a lista por
 * "Nenhuma competência encontrada" nesse caso: uma aba só com cabeçalho diz "não
 * havia itens", enquanto um conjunto de abas que muda de tamanho conforme o dado
 * quebra quem consome o arquivo. A mensagem em si fica de fora — ela é a
 * ausência de linhas, e escrevê-la como linha inventaria uma competência que não
 * existe.
 */
export function buildCompetenciesSheet(
  data: EssayStudentDetailsData | null
): SheetConfig {
  const rows: ExcelCell[][] = (data?.competencies ?? []).map((competency) => [
    competency.number,
    competency.name,
    roundToScreen(competency.averagePercentage),
    roundToScreen(competency.averageScore),
  ]);

  return {
    name: COMPETENCIES_SHEET_NAME,
    headers: COMPETENCIES_HEADERS,
    rows,
  };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 *
 * São sempre DUAS, com dado ou sem: o resumo do card de cabeçalho e a lista de
 * competências. Não há nível nem página que mude a contagem.
 */
export function buildEssayStudentDetailsSheets(
  data: EssayStudentDetailsData | null
): SheetConfig[] {
  return [buildSummarySheet(data), buildCompetenciesSheet(data)];
}
