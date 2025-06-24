'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields
    await queryInterface.addColumn('chickens', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'sire', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('chickens', 'dam', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Remove bloodlineComposition field
    await queryInterface.removeColumn('chickens', 'bloodlineComposition');

    // Update breederType to be more specific
    await queryInterface.changeColumn('chickens', 'breederType', {
      type: Sequelize.ENUM('breeder', 'fighter'),
      allowNull: true,
    });

    // Make band numbers optional
    await queryInterface.changeColumn('chickens', 'legbandNo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('chickens', 'wingbandNo', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Make other fields optional
    await queryInterface.changeColumn('chickens', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'alive',
    });
    await queryInterface.changeColumn('chickens', 'bloodline', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Unknown',
    });

    // Add bloodlineId field if it doesn't exist
    const tableDescription = await queryInterface.describeTable('chickens');
    if (!tableDescription.bloodlineId) {
      await queryInterface.addColumn('chickens', 'bloodlineId', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'bloodlines', key: 'bloodlineId' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new fields
    await queryInterface.removeColumn('chickens', 'name');
    await queryInterface.removeColumn('chickens', 'sire');
    await queryInterface.removeColumn('chickens', 'dam');

    // Add back bloodlineComposition
    await queryInterface.addColumn('chickens', 'bloodlineComposition', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });

    // Revert breederType
    await queryInterface.changeColumn('chickens', 'breederType', {
      type: Sequelize.ENUM('fighter', 'broodcock', 'broodhen'),
      allowNull: true,
    });

    // Revert band numbers to required
    await queryInterface.changeColumn('chickens', 'legbandNo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'n/a',
    });
    await queryInterface.changeColumn('chickens', 'wingbandNo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'n/a',
    });

    // Revert other fields to required
    await queryInterface.changeColumn('chickens', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'alive',
    });
    await queryInterface.changeColumn('chickens', 'bloodline', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    });

    // Remove bloodlineId if it exists
    const tableDescription = await queryInterface.describeTable('chickens');
    if (tableDescription.bloodlineId) {
      await queryInterface.removeColumn('chickens', 'bloodlineId');
    }
  }
}; 