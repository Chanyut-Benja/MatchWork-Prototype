/**
 * MatchWork Database Layer
 * Supports Relational SQL Databases (MySQL or PostgreSQL via Sequelize)
 * with graceful In-Memory fallback and bcrypt password hashing.
 */
const bcrypt = require('bcryptjs');
const {
  tags,
  candidateProfiles,
  candidateTags,
  jobPostings,
  jobTags,
  initialInteractions
} = require('./schema');

let models = null;
let sequelizeInstance = null;
try {
  models = require('./models');
  sequelizeInstance = models.sequelize;
} catch (e) {
  // Models load fallback
}

const initialUsers = [
  {
    id: 'user_cand_1',
    email: 'kawin.dev@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'กวินทร์ สุขสวัสดิ์ (Kawin Suk)',
    role: 'candidate',
    candidate_id: 'cand_1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Senior Full-Stack Engineer'
  },
  {
    id: 'user_cand_2',
    email: 'nichapa.ux@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'ณิชาภา วิริยะ (Nichapa V.)',
    role: 'candidate',
    candidate_id: 'cand_2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    title: 'Product & UI/UX Designer'
  },
  {
    id: 'user_cand_3',
    email: 'thanaphat.ops@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'ธนภัทร วัฒนกุล (Thanaphat W.)',
    role: 'candidate',
    candidate_id: 'cand_3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'DevOps & Cloud Architect'
  },
  {
    id: 'user_cand_4',
    email: 'ploy.frontend@example.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'พลอยไพลิน เจริญกิจ (Ploypailin C.)',
    role: 'candidate',
    candidate_id: 'cand_4',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    title: 'Frontend React/Next.js Specialist'
  },
  {
    id: 'user_rec_1',
    email: 'recruiter@techscale.io',
    password: bcrypt.hashSync('password123', 10),
    name: 'Tech Innovator HR (Sarah Connor)',
    role: 'recruiter',
    job_id: 'job_101',
    company_name: 'TechScale Innovations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    title: 'Head of Talent Acquisition'
  },
  {
    id: 'user_rec_2',
    email: 'talent@cloudnative.tech',
    password: bcrypt.hashSync('password123', 10),
    name: 'CloudNative Talent (Alex Stone)',
    role: 'recruiter',
    job_id: 'job_102',
    company_name: 'CloudNative Solutions',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    title: 'Tech Recruitment Lead'
  },
  {
    id: 'user_admin_1',
    email: 'admin@matchwork.io',
    password: bcrypt.hashSync('adminpassword', 10),
    name: 'MatchWork System Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    title: 'System Administrator'
  }
];

/**
 * Builds a self-contained SVG avatar with the person's initials,
 * so new accounts never show a broken image.
 */
