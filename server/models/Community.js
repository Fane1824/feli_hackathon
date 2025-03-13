const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Community = sequelize.define('Community', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  lookingFor: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
});

module.exports = Community;
