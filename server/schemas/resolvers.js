const { User } = require('../models'); // Import Mongoose models
const { signToken, AuthenticationError } = require('../utils/auth'); // Import signToken and AuthenticationError from the auth.js file in the utils folder

const resolvers = {
  Query: {
    // Resolver for the `me` query to get the logged-in user
    me: async (parent, args, context) => {
      if (context.user) {
        // Fetch the user from the database and populate the savedBooks field
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw AuthenticationError; // If there is no user in the context, throw an AuthenticationError
    },
  },

  Mutation: {
    // Resolver for the `login` mutation
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email }); // Find a user by the email address provided

      if (!user) {
        throw AuthenticationError; // If the user is not found, throw an AuthenticationError
      }

      const correctPw = await user.isCorrectPassword(password); // Check if the provided password is correct

      if (!correctPw) {
        throw AuthenticationError; // If the password is incorrect, throw an AuthenticationError
      }

      const token = signToken(user); // Sign a token for the user using the signToken function

      return { token, user }; // Return the token and user object
    },

    // Resolver for the `addUser` mutation
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password }); // Create a new user with the provided username, email, and password
      const token = signToken(user); // Sign a token for the user using the signToken function
      return { token, user }; // Return the token and user object
    },

    // Resolver for the `saveBook` mutation
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        // Add the new book to the user's savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id }, // Find the user by ID
          { $addToSet: { savedBooks: input } }, // Use $addToSet to avoid duplicates in the savedBooks array
          { new: true, runValidators: true } // Return the updated user and run validators to ensure the input data is valid
        ).populate('savedBooks'); // Populate the savedBooks field in the user object

        return updatedUser; // Return the updated user object
      }
      throw AuthenticationError; // If there is no user in the context, throw an AuthenticationError
    },

    // Resolver for the `removeBook` mutation
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // Remove the book from the user's savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id }, // Find the user by ID
          { $pull: { savedBooks: { bookId } } }, // Use $pull to remove the book with the specified bookId
          { new: true } // Return the updated user
        ).populate('savedBooks'); // Populate the savedBooks field in the user object
        return updatedUser; // Return the updated user object
      }
      throw AuthenticationError; // If there is no user in the context, throw an AuthenticationError
    },
  },
};

module.exports = resolvers;