function makeInitialsAvatar(name = '') {
  const initials = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0]).join('').toUpperCase() || '?';
  const palette = ['#2563EB', '#4F46E5', '#DB2777', '#059669', '#D97706', '#7C3AED'];
  const color = palette[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  const safe = initials.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/><text x="50%" y="54%" font-family="Arial,sans-serif" font-size="80" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${safe}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

class DatabaseStore {
  constructor() {
    this.isDbConnected = false;
    this.dbDialect = process.env.DB_DIALECT || 'mysql';
    this.reset();
  }

  reset() {
    this.tags = JSON.parse(JSON.stringify(tags));
    this.candidateProfiles = JSON.parse(JSON.stringify(candidateProfiles));
    this.candidateTags = JSON.parse(JSON.stringify(candidateTags));
    this.jobPostings = JSON.parse(JSON.stringify(jobPostings));
    this.jobTags = JSON.parse(JSON.stringify(jobTags));
    this.interactions = JSON.parse(JSON.stringify(initialInteractions));
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.sessions = new Map();
    this.connections = new Map();
    this.messages = [];
    this.nextInteractionId = this.interactions.length + 1;
    this.nextTagId = Math.max(...this.tags.map(t => t.tag_id)) + 1;
    this.nextJobIndex = 105;
  }

  /**
   * Initializes real DB connection (MySQL / PostgreSQL) via Sequelize.
   */
  async initDatabase() {
    if (!sequelizeInstance || !models) {
      console.log('ℹ️ Sequelize models not loaded. Operating in In-Memory mode.');
      return false;
    }

    try {
      await sequelizeInstance.authenticate();
      this.isDbConnected = true;
      const dialect = sequelizeInstance.getDialect().toUpperCase();
      console.log(`========================================================`);
      console.log(`✅ [Database Connected] Successfully connected to ${dialect}!`);
      console.log(`   Host: ${sequelizeInstance.config.host}:${sequelizeInstance.config.port}`);
      console.log(`   Database: ${sequelizeInstance.config.database}`);
      console.log(`========================================================`);

      // Ensure tables exist
      await sequelizeInstance.sync({ alter: true });

      // Check if User table has data, seed if empty
      const userCount = await models.User.count();
      if (userCount === 0) {
        console.log(`🌱 Seeding initial records into ${dialect}...`);
        for (const t of tags) await models.Tag.upsert(t);
        for (const cp of candidateProfiles) await models.CandidateProfile.upsert(cp);
        for (const ct of candidateTags) await models.CandidateTag.upsert(ct);
        for (const jp of jobPostings) await models.JobPosting.upsert(jp);
        for (const jt of jobTags) await models.JobTag.upsert(jt);
        for (const it of initialInteractions) await models.Interaction.upsert(it);
        for (const u of initialUsers) await models.User.upsert(u);
        console.log(`✅ Seed data successfully saved in database.`);
      }

      // Load records from DB into memory cache for low-latency queries
      const dbUsers = await models.User.findAll();
      if (dbUsers.length > 0) {
        this.users = dbUsers.map(u => u.toJSON());
      }

      const dbCandidates = await models.CandidateProfile.findAll();
      if (dbCandidates.length > 0) {
        this.candidateProfiles = dbCandidates.map(c => c.toJSON());
      }

      const dbJobs = await models.JobPosting.findAll();
      if (dbJobs.length > 0) {
        this.jobPostings = dbJobs.map(j => j.toJSON());
      }

      const dbTags = await models.Tag.findAll();
      if (dbTags.length > 0) {
        this.tags = dbTags.map(t => t.toJSON());
      }

      const dbCandidateTags = await models.CandidateTag.findAll();
      if (dbCandidateTags.length > 0) {
        this.candidateTags = dbCandidateTags.map(t => ({
          ...t.toJSON(),
          weight: parseFloat(t.weight)
        }));
      }

      const dbJobTags = await models.JobTag.findAll();
      if (dbJobTags.length > 0) {
        this.jobTags = dbJobTags.map(t => ({
          ...t.toJSON(),
          weight: parseFloat(t.weight)
        }));
      }

      const dbInteractions = await models.Interaction.findAll();
      if (dbInteractions.length > 0) {
        this.interactions = dbInteractions.map(i => i.toJSON());
      }

      const dbConnections = await models.Connection.findAll();
      for (const conn of dbConnections) {
        const item = conn.toJSON();
        this.connections.set(`${item.candidate_id}_${item.job_id}`, item);
      }

      if (models.Message) {
        const dbMessages = await models.Message.findAll({
          order: [['createdAt', 'ASC']]
        });
        this.messages = dbMessages.map(m => m.toJSON());
      }

      return true;
    } catch (err) {
      this.isDbConnected = false;
      const dialect = (process.env.DB_DIALECT || 'mysql').toUpperCase();
      const reason = err.parent?.message || err.original?.message || err.message || err;
      console.log(`--------------------------------------------------------`);
      console.warn(`⚠️ [Database Warning] Could not connect to ${dialect} database.`);
      console.warn(`   Reason: ${reason}`);
      console.warn(`👉 Running in In-Memory fallback mode.`);
      console.warn(`   To enable persistent DB, make sure ${dialect} is running`);
      console.warn(`   and verify credentials in the .env file.`);
      console.log(`--------------------------------------------------------`);
      return false;
    }
  }

  // --- Auth / Users ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    let password = userData.password;
    if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      password = bcrypt.hashSync(password, 10);
    }

    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      password
    };
    this.users.push(newUser);

    if (this.isDbConnected && models) {
      models.User.create(newUser).catch(err => {
        console.error('Error persisting user to DB:', err.message);
      });
    }

    return newUser;
  }

  updateUser(id, fields = {}) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, fields);
    // Refresh any cached sessions that hold a copy of this user
    for (const [token, sessUser] of this.sessions) {
      if (sessUser && sessUser.id === id && sessUser !== user) Object.assign(sessUser, fields);
    }
    if (this.isDbConnected && models) {
      models.User.update(fields, { where: { id } })
        .catch(err => console.error('Error updating User in DB:', err.message));
    }
    return user;
  }

  createSession(token, user) {
    this.sessions.set(token, user);
  }

  getUserByToken(token) {
    if (!token) return null;
    return this.sessions.get(token) || null;
  }

  deleteSession(token) {
    if (token) this.sessions.delete(token);
  }

  // --- Candidate queries ---
  getCandidateById(candidateId) {
    return this.candidateProfiles.find(c => c.candidate_id === candidateId);
  }

  getAllCandidates() {
    return this.candidateProfiles;
  }

  getCandidateByEmail(email) {
    if (!email) return null;
    return this.candidateProfiles.find(c => (c.email || '').toLowerCase() === email.toLowerCase());
  }

  /**
   * Create or update a candidate profile (candidate_profile table).
   * Returns { profile, created }.
   */
  saveCandidateProfile(candidateId, data = {}) {
    const editable = ['full_name', 'email', 'phone', 'avatar', 'title', 'experience_years',
      'location', 'expected_salary', 'work_style', 'bio'];
    let profile = candidateId ? this.getCandidateById(candidateId) : null;
    const created = !profile;

    if (created) {
      profile = {
        candidate_id: candidateId || `cand_${Date.now()}`,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        avatar: data.avatar || makeInitialsAvatar(data.full_name),
        title: data.title || 'Job Seeker',
        experience_years: Number(data.experience_years) || 0,
        location: data.location || 'Bangkok, Thailand',
        expected_salary: Number(data.expected_salary) || 0,
        work_style: data.work_style || 'hybrid',
        bio: data.bio || ''
      };
      this.candidateProfiles.push(profile);
    } else {
      editable.forEach(key => {
        if (data[key] === undefined || data[key] === null) return;
        profile[key] = ['experience_years', 'expected_salary'].includes(key) ? Number(data[key]) || 0 : data[key];
      });
    }

    if (this.isDbConnected && models) {
      models.CandidateProfile.upsert(profile)
        .catch(err => console.error('Error saving CandidateProfile to DB:', err.message));
    }

    return { profile, created };
  }

  getInteractions({ role, id } = {}) {
    return this.getAllInteractions().filter(i => {
      if (role === 'candidate' && id) return i.candidate_id === id;
      if (role === 'recruiter' && id) return i.job_id === id;
      return true;
    });
  }

  getCandidateTags(candidateId) {
    return this.candidateTags
      .filter(ct => ct.candidate_id === candidateId)
      .map(ct => {
        const tag = this.tags.find(t => t.tag_id === ct.tag_id);
        return {
          ...ct,
          tag_name: tag ? tag.tag_name : 'Unknown',
          category: tag ? tag.category : 'General'
        };
      });
  }

  updateCandidateTags(candidateId, updatedTags) {
    this.candidateTags = this.candidateTags.filter(ct => ct.candidate_id !== candidateId);
    let nextId = this.candidateTags.length > 0 ? Math.max(...this.candidateTags.map(t => t.id)) + 1 : 1;
    
    const newTags = [];
    updatedTags.forEach(t => {
      const record = {
        id: nextId++,
        candidate_id: candidateId,
        tag_id: Number(t.tag_id),
        weight: Number(t.weight)
      };
      this.candidateTags.push(record);
      newTags.push(record);
    });

    if (this.isDbConnected && models) {
      models.CandidateTag.destroy({ where: { candidate_id: candidateId } })
        .then(() => models.CandidateTag.bulkCreate(newTags))
        .catch(err => console.error('Error syncing CandidateTag to DB:', err.message));
    }

    return this.getCandidateTags(candidateId);
  }

  // --- Job queries ---
  getJobById(jobId) {
    return this.jobPostings.find(j => j.job_id === jobId);
  }

  getAllJobs() {
    return this.jobPostings.filter(j => j.status === 'active');
  }

  getAllJobsAdmin() {
    return this.jobPostings;
  }

  updateJobStatus(jobId, status) {
    const job = this.jobPostings.find(j => j.job_id === jobId);
    if (!job) return null;
    job.status = status;
    job.updated_at = new Date().toISOString();

    if (this.isDbConnected && models) {
      models.JobPosting.update({ status }, { where: { job_id: jobId } })
        .catch(err => console.error('Error updating Job status in DB:', err.message));
    }

    return job;
  }

  getJobTags(jobId) {
    return this.jobTags
      .filter(jt => jt.job_id === jobId)
      .map(jt => {
        const tag = this.tags.find(t => t.tag_id === jt.tag_id);
        return {
          ...jt,
          tag_name: tag ? tag.tag_name : 'Unknown',
          category: tag ? tag.category : 'General'
        };
      });
  }

  createJob(jobData, tagsList = []) {
    const jobId = `job_${this.nextJobIndex++}`;
    const newJob = {
      job_id: jobId,
      company_name: jobData.company_name || 'InnovateTech Co.',
      company_logo: jobData.company_logo || makeInitialsAvatar(jobData.company_name || 'Company'),
      title: jobData.title || 'Software Engineer',
      experience_years_requirement: Number(jobData.experience_years_requirement || 2),
      min_salary: Number(jobData.min_salary || 50000),
      max_salary: Number(jobData.max_salary || 80000),
      location: jobData.location || 'Bangkok',
      work_style: jobData.work_style || 'hybrid',
      description: jobData.description || 'Join our tech forward company.',
      contact_email: jobData.contact_email || 'hr@company.com',
      contact_phone: jobData.contact_phone || '+66 2 123 4567',
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.jobPostings.unshift(newJob);

    let nextJobTagId = this.jobTags.length > 0 ? Math.max(...this.jobTags.map(jt => jt.id)) + 1 : 200;
    const addedTags = [];
    tagsList.forEach(t => {
      const jt = {
        id: nextJobTagId++,
        job_id: jobId,
        tag_id: Number(t.tag_id),
        weight: Number(t.weight)
      };
      this.jobTags.push(jt);
      addedTags.push(jt);
    });

    if (this.isDbConnected && models) {
      models.JobPosting.create(newJob)
        .then(() => {
          if (addedTags.length > 0) return models.JobTag.bulkCreate(addedTags);
        })
        .catch(err => console.error('Error saving Job to DB:', err.message));
    }

    return { ...newJob, tags: this.getJobTags(jobId) };
  }

  // --- Tags queries ---
  getAllTags() {
    return this.tags;
  }

  createTag(tagName, category = 'technical_skill', description = '') {
    const existing = this.tags.find(t => t.tag_name.toLowerCase() === tagName.toLowerCase().trim());
    if (existing) return existing;

    const newTag = {
      tag_id: this.nextTagId++,
      tag_name: tagName.trim(),
      category: (category || 'technical_skill').trim(),
      description: (description || '').trim()
    };
    this.tags.push(newTag);

    if (this.isDbConnected && models) {
      models.Tag.create(newTag).catch(err => console.error('Error saving Tag to DB:', err.message));
    }

    return newTag;
  }

  // --- Interactions queries ---
  findInteraction(candidateId, jobId, initiatorRole) {
    return this.interactions.find(
      i => i.candidate_id === candidateId &&
           i.job_id === jobId &&
           i.initiator_role === initiatorRole
    );
  }

  getInteractionsForPair(candidateId, jobId) {
    return this.interactions.filter(
      i => i.candidate_id === candidateId && i.job_id === jobId
    );
  }

  getAllInteractions() {
    return this.interactions.map(item => {
      const candidate = this.getCandidateById(item.candidate_id);
      const job = this.getJobById(item.job_id);
      return {
        ...item,
        candidate_name: candidate ? candidate.full_name : item.candidate_id,
        job_title: job ? job.title : item.job_id,
        company_name: job ? job.company_name : 'N/A'
      };
    });
  }

  recordInteraction({ candidate_id, job_id, initiator_role, action, candidate_data, job_data }) {
    if (candidate_data && candidate_id) {
      let existingCand = this.getCandidateById(candidate_id);
      if (!existingCand) {
        existingCand = {
          candidate_id,
          full_name: candidate_data.full_name || candidate_data.name || 'Candidate',
          email: candidate_data.email || `${candidate_id}@example.com`,
          phone: candidate_data.phone || '+66 81 234 5678',
          avatar: candidate_data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          title: candidate_data.title || 'Developer',
          experience_years: candidate_data.experience_years || 3,
          location: candidate_data.location || 'Bangkok, Thailand',
          expected_salary: candidate_data.expected_salary || 65000,
          work_style: candidate_data.work_style || 'hybrid',
          bio: candidate_data.bio || ''
        };
        this.candidateProfiles.push(existingCand);
        if (this.isDbConnected && models) {
          models.CandidateProfile.upsert(existingCand).catch(e => {});
        }
      } else {
        if (candidate_data.full_name) existingCand.full_name = candidate_data.full_name;
        if (candidate_data.avatar) existingCand.avatar = candidate_data.avatar;
        if (candidate_data.title) existingCand.title = candidate_data.title;
        if (candidate_data.email) existingCand.email = candidate_data.email;
        if (candidate_data.phone) existingCand.phone = candidate_data.phone;
        if (candidate_data.expected_salary !== undefined && candidate_data.expected_salary !== null) {
          const numSal = Number(candidate_data.expected_salary);
          if (Number.isFinite(numSal) && numSal > 0) existingCand.expected_salary = numSal;
        }
        if (this.isDbConnected && models) {
          models.CandidateProfile.upsert(existingCand).catch(e => {});
        }
      }
    }

    if (job_data && job_id) {
      let existingJob = this.getJobById(job_id);
      if (!existingJob) {
        existingJob = {
          job_id,
          company_name: job_data.company_name || 'Tech Company',
          company_logo: job_data.company_logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
          title: job_data.title || 'Job Posting',
          experience_years_requirement: job_data.experience_requirement || 2,
          min_salary: job_data.min_salary || 60000,
          max_salary: job_data.max_salary || 90000,
          location: job_data.location || 'Bangkok',
          work_style: job_data.work_style || 'hybrid',
          description: job_data.description || '',
          contact_email: job_data.contact_email || 'hr@company.com',
          contact_phone: job_data.contact_phone || '+66 2 987 6543',
          status: 'active'
        };
        this.jobPostings.push(existingJob);
        if (this.isDbConnected && models) {
          models.JobPosting.upsert(existingJob).catch(e => {});
        }
      } else {
        if (job_data.company_name) existingJob.company_name = job_data.company_name;
        if (job_data.company_logo) existingJob.company_logo = job_data.company_logo;
        if (job_data.title) existingJob.title = job_data.title;
        if (job_data.contact_email) existingJob.contact_email = job_data.contact_email;
        if (job_data.contact_phone) existingJob.contact_phone = job_data.contact_phone;
        if (this.isDbConnected && models) {
          models.JobPosting.upsert(existingJob).catch(e => {});
        }
      }
    }

    let existing = this.findInteraction(candidate_id, job_id, initiator_role);
    if (existing) {
      existing.action = action;
      if (candidate_data) existing.candidate_data = candidate_data;
      if (job_data) existing.job_data = job_data;
      existing.updated_at = new Date().toISOString();

      if (this.isDbConnected && models) {
        models.Interaction.upsert(existing).catch(e => {});
      }
      return existing;
    }

    const newInteraction = {
      interaction_id: this.nextInteractionId++,
      candidate_id,
      job_id,
      initiator_role,
      action,
      candidate_data,
      job_data,
      is_matched: false,
      created_at: new Date().toISOString()
    };
    this.interactions.push(newInteraction);

    if (this.isDbConnected && models) {
      models.Interaction.upsert(newInteraction).catch(e => {});
    }

    return newInteraction;
  }

  markMatch(candidateId, jobId, meta = {}) {
    this.interactions
      .filter(i => i.candidate_id === candidateId && i.job_id === jobId)
      .forEach(i => {
        i.is_matched = true;
        if (meta.candidate_data) i.candidate_data = meta.candidate_data;
        if (meta.job_data) i.job_data = meta.job_data;

        if (this.isDbConnected && models) {
          models.Interaction.upsert(i).catch(e => {});
        }
      });
  }

  clearInteractionsForPersona(role, id) {
    if (role === 'candidate') {
      const candidateId = id || 'cand_1';
      this.interactions = this.interactions.filter(i => !(i.candidate_id === candidateId && i.initiator_role === 'candidate'));
      this.interactions.filter(i => i.candidate_id === candidateId).forEach(i => { i.is_matched = false; });
    } else if (role === 'recruiter') {
      const jobId = id || 'job_101';
      this.interactions = this.interactions.filter(i => !(i.job_id === jobId && i.initiator_role === 'recruiter'));
      this.interactions.filter(i => i.job_id === jobId).forEach(i => { i.is_matched = false; });
    }
  }

  removeInteraction(candidateId, jobId, initiatorRole = null) {
    const beforeCount = this.interactions.length;
    this.interactions = this.interactions.filter(i => {
      const match = i.candidate_id === candidateId && i.job_id === jobId && (!initiatorRole || i.initiator_role === initiatorRole);
      return !match;
    });
    if (this.isDbConnected && models) {
      const where = { candidate_id: candidateId, job_id: jobId };
      if (initiatorRole) where.initiator_role = initiatorRole;
      models.Interaction.destroy({ where }).catch(e => {});
    }
    return this.interactions.length < beforeCount;
  }

  // --- Matches & Connection Methods ---
  isPairMatched(candidateId, jobId) {
    return this.interactions.some(i => i.candidate_id === candidateId && i.job_id === jobId && i.is_matched);
  }

  findUnmatchedPair(prefCandidateId, prefJobId) {
    if (prefCandidateId && prefJobId && !this.isPairMatched(prefCandidateId, prefJobId)) {
      return { candidate_id: prefCandidateId, job_id: prefJobId };
    }

    const naturalPairs = [
      { candidate_id: 'cand_1', job_id: 'job_101' },
      { candidate_id: 'cand_2', job_id: 'job_103' },
      { candidate_id: 'cand_3', job_id: 'job_102' },
      { candidate_id: 'cand_4', job_id: 'job_104' },
      { candidate_id: 'cand_1', job_id: 'job_104' },
      { candidate_id: 'cand_2', job_id: 'job_101' },
      { candidate_id: 'cand_4', job_id: 'job_101' }
    ];

    for (const pair of naturalPairs) {
      if (!this.isPairMatched(pair.candidate_id, pair.job_id)) {
        return pair;
      }
    }

    for (const c of this.candidateProfiles) {
      for (const j of this.jobPostings) {
        if (!this.isPairMatched(c.candidate_id, j.job_id)) {
          return { candidate_id: c.candidate_id, job_id: j.job_id };
        }
      }
    }
    return null;
  }

  connectMatch(candidateId, jobId, meta = {}) {
    const key = `${candidateId}_${jobId}`;
    const cleanCandId = candidateId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanJobId = jobId.replace(/[^a-zA-Z0-9]/g, '');
    const roomCode = `${cleanCandId}-${cleanJobId}`;

    const connectionData = {
      match_id: key,
      candidate_id: candidateId,
      job_id: jobId,
      is_connected: true,
      status: 'Connected',
      connected_at: new Date().toISOString(),
      interview_channel: meta.interview_channel || 'Google Meet',
      interview_link: meta.interview_link || `https://meet.google.com/mw-${roomCode}`,
      notes: meta.notes || 'นัดหมายสัมภาษณ์เสร็จสมบูรณ์'
    };

    this.connections.set(key, connectionData);

    if (this.isDbConnected && models) {
      models.Connection.upsert(connectionData).catch(err => {
        console.error('Error saving Connection to DB:', err.message);
      });
    }

    return connectionData;
  }

  getConnection(candidateId, jobId) {
    const key = `${candidateId}_${jobId}`;
    return this.connections.get(key) || null;
  }

  isMatchConnected(candidateId, jobId) {
    const key = `${candidateId}_${jobId}`;
    return this.connections.has(key);
  }

  // --- Real-time Chat Messages ---
  _formatMessage(msg) {
    const sender = this.findUserById(msg.senderId);
    return {
      id: msg.id,
      connectionId: msg.connectionId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
      senderName: sender ? sender.name : msg.senderId,
      senderAvatar: sender ? sender.avatar : null,
      senderRole: sender ? sender.role : null
    };
  }

  async createMessage({ connectionId, senderId, content }) {
    const cleanContent = typeof content === 'string' ? content.trim() : '';
    if (!connectionId || !senderId || !cleanContent) {
      throw new Error('connectionId, senderId, and content are required');
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      connectionId: String(connectionId),
      senderId: String(senderId),
      content: cleanContent,
      createdAt: new Date().toISOString()
    };

    this.messages.push(newMessage);

    if (this.isDbConnected && models && models.Message) {
      try {
        await models.Message.create(newMessage);
      } catch (err) {
        console.error('Error persisting Message to DB:', err.message);
      }
    }

    return this._formatMessage(newMessage);
  }

  async getMessagesByConnectionId(connectionId) {
    const targetId = String(connectionId);
    if (this.isDbConnected && models && models.Message) {
      try {
        const rows = await models.Message.findAll({
          where: { connectionId: targetId },
          order: [['createdAt', 'ASC']]
        });
        return rows.map(row => this._formatMessage(row.toJSON()));
      } catch (err) {
        console.error('Error reading Messages from DB:', err.message);
      }
    }

    return this.messages
      .filter(m => m.connectionId === targetId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(m => this._formatMessage(m));
  }

  getMatchedPairs(filterRole = null, filterId = null) {
    const matchesMap = new Map();

    for (const item of this.interactions) {
      if (item.is_matched) {
        if (filterRole === 'candidate' && filterId && item.candidate_id !== filterId) continue;
        if (filterRole === 'recruiter' && filterId && item.job_id !== filterId) continue;

        const key = `${item.candidate_id}_${item.job_id}`;
        if (!matchesMap.has(key)) {
          matchesMap.set(key, {
            candidate_id: item.candidate_id,
            job_id: item.job_id,
            matched_at: item.created_at,
            candidate_data: item.candidate_data,
            job_data: item.job_data
          });
        }
      }
    }

    return Array.from(matchesMap.values()).map(m => {
      const candidate = this.getCandidateById(m.candidate_id);
      const job = this.getJobById(m.job_id);
      const candidateTags = this.getCandidateTags(m.candidate_id);
      const jobTags = this.getJobTags(m.job_id);

      const candidateName = (candidate && candidate.full_name) || m.candidate_data?.full_name || m.candidate_data?.name || 'N/A';
      const candidateAvatar = (candidate && candidate.avatar) || m.candidate_data?.avatar || '';
      const candidateTitle = (candidate && candidate.title) || m.candidate_data?.title || 'N/A';
      const candidateEmail = (candidate && candidate.email) || m.candidate_data?.email || 'N/A';
      const candidatePhone = (candidate && candidate.phone) || m.candidate_data?.phone || 'N/A';
      const candidateExpectedSalary = (candidate && candidate.expected_salary)
        ? `฿${Number(candidate.expected_salary).toLocaleString()} / เดือน`
        : (m.candidate_data?.expected_salary ? (typeof m.candidate_data.expected_salary === 'number' ? `฿${m.candidate_data.expected_salary.toLocaleString()} / เดือน` : m.candidate_data.expected_salary) : 'ตามตกลง');

      const companyName = m.job_data?.company_name || (job ? job.company_name : 'N/A');
      const companyLogo = m.job_data?.company_logo || (job ? job.company_logo : '');
      const jobTitle = m.job_data?.title || (job ? job.title : 'N/A');
      const contactEmail = m.job_data?.contact_email || (job ? job.contact_email : 'N/A');
      const contactPhone = m.job_data?.contact_phone || (job ? job.contact_phone : 'N/A');
      const location = m.job_data?.location || (job ? job.location : 'Bangkok');
      const salaryRange = m.job_data?.salary_range || (job ? `฿${job.min_salary.toLocaleString()} - ฿${job.max_salary.toLocaleString()}` : 'N/A');

      let matchPercentage = 92;
      try {
        const { calculateMatchingScore } = require('../services/matchingService');
        const matchData = calculateMatchingScore(candidateTags, jobTags, {
          candidate_work_style: candidate ? candidate.work_style : 'hybrid',
          job_work_style: job ? job.work_style : 'hybrid',
          candidate_exp: candidate ? candidate.experience_years : 3,
          job_exp_req: job ? job.experience_years_requirement : 3
        });
        matchPercentage = matchData.score;
      } catch (e) {
        // Fallback default
      }

      const connection = this.getConnection(m.candidate_id, m.job_id);
      const isConnected = !!connection;

      const cleanCandId = m.candidate_id.replace(/[^a-zA-Z0-9]/g, '');
      const cleanJobId = m.job_id.replace(/[^a-zA-Z0-9]/g, '');

      return {
        match_id: `${m.candidate_id}_${m.job_id}`,
        candidate_id: m.candidate_id,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone,
        candidate_title: candidateTitle,
        candidate_avatar: candidateAvatar,
        candidate_expected_salary: candidateExpectedSalary,
        candidate_tags: candidateTags.length > 0 ? candidateTags.map(t => t.tag_name) : (m.candidate_data?.tags || ['JavaScript']),
        primary_skills: candidateTags.length > 0 ? candidateTags.map(t => t.tag_name).slice(0, 5) : (m.candidate_data?.tags || ['JavaScript']),
        job_id: m.job_id,
        job_title: jobTitle,
        company_name: companyName,
        company_logo: companyLogo,
        job_tags: jobTags.length > 0 ? jobTags.map(t => t.tag_name) : (m.job_data?.tags || ['Full-Stack']),
        contact_email: contactEmail,
        contact_phone: contactPhone,
        location: location,
        salary_range: salaryRange,
        matched_at: m.matched_at,
        match_percentage: matchPercentage,
        compatibility_score: matchPercentage,
        is_connected: isConnected,
        status: isConnected ? 'Connected' : 'Matched',
        connected_at: connection ? connection.connected_at : null,
        interview_channel: connection ? connection.interview_channel : 'Google Meet',
        interview_link: connection ? connection.interview_link : `https://meet.google.com/mw-${cleanCandId}-${cleanJobId}`
      };
    });
  }

  getStats() {
    return {
      totalCandidates: this.candidateProfiles.length,
      totalJobs: this.jobPostings.length,
      totalTags: this.tags.length,
      totalInteractions: this.interactions.length,
      totalMatches: this.getMatchedPairs().length,
      totalUsers: this.users.length,
      isDbConnected: this.isDbConnected,
      dbDialect: this.dbDialect
    };
  }
}

const db = new DatabaseStore();
db.makeInitialsAvatar = makeInitialsAvatar;
module.exports = db;
