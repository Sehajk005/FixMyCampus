const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function setupGraphQL(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use('/graphql', expressMiddleware(server));
  console.log('🔮  GraphQL Server ready at /graphql');
}

module.exports = { setupGraphQL };
