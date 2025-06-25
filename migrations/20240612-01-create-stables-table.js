module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stables', {
      stableId: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'userId' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      owner: { type: Sequelize.STRING, allowNull: false },
      region: { type: Sequelize.STRING, allowNull: false },
      province: { type: Sequelize.STRING, allowNull: false },
      city: { type: Sequelize.STRING, allowNull: false },
      barangay: { type: Sequelize.STRING, allowNull: false },
      street: { type: Sequelize.STRING, allowNull: false },
      mapPin: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      bannerUrl: { type: Sequelize.STRING, allowNull: true },
      avatarUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('stables');
  },
}; 