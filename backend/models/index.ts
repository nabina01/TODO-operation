import { Sequelize, DataTypes } from 'sequelize';
import TodoModel from './todo';

interface DB {
  [key: string]: any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  Todo: ReturnType<typeof TodoModel>;
}

const db: DB = {} as DB;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'todo_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3307,
    dialect: 'mysql'
  }
);

db.Todo = TodoModel(sequelize);

Object.values(db).forEach((model: any) => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
