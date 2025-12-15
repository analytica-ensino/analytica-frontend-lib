import {
  GoalDisplayStatus,
  GoalBadgeActionType,
  GoalApiStatus,
  getGoalStatusBadgeAction,
  GOAL_FILTER_STATUS_OPTIONS,
  GOAL_STATUS_OPTIONS,
} from './recommendedLessons';

describe('recommendedLessons types', () => {
  describe('GoalApiStatus enum', () => {
    it('should have correct API status values', () => {
      expect(GoalApiStatus.A_VENCER).toBe('A_VENCER');
      expect(GoalApiStatus.VENCIDA).toBe('VENCIDA');
      expect(GoalApiStatus.CONCLUIDA).toBe('CONCLUIDA');
    });
  });

  describe('GoalDisplayStatus enum', () => {
    it('should have correct display status values', () => {
      expect(GoalDisplayStatus.ATIVA).toBe('ATIVA');
      expect(GoalDisplayStatus.VENCIDA).toBe('VENCIDA');
      expect(GoalDisplayStatus.CONCLUIDA).toBe('CONCLUÍDA');
    });
  });

  describe('GoalBadgeActionType enum', () => {
    it('should have correct badge action values', () => {
      expect(GoalBadgeActionType.SUCCESS).toBe('success');
      expect(GoalBadgeActionType.WARNING).toBe('warning');
      expect(GoalBadgeActionType.ERROR).toBe('error');
    });
  });

  describe('getGoalStatusBadgeAction', () => {
    it('should return SUCCESS for CONCLUIDA status', () => {
      const result = getGoalStatusBadgeAction(GoalDisplayStatus.CONCLUIDA);
      expect(result).toBe(GoalBadgeActionType.SUCCESS);
    });

    it('should return WARNING for ATIVA status', () => {
      const result = getGoalStatusBadgeAction(GoalDisplayStatus.ATIVA);
      expect(result).toBe(GoalBadgeActionType.WARNING);
    });

    it('should return ERROR for VENCIDA status', () => {
      const result = getGoalStatusBadgeAction(GoalDisplayStatus.VENCIDA);
      expect(result).toBe(GoalBadgeActionType.ERROR);
    });

    it('should return WARNING as fallback for unknown status', () => {
      const result = getGoalStatusBadgeAction(
        'UNKNOWN_STATUS' as GoalDisplayStatus
      );
      expect(result).toBe(GoalBadgeActionType.WARNING);
    });
  });

  describe('GOAL_FILTER_STATUS_OPTIONS', () => {
    it('should contain Vencida and Ativa options', () => {
      expect(GOAL_FILTER_STATUS_OPTIONS).toHaveLength(2);
      expect(GOAL_FILTER_STATUS_OPTIONS).toContainEqual({
        id: GoalApiStatus.VENCIDA,
        name: 'Vencida',
      });
      expect(GOAL_FILTER_STATUS_OPTIONS).toContainEqual({
        id: GoalApiStatus.A_VENCER,
        name: 'Ativa',
      });
    });

    it('should have correct structure for filter compatibility', () => {
      GOAL_FILTER_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });
  });

  describe('GOAL_STATUS_OPTIONS', () => {
    it('should contain all status options', () => {
      expect(GOAL_STATUS_OPTIONS).toHaveLength(3);
      expect(GOAL_STATUS_OPTIONS).toContainEqual({
        id: GoalApiStatus.A_VENCER,
        name: 'A Vencer',
      });
      expect(GOAL_STATUS_OPTIONS).toContainEqual({
        id: GoalApiStatus.VENCIDA,
        name: 'Vencida',
      });
      expect(GOAL_STATUS_OPTIONS).toContainEqual({
        id: GoalApiStatus.CONCLUIDA,
        name: 'Concluída',
      });
    });

    it('should have correct structure for filter compatibility', () => {
      GOAL_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });
  });
});
