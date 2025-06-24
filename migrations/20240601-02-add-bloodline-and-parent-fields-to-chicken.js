'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chickens', 'bloodlineId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'bloodlines', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('chickens', 'farmId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'farms', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('chickens', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'alive',
    });
    await queryInterface.addColumn('chickens', 'fatherId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'chickens', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('chickens', 'motherId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'chickens', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chickens', 'bloodlineId');
    await queryInterface.removeColumn('chickens', 'farmId');
    await queryInterface.removeColumn('chickens', 'status');
    await queryInterface.removeColumn('chickens', 'fatherId');
    await queryInterface.removeColumn('chickens', 'motherId');
  }
}; 