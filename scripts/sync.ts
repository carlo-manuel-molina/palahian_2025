// scripts/sync.ts
import { sequelize, User, Chicken } from '../models';

(async () => {
  await sequelize.sync({ alter: true }); // or { force: true } for dev only
  console.log('Database synced!');
})();