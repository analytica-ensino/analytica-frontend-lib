import {
  SupportStatus,
  SupportCategory,
  getStatusBadgeAction,
  getStatusText,
  getCategoryText,
  mapApiStatusToInternal,
  mapInternalStatusToApi,
  SupportType,
} from './support';
import type { SupportFeatureFlags, SupportApiClient } from './support';

describe('Support Types', () => {
  describe('SupportStatus enum', () => {
    it('should have the correct values', () => {
      expect(SupportStatus.ABERTO).toBe('aberto');
      expect(SupportStatus.RESPONDIDO).toBe('respondido');
      expect(SupportStatus.ENCERRADO).toBe('encerrado');
    });
  });

  describe('SupportCategory enum', () => {
    it('should have the correct values', () => {
      expect(SupportCategory.ACESSO).toBe('acesso');
      expect(SupportCategory.TECNICO).toBe('tecnico');
      expect(SupportCategory.OUTROS).toBe('outros');
    });
  });

  describe('getStatusBadgeAction', () => {
    it('should return "success" for ABERTO status', () => {
      expect(getStatusBadgeAction(SupportStatus.ABERTO)).toBe('success');
    });

    it('should return "warning" for RESPONDIDO status', () => {
      expect(getStatusBadgeAction(SupportStatus.RESPONDIDO)).toBe('warning');
    });

    it('should return "info" for ENCERRADO status', () => {
      expect(getStatusBadgeAction(SupportStatus.ENCERRADO)).toBe('info');
    });

    it('should return "info" for unknown status', () => {
      expect(getStatusBadgeAction('unknown' as SupportStatus)).toBe('info');
    });
  });

  describe('getStatusText', () => {
    it('should return "Aberto" for ABERTO status', () => {
      expect(getStatusText(SupportStatus.ABERTO)).toBe('Aberto');
    });

    it('should return "Respondido" for RESPONDIDO status', () => {
      expect(getStatusText(SupportStatus.RESPONDIDO)).toBe('Respondido');
    });

    it('should return "Encerrado" for ENCERRADO status', () => {
      expect(getStatusText(SupportStatus.ENCERRADO)).toBe('Encerrado');
    });

    it('should return the raw value for unknown status', () => {
      expect(getStatusText('unknown' as SupportStatus)).toBe('unknown');
    });
  });

  describe('getCategoryText', () => {
    it('should return "Acesso" for ACESSO category', () => {
      expect(getCategoryText(SupportCategory.ACESSO)).toBe('Acesso');
    });

    it('should return "Técnico" for TECNICO category', () => {
      expect(getCategoryText(SupportCategory.TECNICO)).toBe('Técnico');
    });

    it('should return "Outros" for OUTROS category', () => {
      expect(getCategoryText(SupportCategory.OUTROS)).toBe('Outros');
    });

    it('should return empty string for null', () => {
      expect(getCategoryText(null)).toBe('');
    });

    it('should return the raw value for unknown category', () => {
      expect(getCategoryText('unknown' as SupportCategory)).toBe('unknown');
    });
  });

  describe('mapApiStatusToInternal', () => {
    it('should map "ABERTO" to SupportStatus.ABERTO', () => {
      expect(mapApiStatusToInternal('ABERTO')).toBe(SupportStatus.ABERTO);
    });

    it('should map "PENDENTE" to SupportStatus.RESPONDIDO', () => {
      expect(mapApiStatusToInternal('PENDENTE')).toBe(SupportStatus.RESPONDIDO);
    });

    it('should map "FECHADO" to SupportStatus.ENCERRADO', () => {
      expect(mapApiStatusToInternal('FECHADO')).toBe(SupportStatus.ENCERRADO);
    });

    it('should default to ABERTO for unknown status', () => {
      expect(mapApiStatusToInternal('UNKNOWN')).toBe(SupportStatus.ABERTO);
    });
  });

  describe('mapInternalStatusToApi', () => {
    it('should map SupportStatus.ABERTO to "ABERTO"', () => {
      expect(mapInternalStatusToApi(SupportStatus.ABERTO)).toBe('ABERTO');
    });

    it('should map SupportStatus.RESPONDIDO to "PENDENTE"', () => {
      expect(mapInternalStatusToApi(SupportStatus.RESPONDIDO)).toBe('PENDENTE');
    });

    it('should map SupportStatus.ENCERRADO to "FECHADO"', () => {
      expect(mapInternalStatusToApi(SupportStatus.ENCERRADO)).toBe('FECHADO');
    });

    it('should default to "ABERTO" for unknown status', () => {
      expect(mapInternalStatusToApi('unknown' as SupportStatus)).toBe('ABERTO');
    });
  });

  describe('SupportType', () => {
    it('should accept NATIVE as a valid value', () => {
      const type: SupportType = SupportType.NATIVE;
      expect(type).toBe(SupportType.NATIVE);
    });

    it('should accept ZENDESK as a valid value', () => {
      const type: SupportType = SupportType.ZENDESK;
      expect(type).toBe(SupportType.ZENDESK);
    });
  });

  describe('SupportFeatureFlags', () => {
    it('should accept an object with the correct structure', () => {
      const featureFlag: SupportFeatureFlags = {
        institutionId: 'inst-123',
        page: 'SUPPORT',
        version: { supportType: SupportType.NATIVE },
      };

      expect(featureFlag.institutionId).toBe('inst-123');
      expect(featureFlag.page).toBe('SUPPORT');
      expect(featureFlag.version.supportType).toBe(SupportType.NATIVE);
    });

    it('should accept ZENDESK as supportType in version', () => {
      const featureFlag: SupportFeatureFlags = {
        institutionId: 'inst-456',
        page: 'SUPPORT',
        version: { supportType: SupportType.ZENDESK },
      };

      expect(featureFlag.version.supportType).toBe(SupportType.ZENDESK);
    });
  });

  describe('SupportApiClient', () => {
    it('should accept an object with get, post and patch methods', () => {
      const client: SupportApiClient = {
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
      };

      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.patch).toBe('function');
    });

    it('get should return a Promise with typed data', async () => {
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
