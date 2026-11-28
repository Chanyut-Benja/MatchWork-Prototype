/**
 * Settings Controller: Account Preferences, Notifications, Security (Password, 2FA, Devices), Appearance
 */
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { getAuthenticatedUser } = require('../middlewares/authMiddleware');

const DEFAULT_NOTIFICATION_PREFS = {
  channels: {
    email: true,
    push: true,
    in_app: true,
  },
  events: {
    new_matching_job: true,
    new_match: true,
    hr_reply: true,
  },
};

function parseJsonSafe(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function ensureUserDevices(userId) {
  if (!db.userDevices.has(userId)) {
    db.userDevices.set(userId, [
      {
        id: `dev_current_${userId}`,
        name: 'Chrome on Windows 11',
        type: 'desktop',
        location: 'Bangkok, Thailand',
        ip: '192.168.1.42',
        last_active: 'ใช้งานอยู่ตอนนี้',
        is_current: true,
      },
      {
        id: `dev_mobile_${userId}`,
        name: 'MatchWork App on iPhone 15',
        type: 'mobile',
        location: 'Bangkok, Thailand',
        ip: '172.20.10.4',
        last_active: '2 ชั่วโมงที่แล้ว',
        is_current: false,
      },
    ]);
  }
  return db.userDevices.get(userId);
}

/**
 * GET /api/v1/settings/account
 */
function getAccountSettings(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = db.findUserById(authUser.id) || authUser;
  const notificationPreferences = parseJsonSafe(
    user.notification_preferences,
    DEFAULT_NOTIFICATION_PREFS
  );
  const devices = ensureUserDevices(user.id);

  return res.json({
    success: true,
    data: {
      notification_preferences: notificationPreferences,
      two_factor_enabled: Boolean(user.two_factor_enabled),
      two_factor_method: user.two_factor_method || 'authenticator',
      language: user.language || 'th',
      theme_preference: user.theme_preference || 'light',
      devices,
    },
  });
}

/**
 * PUT /api/v1/settings/notifications
 */
function updateNotificationPreferences(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const body = req.body || {};
  const channels = {
    email: Boolean(body.channels?.email),
    push: Boolean(body.channels?.push),
    in_app: Boolean(body.channels?.in_app),
  };
  const events = {
    new_matching_job: Boolean(body.events?.new_matching_job),
    new_match: Boolean(body.events?.new_match),
    hr_reply: Boolean(body.events?.hr_reply),
  };

  const prefs = { channels, events };
  db.updateUser(authUser.id, {
    notification_preferences: JSON.stringify(prefs),
  });

  return res.json({
    success: true,
    message: 'บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว',
    data: { notification_preferences: prefs },
  });
}

/**
 * PUT /api/v1/settings/appearance
 */
function updateAppearanceSettings(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const body = req.body || {};
  const language = body.language === 'en' ? 'en' : 'th';
  const theme_preference = body.theme_preference === 'dark' ? 'dark' : 'light';

  db.updateUser(authUser.id, { language, theme_preference });

  return res.json({
    success: true,
    message: 'บันทึกการตั้งค่าการแสดงผลและภาษาเรียบร้อยแล้ว',
    data: { language, theme_preference },
  });
}

/**
 * POST /api/v1/settings/security/password
 */
function changePassword(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = db.findUserById(authUser.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้งาน' });
  }

  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ให้ครบถ้วน',
    });
  }

  if (String(new_password).length < 6) {
    return res.status(400).json({
      success: false,
      message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
    });
  }

  const isValid = user.password && bcrypt.compareSync(current_password, user.password);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    });
  }

  const hashedPassword = bcrypt.hashSync(new_password, 10);
  db.updateUser(user.id, { password: hashedPassword });

  return res.json({
    success: true,
    message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
  });
}

/**
 * PUT /api/v1/settings/security/2fa
 */
function updateTwoFactor(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { enabled, method } = req.body || {};
  const two_factor_enabled = Boolean(enabled);
  const two_factor_method = ['authenticator', 'sms', 'email'].includes(method)
    ? method
    : 'authenticator';

  db.updateUser(authUser.id, {
    two_factor_enabled,
    two_factor_method,
  });

  return res.json({
    success: true,
    message: two_factor_enabled
      ? 'เปิดใช้งานการยืนยันตัวตน 2 ชั้น (2FA) เรียบร้อยแล้ว'
      : 'ปิดใช้งานการยืนยันตัวตน 2 ชั้น (2FA) เรียบร้อยแล้ว',
    data: {
      two_factor_enabled,
      two_factor_method,
      setup_code: two_factor_enabled ? 'MW2FA-9K4P-7X2M' : null,
    },
  });
}

/**
 * GET /api/v1/settings/security/devices
 */
function getDevices(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const devices = ensureUserDevices(authUser.id);
  return res.json({ success: true, data: devices });
}

/**
 * DELETE /api/v1/settings/security/devices/:deviceId
 */
function revokeDevice(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { deviceId } = req.params;
  const devices = ensureUserDevices(authUser.id);
  const target = devices.find((d) => d.id === deviceId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์ที่ต้องการยกเลิก' });
  }
  if (target.is_current) {
    return res.status(400).json({
      success: false,
      message: 'ไม่สามารถยกเลิกเซสชันของอุปกรณ์ที่กำลังใช้งานอยู่ได้',
    });
  }

  const nextDevices = devices.filter((d) => d.id !== deviceId);
  db.userDevices.set(authUser.id, nextDevices);

  return res.json({
    success: true,
    message: `ออกจากระบบบน ${target.name} เรียบร้อยแล้ว`,
    data: nextDevices,
  });
}

/**
 * DELETE /api/v1/settings/security/devices
 */
function revokeOtherDevices(req, res) {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const devices = ensureUserDevices(authUser.id);
  const nextDevices = devices.filter((d) => d.is_current);
  db.userDevices.set(authUser.id, nextDevices);

  return res.json({
    success: true,
    message: 'ออกจากระบบบนอุปกรณ์อื่นทั้งหมดเรียบร้อยแล้ว',
    data: nextDevices,
  });
}

module.exports = {
  getAccountSettings,
  updateNotificationPreferences,
  updateAppearanceSettings,
  changePassword,
  updateTwoFactor,
  getDevices,
  revokeDevice,
  revokeOtherDevices,
};
