module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper to drop FK if exists
    async function dropConstraintIfExists(table, constraint) {
      const [results] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = '${table}' AND CONSTRAINT_NAME = '${constraint}' LIMIT 1`
      );
      if (results.length > 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${table} DROP FOREIGN KEY ${constraint};`
        );
      }
    }

    // 1. Drop the foreign key constraints if they exist
    await dropConstraintIfExists('chickens', 'chickens_motherId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_fatherId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_bloodlineId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_farmId_foreign_idx');
    await dropConstraintIfExists('farms', 'farms_ibfk_1');
    await dropConstraintIfExists('bloodlines', 'bloodlines_ibfk_1');

    // 2. Alter the columns to add AUTO_INCREMENT
    await queryInterface.sequelize.query(
      'ALTER TABLE users MODIFY COLUMN userId INT UNSIGNED NOT NULL AUTO_INCREMENT;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE farms MODIFY COLUMN farmId INT UNSIGNED NOT NULL AUTO_INCREMENT;'
    );

    // 3. Re-add the foreign key constraints
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

    // 4. Alter other primary key columns
    await queryInterface.sequelize.query(
      'ALTER TABLE bloodlines MODIFY COLUMN bloodlineId INT UNSIGNED NOT NULL AUTO_INCREMENT;'
    );
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
    await queryInterface.sequelize.query(
      'ALTER TABLE chickens MODIFY COLUMN chickenId INT UNSIGNED NOT NULL AUTO_INCREMENT;'
    );
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
    async function dropConstraintIfExists(table, constraint) {
      const [results] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = '${table}' AND CONSTRAINT_NAME = '${constraint}' LIMIT 1`
      );
      if (results.length > 0) {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${table} DROP FOREIGN KEY ${constraint};`
        );
      }
    }

    await dropConstraintIfExists('chickens', 'chickens_motherId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_fatherId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_bloodlineId_foreign_idx');
    await dropConstraintIfExists('chickens', 'chickens_farmId_foreign_idx');
    await dropConstraintIfExists('farms', 'farms_ibfk_1');
    await dropConstraintIfExists('bloodlines', 'bloodlines_ibfk_1');

    await queryInterface.sequelize.query(
      'ALTER TABLE users MODIFY COLUMN userId INT UNSIGNED NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE farms MODIFY COLUMN farmId INT UNSIGNED NOT NULL;'
    );

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
    await queryInterface.sequelize.query(
      'ALTER TABLE bloodlines MODIFY COLUMN bloodlineId INT UNSIGNED NOT NULL;'
    );
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
    await queryInterface.sequelize.query(
      'ALTER TABLE chickens MODIFY COLUMN chickenId INT UNSIGNED NOT NULL;'
    );
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
  }
}; 