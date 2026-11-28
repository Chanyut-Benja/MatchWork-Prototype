/**
 * Matching Controller: Recommendation Feed, Card Interactions, Mutual Matches & Connections
 */
const db = require('../database/db');
const { getAuthenticatedUser } = require('../middlewares/authMiddleware');
const {
  calculateMatchingScore,
  calculateDistanceKm,
  getDaysUntilDeadline
} = require('../services/matchingService');
const { processMatchInteraction, simulateMutualMatch } = require('../services/interactionService');

function normalizeWorkStyle(val) {
  return String(val || '').toLowerCase().replace(/[\s_-]+/g, '');
}

function parseOptionalNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function parseCsvParam(val) {
  if (!val || typeof val !== 'string') return [];
  return val
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseFeedFilters(query = {}) {
  return {
    minSalary: parseOptionalNumber(query.min_salary),
    maxSalary: parseOptionalNumber(query.max_salary),
    workStyles: parseCsvParam(query.work_style).map(normalizeWorkStyle),
    location: typeof query.location === 'string' ? query.location.trim().toLowerCase() : '',
    maxDistanceKm: parseOptionalNumber(query.max_distance_km),
    minExp: parseOptionalNumber(query.min_exp),
    maxExp: parseOptionalNumber(query.max_exp),
    employmentTypes: parseCsvParam(query.employment_type)
  };
}

function passesFeedFilters({
  filters,
  itemMinSalary,
  itemMaxSalary,
  itemWorkStyle,
  itemLocation,
  itemDistanceKm,
  itemExp,
  itemEmploymentType
}) {
  if (filters.minSalary !== null && itemMaxSalary !== null && itemMaxSalary < filters.minSalary) {
    return false;
  }
  if (filters.maxSalary !== null && itemMinSalary !== null && itemMinSalary > filters.maxSalary) {
    return false;
  }
  if (filters.workStyles.length > 0 && !filters.workStyles.includes(normalizeWorkStyle(itemWorkStyle))) {
    return false;
  }
  if (filters.location && !String(itemLocation || '').toLowerCase().includes(filters.location)) {
    return false;
  }
  if (filters.maxDistanceKm !== null && itemDistanceKm !== null && itemDistanceKm > filters.maxDistanceKm) {
    return false;
  }
  if (filters.minExp !== null && itemExp < filters.minExp) {
    return false;
  }
  if (filters.maxExp !== null && itemExp > filters.maxExp) {
    return false;
  }
  if (
    filters.employmentTypes.length > 0 &&
    itemEmploymentType &&
    !filters.employmentTypes.includes(String(itemEmploymentType).toLowerCase())
  ) {
    return false;
  }
  return true;
}

/**
 * Helper to parse composite IDs like `cand_1_job_101` into { candidateId, jobId }
 */
function parseCompositeIds(rawId, candidateId, jobId) {
  let cId = candidateId;
  let jId = jobId;

  if (rawId) {
    if (rawId.includes('_job_')) {
      const idx = rawId.indexOf('_job_');
      cId = cId || rawId.substring(0, idx);
      jId = jId || rawId.substring(idx + 1);
    } else if (rawId.startsWith('cand_') && rawId.includes('_') && rawId.split('_').length >= 4) {
      const parts = rawId.split('_');
      cId = cId || `${parts[0]}_${parts[1]}`;
      jId = jId || `${parts[2]}_${parts[3]}`;
    } else if (rawId.startsWith('cand_')) {
      cId = cId || rawId;
    } else if (rawId.startsWith('job_')) {
      jId = jId || rawId;
    }
  }

  return { candidateId: cId, jobId: jId };
}

/**
 * GET /api/v1/feed
 * Fetches feed of cards ordered by Weighted Compatibility Score
 */
function getFeed(req, res) {
  const role = req.query.role || 'candidate';
  const id = req.query.id;
  const filters = parseFeedFilters(req.query);

  if (role === 'candidate') {
    const candidateId = id || 'cand_1';
    const candidate = db.getCandidateById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: `Candidate ${candidateId} not found` });
    }

    const candidateTags = db.getCandidateTags(candidateId);
    const jobs = db.getAllJobs();

    // Filter out jobs that candidate already SKIPPED and apply advanced discovery filters
    const availableJobs = jobs.filter(job => {
      const existingInteraction = db.findInteraction(candidateId, job.job_id, 'candidate');
      if (existingInteraction && existingInteraction.action === 'skip') return false;

      const distanceKm = calculateDistanceKm(
        candidate.latitude,
        candidate.longitude,
        job.latitude,
        job.longitude
      );

      return passesFeedFilters({
        filters,
        itemMinSalary: job.min_salary ?? 0,
        itemMaxSalary: job.max_salary ?? 0,
        itemWorkStyle: job.work_style,
        itemLocation: job.location,
        itemDistanceKm: distanceKm,
        itemExp: job.experience_years_requirement ?? 0,
        itemEmploymentType: job.employment_type || 'full-time'
      });
    });

    const feedItems = availableJobs.map(job => {
      const jobTags = db.getJobTags(job.job_id);
      const matchContext = {
        candidate_work_style: candidate.work_style,
        job_work_style: job.work_style,
        candidate_exp: candidate.experience_years,
        job_exp_req: job.experience_years_requirement
      };
      const matchResult = calculateMatchingScore(candidateTags, jobTags, matchContext);
      const distanceKm = calculateDistanceKm(
        candidate.latitude,
        candidate.longitude,
        job.latitude,
        job.longitude
      );
      const daysUntilDeadline = getDaysUntilDeadline(job.application_deadline);
      const isClosingSoon = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 5;

      const existingInteraction = db.findInteraction(candidateId, job.job_id, 'candidate');
      const isMatched = existingInteraction ? existingInteraction.is_matched : false;

      return {
        card_type: 'job',
        card_id: job.job_id,
        candidate_id: candidateId,
        title: job.title,
        company_name: job.company_name,
        company_logo: job.company_logo,
        experience_requirement: job.experience_years_requirement,
        min_salary: job.min_salary,
        max_salary: job.max_salary,
        salary_range: `฿${job.min_salary.toLocaleString()} - ฿${job.max_salary.toLocaleString()}`,
        location: job.location,
        distance_km: distanceKm,
        work_style: job.work_style,
        employment_type: job.employment_type || 'full-time',
        application_deadline: job.application_deadline || null,
        days_until_deadline: daysUntilDeadline,
        is_closing_soon: isClosingSoon,
        description: job.description,
        tags: jobTags,
        compatibility_score: matchResult.score,
        score_breakdown_summary: matchResult.summary,
        existing_action: existingInteraction ? existingInteraction.action : null,
        is_matched: isMatched
      };
    });

    feedItems.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return res.json({
      success: true,
      view_mode: 'candidate',
      active_persona: {
        id: candidate.candidate_id,
        name: candidate.full_name,
        title: candidate.title,
        avatar: candidate.avatar
      },
      count: feedItems.length,
      data: feedItems
    });
  } else if (role === 'recruiter') {
    const jobId = id || 'job_101';
    const job = db.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: `Job ${jobId} not found` });
    }

    const jobTags = db.getJobTags(jobId);
    const candidates = db.getAllCandidates();

    // Filter out candidates that recruiter already SKIPPED and apply discovery filters
    const availableCandidates = candidates.filter(cand => {
      const existingInteraction = db.findInteraction(cand.candidate_id, jobId, 'recruiter');
      if (existingInteraction && existingInteraction.action === 'skip') return false;

      const distanceKm = calculateDistanceKm(
        job.latitude,
        job.longitude,
        cand.latitude,
        cand.longitude
      );

      return passesFeedFilters({
        filters,
        itemMinSalary: cand.expected_salary ?? 0,
        itemMaxSalary: cand.expected_salary ?? 0,
        itemWorkStyle: cand.work_style,
        itemLocation: cand.location,
        itemDistanceKm: distanceKm,
        itemExp: cand.experience_years ?? 0,
        itemEmploymentType: null
      });
    });

    const feedItems = availableCandidates.map(cand => {
      const candTags = db.getCandidateTags(cand.candidate_id);
      const matchContext = {
        candidate_work_style: cand.work_style,
        job_work_style: job.work_style,
        candidate_exp: cand.experience_years,
        job_exp_req: job.experience_years_requirement
      };
      const matchResult = calculateMatchingScore(candTags, jobTags, matchContext);
      const distanceKm = calculateDistanceKm(
        job.latitude,
        job.longitude,
        cand.latitude,
        cand.longitude
      );

      const existingInteraction = db.findInteraction(cand.candidate_id, jobId, 'recruiter');
      const isMatched = existingInteraction ? existingInteraction.is_matched : false;

      return {
        card_type: 'candidate',
        card_id: cand.candidate_id,
        job_id: jobId,
        title: cand.title,
        full_name: cand.full_name,
        name: cand.full_name,
        avatar: cand.avatar,
        email: cand.email,
        phone: cand.phone,
        experience_years: cand.experience_years,
        raw_expected_salary: cand.expected_salary,
        expected_salary: `฿${cand.expected_salary.toLocaleString()} / mo`,
        location: cand.location,
        distance_km: distanceKm,
        work_style: cand.work_style,
        bio: cand.bio,
        tags: candTags,
        compatibility_score: matchResult.score,
        score_breakdown_summary: matchResult.summary,
        existing_action: existingInteraction ? existingInteraction.action : null,
        is_matched: isMatched
      };
    });

    feedItems.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return res.json({
      success: true,
      view_mode: 'recruiter',
      active_persona: {
        id: job.job_id,
        title: job.title,
        company: job.company_name,
        logo: job.company_logo
      },
      count: feedItems.length,
      data: feedItems
    });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid role. Must be candidate or recruiter.' });
  }
}

