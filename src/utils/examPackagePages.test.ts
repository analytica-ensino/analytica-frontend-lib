jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn(async () => 'data:image/png;base64,QR') },
}));

import QRCode from 'qrcode';
import { buildExamPackagePages } from './examPackagePages';

const answerSheetsResponse = {
  data: {
    message: 'ok',
    data: {
      exam: { id: 'exam-1', title: 'Prova 1', totalQuestions: 10 },
      students: [
        {
          student: { id: 'st-1', name: 'Ana Costa' },
          qrCodeUrl: 'https://aluno.example.com/qrcode/tok-1',
          schoolClass: 'Turma Única',
        },
        {
          student: { id: 'st-2', name: 'Carlos Pereira' },
          qrCodeUrl: 'https://aluno.example.com/qrcode/tok-2',
          schoolClass: 'Turma Única',
        },
      ],
    },
  },
};

const makeApi = (response: unknown = answerSheetsResponse) => ({
  get: jest.fn(async () => response as { data: unknown }),
});

describe('buildExamPackagePages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lê os gabaritos em lote da prova, com a instituição', async () => {
    const api = makeApi();

    await buildExamPackagePages(api as never, 'exam-1', 'inst-1');

    expect(api.get).toHaveBeenCalledWith('/exams/exam-1/answer-sheets', {
      params: {
        studentFrontendUrl: globalThis.location.origin,
        institutionId: 'inst-1',
      },
    });
  });

  it('gera uma folha de redação e um cartão-resposta por aluno', async () => {
    const html = await buildExamPackagePages(makeApi() as never, 'exam-1', 'i');

    // Conta os cabeçalhos das páginas: o texto "CARTÃO-RESPOSTA" também
    // aparece nas instruções impressas dentro do próprio cartão.
    expect(html.match(/<span>FOLHA DE REDAÇÃO<\/span>/g)).toHaveLength(2);
    expect(html.match(/<span>CARTÃO-RESPOSTA<\/span>/g)).toHaveLength(2);
    expect(html).toContain('Ana Costa');
    expect(html).toContain('Carlos Pereira');
  });

  it('gera um QR code por aluno a partir da url do gabarito', async () => {
    await buildExamPackagePages(makeApi() as never, 'exam-1', 'i');

    expect(QRCode.toDataURL).toHaveBeenCalledTimes(2);
    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      'https://aluno.example.com/qrcode/tok-1',
      { width: 320, margin: 1 }
    );
  });

  it('usa o título e o total de questões da prova no cartão', async () => {
    const html = await buildExamPackagePages(makeApi() as never, 'exam-1', 'i');

    expect(html).toContain('Prova 1');
    // 10 questões: a décima existe, a décima primeira não.
    expect(html).toContain('>10</span>');
    expect(html).toContain('—');
  });

  it('devolve vazio quando a prova não tem alunos', async () => {
    const empty = {
      data: {
        message: 'ok',
        data: {
          exam: { id: 'exam-1', title: 'Prova 1', totalQuestions: 10 },
          students: [],
        },
      },
    };

    const html = await buildExamPackagePages(
      makeApi(empty) as never,
      'exam-1',
      'i'
    );

    expect(html).toBe('');
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
  });
});
