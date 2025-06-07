// models/User.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'breeder' | 'fighter' | 'seller' | 'shipper' | 'buyer';
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('breeder', 'fighter', 'seller', 'shipper', 'buyer'), allowNull: false },
  },
  { sequelize, modelName: 'user' }
);