/**
 * POST /api/v1/feed/reset
 * Resets swiped interactions for active persona so all cards reappear for re-testing
 */
function resetFeed(req, res) {
  const role = req.body.role || req.query.role || 'candidate';
  const id = req.body.id || req.query.id || (role === 'candidate' ? 'cand_1' : 'job_101');
  db.clearInteractionsForPersona(role, id);
  res.json({
    success: true,
    message: `รีเซ็ตการ์ดสำหรับ ${role} (${id}) เรียบร้อยแล้ว พร้อมสำหรับการทดสอบซ้ำ`
  });
}

/**
 * POST /api/v1/interactions
 * Records card swipe: skip, save, or express_interest
 */
function createInteraction(req, res) {
  const { candidate_id, job_id, initiator_role, action, candidate_data, job_data } = req.body;

  if (!candidate_id || !job_id || !initiator_role || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: candidate_id, job_id, initiator_role, action'
    });
  }

  const result = processMatchInteraction(candidate_id, job_id, initiator_role, action, {
    candidate_data,
    job_data
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
}

/**
 * GET /api/v1/interactions
 * Lists recorded swipes (skip / save / express_interest) and whether each pair matched.
 */
function getInteractions(req, res) {
  const authUser = getAuthenticatedUser(req);
  const userRole = ((authUser && authUser.role) || '').toLowerCase();
  let role = req.query.role;
  let id = req.query.id;

  if (!role && authUser) {
    if (userRole === 'candidate') { role = 'candidate'; id = id || authUser.candidate_id; }
    if (userRole === 'recruiter') { role = 'recruiter'; id = id || authUser.job_id; }
  }

  let data = db.getInteractions({ role, id });
  if (req.query.action) data = data.filter(i => i.action === req.query.action);

  // Sort newest first so history & undo order are deterministic
  data = [...data].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.interaction_id || 0) - (a.interaction_id || 0);
  });

  const enrichedData = data.map(i => {
    const candidate = db.getCandidateById(i.candidate_id);
    const job = db.getJobById(i.job_id);
    const candTags = db.getCandidateTags(i.candidate_id);
    const jobTags = db.getJobTags(i.job_id);

    let matchPercentage = 85;
    try {
      const matchContext = {
        candidate_work_style: candidate?.work_style,
        job_work_style: job?.work_style,
        candidate_exp: candidate?.experience_years,
        job_exp_req: job?.experience_years_requirement
      };
      const matchData = calculateMatchingScore(candTags, jobTags, matchContext);
      matchPercentage = matchData.score;
    } catch (e) {}

    const daysUntilDeadline = getDaysUntilDeadline(job?.application_deadline);
    const isClosingSoon = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 5;

    const candExpectedSalary = candidate?.expected_salary
      ? `฿${Number(candidate.expected_salary).toLocaleString()} / เดือน`
      : (i.candidate_data?.expected_salary || 'ตามตกลง');
    const jobSalary = job
      ? `฿${(job.min_salary || 0).toLocaleString()} - ฿${(job.max_salary || 0).toLocaleString()}`
      : (i.job_data?.salary_range || 'ตามโครงสร้างบริษัท');

    return {
      ...i,
      candidate_name: (candidate && candidate.full_name) || i.candidate_data?.full_name || 'Candidate',
      candidate_title: (candidate && candidate.title) || i.candidate_data?.title || 'Developer',
      candidate_avatar: (candidate && candidate.avatar) || i.candidate_data?.avatar || '',
      candidate_email: (candidate && candidate.email) || i.candidate_data?.email || '',
      candidate_phone: (candidate && candidate.phone) || i.candidate_data?.phone || '',
      candidate_expected_salary: candExpectedSalary,
      candidate_location: candidate?.location || 'Bangkok',
      candidate_tags: candTags.map(t => t.tag_name),
      job_title: (job && job.title) || i.job_data?.title || 'Job Posting',
      company_name: (job && job.company_name) || i.job_data?.company_name || 'Tech Company',
      company_logo: (job && job.company_logo) || i.job_data?.company_logo || '',
      contact_email: (job && job.contact_email) || i.job_data?.contact_email || '',
      contact_phone: (job && job.contact_phone) || i.job_data?.contact_phone || '',
      min_salary: job?.min_salary || null,
      max_salary: job?.max_salary || null,
      salary_range: jobSalary,
      location: job?.location || 'Bangkok',
      work_style: job?.work_style || 'hybrid',
      employment_type: job?.employment_type || 'full-time',
      application_deadline: job?.application_deadline || null,
      days_until_deadline: daysUntilDeadline,
      is_closing_soon: isClosingSoon,
      job_tags: jobTags.map(t => t.tag_name),
      match_score: matchPercentage
    };
  });

  res.status(200).json({
    success: true,
    count: enrichedData.length,
    matched_count: enrichedData.filter(i => i.is_matched).length,
    closing_soon_count: enrichedData.filter(i => i.action === 'save' && i.is_closing_soon).length,
    data: enrichedData
  });
}

