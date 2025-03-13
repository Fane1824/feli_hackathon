const Community = require('./Community');
const Member = require('./Member');
const sequelize = require('../database');

// Set up relationships
Community.hasMany(Member, {
  onDelete: 'CASCADE'
});
Member.belongsTo(Community);

// Sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDatabase();

module.exports = {
  Community,
  Member,
  sequelize
};
