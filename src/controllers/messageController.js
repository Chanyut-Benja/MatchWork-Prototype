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
    if (!connectionId || !connectionId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'connectionId parameter is required'
      });
    }

    const messages = await db.getMessagesByConnectionId(connectionId.trim());
    return res.json({
      success: true,
      connectionId: connectionId.trim(),
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
