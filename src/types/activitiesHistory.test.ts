import {
  ActivityApiStatus,
  ActivityDisplayStatus,
  ActivityBadgeActionType,
  ActivityDraftType,
  getActivityStatusBadgeAction,
  mapActivityStatusToDisplay,
  ACTIVITY_FILTER_STATUS_OPTIONS,
} from './activitiesHistory';

describe('activitiesHistory types', () => {
  describe('ActivityApiStatus enum', () => {
    it('should have correct values', () => {
      expect(ActivityApiStatus.A_VENCER).toBe('A_VENCER');
      expect(ActivityApiStatus.VENCIDA).toBe('VENCIDA');
      expect(ActivityApiStatus.CONCLUIDA).toBe('CONCLUIDA');
    });
  });

  describe('ActivityDisplayStatus enum', () => {
    it('should have correct values', () => {
      expect(ActivityDisplayStatus.ATIVA).toBe('ATIVA');
      expect(ActivityDisplayStatus.VENCIDA).toBe('VENCIDA');
      expect(ActivityDisplayStatus.CONCLUIDA).toBe('CONCLUÍDA');
    });
  });

  describe('ActivityBadgeActionType enum', () => {
    it('should have correct values', () => {
      expect(ActivityBadgeActionType.SUCCESS).toBe('success');
      expect(ActivityBadgeActionType.WARNING).toBe('warning');
      expect(ActivityBadgeActionType.ERROR).toBe('error');
    });
  });

  describe('ActivityDraftType enum', () => {
    it('should have correct values', () => {
      expect(ActivityDraftType.MODELO).toBe('MODELO');
      expect(ActivityDraftType.RASCUNHO).toBe('RASCUNHO');
    });
  });

  describe('getActivityStatusBadgeAction', () => {
    it('should return SUCCESS for CONCLUIDA status', () => {
      const result = getActivityStatusBadgeAction(
        ActivityDisplayStatus.CONCLUIDA
      );
      expect(result).toBe(ActivityBadgeActionType.SUCCESS);
    });

    it('should return WARNING for ATIVA status', () => {
      const result = getActivityStatusBadgeAction(ActivityDisplayStatus.ATIVA);
      expect(result).toBe(ActivityBadgeActionType.WARNING);
    });

    it('should return ERROR for VENCIDA status', () => {
      const result = getActivityStatusBadgeAction(
        ActivityDisplayStatus.VENCIDA
      );
      expect(result).toBe(ActivityBadgeActionType.ERROR);
    });

    it('should return WARNING as default for unknown status', () => {
      const result = getActivityStatusBadgeAction(
        'UNKNOWN' as ActivityDisplayStatus
      );
      expect(result).toBe(ActivityBadgeActionType.WARNING);
    });
  });

  describe('mapActivityStatusToDisplay', () => {
    it('should map A_VENCER to ATIVA', () => {
      const result = mapActivityStatusToDisplay(ActivityApiStatus.A_VENCER);
      expect(result).toBe(ActivityDisplayStatus.ATIVA);
    });

    it('should map VENCIDA to VENCIDA', () => {
      const result = mapActivityStatusToDisplay(ActivityApiStatus.VENCIDA);
      expect(result).toBe(ActivityDisplayStatus.VENCIDA);
    });

    it('should map CONCLUIDA to CONCLUÍDA', () => {
      const result = mapActivityStatusToDisplay(ActivityApiStatus.CONCLUIDA);
      expect(result).toBe(ActivityDisplayStatus.CONCLUIDA);
    });
  });

  describe('ACTIVITY_FILTER_STATUS_OPTIONS', () => {
    it('should contain all status options', () => {
      expect(ACTIVITY_FILTER_STATUS_OPTIONS).toHaveLength(3);
    });

    it('should contain A_VENCER option', () => {
      const option = ACTIVITY_FILTER_STATUS_OPTIONS.find(
        (o) => o.id === ActivityApiStatus.A_VENCER
      );
      expect(option).toBeDefined();
      expect(option?.name).toBe('A Vencer');
    });

    it('should contain VENCIDA option', () => {
      const option = ACTIVITY_FILTER_STATUS_OPTIONS.find(
        (o) => o.id === ActivityApiStatus.VENCIDA
      );
      expect(option).toBeDefined();
      expect(option?.name).toBe('Vencida');
    });

    it('should contain CONCLUIDA option', () => {
      const option = ACTIVITY_FILTER_STATUS_OPTIONS.find(
        (o) => o.id === ActivityApiStatus.CONCLUIDA
      );
      expect(option).toBeDefined();
      expect(option?.name).toBe('Concluída');
    });

    it('should have correct structure for each option', () => {
      ACTIVITY_FILTER_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });
  });
});
