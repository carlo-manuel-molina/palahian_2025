'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chickens', 'color', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('chickens', 'legs', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chickens', 'color');
    await queryInterface.removeColumn('chickens', 'legs');
  }
}; 