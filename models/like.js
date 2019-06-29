'use strict'; // eslint-disable-line
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
  	UserId: DataTypes.INTEGER,
  	TweetId: DataTypes.INTEGER,
  }, {});
  Like.associate = function (models) { // eslint-disable-line
  };
  return Like;
};
