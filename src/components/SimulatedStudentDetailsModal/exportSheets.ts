import type { ExcelCell, SheetConfig } from '../../utils/exportExcel';
import {
  isStudentSubjectsData,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  type StudentDetailsData,
} from './types';

/**
 * Montagem das abas do XLSX do `SimulatedStudentDetailsModal`. Funções puras:
 * nada de React, nada de requisição, nada de escrita em disco — quem grava o
 * arquivo é `downloadExcel`.
 *
 * REGRA QUE GOVERNA ESTE ARQUIVO: a planilha traz o que o modal DESENHA, nada
 * mais e nada menos. As abas espelham os blocos do componente:
 *
 * | Bloco na tela                                     | Onde foi parar               |
 * | ------------------------------------------------- | ---------------------------- |
 * | título (nome da matéria, só no nível 2)           | 1ª linha do resumo           |
 * | card do estudante: nome                           | resumo                       |
 * | card do estudante: "escola - turma"               | resumo, duas linhas          |
 * | card do estudante: média                          | resumo                       |
 * | card do estudante: badge de desempenho            | resumo                       |
 * | lista de matérias (nível 1)                       | "Desempenho por matéria"     |
 * | lista de habilidades (nível 2)                    | "Desempenho por habilidade"  |
 *
 * NAVEGAÇÃO EM CASCATA: a segunda aba é a do nível VISÍVEL, uma só, nunca as
 * duas. Não é escolha estética — é a única que o princípio permite. O
 * `useSimulatedStudentDetails` guarda um `data` único e o TROCA a cada
 * navegação (`fetchDetails` faz `setData(null)` antes de gravar a resposta,
 * `useSimulatedStudentDetails.ts:83` e `:95`), então enquanto o nível 2 está na
 * tela a lista de matérias já não existe em memória, e vice-versa. Levar os
 * dois níveis exigiria disparar requisições que a tela não fez — uma por
 * matéria, no caso do nível 2, que só carrega a matéria clicada.
 *
 * O QUE FICA DE FORA, e por quê: mapear pelo tipo, e não pelo que a tela
 * desenha, poria na planilha número que o professor nunca viu. Conferido campo
 * a campo no componente:
 *
 * - `StudentDetailsInfo.studentId`, `.institutionId` e `.schoolYear` — o card
 *   escreve `{school} - {class}`, e o ano escolar não aparece em lugar nenhum;
 * - `SubjectPerformanceItem.icon` — nunca renderizado;
 * - `SubjectPerformanceItem.color` — vira um ponto colorido, não texto;
 * - `SubjectPerformanceItem.performance.correct` e `.incorrect` — o nível 1
 *   mostra só a barra de percentual e a contagem de questões; a contagem de
 *   acertos aparece apenas no nível 2 ("3 de 4");
 * - `StudentContentPerformanceItem.performance.incorrect` — idem, nenhum nível
 *   o escreve;
 * - `page`, `limit` e `total` — paginação de API, sem controle na tela;
 * - `StudentContentsData.subject` — o nome da matéria SAI na planilha, mas pela
 *   `subjectName` que o componente passa, não por este campo: quem o título do
 *   modal desenha é o `selectedSubject` do estado local
 *   (`SimulatedStudentDetailsModal.tsx:100`). Os dois carregam o mesmo nome,
 *   vindos da mesma API; a planilha usa o que o usuário lê.
 *
 * SEM ARQUIVO DE REGRA COMPARTILHADA, ao contrário dos dois modais irmãos
 * (`activityProgress.ts`, `lessonProgress.ts`): este modal não tem condição
 * própria por linha para as duas cópias divergirem. A única decisão que a
 * planilha repete da tela é qual nível está aberto, e o predicado dela —
 * `isStudentSubjectsData` — já mora em `types.ts` e já é o que o componente usa
 * (`SimulatedStudentDetailsModal.tsx:145`), então é ele que este arquivo
 * importa.
 */

