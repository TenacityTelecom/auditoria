import { Sequelize } from 'sequelize';
import path from 'path';

const env = process.env.NODE_ENV || 'geral';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(path.join(__dirname, '../../config/config.json'))[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: config.logging ?? false,
  timezone: config.timezone,
});

export default sequelize;
