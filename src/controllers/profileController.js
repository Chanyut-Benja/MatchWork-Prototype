/**
 * Profile Controller: CandidateProfile, Seeker Preferences/Weights, and JobPosting
 */
const db = require('../database/db');
const { getAuthenticatedUser } = require('../middlewares/authMiddleware');
const { validateTagWeight } = require('../services/validationService');

const WORK_STYLES = ['remote', 'hybrid', 'on-site'];

/**
 * GET /api/v1/candidates/:id/tags
 */
function getCandidateTags(req, res) {
  const candidateId = req.params.id;
  const tags = db.getCandidateTags(candidateId);
  const profile = db.getCandidateById(candidateId);

  res.json({
    success: true,
    candidate_id: candidateId,
    profile,
    tags
  });
}

/**
 * PUT /api/v1/candidates/:id/tags
 * Update candidate skill tags & weights
 */
function updateCandidateTags(req, res) {
  const candidateId = req.params.id;
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ success: false, message: 'tags must be an array of { tag_id, weight }' });
  }

  const updated = db.updateCandidateTags(candidateId, tags);
  res.json({
    success: true,
    message: 'อัปเดตข้อมูลทักษะและค่าน้ำหนักเรียบร้อยแล้ว',
    tags: updated
  });
}

/**
 * POST /api/v1/seekers/profile
 * Job Seeker creates (or updates) their profile and tag preferences.
 * Returns 201 Created for a new profile, 200 OK when an existing profile is updated.
 */
