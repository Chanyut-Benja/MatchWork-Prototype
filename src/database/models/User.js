const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../sequelize');

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: 'candidate'
  },
  candidate_id: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  job_id: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  company_name: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notification_preferences: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_method: {
    type: DataTypes.STRING(32),
    defaultValue: 'authenticator'
  },
  language: {
    type: DataTypes.STRING(16),
    defaultValue: 'th'
  },
  theme_preference: {
    type: DataTypes.STRING(16),
    defaultValue: 'light'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !isBcryptHash(user.password)) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && !isBcryptHash(user.password)) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.validatePassword = function (plainPassword) {
  if (!plainPassword || !this.password) return false;
  return bcrypt.compareSync(plainPassword, this.password);
};

module.exports = User;
