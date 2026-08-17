import {
  GenericApiStatus,
  GenericDisplayStatus,
  getStatusBadgeAction,
  mapApiStatusToDisplay,
  BadgeActionType,
} from './common';

describe('mapApiStatusToDisplay', () => {
  // A atividade presencial é uma prova, e prova tem AGENDADA no backend. Sem
  // ele no mapa a coluna imprimia uma pílula sem texto.
  it.each([
    [GenericApiStatus.A_VENCER, GenericDisplayStatus.ATIVA],
    [GenericApiStatus.VENCIDA, GenericDisplayStatus.VENCIDA],
    [GenericApiStatus.CONCLUIDA, GenericDisplayStatus.CONCLUIDA],
    [GenericApiStatus.AGENDADA, GenericDisplayStatus.AGENDADA],
  ])('maps %s', (api, display) => {
    expect(mapApiStatusToDisplay(api)).toBe(display);
  });

  // Um status desconhecido não pode sumir da tela sem erro nenhum.
  it('never returns empty for an unknown status', () => {
    expect(mapApiStatusToDisplay('QUALQUER_COISA' as GenericApiStatus)).toBe(
      GenericDisplayStatus.ATIVA
    );
  });

  it('gives AGENDADA its own badge tone', () => {
    expect(getStatusBadgeAction(GenericDisplayStatus.AGENDADA)).toBe(
      BadgeActionType.INFO
    );
  });
});
