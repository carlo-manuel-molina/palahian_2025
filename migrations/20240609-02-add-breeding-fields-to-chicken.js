'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chickens', 'breederId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'userId' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('chickens', 'legbandNo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'n/a',
    });
    await queryInterface.addColumn('chickens', 'wingbandNo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'n/a',
    });
    await queryInterface.addColumn('chickens', 'bloodline', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });
    await queryInterface.addColumn('chickens', 'bloodlineComposition', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });
    await queryInterface.addColumn('chickens', 'pictures', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'fightRecord', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'fightVideos', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'forSale', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('chickens', 'price', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'gender', {
      type: Sequelize.ENUM('rooster', 'hen'),
      allowNull: false,
      defaultValue: 'rooster',
    });
    await queryInterface.addColumn('chickens', 'hatchDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'breederType', {
      type: Sequelize.ENUM('fighter', 'broodcock', 'broodhen'),
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'isBreeder', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chickens', 'breederId');
    await queryInterface.removeColumn('chickens', 'legbandNo');
    await queryInterface.removeColumn('chickens', 'wingbandNo');
    await queryInterface.removeColumn('chickens', 'bloodline');
    await queryInterface.removeColumn('chickens', 'bloodlineComposition');
    await queryInterface.removeColumn('chickens', 'pictures');
    await queryInterface.removeColumn('chickens', 'description');
    await queryInterface.removeColumn('chickens', 'fightRecord');
    await queryInterface.removeColumn('chickens', 'fightVideos');
    await queryInterface.removeColumn('chickens', 'forSale');
    await queryInterface.removeColumn('chickens', 'price');
    await queryInterface.removeColumn('chickens', 'gender');
    await queryInterface.removeColumn('chickens', 'hatchDate');
    await queryInterface.removeColumn('chickens', 'breederType');
    await queryInterface.removeColumn('chickens', 'isBreeder');
  }
}; 