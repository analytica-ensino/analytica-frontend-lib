import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import type { ContentDetailsData, ContentStudentItem } from './types';

/**
 * Montagem das abas do XLSX do `SimulatedContentDetailsModal`. Funções puras:
 * nada de React, nada de requisição, nada de escrita em disco — quem busca as
 * páginas é `fetchAllContentStudents` e quem grava o arquivo é `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente:
 *
 * | Bloco na tela                                        | Onde foi parar               |
 * | ---------------------------------------------------- | ---------------------------- |
 * | card do topo: nome da competência                    | resumo                       |
 * | card do topo: código BNCC (só quando existe)         | resumo                       |
 * | card do topo: "{matéria} • N questões • N alunos"    | resumo, três linhas          |
 * | 3 cards de contagem (acima / na / abaixo da média)   | resumo, três linhas          |
 * | tabela de estudantes                                 | "Desempenho por estudante"   |
 *
 * O título do modal ("Desempenho competência") NÃO vira linha: é rótulo fixo da
 * tela, não dado do relatório, e o nome da competência logo abaixo já diz de
 * quem é o arquivo.
 *
 * O QUE FICA DE FORA, e por quê: mapear pelo tipo, e não pelo que a tela
 * desenha, poria na planilha valor que o professor nunca viu. Conferido campo a
 * campo no componente:
 *
 * - `ContentDetailsInfo.id` e `.subject.id` — identificadores, nenhum é escrito;
 * - `ContentStudentItem.studentId` e `.institutionId` — idem;
 * - `ContentStudentItem.userInstitutionId` — só serve de `rowKey` da tabela
 *   (`SimulatedContentDetailsModal.tsx`), não é coluna;
 * - `students.page`, `.limit` e `.total` — paginação da API. `total` alimenta o
 *   rodapé de paginação, que é controle de tela e não sai nem no PDF.
 *
 * TABELA PAGINADA: a aba de estudantes recebe a lista COMPLETA, varrida página a
 * página por `fetchAllContentStudents`, e não os 10 registros que a tela mostra.
 * É a diferença deliberada entre os dois formatos — o PDF é a foto do modal e
 * leva a página visível; a planilha leva a tabela inteira, que é o que se espera
 * de um arquivo feito para filtrar e somar. Por isso esta aba não lê
 * `data.students.data`: quem a preenche é o parâmetro `students`.
 */

/**
 * Nome da aba de indicadores: 21 caracteres.
 *
 * "competência" e não "habilidade": o título do modal escreve "Desempenho
 * competência" (`SimulatedContentDetailsModal.tsx`), então é essa a palavra que
 * o usuário lê nesta tela. O tipo e a mensagem de erro do hook chamam de
 * "conteúdo"/"habilidade", e nenhum dos dois aparece na tela.
 *
 * Dentro do limite de 31 do Excel (acima disso o arquivo INTEIRO não abre) e sem
 * nenhum dos caracteres que o formato proíbe (`: \ / ? * [ ]`).
 */
export const SUMMARY_SHEET_NAME = 'Resumo da competência';

/** Nome da aba da tabela: 24 caracteres. */
export const STUDENTS_SHEET_NAME = 'Desempenho por estudante';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];

/**
 * Rótulos das linhas do resumo.
 *
 * Textos que a planilha acrescenta: no card da tela o nome, o código e a linha
 * "{matéria} • N questões • N alunos" aparecem sem rótulo nenhum, e uma tabela
 * de chave/valor precisa de chave. A linha corrida do card vira três linhas
 * porque cada pedaço dela é um dado diferente, e o "•" é só separador visual.
 *
 * Os três últimos repetem, palavra por palavra, o rótulo escrito embaixo de cada
 * card de contagem.
 */
const CONTENT_ROW_LABEL = 'Competência';
const BNCC_ROW_LABEL = 'Código BNCC';
const SUBJECT_ROW_LABEL = 'Matéria';
const QUESTIONS_ROW_LABEL = 'Questões';
const STUDENTS_ROW_LABEL = 'Alunos';
const ABOVE_AVERAGE_ROW_LABEL = 'Acima da média';
const AT_AVERAGE_ROW_LABEL = 'Na média';
const BELOW_AVERAGE_ROW_LABEL = 'Abaixo da média';

