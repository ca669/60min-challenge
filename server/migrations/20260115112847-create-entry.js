'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      journal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      meditation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      movement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('Entries', ['date', 'username'], {
      unique: true,
      name: 'unique_entry_per_user_date'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Entries');
  }
};