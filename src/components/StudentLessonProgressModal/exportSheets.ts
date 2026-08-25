import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import { hasContentData, roundProgress } from './lessonProgress';
import type {
  StudentLessonProgressData,
  StudentLessonProgressLabels,
} from './types';

/**
 * Montagem das abas do XLSX do `StudentLessonProgressModal`. Funções puras:
 * nada de React, nada de requisição, nada de escrita em disco — quem grava o
 * arquivo é `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente:
 *
 * | Bloco na tela                                    | Onde foi parar               |
 * | ------------------------------------------------ | ---------------------------- |
 * | nome do estudante (linha com a lupa)             | 1ª linha do resumo           |
 * | ProgressCircle de conclusão                      | resumo                       |
 * | card MELHOR RESULTADO                            | resumo                       |
 * | card MAIOR DIFICULDADE                           | resumo                       |
 * | acordeão tópico → subtópico → aula               | aba "Conclusão das aulas"    |
 *
 * Todo campo de `StudentLessonProgressData` chega a uma dessas células; o único
 * que não vira coluna própria é `ContentProgressItem.isCompleted`, e ele não
 * está de fora — é o que decide, junto com `progress`, se a aula sai com
 * percentual ou com a mensagem de sem-dados, exatamente como na tela (veja
 * `hasContentData`).
 */

/**
 * Nome da aba de indicadores. Sem rótulo próprio na tela — o título do modal é
 * do consumidor (`labels.title`, "Desempenho" por padrão) e pode ser trocado
 * por qualquer coisa, o que daria um nome de aba instável e sem teto de
 * tamanho.
 *
 * 19 caracteres, dentro do limite de 31 do Excel (acima disso o arquivo INTEIRO
 * não abre), e sem nenhum dos caracteres que o formato proíbe (`: \ / ? * [ ]`).
 */
export const SUMMARY_SHEET_NAME = 'Resumo do estudante';

/**
 * Nome da aba do acordeão: 19 caracteres.
 *
 * Repete o título da seção na tela, mas é um literal e não
 * `labels.lessonProgressTitle` — um rótulo customizado pelo consumidor poderia
 * passar dos 31 caracteres e derrubar a abertura do arquivo.
 */
export const LESSONS_SHEET_NAME = 'Conclusão das aulas';

/** O que os cards da tela mostram quando o tópico vem nulo. */
const EMPTY_CARD = '-';

/**
 * Célula vazia das colunas de hierarquia — e do percentual de um subtópico sem
 * dados, que a tela também deixa em branco.
 */
const EMPTY_CELL = '';

/**
 * Rótulo da linha do nome do estudante.
 *
 * Único texto da planilha que não está na tela: lá o nome aparece ao lado de um
 * ícone de lupa, sem rótulo, e uma tabela de chave/valor precisa de chave.
 */
const STUDENT_ROW_LABEL = 'Estudante';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];

/**
 * Uma coluna por nível do acordeão, e não uma coluna "Nível": a indentação da
 * tela vira posição da célula, então dá para ler a hierarquia de relance e para
 * filtrar por tópico do outro lado.
 *
 * "Progresso (%)" carrega a unidade porque a célula vai NUMÉRICA — `70` e não
 * `"70%"`. É a única diferença deliberada em relação ao pixel, a mesma que o
 * `StudentPerformanceDetailsModal` já adota: o "%" é formatação de exibição, e
 * uma célula numérica é o que permite ordenar e somar. A coluna é de tipo misto
 * de propósito — as linhas sem dado levam a mensagem de texto que a tela
 * mostra, em vez de um zero que mentiria.
 */
const LESSONS_HEADERS = ['Tópico', 'Subtópico', 'Aula', 'Progresso (%)'];

/**
 * Aba de indicadores: uma linha por rótulo/valor visível, na ordem da tela.
 *
 * Os rótulos saem do objeto `labels` já resolvido pelo componente, então o que
 * o consumidor customizou na tela aparece igual na planilha.
 *
 * O percentual de conclusão é arredondado como o `ProgressCircle` arredonda.
 * O que NÃO é copiado dele são as defesas de entrada — o círculo também limita
 * o valor a 0..100 e troca `NaN` por 0 (`ProgressCircle.tsx:130-131`) —, porque
 * `overallCompletionRate` chega como percentual já calculado pelo backend; um
 * valor fora da faixa sairia diferente aqui e na tela, e é o número cru que a
 * planilha deve mostrar.
 */
export function buildSummarySheet(
  data: StudentLessonProgressData | null,
  labels: StudentLessonProgressLabels
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const rows: ExcelCell[][] = [
    [STUDENT_ROW_LABEL, data.name],
    [labels.completionRateLabel, roundProgress(data.overallCompletionRate)],
    [labels.bestResultLabel, data.bestResult || EMPTY_CARD],
    [labels.biggestDifficultyLabel, data.biggestDifficulty || EMPTY_CARD],
  ];

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba do acordeão: uma linha por linha que a tela empilha, em profundidade —
 * tópico, seus subtópicos, e as aulas de cada subtópico —, na mesma ordem do
 * DOM.
 *
 * Subtópicos e aulas entram mesmo estando dentro de um acordeão fechado: eles
 * são renderizados de qualquer jeito e só ficam escondidos por CSS
 * (`max-h-0 opacity-0`), então abrir o acordeão não muda o que existe na tela,
 * só o que está visível. Exportar apenas o que o professor deixou aberto faria
 * o arquivo depender de cliques.
 *
 * A coluna de progresso repete o que cada nível mostra, com as MESMAS regras do
 * componente, e elas não são a mesma nos três:
 *
 * - tópico `no_data`: a barra dá lugar à mensagem de sem-dados;
 * - subtópico `no_data`: a tela não escreve NADA ao lado do nome — nem
 *   percentual, nem mensagem —, e a célula fica vazia por isso;
 * - aula: decide por `hasContentData`, não por `status`, que esse nível não tem.
 *
 * A aba existe mesmo com a lista vazia, embora a tela esconda a seção nesse
 * caso: uma aba só com cabeçalho diz "não havia aulas", enquanto um conjunto de
 * abas que muda de tamanho conforme o dado quebra quem consome o arquivo.
 */
export function buildLessonsSheet(
  data: StudentLessonProgressData | null,
  labels: StudentLessonProgressLabels
): SheetConfig {
  const rows: ExcelCell[][] = [];

  for (const topic of data?.lessonProgress ?? []) {
    rows.push([
      topic.topic.name,
      EMPTY_CELL,
      EMPTY_CELL,
      topic.status === 'no_data'
        ? labels.noDataMessage
        : roundProgress(topic.progress),
    ]);

    for (const subtopic of topic.subtopics) {
      rows.push([
        EMPTY_CELL,
        subtopic.subtopic.name,
        EMPTY_CELL,
        subtopic.status === 'no_data'
          ? EMPTY_CELL
          : roundProgress(subtopic.progress),
      ]);

      for (const content of subtopic.contents) {
        rows.push([
          EMPTY_CELL,
          EMPTY_CELL,
          content.content.name,
          hasContentData(content)
            ? roundProgress(content.progress)
            : labels.noDataMessage,
        ]);
      }
    }
  }

  return { name: LESSONS_SHEET_NAME, headers: LESSONS_HEADERS, rows };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 */
export function buildStudentLessonProgressSheets(
  data: StudentLessonProgressData | null,
  labels: StudentLessonProgressLabels
): SheetConfig[] {
  return [buildSummarySheet(data, labels), buildLessonsSheet(data, labels)];
}
