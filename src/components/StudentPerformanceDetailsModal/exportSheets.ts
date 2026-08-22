import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import { formatProgressText, hasActivityData } from './activityProgress';
import type {
  StudentPerformanceDetailsData,
  StudentPerformanceDetailsLabels,
} from './types';

/**
 * Montagem das abas do XLSX do `StudentPerformanceDetailsModal`. Funções puras:
 * nada de React, nada de requisição, nada de escrita em disco — quem grava o
 * arquivo é `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente:
 *
 * | Bloco na tela                                     | Onde foi parar             |
 * | ------------------------------------------------- | -------------------------- |
 * | nome do estudante (linha com o ícone de usuário)  | 1ª linha do resumo         |
 * | 3 cards coloridos (NOTA / CORRETAS / INCORRETAS)  | resumo, valor + badge      |
 * | 2 MetricBox (atividades, questões)                | resumo                     |
 * | 3 MetricBox (acessos, tempo online, último login) | resumo                     |
 * | lista de atividades (accordion)                   | aba "Desempenho atividades"|
 *
 * O tipo `StudentPerformanceDetailsData` carrega MAIS do que isso:
 * `contentsCompleted` está lá, marcado como deprecated, e o componente nunca o
 * renderiza. Ele fica de fora de propósito — mapear pelo tipo, e não pelo que a
 * tela desenha, poria na planilha um número que o professor nunca viu. Vale para
 * qualquer campo que venha a ser acrescentado ao tipo: só entra aqui depois de
 * entrar na tela.
 */

/**
 * Nome da aba de indicadores. Sem rótulo próprio na tela — o título do modal é
 * do consumidor (`labels.title`, hoje "Desempenho em 7 dias") e varia por
 * período, o que daria um nome de aba instável e sem teto de tamanho.
 *
 * 23 caracteres, dentro do limite de 31 do Excel (acima disso o arquivo INTEIRO
 * não abre), e sem nenhum dos caracteres que o formato proíbe (`: \ / ? * [ ]`).
 */
export const SUMMARY_SHEET_NAME = 'Desempenho do estudante';

/**
 * Nome da aba de atividades: 21 caracteres.
 *
 * Repete a palavra do título da seção na tela, mas é um literal e não
 * `labels.activitiesProgressTitle` — um rótulo customizado pelo consumidor
 * poderia passar dos 31 caracteres e derrubar a abertura do arquivo.
 */
export const ACTIVITIES_SHEET_NAME = 'Desempenho atividades';

/** O que os badges da tela mostram quando o tópico vem nulo. */
const EMPTY_BADGE = '-';

/**
 * Rótulo da linha do nome do estudante.
 *
 * Único texto da planilha que não está na tela: lá o nome aparece ao lado de um
 * ícone de usuário, sem rótulo, e uma tabela de chave/valor precisa de chave.
 */
const STUDENT_ROW_LABEL = 'Estudante';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];
const ACTIVITIES_HEADERS = ['Atividade', 'Progresso', 'Descrição'];

/**
 * Aba de indicadores: uma linha por rótulo/valor visível, na ordem da tela.
 *
 * Os rótulos saem do objeto `labels` já resolvido pelo componente, então o que
 * o consumidor customizou na tela aparece igual na planilha.
 *
 * Os valores numéricos vão como número, não como o texto formatado do card:
 * `9` e não `"9.0"`. É a única diferença deliberada em relação ao pixel — o
 * `.toFixed(1)` é formatação de exibição, e uma célula numérica é o que permite
 * ordenar e somar do outro lado. O dado é o mesmo.
 */
export function buildSummarySheet(
  data: StudentPerformanceDetailsData | null,
  labels: StudentPerformanceDetailsLabels
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const rows: ExcelCell[][] = [
    [STUDENT_ROW_LABEL, data.studentName],
    [labels.gradeLabel, data.grade.value],
    [labels.performanceTagLabel, data.grade.performanceLabel || EMPTY_BADGE],
    [labels.correctQuestionsLabel, data.correctQuestions.value],
    [
      labels.bestResultLabel,
      data.correctQuestions.bestResultTopic || EMPTY_BADGE,
    ],
    [labels.incorrectQuestionsLabel, data.incorrectQuestions.value],
    [
      labels.hardestTopicLabel,
      data.incorrectQuestions.hardestTopic || EMPTY_BADGE,
    ],
    [labels.activitiesLabel, data.activitiesCompleted],
    [labels.questionsLabel, data.questionsAnswered],
    [labels.accessCountLabel, data.accessCount],
    [labels.timeOnlineLabel, data.timeOnline],
    [labels.lastLoginLabel, data.lastLogin],
  ];

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba de atividades: uma linha por card do accordion.
 *
 * "Progresso" repete o texto do card — o de progresso quando há dados, a
 * mensagem de "sem dados" quando não há — usando as MESMAS funções que o
 * componente usa para decidir e formatar. "Descrição" é o conteúdo que o
 * accordion revela ao abrir, com o mesmo fallback.
 *
 * A aba existe mesmo com a lista vazia, embora a tela esconda a seção nesse
 * caso: uma aba só com cabeçalho diz "não havia atividades", enquanto um
 * conjunto de abas que muda de tamanho conforme o dado quebra quem consome o
 * arquivo.
 */
export function buildActivitiesSheet(
  data: StudentPerformanceDetailsData | null,
  labels: StudentPerformanceDetailsLabels
): SheetConfig {
  const rows: ExcelCell[][] = (data?.activities ?? []).map((activity) => [
    activity.name,
    hasActivityData(activity)
      ? formatProgressText(
          labels.activityProgressText,
          activity.correctCount,
          activity.totalCount
        )
      : labels.noDataMessage,
    activity.description || labels.activityDetailsUnavailable,
  ]);

  return { name: ACTIVITIES_SHEET_NAME, headers: ACTIVITIES_HEADERS, rows };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 */
export function buildStudentPerformanceSheets(
  data: StudentPerformanceDetailsData | null,
  labels: StudentPerformanceDetailsLabels
): SheetConfig[] {
  return [buildSummarySheet(data, labels), buildActivitiesSheet(data, labels)];
}
