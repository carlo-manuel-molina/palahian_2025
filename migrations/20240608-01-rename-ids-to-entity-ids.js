// Migration: Rename all primary key columns to entity-specific names

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Drop foreign keys
    await queryInterface.removeConstraint('chickens', 'chickens_bloodlineId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_farmId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_fatherId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_motherId_foreign_idx');
    await queryInterface.removeConstraint('farms', 'farms_ibfk_1');
    await queryInterface.removeConstraint('bloodlines', 'bloodlines_ibfk_1');

    // 2. Rename columns
    await queryInterface.renameColumn('users', 'id', 'userId');
    await queryInterface.renameColumn('farms', 'id', 'farmId');
    await queryInterface.renameColumn('bloodlines', 'id', 'bloodlineId');
    await queryInterface.renameColumn('chickens', 'id', 'chickenId');

    // 3. Recreate foreign keys with new column names
    await queryInterface.addConstraint('farms', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'farms_ibfk_1',
      references: {
        table: 'users',
        field: 'userId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('bloodlines', {
      fields: ['farmId'],
      type: 'foreign key',
      name: 'bloodlines_ibfk_1',
      references: {
        table: 'farms',
        field: 'farmId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['bloodlineId'],
      type: 'foreign key',
      name: 'chickens_bloodlineId_foreign_idx',
      references: {
        table: 'bloodlines',
        field: 'bloodlineId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['farmId'],
      type: 'foreign key',
      name: 'chickens_farmId_foreign_idx',
      references: {
        table: 'farms',
        field: 'farmId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['fatherId'],
      type: 'foreign key',
      name: 'chickens_fatherId_foreign_idx',
      references: {
        table: 'chickens',
        field: 'chickenId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['motherId'],
      type: 'foreign key',
      name: 'chickens_motherId_foreign_idx',
      references: {
        table: 'chickens',
        field: 'chickenId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop new constraints
    await queryInterface.removeConstraint('chickens', 'chickens_bloodlineId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_farmId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_fatherId_foreign_idx');
    await queryInterface.removeConstraint('chickens', 'chickens_motherId_foreign_idx');
    await queryInterface.removeConstraint('farms', 'farms_ibfk_1');
    await queryInterface.removeConstraint('bloodlines', 'bloodlines_ibfk_1');

    // Rename columns back
    await queryInterface.renameColumn('users', 'userId', 'id');
    await queryInterface.renameColumn('farms', 'farmId', 'id');
    await queryInterface.renameColumn('bloodlines', 'bloodlineId', 'id');
    await queryInterface.renameColumn('chickens', 'chickenId', 'id');

    // Recreate original constraints
    await queryInterface.addConstraint('farms', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'farms_ibfk_1',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('bloodlines', {
      fields: ['farmId'],
      type: 'foreign key',
      name: 'bloodlines_ibfk_1',
      references: {
        table: 'farms',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['bloodlineId'],
      type: 'foreign key',
      name: 'chickens_bloodlineId_foreign_idx',
      references: {
        table: 'bloodlines',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['farmId'],
      type: 'foreign key',
      name: 'chickens_farmId_foreign_idx',
      references: {
        table: 'farms',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['fatherId'],
      type: 'foreign key',
      name: 'chickens_fatherId_foreign_idx',
      references: {
        table: 'chickens',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('chickens', {
      fields: ['motherId'],
      type: 'foreign key',
      name: 'chickens_motherId_foreign_idx',
      references: {
        table: 'chickens',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
}; 