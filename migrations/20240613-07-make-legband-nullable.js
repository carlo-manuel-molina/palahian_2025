'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('chickens', 'legbandNo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('chickens', 'legbandNo', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
}; 