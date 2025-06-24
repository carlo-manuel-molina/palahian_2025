import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../lib/sequelize';

export interface BloodlineAttributes {
  bloodlineId?: number;
  farmId: number;
  name: string;
  origin?: string;
  modelImagesMale?: string[];
  modelImagesFemale?: string[];
  yearAcquired?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Bloodline extends Model<BloodlineAttributes, Optional<BloodlineAttributes, 'bloodlineId'>> {}

Bloodline.init(
  {
    bloodlineId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    farmId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    origin: { type: DataTypes.STRING, allowNull: true },
    modelImagesMale: { type: DataTypes.JSON, allowNull: true },
    modelImagesFemale: { type: DataTypes.JSON, allowNull: true },
    yearAcquired: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, modelName: 'bloodline' }
); 