const express = require('express');
const { ApolloServer } = require('@apollo/server'); // Import Apollo Server for GraphQL API
const { expressMiddleware } = require('@apollo/server/express4'); // Apollo's middleware for Express integration
const path = require('path');
const { authMiddleware } = require('./utils/auth'); // Authentication middleware for JWT token validation

const { typeDefs, resolvers } = require('./schemas'); // Import typeDefs and resolvers for GraphQL schema
const db = require('./config/connection'); // Import the database connection

const PORT = process.env.PORT || 3001;
const app = express();
// Create the executable GraphQL schema using typeDefs and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start(); // Start the Apollo Server

  // Middleware to parse incoming URL-encoded and JSON data
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Apply Apollo middleware to the '/graphql' route with the authMiddleware for authentication
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist'))); // Serve the static files from the React app in production mode (client/dist)

    // For all other routes, serve the React app (client/dist/index.html)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Start the Express server after the database connection is established and the Apollo server is started
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`); // Log that the API server is running
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`); // Log the GraphQL endpoint
    });
  });
};

// Call the async function to start the server
startApolloServer();