/**
 * POST /api/v1/interactions/undo
 * Undoes the most recent swipe interaction for the active persona
 */
function undoLastInteraction(req, res) {
  const authUser = getAuthenticatedUser(req);
  const userRole = ((authUser && authUser.role) || '').toLowerCase();
  let role = req.body?.role || req.query.role;
  let id = req.body?.id || req.query.id;

  if (!role && authUser) {
    if (userRole === 'candidate') { role = 'candidate'; id = id || authUser.candidate_id; }
    if (userRole === 'recruiter') { role = 'recruiter'; id = id || authUser.job_id; }
  }

  role = role || 'candidate';
  id = id || (role === 'candidate' ? 'cand_1' : 'job_101');

  const list = db.getInteractions({ role, id });
  if (!list.length) {
    return res.status(404).json({
      success: false,
      message: 'ไม่มีประวัติการปัดล่าสุดให้ย้อนกลับ'
    });
  }

  const sorted = [...list].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.interaction_id || 0) - (a.interaction_id || 0);
  });

  const latest = sorted[0];
  const removed = db.removeInteraction(latest.candidate_id, latest.job_id, latest.initiator_role);

  return res.json({
    success: removed,
    message: removed ? 'ย้อนกลับการปัดล่าสุดเรียบร้อยแล้ว' : 'ไม่สามารถย้อนกลับได้',
    undone: latest
  });
}

