import {
  RecommendedClassDisplayStatus,
  RecommendedClassBadgeActionType,
  RecommendedClassApiStatus,
  getRecommendedClassStatusBadgeAction,
  RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS,
  RECOMMENDED_CLASS_STATUS_OPTIONS,
  StudentLessonStatus,
  getStudentStatusBadgeAction,
  isDeadlinePassed,
  deriveStudentStatus,
  formatDaysToComplete,
} from './recommendedLessons';

describe('recommendedLessons types', () => {
  describe('RecommendedClassApiStatus enum', () => {
    it('should have correct API status values', () => {
      expect(RecommendedClassApiStatus.A_VENCER).toBe('A_VENCER');
      expect(RecommendedClassApiStatus.VENCIDA).toBe('VENCIDA');
      expect(RecommendedClassApiStatus.CONCLUIDA).toBe('CONCLUIDA');
    });
  });

  describe('RecommendedClassDisplayStatus enum', () => {
    it('should have correct display status values', () => {
      expect(RecommendedClassDisplayStatus.ATIVA).toBe('ATIVA');
      expect(RecommendedClassDisplayStatus.VENCIDA).toBe('VENCIDA');
      expect(RecommendedClassDisplayStatus.CONCLUIDA).toBe('CONCLUÍDA');
    });
  });

  describe('RecommendedClassBadgeActionType enum', () => {
    it('should have correct badge action values', () => {
      expect(RecommendedClassBadgeActionType.SUCCESS).toBe('success');
      expect(RecommendedClassBadgeActionType.WARNING).toBe('warning');
      expect(RecommendedClassBadgeActionType.ERROR).toBe('error');
    });
  });

  describe('getRecommendedClassStatusBadgeAction', () => {
    it('should return SUCCESS for CONCLUIDA status', () => {
      const result = getRecommendedClassStatusBadgeAction(
        RecommendedClassDisplayStatus.CONCLUIDA
      );
      expect(result).toBe(RecommendedClassBadgeActionType.SUCCESS);
    });

    it('should return WARNING for ATIVA status', () => {
      const result = getRecommendedClassStatusBadgeAction(
        RecommendedClassDisplayStatus.ATIVA
      );
      expect(result).toBe(RecommendedClassBadgeActionType.WARNING);
    });

    it('should return ERROR for VENCIDA status', () => {
      const result = getRecommendedClassStatusBadgeAction(
        RecommendedClassDisplayStatus.VENCIDA
      );
      expect(result).toBe(RecommendedClassBadgeActionType.ERROR);
    });

    it('should return WARNING as fallback for unknown status', () => {
      const result = getRecommendedClassStatusBadgeAction(
        'UNKNOWN_STATUS' as RecommendedClassDisplayStatus
      );
      expect(result).toBe(RecommendedClassBadgeActionType.WARNING);
    });
  });

  describe('RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS', () => {
    it('should contain Vencida and Ativa options', () => {
      expect(RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS).toHaveLength(2);
      expect(RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS).toContainEqual({
        id: RecommendedClassApiStatus.VENCIDA,
        name: 'Vencida',
      });
      expect(RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS).toContainEqual({
        id: RecommendedClassApiStatus.A_VENCER,
        name: 'Ativa',
      });
    });

    it('should have correct structure for filter compatibility', () => {
      RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });
  });

  describe('RECOMMENDED_CLASS_STATUS_OPTIONS', () => {
    it('should contain all status options', () => {
      expect(RECOMMENDED_CLASS_STATUS_OPTIONS).toHaveLength(3);
      expect(RECOMMENDED_CLASS_STATUS_OPTIONS).toContainEqual({
        id: RecommendedClassApiStatus.A_VENCER,
        name: 'A Vencer',
      });
      expect(RECOMMENDED_CLASS_STATUS_OPTIONS).toContainEqual({
        id: RecommendedClassApiStatus.VENCIDA,
        name: 'Vencida',
      });
      expect(RECOMMENDED_CLASS_STATUS_OPTIONS).toContainEqual({
        id: RecommendedClassApiStatus.CONCLUIDA,
        name: 'Concluída',
      });
    });

    it('should have correct structure for filter compatibility', () => {
      RECOMMENDED_CLASS_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('name');
        expect(typeof option.id).toBe('string');
        expect(typeof option.name).toBe('string');
      });
    });
  });

  describe('StudentLessonStatus enum', () => {
    it('should have correct status values', () => {
      expect(StudentLessonStatus.A_INICIAR).toBe('A INICIAR');
      expect(StudentLessonStatus.EM_ANDAMENTO).toBe('EM ANDAMENTO');
      expect(StudentLessonStatus.NAO_FINALIZADO).toBe('NÃO FINALIZADO');
      expect(StudentLessonStatus.CONCLUIDO).toBe('CONCLUÍDO');
    });
  });

  describe('getStudentStatusBadgeAction', () => {
    it('should return success for CONCLUIDO status', () => {
      expect(getStudentStatusBadgeAction(StudentLessonStatus.CONCLUIDO)).toBe(
        'success'
      );
    });

    it('should return info for EM_ANDAMENTO status', () => {
      expect(
        getStudentStatusBadgeAction(StudentLessonStatus.EM_ANDAMENTO)
      ).toBe('info');
    });

    it('should return warning for A_INICIAR status', () => {
      expect(getStudentStatusBadgeAction(StudentLessonStatus.A_INICIAR)).toBe(
        'warning'
      );
    });

    it('should return error for NAO_FINALIZADO status', () => {
      expect(
        getStudentStatusBadgeAction(StudentLessonStatus.NAO_FINALIZADO)
      ).toBe('error');
    });

    it('should return warning as fallback for unknown status', () => {
      expect(
        getStudentStatusBadgeAction('UNKNOWN' as StudentLessonStatus)
      ).toBe('warning');
    });
  });

  describe('isDeadlinePassed', () => {
    it('should return false for null deadline', () => {
      expect(isDeadlinePassed(null)).toBe(false);
    });

    it('should return true for past deadline', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isDeadlinePassed(pastDate.toISOString())).toBe(true);
    });

    it('should return false for future deadline', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isDeadlinePassed(futureDate.toISOString())).toBe(false);
    });
  });

  describe('deriveStudentStatus', () => {
    const futureDeadline = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const pastDeadline = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    it('should return CONCLUIDO when completedAt is set', () => {
      expect(deriveStudentStatus(50, '2024-01-15T00:00:00.000Z')).toBe(
        StudentLessonStatus.CONCLUIDO
      );
    });

    it('should return CONCLUIDO when progress is 100', () => {
      expect(deriveStudentStatus(100, null)).toBe(
        StudentLessonStatus.CONCLUIDO
      );
    });

    it('should return CONCLUIDO when progress is 100 even with past deadline', () => {
      expect(deriveStudentStatus(100, null, pastDeadline)).toBe(
        StudentLessonStatus.CONCLUIDO
      );
    });

    it('should return NAO_FINALIZADO when deadline passed and progress < 100', () => {
      expect(deriveStudentStatus(50, null, pastDeadline)).toBe(
        StudentLessonStatus.NAO_FINALIZADO
      );
    });

    it('should return NAO_FINALIZADO when deadline passed and progress is 0', () => {
      expect(deriveStudentStatus(0, null, pastDeadline)).toBe(
        StudentLessonStatus.NAO_FINALIZADO
      );
    });

    it('should return A_INICIAR when progress is 0 and no deadline or future deadline', () => {
      expect(deriveStudentStatus(0, null)).toBe(StudentLessonStatus.A_INICIAR);
      expect(deriveStudentStatus(0, null, futureDeadline)).toBe(
        StudentLessonStatus.A_INICIAR
      );
    });

    it('should return EM_ANDAMENTO when progress > 0 and < 100', () => {
      expect(deriveStudentStatus(50, null)).toBe(
        StudentLessonStatus.EM_ANDAMENTO
      );
      expect(deriveStudentStatus(50, null, futureDeadline)).toBe(
        StudentLessonStatus.EM_ANDAMENTO
      );
    });

    it('should return A_INICIAR as fallback for negative progress', () => {
      expect(deriveStudentStatus(-1, null)).toBe(StudentLessonStatus.A_INICIAR);
    });

    it('should work without deadline parameter (backward compatible)', () => {
      expect(deriveStudentStatus(0, null)).toBe(StudentLessonStatus.A_INICIAR);
      expect(deriveStudentStatus(50, null)).toBe(
        StudentLessonStatus.EM_ANDAMENTO
      );
      expect(deriveStudentStatus(100, null)).toBe(
        StudentLessonStatus.CONCLUIDO
      );
    });
  });

  describe('formatDaysToComplete', () => {
    it('should return null for null input', () => {
      expect(formatDaysToComplete(null)).toBeNull();
    });

    it('should return "1 dia" for 1 day', () => {
      expect(formatDaysToComplete(1)).toBe('1 dia');
    });

    it('should return correct format for multiple days', () => {
      expect(formatDaysToComplete(5)).toBe('5 dias');
      expect(formatDaysToComplete(30)).toBe('30 dias');
    });

    it('should return "0 dias" for zero days', () => {
      expect(formatDaysToComplete(0)).toBe('0 dias');
    });
  });
});
