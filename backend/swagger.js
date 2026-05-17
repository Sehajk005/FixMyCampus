const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fix My Campus API',
      version: '1.0.0',
      description: 'API documentation for Fix My Campus backend',
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:5000', description: 'Local server' },
    ],
  },
  // scan these files for JSDoc comments (adjust as needed)
  apis: ['./routes/*.js', './graphql/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = function mountSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
};
