/**
 * Auth Controller: Login, Register, Logout, Session & Account Switcher (Personas)
 */
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { generateToken, getAuthenticatedUser } = require('../middlewares/authMiddleware');

/**
 * POST /api/v1/auth/login
 * Supports email + password, Quick Login by role, or persona_id
 */
function login(req, res) {
  const { email, password, role, persona_id } = req.body;

  let targetUser = null;

  // 1. Quick Login by role shortcut (Demo Account Switcher)
  if (role && !email) {
    if (role === 'candidate' || role === 'job_seeker') {
      targetUser = db.users.find(u => u.role === 'candidate');
    } else if (role === 'recruiter') {
      targetUser = db.users.find(u => u.role === 'recruiter');
    } else if (role === 'admin') {
      targetUser = db.users.find(u => u.role === 'admin');
    }
  }

  // 2. Demo Persona Switcher by persona_id
  if (!targetUser && persona_id) {
    targetUser = db.users.find(u => u.candidate_id === persona_id || u.job_id === persona_id);
  }

  // 3. Email + Password login (bcrypt verification)
  if (!targetUser && email) {
    const user = db.findUserByEmail(email);
    if (user && password && user.password) {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        targetUser = user;
      }
    }
  }

  if (!targetUser) {
    return res.status(401).json({
      success: false,
      message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือไม่พบบัญชีผู้ใช้งาน'
    });
  }

  const token = generateToken(targetUser);
  db.createSession(token, targetUser);

  const safeUser = { ...targetUser };
  delete safeUser.password;

  res.json({
    success: true,
    message: `เข้าสู่ระบบสำเร็จในฐานะ ${safeUser.name}`,
    token,
    user: safeUser
  });
}

/**
 * POST /api/v1/auth/switch
 * Demo Account Switcher: issues a fresh JWT token for the selected persona
 */
function switchAccount(req, res) {
  const { persona_id, role } = req.body || {};
  let targetUser = null;

  if (persona_id) {
    targetUser = db.users.find(u => u.candidate_id === persona_id || u.job_id === persona_id);

    // Fallback if a newly created candidate/job has no user row yet
    if (!targetUser) {
      if (role === 'recruiter' || String(persona_id).startsWith('job_')) {
        const job = db.getJobById(persona_id);
        if (job) {
          targetUser = {
            id: `user_${job.job_id}`,
            email: job.contact_email || `${job.job_id}@matchwork.demo`,
            name: job.company_name || job.title,
            role: 'recruiter',
            job_id: job.job_id,
            company_name: job.company_name,
            title: job.title,
            avatar: job.company_logo
          };
        }
      } else {
        const cand = db.getCandidateById(persona_id);
        if (cand) {
          targetUser = {
            id: `user_${cand.candidate_id}`,
            email: cand.email || `${cand.candidate_id}@matchwork.demo`,
            name: cand.full_name,
            role: 'candidate',
            candidate_id: cand.candidate_id,
            title: cand.title,
            avatar: cand.avatar
          };
        }
      }
    }
  } else if (role) {
    if (role === 'candidate' || role === 'job_seeker') {
      targetUser = db.users.find(u => u.role === 'candidate');
    } else if (role === 'recruiter') {
      targetUser = db.users.find(u => u.role === 'recruiter');
    } else if (role === 'admin') {
      targetUser = db.users.find(u => u.role === 'admin');
    }
  }

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบบัญชีสำหรับสลับใช้งาน'
    });
  }

  const token = generateToken(targetUser);
  db.createSession(token, targetUser);

  const safeUser = { ...targetUser };
  delete safeUser.password;

  return res.json({
    success: true,
    message: `สลับบัญชีเป็น ${safeUser.name} เรียบร้อยแล้ว`,
    token,
    user: safeUser
  });
}

/**
 * POST /api/v1/auth/register
 * Register a new user (Candidate or Recruiter)
 */
