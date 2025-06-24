// lib/sequelize.ts
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'palahian',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
  }
);