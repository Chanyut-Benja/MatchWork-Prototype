/**
 * Matching Service: Tag-weighted Compatibility Calculation
 */

/**
 * Safely parse and normalize tag weight to [0.0, 1.0]
 * Prevents NaN and negative or invalid weights.
 */
function safeWeight(val) {
  if (val === null || val === undefined) return 0;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || !Number.isFinite(num) || num < 0) return 0;
  return Math.min(1, Math.round(num * 100) / 100);
}

/**
 * Calculates compatibility score between candidate tags and job tags.
 * Formula:
 * For each tag required by the job with weight W_j:
 *   If candidate has tag with weight W_c:
 *     Contribution = W_c * W_j
 *   Else:
 *     Contribution = 0
 * TagMatchRatio = sum(Contribution) / sum(W_j)
 *
 * Additional fit factor (Work style and Experience) can grant slight bonus.
 *
 * @param {Array} candidateTags - List of candidate tags [{ tag_id, tag_name, category, weight }]
 * @param {Array} jobTags - List of job tags [{ tag_id, tag_name, category, weight }]
 * @param {Object} context - Optional context { candidate_work_style, job_work_style, candidate_exp, job_exp_req }
 * @returns {Object} { score: number, breakdown: Array, summary: Object }
 */
function calculateMatchingScore(candidateTags = [], jobTags = [], context = {}) {
  const safeCandTags = Array.isArray(candidateTags) ? candidateTags : [];
  const safeJobTags = Array.isArray(jobTags) ? jobTags : [];
  const safeCtx = (context && typeof context === 'object') ? context : {};

  if (safeJobTags.length === 0) {
    return {
      score: 0,
      breakdown: [],
      summary: {
        total_job_weight: 0,
        earned_weight: 0,
        raw_percentage: 0,
        bonus_points: 0,
        final_percentage: 0,
        matched_tags_count: 0,
        missing_tags_count: 0,
        bonus_tags_count: safeCandTags.length
      }
    };
  }

  // Create lookup map for candidate tags by tag_id
  const candidateTagMap = new Map();
  safeCandTags.forEach(ct => {
    if (ct && ct.tag_id !== undefined && ct.tag_id !== null) {
      candidateTagMap.set(ct.tag_id, ct);
    }
  });

  let totalJobWeight = 0;
  let earnedWeight = 0;
  const breakdown = [];
  const processedCandidateTagIds = new Set();

  // Evaluate each job tag requirement
  safeJobTags.forEach(jt => {
    if (!jt) return;
    const jobWeight = safeWeight(jt.weight);
    totalJobWeight += jobWeight;

    const candTag = jt.tag_id !== undefined && jt.tag_id !== null ? candidateTagMap.get(jt.tag_id) : null;
    if (candTag) {
      processedCandidateTagIds.add(jt.tag_id);
      const candWeight = safeWeight(candTag.weight);
      // Tag synergy = Candidate Weight * Job Weight
      const contribution = Math.round((candWeight * jobWeight) * 1000) / 1000;
      earnedWeight += contribution;

      let matchLevel = 'Moderate';
      if (candWeight >= 0.85 && jobWeight >= 0.85) matchLevel = 'Excellent';
      else if (candWeight >= 0.70) matchLevel = 'Strong';
      else if (candWeight < 0.40) matchLevel = 'Basic';

      breakdown.push({
        tag_id: jt.tag_id,
        tag_name: jt.tag_name || `Tag #${jt.tag_id}`,
        category: jt.category || 'General',
        candidate_weight: candWeight,
        job_weight: jobWeight,
        contribution,
        status: 'matched',
        match_level: matchLevel,
        description: `Candidate (${Math.round(candWeight * 100)}%) meets requirement (${Math.round(jobWeight * 100)}%)`
      });
    } else {
      breakdown.push({
        tag_id: jt.tag_id,
        tag_name: jt.tag_name || `Tag #${jt.tag_id}`,
        category: jt.category || 'General',
        candidate_weight: 0,
        job_weight: jobWeight,
        contribution: 0,
        status: 'missing',
        match_level: 'Missing',
        description: `Job requires this skill (${Math.round(jobWeight * 100)}%) but not listed in profile`
      });
    }
  });

  // Also include candidate bonus skills (extra skills candidate has that job didn't specify)
  safeCandTags.forEach(ct => {
    if (ct && ct.tag_id !== undefined && ct.tag_id !== null && !processedCandidateTagIds.has(ct.tag_id)) {
      const candWeight = safeWeight(ct.weight);
      breakdown.push({
        tag_id: ct.tag_id,
        tag_name: ct.tag_name || `Tag #${ct.tag_id}`,
        category: ct.category || 'General',
        candidate_weight: candWeight,
        job_weight: 0,
        contribution: 0,
        status: 'extra',
        match_level: 'Bonus Skill',
        description: `Additional value-add skill possessed by candidate (${Math.round(candWeight * 100)}%)`
      });
    }
  });

  totalJobWeight = Math.round(totalJobWeight * 1000) / 1000;
  earnedWeight = Math.round(earnedWeight * 1000) / 1000;

  const rawRatio = (totalJobWeight > 0 && Number.isFinite(totalJobWeight)) ? (earnedWeight / totalJobWeight) : 0;
  let score = Math.round(rawRatio * 100);

  // Experience and work style bonuses
  let bonusPoints = 0;
  if (safeCtx.candidate_work_style && safeCtx.job_work_style) {
    if (String(safeCtx.candidate_work_style).toLowerCase() === String(safeCtx.job_work_style).toLowerCase()) {
      bonusPoints += 2;
    }
  }
  if (typeof safeCtx.candidate_exp === 'number' && typeof safeCtx.job_exp_req === 'number' &&
      Number.isFinite(safeCtx.candidate_exp) && Number.isFinite(safeCtx.job_exp_req)) {
    if (safeCtx.candidate_exp >= safeCtx.job_exp_req) {
      bonusPoints += 3;
    }
  }

  // Ensure score is strictly a finite number, never NaN
  if (isNaN(score) || !Number.isFinite(score)) {
    score = 0;
  }
  score = Math.min(100, Math.max(0, score + bonusPoints));

  const matchedCount = breakdown.filter(b => b.status === 'matched').length;
  const missingCount = breakdown.filter(b => b.status === 'missing').length;
  const extraCount = breakdown.filter(b => b.status === 'extra').length;

  const safeTotalJobWeight = Math.round(totalJobWeight * 100) / 100 || 0;
  const safeEarnedWeight = Math.round(earnedWeight * 100) / 100 || 0;
  const safeRawPercentage = Math.round(rawRatio * 100) || 0;

  return {
    score,
    breakdown,
    summary: {
      total_job_weight: safeTotalJobWeight,
      earned_weight: safeEarnedWeight,
      raw_percentage: safeRawPercentage,
      bonus_points: bonusPoints,
      final_percentage: score,
      matched_tags_count: matchedCount,
      missing_tags_count: missingCount,
      bonus_tags_count: extraCount
    }
  };
}

/**
 * Haversine distance in kilometers between two coordinates.
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toNum = (v) => (typeof v === 'number' ? v : parseFloat(v));
  const aLat = toNum(lat1);
  const aLon = toNum(lon1);
  const bLat = toNum(lat2);
  const bLon = toNum(lon2);
  if (![aLat, aLon, bLat, bLon].every((n) => Number.isFinite(n))) return null;

  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a =
    sinLat * sinLat +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Returns whole days remaining until application_deadline (YYYY-MM-DD or ISO).
 */
function getDaysUntilDeadline(deadlineStr) {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return null;
  const now = new Date();
  const todayMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const targetMidnight = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate()
  );
  return Math.ceil((targetMidnight - todayMidnight) / 86400000);
}

module.exports = {
  calculateMatchingScore,
  calculateDistanceKm,
  getDaysUntilDeadline
};
