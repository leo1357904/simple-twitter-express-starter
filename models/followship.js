'use strict'; // eslint-disable-line
module.exports = (sequelize, DataTypes) => {
  const Followship = sequelize.define('Followship', {
    FollowerId: DataTypes.INTEGER,
    FollowingId: DataTypes.INTEGER,
  }, {});
  Followship.associate = function (models) { // eslint-disable-line
  };
  return Followship;
};
