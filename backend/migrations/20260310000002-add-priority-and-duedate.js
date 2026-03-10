'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a new column 'priority' to the todos table
    await queryInterface.addColumn('Todos', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high'),
      allowNull: true,
      defaultValue: 'medium',
      after: 'completed'
    });

    // Add a new column 'dueDate'
    await queryInterface.addColumn('Todos', 'dueDate', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'priority'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns if we rollback
    await queryInterface.removeColumn('Todos', 'priority');
    await queryInterface.removeColumn('Todos', 'dueDate');
  }
};
