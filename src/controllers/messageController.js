/**
 * Message Controller: Real-time Chat History API
 */
const db = require('../database/db');

/**
 * GET /api/messages/:connectionId (and /api/v1/messages/:connectionId)
 * Returns chronological message history for a given connectionId (match_id).
 */
async function getMessagesByConnection(req, res) {
  try {
    const { connectionId } = req.params;
    const cleanId = connectionId ? connectionId.trim() : '';
    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: 'connectionId parameter is required'
      });
    }

    const user = req.user;
    const isAdmin = (user?.role || '').toLowerCase() === 'admin';
    const isParticipant =
      (user?.candidate_id && cleanId.startsWith(`${user.candidate_id}_`)) ||
      (user?.job_id && cleanId.endsWith(`_${user.job_id}`));

    if (!isAdmin && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to this conversation'
      });
    }

    const messages = await db.getMessagesByConnectionId(cleanId);
    return res.json({
      success: true,
      connectionId: cleanId,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load chat history'
    });
  }
}

module.exports = {
  getMessagesByConnection
};
