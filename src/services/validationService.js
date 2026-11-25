/**
 * Validation Service for MatchWork System
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_WORK_STYLES = ['remote', 'hybrid', 'on-site'];
const VALID_ACTIONS = ['skip', 'save', 'express_interest'];
const VALID_ROLES = ['candidate', 'recruiter'];

/**
 * Validates a username based on allowed characters and length constraints.
 * - Allowed characters: Alphanumeric and underscores (a-z, A-Z, 0-9, _)
 * - Length: Between 3 and 20 characters
 * @param {string} username
 * @returns {{ valid: boolean, error?: string }}
 */
function validateUsername(username) {
  if (typeof username !== 'string') {
    return { valid: false, error: 'Username must be a string' };
  }

  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return {
      valid: false,
      error: `Username length boundary violated: length must be between 3 and 20 characters (current: ${trimmed.length})`
    };
  }

  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Username contains invalid characters. Only letters, numbers, and underscores are allowed'
    };
  }

  return { valid: true };
}

/**
 * Checks if a user has admin access permissions
 * @param {Object|string} user - User object or role string
 * @returns {boolean}
 */
function canAccessAdmin(user) {
  if (!user) return false;
  const role = typeof user === 'string' ? user : user.role;
  return typeof role === 'string' && role.trim().toLowerCase() === 'admin';
}

/**
 * Validates a candidate profile object
 * @param {Object} profile
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateCandidateProfile(profile) {
  const errors = [];

  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['Profile payload must be a non-null object'] };
  }

  if (!profile.candidate_id || typeof profile.candidate_id !== 'string' || profile.candidate_id.trim() === '') {
    errors.push('candidate_id is required and must be a non-empty string');
  }

  if (!profile.full_name || typeof profile.full_name !== 'string' || profile.full_name.trim().length < 2) {
    errors.push('full_name is required and must be at least 2 characters');
  }

  if (!profile.email || typeof profile.email !== 'string' || !EMAIL_REGEX.test(profile.email)) {
    errors.push('email must be a valid email address');
  }

  if (typeof profile.experience_years !== 'number' || isNaN(profile.experience_years) || profile.experience_years < 0) {
    errors.push('experience_years must be a non-negative number');
  }

  if (typeof profile.expected_salary !== 'number' || isNaN(profile.expected_salary) || profile.expected_salary <= 0) {
    errors.push('expected_salary must be a positive number greater than 0');
  }

  if (!profile.work_style || !VALID_WORK_STYLES.includes(profile.work_style.toLowerCase())) {
    errors.push(`work_style must be one of: ${VALID_WORK_STYLES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a tag weight
 * @param {number|string} weight - Expected between 0.00 and 1.00
 * @returns {{ valid: boolean, weight?: number, error?: string }}
 */
function validateTagWeight(weight) {
  const num = Number(weight);
  if (isNaN(num)) {
    return { valid: false, error: 'Tag weight must be a valid number' };
  }

  if (num < 0.0 || num > 1.0) {
    return { valid: false, error: `Tag weight must be between 0.00 and 1.00 (received: ${num})` };
  }

  // Round to 2 decimal places
  const normalized = Math.round(num * 100) / 100;

  return {
    valid: true,
    weight: normalized
  };
}

/**
 * Validates interaction payload
 */
function validateInteractionPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Invalid payload'] };
  }

  if (!payload.candidate_id) errors.push('candidate_id is required');
  if (!payload.job_id) errors.push('job_id is required');
  if (!payload.initiator_role || !VALID_ROLES.includes(payload.initiator_role)) {
    errors.push(`initiator_role must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (!payload.action || !VALID_ACTIONS.includes(payload.action)) {
    errors.push(`action must be one of: ${VALID_ACTIONS.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Authorizes endpoint access based on role and operation
 * @param {string} role
 * @param {string} resource
 * @returns {{ authorized: boolean, code?: number, reason?: string }}
 */
function authorizeEndpointAccess(role, resource) {
  if (!role || typeof role !== 'string') {
    return { authorized: false, code: 401, reason: 'Authentication role missing' };
  }

  const normalizedRole = role.toLowerCase();
  if (!VALID_ROLES.includes(normalizedRole) && normalizedRole !== 'admin') {
    return { authorized: false, code: 403, reason: `Role '${role}' is not recognized` };
  }

  // Role permissions rules
  const permissions = {
    candidate: ['feed_jobs', 'record_candidate_action', 'view_candidate_matches', 'view_breakdown', 'list_tags'],
    recruiter: ['feed_candidates', 'record_recruiter_action', 'view_recruiter_matches', 'view_breakdown', 'list_tags'],
    admin: [
      'feed_jobs',
      'feed_candidates',
      'record_candidate_action',
      'record_recruiter_action',
      'view_candidate_matches',
      'view_recruiter_matches',
      'view_breakdown',
      'list_tags',
      'manage_tags',
      'moderate_jobs',
      'manage_jobs'
    ]
  };

  const allowed = permissions[normalizedRole] || [];
  if (!allowed.includes(resource)) {
    return {
      authorized: false,
      code: 403,
      reason: `Role '${normalizedRole}' does not have permission to access resource '${resource}'`
    };
  }

  return { authorized: true };
}

module.exports = {
  validateUsername,
  canAccessAdmin,
  validateCandidateProfile,
  validateTagWeight,
  validateInteractionPayload,
  authorizeEndpointAccess,
  VALID_WORK_STYLES,
  VALID_ACTIONS,
  VALID_ROLES
};
