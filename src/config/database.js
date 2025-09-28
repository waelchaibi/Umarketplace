import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'unique_marketplace',
  NODE_ENV = 'development'
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: NODE_ENV !== 'production' ? false : false,
  define: {
    underscored: false,
    freezeTableName: false,
    timestamps: true
  },
  dialectOptions: {
    // MySQL 5.7 compatibility
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