/**
 * Colunas da aba de estudantes, na ordem em que `TABLE_COLUMNS` as desenha:
 * Nome, Escola, Ano, Turma, Média e a barra de desempenho.
 *
 * "Desempenho (%)" traz a unidade no cabeçalho porque a célula é numérica — a
 * tela escreve "72%" ao lado da barra, e o "%" é formatação de exibição. Número
 * é o que permite ordenar e somar do outro lado; é a mesma escolha dos modais
 * irmãos.
 */
const STUDENTS_HEADERS = [
  'Nome',
  'Escola',
  'Ano',
  'Turma',
  'Média',
  'Desempenho (%)',
];

/**
 * Arredondamento das duas colunas numéricas, igual ao da tela.
 *
 * A média passa por `Math.round` direto na coluna "Média" e o desempenho por
 * `formatPercentageRounded` (`utils/utils.ts`), que é `Math.round` mais o
 * sufixo. Os dois campos chegam do backend já calculados — `average` em escala
 * 0-1000 e `performance` em 0-100 —, então não há normalização a repetir aqui.
 */
const round = (value: number): number => Math.round(value);

/**
 * Aba de indicadores: uma linha por informação visível do topo do modal, na
 * ordem da tela — primeiro o card da competência, depois os três contadores.
 *
 * A linha do código BNCC só existe quando o código existe, que é exatamente a
 * condição do `{data.content.bnccCode && ...}` da tela. Uma linha "Código BNCC"
 * vazia diria que a competência tem um código em branco; a tela, nesse caso, não
 * mostra nada.
 *
 * @param data - O que o modal tem carregado; `null` nos estados de carregando,
 *   erro e sem-dado, em que a tela não desenha o card e a aba sai só com
 *   cabeçalho.
 * @param contentDisplayName - O nome que o card está exibindo. Vem do
 *   componente, e não de `data.content.name`, porque a tela aplica o fallback
 *   `data.content.name || contentName` (a prop) — a planilha tem de escrever o
 *   mesmo texto que o usuário leu.
 */
export function buildSummarySheet(
  data: ContentDetailsData | null,
  contentDisplayName: string
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const { content, counters } = data;
  const rows: ExcelCell[][] = [[CONTENT_ROW_LABEL, contentDisplayName]];

  if (content.bnccCode) {
    rows.push([BNCC_ROW_LABEL, content.bnccCode]);
  }

  rows.push(
    [SUBJECT_ROW_LABEL, content.subject.name],
    [QUESTIONS_ROW_LABEL, content.questionsCount],
    [STUDENTS_ROW_LABEL, content.studentsCount],
    [ABOVE_AVERAGE_ROW_LABEL, counters.aboveAverage],
    [AT_AVERAGE_ROW_LABEL, counters.atAverage],
    [BELOW_AVERAGE_ROW_LABEL, counters.belowAverage]
  );

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba da tabela: uma linha por estudante, com as seis colunas da tela.
 *
 * @param students - A lista COMPLETA, varrida por `fetchAllContentStudents`.
 *   `null` quando a tela não desenhou tabela nenhuma (carregando, erro,
 *   sem-dado) — nesses casos não houve varredura e a aba sai só com cabeçalho,
 *   que é o mesmo resultado de uma tabela vazia. Uma aba só com cabeçalho diz
 *   "não havia estudantes"; um conjunto de abas que muda de tamanho conforme o
 *   dado quebra quem consome o arquivo.
 */
export function buildStudentsSheet(
  students: ContentStudentItem[] | null
): SheetConfig {
  const rows: ExcelCell[][] = (students ?? []).map((student) => [
    student.name,
    student.school,
    student.schoolYear,
    student.class,
    round(student.average),
    round(student.performance),
  ]);

  return { name: STUDENTS_SHEET_NAME, headers: STUDENTS_HEADERS, rows };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 *
 * São sempre DUAS, em qualquer estado: o resumo do topo e a tabela de
 * estudantes.
 */
export function buildSimulatedContentDetailsSheets(
  data: ContentDetailsData | null,
  contentDisplayName: string,
  students: ContentStudentItem[] | null
): SheetConfig[] {
  return [
    buildSummarySheet(data, contentDisplayName),
    buildStudentsSheet(students),
  ];
}