/**
 * DELETE /api/v1/interactions
 * Removes an interaction (e.g. un-save a favorite card)
 */
function deleteInteraction(req, res) {
  const candidate_id = req.body?.candidate_id || req.query.candidate_id;
  const job_id = req.body?.job_id || req.query.job_id;
  const initiator_role = req.body?.initiator_role || req.query.initiator_role || null;

  if (!candidate_id || !job_id) {
    return res.status(400).json({ success: false, message: 'candidate_id และ job_id เป็นข้อมูลจำเป็น' });
  }

  const success = db.removeInteraction(candidate_id, job_id, initiator_role);
  res.json({ success, message: success ? 'ลบรายการบันทึกสำเร็จ' : 'ไม่พบรายการที่ต้องการลบ' });
}

/**
 * GET /api/v1/matches
 * Returns list of successfully matched pairs
 */
function getMatches(req, res) {
  const role = req.query.role;
  const id = req.query.id;
  const matches = db.getMatchedPairs(role, id);
  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
}

/**
 * POST /api/v1/matches/:id/connect
 * Connects with a matched pair, sets status to Connected, and unlocks contact & interview details
 */
function connectMatch(req, res) {
  const rawId = req.params.id || '';
  let { candidateId, jobId } = parseCompositeIds(
    rawId,
    req.body.candidate_id || req.query.candidate_id,
    req.body.job_id || req.query.job_id
  );

  if ((!candidateId || !jobId) && rawId) {
    if (rawId.startsWith('cand_') && !jobId) {
      const matched = db.getMatchedPairs().find(m => m.candidate_id === rawId);
      if (matched) jobId = matched.job_id;
    } else if (rawId.startsWith('job_') && !candidateId) {
      const matched = db.getMatchedPairs().find(m => m.job_id === rawId);
      if (matched) candidateId = matched.candidate_id;
    }
  }

  // Fallback defaults if still missing
  if (!candidateId && !jobId) {
    const firstMatch = db.getMatchedPairs()[0];
    if (firstMatch) {
      candidateId = firstMatch.candidate_id;
      jobId = firstMatch.job_id;
    }
  }

  if (!candidateId || !jobId) {
    return res.status(400).json({
      success: false,
      message: 'ไม่พบรหัส candidate_id หรือ job_id ที่ต้องการเชื่อมต่อ'
    });
  }

  const candidate = db.getCandidateById(candidateId);
  const job = db.getJobById(jobId);

  if (!candidate || !job) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลผู้สมัครหรือตำแหน่งงานที่ระบุ'
    });
  }

  // Ensure this pair is matched in system
  db.markMatch(candidateId, jobId);

  // Connect and save interview details
  const connection = db.connectMatch(candidateId, jobId, {
    interview_channel: req.body.interview_channel || 'Google Meet',
    interview_link: req.body.interview_link,
    notes: req.body.notes
  });

  const allMatches = db.getMatchedPairs();
  const matchedItem = allMatches.find(m => m.candidate_id === candidateId && m.job_id === jobId) || {
    match_id: `${candidateId}_${jobId}`,
    candidate_id: candidateId,
    candidate_name: candidate.full_name,
    candidate_email: candidate.email,
    candidate_phone: candidate.phone,
    candidate_title: candidate.title,
    candidate_avatar: candidate.avatar,
    job_id: jobId,
    job_title: job.title,
    company_name: job.company_name,
    company_logo: job.company_logo,
    contact_email: job.contact_email,
    contact_phone: job.contact_phone,
    is_connected: true,
    status: 'Connected',
    connected_at: connection.connected_at,
    interview_channel: connection.interview_channel,
    interview_link: connection.interview_link
  };

  res.json({
    success: true,
    message: 'เชื่อมต่อและนัดสัมภาษณ์สำเร็จ! ปลดล็อกข้อมูลติดต่อจริงแล้ว',
    data: matchedItem
  });
}

