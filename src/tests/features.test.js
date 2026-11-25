/**
 * Jest Unit Test Suites for MatchWork System
 * Minimum 5 Features Test Suite
 *
 * Feature 1: validateUsername()
 * Feature 2: canAccessAdmin()
 * Feature 3: validateCandidateProfile()
 * Feature 4: validateTagWeight()
 * Feature 5: calculateMatchingScore()
 */

const {
  validateUsername,
  canAccessAdmin,
  validateCandidateProfile,
  validateTagWeight
} = require('../services/validationService');

const { calculateMatchingScore } = require('../services/matchingService');

describe('MatchWork Core System Unit Tests (5 Features Minimum)', () => {

  // ==========================================
  // Feature 1: validateUsername()
  // ==========================================
  describe('Feature 1: validateUsername()', () => {
    test('• valid username: should accept standard alphanumeric and underscore usernames', () => {
      expect(validateUsername('john_doe')).toEqual({ valid: true });
      expect(validateUsername('user123')).toEqual({ valid: true });
      expect(validateUsername('somchai_dev')).toEqual({ valid: true });
    });

    test('• invalid character: should reject usernames with special characters, spaces, or symbols', () => {
      const resWithSpace = validateUsername('john doe');
      expect(resWithSpace.valid).toBe(false);
      expect(resWithSpace.error).toMatch(/invalid characters/i);

      const resWithAt = validateUsername('user@domain');
      expect(resWithAt.valid).toBe(false);

      const resWithExclamation = validateUsername('admin!');
      expect(resWithExclamation.valid).toBe(false);
    });

    test('• length boundary: should enforce minimum 3 and maximum 20 characters length boundary', () => {
      // Boundaries
      expect(validateUsername('ab').valid).toBe(false); // Below min (2 chars)
      expect(validateUsername('abc').valid).toBe(true);  // Exact min boundary (3 chars)
      expect(validateUsername('a'.repeat(20)).valid).toBe(true); // Exact max boundary (20 chars)
      expect(validateUsername('a'.repeat(21)).valid).toBe(false); // Above max (21 chars)
    });
  });

  // ==========================================
  // Feature 2: canAccessAdmin()
  // ==========================================
  describe('Feature 2: canAccessAdmin()', () => {
    test('• Admin: should grant access for admin role', () => {
      const adminUser = { id: 'usr_admin', name: 'System Admin', role: 'admin' };
      expect(canAccessAdmin(adminUser)).toBe(true);
      expect(canAccessAdmin('admin')).toBe(true);
      expect(canAccessAdmin({ role: 'ADMIN' })).toBe(true);
    });

    test('• normal user: should deny access for candidate, recruiter, or unauthenticated users', () => {
      const candidateUser = { id: 'usr_cand', name: 'John Doe', role: 'candidate' };
      const recruiterUser = { id: 'usr_rec', name: 'Sarah HR', role: 'recruiter' };
      const guestUser = { id: 'usr_guest', name: 'Guest', role: 'guest' };

      expect(canAccessAdmin(candidateUser)).toBe(false);
      expect(canAccessAdmin(recruiterUser)).toBe(false);
      expect(canAccessAdmin(guestUser)).toBe(false);
      expect(canAccessAdmin(null)).toBe(false);
      expect(canAccessAdmin(undefined)).toBe(false);
    });
  });

  // ==========================================
  // Feature 3: validateCandidateProfile()
  // ==========================================
  describe('Feature 3: validateCandidateProfile()', () => {
    const validProfile = {
      candidate_id: 'cand_test_1',
      full_name: 'Kawin Suk',
      email: 'kawin.dev@example.com',
      experience_years: 5,
      location: 'Bangkok, Thailand',
      expected_salary: 85000,
      work_style: 'hybrid'
    };

    test('• valid candidate profile: should pass validation', () => {
      const result = validateCandidateProfile(validProfile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('• invalid email: should reject malformed email address', () => {
      const invalidEmail = { ...validProfile, email: 'kawin-invalid-email' };
      const result = validateCandidateProfile(invalidEmail);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    test('• salary & experience boundaries: should reject negative experience and zero/negative expected salary', () => {
      const invalidNumbers = { ...validProfile, experience_years: -1, expected_salary: 0 };
      const result = validateCandidateProfile(invalidNumbers);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    test('• invalid work_style: should reject invalid work style value', () => {
      const invalidWorkStyle = { ...validProfile, work_style: 'underwater' };
      const result = validateCandidateProfile(invalidWorkStyle);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('work_style'))).toBe(true);
    });
  });

  // ==========================================
  // Feature 4: validateTagWeight()
  // ==========================================
  describe('Feature 4: validateTagWeight()', () => {
    test('• valid weight: should accept decimal weights within [0.00, 1.00]', () => {
      const result = validateTagWeight(0.85);
      expect(result.valid).toBe(true);
      expect(result.weight).toBe(0.85);
    });

    test('• boundary weights: should accept exact boundaries 0.00 and 1.00', () => {
      expect(validateTagWeight(0).valid).toBe(true);
      expect(validateTagWeight(1).valid).toBe(true);
    });

    test('• out-of-range weight: should reject weights less than 0 or greater than 1', () => {
      expect(validateTagWeight(1.25).valid).toBe(false);
      expect(validateTagWeight(-0.1).valid).toBe(false);
    });

    test('• non-numeric representation: should reject string or invalid inputs', () => {
      expect(validateTagWeight('not-a-number').valid).toBe(false);
    });
  });

  // ==========================================
  // Feature 5: calculateMatchingScore()
  // ==========================================
  describe('Feature 5: calculateMatchingScore()', () => {
    test('• full match: should return 100% when candidate possesses all job tags with max weight', () => {
      const candidateTags = [
        { tag_id: 1, weight: 1.0 },
        { tag_id: 2, weight: 1.0 }
      ];
      const jobTags = [
        { tag_id: 1, weight: 1.0 },
        { tag_id: 2, weight: 1.0 }
      ];

      const result = calculateMatchingScore(candidateTags, jobTags);
      expect(result.score).toBe(100);
      expect(result.summary.matched_tags_count).toBe(2);
    });

    test('• partial weighted match: should calculate weighted score proportional to tag weights', () => {
      const candidateTags = [
        { tag_id: 1, weight: 0.5 },
        { tag_id: 2, weight: 0.8 }
      ];
      const jobTags = [
        { tag_id: 1, weight: 1.0 },
        { tag_id: 2, weight: 1.0 }
      ];

      const result = calculateMatchingScore(candidateTags, jobTags);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
      expect(result.breakdown).toBeDefined();
    });

    test('• no match: should return 0% when there are no overlapping skill tags', () => {
      const candidateTags = [{ tag_id: 99, weight: 1.0 }];
      const jobTags = [{ tag_id: 1, weight: 1.0 }];

      const result = calculateMatchingScore(candidateTags, jobTags);
      expect(result.score).toBe(0);
      expect(result.summary.matched_tags_count).toBe(0);
    });
  });

});
