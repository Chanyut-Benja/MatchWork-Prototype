/**
 * Unit & Feature Test Suites for MatchWork Core System
 * Covers 5 mandatory test suites:
 * 1. validateCandidateProfile()
 * 2. validateTagWeight()
 * 3. calculateMatchingScore()
 * 4. processMatchInteraction()
 * 5. authorizeEndpointAccess()
 */

const {
  validateUsername,
  canAccessAdmin,
  validateCandidateProfile,
  validateTagWeight,
  authorizeEndpointAccess
} = require('../services/validationService');
const { calculateMatchingScore } = require('../services/matchingService');
const { processMatchInteraction } = require('../services/interactionService');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

function runAllUnitTests() {
  const suites = [];

  // ==========================================
  // Test A: validateUsername()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case A.1: Valid username
    const u1 = validateUsername('john_doe');
    tests.push({
      name: 'valid username: should accept standard alphanumeric and underscore usernames',
      passed: u1.valid === true,
      details: u1
    });

    // Case A.2: Invalid characters
    const u2 = validateUsername('user@domain');
    const u3 = validateUsername('john doe');
    tests.push({
      name: 'invalid character: should reject special characters and spaces',
      passed: u2.valid === false && u3.valid === false,
      details: { u2, u3 }
    });

    // Case A.3: Length boundary
    const shortUser = validateUsername('ab');
    const exactMin = validateUsername('abc');
    const exactMax = validateUsername('a'.repeat(20));
    const longUser = validateUsername('a'.repeat(21));
    tests.push({
      name: 'length boundary: enforces 3 to 20 characters constraints',
      passed: shortUser.valid === false && exactMin.valid === true && exactMax.valid === true && longUser.valid === false,
      details: { shortUser, exactMin, exactMax, longUser }
    });

    suites.push({
      suite_name: 'validateUsername()',
      description: 'Validates username format, character whitelist, and 3-20 length boundaries',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test B: canAccessAdmin()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case B.1: Admin user
    const adminPassed = canAccessAdmin({ role: 'admin' }) && canAccessAdmin('admin');
    tests.push({
      name: 'Admin: should grant access for admin role',
      passed: adminPassed === true,
      details: { adminPassed }
    });

    // Case B.2: Normal user
    const candAccess = canAccessAdmin({ role: 'candidate' });
    const recAccess = canAccessAdmin({ role: 'recruiter' });
    const nullAccess = canAccessAdmin(null);
    tests.push({
      name: 'normal user: should deny access for candidate, recruiter, or unauthenticated users',
      passed: candAccess === false && recAccess === false && nullAccess === false,
      details: { candAccess, recAccess, nullAccess }
    });

    suites.push({
      suite_name: 'canAccessAdmin()',
      description: 'Checks authorization and permissions for administrative operations',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 1: validateCandidateProfile()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case 1.1: Valid profile
    const validProfile = {
      candidate_id: 'cand_test_1',
      full_name: 'Somchai Prasert',
      email: 'somchai@example.com',
      experience_years: 4,
      location: 'Bangkok',
      expected_salary: 75000,
      work_style: 'hybrid'
    };
    const r1 = validateCandidateProfile(validProfile);
    tests.push({
      name: 'Should pass validation for a well-formed candidate profile',
      passed: r1.valid === true && r1.errors.length === 0,
      details: r1
    });

    // Case 1.2: Invalid email
    const invalidEmailProfile = { ...validProfile, email: 'not-an-email' };
    const r2 = validateCandidateProfile(invalidEmailProfile);
    tests.push({
      name: 'Should reject invalid email format',
      passed: r2.valid === false && r2.errors.some(e => e.includes('email')),
      details: r2
    });

    // Case 1.3: Negative experience or salary <= 0
    const invalidNumbersProfile = { ...validProfile, experience_years: -2, expected_salary: 0 };
    const r3 = validateCandidateProfile(invalidNumbersProfile);
    tests.push({
      name: 'Should reject negative experience years and zero/negative expected salary',
      passed: r3.valid === false && r3.errors.length >= 2,
      details: r3
    });

    // Case 1.4: Invalid work_style
    const invalidWorkStyleProfile = { ...validProfile, work_style: 'moon' };
    const r4 = validateCandidateProfile(invalidWorkStyleProfile);
    tests.push({
      name: 'Should reject invalid work style (must be remote, hybrid, or on-site)',
      passed: r4.valid === false && r4.errors.some(e => e.includes('work_style')),
      details: r4
    });

    suites.push({
      suite_name: 'validateCandidateProfile()',
      description: 'Validates candidate profile schema, email patterns, salary thresholds, and work styles',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 2: validateTagWeight()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case 2.1: Valid weight 0.85
    const w1 = validateTagWeight(0.85);
    tests.push({
      name: 'Should accept valid decimal weight within [0.00, 1.00]',
      passed: w1.valid === true && w1.weight === 0.85,
      details: w1
    });

    // Case 2.2: Boundary weights 0.00 and 1.00
    const wZero = validateTagWeight(0);
    const wOne = validateTagWeight(1);
    tests.push({
      name: 'Should accept exact boundary weights 0.00 and 1.00',
      passed: wZero.valid === true && wZero.weight === 0 && wOne.valid === true && wOne.weight === 1,
      details: { wZero, wOne }
    });

    // Case 2.3: Weight out of bounds (> 1.00)
    const wHigh = validateTagWeight(1.45);
    tests.push({
      name: 'Should reject weight greater than 1.00',
      passed: wHigh.valid === false && typeof wHigh.error === 'string',
      details: wHigh
    });

    // Case 2.4: Negative weight (< 0.00)
    const wNeg = validateTagWeight(-0.1);
    tests.push({
      name: 'Should reject negative weight below 0.00',
      passed: wNeg.valid === false,
      details: wNeg
    });

    // Case 2.5: Non-numeric value
    const wNaN = validateTagWeight('expert');
    tests.push({
      name: 'Should reject non-numeric string representations',
      passed: wNaN.valid === false,
      details: wNaN
    });

    suites.push({
      suite_name: 'validateTagWeight()',
      description: 'Enforces tag weight constraints between 0.00 and 1.00 numeric values',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 3: calculateMatchingScore()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case 3.1: Perfect match (100%)
    const sampleJobTags = [
      { tag_id: 1, tag_name: 'Node.js', weight: 0.90 },
      { tag_id: 2, tag_name: 'React.js', weight: 0.80 }
    ];
    const candidatePerfect = [
      { tag_id: 1, tag_name: 'Node.js', weight: 1.0 },
      { tag_id: 2, tag_name: 'React.js', weight: 1.0 }
    ];
    const scoreResult1 = calculateMatchingScore(candidatePerfect, sampleJobTags);
    tests.push({
      name: 'Should return 100% when candidate possesses all job tags at maximum weight',
      passed: scoreResult1.score === 100 && scoreResult1.summary.missing_tags_count === 0,
      details: scoreResult1.summary
    });

    // Case 3.2: Partial overlap with weights
    const candidatePartial = [
      { tag_id: 1, tag_name: 'Node.js', weight: 0.90 } // Has Node.js 0.90, missing React.js
    ];
    // Earned: 0.90 * 0.90 = 0.81. Total job weight: 0.90 + 0.80 = 1.70.
    // Ratio: 0.81 / 1.70 = ~47.6% -> Math.round -> 48%
    const scoreResult2 = calculateMatchingScore(candidatePartial, sampleJobTags);
    tests.push({
      name: 'Should accurately calculate weighted partial score (expected ~48%)',
      passed: scoreResult2.score >= 45 && scoreResult2.score <= 50 && scoreResult2.summary.missing_tags_count === 1,
      details: scoreResult2.summary
    });

    // Case 3.3: Zero overlap
    const candidateNoMatch = [
      { tag_id: 7, tag_name: 'Figma', weight: 0.95 }
    ];
    const scoreResult3 = calculateMatchingScore(candidateNoMatch, sampleJobTags);
    tests.push({
      name: 'Should return 0% when there are no intersecting skill tags',
      passed: scoreResult3.score === 0 && scoreResult3.summary.matched_tags_count === 0,
      details: scoreResult3.summary
    });

    // Case 3.4: Includes detailed breakdown for tags
    tests.push({
      name: 'Should provide granular breakdown containing candidate_weight, job_weight, and status',
      passed: Array.isArray(scoreResult1.breakdown) && scoreResult1.breakdown.length === 2 && scoreResult1.breakdown[0].status === 'matched',
      details: scoreResult1.breakdown
    });

    // Case 3.5: Edge Case - Missing, undefined or invalid tag weights should not result in NaN
    const corruptJobTags = [
      { tag_id: 1, tag_name: 'Node.js', weight: undefined },
      { tag_id: 2, tag_name: 'React.js', weight: null },
      { tag_id: 3, tag_name: 'Docker', weight: 'invalid' }
    ];
    const corruptCandTags = [
      { tag_id: 1, tag_name: 'Node.js', weight: NaN },
      { tag_id: 2, tag_name: 'React.js' } // missing weight field
    ];
    const scoreResultNaNGuard = calculateMatchingScore(corruptCandTags, corruptJobTags, {
      candidate_exp: 'not-a-number',
      job_exp_req: null
    });
    tests.push({
      name: 'Should prevent NaN and gracefully return valid score when tag weights are missing or corrupt',
      passed: typeof scoreResultNaNGuard.score === 'number' && !isNaN(scoreResultNaNGuard.score) &&
              !isNaN(scoreResultNaNGuard.summary.total_job_weight) &&
              !isNaN(scoreResultNaNGuard.summary.earned_weight),
      details: scoreResultNaNGuard
    });

    suites.push({
      suite_name: 'calculateMatchingScore()',
      description: 'Calculates mathematical weighted compatibility score based on mutual tag weights',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 4: processMatchInteraction()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Isolated test IDs
    const testCandidateId = 'cand_unit_test';
    const testJobId = 'job_unit_test';

    // Step 1: Candidate skips -> is_matched must be false
    const skipRes = processMatchInteraction(testCandidateId, testJobId, 'candidate', 'skip');
    tests.push({
      name: 'Candidate skip action should record interaction without triggering match',
      passed: skipRes.success === true && skipRes.is_matched === false,
      details: skipRes
    });

    // Step 2: Candidate expresses interest -> single opt-in -> is_matched still false
    const candInterest = processMatchInteraction(testCandidateId, testJobId, 'candidate', 'express_interest');
    tests.push({
      name: 'Single-sided express_interest should NOT trigger a match yet (Waiting for counterpart)',
      passed: candInterest.success === true && candInterest.is_matched === false && candInterest.match_event === false,
      details: candInterest
    });

    // Step 3: Recruiter expresses interest -> DOUBLE OPT-IN! -> is_matched must be true
    const recruiterInterest = processMatchInteraction(testCandidateId, testJobId, 'recruiter', 'express_interest');
    tests.push({
      name: 'Recruiter mutual express_interest MUST trigger Double Opt-in (is_matched = true)',
      passed: recruiterInterest.success === true && recruiterInterest.is_matched === true && recruiterInterest.match_event === true,
      details: recruiterInterest
    });

    // Step 4: Verify unlocked contact details
    tests.push({
      name: 'Successful match must unlock contact details in response payload',
      passed: recruiterInterest.match_details && recruiterInterest.match_details.match_id === `${testCandidateId}_${testJobId}`,
      details: recruiterInterest.match_details
    });

    suites.push({
      suite_name: 'processMatchInteraction()',
      description: 'Executes card action states and enforces Double Opt-in mutual interest logic',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 5: authorizeEndpointAccess()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case 5.1: Candidate accessing feed_jobs
    const auth1 = authorizeEndpointAccess('candidate', 'feed_jobs');
    tests.push({
      name: 'Candidate role should have access to feed_jobs',
      passed: auth1.authorized === true,
      details: auth1
    });

    // Case 5.2: Candidate attempting to record recruiter action
    const auth2 = authorizeEndpointAccess('candidate', 'record_recruiter_action');
    tests.push({
      name: 'Candidate role should be forbidden from recording recruiter actions (403)',
      passed: auth2.authorized === false && auth2.code === 403,
      details: auth2
    });

    // Case 5.3: Recruiter accessing feed_candidates
    const auth3 = authorizeEndpointAccess('recruiter', 'feed_candidates');
    tests.push({
      name: 'Recruiter role should have access to feed_candidates',
      passed: auth3.authorized === true,
      details: auth3
    });

    // Case 5.4: Unauthenticated or empty role
    const auth4 = authorizeEndpointAccess('', 'feed_jobs');
    tests.push({
      name: 'Empty role should return 401 Unauthorized',
      passed: auth4.authorized === false && auth4.code === 401,
      details: auth4
    });

    // Case 5.5: Admin role accessing manage_tags (POST /api/v1/admin/tags)
    const auth5 = authorizeEndpointAccess('admin', 'manage_tags');
    tests.push({
      name: 'Admin role should have authorized access to manage_tags (POST /api/v1/admin/tags)',
      passed: auth5.authorized === true,
      details: auth5
    });

    // Case 5.6: Candidate role attempting to access manage_tags (403 Forbidden)
    const auth6 = authorizeEndpointAccess('candidate', 'manage_tags');
    tests.push({
      name: 'Candidate role should be forbidden from manage_tags (403)',
      passed: auth6.authorized === false && auth6.code === 403,
      details: auth6
    });

    // Case 5.7: Admin role accessing moderate_jobs (PATCH /api/v1/admin/jobs/:id/status)
    const auth7 = authorizeEndpointAccess('admin', 'moderate_jobs');
    tests.push({
      name: 'Admin role should have authorized access to moderate_jobs (PATCH /api/v1/admin/jobs/:id/status)',
      passed: auth7.authorized === true,
      details: auth7
    });

    // Case 5.8: Recruiter role attempting to access moderate_jobs (403 Forbidden)
    const auth8 = authorizeEndpointAccess('recruiter', 'moderate_jobs');
    tests.push({
      name: 'Recruiter role should be forbidden from moderate_jobs (403)',
      passed: auth8.authorized === false && auth8.code === 403,
      details: auth8
    });

    suites.push({
      suite_name: 'authorizeEndpointAccess()',
      description: 'Verifies role-based access control (RBAC) across endpoints and system operations',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  // ==========================================
  // Test 6: bcryptPasswordSecurity()
  // ==========================================
  {
    const tests = [];
    const tStart = Date.now();

    // Case 6.1: Seed users passwords must be bcrypt hashed
    const sampleUser = db.findUserByEmail('kawin.dev@example.com');
    const isBcrypt = sampleUser && (sampleUser.password.startsWith('$2a$') || sampleUser.password.startsWith('$2b$'));
    tests.push({
      name: 'Initial seed user password must be securely bcrypt-hashed',
      passed: !!isBcrypt,
      details: { samplePasswordPrefix: sampleUser?.password?.slice(0, 7) }
    });

    // Case 6.2: Correct password matches hash
    const matchSuccess = bcrypt.compareSync('password123', sampleUser.password);
    tests.push({
      name: 'bcrypt.compareSync should return true for correct password',
      passed: matchSuccess === true,
      details: { matchSuccess }
    });

    // Case 6.3: Incorrect password fails
    const matchFail = bcrypt.compareSync('wrongpassword', sampleUser.password);
    tests.push({
      name: 'bcrypt.compareSync should return false for incorrect password',
      passed: matchFail === false,
      details: { matchFail }
    });

    // Case 6.4: db.createUser automatically hashes plain text password
    const testNewUser = db.createUser({
      name: 'Test Secure User',
      email: `test_${Date.now()}@example.com`,
      password: 'MySecretPassword99!',
      role: 'candidate'
    });
    const newUserHashed = testNewUser.password.startsWith('$2a$') || testNewUser.password.startsWith('$2b$');
    const newUserVerifies = bcrypt.compareSync('MySecretPassword99!', testNewUser.password);
    tests.push({
      name: 'Newly created user password must be automatically hashed with bcrypt',
      passed: newUserHashed && newUserVerifies,
      details: { newUserHashed, newUserVerifies }
    });

    suites.push({
      suite_name: 'bcryptPasswordSecurity()',
      description: 'Verifies bcrypt password hashing, automatic hashing for new users, and secure verification',
      passed: tests.every(t => t.passed),
      tests,
      duration_ms: Date.now() - tStart
    });
  }

  const allPassed = suites.every(s => s.passed);
  const totalTests = suites.reduce((acc, s) => acc + s.tests.length, 0);
  const passedTests = suites.reduce((acc, s) => acc + s.tests.filter(t => t.passed).length, 0);

  return {
    all_passed: allPassed,
    total_suites: suites.length,
    passed_suites: suites.filter(s => s.passed).length,
    total_tests: totalTests,
    passed_tests: passedTests,
    timestamp: new Date().toISOString(),
    suites
  };
}

// Allow direct CLI execution: node src/tests/unitTests.js
if (require.main === module) {
  const result = runAllUnitTests();
  console.log('======================================================');
  console.log(`MatchWork Core Unit Tests: ${result.all_passed ? 'ALL PASSED ✅' : 'SOME FAILED ❌'}`);
  console.log(`Passed Suites: ${result.passed_suites}/${result.total_suites} | Passed Tests: ${result.passed_tests}/${result.total_tests}`);
  console.log('======================================================\n');
  result.suites.forEach((s, idx) => {
    console.log(`[Suite ${idx + 1}] ${s.suite_name} - ${s.passed ? 'PASSED ✅' : 'FAILED ❌'} (${s.duration_ms}ms)`);
    s.tests.forEach(t => {
      console.log(`   ${t.passed ? '✔' : '✖'} ${t.name}`);
    });
    console.log('');
  });
}

module.exports = {
  runAllUnitTests
};
