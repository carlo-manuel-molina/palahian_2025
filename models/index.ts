import { sequelize } from '../lib/sequelize';
import { User } from './User';
import { Farm } from './Farm';
import { Bloodline } from './Bloodline';
import { Chicken } from './Chicken';

// Re-export types
export type { UserAttributes } from './User';

// Associations
User.hasOne(Farm, { foreignKey: 'userId' });
Farm.belongsTo(User, { foreignKey: 'userId' });

Farm.hasMany(Bloodline, { foreignKey: 'farmId' });
Bloodline.belongsTo(Farm, { foreignKey: 'farmId' });

User.hasMany(Chicken, { foreignKey: 'breederId' });
Chicken.belongsTo(User, { foreignKey: 'breederId' });

Farm.hasMany(Chicken, { foreignKey: 'farmId' });
Chicken.belongsTo(Farm, { foreignKey: 'farmId' });

// Fix naming collision for bloodline association
Bloodline.hasMany(Chicken, { foreignKey: 'bloodlineId', as: 'chickens' });
Chicken.belongsTo(Bloodline, { foreignKey: 'bloodlineId', as: 'bloodlineRef' });

Chicken.belongsTo(Chicken, { as: 'father', foreignKey: 'fatherId' });
Chicken.belongsTo(Chicken, { as: 'mother', foreignKey: 'motherId' });
Chicken.hasMany(Chicken, { as: 'childrenAsFather', foreignKey: 'fatherId' });
Chicken.hasMany(Chicken, { as: 'childrenAsMother', foreignKey: 'motherId' });

export { sequelize, User, Farm, Bloodline, Chicken }; 