const { GraphQLError } = require('graphql'); // Import GraphQLError for custom error handling in GraphQL
const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretssshhhhhhh';
const expiration = '2h';

module.exports = {
  // Custom AuthenticationError to be used in resolvers or middleware
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED', // GraphQL error code for unauthenticated requests
    },
  }),
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If token is in the "Bearer <token>" format, extract just the token part
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If no token is provided, return the request object as is (without user attached)
    if (!token) {
      return req;
    }

    try {
      // Verify the token and extract the user data (payload)
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; // Attach user data to the request object
    } catch {
      console.log('Invalid token'); // Log invalid token attempts
    }

    // Return the request object (whether user data is attached or not) to the resolvers
    return req;
  },

  // Function to sign a new token for users (used for authentication purposes)
  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id }; // User data that will be included in the token
    // Sign the token with the user data, secret, and expiration time
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
