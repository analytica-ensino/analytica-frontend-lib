import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import { SIMULATED_PERFORMANCE_TAG_CONFIG } from '../SimulatedStudentDetailsModal/types';
import type {
  EssayCompetenceDetailsData,
  EssayCompetenceStudentItem,
} from './types';

/**
 * Montagem das abas do XLSX do `EssayCompetenceDetailsModal`. Funções puras:
 * nada de React, nada de requisição, nada de escrita em disco — quem busca as
 * páginas é `fetchAllCompetenceStudents` e quem grava o arquivo é
 * `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente, conferidos linha
 * a linha em `EssayCompetenceDetailsModal.tsx`:
 *
 * | Bloco na tela                                   | Onde foi parar             |
 * | ----------------------------------------------- | -------------------------- |
 * | título "C{n} - {nome}"                          | resumo, 1ª linha           |
 * | subtítulo "Redação • N redações • N alunos"     | resumo, duas linhas        |
 * | card "Acima da média"                           | resumo                     |
 * | card "Abaixo da média"                          | resumo                     |
 * | card "Ponto de atenção"                         | resumo                     |
 * | tabela de estudantes                            | "Desempenho por estudante" |
 *
 * O TÍTULO VIRA LINHA, ao contrário do irmão `SimulatedContentDetailsModal`, em
 * que ele foi deixado de fora. A diferença é que lá o título é o rótulo fixo
 * "Desempenho competência" e o nome da competência aparecia logo abaixo, no
 * card; aqui o título é o ÚNICO lugar em que a competência se identifica — não
 * há card de cabeçalho — e sem ele a planilha não diria de que competência é.
 *
 * "Redação", a primeira palavra do subtítulo, NÃO vira linha: é literal fixo da
 * tela, não dado do relatório. Os dois números que a seguem viram duas linhas
 * porque cada um é um dado diferente, e o "•" é só separador visual.
 *
 * SEM TEXTO LONGO PARA DECIDIR: este modal não desenha texto de redação nem
 * comentário de corretor, e `EssayCompetenceDetailsData` também não os carrega
 * (`types.ts`). A única string acima de um punhado de palavras é o NOME da
 * competência, uma frase do ENEM na casa das dezenas de caracteres, e ela vai
 * INTEIRA na primeira linha do resumo — em vez de truncada — porque a tela
 * também a escreve inteira no `<h2>`: truncar aqui inventaria uma perda que o
 * usuário não tem, e o valor está longe do teto de 32.767 caracteres por célula
 * do Excel. Se algum dia o modal ganhar o texto da redação, a decisão terá de
 * ser refeita no outro sentido: um corpo de redação por linha estoura a leitura
 * de uma planilha e pediria uma aba própria.
 *
 * O QUE FICA DE FORA, e por quê. Mapear pelo tipo, e não pelo que a tela
 * desenha, poria na planilha número que o professor nunca viu:
 *
 * - `classAverage` e `classAveragePercentage` — a média da turma vem no payload
 *   e NÃO é desenhada em lugar nenhum do modal;
 * - `competence.number` e `competence.name` — o payload os traz, mas o `<h2>`
 *   monta o título com as PROPS `competenceNumber`/`competenceName`, então o
 *   texto que o usuário lê é o que o parâmetro `competenceTitle` carrega;
 * - `counters.highlight` e `counters.aboveAverage` separados — a tela os SOMA em
 *   um card só; escrever os dois mostraria um recorte que nenhum card exibe;
 * - `EssayCompetenceStudentItem.averagePercentage` e `.essaysCount` — a linha da
 *   tabela desenha `{Math.round(averageScore)}/200` e o badge, e nada mais;
 * - `EssayCompetenceStudentItem.studentId` — nunca renderizado, e
 *   `.userInstitutionId` só serve de `rowKey` da tabela;
 * - `students.page`, `.limit` e `.total` — paginação da API. `total` alimenta o
 *   rodapé de paginação, que é controle de tela e não sai nem no PDF.
 *
 * TABELA PAGINADA: a aba de estudantes recebe a lista COMPLETA, varrida página a
 * página por `fetchAllCompetenceStudents`, e não os 10 registros que a tela
 * mostra. É a diferença deliberada entre os dois formatos — o PDF é a foto do
 * modal e leva a página visível; a planilha leva a tabela inteira, que é o que
 * se espera de um arquivo feito para filtrar e somar. Por isso esta aba não lê
 * `data.students.data`: quem a preenche é o parâmetro `students`.
 */

/**
 * Nome da aba de indicadores: 21 caracteres.
 *
 * Dentro do limite de 31 do Excel (acima disso o arquivo INTEIRO não abre) e sem
 * nenhum dos caracteres que o formato proíbe (`: \ / ? * [ ]`). Sem o nome da
 * competência, que é variável e sem teto de tamanho — ele vai na primeira linha
 * da aba, onde nenhum limite se aplica.
 */
export const SUMMARY_SHEET_NAME = 'Resumo da competência';

/**
 * Nome da aba da tabela: 24 caracteres.
 *
 * O mesmo nome que o `SimulatedContentDetailsModal` usa: as duas abas são a
 * mesma coisa — uma linha por estudante da tabela do modal. São arquivos
 * distintos, então não há colisão a resolver.
 */
export const STUDENTS_SHEET_NAME = 'Desempenho por estudante';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];