function saveSeekerProfile(req, res) {
  const authUser = getAuthenticatedUser(req);
  const role = ((authUser && authUser.role) || '').toLowerCase();

  if (role === 'recruiter') {
    return res.status(403).json({
      success: false,
      message: 'เฉพาะผู้หางาน (Job Seeker) เท่านั้นที่สร้างโปรไฟล์ผู้หางานได้ (403 Forbidden)'
    });
  }

  const body = req.body || {};
  const candidateId = (authUser && authUser.candidate_id) || body.candidate_id || null;
  const existing = candidateId ? db.getCandidateById(candidateId) : null;
  const errors = [];

  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : undefined;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined;

  if (!existing && !fullName) errors.push('full_name (ชื่อ-นามสกุล) เป็นข้อมูลที่จำเป็น');
  if (fullName !== undefined && fullName === '') errors.push('full_name ต้องไม่เป็นค่าว่าง');
  if (!existing && !email) errors.push('email เป็นข้อมูลที่จำเป็น');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('รูปแบบอีเมลไม่ถูกต้อง');

  const numberField = (key, label, max) => {
    if (body[key] === undefined || body[key] === '' || body[key] === null) return undefined;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0 || n > max) {
      errors.push(`${label} ต้องเป็นตัวเลขระหว่าง 0 ถึง ${max.toLocaleString()}`);
      return undefined;
    }
    return Math.round(n);
  };
  const experienceYears = numberField('experience_years', 'experience_years (ประสบการณ์)', 60);
  const expectedSalary = numberField('expected_salary', 'expected_salary (เงินเดือนที่คาดหวัง)', 10000000);

  let workStyle;
  if (body.work_style !== undefined && body.work_style !== '') {
    workStyle = String(body.work_style).trim().toLowerCase();
    if (!WORK_STYLES.includes(workStyle)) errors.push(`work_style ต้องเป็น ${WORK_STYLES.join(', ')}`);
  }

  let cleanedTags = null;
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('tags ต้องเป็น array ของ { tag_id, weight }');
    } else {
      const seen = new Set();
      cleanedTags = [];
      body.tags.forEach(t => {
        const tagId = Number(t && t.tag_id);
        if (!db.tags.some(x => x.tag_id === tagId)) {
          errors.push(`ไม่พบแท็กรหัส ${t && t.tag_id}`);
          return;
        }
        const w = validateTagWeight(t.weight === undefined ? 0.8 : t.weight);
        if (!w.valid) { errors.push(w.error); return; }
        if (seen.has(tagId)) return;
        seen.add(tagId);
        cleanedTags.push({ tag_id: tagId, weight: w.weight });
      });
    }
  }

  if (email) {
    const owner = db.getCandidateByEmail(email);
    if (owner && owner.candidate_id !== candidateId) {
      return res.status(409).json({ success: false, message: 'อีเมลนี้ถูกใช้กับโปรไฟล์อื่นแล้ว' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const { profile, created } = db.saveCandidateProfile(candidateId, {
    full_name: fullName,
    email,
    title: typeof body.title === 'string' ? body.title.trim() : undefined,
    phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
    location: typeof body.location === 'string' ? body.location.trim() : undefined,
    bio: typeof body.bio === 'string' ? body.bio.trim() : undefined,
    portfolio_url: typeof body.portfolio_url === 'string' ? body.portfolio_url.trim() : undefined,
    github_url: typeof body.github_url === 'string' ? body.github_url.trim() : undefined,
    linkedin_url: typeof body.linkedin_url === 'string' ? body.linkedin_url.trim() : undefined,
    resume_filename: typeof body.resume_filename === 'string' ? body.resume_filename.trim() : undefined,
    resume_data: typeof body.resume_data === 'string' ? body.resume_data : undefined,
    online_resume: body.online_resume !== undefined ? body.online_resume : undefined,
    experience_years: experienceYears,
    expected_salary: expectedSalary,
    work_style: workStyle
  });

  const tags = cleanedTags ? db.updateCandidateTags(profile.candidate_id, cleanedTags) : db.getCandidateTags(profile.candidate_id);

  // Keep the logged-in account in sync with the profile (navbar name, title, linked candidate_id)
  if (authUser && authUser.id) {
    db.updateUser(authUser.id, {
      candidate_id: profile.candidate_id,
      name: profile.full_name,
      title: profile.title
    });
    Object.assign(authUser, { candidate_id: profile.candidate_id, name: profile.full_name, title: profile.title });
  }

  const status = created ? 201 : 200;
  return res.status(status).json({
    success: true,
    status,
    message: created ? 'สร้างโปรไฟล์ผู้หางานสำเร็จ (201 Created)' : 'อัปเดตโปรไฟล์เรียบร้อยแล้ว (200 OK)',
    data: { profile, tags }
  });
}

/**
 * GET /api/v1/seekers/profile
 * Returns the logged-in seeker's profile and tags (or ?candidate_id=...)
 */
function getSeekerProfile(req, res) {
  const authUser = getAuthenticatedUser(req);
  const candidateId = req.query.candidate_id || (authUser && authUser.candidate_id);
  const profile = candidateId ? db.getCandidateById(candidateId) : null;
  if (!profile) {
    return res.status(404).json({ success: false, message: 'ยังไม่มีโปรไฟล์ผู้หางาน' });
  }
  res.json({ success: true, data: { profile, tags: db.getCandidateTags(candidateId) } });
}

/**
 * PUT /api/v1/seekers/preferences/weights
 * Update Job Seeker's tag weights preference
 */
function updateSeekerWeights(req, res) {
  const authUser = getAuthenticatedUser(req);
  const candidateId = req.body.candidate_id || (authUser && authUser.candidate_id) || req.query.candidate_id || 'cand_1';
  const rawWeights = req.body.weights || req.body.tags;

  if (!candidateId) {
    return res.status(400).json({
      success: false,
      message: 'candidate_id is required'
    });
  }

  if (!Array.isArray(rawWeights)) {
    return res.status(400).json({
      success: false,
      message: 'weights must be an array of { tag_id, weight }'
    });
  }

  const cleanedWeights = rawWeights.map(item => {
    const valid = validateTagWeight(item.weight);
    return {
      tag_id: Number(item.tag_id),
      weight: valid.valid ? valid.weight : Math.max(0, Math.min(1, Math.round((Number(item.weight) || 0) * 100) / 100))
    };
  }).filter(item => !isNaN(item.tag_id));

  const updatedTags = db.updateCandidateTags(candidateId, cleanedWeights);

  res.status(200).json({
    success: true,
    status: 200,
    message: 'บันทึกค่าน้ำหนักสกิลสำเร็จ (Status 200 OK)',
    candidate_id: candidateId,
    weights: updatedTags,
    data: {
      candidate_id: candidateId,
      weights: updatedTags
    }
  });
}

/**
 * GET /api/v1/seekers/preferences/weights
 * Retrieve current tag weights preference for a seeker
 */
function getSeekerWeights(req, res) {
  const authUser = getAuthenticatedUser(req);
  const candidateId = req.query.candidate_id || (authUser && authUser.candidate_id) || 'cand_1';
  const tags = db.getCandidateTags(candidateId);
  const profile = db.getCandidateById(candidateId);

  res.status(200).json({
    success: true,
    status: 200,
    candidate_id: candidateId,
    profile,
    weights: tags,
    data: {
      candidate_id: candidateId,
      profile,
      weights: tags
    }
  });
}

/**
 * POST /api/v1/jobs
 * Recruiter creates a new Job Posting with required tags & weights
 */
function createJob(req, res) {
  const {
    company_name,
    title,
    experience_years_requirement,
    min_salary,
    max_salary,
    tags,
    work_style,
    employment_type,
    application_deadline,
    location,
    description,
    contact_email,
    contact_phone
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'ชื่อตำแหน่งงาน (Job Title) เป็นข้อมูลที่จำเป็น'
    });
  }

  if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'ชื่อบริษัท (Company Name) เป็นข้อมูลที่จำเป็น'
    });
  }

  const parsedTags = Array.isArray(tags) ? tags.map(t => {
    const valid = validateTagWeight(t.weight);
    return {
      tag_id: Number(t.tag_id),
      weight: valid.valid ? valid.weight : Math.max(0, Math.min(1, Math.round((Number(t.weight) || 0.8) * 100) / 100))
    };
  }).filter(t => !isNaN(t.tag_id)) : [];

  const authUser = getAuthenticatedUser(req);

  const newJob = db.createJob({
    title: title.trim(),
    company_name: company_name.trim(),
    experience_years_requirement: Number(experience_years_requirement) || 0,
    min_salary: Number(min_salary) || 50000,
    max_salary: Number(max_salary) || 80000,
    work_style: work_style || 'hybrid',
    employment_type: employment_type || 'full-time',
    application_deadline: application_deadline || undefined,
    location: location || 'Bangkok, Thailand',
    description: description || `ตำแหน่ง ${title.trim()} ที่ ${company_name.trim()}`,
    contact_email: contact_email || (authUser && authUser.email) || 'recruiter@example.com',
    contact_phone: contact_phone || '+66 2 123 4567'
  }, parsedTags);

  if (authUser && authUser.role === 'recruiter') {
    authUser.job_id = newJob.job_id;
    authUser.company_name = newJob.company_name;
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: 'สร้างประกาศงานสำเร็จ (Status 201 Created)',
    data: newJob
  });
}

module.exports = {
  getCandidateTags,
  updateCandidateTags,
  saveSeekerProfile,
  getSeekerProfile,
  updateSeekerWeights,
  getSeekerWeights,
  createJob
};