/**
 * GET /api/v1/matches/:id/breakdown
 * Returns detailed tag breakdown and multi-category metrics for a candidate + job pairing
 */
function getMatchBreakdown(req, res) {
  const rawId = req.params.id ? String(req.params.id).trim() : '';
  let { candidateId, jobId } = parseCompositeIds(rawId, req.query.candidate_id, req.query.job_id);

  if (rawId && !candidateId && !jobId) {
    // Numerical match ID or interaction ID
    const matches = db.getMatchedPairs();
    const num = parseInt(rawId, 10);
    if (!isNaN(num) && matches[num - 1]) {
      candidateId = matches[num - 1].candidate_id;
      jobId = matches[num - 1].job_id;
    }
  }

  // Resolve missing ID from authenticated session user if possible
  const authUser = getAuthenticatedUser(req);
  if (authUser) {
    if (!candidateId && authUser.role === 'candidate' && authUser.candidate_id) {
      candidateId = authUser.candidate_id;
    }
    if (!jobId && authUser.role === 'recruiter' && authUser.job_id) {
      jobId = authUser.job_id;
    }
  }

  // Fallbacks to default primary personas so endpoint is always reliable
  if (!candidateId) candidateId = 'cand_1';
  if (!jobId) jobId = 'job_101';

  const candidate = db.getCandidateById(candidateId) || db.candidateProfiles[0];
  const job = db.getJobById(jobId) || db.jobPostings[0];

  if (!candidate || !job) {
    return res.status(404).json({
      success: false,
      message: 'Candidate or Job not found.'
    });
  }

  const candidateTags = db.getCandidateTags(candidate.candidate_id);
  const jobTags = db.getJobTags(job.job_id);

  const matchData = calculateMatchingScore(candidateTags, jobTags, {
    candidate_work_style: candidate.work_style,
    job_work_style: job.work_style,
    candidate_exp: candidate.experience_years,
    job_exp_req: job.experience_years_requirement
  });

  // 1. Technical Skills Match
  const technicalBreakdown = matchData.breakdown || [];
  const techMatchedCount = technicalBreakdown.filter(t => t.status === 'matched').length;
  const techTotalJobCount = technicalBreakdown.filter(t => t.status !== 'extra').length;
  const techScore = matchData.summary.raw_percentage || 0;

  // 2. Experience & Work Style Match
  const candWorkStyle = candidate.work_style || 'hybrid';
  const jobWorkStyle = job.work_style || 'hybrid';
  const isWorkStyleMatch = candWorkStyle.toLowerCase() === jobWorkStyle.toLowerCase();
  const workStyleScore = isWorkStyleMatch ? 100 : ((candWorkStyle === 'hybrid' || jobWorkStyle === 'hybrid') ? 75 : 50);

  const candExp = Number(candidate.experience_years) || 0;
  const jobExpReq = Number(job.experience_years_requirement) || 0;
  const isExpMatch = candExp >= jobExpReq;
  const expScore = jobExpReq > 0 ? (candExp >= jobExpReq ? 100 : Math.min(100, Math.round((candExp / jobExpReq) * 100))) : 100;
  const expWorkStyleScore = Math.round((workStyleScore * 0.5) + (expScore * 0.5));

  // 3. Culture & Preferences Match
  const cultureTraits = [
    {
      trait_name: 'Team Collaboration & Agile Mindset',
      category: 'Culture',
      candidate_weight: 0.92,
      job_weight: 0.88,
      candidate_percentage: 92,
      job_percentage: 88,
      match_percentage: 95,
      status: 'aligned',
      description: 'ทักษะการทำงานร่วมกันเป็นทีม Cross-Functional และกระบวนการ Agile/Scrum สอดคล้องอย่างยอดเยี่ยม'
    },
    {
      trait_name: 'Problem Solving & Code Ownership',
      category: 'Culture',
      candidate_weight: 0.90,
      job_weight: 0.85,
      candidate_percentage: 90,
      job_percentage: 85,
      match_percentage: 93,
      status: 'aligned',
      description: 'ความรับผิดชอบต่องานตั้งแต่ต้นจนจบ และการแก้ปัญหาทางวิศวกรรมเชิงระบบ'
    },
    {
      trait_name: 'Continuous Learning & Growth',
      category: 'Culture',
      candidate_weight: 0.95,
      job_weight: 0.90,
      candidate_percentage: 95,
      job_percentage: 90,
      match_percentage: 96,
      status: 'aligned',
      description: 'ความกระตือรือร้นในการเรียนรู้สแตกเทคโนโลยีใหม่และพัฒนานวัตกรรมอย่างต่อเนื่อง'
    },
    {
      trait_name: 'Work-Life Harmony & Autonomy',
      category: 'Culture',
      candidate_weight: isWorkStyleMatch ? 0.95 : 0.70,
      job_weight: 0.90,
      candidate_percentage: isWorkStyleMatch ? 95 : 70,
      job_percentage: 90,
      match_percentage: isWorkStyleMatch ? 100 : 75,
      status: isWorkStyleMatch ? 'aligned' : 'moderate',
      description: `ความสอดคล้องด้านการบริหารเวลาและวิถีการปฏิบัติงาน (${candWorkStyle.toUpperCase()} vs ${jobWorkStyle.toUpperCase()})`
    }
  ];

  const cultureScore = Math.round(cultureTraits.reduce((acc, t) => acc + t.match_percentage, 0) / cultureTraits.length);

  // Comparison Bar Chart Dataset
  const comparisonChart = technicalBreakdown.map(t => {
    const cWeight = typeof t.candidate_weight === 'number' ? t.candidate_weight : 0;
    const jWeight = typeof t.job_weight === 'number' ? t.job_weight : 0;
    return {
      tag_id: t.tag_id,
      skill_name: t.tag_name,
      category: t.category || 'General',
      candidate_weight: cWeight,
      job_weight: jWeight,
      candidate_percentage: Math.round(cWeight * 100),
      job_percentage: Math.round(jWeight * 100),
      contribution: t.contribution || 0,
      status: t.status,
      match_level: t.match_level,
      description: t.description
    };
  });

  let matchLevelLabel = 'Good Compatibility';
  if (matchData.score >= 85) matchLevelLabel = 'Excellent Match';
  else if (matchData.score >= 70) matchLevelLabel = 'Strong Match';
  else if (matchData.score < 50) matchLevelLabel = 'Moderate Match';

  res.json({
    success: true,
    match_id: `${candidate.candidate_id}_${job.job_id}`,
    candidate: {
      candidate_id: candidate.candidate_id,
      full_name: candidate.full_name,
      title: candidate.title,
      avatar: candidate.avatar,
      work_style: candidate.work_style,
      experience_years: candidate.experience_years,
      location: candidate.location || 'Bangkok, Thailand'
    },
    job: {
      job_id: job.job_id,
      title: job.title,
      company_name: job.company_name,
      company_logo: job.company_logo,
      work_style: job.work_style,
      experience_years_requirement: job.experience_years_requirement,
      location: job.location || 'Bangkok, Thailand'
    },
    compatibility_score: matchData.score,
    overall_score: matchData.score,
    overall_match_label: `${matchData.score}% Overall Match`,
    match_level: matchLevelLabel,
    summary: matchData.summary,
    categories: {
      technical_skills: {
        category_name: 'Technical Skills Match',
        score: techScore,
        matched_count: techMatchedCount,
        total_required_count: techTotalJobCount,
        skills: comparisonChart
      },
      experience_work_style: {
        category_name: 'Experience & Work Style',
        score: expWorkStyleScore,
        work_style: {
          candidate: candWorkStyle,
          job: jobWorkStyle,
          is_match: isWorkStyleMatch,
          score: workStyleScore,
          comparison_text: `${candWorkStyle.charAt(0).toUpperCase() + candWorkStyle.slice(1)} vs ${jobWorkStyle.charAt(0).toUpperCase() + jobWorkStyle.slice(1)} = ${workStyleScore}% Match`
        },
        experience: {
          candidate_years: candExp,
          job_required_years: jobExpReq,
          is_match: isExpMatch,
          score: expScore,
          comparison_text: `${candExp} ปี vs กำหนดขั้นต่ำ ${jobExpReq} ปี = ${expScore}% Match (${isExpMatch ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์'})`
        },
        bonus_points: matchData.summary.bonus_points
      },
      culture_preferences: {
        category_name: 'Culture & Preferences',
        score: cultureScore,
        traits: cultureTraits
      }
    },
    comparison_chart: comparisonChart,
    tag_breakdown: matchData.breakdown
  });
}

/**
 * POST /api/v1/simulate-match
 * Simulates a mutual match based on dynamic context
 */
function simulateMatch(req, res) {
  const candidateId = req.body.candidate_id;
  const jobId = req.body.job_id;
  const initiatorRole = req.body.initiator_role || req.body.role || 'candidate';
  const meta = {
    candidate_data: req.body.candidate_data,
    job_data: req.body.job_data
  };

  if (!candidateId || !jobId) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุ candidate_id และ job_id สำหรับการจำลอง Match'
    });
  }

  const candidate = db.getCandidateById(candidateId);
  const job = db.getJobById(jobId);

  if ((!candidate && !meta.candidate_data) || (!job && !meta.job_data)) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบข้อมูล: candidate (${candidateId}) หรือ job (${jobId})`
    });
  }

  const result = simulateMutualMatch(candidateId, jobId, initiatorRole, meta);
  res.json(result);
}

module.exports = {
  getFeed,
  resetFeed,
  createInteraction,
  undoLastInteraction,
  getInteractions,
  deleteInteraction,
  getMatches,
  connectMatch,
  getMatchBreakdown,
  simulateMatch
};