/**
 * Rótulos das linhas do resumo.
 *
 * O primeiro é texto que a planilha acrescenta: o título da tela não tem rótulo,
 * e uma tabela de chave/valor precisa de chave. Os dois seguintes são as
 * palavras do próprio subtítulo ("redações", "alunos"), com inicial maiúscula.
 *
 * Os três últimos repetem, palavra por palavra, o rótulo escrito embaixo de cada
 * card de contagem.
 */
const COMPETENCE_ROW_LABEL = 'Competência';
const ESSAYS_ROW_LABEL = 'Redações';
const STUDENTS_ROW_LABEL = 'Alunos';
const ABOVE_AVERAGE_ROW_LABEL = 'Acima da média';
const BELOW_AVERAGE_ROW_LABEL = 'Abaixo da média';
const ATTENTION_ROW_LABEL = 'Ponto de atenção';

/**
 * Colunas da aba de estudantes, na ordem em que `TABLE_COLUMNS` as desenha:
 * Nome, Escola, Ano, Turma, Média e o badge de proficiência.
 *
 * "Média (0-200)" traz a escala no cabeçalho porque a célula é numérica — a tela
 * escreve "146/200", e o "/200" é formatação de exibição. Número é o que permite
 * ordenar e somar do outro lado; é a mesma escolha dos modais irmãos.
 */
const STUDENTS_HEADERS = [
  'Nome',
  'Escola',
  'Ano',
  'Turma',
  'Média (0-200)',
  'Proficiência',
];

/**
 * Rótulo do badge quando a proficiência não tem configuração.
 *
 * É o MESMO fallback da coluna "Proficiência" da tela
 * (`tagConfig?.label ?? 'Desconhecido'`): a planilha tem de escrever o texto que
 * o usuário leu, inclusive quando o backend manda uma tag que esta versão da lib
 * não conhece.
 */
const UNKNOWN_PERFORMANCE_LABEL = 'Desconhecido';

/**
 * Arredondamento da coluna de média, igual ao da tela.
 *
 * `Math.round` é o que a coluna aplica (`Math.round(student.averageScore)`). O
 * valor chega do backend já em escala 0-200, então não há normalização a repetir
 * aqui — é o número cru que a planilha deve mostrar. Mesma escolha dos modais
 * irmãos.
 */
const round = (value: number): number => Math.round(value);

/**
 * Aba de indicadores: uma linha por informação visível do topo do modal, na
 * ordem da tela — o título, os dois números do subtítulo e os três contadores.
 *
 * A linha "Acima da média" carrega a SOMA de `highlight` e `aboveAverage`, que é
 * a conta que o card faz (`aboveAverageCount` no componente). Escrever as duas
 * parcelas mostraria um recorte que a tela não exibe.
 *
 * @param data - O que o modal tem carregado; `null` nos estados de carregando,
 *   erro e sem-dado, em que a tela não desenha nem subtítulo nem cards e a aba
 *   sai só com cabeçalho.
 * @param competenceTitle - O título que o `<h2>` está exibindo. Vem do
 *   componente, e não de `data.competence`, porque a tela o monta a partir das
 *   PROPS `competenceNumber`/`competenceName` e ignora o payload — a planilha
 *   tem de escrever o mesmo texto que o usuário leu.
 */
export function buildSummarySheet(
  data: EssayCompetenceDetailsData | null,
  competenceTitle: string
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const { counters } = data;
  const rows: ExcelCell[][] = [
    [COMPETENCE_ROW_LABEL, competenceTitle],
    [ESSAYS_ROW_LABEL, data.totalEssays],
    [STUDENTS_ROW_LABEL, data.totalStudents],
    [ABOVE_AVERAGE_ROW_LABEL, counters.highlight + counters.aboveAverage],
    [BELOW_AVERAGE_ROW_LABEL, counters.belowAverage],
    [ATTENTION_ROW_LABEL, counters.attentionPoint],
  ];

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba da tabela: uma linha por estudante, com as seis colunas da tela.
 *
 * @param students - A lista COMPLETA, varrida por `fetchAllCompetenceStudents`.
 *   `null` quando a tela não desenhou tabela nenhuma (carregando, erro,
 *   sem-dado) — nesses casos não houve varredura e a aba sai só com cabeçalho,
 *   que é o mesmo resultado de uma tabela vazia. Uma aba só com cabeçalho diz
 *   "não havia estudantes"; um conjunto de abas que muda de tamanho conforme o
 *   dado quebra quem consome o arquivo.
 */
export function buildStudentsSheet(
  students: EssayCompetenceStudentItem[] | null
): SheetConfig {
  const rows: ExcelCell[][] = (students ?? []).map((student) => [
    student.name,
    student.school,
    student.schoolYear,
    student.class,
    round(student.averageScore),
    SIMULATED_PERFORMANCE_TAG_CONFIG[student.performance]?.label ??
      UNKNOWN_PERFORMANCE_LABEL,
  ]);

  return { name: STUDENTS_SHEET_NAME, headers: STUDENTS_HEADERS, rows };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 *
 * São sempre DUAS, em qualquer estado: o resumo do topo e a tabela de
 * estudantes.
 */
export function buildEssayCompetenceDetailsSheets(
  data: EssayCompetenceDetailsData | null,
  competenceTitle: string,
  students: EssayCompetenceStudentItem[] | null
): SheetConfig[] {
  return [
    buildSummarySheet(data, competenceTitle),
    buildStudentsSheet(students),
  ];
}
