require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const { sequelize } = require('./config/database');
const { startWorker } = require('./worker');
const { setupGraphQL } = require('./graphql');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

async function start() {
  try {
    await setupGraphQL(app);
    app.finalize(); // Register 404 & error handlers AFTER GraphQL middleware
    await sequelize.authenticate();
    console.log('✅  Database connection established.');

    server.listen(PORT, () => {
      console.log(`🚀  Fix My Campus API running on port ${PORT}`);
      console.log(`📡  Socket.io ready`);
      startWorker();
    });
  } catch (err) {
    console.error('❌  Unable to start server:', err);
    process.exit(1);
  }
}

start();