function register(req, res) {
  const { name, email, password, role, title, work_style, expected_salary, company_name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกชื่อ-นามสกุล อีเมล และรหัสผ่านให้ครบถ้วน'
    });
  }

  if (db.findUserByEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบ'
    });
  }

  const selectedRole = role === 'recruiter' ? 'recruiter' : 'candidate';
  let candidate_id = null;
  let job_id = null;

  if (selectedRole === 'candidate') {
    // Create the candidate_profile row (persisted to MySQL when connected).
    // The seeker completes the rest via POST /api/v1/seekers/profile right after signup.
    const { profile } = db.saveCandidateProfile(`cand_${Date.now()}`, {
      full_name: name,
      email,
      title: title || 'Job Seeker',
      experience_years: 0,
      location: 'Bangkok, Thailand',
      expected_salary: Number(expected_salary) || 0,
      work_style: work_style || 'hybrid',
      bio: ''
    });
    candidate_id = profile.candidate_id;
  } else if (selectedRole === 'recruiter') {
    // Starter job posting so the recruiter has a feed straight away; they can post real jobs after.
    const starterJob = db.createJob({
      company_name: company_name || name,
      company_logo: db.makeInitialsAvatar(company_name || name),
      title: title || 'Software Engineer',
      experience_years_requirement: 2,
      min_salary: 50000,
      max_salary: 80000,
      location: 'Bangkok, Thailand',
      work_style: work_style || 'hybrid',
      description: 'กำลังมองหาเพื่อนร่วมทีมไฟแรง',
      contact_email: email
    }, [
      { tag_id: 1, weight: 0.9 },
      { tag_id: 2, weight: 0.8 }
    ]);
    job_id = starterJob.job_id;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = db.createUser({
    name,
    email,
    password: hashedPassword,
    role: selectedRole,
    candidate_id,
    job_id,
    company_name: company_name || (selectedRole === 'recruiter' ? 'Tech Innovator' : null),
    title: title || (selectedRole === 'recruiter' ? 'HR Specialist' : 'Developer'),
    avatar: db.makeInitialsAvatar(name)
  });

  const token = generateToken(newUser);
  db.createSession(token, newUser);

  const safeUser = { ...newUser };
  delete safeUser.password;

  res.status(201).json({
    success: true,
    message: 'ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ MatchWork',
    token,
    user: safeUser
  });
}

/**
 * POST /api/v1/auth/logout
 * Clears current session
 */
function logout(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  res.json({
    success: true,
    message: 'ออกจากระบบเรียบร้อยแล้ว'
  });
}

/**
 * GET /api/v1/auth/me
 * Retrieves current authenticated user profile
 */
function getMe(req, res) {
  const user = req.user || getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login.'
    });
  }

  const safeUser = { ...user };
  delete safeUser.password;

  res.json({
    success: true,
    user: safeUser
  });
}

/**
 * GET /api/v1/personas
 * Returns available candidates and jobs for demo persona switching
 */
function getPersonas(req, res) {
  const candidates = db.getAllCandidates();
  const jobs = db.getAllJobs();

  res.json({
    success: true,
    data: {
      candidates: candidates.map(c => ({
        id: c.candidate_id,
        name: c.full_name,
        full_name: c.full_name,
        title: c.title,
        avatar: c.avatar,
        email: c.email,
        phone: c.phone,
        expected_salary: c.expected_salary,
        location: c.location,
        work_style: c.work_style
      })),
      jobs: jobs.map(j => ({
        id: j.job_id,
        title: j.title,
        company: j.company_name,
        company_name: j.company_name,
        logo: j.company_logo,
        company_logo: j.company_logo,
        contact_email: j.contact_email,
        contact_phone: j.contact_phone,
        min_salary: j.min_salary,
        max_salary: j.max_salary,
        salary_range: `฿${(j.min_salary || 0).toLocaleString()} - ฿${(j.max_salary || 0).toLocaleString()}`
      }))
    }
  });
}

module.exports = {
  login,
  switchAccount,
  register,
  logout,
  getMe,
  getPersonas
};