/**
 * Nome da aba de indicadores: 19 caracteres.
 *
 * Sem rótulo próprio na tela — o título do modal é `Desempenho de {nome}` no
 * nível 1 e o nome da matéria no nível 2, os dois variáveis e sem teto de
 * tamanho, o que daria um nome de aba instável. Dentro do limite de 31 do Excel
 * (acima disso o arquivo INTEIRO não abre) e sem nenhum dos caracteres que o
 * formato proíbe (`: \ / ? * [ ]`).
 */
export const SUMMARY_SHEET_NAME = 'Resumo do estudante';

/** Nome da aba do nível 1: 22 caracteres. */
export const SUBJECTS_SHEET_NAME = 'Desempenho por matéria';

/**
 * Nome da aba do nível 2: 25 caracteres.
 *
 * "habilidade" e não "conteúdo", que é como o TIPO chama
 * (`StudentContentPerformanceItem`): a tela escreve "Nenhuma habilidade
 * encontrada" quando a lista vem vazia, então é essa a palavra que o produto
 * usa para este nível.
 */
export const CONTENTS_SHEET_NAME = 'Desempenho por habilidade';

/** Célula sem valor — o código BNCC que a tela omite quando vem nulo. */
const EMPTY_CELL = '';

const SUMMARY_HEADERS = ['Indicador', 'Valor'];

/**
 * Rótulos das linhas do resumo.
 *
 * Textos que a planilha acrescenta: no card da tela nome, escola, turma, média
 * e badge aparecem sem rótulo nenhum, e uma tabela de chave/valor precisa de
 * chave. Escola e turma saem em duas linhas, embora o card as junte em
 * `{school} - {class}`, porque duas colunas filtram do outro lado e o traço não
 * carrega informação.
 */
const SUBJECT_ROW_LABEL = 'Matéria';
const STUDENT_ROW_LABEL = 'Estudante';
const SCHOOL_ROW_LABEL = 'Escola';
const CLASS_ROW_LABEL = 'Turma';
const AVERAGE_ROW_LABEL = 'Média';
const PERFORMANCE_ROW_LABEL = 'Desempenho';

/**
 * Colunas do nível 1, na ordem em que o `SubjectItem` as desenha: nome,
 * contagem de questões, barra de percentual.
 */
const SUBJECTS_HEADERS = ['Matéria', 'Questões', 'Acertos (%)'];

/**
 * Colunas do nível 2, na ordem em que o `ContentItem` as desenha: nome, código
 * BNCC, contagem de questões, barra de percentual e a contagem de acertos que
 * fecha a linha ("3 de 4" — o total já é a coluna "Questões").
 */
const CONTENTS_HEADERS = [
  'Habilidade',
  'Código BNCC',
  'Questões',
  'Acertos (%)',
  'Acertos',
];

/**
 * Percentual como a tela o arredonda, em célula NUMÉRICA — `75` e não `"75%"`.
 *
 * O "%" é formatação de exibição, e um número é o que permite ordenar e somar
 * do outro lado; é a mesma diferença deliberada que os dois modais irmãos já
 * adotam. `Math.round` é o que os dois lugares da tela aplicam: a média do card
 * passa por `formatPercentageRounded` (`utils/utils.ts:32-34`) e o percentual
 * de cada linha pela `ProgressBar`, que escreve `Math.round(percentage)`
 * (`ProgressBar.tsx:576`).
 *
 * O que NÃO é copiado da `ProgressBar` são as defesas de entrada — ela também
 * troca `NaN` por 0 e limita o valor a 0..100 antes de arredondar
 * (`ProgressBar.tsx:164-170`) —, porque `correctPercentage` e `average` chegam
 * como percentual já calculado pelo backend; um valor fora da faixa sairia
 * diferente aqui e na tela, e é o número cru que a planilha deve mostrar. É a
 * mesma escolha que o `StudentLessonProgressModal` fez diante do
 * `ProgressCircle`.
 */
const roundPercentage = (value: number): number => Math.round(value);

