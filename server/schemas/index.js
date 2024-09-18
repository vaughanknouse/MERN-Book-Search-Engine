// Import all schema files
const resolvers = require('./resolvers'); // Import resolvers
const typeDefs = require('./typeDefs'); // Import typeDefs

// Export the typeDefs and resolvers for use in the Apollo Server setup
module.exports = {
  resolvers,
  typeDefs,
};
