// scripts/sync.ts
import { sequelize } from '../lib/sequelize';
import { User } from '../models/User';
import { Chicken } from '../models/Chicken';

(async () => {
  await sequelize.sync({ alter: true }); // or { force: true } for dev only
  console.log('Database synced!');
})();