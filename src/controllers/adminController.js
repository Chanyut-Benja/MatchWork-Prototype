/**
 * Admin Controller: Admin Dashboard Stats, Job Moderation, Tags, Logs & System Utilities
 */
const db = require('../database/db');
const { authorizeEndpointAccess } = require('../services/validationService');
const { runAllUnitTests } = require('../tests/unitTests');

/**
 * GET /api/v1/health
 * Health & System Status Endpoint
 */
function getHealth(req, res) {
  const stats = db.getStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: stats.isDbConnected,
      dialect: stats.dbDialect,
      mode: stats.isDbConnected ? 'persistent-database' : 'in-memory-fallback',
      totalUsers: stats.totalUsers
    }
  });
}

/**
 * POST /api/v1/admin/tags
 * Admin adds a new standard tag into central repository
 */
function createAdminTag(req, res) {
  const { tag_name, category, description } = req.body;

  if (!tag_name || typeof tag_name !== 'string' || tag_name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'tag_name is required and must be a non-empty string'
    });
  }

  const trimmedName = tag_name.trim();

  // Check duplicate tag name (case-insensitive)
  const existing = db.tags.find(t => t.tag_name.toLowerCase() === trimmedName.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `แท็ก '${trimmedName}' มีอยู่ในระบบแล้ว (Duplicate Tag)`,
      data: existing
    });
  }

  const finalCategory = (category && typeof category === 'string' && category.trim() !== '')
    ? category.trim()
    : 'technical_skill';

  const newTag = db.createTag(trimmedName, finalCategory, description || '');

  return res.status(201).json({
    success: true,
    message: `เพิ่มแท็กมาตรฐาน '${newTag.tag_name}' สำเร็จ`,
    data: newTag
  });
}

/**
 * GET /api/v1/admin/tags
 * Retrieves all standard tags for Admin Console
 */
function getAdminTags(req, res) {
  const tags = db.getAllTags();
  res.json({
    success: true,
    count: tags.length,
    data: tags
  });
}

/**
 * GET /api/v1/admin/jobs
 * Retrieves all job postings (active and suspended) for Job Moderation
 */
function getAdminJobs(req, res) {
  const jobs = db.getAllJobsAdmin().map(job => ({
    ...job,
    tags: db.getJobTags(job.job_id)
  }));
  res.json({
    success: true,
    count: jobs.length,
    data: jobs
  });
}

/**
 * PATCH /api/v1/admin/jobs/:id/status
 * Updates job posting status ('active' or 'suspended')
 */
function updateJobStatus(req, res) {
  const jobId = req.params.id;
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'status is required in request body (must be "active" or "suspended")'
    });
  }

  const normalizedStatus = status.trim().toLowerCase();
  if (!['active', 'suspended'].includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Allowed values are 'active' or 'suspended'.`
    });
  }

  const updatedJob = db.updateJobStatus(jobId, normalizedStatus);
  if (!updatedJob) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบตำแหน่งงานรหัส ${jobId}`
    });
  }

  return res.status(200).json({
    success: true,
    message: `อัปเดตสถานะประกาศงาน ${jobId} เป็น '${normalizedStatus}' เรียบร้อยแล้ว`,
    data: {
      ...updatedJob,
      tags: db.getJobTags(jobId)
    }
  });
}

/**
 * GET /api/v1/admin/logs
 * View all system interactions and match logs
 */
function getAdminLogs(req, res) {
  const logs = db.getAllInteractions();
  res.json({
    success: true,
    count: logs.length,
    data: logs
  });
}

/**
 * GET /api/v1/admin/stats
 * View system statistics overview + Product Analytics (Top Demanded Tags & Interaction Breakdown)
 */
function getAdminStats(req, res) {
  const baseStats = db.getStats();

  // 1. Top 5 Demanded Tags across all job postings
  const jobs = db.getAllJobsAdmin();
  const tagDemandMap = new Map();

  for (const job of jobs) {
    const jobTags = db.getJobTags(job.job_id);
    for (const jt of jobTags) {
      const key = jt.tag_id || jt.tag_name;
      const existing = tagDemandMap.get(key) || {
        tag_id: jt.tag_id,
        tag_name: jt.tag_name || `Tag #${jt.tag_id}`,
        category: jt.category || 'technical_skill',
        job_count: 0,
        total_weight: 0
      };
      existing.job_count += 1;
      existing.total_weight += Number(jt.weight || 0.5);
      tagDemandMap.set(key, existing);
    }
  }

  const topDemandedTags = Array.from(tagDemandMap.values())
    .map(item => ({
      tag_id: item.tag_id,
      tag_name: item.tag_name,
      category: item.category,
      job_count: item.job_count,
      avg_weight: Math.round((item.total_weight / item.job_count) * 100) / 100
    }))
    .sort((a, b) => {
      if (b.job_count !== a.job_count) return b.job_count - a.job_count;
      return b.avg_weight - a.avg_weight;
    })
    .slice(0, 5);

  // 2. Interaction Breakdown (Like, Pass, Save, Mutual Match)
  const interactions = db.getAllInteractions();
  let likeCount = 0;
  let passCount = 0;
  let saveCount = 0;

  for (const item of interactions) {
    if (item.action === 'express_interest') likeCount += 1;
    else if (item.action === 'skip') passCount += 1;
    else if (item.action === 'save') saveCount += 1;
  }

  const mutualMatchCount = baseStats.totalMatches || 0;
  const totalDecisions = likeCount + passCount;
  const matchRate = totalDecisions > 0
    ? Math.round((mutualMatchCount / totalDecisions) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      ...baseStats,
      topDemandedTags,
      interactionBreakdown: {
        likeCount,
        passCount,
        saveCount,
        mutualMatchCount,
        matchRate
      }
    }
  });
}

/**
 * GET /api/v1/tags
 * Returns all tags
 */
function getTags(req, res) {
  const auth = authorizeEndpointAccess(req.query.role || 'candidate', 'list_tags');
  if (!auth.authorized) {
    return res.status(auth.code).json({ success: false, message: auth.reason });
  }

  const tags = db.getAllTags();
  res.json({
    success: true,
    count: tags.length,
    data: tags
  });
}

/**
 * Legacy POST /api/v1/tags
 * Kept for backward compatibility
 */
function createLegacyTag(req, res) {
  const { tag_name, category, description } = req.body;
  if (!tag_name) {
    return res.status(400).json({ success: false, message: 'tag_name is required' });
  }
  const tag = db.createTag(tag_name, category || 'technical_skill', description || '');
  res.status(201).json({
    success: true,
    message: 'เพิ่มแท็กมาตรฐานเรียบร้อย',
    data: tag
  });
}

/**
 * POST /api/v1/reset
 * Resets database back to seed values
 */
function resetDatabase(req, res) {
  db.reset();
  res.json({ success: true, message: 'Database reset to initial seed state.' });
}

/**
 * GET /api/v1/test-results
 * Runs the 5 unit/feature test suites and returns live results
 */
function getTestResults(req, res) {
  const results = runAllUnitTests();
  res.json({
    success: true,
    data: results
  });
}

module.exports = {
  getHealth,
  createAdminTag,
  getAdminTags,
  getAdminJobs,
  updateJobStatus,
  getAdminLogs,
  getAdminStats,
  getTags,
  createLegacyTag,
  resetDatabase,
  getTestResults
};
