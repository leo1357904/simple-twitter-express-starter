'use strict'; // eslint-disable-line
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
  }, {});
  Tweet.associate = function (models) { // eslint-disable-line
    Tweet.belongsTo(models.User);
  };
  return Tweet;
};
