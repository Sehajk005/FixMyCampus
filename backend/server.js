require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅  Database connection established.');

    server.listen(PORT, () => {
      console.log(`🚀  Fix My Campus API running on port ${PORT}`);
      console.log(`📡  Socket.io ready`);
    });
  } catch (err) {
    console.error('❌  Unable to start server:', err);
    process.exit(1);
  }
}

start();