/**
 * Aba de indicadores: uma linha por informação visível do cabeçalho, na ordem
 * da tela.
 *
 * A linha da matéria só existe quando a tela mostra o nome dela — isto é, no
 * nível 2, onde ela é o TÍTULO do modal, acima do card. Por isso vem primeiro.
 * No nível 1 o título é `Desempenho de {nome}`, que não acrescenta nada à linha
 * "Estudante" logo abaixo.
 *
 * @param data - O que o modal tem carregado; `null` nos estados de carregando,
 *   erro e sem-dado, em que a tela não desenha o card e a aba sai só com
 *   cabeçalho.
 * @param subjectName - O nome que o título do modal está exibindo, ou `null` no
 *   nível 1. Vem do componente, não de `data`, porque é o estado local
 *   `selectedSubject` que a tela renderiza.
 */
export function buildSummarySheet(
  data: StudentDetailsData | null,
  subjectName: string | null
): SheetConfig {
  if (!data) {
    return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows: [] };
  }

  const { student } = data;
  const rows: ExcelCell[][] = [];

  if (subjectName) {
    rows.push([SUBJECT_ROW_LABEL, subjectName]);
  }

  rows.push(
    [STUDENT_ROW_LABEL, student.name],
    [SCHOOL_ROW_LABEL, student.school],
    [CLASS_ROW_LABEL, student.class],
    [AVERAGE_ROW_LABEL, roundPercentage(student.average)],
    [
      PERFORMANCE_ROW_LABEL,
      SIMULATED_PERFORMANCE_TAG_CONFIG[student.performance].label,
    ]
  );

  return { name: SUMMARY_SHEET_NAME, headers: SUMMARY_HEADERS, rows };
}

/**
 * Aba da lista: a do nível que está aberto, uma linha por item.
 *
 * Sem dado carregado cai no nível 1, que é onde o modal sempre abre — o efeito
 * de abertura busca com `subjectId: null`
 * (`SimulatedStudentDetailsModal.tsx:43-48`).
 *
 * A aba existe mesmo com a lista vazia, embora a tela troque a lista por
 * "Nenhuma matéria encontrada" / "Nenhuma habilidade encontrada" nesse caso:
 * uma aba só com cabeçalho diz "não havia itens", enquanto um conjunto de abas
 * que muda de tamanho conforme o dado quebra quem consome o arquivo. A mensagem
 * em si fica de fora — ela é a ausência de linhas, e escrevê-la como linha
 * inventaria um item que não existe.
 */
export function buildDetailsSheet(
  data: StudentDetailsData | null
): SheetConfig {
  if (data && !isStudentSubjectsData(data)) {
    const rows: ExcelCell[][] = data.contents.map((content) => [
      content.contentName,
      content.bnccCode || EMPTY_CELL,
      content.questionsCount,
      roundPercentage(content.performance.correctPercentage),
      content.performance.correct,
    ]);

    return { name: CONTENTS_SHEET_NAME, headers: CONTENTS_HEADERS, rows };
  }

  const rows: ExcelCell[][] = (data?.subjects ?? []).map((subject) => [
    subject.name,
    subject.questionsCount,
    roundPercentage(subject.performance.correctPercentage),
  ]);

  return { name: SUBJECTS_SHEET_NAME, headers: SUBJECTS_HEADERS, rows };
}

/**
 * As abas da planilha deste modal, na ordem em que os blocos aparecem na tela.
 *
 * São sempre DUAS: o resumo do cabeçalho e a lista do nível visível. A segunda
 * troca de nome e de colunas conforme o nível, porque uma aba chamada
 * "Desempenho por matéria" com habilidades dentro mentiria; o que não muda é a
 * quantidade.
 */
export function buildSimulatedStudentDetailsSheets(
  data: StudentDetailsData | null,
  subjectName: string | null
): SheetConfig[] {
  return [buildSummarySheet(data, subjectName), buildDetailsSheet(data)];
}
