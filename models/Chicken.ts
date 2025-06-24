// models/Chicken.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../lib/sequelize';
import { User } from './User';
import { Farm } from './Farm';
import { Bloodline } from './Bloodline';

export interface ChickenAttributes {
  chickenId?: number;
  breederId: number;
  farmId?: number;
  bloodlineId?: number;
  status?: string;
  fatherId?: number | null;
  motherId?: number | null;
  name?: string;
  sire?: string;
  dam?: string;
  legbandNo?: string;
  wingbandNo?: string;
  bloodline?: string;
  pictures?: string[];
  description?: string;
  fightRecord?: string;
  fightVideos?: string[];
  forSale?: boolean;
  price?: number;
  gender: 'rooster' | 'hen';
  hatchDate?: Date;
  breederType?: 'breeder' | 'fighter';
  isBreeder?: boolean;
}

export class Chicken extends Model<ChickenAttributes, Optional<ChickenAttributes, 'chickenId'>> {}

Chicken.init(
  {
    chickenId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    breederId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    farmId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    bloodlineId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'alive' },
    fatherId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    motherId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    sire: { type: DataTypes.STRING, allowNull: true },
    dam: { type: DataTypes.STRING, allowNull: true },
    legbandNo: { type: DataTypes.STRING, allowNull: true },
    wingbandNo: { type: DataTypes.STRING, allowNull: true },
    bloodline: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Unknown' },
    pictures: { type: DataTypes.JSON, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    fightRecord: { type: DataTypes.STRING, allowNull: true },
    fightVideos: { type: DataTypes.JSON, allowNull: true },
    forSale: { type: DataTypes.BOOLEAN, defaultValue: false },
    price: { type: DataTypes.FLOAT, allowNull: true },
    gender: { type: DataTypes.ENUM('rooster', 'hen'), allowNull: false },
    hatchDate: { type: DataTypes.DATE, allowNull: true },
    breederType: { type: DataTypes.ENUM('breeder', 'fighter'), allowNull: true },
    isBreeder: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'chicken' }
);