require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'pms_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'pms_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    seederStorage: 'sequelize',
    logQueryParameters: true,
    logging: (msg) => console.log(`[DB] ${msg}`),
  },
  test: {
    username: process.env.DB_USERNAME || 'pms_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'pms_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    seederStorage: 'sequelize',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    seederStorage: 'sequelize',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // You might need to set this to true in a production environment with a valid SSL certificate
      },
    },
  },
};
