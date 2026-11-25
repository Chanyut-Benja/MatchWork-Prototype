const sequelize = require('../sequelize');
const User = require('./User');
const CandidateProfile = require('./CandidateProfile');
const JobPosting = require('./JobPosting');
const Tag = require('./Tag');
const CandidateTag = require('./CandidateTag');
const JobTag = require('./JobTag');
const Interaction = require('./Interaction');
const Connection = require('./Connection');
const Message = require('./Message');

// Associations
CandidateProfile.hasMany(CandidateTag, { foreignKey: 'candidate_id', sourceKey: 'candidate_id', onDelete: 'CASCADE' });
CandidateTag.belongsTo(CandidateProfile, { foreignKey: 'candidate_id', targetKey: 'candidate_id' });
CandidateTag.belongsTo(Tag, { foreignKey: 'tag_id', targetKey: 'tag_id' });

JobPosting.hasMany(JobTag, { foreignKey: 'job_id', sourceKey: 'job_id', onDelete: 'CASCADE' });
JobTag.belongsTo(JobPosting, { foreignKey: 'job_id', targetKey: 'job_id' });
JobTag.belongsTo(Tag, { foreignKey: 'tag_id', targetKey: 'tag_id' });

Connection.hasMany(Message, { foreignKey: 'connectionId', sourceKey: 'match_id', constraints: false, onDelete: 'CASCADE' });
Message.belongsTo(Connection, { foreignKey: 'connectionId', targetKey: 'match_id', constraints: false });

User.hasMany(Message, { foreignKey: 'senderId', sourceKey: 'id', constraints: false, onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', targetKey: 'id', constraints: false, as: 'sender' });

module.exports = {
  sequelize,
  User,
  CandidateProfile,
  JobPosting,
  Tag,
  CandidateTag,
  JobTag,
  Interaction,
  Connection,
  Message
};
