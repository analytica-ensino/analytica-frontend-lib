import {
  getAggregationTypeByProfile,
  shouldUseAggregatedOverview,
} from './profileAggregation';
import { PROFILE_ROLES } from '../types/chat';

describe('profileAggregation', () => {
  describe('getAggregationTypeByProfile', () => {
    it('returns "classes" for UNIT_MANAGER', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.UNIT_MANAGER)).toBe(
        'classes'
      );
    });

    it('returns "municipalities" for REGIONAL_MANAGER', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.REGIONAL_MANAGER)).toBe(
        'municipalities'
      );
    });

    it('returns "students" for GENERAL_MANAGER', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.GENERAL_MANAGER)).toBe(
        'students'
      );
    });

    it('returns "students" for TEACHER', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.TEACHER)).toBe(
        'students'
      );
    });

    it('returns "students" for STUDENT', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.STUDENT)).toBe(
        'students'
      );
    });

    it('returns "students" for SUPER_ADMIN', () => {
      expect(getAggregationTypeByProfile(PROFILE_ROLES.SUPER_ADMIN)).toBe(
        'students'
      );
    });

    it('returns "students" for undefined profile', () => {
      expect(getAggregationTypeByProfile(undefined)).toBe('students');
    });

    it('returns "students" for unknown profile', () => {
      expect(getAggregationTypeByProfile('UNKNOWN_ROLE')).toBe('students');
    });
  });

  describe('shouldUseAggregatedOverview', () => {
    it('returns true for UNIT_MANAGER', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.UNIT_MANAGER)).toBe(
        true
      );
    });

    it('returns true for REGIONAL_MANAGER', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.REGIONAL_MANAGER)).toBe(
        true
      );
    });

    it('returns false for GENERAL_MANAGER', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.GENERAL_MANAGER)).toBe(
        false
      );
    });

    it('returns false for TEACHER', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.TEACHER)).toBe(false);
    });

    it('returns false for STUDENT', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.STUDENT)).toBe(false);
    });

    it('returns false for SUPER_ADMIN', () => {
      expect(shouldUseAggregatedOverview(PROFILE_ROLES.SUPER_ADMIN)).toBe(
        false
      );
    });

    it('returns false for undefined profile', () => {
      expect(shouldUseAggregatedOverview(undefined)).toBe(false);
    });

    it('returns false for unknown profile', () => {
      expect(shouldUseAggregatedOverview('UNKNOWN_ROLE')).toBe(false);
    });
  });
});
