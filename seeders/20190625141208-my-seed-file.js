'use strict';

const bcrypt = require('bcrypt-nodejs');
const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 1,
      name: 'root',
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 0,
      name: 'user1',
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 0,
      name: 'user2',
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      email: 'admin@example.com',
      password: bcrypt.hashSync('0000', bcrypt.genSaltSync(10), null),
      role: 1,
      name: 'admin',
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      email: 'user@example.com',
      password: bcrypt.hashSync('0000', bcrypt.genSaltSync(10), null),
      role: 0,
      name: 'user',
      avatar: 'https://i.imgur.com/Uzs2ty3.jpg',
      introduction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});

    return queryInterface.bulkInsert(
      'Tweets',
      Array
        .from({ length: 50 })
        .map(d => ({ //eslint-disable-line
          UserId: Math.floor(Math.random() * 5) + 1,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      {},
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    queryInterface.bulkDelete('Users', null, {});
    return queryInterface.bulkDelete('Tweets', null, {});
  }
};
