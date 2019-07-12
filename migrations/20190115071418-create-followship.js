'use strict'; //eslint-disable-line
module.exports = {
  up: (queryInterface, Sequelize) => { //eslint-disable-line
    return queryInterface.createTable('Followships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      followerId: {
        unique: false,
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      followingId: {
        unique: false,
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => { //eslint-disable-line
    return queryInterface.dropTable('Followships');
  },
};
