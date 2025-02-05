'use strict'; // eslint-disable-line

module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    UserId: DataTypes.INTEGER,
    TweetId: DataTypes.INTEGER,
  }, {});
  Like.associate = function (models) { // eslint-disable-line
    Like.belongsTo(models.User);
    Like.belongsTo(models.Tweet);
  };
  return Like;
};
