import {
  SupportStatus,
  SupportCategory,
  getStatusBadgeAction,
  getStatusText,
  getCategoryText,
  mapApiStatusToInternal,
  mapInternalStatusToApi,
} from './support';
import type {
  SupportType,
  SupportFeatureFlags,
  SupportApiClient,
} from './support';

describe('Support Types', () => {
  describe('SupportStatus enum', () => {
    it('deve ter os valores corretos', () => {
      expect(SupportStatus.ABERTO).toBe('aberto');
      expect(SupportStatus.RESPONDIDO).toBe('respondido');
      expect(SupportStatus.ENCERRADO).toBe('encerrado');
    });
  });

  describe('SupportCategory enum', () => {
    it('deve ter os valores corretos', () => {
      expect(SupportCategory.ACESSO).toBe('acesso');
      expect(SupportCategory.TECNICO).toBe('tecnico');
      expect(SupportCategory.OUTROS).toBe('outros');
    });
  });

  describe('getStatusBadgeAction', () => {
    it('deve retornar "success" para status ABERTO', () => {
      expect(getStatusBadgeAction(SupportStatus.ABERTO)).toBe('success');
    });

    it('deve retornar "warning" para status RESPONDIDO', () => {
      expect(getStatusBadgeAction(SupportStatus.RESPONDIDO)).toBe('warning');
    });

    it('deve retornar "info" para status ENCERRADO', () => {
      expect(getStatusBadgeAction(SupportStatus.ENCERRADO)).toBe('info');
    });

    it('deve retornar "info" para status desconhecido', () => {
      expect(getStatusBadgeAction('unknown' as SupportStatus)).toBe('info');
    });
  });

  describe('getStatusText', () => {
    it('deve retornar "Aberto" para status ABERTO', () => {
      expect(getStatusText(SupportStatus.ABERTO)).toBe('Aberto');
    });

    it('deve retornar "Respondido" para status RESPONDIDO', () => {
      expect(getStatusText(SupportStatus.RESPONDIDO)).toBe('Respondido');
    });

    it('deve retornar "Encerrado" para status ENCERRADO', () => {
      expect(getStatusText(SupportStatus.ENCERRADO)).toBe('Encerrado');
    });

    it('deve retornar o próprio valor para status desconhecido', () => {
      expect(getStatusText('unknown' as SupportStatus)).toBe('unknown');
    });
  });

  describe('getCategoryText', () => {
    it('deve retornar "Acesso" para categoria ACESSO', () => {
      expect(getCategoryText(SupportCategory.ACESSO)).toBe('Acesso');
    });

    it('deve retornar "Técnico" para categoria TECNICO', () => {
      expect(getCategoryText(SupportCategory.TECNICO)).toBe('Técnico');
    });

    it('deve retornar "Outros" para categoria OUTROS', () => {
      expect(getCategoryText(SupportCategory.OUTROS)).toBe('Outros');
    });

    it('deve retornar string vazia para null', () => {
      expect(getCategoryText(null)).toBe('');
    });

    it('deve retornar o próprio valor para categoria desconhecida', () => {
      expect(getCategoryText('unknown' as SupportCategory)).toBe('unknown');
    });
  });

  describe('mapApiStatusToInternal', () => {
    it('deve mapear "ABERTO" para SupportStatus.ABERTO', () => {
      expect(mapApiStatusToInternal('ABERTO')).toBe(SupportStatus.ABERTO);
    });

    it('deve mapear "PENDENTE" para SupportStatus.RESPONDIDO', () => {
      expect(mapApiStatusToInternal('PENDENTE')).toBe(SupportStatus.RESPONDIDO);
    });

    it('deve mapear "FECHADO" para SupportStatus.ENCERRADO', () => {
      expect(mapApiStatusToInternal('FECHADO')).toBe(SupportStatus.ENCERRADO);
    });

    it('deve retornar ABERTO como padrão para status desconhecido', () => {
      expect(mapApiStatusToInternal('UNKNOWN')).toBe(SupportStatus.ABERTO);
    });
  });

  describe('mapInternalStatusToApi', () => {
    it('deve mapear SupportStatus.ABERTO para "ABERTO"', () => {
      expect(mapInternalStatusToApi(SupportStatus.ABERTO)).toBe('ABERTO');
    });

    it('deve mapear SupportStatus.RESPONDIDO para "PENDENTE"', () => {
      expect(mapInternalStatusToApi(SupportStatus.RESPONDIDO)).toBe('PENDENTE');
    });

    it('deve mapear SupportStatus.ENCERRADO para "FECHADO"', () => {
      expect(mapInternalStatusToApi(SupportStatus.ENCERRADO)).toBe('FECHADO');
    });

    it('deve retornar "ABERTO" como padrão para status desconhecido', () => {
      expect(mapInternalStatusToApi('unknown' as SupportStatus)).toBe('ABERTO');
    });
  });

  describe('SupportType', () => {
    it('deve aceitar NATIVE como valor válido', () => {
      const type: SupportType = 'NATIVE';
      expect(type).toBe('NATIVE');
    });

    it('deve aceitar ZENDESK como valor válido', () => {
      const type: SupportType = 'ZENDESK';
      expect(type).toBe('ZENDESK');
    });
  });

  describe('SupportFeatureFlags', () => {
    it('deve aceitar objeto com estrutura correta', () => {
      const featureFlag: SupportFeatureFlags = {
        institutionId: 'inst-123',
        page: 'SUPPORT',
        version: { supportType: 'NATIVE' },
      };

      expect(featureFlag.institutionId).toBe('inst-123');
      expect(featureFlag.page).toBe('SUPPORT');
      expect(featureFlag.version.supportType).toBe('NATIVE');
    });

    it('deve aceitar ZENDESK como supportType na version', () => {
      const featureFlag: SupportFeatureFlags = {
        institutionId: 'inst-456',
        page: 'SUPPORT',
        version: { supportType: 'ZENDESK' },
      };

      expect(featureFlag.version.supportType).toBe('ZENDESK');
    });
  });

  describe('SupportApiClient', () => {
    it('deve aceitar objeto com métodos get, post e patch', () => {
      const client: SupportApiClient = {
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
      };

      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.patch).toBe('function');
    });

    it('get deve retornar Promise com data tipado', async () => {
      const mockData = { message: 'ok' };
      const client: SupportApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
        post: jest.fn(),
        patch: jest.fn(),
      };

      const result = await client.get<{ message: string }>('/test');
      expect(result.data).toEqual(mockData);
    });
  });
});
