import {
  CONCLUDE_TICKET_ERROR_MESSAGE,
  buildConcludeTicketRequest,
  findConclusionReason,
  getConcludeTicketErrorMessage,
  isConclusionFormValid,
} from './supportConclusionUtils';
import { SUPPORT_CONCLUSION_REASONS } from './supportConclusionReasons';
import {
  SUPPORT_CONCLUSION_OUTCOME,
  SUPPORT_PROBLEM_TYPE,
  type SupportConclusionFormData,
  type SupportConclusionReason,
} from '../../types/supportConclusion';

const makeForm = (
  overrides: Partial<SupportConclusionFormData> = {}
): SupportConclusionFormData => ({
  reason: '',
  subReason: '',
  description: '',
  outcome: SUPPORT_CONCLUSION_OUTCOME.RESOLVED,
  internalNote: '',
  suggestFaq: false,
  openTechTicket: false,
  ...overrides,
});

const reasonByValue = (value: string) =>
  SUPPORT_CONCLUSION_REASONS.find(
    (reason) => reason.value === value
  ) as SupportConclusionReason;

describe('supportConclusionUtils', () => {
  describe('findConclusionReason', () => {
    it('returns the matching reason', () => {
      expect(
        findConclusionReason(SUPPORT_CONCLUSION_REASONS, 'access')?.label
      ).toBe('Acesso e login');
    });

    it('returns undefined for an unknown value', () => {
      expect(
        findConclusionReason(SUPPORT_CONCLUSION_REASONS, 'nope')
      ).toBeUndefined();
    });
  });

  describe('isConclusionFormValid', () => {
    it('requires a reason', () => {
      expect(
        isConclusionFormValid(makeForm(), SUPPORT_CONCLUSION_REASONS)
      ).toBe(false);
    });

    it('requires a sub-reason when the reason has sub-reasons', () => {
      expect(
        isConclusionFormValid(
          makeForm({ reason: 'access' }),
          SUPPORT_CONCLUSION_REASONS
        )
      ).toBe(false);
      expect(
        isConclusionFormValid(
          makeForm({ reason: 'access', subReason: 'forgot-password' }),
          SUPPORT_CONCLUSION_REASONS
        )
      ).toBe(true);
    });

    it('requires a non-blank description when the reason asks for one', () => {
      expect(
        isConclusionFormValid(
          makeForm({ reason: 'other', description: '   ' }),
          SUPPORT_CONCLUSION_REASONS
        )
      ).toBe(false);
      expect(
        isConclusionFormValid(
          makeForm({ reason: 'other', description: 'Pedido de certificado' }),
          SUPPORT_CONCLUSION_REASONS
        )
      ).toBe(true);
    });
  });

  describe('buildConcludeTicketRequest', () => {
    it('closes the ticket with the reason problem type and the note', () => {
      expect(
        buildConcludeTicketRequest(
          makeForm({
            reason: 'platform-error',
            subReason: 'bug',
            internalNote: '  Limpou o cache  ',
          }),
          reasonByValue('platform-error')
        )
      ).toEqual({
        status: 'FECHADO',
        problemType: SUPPORT_PROBLEM_TYPE.PLATFORM_ERROR,
        notes: 'Limpou o cache',
      });
    });

    it('joins the description and the note for reasons with description', () => {
      expect(
        buildConcludeTicketRequest(
          makeForm({
            reason: 'other',
            description: ' Pedido de certificado ',
            internalNote: 'Encaminhado à secretaria',
          }),
          reasonByValue('other')
        ).notes
      ).toBe('Pedido de certificado\n\nEncaminhado à secretaria');
    });

    it('ignores a leftover description for reasons without description', () => {
      expect(
        buildConcludeTicketRequest(
          makeForm({ reason: 'access', description: 'leftover' }),
          reasonByValue('access')
        ).notes
      ).toBeNull();
    });

    it('sends null notes when nothing was written', () => {
      expect(
        buildConcludeTicketRequest(
          makeForm({ reason: 'other' }),
          reasonByValue('other')
        ).notes
      ).toBeNull();
    });
  });

  describe('getConcludeTicketErrorMessage', () => {
    it('returns the API message', () => {
      expect(
        getConcludeTicketErrorMessage({
          response: { data: { message: 'Ticket não encontrado' } },
        })
      ).toBe('Ticket não encontrado');
    });

    it.each([
      [new Error('network')],
      [{ response: { data: { message: '' } } }],
      [{ response: { data: { message: 42 } } }],
      [null],
    ])('falls back to the generic message for %p', (error) => {
      expect(getConcludeTicketErrorMessage(error)).toBe(
        CONCLUDE_TICKET_ERROR_MESSAGE
      );
    });
  });
});
