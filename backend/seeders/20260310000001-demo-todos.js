'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Todos', [
      {
        title: 'Learn Sequelize Migrations',
        description: 'Understand how database version control works with Sequelize',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Create Database Dump',
        description: 'Learn how to backup MySQL databases',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Practice Migration Rollback',
        description: 'Understand how to undo migrations safely',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Todos', null, {});
  }
};
