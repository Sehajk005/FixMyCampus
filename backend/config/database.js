const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test' || process.env.DB_DIALECT === 'sqlite') {
  // Use in-memory SQLite for tests to avoid requiring a MySQL server
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'fixmycampus_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = { sequelize };
