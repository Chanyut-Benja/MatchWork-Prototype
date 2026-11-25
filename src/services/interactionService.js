/**
 * Interaction Service: Handles Card Swiping and Double Opt-in Logic
 */
const db = require('../database/db');
const { validateInteractionPayload } = require('./validationService');

/**
 * Processes a card action (skip, save, express_interest) and checks for Double Opt-in
 *
 * @param {string} candidateId
 * @param {string} jobId
 * @param {string} initiatorRole - 'candidate' | 'recruiter'
 * @param {string} action - 'skip' | 'save' | 'express_interest'
 * @returns {Object} result
 */
function processMatchInteraction(candidateId, jobId, initiatorRole, action, meta = {}) {
  // Validate
  const validation = validateInteractionPayload({
    candidate_id: candidateId,
    job_id: jobId,
    initiator_role: initiatorRole,
    action
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Record this party's interaction with dynamic metadata
  const currentInteraction = db.recordInteraction({
    candidate_id: candidateId,
    job_id: jobId,
    initiator_role: initiatorRole,
    action,
    candidate_data: meta.candidate_data,
    job_data: meta.job_data
  });

  // If action is NOT express_interest, it cannot form a mutual match
  if (action !== 'express_interest') {
    return {
      success: true,
      action,
      initiator_role: initiatorRole,
      is_matched: false,
      match_event: false,
      message: `Card marked as '${action}'.`
    };
  }

  // Look for counterpart's reaction
  const counterpartRole = initiatorRole === 'candidate' ? 'recruiter' : 'candidate';
  const counterpartInteraction = db.findInteraction(candidateId, jobId, counterpartRole);

  const isMutualInterest = counterpartInteraction && counterpartInteraction.action === 'express_interest';

  if (isMutualInterest) {
    // DOUBLE OPT-IN SUCCESS!
    db.markMatch(candidateId, jobId, meta);

    const candidate = db.getCandidateById(candidateId);
    const job = db.getJobById(jobId);

    const candData = meta.candidate_data || {};
    const jobData = meta.job_data || {};

    const candidateName = (candidate && candidate.full_name) || candData.full_name || candData.name || 'Unknown Candidate';
    const candidateAvatar = (candidate && candidate.avatar) || candData.avatar || '';
    const candidateTitle = (candidate && candidate.title) || candData.title || '';
    const candidateEmail = (candidate && candidate.email) || candData.email || '';
    const candidatePhone = (candidate && candidate.phone) || candData.phone || '';
    const candidateSalary = (candidate && candidate.expected_salary)
      ? `฿${Number(candidate.expected_salary).toLocaleString()} / เดือน`
      : (candData.expected_salary ? (typeof candData.expected_salary === 'number' ? `฿${Number(candData.expected_salary).toLocaleString()} / เดือน` : candData.expected_salary) : 'ตามตกลง');

    const companyName = jobData.company_name || (job ? job.company_name : 'Unknown Company');
    const companyLogo = jobData.company_logo || (job ? job.company_logo : '');
    const jobTitle = jobData.title || (job ? job.title : 'Unknown Job');
    const contactEmail = jobData.contact_email || (job ? job.contact_email : '');
    const contactPhone = jobData.contact_phone || (job ? job.contact_phone : '');
    const salaryRange = jobData.salary_range || (job ? `฿${job.min_salary.toLocaleString()} - ฿${job.max_salary.toLocaleString()}` : '');

    return {
      success: true,
      action: 'express_interest',
      initiator_role: initiatorRole,
      is_matched: true,
      match_event: true,
      message: '🎉 Double Opt-in Match achieved! Contact details unlocked.',
      match_details: {
        match_id: `${candidateId}_${jobId}`,
        candidate_id: candidateId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone,
        candidate_title: candidateTitle,
        candidate_avatar: candidateAvatar,
        candidate_expected_salary: candidateSalary,
        job_id: jobId,
        job_title: jobTitle,
        company_name: companyName,
        company_logo: companyLogo,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        salary_range: salaryRange
      }
    };
  }

  return {
    success: true,
    action: 'express_interest',
    initiator_role: initiatorRole,
    is_matched: false,
    match_event: false,
    message: `Interest recorded. Waiting for ${counterpartRole === 'recruiter' ? 'recruiter' : 'job seeker'} to express interest.`
  };
}

/**
 * Simulates a mutual match based on dynamic context
 * Counterpart expresses interest first, and current user's role triggers Double Opt-in
 *
 * @param {string} candidateId
 * @param {string} jobId
 * @param {string} initiatorRole - 'candidate' | 'recruiter' (current user's role)
 * @param {Object} meta - Optional dynamic metadata { candidate_data, job_data }
 * @returns {Object} result
 */
function simulateMutualMatch(candidateId, jobId, initiatorRole = 'candidate', meta = {}) {
  const counterpartRole = initiatorRole === 'candidate' ? 'recruiter' : 'candidate';

  // 1. Counterpart expresses interest first (as if counterpart swiped first)
  db.recordInteraction({
    candidate_id: candidateId,
    job_id: jobId,
    initiator_role: counterpartRole,
    action: 'express_interest',
    candidate_data: meta.candidate_data,
    job_data: meta.job_data
  });

  // 2. Current user's role expresses interest, triggering Double Opt-in!
  const result = processMatchInteraction(candidateId, jobId, initiatorRole, 'express_interest', meta);
  return result;
}

module.exports = {
  processMatchInteraction,
  simulateMutualMatch
};
