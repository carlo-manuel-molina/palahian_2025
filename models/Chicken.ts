// models/Chicken.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/sequelize';
import { User } from './User';

export class Chicken extends Model {
  public id!: number;
  public breederId!: number;
  public legbandNo!: string;
  public wingbandNo!: string;
  public bloodline!: string;
  public bloodlineComposition!: string;
  public pictures!: string[];
  public description!: string;
  public fightRecord!: string;
  public fightVideos!: string[];
  public forSale!: boolean;
  public price?: number;
}

Chicken.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    breederId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    legbandNo: { type: DataTypes.STRING, allowNull: false },
    wingbandNo: { type: DataTypes.STRING, allowNull: false },
    bloodline: { type: DataTypes.STRING, allowNull: false },
    bloodlineComposition: { type: DataTypes.STRING, allowNull: false },
    pictures: { type: DataTypes.JSON, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    fightRecord: { type: DataTypes.STRING, allowNull: true },
    fightVideos: { type: DataTypes.JSON, allowNull: true },
    forSale: { type: DataTypes.BOOLEAN, defaultValue: false },
    price: { type: DataTypes.FLOAT, allowNull: true },
  },
  { sequelize, modelName: 'chicken' }
);

// Associations
User.hasMany(Chicken, { foreignKey: 'breederId' });
Chicken.belongsTo(User, { foreignKey: 'breederId' });