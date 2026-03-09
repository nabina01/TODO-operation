import { Sequelize, DataTypes } from 'sequelize';
import TodoModel from './todo';

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

interface DB {
  [key: string]: any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  Todo: ReturnType<typeof TodoModel>;
}

const db: DB = {} as DB;

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Initialize models
db.Todo = TodoModel(sequelize);

// Run associations if any
Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
