// models/User.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize';

interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'breeder' | 'fighter' | 'seller' | 'shipper' | 'buyer';
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'breeder' | 'fighter' | 'seller' | 'shipper' | 'buyer';
  public isEmailVerified!: boolean;
  public emailVerificationToken!: string | null;
  public emailVerificationExpires!: Date | null;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('breeder', 'fighter', 'seller', 'shipper', 'buyer'), allowNull: false },
    isEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
    emailVerificationExpires: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'user' }
);