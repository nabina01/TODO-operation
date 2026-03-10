require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'todo_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql'
  },
  docker: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'todo_db',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  }
};
